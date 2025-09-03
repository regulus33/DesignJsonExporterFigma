// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.

interface ComponentData {
    [componentName: string]: {
        image: string;
        description: string;
    }
}

interface ExportMessage {
    type: 'export' | 'test';
    depth?: number;
    data?: string;
}

interface ProgressMessage {
    type: 'progress';
    current: number;
    total: number;
    componentName: string;
}

interface CompleteMessage {
    type: 'complete';
    data: ComponentData[];
    imageFiles: { name: string; data: Uint8Array }[];
    jsonData: string;
}

interface ErrorMessage {
    type: 'error';
    message: string;
}

// Show the UI
figma.showUI(__html__, { width: 400, height: 500 });

console.log('Plugin loaded successfully');

// Handle messages from the UI
figma.ui.onmessage = async (msg: ExportMessage) => {
    console.log('Received message from UI:', msg);

    if (msg.type === 'test') {
        console.log('🧪 Test message received:', msg);
        figma.ui.postMessage({
            type: 'error',
            message: 'Test successful! Communication is working.'
        } as ErrorMessage);
        return;
    }

    if (msg.type === 'export') {
        try {
            console.log(`Starting export with depth: ${msg.depth}`);
            await exportComponentsAtDepth(msg.depth || 0);
        } catch (error) {
            console.error('Export error:', error);
            figma.ui.postMessage({
                type: 'error',
                message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            } as ErrorMessage);
        }
    }
};

async function exportComponentsAtDepth(maxDepth: number): Promise<void> {
    console.log(`exportComponentsAtDepth called with depth: ${maxDepth}`);

    const selection = figma.currentPage.selection;
    console.log(`Current selection count: ${selection.length}`);

    if (selection.length === 0) {
        console.log('No selection found');
        figma.ui.postMessage({
            type: 'error',
            message: 'Please select at least one component, frame, or group to export.'
        } as ErrorMessage);
        return;
    }

    const componentsToExport: SceneNode[] = [];

    // Traverse each selected node to find components at the specified depth
    for (const node of selection) {
        console.log(`Processing selected node: ${node.name} (type: ${node.type})`);
        const components = findComponentsAtDepth(node, maxDepth, 0);
        console.log(`Found ${components.length} components at depth ${maxDepth} from ${node.name}`);
        componentsToExport.push(...components);
    }

    console.log(`Total components to export: ${componentsToExport.length}`);

    if (componentsToExport.length === 0) {
        figma.ui.postMessage({
            type: 'error',
            message: `No components found at depth ${maxDepth}. Try adjusting the depth setting.`
        } as ErrorMessage);
        return;
    }

    // Export each component
    const exportData: ComponentData[] = [];
    const imageFiles: { name: string; data: Uint8Array }[] = [];

    for (let i = 0; i < componentsToExport.length; i++) {
        const component = componentsToExport[i];
        console.log(`Exporting component ${i + 1}/${componentsToExport.length}: ${component.name}`);

        // Send progress update
        figma.ui.postMessage({
            type: 'progress',
            current: i + 1,
            total: componentsToExport.length,
            componentName: component.name
        } as ProgressMessage);

        try {
            // Export the component as PNG
            console.log(`Starting PNG export for: ${component.name}`);
            const imageBytes = await component.exportAsync({
                format: 'PNG',
                constraint: { type: 'SCALE', value: 2 } // 2x resolution for better quality
            });
            console.log(`PNG export completed for: ${component.name}, size: ${imageBytes.length} bytes`);

            // Create filename (sanitize for file system)
            const sanitizedName = sanitizeFileName(component.name);
            const fileName = `${sanitizedName}.png`;

            // Store image data
            imageFiles.push({
                name: fileName,
                data: imageBytes
            });

            // Create component entry
            const componentEntry: ComponentData = {
                [component.name]: {
                    image: fileName, // Path/filename of the exported image
                    description: "" // Empty for user to fill in
                }
            };

            exportData.push(componentEntry);

        } catch (error) {
            console.error(`Failed to export ${component.name}:`, error);
            figma.ui.postMessage({
                type: 'error',
                message: `Failed to export component: ${component.name}`
            } as ErrorMessage);
        }
    }

    console.log('Export complete, sending data to UI');

    // Create JSON file
    const jsonData = JSON.stringify(exportData, null, 2);

    // Send data to UI for download handling
    figma.ui.postMessage({
        type: 'complete',
        data: exportData,
        imageFiles: imageFiles,
        jsonData: jsonData
    } as CompleteMessage);
}

function findComponentsAtDepth(node: SceneNode, maxDepth: number, currentDepth: number): SceneNode[] {
    const components: SceneNode[] = [];

    // If we're at the target depth, include this node
    if (currentDepth === maxDepth) {
        components.push(node);
        return components;
    }

    // If we haven't reached the target depth, continue traversing
    if (currentDepth < maxDepth && 'children' in node) {
        for (const child of node.children) {
            const childComponents = findComponentsAtDepth(child, maxDepth, currentDepth + 1);
            components.push(...childComponents);
        }
    }

    return components;
}

function sanitizeFileName(name: string): string {
    // Remove or replace characters that aren't file-system safe
    return name
        .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid chars with underscore
        .replace(/\s+/g, '_') // Replace spaces with underscore
        .substring(0, 100); // Limit length
}

// Utility function to get the full path of a node in the layer hierarchy
function getNodePath(node: SceneNode): string {
    const path: string[] = [];
    let currentNode: BaseNode | null = node;

    while (currentNode && currentNode.type !== 'DOCUMENT') {
        if (currentNode.type !== 'PAGE') {
            path.unshift(currentNode.name);
        }
        currentNode = currentNode.parent;
    }

    return path.join(' > ');
}