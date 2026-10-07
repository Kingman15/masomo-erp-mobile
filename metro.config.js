const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

// Config Expo par défaut + identifiants de bundle Sentry (rattache les source maps aux erreurs).
const config = getSentryExpoConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
