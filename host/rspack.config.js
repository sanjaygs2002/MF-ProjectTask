const rspack = require('@rspack/core');
const refreshPlugin = require('@rspack/plugin-react-refresh');
const isDev = process.env.NODE_ENV === 'development';
const path = require('path');

const printCompilationMessage = require('./compilation.config.js');

module.exports = {
  context: __dirname,
  entry: { main: './src/index.js' },
  devServer: {
    port: 8080, // host runs on 8080
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src')],
    onListening(devServer) {
      const port = devServer.server.address().port;
      printCompilationMessage('compiling', port);
      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
        setImmediate(() => {
          if (stats.hasErrors()) printCompilationMessage('failure', port);
          else printCompilationMessage('success', port);
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
      name: 'host',
      remotes: {
        auth: 'auth@http://localhost:8081/remoteEntry.js', // 👈 FIXED: use remotes
        shared: 'shared@http://localhost:8082/remoteEntry.js',
        product:'product@http://localhost:8083/remoteEntry.js',
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
