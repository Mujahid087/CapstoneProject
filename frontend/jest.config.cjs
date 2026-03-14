module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  setupFiles: ["./jest.setup.cjs"],
  transformIgnorePatterns: [
    "node_modules/(?!(axios|react-toastify|@reduxjs/toolkit|react-redux|react-router|react-router-dom)/)",
  ],
  testMatch: ["<rootDir>/src/**/*.test.{js,jsx}"],
};

