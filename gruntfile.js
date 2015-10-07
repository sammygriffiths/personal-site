module.exports = function(grunt) {

    var configFile = grunt.file.readJSON('config.json');

    var pkg = grunt.file.readJSON('package.json');

    var environment = 'development';
    var serverDir = 'src/assets/';
    var assetsDir = 'web/assets/';

    grunt.file.isDir(assetsDir) || (grunt.verbose.write('"'+assetsDir+'" does not exist... Creating...') && grunt.file.mkdir(assetsDir));
    grunt.file.isDir(serverDir) || (grunt.fail.fatal('\''+serverDir+'\' does not exist.\nAre you defintely connected to the server?'));

    var config = configFile[environment] || grunt.fail.fatal('Unable to load config for environment: \''+environment+'\' from config.json');


    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        assetsDir: assetsDir,
        jshint: {
            files: ['src/assets/js/*.js'],
        },
        scsslint: {
            allFiles: [
                'src/assets/scss/**/*.scss',
            ],
            options: {
                config: '.scss-lint.yml',
            },
        },
        sass: {
            dev:{
                files: {
                    '<%= assetsDir %>css/style.css': 'src/assets/scss/style.scss'
                },
            }
        },
        replace: {
            sass: {
                options: {
                    patterns: [
                        {   //Creates sass variables from entrys in the config object. Syntax: {{NAME}}
                            match: /\{{2}([\w\d]*?)\}{2}(?!\})/g,
                            replacement: function(match, group1){
                                return config[group1];
                            }
                        },{ //Creates sass strings from entrys in the config object. Syntax: {{{NAME}}}
                            match: /\{{3}([\w\d]*?)\}{3}/g,
                            replacement: function(match, group1){
                                return "\'"+config[group1]+"\'";
                            }
                        },{ //Creates sass maps from an object in the config.json file. Syntax: {{[NAME]}}
                            match: /\{{2}\[([\w\d]*?)\]\}{2}(?!})(?:\((.*?)\))*/g,
                            replacement: function(match, group1, group2){
                                var replacement = "$"+group1+":(\n";
                                if (typeof group2 === 'undefined'){
                                    group2 = '';
                                }
                                for (var name in configFile[group1]) {
                                    if (configFile[group1].hasOwnProperty(name)) {
                                        replacement += "\t"+name+": "+configFile[group1][name]+group2+",\n";
                                    }
                                }
                                return replacement+");\n";
                            }
                        }
                    ]
                },
                files: [{
                    src: ['src/assets/scss/config/settings.scss.grunt'], 
                    dest: 'src/assets/scss/config/_settings.scss'
                }]
            },
            js: {
                options: {
                    patterns: [
                        {   //Creates js variables from entrys in the config object. Syntax: {{NAME}}
                            match: /\{{2}([\w\d]*?)\}{2}(?!\})/g,
                            replacement: function(match, group1){
                                return config[group1];
                            }
                        },{ //Creates js strings from entrys in the config object. Syntax: {{{NAME}}}
                            match: /\{{3}([\w\d]*?)\}{3}/g,
                            replacement: function(match, group1){
                                return "\""+config[group1]+"\"";
                            }
                        },{ //Creates js objects from an object in the config.json file. Syntax: {{[NAME]}}
                            match: /\{{2}\[([\w\d]*?)\]\}{2}(?!})/g,
                            replacement: function(match, group1){
                                var replacement = "var "+group1+" = {\n";
                                for (var name in configFile[group1]) {
                                    if (configFile[group1].hasOwnProperty(name)) {
                                        replacement += "\t"+name+": "+configFile[group1][name]+",\n";
                                    }
                                }
                                return replacement+"};\n";
                            }
                        }
                    ]
                },
                files: [{
                    src: ['src/assets/js/main.js.grunt'], 
                    dest: 'src/assets/js/main.js'
                }]
            }
        },
        copy: {
            js:{
                // copy:js is only used in the watch task
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/',
                        src: ['js/**/*'],
                        dest: '<%= assetsDir %>',
                        filter: 'isFile'
                    }
                ]
            },
            dev:{
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/',
                        src: ['fonts/**/*', 'img/**/*'],
                        dest: '<%= assetsDir %>'
                    }
                ]
            }
        },
        watch: {
            config:{
                files: ['config.json'],
                tasks: ['replace:sass','replace:js'],
            },
            sassReplace:{
                files: ['src/assets/scss/**/*.grunt'],
                tasks: ['replace:sass'],
            },
            sass:{
                files: ['src/assets/scss/style.scss', 'src/assets/scss/**/*.scss'],
                tasks: ['sass:dev'],
            },
            // jsReplace:{
            //     files: ['src/assets/js/*.grunt'],
            //     tasks: ['replace:js'],
            // },
            // js:{
            //     files: ['src/assets/js/**/*'],
            //     tasks: ['copy:js'],
            // },
        },
    });

    // Load plugins.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-scss-lint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Task(s).
    grunt.registerTask('default', [
        'scsslint',
        'replace:sass',
        'sass:dev',
        // 'jshint',
        // 'replace:js',
        'copy:dev'
    ]);

};