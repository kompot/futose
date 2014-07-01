module.exports = {
  entry: "./assets/js/react/app.js",
  output: {
    path: __dirname,
    filename: "./public/js/bundle.js"
  },
  module: {
    loaders: [
//      { test: /\.css$/, loader: "style!css" },
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  }
};
