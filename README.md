# WebActigram

A privacy-respecting browser extension that tracks your browser activity and visualizes it as an actigram chart for sleep/wake cycle analysis.

![WebActigram Icon](icons/icon-128.png)

## Overview

WebActigram monitors when your browser is active or idle and creates a visual actigram chart showing your activity patterns over time. This can provide insights into your sleep/wake cycles, with browser activity serving as a proxy for wakefulness.

## Features

- **Privacy-First**: Only tracks active/idle states - no URLs, tabs, or browsing content
- **Configurable Time epochs**: Choose 5, 10, 15, or 30-minute intervals (default: 15 minutes)
- **Beautiful Visualization**: D3.js-powered actigram chart with blue gradient color scheme
- **Data Export/Import**: Export your data as JSON and merge data from multiple devices
- **Long-Term Storage**: Keep up to 180 days of activity data (default: 90 days)
- **Cross-Browser**: Works on Chrome and Firefox

## Installation

### Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `webActigram` folder
6. The extension is now installed!

### Firefox

1. Download or clone this repository
2. Rename `manifest_firefox.json` to `manifest.json` (backup the Chrome version first)
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the `webActigram` folder
6. The extension is now installed temporarily!

**Note**: For permanent Firefox installation, you'll need to sign the extension through Mozilla's Add-on Developer Hub.

## Usage

### Viewing Your Actigram

1. Click the WebActigram extension icon in your browser toolbar
2. The popup will display your activity data as an actigram chart
3. Each row represents one day (24 hours)
4. Each cell represents a time epoch (default: 15 minutes)
5. Color intensity indicates activity level:
   - Very light blue (0-20%): Minimal activity
   - Light blue (21-40%): Low activity
   - Medium blue (41-60%): Moderate activity
   - Dark blue (61-80%): High activity
   - Very dark blue (81-100%): Very high activity

### Navigation

- Use the **◀ ▶** buttons to navigate through different days
- Select the number of days to display (1, 2, 3, or 7 days)
- Hover over any cell to see exact time and activity percentage

### Settings

Click the "Settings" button to configure:

- **Time epoch Duration**: How often to record activity (5, 10, 15, 30 minutes)
- **Idle Detection Threshold**: How long before browser is considered idle (15, 30, 60 seconds)
- **Data Retention Period**: How long to keep data (30, 60, 90, 180 days)

### Data Management

#### Export Data

1. Click "Export Data" in the popup or settings page
2. A JSON file will be downloaded with all your activity data
3. The filename includes the export date for easy organization

#### Import & Merge Data

1. Go to Settings
2. Click "Choose File" under Import Data
3. Select a previously exported JSON file
4. Check "Merge with existing data" to combine datasets (recommended for multi-device use)
5. Uncheck to replace all existing data

This is useful if you use the extension on multiple computers and want to combine your activity data.

## Privacy Policy

WebActigram is designed with privacy as a core principle:

- ✅ **Only tracks browser idle/active state** - no URLs, page titles, or browsing content
- ✅ **All data stored locally** - nothing is sent to external servers
- ✅ **No analytics or tracking** - we don't collect any information about you
- ✅ **Open source** - you can review all the code to verify our privacy claims
- ✅ **You control your data** - export, import, or delete at any time

### What Data is Collected?

The extension stores:
- Timestamp of each time epoch
- Activity score (0-100) representing the percentage of time the browser was active
- epoch duration setting

The extension does NOT store:
- URLs or website addresses
- Page titles or content
- Keystrokes or mouse movements
- Any personally identifiable information

## How It Works

1. **Background Worker**: Monitors browser idle state every 15 seconds using the browser's built-in idle detection API
2. **Activity Tracking**: Counts how many seconds the browser was active during each time epoch
3. **Score Calculation**: Calculates activity score as: `(active seconds / total seconds) × 100`
4. **Data Storage**: Saves completed epochs to local browser storage
5. **Visualization**: D3.js renders the data as an interactive actigram chart

## Development

### Project Structure

```
webActigram/
├── manifest.json              # Chrome extension manifest
├── manifest_firefox.json      # Firefox extension manifest
├── background.js              # Background service worker
├── storage-manager.js         # Data storage utilities
├── browser-polyfill.js        # Cross-browser compatibility
├── popup.html                 # Popup UI
├── popup.js                   # Popup controller
├── popup.css                  # Popup styles
├── actigram-chart.js          # D3.js chart rendering
├── options.html               # Settings page
├── options.js                 # Settings controller
├── options.css                # Settings styles
├── lib/
│   └── d3.min.js             # D3.js library (v7)
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### Building from Source

1. Clone the repository
2. Ensure D3.js is in the `lib/` folder (download from https://d3js.org/)
3. Load as unpacked extension in your browser

### Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed.

## Credits

- Built with [D3.js](https://d3js.org/) for data visualization
- Inspired by clinical actigraphy used in sleep research

## Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Verify you have the required permissions enabled
3. Try clearing and reimporting your data
4. Open an issue on GitHub with details about your problem

---

**Note**: This extension is for personal use and informational purposes only. It is not a medical device and should not be used for clinical diagnosis or treatment of sleep disorders.
