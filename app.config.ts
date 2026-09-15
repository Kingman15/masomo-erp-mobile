import type { ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const config: ExpoConfig = {
  name: IS_DEV ? "Masomo (Dev)" : IS_PREVIEW ? "Masomo (Preview)" : "Masomo",
  slug: "masomo-erp",
  scheme: "masomo",
  owner: "koncept-tech",

  android: {
    package: IS_DEV
      ? "com.masomo.app.dev"
      : IS_PREVIEW
        ? "com.masomo.app.preview"
        : "com.masomo.app",
  },

  ios: {
    bundleIdentifier: IS_DEV
      ? "com.masomo.app.dev"
      : IS_PREVIEW
        ? "com.masomo.app.preview"
        : "com.masomo.app",
  },

  plugins: ["@react-native-community/datetimepicker", "expo-sharing"],

  extra: {
    eas: { projectId: "620aca7b-b2e1-4d1e-8299-229f427e68f2" },
  },
};

export default config;
