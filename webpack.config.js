module.exports = [
  {
    entry: './static/src/app.js',
    devtool: false,
    mode: "development",
    module: {
      rules: [{
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        ]
      }]
    },
    output: {
      filename: 'material-bundle.js',
      path: __dirname + '/static/js'
    }
  },
  {
    entry: './static/src/app.scss',
    devtool: false,
    mode: "development",
    module: {
      rules: [{
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'material-bundle.css'
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [ './node_modules' ]
            }
          }
        ]
      }]
    },
    output: {
      // This is necessary for webpack to compile. We never use ignore-style-bundle.js
      filename: 'ignore-style-bundle.js',
      path: __dirname + '/static/css'
    }
  }
];
