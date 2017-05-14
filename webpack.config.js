/* global __dirname:true */

module.exports = {
  entry: {
    options: "./src/options/options.js",
    popup: "./src/popup/popup.js",
    vendor: ["jquery"]
  },
  output: {
    filename: "[name]/index.js",
    path: `${__dirname}/dist`
  },
  module: {
    rules: [{
      test: require.resolve("jquery"),
      use: [{
        loader: "expose-loader",
        options: "jQuery"
      }]
    }]
  }
};
