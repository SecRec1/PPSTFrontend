const path = require("path");

module.exports = {
  entry: {
    app: ["./src/bootstrap.js"],
  },
  resolve: {
    extensions: [".js", ".scss"],
    modules: ["node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "static/assets/images/[name][hash:8][ext]",
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      maxSize: 250000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "-",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
};
