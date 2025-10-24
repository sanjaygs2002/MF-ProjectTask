export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!react-router|react-router-dom|@remix-run)",
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "^host/(.*)$": "<rootDir>/src/store/$1", // ✅ point this to your mock folder
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },


};
