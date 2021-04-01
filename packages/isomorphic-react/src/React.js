/* global module */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const React = require('react');

module.exports = typeof window.React === 'undefined' ? React : window.React;
