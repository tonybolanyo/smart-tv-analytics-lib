# Local Development Guide

This guide provides detailed instructions for building the library and running the sample application locally without publishing to any registry.

## Prerequisites

### Node.js Version

- **Recommended**: Node.js 14.x or 16.x
- **Supported with no workarounds**: Node.js 14.x - 16.x
- **Supported with workarounds**: Node.js 17+ (requires `NODE_OPTIONS="--openssl-legacy-provider"` due to OpenSSL 3.0 changes)

You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
# Install Node.js 14
nvm install 14
nvm use 14

# Or install Node.js 16
nvm install 16
nvm use 16
```

### Other Requirements

- npm 6+ or 7+
- Angular CLI 12+

## Step 1: Clone the Repository

```bash
git clone https://github.com/tonybolanyo/smart-tv-analytics-lib.git
cd smart-tv-analytics-lib
```

## Step 2: Build the Library

### Install Dependencies

```bash
npm install
```

### Build the Library

```bash
npm run build
```

This command does two things:
1. Compiles the Angular library using `ng-packagr`
2. Transpiles the output to ES5 for Smart TV compatibility

The built library will be in the `dist/` folder.

### Verify the Build

Check that the dist folder contains the compiled library:

```bash
ls -la dist/
```

You should see folders and files like:
- `bundles/` - UMD bundles (`.umd.js` and `.umd.es5.js`)
- `esm2015/` - Individual ES modules (intermediate output)
- `fesm2015/` - Flat ESM bundles (`.js` and `.es5.js`) 
- `lib/` - Compiled library files
- Various `.d.ts` type definition files
- `package.json` - Package metadata
- `README.md` and `CHANGELOG.md` - Documentation

**Note**: The `esm2015` folder contains intermediate compilation output (non-flat individual modules) that lacks Angular Ivy metadata. The library uses `fesm2015` (flat ES modules) for module resolution, which are properly compiled and include the necessary Angular metadata (ɵmod, ɵfac, etc.) for ngcc to process correctly.

## Step 3: Run the Sample Application

### Navigate to the Sample App

```bash
cd examples/sample-app
```

### Install Sample App Dependencies

```bash
npm install
```

This will automatically link to the built library in `../../dist`.

**Note**: The library uses a local file reference (`file:../../dist`) which creates a symlink. If you encounter module resolution issues during development, try clearing the Angular build cache:

```bash
rm -rf .angular node_modules/.cache
```

### Start the Development Server

#### For Node.js 14-16:

```bash
npm start
```

#### For Node.js 17+ (requires workaround):

Due to OpenSSL 3.0 changes in Node.js 17+, you need to use the legacy OpenSSL provider:

```bash
NODE_OPTIONS="--openssl-legacy-provider" npm start
```

Or on Windows PowerShell:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start
```

Or on Windows CMD:

```cmd
set NODE_OPTIONS=--openssl-legacy-provider && npm start
```

### Access the Application

Open your browser and navigate to:

```
http://localhost:4200
```

You should see the Smart TV Analytics sample application running.

## Step 4: Build the Sample App for Production

### Standard Build

```bash
npm run build:prod
```

### With Node.js 17+

```bash
NODE_OPTIONS="--openssl-legacy-provider" npm run build:prod
```

The production build will be in `dist/sample-app/`.

## Troubleshooting

### Error: Cannot find type definition file for 'minimatch'

This error has been fixed in the latest version. If you still encounter it:

1. Ensure you have the latest code:
   ```bash
   git pull origin main
   ```

2. Clean and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Error: digital envelope routines::unsupported

This error occurs with Node.js 17+ due to OpenSSL 3.0 changes.

**Solution**: Use the `NODE_OPTIONS="--openssl-legacy-provider"` workaround shown above.

**Better Solution**: Use Node.js 14 or 16 with nvm:

```bash
nvm use 14
```

### Sample App Can't Find the Library

If you see `Cannot find module 'smart-tv-analytics'`, the symlink might be broken.

**Solution**:

1. Rebuild the library:
   ```bash
   cd /path/to/smart-tv-analytics-lib
   npm run build
   ```

2. Reinstall sample app dependencies:
   ```bash
   cd examples/sample-app
   rm -rf node_modules/smart-tv-analytics
   npm install
   ```

### Changes to Library Not Reflected in Sample App

After making changes to the library:

1. Rebuild the library:
   ```bash
   cd /path/to/smart-tv-analytics-lib
   npm run build
   ```

