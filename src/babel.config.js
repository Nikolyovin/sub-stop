module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ... твои другие плагины
      "react-native-reanimated/plugin", // ← ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ!
    ],
  };
};
