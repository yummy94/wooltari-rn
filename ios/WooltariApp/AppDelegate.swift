import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseCore

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "WooltariApp"
    self.dependencyProvider = RCTAppDependencyProvider()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]
    
    // Initialize Firebase with explicit path to plist
    if let filePath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") {
      let options = FirebaseOptions(contentsOfFile: filePath)
      if let options = options {
        FirebaseApp.configure(options: options)
        print("Firebase configured with options from \(filePath)")
      } else {
        print("Failed to load Firebase options from \(filePath)")
        // Fallback to default configuration
        FirebaseApp.configure()
      }
    } else {
      print("GoogleService-Info.plist not found in bundle")
      // Fallback to default configuration
      FirebaseApp.configure()
    }
    
    // OneSignal is now initialized in JavaScript/React Native code
    // No need to initialize here

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
