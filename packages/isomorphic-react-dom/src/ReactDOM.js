/* global module */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactDOM = require('react-dom');

module.exports = typeof window.ReactDOM === 'undefined' ? ReactDOM : window.ReactDOM;
