// Teszt fájl MyIO Theme 2 dashboard-hoz
// Alapvető tesztelési segédeszközök

const TestUtils = {
  log: (message) => {
    console.log(`[TEST] ${message}`);
  },

  error: (message) => {
    console.error(`[TEST ERROR] ${message}`);
  },

  assert: (condition, message) => {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
    TestUtils.log(`✓ ${message}`);
  },

  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Exportálás más modulokhoz
if (typeof module !== "undefined" && module.exports) {
  module.exports = TestUtils;
}
