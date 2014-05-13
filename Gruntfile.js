module.exports = function (grunt) {

    "use strict";

    var JSFILES = {
        jQuery : [
            //jQuery
            '<%= dirs.lib %>/jquery-1.7.1.js'
        ],

        jQueryPlugins : [
            // jQuery Plugins
              '<%= dirs.lib %>/jquery.easing.1.3.js'
            , '<%= dirs.lib %>/jquery.Methods.js'
            , '<%= dirs.lib %>/jQuery.drag.js'
            , '<%= dirs.lib %>/jQuery.resizable.js'
            , '<%= dirs.lib %>/jQuery.Contextmenu.js'
            , '<%= dirs.lib %>/jQuery.Selector.js'
            , '<%= dirs.lib %>/jquery.validate-min.js'
        ],

        // tbcbase
        base : [
              '<%= dirs.src_js%>/tbc.js'
            , '<%= dirs.src_js%>/tbc.Event.js'
            , '<%= dirs.src_js%>/tbc.ClassManager.js'
        ],

        // tbc扩展库
        extend : [
              '<%= dirs.src_js%>/tbc.Accordion.js'
            , '<%= dirs.src_js%>/tbc.accordionSelector.js'
            , '<%= dirs.src_js%>/tbc.alert.js'
            , '<%= dirs.src_js%>/tbc.Button.js'
            , '<%= dirs.src_js%>/tbc.blendSelector.js'
            , '<%= dirs.src_js%>/tbc.CourseSelector.js'
            , '<%= dirs.src_js%>/tbc.organizationSelector.js'
            , '<%= dirs.src_js%>/tbc.Drag.js'
            , '<%= dirs.src_js%>/tbc.itemSelector.js'
            , '<%= dirs.src_js%>/tbc.jdc.js'
            , '<%= dirs.src_js%>/tbc.Panel.js'
            , '<%= dirs.src_js%>/tbc.History.js'
            , '<%= dirs.src_js%>/tbc.Window.js'
            , '<%= dirs.src_js%>/tbc.Pop.js'
            , '<%= dirs.src_js%>/tbc.Tabpage.js'
            , '<%= dirs.src_js%>/tbc.Tabset.js'
            , '<%= dirs.src_js%>/tbc.tree.Editor.js'
            , '<%= dirs.src_js%>/tbc.Tree.js'
            , '<%= dirs.src_js%>/tbc.tree.Online.js'
            , '<%= dirs.src_js%>/tbc.System.js'
        ],

        // 桌面
        webdesk : [
              '<%= dirs.src_js%>/tbc.DataTranslator.js'
            , '<%= dirs.src_js%>/tbc.App.js'
            , '<%= dirs.src_js%>/tbc.AppSelector.js'
            , '<%= dirs.src_js%>/tbc.AppTray.js'
            , '<%= dirs.src_js%>/tbc.Desktop.js'
            , '<%= dirs.src_js%>/tbc.desktop.Scene.js'
            , '<%= dirs.src_js%>/tbc.desktop.Wallpaper.js'
            , '<%= dirs.src_js%>/tbc.desktop.Widget.js'
            , '<%= dirs.src_js%>/tbc.DesktopManager.js'
            , '<%= dirs.src_js%>/tbc.Folder.js'
            , '<%= dirs.src_js%>/tbc.folder.Pop.js'
            , '<%= dirs.src_js%>/tbc.QuickLaunch.js'
            , '<%= dirs.src_js%>/tbc.Scene.js'
            , '<%= dirs.src_js%>/tbc.ShortcutManager.js'
            , '<%= dirs.src_js%>/tbc.Shortcuts.js'
            , '<%= dirs.src_js%>/tbc.Slide.js'
            , '<%= dirs.src_js%>/tbc.Start.js'
            , '<%= dirs.src_js%>/tbc.Task.js'
            , '<%= dirs.src_js%>/tbc.Taskbar.js'
            , '<%= dirs.src_js%>/tbc.TaskManager.js'

            // 引用方法
            // ], '<%= dirs.dest %>/desktop-min.js': [
            , '<%= dirs.src %>/js/desktop.compatibleForOld.js'
            , '<%= dirs.src %>/js/dataTranslator.js'
            , '<%= dirs.src %>/js/desktop.js'
        ]
    },

    CSSFILES = {
        style : [
             '<%= dirs.src_css%>/tbc.core.css'
           , '<%= dirs.src_css%>/tbc.icons.css'
           , '<%= dirs.src_css%>/tbc.form.css'
           , '<%= dirs.src_css%>/tbc.app.css'
           , '<%= dirs.src_css%>/tbc.desktop.css'
           , '<%= dirs.src_css%>/tbc.folder.css'
           , '<%= dirs.src_css%>/tbc.window.css'
           , '<%= dirs.src_css%>/tbc.desktop.wallpaper.css'
           , '<%= dirs.src_css%>/tbc.animate.css'
        ],
        skin : [
            '<%= dirs.src%>/css/classic/skin.css'
        ]
    },
    js_base    = JSFILES.base,
    js_extend  = JSFILES.base.concat(JSFILES.jQueryPlugins).concat(JSFILES.extend),
    js_webdesk = JSFILES.jQuery.concat(js_extend).concat(JSFILES.webdesk),
    //js_webdesk = js_extend.concat(JSFILES.webdesk),
    date       = new Date(),
    TIME_STAMP = (typeof date.toLocaleString == 'function'
                  ? date.toLocaleString()
                  : date.toString()
                )
    ;

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // 目录
        dirs : {
            root    : ".",

            src     : "<%= dirs.root%>/sources",
            src_js  : "<%= dirs.src%>/js/lib",
            src_css : "<%= dirs.src%>/css/default",
            src_img : "<%= dirs.src%>/img",
            lib     : "<%= dirs.src%>/js/jQuery",

            doc     : "<%= dirs.temp%>/doc",
            test    : "<%= dirs.root%>/grunt/test",
            build   : "<%= dirs.root%>/grunt/build",

            dest    : "<%= dirs.build%>/<%= pkg.version%>",
            release : "<%= dirs.root%>/release",
            webapp  : "<%= dirs.root%>/webapp",

            temp    : "<%= dirs.root%>/grunt/temp",
            temp_js : "<%= dirs.temp%>/js",
            temp_css: "<%= dirs.temp%>/css",
            temp_img: "<%= dirs.temp%>/img"
        },

        // 编译 LESS 文件
        less: {
            compile: {
                files: {
                    '<%= dirs.src%>/less/webdesk.css': '<%= dirs.src%>/less/**/*.less'
                }
            }
        },

        clean: {
            dest: ["<%= dirs.dest %>/"],
            zip: ['<%=dirs.build %>/zip/']
        },

        command : {
            deploy: {
                type:'bat',
                cmd: 'deploy.bat',
                args: []
            },
            test: {
                type:'bat',
                cmd: 'test.bat',
                args: []
            }
        },

        // 合并JS到
        concat: {
            /*
            dist_ver : {
                src: js_webdesk,
                dest: '<%= dirs.temp_js%>/<%=pkg.name %>-<%= pkg.version%>.js'
            },

            base : {
                src: js_base,
                dest: '<%= dirs.temp_js%>/tbc.js'
            },
            */

            dist : {
                src: js_webdesk,
                dest: '<%= dirs.temp_js%>/<%=pkg.name %>.js'
            },

            extend : {
                src: js_extend,
                dest: '<%= dirs.temp_js%>/tbc-extend.js'
            }
        },

        // JS语法校验
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },
            beforeconcat: ['<%= dirs.src_js%>/tbc.Panel.js'],
            afterconcat: ['<%= dirs.temp_js%>/<%= pkg.name %>.js']
        },

        // 压缩 CSS 文件
        cssmin: {
            options: {
                //report: 'gzip'
            },
            combine: {
                files: {
                    //'<%= dirs.src_css%>/<%= pkg.name%>-<%= pkg.version%>-min.css' : CSSFILES.style,
                    '<%= dirs.src_css%>/<%= pkg.name%>-min.css' : CSSFILES.style,
                    '<%= dirs.src_css%>/<%= pkg.name%>.css'     : CSSFILES.style,
                    '<%= dirs.src%>/css/classic/skin-min.css'   : CSSFILES.skin
                }
            }
        },

        // 压缩合并 JS 文件
        uglify: {
            options: {
                //report: 'gzip',
                mangle: true, // Specify mangle: false to prevent changes to your variable and function names.
                beautify: false,
                banner: '/** \n' +
                        ' * -------------------------------------------------------------\n' +
                        ' * Copyright (c) 2013 时代光华, All rights reserved. \n' +
                        ' * http://www.21tb.com/ \n' +
                        ' *  \n' +
                        ' * @version: <%= pkg.version%> \n' +
                        ' * @author: <%= pkg.author%> \n' +
                        ' * @description: <%= pkg.description%> \n' +
                        ' * @build time: '+ TIME_STAMP + ' \n' +
                        ' * ------------------------------------------------------------- \n' +
                        ' */ \n\n'
            },
            webdesk: {
                options: {
                    sourceMap: '<%= dirs.temp_js %>/<%=pkg.name %>-map.js',
                    sourceMappingURL: '/webdesk/js/<%=pkg.name %>-map.js', // the location to find your original source
                    sourceMapRoot: "/"
                },
                files: {
                    //'<%= dirs.dest %>/libs.min.js': ['<%= dirs.lib %>/**/*.js'],

                    //'<%= dirs.temp_js %>/<%=pkg.name %>-<%= pkg.version%>-min.js': '<%= dirs.temp_js %>/<%=pkg.name %>-<%= pkg.version%>.js',
                    '<%= dirs.temp_js %>/<%=pkg.name %>-min.js': '<%= dirs.temp_js %>/<%=pkg.name %>.js'
                }
            },
            /*
            base: {
                files: {
                    '<%= dirs.temp_js %>/tbc-min.js': '<%= dirs.temp_js %>/tbc.js'
                }
            },
            */
            extend: {
                files: {
                    '<%= dirs.temp_js %>/tbc-extend-min.js': '<%= dirs.temp_js %>/tbc-extend.js'
                }
            }
        },

        // 复制文件,打包到 dest 文件夹目录下
        copyto: {
            stuff: {
                files: [
                    {cwd: "<%= dirs.temp%>/", dest: '<%=dirs.dest %>/', src: ['js/*.js']},
                    {cwd: "<%= dirs.temp%>/js/", dest: '<%=dirs.dest %>/js/lib/', src: ['tbc.js']},
                    {
                        cwd: "<%= dirs.src%>/",
                        dest: '<%=dirs.dest %>/',
                        src: [
                            'js/*.js',
                            'js/lib/*.js',
                            'js/jQuery/*.js',
                            'js/jQuery/plugins/uploadify/*.*',
                            'css/classic/**/*.*',
                            'css/default/**/*.*'
                        ]
                    },
                    {cwd: "<%= dirs.dest%>/", dest: '<%=dirs.release %>/', src: ['**/*.*']         },
                    {cwd: "<%= dirs.src%>/",  dest: '<%=dirs.release %>/', src: ['data/**/*.*']    },
                    {cwd: "<%= dirs.src%>/",  dest: '<%=dirs.release %>/', src: ['images/**/*.*']  },
                    {cwd: "<%= dirs.src%>/",  dest: '<%=dirs.release %>/', src: ['WEB-INF/**/*.*'] },
                    {cwd: "<%= dirs.src%>/",  dest: '<%=dirs.release %>/', src: ['index.html', 'html/desktopManager/*.html']     }
                ]
            },
            html: {
                files: [
                    {cwd: "<%= dirs.src%>/", dest: "<%=dirs.release %>/", src: ['index.html']},
                    {cwd: "<%= dirs.src%>/html/", dest: "<%=dirs.release %>/html/", src: ['**/*.html','**/*.json']},
                    {cwd: "<%= dirs.src%>/data/", dest: "<%=dirs.release %>/data/", src: ['**/*.html','**/*.json']}
                ]
            },
            webapp: {
                files: [
                    {cwd: "<%= dirs.release%>/", dest: '<%=dirs.webapp %>/', src: ['js/**/*.*']},
                    {cwd: "<%= dirs.release%>/", dest: '<%=dirs.webapp %>/', src: ['css/**/*.*']},
                    {cwd: "<%= dirs.release%>/", dest: '<%=dirs.webapp %>/', src: ['WEB-INF/**/*.*']},
                    {cwd: "<%= dirs.release%>/", dest: '<%=dirs.webapp %>/', src: ['index.html']}
                ]
            },
            doc: {
                files: [
                    {cwd: "<%= dirs.doc%>/",  src: ['**/*.*'], dest: '<%=dirs.dest %>/doc/'},
                    {cwd: "<%= dirs.dest%>/", src: ['doc/*.*'], dest: '<%=dirs.release %>/'}
                ]
            },
            options: {
                ignore: [
                    '<%= dirs.src%>/.svn',
                    '<%= dirs.src%>/.php',
                    '<%= dirs.src%>/.zip',
                    '<%= dirs.src%>/.txt',
                    '<%= dirs.src%>/**/*.db',
                    '<%= dirs.src%>/**/*.bat'
                ]
            }
        },

        yuidoc: {
            compile: {
                name  : '<%= pkg.name %> API Documentation',
                url   : '<%= pkg.homepage %>',
                //logo  : 'http://www.21tb.com/images/logo.png',
                version     : '<%= pkg.version %>',
                description : '<%= pkg.description %>',
                options     : {
                    paths: ['<%= dirs.src %>/js/lib/'],
                    outdir: '<%= dirs.doc %>/'
                    //linkNatives: "true",
                    //attributesEmit: "true",
                    //selleck: "true",
                }
            }
        },

		jsdoc : {
			dist : {
				src: ['<%= dirs.src_js %>/tbc.Event.js'],
				options: {
					destination: 'jsdoc'
				}
			}
		},

        // 监控 LESS 文件
        watch: {
            style: {
                files: CSSFILES.style,
                tasks: ['dev']
            },
            skin: {
                files: CSSFILES.skin,
                tasks: ['dev']
            },
            less: {
                files: ['<%= dirs.src%>/less/*.less'],
                tasks: ['less']
            },
            scripts : {
                files: js_webdesk,
                tasks: ['dev']
            },
            html: {
                files: [
                    '<%= dirs.src%>/index.html',
                    '<%= dirs.src%>/html/**/*.html',
                    '<%= dirs.src%>/html/**/*.json',
                    '<%= dirs.src%>/data/**/*.html',
                    '<%= dirs.src%>/data/**/*.json'
                ],
                tasks: ['copyto:html']
            }
        },

        zip: {
            // As well as standard grunt sytax
            webdesk : {
                cwd: "<%=dirs.release %>",

                // Files to zip together
                src: [
                    '<%=dirs.release %>/js/**/*.*',
                    '<%=dirs.release %>/css/**/*.*',
                    '<%=dirs.release %>/index.html'
                ],

                // Destination of zip file
                dest: '<%=dirs.build %>/zip/webdesk.zip'
            }
        },

        'sftp-deploy': {
            test2: {
                auth: {
                    host: '192.168.0.215',
                    port: 22,
                    authKey: 'test2'
                },
                src: '<%=dirs.build %>/zip',
                dest: '/web/eln4share/test2/webdesk/',
                //exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
                server_sep: '/'
            },
            test3: {
                auth: {
                    host: '192.168.0.215',
                    port: 22,
                    authKey: 'test3'
                },
                src: '<%=dirs.build %>/zip',
                dest: '/web/eln4share/test3/webdesk/',
                //exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
                server_sep: '/'
            }
        },

        // SSH config
        sshconfig: {
          "test2" : grunt.file.readJSON('.sshconf').test2,
          "test3" : grunt.file.readJSON('.sshconf').test3,
          "yufa"  : grunt.file.readJSON('.sshconf').yufa
        },

        sshexec: {
          test2: {
            command: ['cd /web/eln4share/test2/webdesk/ && unzip -fo webdesk.zip'],
            options: {
              config: "test2"
            }
          },
          test2_del: {
            command: ['cd /web/eln4share/test2/webdesk/ && rm -fv webdesk.zip'],
            options: {
              config: "test2"
            }
          },
          test3: {
            command: ['cd /web/eln4share/test3/webdesk/ && unzip -fo webdesk.zip'],
            options: {
              config: "test3"
            }
          },
          test3_del: {
            command: ['cd /web/eln4share/test3/webdesk/ && rm -fv webdesk.zip'],
            options: {
              config: "test3"
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-yui-compressor');
    grunt.loadNpmTasks('grunt-build-docs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-commands');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-sftp-deploy');

    grunt.registerTask('publish', ['default', 'command:deploy']);
    grunt.registerTask('default', ['clean', 'less', 'cssmin', 'concat', 'uglify', 'yuidoc', 'copyto:stuff', 'copyto:webapp']);
    grunt.registerTask('dev', ['concat','uglify','cssmin','copyto:stuff']);
    grunt.registerTask('doc', ['yuidoc','jsdoc']);
    grunt.registerTask('jsmin', ['concat','uglify']);
    grunt.registerTask('test2', ['clean:zip', 'sshexec:test2_del', 'zip', 'sftp-deploy:test2', 'sshexec:test2']);
    grunt.registerTask('test3', ['clean:zip', 'sshexec:test3_del', 'zip', 'sftp-deploy:test3', 'sshexec:test3']);
};
