const {
    addWebpackResolve,
    override,
    overrideDevServer
} = require('customize-cra');

const path = require('path');

module.exports = {
    webpack: override(
        (config) => {
            if (!config.resolve.fallback) {
                config.resolve.fallback = {};
            }

            config.resolve.fallback = {
                ...config.resolve.fallback,
                'buffer': false,
                'stream': false,
                'crypto': require.resolve('crypto-browserify')
            };

            if (!config.resolve.alias) {
                config.resolve.alias = {};
            }

            config.resolve.alias = {
                ...config.resolve.alias,
                '@classes': path.resolve(__dirname, 'src/classes/'),
                '@containers': path.resolve(__dirname, 'src/container/'),
                '@context': path.resolve(__dirname, 'src/context/'),
                '@factories': path.resolve(__dirname, 'src/factories/'),
                '@reducers': path.resolve(__dirname, 'src/reducers/'),
            };

            config.devServer = {
                ...config.devServer,
                clientLogLevel: 'error'
            };

            return config;
        }
    ),
    devServer: overrideDevServer()
};
