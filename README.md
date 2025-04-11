# Wooltari Mobile App

A React Native mobile app that integrates with the Wooltari Next.js web app using WebView. The app includes push notification functionality via OneSignal and Firebase Cloud Messaging.

## Features

- WebView integration with the Next.js web app
- OneSignal push notification integration
- Firebase Cloud Messaging support
- Language preference syncing between web and mobile app
- Share functionality

## Prerequisites

- Node.js (18 or higher)
- React Native development environment setup
- OneSignal account
- Firebase project

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update Firebase configuration files:
   - Replace placeholder values in `android/app/google-services.json`
   - Replace placeholder values in `ios/GoogleService-Info.plist`

3. Update OneSignal App ID:
   - In `App.tsx`, update the `ONESIGNAL_APP_ID` constant with your actual OneSignal App ID

4. Update WebView URL:
   - In `App.tsx`, update the `WEBVIEW_URL` constant to point to your Next.js app URL

## Development

### Running on iOS
```bash
cd ios && pod install
cd ..
npx react-native run-ios
```

### Running on Android
```bash
npx react-native run-android
```

## Communication between Web and Mobile App

The app uses message passing between the WebView and React Native to handle:

1. Language changes - When the language is changed in the web app, the change is communicated to the React Native app to update OneSignal tags
2. Share functionality - The web app can request the native share functionality

## OneSignal Integration

The app uses OneSignal for push notifications:

1. Initialize OneSignal with your app ID
2. Request notification permissions from the user
3. Set up handlers for notifications in foreground and when opened
4. Set user tags like language preference

## Firebase Cloud Messaging

Firebase Cloud Messaging is used as an additional channel for push notifications:

1. Request user permission for notifications
2. Get FCM token for identifying the device
3. Set up handlers for foreground and background messages

## Troubleshooting

- If you encounter build issues on iOS, try cleaning the build folder:
  ```bash
  cd ios && xcodebuild clean
  ```

- For Android build issues, try cleaning the Gradle cache:
  ```bash
  cd android && ./gradlew clean
  ```

- For WebView issues, check the WEBVIEW_URL is correctly set and reachable

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
