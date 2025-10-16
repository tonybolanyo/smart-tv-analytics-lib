/**
 * ngcc configuration to ensure smart-tv-analytics library is processed correctly
 */
module.exports = {
  packages: {
    'smart-tv-analytics': {
      entryPoints: {
        '.': {
          override: {
            main: './bundles/smart-tv-analytics.umd.js',
            module: './fesm2015/smart-tv-analytics.js',
            es2015: './fesm2015/smart-tv-analytics.js',
            esm2015: './esm2015/smart-tv-analytics.js',
            typings: './smart-tv-analytics.d.ts',
          },
        },
      },
    },
  },
};
