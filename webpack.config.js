if (!process.env.PSIO_BUILD)
  process.env.PSIO_BUILD = "core,app";

  if (!process.env.NODE_ENV)
  process.env.NODE_ENV = "development";
  if (!process.env.APP_ENV)
    process.env.APP_ENV = "development";

const path = require('path');
const fs = require('fs');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const editPackageJson = require("edit-package-json");

fs.writeFileSync("./src/package.json", editPackageJson.set(fs.readFileSync("./src/package.json", "utf8"), "source_version", process.env.SOURCE_VERSION || "?"))

const {
  VueLoaderPlugin
} = require('vue-loader')

const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
// const pathsToClean = ['./docs'];
// const cleanOptions = { root: __dirname, verbose: true, dry: false, exclude: [], };

const webpack_env = {};
// console.log("process.env.NODE_ENV",process.env.NODE_ENV)
// webpack_env['process.env.NODE_ENV'] = JSON.stringify(process.env.APP_ENV);
webpack_env['process.env.NODE_ENV'] = JSON.stringify(process.env.NODE_ENV);
webpack_env['process.env.APP_ENV'] = JSON.stringify(process.env.APP_ENV);
webpack_env['process.env.DEBUG'] = JSON.stringify(process.env.APP_ENV == "production" ? false : true);
webpack_env['process.env.SOURCE_VERSION'] = JSON.stringify(process.env.SOURCE_VERSION);
// webpack_env['process.env.DAPP_KEY'] = JSON.stringify(false);

console.log("webpack_env", webpack_env);


const DEFINED = {
  DEBUG: true,
  "ifdef-verbose": true, // add this for verbose output
  "ifdef-triple-slash": false, // add this to use double slash comment instead of default triple slash
  "ifdef-fill-with-blanks": true, // add this to remove code with blank spaces instead of "//" comments
  "ifdef-uncomment-prefix": "// #code " // add this to uncomment code starting with "// #code "
};




function buildConfig() {

}

module.exports = (env, argv) => {
  var buildConfigs = [];
  var configs = {};

  // console.log("webpack env", env);
  // console.log("webpack argv",argv);
  // console.log("process.env", process.env)

  configs.core = {
    context: __dirname,

    // mode: "production",
    mode: process.env.APP_ENV,

    // stats: 'minimal',
    stats: 'normal',
    // stats: 'verbose',

    entry: {
      core: {
        import: path.resolve(__dirname, './src/peersocial/core.js'),
        filename: './app/core.js'
      }
      // app: {
      //     import: path.resolve(__dirname, './src/peersocial/app.js'),
      //     filename: './app/app.js'
      // }
    },
    externals: {
      fs: "commonjs fs",
      //     path: "commonjs path",
    },
    output: {
      path: path.resolve(__dirname, './build'),
      // clean: true
    },
    plugins: [
      // new CleanWebpackPlugin(),
      // new CopyWebpackPlugin({
      //     patterns: [{
      //             from: path.resolve(__dirname, './src'), 
      //             to: './' 
      //         }
      //     ]
      // }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }), new webpack.DefinePlugin(webpack_env), new VueLoaderPlugin(), new HtmlWebpackPlugin({
        filename: './index.html',
        template: './src/index.html',
        inject: false,
        minify: false,
        hash: false,
        cache: false,
        showErrors: false
      })
    ],
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        path: require.resolve("path-browserify")
      }
    },
    module: {
      rules: [{
        test: /\.vue$/,
        loader: 'vue-loader'
      }, {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(peersocial.io\/src)\/).*/,
        use: [{
          loader: "ifdef-loader",
          options: DEFINED
        }, {

          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        }],
      }, {
        test: /\.css$/i,
        loader: "style-loader",
        options: {
          injectType: "lazyStyleTag"
        },
      }, {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          esModule: false,
        },
      }, {
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


  configs.app = {
    context: __dirname,

    // mode: "production",
    mode: process.env.APP_ENV,

    // stats: 'minimal',
    stats: 'normal',
    // stats: 'verbose',

    entry: {
      // core: {
      //     import: path.resolve(__dirname, './src/peersocial/core.js'),
      //     filename: './app/core.js'
      // },
      app: {
        import: path.resolve(__dirname, './src/peersocial/app.js'),
        filename: './app/app.js'
      }
    },
    externals: {
      fs: "commonjs fs",
      //     path: "commonjs path",
    },
    output: {
      path: path.resolve(__dirname, './build'),
      // clean: true
    },
    plugins: [
      // new CleanWebpackPlugin(),
      // new CopyWebpackPlugin({
      //     patterns: [{
      //             from: path.resolve(__dirname, './src'), 
      //             to: './' 
      //         }
      //     ]
      // }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
      new webpack.DefinePlugin(webpack_env),
      new VueLoaderPlugin(),
      // new HtmlWebpackPlugin({
      //     filename: './index.html',
      //     template: './src/index.html',
      //     inject: false,
      //     minify: false,
      //     hash: false,
      //     cache: false,
      //     showErrors: false
      // })
    ],
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        path: require.resolve("path-browserify")
      }
    },
    module: {
      rules: [{
        test: /\.vue$/,
        loader: 'vue-loader'
      }, {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(peersocial.io\/src)\/).*/,
        use: [{
          loader: "ifdef-loader",
          options: DEFINED
        }, {

          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        }],
      }, {
        test: /\.css$/i,
        loader: "style-loader",
        options: {
          injectType: "lazyStyleTag"
        },
      }, {
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          esModule: false,
        },
      }, {
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


  for (var build of process.env.PSIO_BUILD.split(",")) {
    if (configs[build])
      buildConfigs.push(configs[build]);
  }


  return buildConfigs;
};