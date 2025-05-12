# Electron Auto-Update Demo

A simple Electron application that demonstrates the auto-update feature for macOS using electron-updater with GitHub as the update provider.

## Features

- Checks for updates on application start
- Shows a progress bar while downloading updates
- Automatically installs and applies updates
- Simple UI for the update process

## Installation

```bash
# Clone the repository
git clone https://github.com/Sachin-chaurasiya/electron-app-update-demo.git

# Navigate to the directory
cd electron-app-update-demo

# Install dependencies
npm install

# Start the application
npm start
```

## Building for Production

```bash
# Build for macOS
npm run build
```

## Publishing Updates

To publish a new version for testing the auto-update:

1. Update the version number in `package.json`
2. Build the application: `npm run build`
3. Publish the new version: `npm run publish`

## How It Works

1. The app uses `electron-updater` to check for updates from a GitHub repository
2. When it finds an update, it prompts the user to download and install
3. After download completion, it automatically installs and restarts the app

## Configuration

The auto-update configuration is set in the following files:

- `package.json`: Contains the repository and build settings
- `main.js`: Configures the auto-updater
- `components/js/versionCheckWindow.js`: Handles the update checking and installation process

## License

MIT
