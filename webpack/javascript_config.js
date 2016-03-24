'use strict';

var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');

var js_sources = glob.sync(path.resolve(__dirname, '..', 'source/**/*.js*'));

module.exports = _.map(js_sources, function(js_source) {
    var fileName = js_source.replace(/^.*[\\\/]/, '').replace(/\.jsx?/, '');
    var filePath = js_source.substring(0, js_source.lastIndexOf("/"));
    var buildFilePath = filePath.replace('source', 'build');
    var fileEntry = {};
    fileEntry[fileName] = js_source;
    return {
        content: __dirname,
        debug: process.env.NODE_ENV === 'development',
        entry: fileEntry,
        output: {
            path: buildFilePath,
            filename: '[name].js',
            sourceMapFilename: '[name].map'
        },
        module: {
            loaders: [
                { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' }
            ]
        },
        resolve: {
            root: __dirname,
            modulesDirectories: [
                'node_modules',
                'source'
            ],
            extensions: ['', '.js', '.jsx']
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }),
            new webpack.SourceMapDevToolPlugin({
                filename: '[name].map',
                columns: false,
                module: true
            }),
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.DedupePlugin()
        ]
    }
});
