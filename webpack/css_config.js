'use strict';

var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var sources = glob.sync(path.resolve(__dirname, '..', 'source/**/*.scss'));

module.exports = _.map(sources, function(source) {
    var fileName = source.replace(/^.*[\\\/]/, '').replace(/\.scss?/, '');
    var filePath = source.substring(0, source.lastIndexOf("/"));
    var buildFilePath = filePath.replace('source', 'build');
    var fileEntry = {};
    fileEntry[fileName] = source;
    return {
        entry: fileEntry,
        output: {
            path: buildFilePath,
            filename: '[name].css'
        },
        include: '/source/',
        module: {
            loaders: [
                {
                    test: /\.scss?$/,
                    include: '/source/',
                    loader: ['style','css','scss']
                }
            ]
        }
    };
});
