module.exports = function( grunt ) {


    var HTTPD_NODE_PORT = 8888;


    var httpd = require( 'httpd-node' );
    var fs = require( 'fs-extra' );


    httpd.environ( 'root' , __dirname );


    var Main = [ 'src/main.js' ];


    var Includes = [
        'src/external/mojo-0.1.5.min.js',
        'src/polyfills/performance.js',
        'src/polyfills/requestAnimationFrame.js'
    ];


    var Imports = {
        Constants: 'src/imports/constants.js',
        Shared: 'src/imports/shared.js',
        BufferSource: 'src/imports/buffersource.js',
        Constructor: 'src/imports/constructor.js',
        Static: 'src/imports/static.js',
        Prototype: 'src/imports/prototype.js'
    };


    var Build = Includes.concat( Main );


    grunt.initConfig({

        pkg: grunt.file.readJSON( 'package.json' ),

        'git-describe': {
            'options': {
                prop: 'git-version'
            },
            dist : {}
        },

        jshint: {
            all: [ 'Gruntfile.js' , 'src/**/*.js' , '!src/external/*' , '!src/polyfills/*' ]
        },

        clean: {
            build: [ '<%= pkg.name %>-*.js' , 'live' ],
            tmp: [ 'tmp' ]
        },

        replace: {
            debug: {
                options: {
                    patterns: [{
                        match: /<\!(\-){2}\s\[BUILD\]\s(\-){2}>/,
                        replacement: '<script src=\"../<%= BUILD %>\"></script>'
                    }]
                },
                files: [{
                    src: 'live/index.html',
                    dest: 'live/index.html'
                }]
            },
            prod: {
                options: {
                    patterns: [
                        {
                            match: /(\"version\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"version\": \"<%= pkg.version %>\"'
                        },
                        {
                            match: /(\"main\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"main\": \"<%= BUILD %>\"'
                        }
                    ]
                },
                files: [
                    {
                        src: 'package.json',
                        dest: 'package.json'
                    },
                    {
                        src: 'bower.json',
                        dest: 'bower.json'
                    }
                ]
            }
        },

        watch: {
            debug: {
                files: [ 'Gruntfile.js' , 'src/**' , 'test/**' ],
                tasks: [ '_debug' ]
            },
            debugProd: {
                files: [ 'Gruntfile.js' , 'src/**' , 'test/**' ],
                tasks: [ '_debugProd' ]
            }
        },

        concat: {
            imports: {
                src: Build,
                dest: '<%= BUILD_TEMP %>'
            },
            dev: {
                options: {
                    banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n\n'
                },
                src: '<%= BUILD_TEMP %>',
                dest: '<%= BUILD %>'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            release: {
                files: {
                    '<%= BUILD %>' : '<%= BUILD_TEMP %>'
                }
            }
        }
    });


    [
        'grunt-contrib-jshint',
        'grunt-contrib-clean',
        'grunt-git-describe',
        'grunt-replace',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-watch'
    ]
    .forEach( grunt.loadNpmTasks );


    grunt.registerTask( 'defineBuildSrc' , function() {

        var name = grunt.config.get( 'pkg.name' );
        var version = grunt.config.get( 'pkg.version' );
        var type = process.argv[2] || '';
        var src = name + '-' + version;
        var ext = '.js';

        if (!type || (/debugProd/).test( type )) {
            ext = '.min.js';
        }

        grunt.config.set( 'BUILD' , ( src + ext ));
        grunt.config.set( 'BUILD_TEMP' , ( 'tmp/' + name + '.js' ));
    });


    grunt.registerTask( 'imports' , function() {

        var tempPath = 'tmp/' + grunt.config.get( 'pkg.name' ) + '.js';
        var temp = fs.readFileSync( tempPath , 'utf-8' );

        var re_line = /(\/{2})([^a-z,A-Z,0-9,\~]*)\@IMPORT+.*/;
        var re_key = /.*\:+(\W*)/;
        var match, safe = 0;

        while (match !== null && safe < 100) {
            match = re_line.exec( temp );
            if (match) {
                temp = replaceImport( temp , match[0] );
            }
            safe++;
        }

        fs.writeFileSync( tempPath , temp );

        function replaceImport( temp , line ) {
            var key = (line || '').replace( re_key , '' );
            var src = Imports[key];
            var text = '';
            if (src && fs.existsSync( src )) {
                text = fs.readFileSync( src , 'utf-8' );
            }
            return temp.replace( re_line , text );
        }
    });


    grunt.registerTask( 'createTemp' , function() {
        fs.ensureDirSync( 'tmp/' );
    });


    grunt.registerTask( 'startServer' , function() {
        var server = new httpd({ port : HTTPD_NODE_PORT });
        server.setHttpDir( 'default' , '/' );
        server.start();
    });


    grunt.registerTask( 'createLive' , function() {
        var src = __dirname + '/test';
        var dest = __dirname + '/live';
        fs.copySync( src , dest );
    });


    grunt.registerTask( 'createHash' , function() {

        grunt.task.requires( 'git-describe' );

        var rev = grunt.config.get( 'git-version' );
        var matches = rev.match( /(\-{0,1})+([A-Za-z0-9]{7})+(\-{0,1})/ );

        var hash = matches
            .filter(function( match ) {
                return match.length === 7;
            })
            .pop();

        if (matches && matches.length > 1) {
            grunt.config.set( 'git-hash' , hash );
        }
        else{
            grunt.config.set( 'git-hash' , rev );
        }
    });


    grunt.registerTask( 'always' , [
        'jshint',
        'defineBuildSrc',
        'clean:build',
        'git-describe',
        'createHash',
        'createTemp',
        'concat:imports',
        'imports'
    ]);


    grunt.registerTask( 'default' , [
        'always',
        'replace:prod',
        'uglify',
        'clean:tmp'
    ]);


    grunt.registerTask( 'dev' , [
        'always',
        'concat:dev',
        'clean:tmp'
    ]);


    grunt.registerTask( '_debug' , [
        'always',
        'concat:dev',
        'createLive',
        'replace:debug',
        'clean:tmp'
    ]);

    grunt.registerTask( 'debug' , [
        'startServer',
        '_debug',
        'watch:debug'
    ]);

    grunt.registerTask( '_debugProd' , [
        'always',
        'uglify',
        'createLive',
        'replace:debug',
        'clean:tmp'
    ]);

    grunt.registerTask( 'debugProd' , [
        'startServer',
        '_debugProd',
        'watch:debugProd'
    ]);
};






















