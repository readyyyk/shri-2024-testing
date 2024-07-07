process.env = Object.assign(process.env, {
  BUG_ID: "9",
});

export default {
  sets: {
    desktop: {
      files: ["test/integrity/**", "test/e2e/**"],
    },
  },

  browsers: {
    chrome: {
      automationProtocol: "devtools",
      desiredCapabilities: {
        browserName: "chrome",
        headless: false,
      },
    },
  },

  plugins: {
    "html-reporter/testplane": {
      enabled: true,
    },
  },
};
