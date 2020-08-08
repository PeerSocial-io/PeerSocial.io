const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pathsToClean = ['./docs'];
const cleanOptions = { root: __dirname, verbose: true, dry: false, exclude: [], };


let plugins = [
    new CleanWebpackPlugin(),

    new CopyWebpackPlugin({
        patterns: [{
            //Note:- No wildcard is specified hence will copy all files and folders
            from: './src/assets', //Will resolve to RepoDir/src/assets 
            to: './' //Copies all files from above dest to dist/assets
        }]
    }),

    new HtmlWebpackPlugin({
        filename: './index.html',
        template: './src/index.html',
        inject: 'head',
        minify: false,
        hash: false,
        cache: false,
        showErrors: false
    }),

];



module.exports = {
    mode: process.env.NODE_ENV,
    entry: ['./src/peersocial/app.js'],
    output: {
        path: path.resolve(__dirname, './docs'),
        filename: './app/app.js'
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
