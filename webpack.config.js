module.exports = {
	devtool: 'source-map',
	entry: './src/index.js',
	output: {
		path: 'dist',
		filename: 'lightogram.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				include: 'node_modules/hue-colors',
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