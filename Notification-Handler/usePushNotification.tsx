import { useEffect, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) {
        console.log("Must use physical device for push notifications");
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      // 👇 grab the projectId from app.json -> extra -> eas.projectId
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log("Project ID not found. Check app.json for expo.extra.eas.projectId");
        return;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;

      console.log("Expo push token:", token);
      setExpoPushToken(token);
    }

    registerForPushNotificationsAsync();
  }, []);

  return { expoPushToken };
}
