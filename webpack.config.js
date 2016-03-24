'use strict';

var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');

var javascript_config = require('./webpack/javascript_config');
var css_config = require('./webpack/css_config');

module.exports = css_config;
