/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Helper function to safely stringify objects without circular references
function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular Reference]';
      }
      cache.add(value);
    }
    return value;
  });
}

// Simple health check endpoint to ensure container starts properly
exports.healthCheck = functions.https.onRequest((request, response) => {
  response.send('OK');
});

// Our main function for sending notifications
exports.sendLanguageChangeNotification = functions.https.onCall(async (data) => {
  try {
    // Debug the incoming data
    console.log("Function called with data:", safeStringify(data || {}));
    
    if (!data) {
      return { success: false, error: 'No data provided' };
    }
    
    // Extract playerId with fallbacks for different property names or casing
    let playerId = data.playerId || data.playerid || data.player_id || data.player_Id || data.PlayerId;
    const language = data.language || 'en';
    
    // Check data structure more thoroughly
    console.log("Full data structure:", JSON.stringify(data, null, 2));
    
    // Log all properties to help debug
    console.log("All data properties:", Object.keys(data).join(', '));
    
    // More detailed debugging
    console.log("Extracted language:", language);
    console.log("Extracted playerId:", playerId);
    
    // If we still don't have a playerId, check if it's nested
    if (!playerId && data.data && typeof data.data === 'object') {
      playerId = data.data.playerId || data.data.playerid || data.data.player_id;
      console.log("Found nested playerId:", playerId);
    }
    
    if (!playerId) {
      return { success: false, error: 'No player ID provided' };
    }
    
    // OneSignal credentials
    const appId = 'eef5a742-3cb6-4076-94b7-0fd17e7331f0';
    const restApiKey = 'os_v2_app_5322oqr4wzahnffxb7ix44zr6b3nxsxkwvwunsekhzzap2mkdq5ia4czijdm6xftb5ukytwmneyhzijzbrweyuhg3okapqnmiukfaci';
    
    console.log("Preparing OneSignal API request");
    
    // Prepare request body
    const notificationBody = {
      app_id: appId,
      include_player_ids: [playerId],
      contents: {
        en: language === 'en' ? 'Your notifications are now set to English' : '알림이 한국어로 설정되었습니다',
        ko: language === 'en' ? 'Your notifications are now set to English' : '알림이 한국어로 설정되었습니다'
      },
      headings: {
        en: 'Language Preference Updated',
        ko: '언어 설정 업데이트'
      }
    };
    
    console.log("Request body:", safeStringify(notificationBody));
    
    // Call OneSignal API - NOTE: REST API v2 requires Basic auth with the REST API key
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(restApiKey).toString('base64')
      },
      body: JSON.stringify(notificationBody)
    });
    
    console.log("OneSignal API response status:", response.status);
    
    // Check if the response is valid
    if (response.status >= 400) {
      console.error("OneSignal API error:", response.status);
      const errorText = await response.text();
      console.error("OneSignal API error response:", errorText);
      return { 
        success: false, 
        error: `OneSignal API error: ${response.status}`, 
        details: errorText 
      };
    }
    
    const result = await response.json();
    console.log("OneSignal API response:", safeStringify(result));
    // Return a simplified result object to avoid circular references
    return { 
      success: true, 
      message: "Notification sent successfully",
      id: result.id || null,
      recipients: result.recipients || 0
    };
  } catch (error) {
    console.error('Error sending notification:', error.message || 'Unknown error');
    
    // Extract only the necessary information from the error to avoid circular references
    let errorInfo = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error'
    };
    
    // If there are additional safe properties, add them
    if (error.code) errorInfo.code = error.code;
    if (error.statusCode) errorInfo.statusCode = error.statusCode;
    
    return { 
      success: false, 
      error: errorInfo.message,
      errorDetails: errorInfo
    };
  }
});


  