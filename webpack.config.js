const path = require("path");
const webpack = require("webpack");
var copyWebpackPlugin = require("copy-webpack-plugin");
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {
   const isDevBuild = !(env && env.prod);

   return [
      {
         entry: "./src/index.js",
         mode: "development",
         output: {
            filename: "widget.js",
            path: path.resolve(__dirname, 'dist')
         },
         devServer: {
            port: 3000,
            watchContentBase: true,
         },
         plugins: [new copyWebpackPlugin([{ from: 'demo/' }]), new Dotenv()],
         module: {
            rules: [
               {
                  test: /\.(js|jsx)$/,
                  exclude: /node_modules/,
                  use: {
                     loader: "babel-loader",
                  },
               },
               {
                  test: /\.css$/i,
                  use: ["style-loader", "css-loader"],
               },
               {
                  test: /\.scss$/,
                  use: ["style-loader", "css-loader", "sass-loader"],
               },
            ],
         },
         optimization: {
            minimizer: [new UglifyJsPlugin()],
          },
      },
   ];
};
