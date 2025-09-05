
<img src="splash.png" alt="drawing" width="100%"/>

# Design JSON Exporter
A Figma plugin that exports UI components as structured JSON with component images, designed to help AI agents better understand and implement your designs.

## Overview

Design JSON Exporter creates structured exports from Figma designs that can be fed to AI agents for code generation. By providing both visual references and organized metadata, it helps bridge the gap between design and development.

### What It Does
- Exports components at specified layer tree depths
- Generates high-quality PNG images for each component
- Creates structured JSON metadata with component names and image references
- Provides a clean interface for bulk component processing
- Maintains design hierarchy information for better code organization

### Intended Use Case
This plugin was built to help developers use AI agents more effectively when converting designs to code. Instead of describing designs or taking screenshots, you can provide structured data that includes component organization, naming, and visual references.

## How It Works

### Basic Process
```
Figma Design → Select Components → Export JSON + Images → Use with AI Agent
```

1. **Organize your designs** in Figma with clear component hierarchy
2. **Select the components** you want to export
3. **Choose the appropriate depth** to get the right level of components
4. **Export** to receive JSON metadata and component images
5. **Provide to AI agents** along with your code requirements

### Layer Tree System
The plugin traverses your layer hierarchy based on depth settings:

```
Selected Frame
├── Navigation (Depth 1)
│   ├── NavButton (Depth 2)
│   └── NavLogo (Depth 2)
└── Content (Depth 1)
    ├── Card (Depth 2)
    └── Button (Depth 2)
```

- **Depth 0**: Exports the selected items themselves
- **Depth 1**: Exports the direct children of selected items
- **Depth 2+**: Exports components at deeper nesting levels

## Setup

### Prerequisites
- Figma Desktop App
- Node.js and npm (for development)

### Installation

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Build if needed: `npm run build`
4. Import into Figma:
    - Open Figma Desktop App
    - Go to `Plugins > Development > Import new plugin from manifest...`
    - Select `manifest.json` from this project

## Usage

### Basic Steps
1. **Select components** in your Figma file (frames, components, or groups)
2. **Set the export depth** (typically 0-2 for most use cases)
3. **Click "Export Components"**
4. **Download** the JSON file and component images
5. **Use with your preferred AI agent** for code generation

### JSON Output Format
```json
[
  {
    "ComponentName": {
      "image": "ComponentName.png",
      "description": ""
    }
  }
]
```

The `description` field is empty by default - you can add context about component behavior or requirements.

### Using with AI Agents

You can provide the exported files to AI agents like Claude, ChatGPT, or others with prompts such as:

```
I have exported components from Figma as JSON + images. Please help me create [React/Vue/Flutter/etc.] components based on these designs. Here are my requirements:
- [Your specific framework preferences]
- [Styling approach you want to use]
- [Any specific patterns or conventions]

[Attach the JSON file and component images]
```

## Features

### Export Options
- **Configurable depth**: Choose which level of components to export
- **High-resolution images**: 2x scale for better quality
- **Batch processing**: Handle multiple components at once
- **Progress tracking**: See export status in real-time

### File Management
- **Sanitized filenames**: Removes problematic characters for file systems
- **Organized output**: JSON metadata with clear image references
- **Error handling**: Continues processing if individual components fail

## Best Practices

### Design Organization
- Use clear, descriptive names for your Figma layers
- Group related components logically
- Maintain consistent hierarchy across your designs
- Test with small selections first to understand the depth system
![Gemini_Generated_Image_286rp6286rp6286r.png](../../Downloads/Gemini_Generated_Image_286rp6286rp6286r.png)
### AI Integration
- Be specific about your framework and requirements when prompting AI agents
- Include context in the JSON descriptions for complex components
- Start with simpler components before tackling complex layouts
- Iterate on your prompts based on the code quality you receive

## Troubleshooting

### Common Issues
- **Nothing exports**: Make sure you have components selected in Figma (blue outlines should be visible)
- **Wrong components exported**: Try adjusting the depth setting
- **Plugin doesn't load**: Ensure you're using Figma Desktop App and the `code.js` file exists

### Debug Information
Open Figma's Developer Tools (`Help > Toggle Developer Tools`) to see detailed logs of the export process.

## Contributing

Contributions are welcome for:
- Additional export formats
- Enhanced metadata extraction
- UI improvements
- Bug fixes and optimizations

## License

MIT License

---

A tool to help bridge the gap between design and development through structured exports.