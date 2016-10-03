module.exports = function ( grunt ) {

	grunt.config.set( 'jsdoc', {
		dist: {
			src: ['src/*.js', 'src/**/*.js'],
			options: {
				destination: 'docs'
			}
		},
		typescript: {
			src: ['src/*.js', 'src/**/*.js', 'node_modules/hue-colors/dist/hue-colors.js'],
			options: {
				destination: 'docs',
				template: 'node_modules/tsd-jsdoc'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-jsdoc' );

};
