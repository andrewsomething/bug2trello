const webpack = require("webpack");

module.exports = {
  entry: {
    options: "./options/settings.js",
    popup: "./popup/popup.js",
    vendor: ["jquery"]
  },
  output: {
    filename: "[name]/index.js",
    path: `${__dirname}/addon`
  },
  module: {
    rules: [{
      test: require.resolve("jquery"),
      use: [{
        loader: "expose-loader",
        options: "jQuery"
      }, {
        loader: "expose-loader",
        options: "$"
      }]
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: "vendor", filename: "vendor/index.js" })
  ]
};
