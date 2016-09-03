module.exports = {
	devtool: 'source-map',
	entry: './src/index.js',
	output: {
		path: 'dist',
		filename: 'lightogram.js',
		libraryTarget: 'umd'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json']
	}
};
