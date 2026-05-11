# Contributing to vscode-agent-ui

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/vscode-agent-ui.git
cd vscode-agent-ui

# Install dependencies
npm install

# Build the library
npm run build

# Watch for changes during development
npm run watch
```

## Project Structure

```
src/
├── components/     # Core UI components
├── chat/          # Chat-specific components
├── layout/        # Layout and panel utilities
└── index.ts       # Main export file
```

## Adding a New Component

1. Create a new file in the appropriate directory (e.g., `src/components/MyComponent.ts`)
2. Follow the existing component structure:
   - Export an interface for props
   - Create a class with static `render()` and `getStyles()` methods
   - Include JSDoc documentation
3. Export the component from `src/index.ts`
4. Build and test

## Code Style

- Use TypeScript with strict type checking
- Follow existing code formatting patterns
- Add JSDoc comments for all public APIs
- Keep components framework-agnostic (pure functions)
- Use VS Code theme variables for styling

## Testing

Before submitting a pull request:

1. Build the library: `npm run build`
2. Verify TypeScript compilation succeeds
3. Test the component in a real VS Code extension

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with clear commit messages
4. Update documentation if needed
5. Submit a pull request with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
