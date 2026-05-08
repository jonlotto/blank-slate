import { useState, useEffect, useCallback } from "react";
import OneSignal from "react-onesignal";

const ONESIGNAL_APP_ID = "1b21eaac-881b-439c-b372-4253c00d71c7";

let isInitialized = false;

// Check if running as installed PWA
function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;
  
  // Check display-mode media query (works on most browsers)
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  
  // Check iOS Safari specific property
  const isIOSStandalone = (navigator as any).standalone === true;
  
  // Check if launched from home screen on Android
  const isAndroidTWA = document.referrer.includes("android-app://");
  
  return isStandalone || isIOSStandalone || isAndroidTWA;
}

export function useOneSignal() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPWA, setIsPWA] = useState(false);

  // Initialize OneSignal
  useEffect(() => {
    const initOneSignal = async () => {
      // Only run on client-side
      if (typeof window === "undefined") return;
      
      // Check if running as PWA
      const pwaMode = isPWAInstalled();
      setIsPWA(pwaMode);
      console.log("[OneSignal] PWA mode:", pwaMode);
      
      // Check if notifications are supported
      const supported = "Notification" in window && "serviceWorker" in navigator;
      setIsSupported(supported);
      console.log("[OneSignal] Notifications supported:", supported);
      
      if (!supported) {
        console.log("[OneSignal] Notifications not supported, skipping init");
        setIsLoading(false);
        return;
      }

      // Prevent double initialization
      if (isInitialized) {
        console.log("[OneSignal] Already initialized");
        setIsLoading(false);
        return;
      }

      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "/OneSignalSDKWorker.js",
        });

        isInitialized = true;

        // Check current permission state
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        // Check if user is subscribed
        const subscribed = await OneSignal.User.PushSubscription.optedIn;
        setIsSubscribed(subscribed || false);

        // AUTO-SUBSCRIBE: If running as PWA and permission already granted, auto opt-in
        if (pwaMode && currentPermission === "granted" && !subscribed) {
          console.log("[OneSignal] PWA detected with permission granted - auto subscribing");
          await OneSignal.User.PushSubscription.optIn();
          setIsSubscribed(true);
        }

        // Listen for subscription changes
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          setIsSubscribed(event.current.optedIn || false);
        });

      } catch (error: any) {
        // Check if SDK was already initialized (HMR or multiple renders)
        if (error?.message?.includes("already initialized")) {
          console.log("[OneSignal] SDK was already initialized, syncing state...");
          isInitialized = true;
          
          // Sync current state
          const currentPermission = Notification.permission;
          setPermission(currentPermission);
          
          try {
            const subscribed = await OneSignal.User.PushSubscription.optedIn;
            setIsSubscribed(subscribed || false);
            
            // Auto-subscribe in PWA if permission already granted
            if (pwaMode && currentPermission === "granted" && !subscribed) {
              await OneSignal.User.PushSubscription.optIn();
              setIsSubscribed(true);
            }
          } catch (e) {
            console.log("[OneSignal] Could not sync subscription state");
          }
        } 
        // Check if domain restriction error (only works on production domain)
        else if (error?.message?.includes("Can only be used on")) {
          console.log("[OneSignal] Domain restriction - running on:", window.location.hostname);
          console.log("[OneSignal] Push notifications only work on the production domain");
          setIsSupported(false);
        } else {
          console.error("OneSignal initialization error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initOneSignal();
  }, []);

  // Request notification permission manually
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported || !isInitialized) {
      console.warn("OneSignal not initialized or notifications not supported");
      return "denied";
    }

    try {
      // Request permission through OneSignal
      await OneSignal.Notifications.requestPermission();
      
      // Get the updated permission state
      const newPermission = Notification.permission;
      setPermission(newPermission);

      if (newPermission === "granted") {
        // Opt the user in to push notifications
        await OneSignal.User.PushSubscription.optIn();
        setIsSubscribed(true);
      }

      return newPermission;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return "denied";
    }
  }, [isSupported]);

  // Opt out of notifications
  const unsubscribe = useCallback(async () => {
    if (!isInitialized) return;

    try {
      await OneSignal.User.PushSubscription.optOut();
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error opting out:", error);
    }
  }, []);

  // Toggle subscription
  const toggleNotifications = useCallback(async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await requestPermission();
    }
  }, [isSubscribed, requestPermission, unsubscribe]);

  return {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    isInitialized,
    isPWA,
    requestPermission,
    unsubscribe,
    toggleNotifications,
  };
}
