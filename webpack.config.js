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

plugins.push(new CleanWebpackPlugin());

plugins.push(new CopyWebpackPlugin({
    patterns: [{
        //Note:- No wildcard is specified hence will copy all files and folders
        from: './src', //Will resolve to RepoDir/src/assets 
        to: './' //Copies all files from above dest to dist/assets
    }, {
        //Note:- No wildcard is specified hence will copy all files and folders
        from: './node_modules/gun', //Will resolve to RepoDir/src/assets 
        to: './gun' //Copies all files from above dest to dist/assets
    }, {
        //Note:- No wildcard is specified hence will copy all files and folders
        from: './node_modules/@fortawesome/fontawesome-free', //Will resolve to RepoDir/src/assets 
        to: './fontawesome' //Copies all files from above dest to dist/assets
    }, ]
}));


plugins.push(new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser',
}));

plugins.push(new webpack.DefinePlugin(webpack_env));

plugins.push(new HtmlWebpackPlugin({
    filename: './index.html',
    template: './src/index.html',
    inject: false,
    minify: false,
    hash: false,
    cache: false,
    showErrors: false
}));


module.exports = {
    mode: process.env.NODE_ENV,
    stats: 'minimal',
    entry: ['./src/peersocial/app.js'],
    externals: {
        fs: "commonjs fs",
        path: "commonjs path",
    },
    output: {
        path: path.resolve(__dirname, './docs'),
        clean: true,
        filename: './app/app.js'
    },
    plugins: plugins,
    resolve: {
        fallback: {
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer")
        }
    },
    module: {
        rules: [{
            test: /\.html$/i,
            use: [{
                loader: 'raw-loader',
                options: {
                    esModule: false,
                }
            }]
        }]
    },
};
