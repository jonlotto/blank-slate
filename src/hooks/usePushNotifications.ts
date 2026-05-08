import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// VAPID public key - will be set after generating keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const subscribeUser = useCallback(async () => {
    if (!user || !VAPID_PUBLIC_KEY) {
      console.warn("User not logged in or VAPID key not configured");
      return false;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Convert VAPID key to ArrayBuffer for applicationServerKey
      const vapidKeyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray.buffer as ArrayBuffer,
      });

      const subscriptionJson = subscription.toJSON();
      
      // Save subscription to database using raw query to avoid type issues
      const { error } = await supabase
        .from("push_subscriptions" as never)
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || "",
          auth: subscriptionJson.keys?.auth || "",
        } as never, {
          onConflict: "user_id,endpoint"
        });

      if (error) {
        console.error("Error saving subscription:", error);
        return false;
      }

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const unsubscribeUser = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from("push_subscriptions" as never)
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied" as NotificationPermission;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        await subscribeUser();
      }
      
      return result;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return "denied" as NotificationPermission;
    }
  }, [isSupported, subscribeUser]);

  const toggleNotifications = useCallback(async () => {
    if (permission !== "granted") {
      return await requestPermission();
    }
    
    if (isSubscribed) {
      await unsubscribeUser();
    } else {
      await subscribeUser();
    }
    
    return permission;
  }, [permission, isSubscribed, requestPermission, subscribeUser, unsubscribeUser]);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported,
    requestPermission,
    subscribeUser,
    unsubscribeUser,
    toggleNotifications,
  };
}
