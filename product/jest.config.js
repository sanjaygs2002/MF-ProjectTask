module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "^host/(.*)$": "<rootDir>/src/mock/host/$1", // ✅ redirect host/* to local mocks
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // ✅ mock CSS modules
  },
};
