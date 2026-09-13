const { getDefaultConfig } = require('expo/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

const config = getDefaultConfig(__dirname);

// Metro defaults to `numCPUs - 1` worker threads. On high-core-count
// machines that spawns far more concurrent workers than available RAM can
// back, and Tamagui's static extraction is memory-heavy per file — the
// combination has been crashing bundles with
// "DataCloneError: Data cannot be cloned, out of memory" from jest-worker.
// Capping the pool keeps peak memory bounded.
config.maxWorkers = Math.max(2, Math.min(6, require('os').cpus().length - 1));

module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
});