2. Clear the sample app caches and restart:
   ```bash
   cd examples/sample-app
   rm -rf .angular node_modules/.cache
   npm start
   ```

If changes still don't appear, reinstall the library link:

```bash
cd examples/sample-app
rm -rf node_modules/smart-tv-analytics
npm install
npm start
```

### Module Resolution Errors

If you see errors like "Type SmartTVAnalyticsModule does not have 'ɵmod' property":

1. Clear all caches:
   ```bash
   cd examples/sample-app
   rm -rf .angular node_modules/.cache node_modules/smart-tv-analytics
   npm install
   ```

2. Verify the library was built correctly:
   ```bash
   ls -la ../../dist/
   # Should show bundles/, esm2015/, fesm2015/, lib/, and package.json
   ```

3. Check that `dist/package.json` has the correct entries (`main`, `module`, `es2015`, `fesm2015`) and does NOT have an `esm2015` entry

### Service Initialization Warnings

If you see warnings like "[SmartTVAnalytics] Service not initialized":

This is expected when using placeholder Firebase credentials in `examples/sample-app/src/environments/environment.ts`. To test with real analytics:

1. Create a Firebase project and get your Measurement ID and API Secret
2. Update `environment.ts` with your real credentials
3. Restart the development server

The service will initialize properly with valid credentials and you'll see analytics events in the Firebase Console.

## Development Workflow

### Making Changes to the Library

1. Edit files in `src/`
2. Build the library: `npm run build`
3. The sample app will automatically reload if the dev server is running

### Testing Your Changes

1. Make changes to library code
2. Rebuild: `npm run build`
3. Test in sample app at `http://localhost:4200`
4. Check browser console for analytics events (with debug mode enabled)

### Using Google Analytics Debug View

1. Configure GA4 credentials in `examples/sample-app/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  analytics: {
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'your-api-secret',
    appName: 'SampleApp',
    appVersion: '1.0.0'
  }
};
```

2. The sample app is configured with `enableDebugMode: true` in development
3. Open [GA4 DebugView](https://analytics.google.com/analytics/web/#/debugview) to see events in real-time

## Package.json Configuration

The sample app's `package.json` uses a local file reference:

```json
{
  "dependencies": {
    "smart-tv-analytics": "file:../../dist"
  }
}
```

This tells npm to link directly to the built library in the `dist` folder, allowing you to test changes without publishing to npm.

## Building for Smart TV Platforms

### ES5 Compatibility

The library build process creates ES5-compatible versions of the bundles for maximum Smart TV compatibility:

- `fesm2015/smart-tv-analytics.js` - Modern ES2015 bundle (used by default)
- `fesm2015/smart-tv-analytics.es5.js` - ES5-transpiled bundle for older browsers
- `bundles/smart-tv-analytics.umd.js` - UMD bundle (ES2015)
- `bundles/smart-tv-analytics.umd.es5.js` - UMD bundle (ES5)

When developing and testing locally, the ES2015 versions are used automatically. The ES5 versions are available for deployment to older Smart TV browsers that don't support ES6+ features.

### Build for Tizen (Samsung)

```bash
cd examples/sample-app
npm run build:tizen
```

This builds the app and copies it to the `tizen/` folder ready for packaging.

### Build for webOS (LG)

```bash
npm run build:webos
```

This builds the app and copies it to the `webos/` folder ready for packaging.

### Package for Deployment

See the [Empaquetado Guide](./draft-docs/EMPAQUETADO.md) for detailed instructions on creating `.wgt` (Tizen) and `.ipk` (webOS) packages.

## Additional Resources

- [Sample App Documentation](./docs/SAMPLE-APP.md)
- [Library API Documentation](./docs/README.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- [Examples](./docs/EXAMPLES.md)

## Getting Help

If you encounter issues not covered here:

1. Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
2. Review [Sample App README](./examples/sample-app/README.md)
3. Open an issue on GitHub with details about your environment and the error

## Summary of Commands

| Task | Command |
|------|---------|
| Install library dependencies | `npm install` |
| Build the library | `npm run build` |
| Install sample app dependencies | `cd examples/sample-app && npm install` |
| Start dev server (Node 14-16) | `npm start` |
| Start dev server (Node 17-20) | `NODE_OPTIONS="--openssl-legacy-provider" npm start` |
| Build for production | `npm run build:prod` |
| Build for Tizen | `npm run build:tizen` |
| Build for webOS | `npm run build:webos` |
