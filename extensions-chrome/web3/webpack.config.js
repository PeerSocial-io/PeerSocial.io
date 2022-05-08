const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const pathsToClean = ['./docs'];
// const cleanOptions = { root: __dirname, verbose: true, dry: false, exclude: [], };

const webpack_env = {};
// console.log("process.env.NODE_ENV",process.env.NODE_ENV)
// webpack_env['process.env.NODE_ENV'] = JSON.stringify(process.env.APP_ENV);
webpack_env['process.env.APP_ENV'] = JSON.stringify(process.env.APP_ENV);
webpack_env['process.env.DEBUG'] = JSON.stringify(process.env.APP_ENV == "production" ? false : true);
// webpack_env['process.env.DAPP_KEY'] = JSON.stringify(false);

console.log("webpack_env", webpack_env);


let plugins = []

plugins.push(new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser',
}));

plugins.push(new webpack.DefinePlugin(webpack_env));

// plugins.push(new HtmlWebpackPlugin({
//     filename: './index.html',
//     template: './src/index.html',
//     inject: false,
//     minify: false,
//     hash: false,
//     cache: false,
//     showErrors: false
// }));

var externals_rules = {
    fs: "commonjs fs",
    path: "commonjs path",
};

var resolve_rules = {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {},
    fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer")
    }
};

var module_rules = {
    rules: [{
        test: /\.html$/i,
        use: [{
            loader: 'raw-loader',
            options: {
                esModule: false,
            }
        }]
    }]
};

module.exports = [{
    entry: [path.resolve(__dirname, './src/background.js')],
    output: {
        path: path.resolve(__dirname, './app'),
        filename: './background.js'
    },

    context: __dirname,

    mode: process.env.NODE_ENV,
    // stats: 'minimal',
    stats: 'normal',
    externals: externals_rules,
    plugins: plugins,
    resolve: resolve_rules,
    module: module_rules
},{
    entry: [path.resolve(__dirname, './src/document_start.js')],
    output: {
        path: path.resolve(__dirname, './app'),
        filename: './document_start.js'
    },
    devtool: false,

    context: __dirname,

    mode: process.env.NODE_ENV,
    // stats: 'minimal',
    stats: 'normal',
    externals: externals_rules,
    plugins: plugins,
    resolve: resolve_rules,
    module: module_rules
}];
