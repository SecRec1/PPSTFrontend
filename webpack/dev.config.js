const path = require('path');

const { merge } = require("webpack-merge");
const webpackCommon = require("./common.config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DefinePlugin } = require("webpack");

const proxyRules = [
  {
    context: ['/api'],  // Use context to match specific routes
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
  // Add more proxy rules as needed
];

module.exports = merge(webpackCommon, {
  mode: "development",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      filename: "index.html",
      template: path.resolve(__dirname, "../static/index.html"),
      favicon: path.resolve(__dirname, "../static/favicon.ico"),
    }),
  ],
  devServer: {
    host: "localhost",
    port: 3000,
    static: path.resolve(__dirname, "../static"),
    compress: true,
    hot: true,
    historyApiFallback: true,
    proxy: proxyRules,
  },
});
