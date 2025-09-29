import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PROJECT_ID = "164b1a12-fa07-49f6-9eba-f07651fceb45";

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    async function registerForPushNotifications() {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Push notifications permission not granted!");
        return;
      }

      setPermissionGranted(true);

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
      setExpoPushToken(tokenData.data);

      // On Android, set channel for sounds
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    registerForPushNotifications();
  }, []);

  return { expoPushToken, permissionGranted };
}
