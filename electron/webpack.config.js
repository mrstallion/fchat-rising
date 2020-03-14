const path = require('path');
const fs = require('fs');
const ForkTsCheckerWebpackPlugin = require('@f-list/fork-ts-checker-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const vueTransformer = require('@f-list/vue-ts/transform').default;

const mainConfig = {
    entry: [path.join(__dirname, 'main.ts'), path.join(__dirname, 'package.json')],
    output: {
        path: __dirname + '/app',
        filename: 'main.js'
    },
    context: __dirname,
    target: 'electron-main',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    configFile: __dirname + '/tsconfig-main.json',
                    transpileOnly: true
                }
            },
            {test: path.join(__dirname, 'package.json'), loader: 'file-loader?name=package.json', type: 'javascript/auto'},
            {test: /\.(png|html)$/, loader: 'file-loader?name=[name].[ext]'}
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            async: false,
            tslint: path.join(__dirname, '../tslint.json'),
            tsconfig: './tsconfig-main.json'
        })
    ],
    resolve: {
        extensions: ['.ts', '.js']
    }
}, rendererConfig = {
    entry: {
        chat: [path.join(__dirname, 'chat.ts'), path.join(__dirname, 'index.html')],
        window: [path.join(__dirname, 'window.ts'), path.join(__dirname, 'window.html'), path.join(__dirname, 'build', 'tray@2x.png')]
    },
    output: {
        path: __dirname + '/app',
        filename: '[name].js'
    },
    context: __dirname,
    target: 'electron-renderer',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    configFile: __dirname + '/tsconfig-renderer.json',
                    transpileOnly: true,
                    getCustomTransformers: () => ({before: [vueTransformer]})
                }
            },
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.(woff2?)$/, loader: 'file-loader'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.(wav|mp3|ogg)$/, loader: 'file-loader?name=sounds/[name].[ext]'},
            {test: /\.(png|html)$/, loader: 'file-loader?name=[name].[ext]'},
            {test: /\.vue\.scss/, loader: ['vue-style-loader','css-loader','sass-loader']},
            {test: /\.vue\.css/, loader: ['vue-style-loader','css-loader']},
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            async: false,
            tslint: path.join(__dirname, '../tslint.json'),
            tsconfig: './tsconfig-renderer.json',
            vue: true
        }),
        new VueLoaderPlugin()
    ],
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.css'],
        alias: {qs: 'querystring'}
    },
    optimization: {
        splitChunks: {chunks: 'all', minChunks: 2, name: 'common'}
    }
};

module.exports = function(mode) {
    const themesDir = path.join(__dirname, '../scss/themes/chat');
    const themes = fs.readdirSync(themesDir);
    for(const theme of themes) {
        if(!theme.endsWith('.scss')) continue;
        const absPath = path.join(themesDir, theme);
        rendererConfig.entry.chat.push(absPath);
        rendererConfig.module.rules.unshift({test: absPath, loader: ['file-loader?name=themes/[name].css', 'extract-loader', 'css-loader', 'sass-loader']});
    }
    const faPath = path.join(themesDir, '../../fa.scss');
    rendererConfig.entry.chat.push(faPath);
    rendererConfig.module.rules.unshift({test: faPath, loader: ['file-loader?name=fa.css', 'extract-loader', 'css-loader', 'sass-loader']});
    if(mode === 'production') {
        process.env.NODE_ENV = 'production';
        mainConfig.devtool = rendererConfig.devtool = 'source-map';
        rendererConfig.plugins.push(new OptimizeCssAssetsPlugin());
    } else {
        mainConfig.devtool = rendererConfig.devtool = 'none';
    }
    return [mainConfig, rendererConfig];
};