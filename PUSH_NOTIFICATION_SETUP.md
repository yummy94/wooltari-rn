# Push Notification Setup

This project uses Firebase Cloud Functions and OneSignal to handle push notifications.

## Architecture

1. **React Native App** - When a user selects their language preference, the app calls a Firebase Cloud Function
2. **Firebase Cloud Function** - The function contacts OneSignal's REST API to send the push notification
3. **OneSignal** - Delivers the notification to the user's device

## Firebase Function

The Firebase function is deployed at:
https://us-central1-wooltari-bf6c3.cloudfunctions.net/sendLanguageChangeNotification

The function takes:
- language ('en' or 'ko')
- playerId (user's OneSignal ID)

## OneSignal Setup

The app uses OneSignal for cross-platform push notifications:
- App ID: eef5a742-3cb6-4076-94b7-0fd17e7331f0
- REST API Key: Stored securely in the Firebase function

## Workflow

1. User clicks "Register for Notifications" in the app
2. App requests notification permissions
3. If granted, the app saves the language preference as a OneSignal tag
4. App calls Firebase function with user's OneSignal ID and language
5. Firebase function calls OneSignal API to send welcome notification
6. User receives notification in their chosen language

## Troubleshooting

If push notifications are not working:
1. Check the app logs for errors
2. Verify the Firebase function is deployed correctly
3. Check OneSignal dashboard for delivery issues
4. Make sure the device has internet connectivity 