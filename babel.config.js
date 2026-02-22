module.exports = function (api) {
    api.cache(true);

    const isProd = process.env.NODE_ENV === 'production';
    const plugins = [];

    if (isProd) {
        plugins.push('transform-remove-console');
    }

    return {
        presets: ['babel-preset-expo'],
        plugins: plugins,
    };
};
