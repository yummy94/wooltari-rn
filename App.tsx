/**
 * Wooltari React Native App
 * Handles WebView integration with Next.js and manages OneSignal
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
  Share,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Buffer } from 'buffer';

// Ignore TypeScript errors for OneSignal
// @ts-ignore
import OneSignal from 'react-native-onesignal';

// Firebase is not needed for basic OneSignal segmentation
// Remove these imports:
// import firebase from '@react-native-firebase/app';
// import functions from '@react-native-firebase/functions';

function App(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en'); // Default language
  const webViewRef = useRef<WebView>(null);
  // Track last notification to prevent duplicates
  const lastNotificationRef = useRef<{language: string, timestamp: number} | null>(null);

  // Configure OneSignal on component mount
  useEffect(() => {
    // OneSignal initialization
    OneSignal.setAppId('eef5a742-3cb6-4076-94b7-0fd17e7331f0');
    OneSignal.setLogLevel(6, 0);
    
    // Let's handle notifications opened
    OneSignal.setNotificationOpenedHandler((notification) => {
      console.log('OneSignal: notification opened:', JSON.stringify(notification));
      
      // Optional: handle notification here
      // For example, you could navigate to a specific page
    });

    console.log('OneSignal initialized');
  }, []);

  // Function to update OneSignal user language tag
  const updateOneSignalLanguage = async (lang: string) => {
    try {
      await OneSignal.sendTag('language', lang);
      console.log(`OneSignal language tag set to: ${lang}`);
    } catch (error) {
      console.error('Error setting OneSignal tag:', error);
    }
  };

  // Send an immediate notification to the user
  const notifyLanguageChange = async (language: string) => {
    try {
      // Debounce notifications to prevent duplicates within 5 seconds
      const now = Date.now();
      if (lastNotificationRef.current && 
          lastNotificationRef.current.language === language && 
          now - lastNotificationRef.current.timestamp < 5000) {
        console.log('Notification debounced - already sent in last 5 seconds');
        return true; // Return success without sending duplicate
      }
      
      // Get the device state to access the player ID
      const deviceState = await OneSignal.getDeviceState();
      const playerId = deviceState ? deviceState.userId : null;
      
      if (!playerId) {
        console.error('No player ID available');
        return false;
      }

      console.log(`Sending immediate notification to player ${playerId} in ${language}`);
      
      // Update tracking for debouncing
      lastNotificationRef.current = {
        language,
        timestamp: now
      };
      
      // Simple notification content
      const notificationContent = {
        en: 'You will now receive notifications in English',
        ko: '알림이 한국어로 설정되었습니다'
      };
      
      const notificationHeading = {
        en: 'Language Preference Updated',
        ko: '언어 설정 업데이트'
      };
      
      // Call OneSignal REST API directly
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic os_v2_app_5322oqr4wzahnffxb7ix44zr6b3nxsxkwvwunsekhzzap2mkdq5ia4czijdm6xftb5ukytwmneyhzijzbrweyuhg3okapqnmiukfaci'
        },
        body: JSON.stringify({
          app_id: 'eef5a742-3cb6-4076-94b7-0fd17e7331f0',
          include_player_ids: [playerId],
          contents: {
            en: language === 'en' ? notificationContent.en : notificationContent.ko,
            ko: language === 'en' ? notificationContent.en : notificationContent.ko
          },
          headings: {
            en: language === 'en' ? notificationHeading.en : notificationHeading.ko,
            ko: language === 'en' ? notificationHeading.en : notificationHeading.ko
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('OneSignal notification result:', result);
      
      if (result.id) {
        console.log(`Notification sent successfully with ID: ${result.id}`);
        return true;
      } else {
        throw new Error(JSON.stringify(result.errors || result));
      }
    } catch (error) {
      console.error('Error sending OneSignal notification:', error);
      
      // Show a local fallback notification
      setTimeout(() => {
        Alert.alert(
          language === 'en' ? 'Language Preference Updated' : '언어 설정 업데이트',
          language === 'en' ? 'You will receive future notifications in English' : '앞으로 알림을 한국어로 받게 됩니다'
        );
      }, 500);
      
      return false;
    }
  };

  // New handler for registration button
  const handleRegisterForNotifications = async (language: string) => {
    try {
      // Request permissions explicitly
      let accepted = false;
      
      // Use a callback to get the permission result
      await new Promise<void>((resolve) => {
        OneSignal.promptForPushNotificationsWithUserResponse((response: boolean) => {
          accepted = response;
          resolve();
        });
      });
      
      if (accepted) {
        // Get the device state to have player ID for logging
        const deviceState = await OneSignal.getDeviceState();
        const playerId = deviceState ? deviceState.userId : null;
        
        // Set the language tag
        await updateOneSignalLanguage(language);
        console.log(`Language tag set to ${language} for player ${playerId}`);
        
        // Send an immediate notification - this will show an Alert on failure
        const notificationSent = await notifyLanguageChange(language);
        
        // Only show the registration success message if the notification failed
        // This prevents showing two alerts in succession
        if (!notificationSent) {
          Alert.alert(
            'Registration Successful',
            `You will now receive notifications in ${language === 'en' ? 'English' : 'Korean'}`
          );
        }
        
        console.log(`User registered for notifications in ${language} with player ID: ${playerId}`);
      } else {
        console.log('User declined notification permissions');
        Alert.alert(
          'Notifications Disabled',
          'You will not receive notifications. You can enable them in settings later.'
        );
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
      Alert.alert(
        'Error',
        'An error occurred when registering for notifications. Please try again.'
      );
    }
  };

  // Handle language change from webview
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    console.log(`Language changed to: ${lang}`);
  };

  // URL of the web app - make sure this matches where your Next.js app is running
  const webAppUrl = 'https://wooltari-gamma.vercel.app/'; 
  
  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Message received from WebView:', message);
      
      switch (message.type) {
        case 'languageChange':
          handleLanguageChange(message.data.language);
          break;
        case 'share':
          handleShare(message.data);
          break;
        case 'register':
          handleRegisterForNotifications(message.data.language);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };
  
  // Handle share functionality
  const handleShare = async (data: any) => {
    try {
      const { url, title } = data;
      const shareOptions = {
        title: title || 'Wooltari App',
        message: 'Check out this app!',
        url: url || webAppUrl,
      };
      
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share was dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // JavaScript to inject into WebView to help with button interaction
  const injectedJavaScript = `
    // Debugging console logs
    console.log('WebView JS injection executing...');
    
    // Track if we've already set up listeners to avoid duplicates
    window.listenerSetupComplete = window.listenerSetupComplete || false;
    
    // Use a flag to track recent clicks and prevent duplicates
    let recentButtonClick = null;
    
    // Helper function for button interaction
    function setupButtonListeners() {
      // Avoid setting up listeners multiple times
      if (window.listenerSetupComplete) {
        console.log('Listeners already set up, skipping');
        return;
      }
      
      console.log('Setting up button listeners in WebView');
      
      // Try to find language buttons if they exist
      const buttons = document.querySelectorAll('button');
      console.log('Found ' + buttons.length + ' buttons');
      
      // Flag to track setup
      window.listenerSetupComplete = true;
      
      buttons.forEach(button => {
        const text = button.textContent?.trim().toLowerCase();
        const buttonId = button.id || text;
        
        // Log each button found
        console.log('Button text:', text, 'ID:', buttonId);
        
        // Use a different approach - listen to the click but don't stop it
        // Instead, add a separate event listener that runs after the normal click
        button.addEventListener('click', function(e) {
          // Simple debouncing to prevent multiple message sending
          const now = Date.now();
          
          if (recentButtonClick && recentButtonClick.id === buttonId && (now - recentButtonClick.time < 1000)) {
            console.log('Ignoring duplicate button message');
            return; // Don't send another message, but let the click through for UI updates
          }
          
          // Update recent click tracker
          recentButtonClick = { id: buttonId, time: now };
          
          // Use setTimeout to ensure this happens after the normal click handling
          setTimeout(() => {
            if (text === 'english' || buttonId === 'lang-en') {
              console.log('English button clicked - sending message to React Native');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'languageChange',
                data: { language: 'en' }
              }));
            } else if (text === 'korean' || buttonId === 'lang-ko') {
              console.log('Korean button clicked - sending message to React Native');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'languageChange',
                data: { language: 'ko' }
              }));
            } else if (text?.includes('share')) {
              console.log('Share button clicked - sending message to React Native');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'share',
                data: { url: window.location.href, title: document.title }
              }));
            } else if (text?.includes('register') || text?.includes('알림')) {
              console.log('Register button clicked - sending message to React Native');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'register',
                data: { language: document.documentElement.lang || 'en' }
              }));
            }
          }, 0);
        });
      });

      // Add a global click listener to monitor all button clicks
      document.addEventListener('click', function(e) {
        const target = e.target;
        if (target && target.tagName === 'BUTTON') {
          console.log('Button clicked:', target.textContent, 'ID:', target.id, 'Active class:', target.className.includes('active'));
        }
      });
    }
    
    // Run setup when page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupButtonListeners);
    } else {
      setupButtonListeners();
    }
    
    // Just run once more after a short delay to catch dynamic content
    setTimeout(setupButtonListeners, 500);
    
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* WebView loading the Next.js web app */}
      <WebView
        source={{ uri: webAppUrl }}
        style={styles.webView}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
          console.log('WebView loaded successfully');
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onError={(e) => {
          console.error('WebView error:', e.nativeEvent);
          Alert.alert(
            'Error',
            'Failed to load web content. Please check your connection and try again.'
          );
        }}
        ref={webViewRef}
      />
      
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0070f3" />
        </View>
      )}
      
      {/* Reload button for development */}
      <View style={styles.reloadButtonContainer}>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={() => webViewRef.current?.reload()}
        >
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  reloadButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  reloadButton: {
    backgroundColor: '#0070f3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default App;