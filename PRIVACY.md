# WebActigram - Privacy Policy

Last Updated: November 30, 2025

## Overview

WebActigram is a browser extension designed to track browser activity for personal sleep/wake cycle analysis. We are committed to protecting your privacy and being transparent about what data we collect and how we use it.

## Data Collection

### What We Collect

WebActigram collects and stores the following data **locally on your device**:

1. **Activity Timestamps**: The date and time when each activity measurement was taken
2. **Activity Scores**: A numerical value (0-100) representing the percentage of time your browser was active during a time epoch
3. **Settings**: Your preferences for epoch duration, idle threshold, and data retention

### What We DO NOT Collect

WebActigram explicitly does NOT collect:

- ❌ URLs or web addresses you visit
- ❌ Page titles or content
- ❌ Search queries
- ❌ Form data or passwords
- ❌ Cookies or browsing history
- ❌ Keystrokes or mouse movements
- ❌ Any personally identifiable information
- ❌ Any data about specific websites or tabs

## How We Use Your Data

Your activity data is used solely to:

1. Display your activity patterns in the actigram chart
2. Calculate statistics about your browser usage
3. Provide insights into your potential sleep/wake cycles

## Data Storage

- **Local Storage Only**: All data is stored locally in your browser using the browser's storage API
- **No Cloud Sync**: Unless you explicitly enable browser sync, your data stays on your device
- **No External Servers**: We do not transmit any data to external servers
- **No Analytics**: We do not use any analytics services or tracking

## Data Sharing

We do not share, sell, or transmit your data to any third parties. Period.

The only way your data leaves your device is if you:
1. Explicitly export it using the Export Data feature
2. Enable browser sync (which syncs settings only, not activity data)

## Your Rights

You have complete control over your data:

- **Export**: Download all your data as a JSON file at any time
- **Delete**: Clear all data with one click in the settings
- **Control**: Choose how long to retain data (30-180 days)
- **Transparency**: All source code is available for review

## Data Retention

- Data is automatically deleted after your chosen retention period (default: 90 days)
- You can manually delete all data at any time through the settings page
- Uninstalling the extension will remove all stored data

## Permissions Explained

WebActigram requests the following browser permissions:

- **`idle`**: To detect when your browser is active or idle
- **`storage`**: To save your activity data and settings locally
- **`alarms`**: To periodically save data and clean up old entries

We do not request permissions for:
- Browsing history
- Tabs
- Web requests
- Cookies
- Or any other sensitive data

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the extension's repository with an updated "Last Updated" date.

## Contact

If you have questions about this privacy policy or how your data is handled, please open an issue on our GitHub repository.

## Open Source

WebActigram is open source. You can review all the code to verify our privacy claims at any time.

---

**Summary**: WebActigram only tracks whether your browser is active or idle. It does not track what you do, where you go, or any personal information. All data stays on your device unless you explicitly export it.
