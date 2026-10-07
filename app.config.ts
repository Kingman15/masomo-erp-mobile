import type { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

// Reçoit la config statique d'app.json et la complète : exporter un objet ferait ignorer app.json.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? "Masomo (Dev)" : IS_PREVIEW ? "Masomo (Preview)" : "Masomo",
  slug: "masomo-erp",
  scheme: "masomo",
  owner: "koncept-tech",

  android: {
    ...config.android,
    package: IS_DEV
      ? "com.masomo.app.dev"
      : IS_PREVIEW
        ? "com.masomo.app.preview"
        : "com.masomo.app",
  },

  ios: {
    ...config.ios,
    bundleIdentifier: IS_DEV
      ? "com.masomo.app.dev"
      : IS_PREVIEW
        ? "com.masomo.app.preview"
        : "com.masomo.app",
  },

  plugins: [
    ...(config.plugins ?? []),
    "@react-native-community/datetimepicker",
    "expo-sharing",
    // Envoi des source maps au build : SENTRY_AUTH_TOKEN doit exister en secret EAS.
    [
      "@sentry/react-native/expo",
      { url: "https://sentry.io/", organization: "koncept-lt", project: "masomo-mobile" },
    ],
  ],

  extra: {
    ...config.extra,
    eas: { projectId: "620aca7b-b2e1-4d1e-8299-229f427e68f2" },
    // Environnement Sentry (development, preview, production).
    appVariant: process.env.APP_VARIANT ?? "development",
  },
});
