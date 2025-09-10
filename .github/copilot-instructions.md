# ioBroker.repetier-server

ioBroker adapter for Repetier Server - Connect and monitor your 3D printers through ioBroker home automation system. This adapter communicates with Repetier Server via WebSocket connections and provides real-time monitoring of printer status, temperatures, and print jobs.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Install Dependencies
```bash
# Install all dependencies (takes ~105 seconds)
npm install
```
**NEVER CANCEL** - npm install takes approximately 105 seconds (1 minute 45 seconds). Set timeout to 180+ seconds.

### Build Process
```bash
# Clean build of React admin UI (takes ~8 seconds)
npm run build
```
- Builds React admin interface using ESBuild
- Creates optimized bundle in `admin/build/`
- Includes TypeScript type checking
- **NEVER CANCEL** - Build takes 8-10 seconds. Set timeout to 60+ seconds.

### Development Workflow
```bash
# Watch mode for React development (continuous building)
npm run watch:react
```
- Starts ESBuild in watch mode for admin UI
- Includes TypeScript type checking in watch mode
- Automatically rebuilds when source files change
- Press Ctrl+C to stop

### Testing
```bash
# Run all tests (takes <5 seconds)
npm run test

# Run individual test suites
npm run test:js          # Unit tests (takes <1 second)
npm run test:package     # Package validation (takes <1 second) 
```
**NEVER CANCEL** - Tests complete in under 5 seconds. Set timeout to 30+ seconds.

**Known Test Issues:**
- `npm run test:package` has 2 failing tests related to package naming conventions (this is expected)
- `npm run test:integration` fails due to ioBroker controller dependency issues (this is expected)

### Code Quality and Validation
```bash
# Lint JavaScript/React code (takes <5 seconds)
npm run lint

# TypeScript type checking (takes <5 seconds)  
npm run check

# Format code with Prettier
npx prettier --write .
```
**NEVER CANCEL** - All quality checks complete in under 10 seconds. Set timeout to 30+ seconds.

## Validation

### Pre-commit Validation
Always run these commands before committing changes:
```bash
npm run build
npm run lint
npm run check
npm run test:js
```
**COMPLETE WORKFLOW** - All steps complete in under 15 seconds combined.

### Manual Testing Scenarios
Since this is an ioBroker adapter, complete functional testing requires a full ioBroker installation. However, you can validate these scenarios:

**Admin Configuration UI Testing:**
```bash
# Build and verify admin UI compiles successfully
npm run build
# Check that admin/build/index.js is created
ls -la admin/build/
```

**Code Quality Validation:**
```bash
# Verify all linting and type checking passes
npm run lint
npm run check
```

**Unit Test Coverage:**
```bash
# Run unit tests to verify core functionality
npm run test:js
```

**Development Workflow:**
```bash
# Start development watch mode and verify it runs without errors
npm run watch:react
# Make a small change to admin/src/index.tsx and verify auto-rebuild
# Press Ctrl+C to stop
```

### Runtime Testing Notes
- The adapter requires Repetier Server instance (3D printer management software) to connect to
- Cannot test WebSocket functionality without target Repetier Server
- Main adapter logic in `main.js` handles WebSocket connections and state management
- Admin UI configuration allows setting IP address, port, API token, and custom G-code commands
- Full integration testing requires ioBroker controller environment

## Common Tasks

### Project Structure
```
/home/runner/work/ioBroker.repetier-server/ioBroker.repetier-server/
├── main.js                 # Main adapter entry point
├── lib/                    # Helper libraries and state definitions
├── admin/                  # React-based admin configuration UI
│   ├── src/               # React TypeScript source files  
│   └── build/             # Built admin UI (generated)
├── test/                   # Test files and configuration
├── .github/workflows/     # CI/CD pipeline configuration
└── package.json           # Node.js dependencies and scripts
```

### Key Files Reference
- `main.js` - Main adapter code handling WebSocket connections to Repetier Server
- `lib/stateDef.js` - State definitions for ioBroker objects
- `admin/src/index.tsx` - Main React admin component
- `admin/src/SettingPage.tsx` - Configuration settings UI
- `io-package.json` - ioBroker adapter metadata and configuration
- `.github/workflows/test-and-release.yml` - CI/CD pipeline

### Available npm Scripts
```json
{
  "build": "build-adapter react",              # Build React admin UI
  "watch:react": "build-adapter react --watch", # Development mode
  "test": "npm run test:js && npm run test:package", # Run tests
  "test:js": "mocha ...",                      # Unit tests only
  "test:package": "mocha test/package --exit", # Package validation
  "test:integration": "mocha test/integration --exit", # Integration tests (fails)
  "check": "tsc --noEmit -p tsconfig.check.json", # TypeScript check
  "lint": "eslint --ext .js,.jsx .",           # ESLint
  "release": "release-script"                  # Release management
}
```

### Dependencies and Requirements
- **Node.js**: >= 14 (tested with Node.js 20.19.5)
- **Main dependencies**: @iobroker/adapter-core, ws (WebSocket)
- **Dev dependencies**: ESLint, TypeScript, React, Material-UI, Mocha testing
- **ioBroker**: Requires js-controller >= 3.3.22, admin >= 5.0.0

### Expected Build Times and Timeouts
- `npm install`: 105 seconds (timeout: 180+ seconds)
- `npm run build`: 8 seconds (timeout: 60+ seconds)  
- `npm run test:js`: <1 second (timeout: 30+ seconds)
- `npm run test:package`: <1 second (timeout: 30+ seconds)
- `npm run lint`: <2 seconds (timeout: 30+ seconds)
- `npm run check`: <2 seconds (timeout: 30+ seconds)
- `npm run watch:react`: Continuous (runs until stopped)

### Known Issues and Workarounds

**Package Naming Issues:**
- Package validation tests fail due to scoped package name format
- This is expected and does not affect functionality
- CI pipeline accounts for these test failures

**Integration Test Failures:**
- Integration tests require full ioBroker controller installation
- Tests fail in isolated environments (this is expected)
- Focus on unit tests and build validation instead

**WebSocket Connectivity:**
- Main adapter requires Repetier Server instance to connect to
- Cannot test WebSocket functionality without target server
- Configuration testing can be done through admin UI build

### Troubleshooting

**Build Failures:**
```bash
# Clean build artifacts and rebuild
rm -rf admin/build/
npm run build
```

**Dependency Issues:**
```bash
# Clean install dependencies
rm -rf node_modules/ package-lock.json
npm install
```

**TypeScript Errors:**
```bash
# Check TypeScript configuration
npm run check
# Fix any type issues in source files
```

**Lint Errors:**
```bash
# Auto-fix lint issues
npm run lint -- --fix
# Format code with Prettier
npx prettier --write .
```

## Development Notes

### Code Style
- Uses tabs for indentation (configured in .eslintrc.json)
- Single quotes for strings
- Semicolons required
- Prettier formatting applied

### React Admin UI
- Built with React 17 + TypeScript
- Material-UI components for styling
- Internationalization support (i18n)
- Configuration forms for adapter settings

### ioBroker Integration
- Extends @iobroker/adapter-core
- WebSocket communication with Repetier Server
- State management for device data
- Admin UI integration with ioBroker configuration system

### CI/CD Pipeline
- Tests on Node.js 14.x, 16.x, 18.x
- Multi-platform testing (Ubuntu, Windows, macOS)
- Automatic deployment to npm on version tags
- Dependabot automated dependency updates