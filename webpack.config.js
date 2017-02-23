'use strict';

module.exports = {
    entry: './src',
    devtool: 'source-map',
    output: {
        path: './dist',
        filename: 'carina.js',
        library: 'carina',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'awesome-typescript-loader' },
        ]
    },
}
