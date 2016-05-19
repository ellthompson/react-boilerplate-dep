module.exports = {
    entry: './source/js/main.jsx',
    output: {
        path: './build/js/',
        filename: 'bundle.js'
    },
    loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015']
            }
        }
    ]
}
