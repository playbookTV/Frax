# Fractal Glass - Figma Plugin

Apply sophisticated prismatic glass overlay effects to any layer in Figma.

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Testing

```bash
npm test
```

## Project Structure

```
fractal-glass/
├── manifest.json          # Plugin manifest
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── src/
│   ├── plugin/           # Plugin code (runs in Figma)
│   │   ├── code.ts      # Main entry point
│   │   ├── modules/      # Core modules
│   │   ├── algorithms/   # Effect algorithms
│   │   └── utils/        # Utilities
│   ├── ui/               # UI code (runs in iframe)
│   │   ├── index.html
│   │   └── ui.ts
│   └── types/           # TypeScript types
└── dist/                # Build output
```

## Features

- **Quick Apply Mode**: One-click preset application
- **Advanced Customization**: Full parameter control
- **Performance Optimized**: Quality modes for different use cases
- **Non-destructive**: Maintains editable layer structure

## License

MIT
