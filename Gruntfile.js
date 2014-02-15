module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
			all: {
				options: {
					cleancss: true
				},
				files: {
					"css/options.css": ["less/options.less"],
					"css/popup.css": ["less/popup.less"]
				}
			}
		},

		jshint: {
			options: {
				eqeqeq: false,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			},
			all: [
				'js/e.js',
				'js/locale.js',
				'js/main.js',
				'js/update.js',
				'js/popup.js',
				'js/options.js'
			]
		},
		
		copy: {
			chrome: {
				expand: true,
				src: [
					'js/**',
					'css/**',
					'icon/**',
					'_locales/**',
					'options.html',
					'popup.html',
					'manifest.json'
				],
				dest: 'build/chrome/'
			},
			opera: {
				expand: true,
				src: [
					'js/**',
					'css/**',
					'icon/**',
					'_locales/**',
					'options.html',
					'popup.html',
					'manifest.json'
				],
				dest: 'build/opera/'
			}
		},
		
		preprocess: {
			options: {
				inline: true,
				context: {
					CONFIG_DEBUG: process.argv[2] == 'debug' ? true : false,
					CONFIG_VERSION: '<%= pkg.version %>'
				}
			},
			opera: {
				src : ['build/opera/*.html'],
				options: {
					context: {
						CONFIG_PLATFORM_OPERA: true,
						CONFIG_LOCALVERSION: "opera"
					}
				}
			},
			chrome: {
				src : ['build/chrome/*.html'],
				options: {
					context: {
						CONFIG_PLATFORM_CHROME: true,
						CONFIG_LOCALVERSION: "chrome"
					}
				}
			}
		},
		
		clean: {
			folders: [
				"build/opera",
				"build/chrome"
			],
			all: [
				"build/*"
			]
		},
		
		compress: {
			options: {
				mode: 'zip'
			},
			opera: {
				options: {
					archive: './build/stopsocial-opera.zip',
				},
				files: [{
						src: './build/opera/**'
				}]
			},
			chrome: {
				options: {
					archive: './build/stopsocial-chrome.zip',
				},
				files: [{
						src: './build/chrome/**'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-preprocess');
	
	grunt.registerTask('default', [
		'less', 
		'jshint', 
		'copy:chrome', 
		'copy:opera',
		'preprocess:chrome',
		'preprocess:opera',
		'compress:opera',
		'compress:chrome',
		'clean:folders'
	]);
	
	grunt.registerTask('debug', [
		'less',
		'jshint', 
		'copy:chrome', 
		'copy:opera',
		'preprocess:chrome',
		'preprocess:opera',
		'compress:opera',
		'compress:chrome'
	]);
	
	grunt.registerTask('cleanup', [
		'clean'
	]);
};