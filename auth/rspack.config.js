const rspack = require('@rspack/core');
const refreshPlugin = require('@rspack/plugin-react-refresh');
const isDev = process.env.NODE_ENV === 'development';
const path = require('path');

const printCompilationMessage = require('./compilation.config.js');

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: './src/index.js',
  },
  devServer: {
    port: 8081, // remote must be 8081
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src')],
    onListening(devServer) {
      const port = devServer.server.address().port;
      printCompilationMessage('compiling', port);

      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
        setImmediate(() => {
          if (stats.hasErrors()) {
            printCompilationMessage('failure', port);
          } else {
            printCompilationMessage('success', port);
          }
        });
      });
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      { test: /\.svg$/, type: 'asset' },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'ecmascript', jsx: true },
                transform: {
                  react: { runtime: 'automatic', refresh: isDev },
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.container.ModuleFederationPlugin({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: {
        './Login': './src/Components/Login.jsx', // 👈 expose Login
        "./Signup":"./src/Components/Signup.jsx",
        
      },
      shared: {
        // react: { singleton: true, eager: true },
        // 'react-dom': { singleton: true, eager: true },
  react: { singleton: true, requiredVersion: false },
    "react-dom": { singleton: true, requiredVersion: false },
    "react-router-dom": { singleton: true, requiredVersion: false },
      },
    }),
    new rspack.HtmlRspackPlugin({ template: './src/index.html' }),
    isDev ? new refreshPlugin() : null,
  ].filter(Boolean),
};
