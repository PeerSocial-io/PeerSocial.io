const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pathsToClean = ['./docs'];
const cleanOptions = { root: __dirname, verbose: true, dry: false, exclude: [], };

const webpack_env = {};
webpack_env['process.env.NODE_ENV'] = JSON.stringify(process.env.NODE_ENV);
webpack_env['process.env.DEBUG'] = webpack_env['process.env.NODE_ENV'] == "production" ? false : true;


let plugins = [
    new CleanWebpackPlugin(),

    new CopyWebpackPlugin({
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
    }),

    // new Dotenv(), //
    //  new webpack.DefinePlugin(webpack_env),
    
    new HtmlWebpackPlugin({
        filename: './index.html',
        template: './src/index.html',
        inject: false,
        minify: false,
        hash: false,
        cache: false,
        showErrors: false
    }),

];



module.exports = {
    stats: 'minimal',
    mode: process.env.NODE_ENV,
    entry: ['./src/peersocial/app.js'],
    output: {
        path: path.resolve(__dirname, './docs'),
        filename: './app/app.js'
    },
    externals: { 
        fs: "commonjs fs",
        path: "commonjs path",
    },
    plugins: plugins,
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
    }
};
