const path = require("path");

const { merge } = require("webpack-merge");
const webpackCommon = require("./common.config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DefinePlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = merge(webpackCommon, {
  mode: "production",
  bail: true,
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name]-[contenthash].min.js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: "body",
      filename: "index.html",
      template: path.resolve(__dirname, "../static/index.html"),
      favicon: path.resolve(__dirname, "../static/favicon.ico"),
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-[contenthash].min.css",
    }),
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
  ],
});
