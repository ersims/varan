const { base } = require('../dist/webpack/base');

/**
 * A webpack configuration base template.
 * Useful to extend for your own benefit, while still taking advantage of sane defaults regardless of target.
 *
 * Use `webpack-merge` or similar (or merge manually) to create your optimized configuration.
 */
module.exports = base;
