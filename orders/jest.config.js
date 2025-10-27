export default {
   testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!react-router|react-router-dom)"],
  moduleFileExtensions: ["js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "^host/(.*)$": "<rootDir>/src/mock/host/$1",  // ✅ correct alias mapping
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
