/**
 * 桌面管理器，用于对桌面进行增删改等操作
 *
 * @class tbc.DesktopManager
 * @constructor
 * @param {object} settings 配置信息
 * @copyright 时代光华(2013)
 * @author mail@luozhihua.com
 */
/** global desktop= true; **/
;
(function(tbc, $, URLS) {

    "use strict";

    tbc.DesktopManager = function(settings) {

        tbc.self(this, arguments).extend({

            /**
             * 配置
             *
             * @private
             * @property options
             * @type Object
             */
            options: tbc.extend({}, settings),

            /**
             * 初始化
             *
             * @private
             * @method init
             * @chainable
             */
            init: function() {

                this.checkWidgetAppExist();
                return this;
            },

            /**
             * 检测公司是否有widget应用
             * @return {[type]} [description]
             */
            checkWidgetAppExist: function() {
                var self = this,
                    appCode = "os_wgt_manage",
                    url = tbc.formatString(URLS.checkAppCodeIsExist||'', appCode);

                $.ajax({
                    url      : url,
                    dataType : "json",
                    error    : function() {
                        self.widgetAppExist = false;
                    },
                    success : function(json) {
                        self.widgetAppExist = json.isExist ? true : false;
                    }
                });
            },

            /**
             * 保存桌面
             *
             * @public
             * @async
             * @method saveDesktop
             * @param {Object} win 编辑器窗口(instance Of tbc.Window)
             * @param {String} url 保存地址
             * @param {Function} callback 保存成功的回调函数
             * @example
                desktop.manager.saveDesktop(win, function(json) {
                    console.log('保存成功');
                });
             */
            saveDesktop: function(win, url, callback) {

                var self = this,
                    verify,
                    type = win.ui.find(".add-scene-type-select").val(),
                    opt = {
                        title: "",
                        icon: "",
                        appCode: null,
                        url: "",
                        closable: true,
                        id: win.editId,
                        active: true,
                        type: type,
                        own: true
                    },
                    ui = win.ui,
                    nodes = {};

                switch (type) {
                    case "DESKTOP":
                        nodes.title = ui.find(".add-scene-normal-title");
                        opt.title   = nodes.title.val();
                        break;

                    case "APPLICATION":
                        nodes.title   = ui.find(".add-scene-app-title");
                        nodes.icon    = ui.find(".add-scene-app-icon");
                        nodes.url     = ui.find(".add-scene-app-url");
                        nodes.appCode = ui.find(".add-scene-app-appCode");
                        nodes.alluser = ui.find(".add-scene-app-alluser:checked");

                        opt.isAdminApp = nodes.appCode.attr('data-approle');
                        opt.title      = nodes.title.val();
                        opt.icon       = nodes.icon.val();
                        opt.url        = nodes.url.val();
                        opt.appCode    = nodes.appCode.val();
                        opt.alluser    = nodes.alluser.val();
                        break;

                    case "LINK":
                        nodes.title = ui.find(".add-scene-site-title");
                        nodes.url   = ui.find(".add-scene-site-url");
                        nodes.alluser = ui.find(".add-scene-site-alluser:checked");

                        opt.title = nodes.title.val();
                        opt.url   = nodes.url.val();
                        opt.alluser = nodes.alluser.val();
                        break;

                    case "WIDGETS":
                        nodes.title = ui.find(".add-scene-widget-title");
                        nodes.icon = ui.find(".add-scene-widget-icon");
                        nodes.appCode = ui.find(".add-scene-widget-appCode");
                        nodes.url = ui.find(".add-scene-widget-url");
                        nodes.alluser = ui.find(".add-scene-widget-alluser:checked");
                        opt.title = nodes.title.val();
                        opt.icon = nodes.icon.val();
                        opt.appCode = nodes.appCode.val();
                        opt.url = nodes.url.val();
                        opt.alluser = nodes.alluser.val();
                        break;

                }

                verify = this.validate(type, opt, nodes);
                if (verify === true) {
                    $.ajax({
                        url  : url,
                        type : "post",
                        data : {
                            id      : opt.id,
                            type    : type,
                            title   : opt.title,
                            icon    : opt.icon,
                            originalTitle : win.sceneOptions ? (win.sceneOptions.name || win.sceneOptions.title) : null,
                            appCode : opt.appCode,
                            url     : opt.url,
                            alluser : opt.alluser
                        },
                        dataType : "json",
                        success  : function(json) {
                            if ($.isFunction(callback)) {
                                callback.call(self, json, opt);
                            }
                        }
                    });
                } else {
                    ui.find('.save-button').removeAttr('disabled');
                }
            },

            isAdminApp: function(appCode) {
                var apps = window.applicationMap,
                    k, app;
                if (appCode) {
                    for (k in apps) {
                        app = apps[k];
                        if (apps.hasOwnProperty(k) && app.appCode===appCode && app.targetUserDeskType==='ADMIN') {
                            return true;
                        }
                    }
                }
            },

            /**
             * 用于在保存桌面前，验证数据是否正确
             *
             * @public
             * @method validate
             * @param {String} type 桌面类型, 因为不同类型的桌面要使用不同的验证方式
             * @param {Array} opt 桌面配置数据列表
             * @param {Array} nodes 与配置数据对应的HTML表单控件
             * @return {Boolean} 验证通过返回true, 否则返回false
             */
            validate: function(type, opt, nodes) {
                var result, msg, len,
                    regexpDomain = /^(https?:\/\/)?([\w\d]([\w\d\-]{0,61}[\w\d])?\.)+[\w]{2,6}([\?\#\/]|$){1,}/,
                    regexpPath = /^((\.{1,2}\/)+|(\.\/)+|(\/))?([\w\d\-_\.]{1,}[\?#\/$]{1})+[^$]*/;

                // 匹配特殊字符
                function matchSpecialString(str) {
                    return str && str.match(/['"\/\\\<\>\&\!\|]/ig);
                }

                switch (type) {
                    case 'APPLICATION':
                        if (this.isAdminApp(opt.appCode) && opt.alluser) {
                            tbc.alert(i18n('v4.js.hasNoPermissionsWithApp'));
                            result = false;
                        } else if (!opt.title || !opt.appCode || !opt.url) {
                            nodes.title.siblings('.add-scene-app-selected')
                                .fadeOut(100).fadeIn(200)
                                .css({
                                    background: '#D93C33',
                                    color: '#fff'
                                })
                                .one('click', function() {
                                    $(this).css({
                                        background: '',
                                        color: ''
                                    });
                                });
                            result = false;
                        }
                        break;

                    case "LINK":

                        if (typeof opt.url !== 'string' || $.trim(opt.url).length === 0) {
                            nodes.url
                                .one('focusin', function() {
                                    $(this).siblings('.msg').html('*').css({
                                        color: ''
                                    });
                                })
                                .siblings('.msg').html(i18n('v4.js.jvldRequired')).css({
                                    color: 'red'
                                });
                            result = false;
                        } else if (!opt.url.match(regexpDomain) && !opt.url.match(regexpPath)) {
                            nodes.url
                                .one('focusin', function() {
                                    $(this).siblings('.msg').html('*').css({
                                        color: ''
                                    });
                                })
                                .siblings('.msg').html(i18n('v4.js.inputDomainUrlApp')).css({
                                    color: 'red'
                                });
                            result = false;
                        }

                    case "DESKTOP" :
                    case "LINK"    :
                        len = $.trim(opt.title).length;

                        if (typeof opt.title=='string' && matchSpecialString(opt.title)) {
                            msg = i18n('v4.js.vtpSpecialChars', '\'"/\<>&!|');
                            nodes.title
                                .one('focusin', function() {
                                    $(this).siblings('.msg').html('*').css({
                                        color: ''
                                    });
                                })
                                .siblings('.msg').html(msg).css({
                                    color: 'red'
                                });
                            result = false;
                        } else if (typeof opt.title !== 'string' || len === 0 || len > 10) {

                            msg = i18n('v4.js.charsLimit', 1, 10);

                            nodes.title
                                .one('focusin', function() {
                                    $(this).siblings('.msg').html('*').css({
                                        color: ''
                                    });
                                })
                                .siblings('.msg').html(msg).css({
                                    color: 'red'
                                });
                            result = false;
                        }
                        break;

                    case "WIDGETS":
                        if (!opt.url || !opt.appCode) {
                            tbc.alert(i18n('v4.js.selectTempOrDesk'));
                            result = false;
                        }
                        break;
                }
                return result !== false;
            },

            resizeWindow: function(win, type) {
                if (win) {

                    var w,h;

                    switch (type) {
                        case "WIDGETS":
                            w = 584;
                            h = 560;
                            break;

                        default:
                            w = 480;
                            h = 320;
                            break;
                    }

                    win.resize({width:w, height:h});
                }
            },

            selectLang: function() {
                var self = this;

                desktop.loadLanguageList(function() {
                    self.openLangWin();
                });
            },

            openLangWin: function() {
                var self = this,
                    link = $('.s_change_lang'),
                    offset = link.offset(),
                    html = this.getLanguageList();

                if (this.langWin) {
                    this.langWin.close();
                    return this;
                }

                this.langWin = new tbc.Panel({
                    name : i18n('v4.js.switchLang'),
                    icon : 'icon-i18n',
                    top  : offset.top + link.height(),
                    left : offset.left - 20,
                    width    : 120,
                    height   : 180,
                    //closable : false,
                    className: 'layerMode transWin no-title'
                })
                .addEvent({
                    'close': function() {
                        self.langWin = null;
                    }
                })
                .show();

                this.langWin.html(html);

                this.langWin.ui.on('click', 'li[data-lang]', function() {
                    var lang = this.getAttribute('data-lang'),
                        url = (URLS['changeLanguage']||'').replace('{lang}', lang);

                    tbc.cookie('local_', lang, 365);

                    $.ajax({
                        url: url,
                        beforeSend: function() {
                            self.langWin.lock('loading', 0.5);
                        },
                        error: function() {
                            self.langWin.lock('loading', 'error (4)', 0.8);
                            setTimeout(function(){
                                self.langWin.lock('loading', 'error (3)', 0.8);
                            }, 1000);
                            setTimeout(function(){
                                self.langWin.lock('loading', 'error (2)', 0.8);
                            }, 2000);
                            setTimeout(function(){
                                self.langWin.lock('loading', 'error (1)', 0.8);
                            }, 3000);
                            setTimeout(function(){
                                self.langWin.lock('loading', 'error (0)', 0.8);
                            }, 4000);
                            setTimeout(function(){
                                self.langWin.unlock('loading');
                            }, 5000);
                        },
                        success: function() {
                            self.langWin.ui.on('mouseleave', null, function() {
                                self.langWin.close();
                            });

                            self.langWin.lock('loading', 'Reloading...', 0.8);
                            window.onbeforeunload = null;
                            document.location.reload();
                        }
                    });
                });
            },

            getLanguageList: function() {
                var list = desktop.languages,
                    curr = desktop.currentLang || tbc.cookie('local_') || 'zh_CN',
                    temp = '<ul class="languageList">{list}</ul>',
                    html = [],
                    self = this;

                $.each(list, function() {
                    var currCls = curr === this.locale ?
                            'class="cur"' : '';
                    html.push(['<li ', currCls, ' data-lang="', this.locale, '" data-id="', this.id, '">',
                            (currCls!=='' ?
                                '<i class="tbc-icon icon-check"></i> ' :
                                '<i class="tbc-icon"></i> '),
                            this.localeName,
                        '</li>'].join(''));
                });

                return temp.replace("{list}", html.join(''));
            },

            /**
             * 打开新增桌面的窗口
             *
             * @public
             * @method addDesktop
             */
            addDesktop: function() {

                var self = this,
                    win = this.addWin,
                    pos;

                if (win && $.isFunction(win.focus)) {
                    this.addWin.focus();
                } else {
                    pos = $('.tbc-desktop-nav').offset();
                    win = this.addWin = new tbc.Window({
                        name: i18n('v4.js.addDesktop'), //"增加桌面",
                        icon: "icon-add_small",
                        left: pos.left - 12,
                        top: pos.top + 24,
                        width: 480,
                        height: 320,
                        minWidth: 480,
                        minHeight: 320,
                        loadType: "html",
                        scrolling: false,
                        minimizable: true,
                        maximizable: false
                    })
                    .addEvent({
                        'close': function() {
                            delete self.addWin;
                        },
                        'resize': function(size) {
                            var toolsHei = this.ui.find('.add-scene-bottom-tools').outerHeight() || 0,
                                hHei = this.part.header.outerHeight() || 0,
                                tHei = this.ui.find('.add-scene-type').outerHeight() || 0,
                                ahei = 0,//this.ui.find('.assigned-for-users').outerHeight() || 0, // widget 分配所有用户
                                mhei = size.height - toolsHei - hHei - ahei - tHei - 10;
                            this.ui.find('.add-scene-type-opera:visible').eq(0).height(mhei);
                        }
                    })
                    .show();
                    //.append(this.addHtmlTemplate());

                    // 加载模板
                    $.get(URLS.addSceneTemplate, function(text) {
                        var html = _.template(text, {widgetsEnalbe:self.widgetAppExist});
                        win.append(html);
                        win.ui.find(".add-scene-type-select").trigger('change');
                    });

                    win.ui
                        .on("click", ".cancel-button", function() {
                            win.close();
                        })
                        .on("click", ".save-button", function() {
                            var saveBtn = this;
                            this.setAttribute('disabled', 'disabled');
                            self.saveDesktop(win, URLS.sceneAdd, function(json, pageData) {

                                if (json.success === 'validateFailed') {
                                    saveBtn.removeAttribute('disabled');
                                } else if (json.success) {
                                    pageData.isTem = !! pageData.alluser;
                                    pageData.id = json.data.id;

                                    if (desktop.isAdmin()) {
                                        desktop.insertScene(pageData, desktop.tabs.length-1);
                                    } else {
                                        desktop.appendScene(pageData);
                                    }
                                    win.close();
                                } else {
                                    saveBtn.removeAttribute('disabled');
                                    alert(json.message || i18n('addFailed')); //"添加失败");
                                }
                            });
                        })
                        .on("click", ".add-scene-app-selected", function(event) {
                            win.openModalDialog({width:680, height:450}, tbc.AppSelector)
                                .addEvent({
                                    close: function(selected) {
                                        var app,
                                            winui = win.ui;
                                        if (selected && selected.length !== 0) {
                                            app = selected[0];
                                            winui.find(".add-scene-app-title").val(app.applicationName);
                                            winui.find(".add-scene-app-icon").val(app.applicationIconUrl);
                                            winui.find(".add-scene-app-appCode").val(app.appCode);
                                            winui.find(".add-scene-app-appCode").attr('data-approle', app.targetUserDeskType);
                                            winui.find(".add-scene-app-url").val(app.homePageUrl);

                                            winui.find(".add-scene-app-selected-name").html(app.applicationName);
                                            winui.find(".add-scene-app-selected-icon")
                                                .css({
                                                    display: "block"
                                                })
                                                .attr('src', app.applicationIconUrl);
                                        }
                                    }
                                })
                                .show();
                        }).
                        on("change", ".add-scene-type-select", function() {
                            $(".add-scene-type-opera").hide();
                            $(".add-scene-info-" + this.value).show();

                            if (this.value === 'WIDGETS') {
                                self.loadTemplate(win);
                            }

                            self.resizeWindow(win, this.value);
                        });
                }
            },

            /**
             * 打开修改桌面的窗口
             *
             * @public
             * @method editDesktop
             * @param {instance of tbc.Scene} scene 要修改的桌面实例
             */
            editDesktop: function(scene) {

                this.editWin = this.editWin || {};

                var self = this,
                    winId = scene.options.id,
                    win = this.editWin[winId],
                    pos;

                if (win && $.isFunction(win.focus)) {
                    win.focus();
                } else {
                    pos = $('.tbc-desktop-nav').offset();
                    win = this.editWin[winId] = new tbc.Window({
                        name: i18n('editDesktop'), //"修改桌面",
                        icon: "icon-pencil",
                        left: pos.left - 12,
                        top: pos.top + 24,
                        width: 480,
                        height: 320,
                        minWidth: 480,
                        minHeight: 320,
                        loadType: "html",
                        minimizable: true,
                        maximizable: true,
                        scrolling: false
                    })
                    .addEvent({
                        'close': function() {
                            delete self.editWin[winId];
                        },
                        'resize': function(size) {
                            var toolsHei = this.ui.find('.add-scene-bottom-tools').outerHeight() || 0,
                                hHei = this.part.header.outerHeight() || 0,
                                tHei = this.ui.find('.add-scene-type').outerHeight() || 0,
                                mhei = size.height - toolsHei - hHei - tHei - 10;
                            this.ui.find('.add-scene-type-opera:visible').eq(0).height(mhei);
                        }
                    })
                    .show();

                    win.editId = winId;
                    win.sceneOptions = scene.options;

                    // 加载模板
                    $.get(URLS.editSceneTemplate, function(text) {
                        var html = _.template(text, {scene: scene.options,widgetsEnalbe:self.widgetAppExist}),
                            type = scene.options.type;
                        win.append(html);

                        if (type==='WIDGETS') {
                            self.loadTemplate(win, scene.options);
                            self.resizeWindow(win, type);
                        }
                    });

                    win.ui
                        .on("click", ".cancel-button", function() {
                            win.close();
                        })
                        .on("click", ".save-button", function() {
                            if (win.ui.find('no-changed').size() === 0) {
                                self.saveDesktop(win, URLS.sceneUpdate, function(json, pageData) {

                                    if (json.success) {
                                        scene.options.name = pageData.title;
                                        scene.options.type = pageData.type || scene.options.type;
                                        scene.options.icon = pageData.icon;
                                        scene.options.url = pageData.url;
                                        scene.options.isTem = !! pageData.alluser;
                                        scene.handle.attr('title', pageData.title);
                                        if (pageData.type.match(/^LINK|APPLICATION|WIDGETS$/)) {
                                            scene.reload();
                                        }
                                        win.close();
                                    } else {
                                        alert(json.message || i18n('v4.js.saveFailed'));
                                    }
                                });
                            } else {
                                win.close();
                            }
                        })
                        .on("click", ".add-scene-app-selected", function(event) {
                            win.openModalDialog({width:680, height:450}, tbc.AppSelector)
                                .addEvent({
                                    close: function(selected) {
                                        var app;
                                        if (selected && selected.length !== 0) {
                                            app = selected[0];
                                            win.ui.find(".add-scene-app-title").val(app.applicationName);
                                            win.ui.find(".add-scene-app-icon").val(app.applicationIconUrl);
                                            win.ui.find(".add-scene-app-appCode").val(app.appCode);
                                            win.ui.find(".add-scene-app-appCode").attr('data-approle', app.targetUserDeskType);
                                            win.ui.find(".add-scene-app-url").val(app.homePageUrl);

                                            win.ui.find(".add-scene-app-selected-name")
                                                .html(app.applicationName);

                                            win.ui.find(".add-scene-app-selected-icon")
                                                .css({
                                                    display: "block"
                                                })
                                                .attr('src', app.applicationIconUrl);
                                        }
                                    }
                                })
                                .show();
                        });
                }
            },

            loadTemplate: function(win, scene) {
                var that = this,
                    url = URLS.sceneTemplateHtml,
                    dataUrl = URLS.sceneTemplateList;

                $.ajax({
                    url: url,
                    success: function(template) {
                        $.ajax({
                            url: dataUrl,
                            dataType: 'json',
                            success: function(json) {
                                var html = that.renderTemplates(scene, template, json);
                                win.ui.find('.add-scene-info-WIDGETS').eq(0).html(html);
                                that.initTemplatesEvent(win);
                            }
                        });
                    }
                });
            },

            initTemplatesEvent: function(win) {
                win.ui.find('.template-thumb').click(function(event) {
                    var $thumb = $(this),
                        id    = $thumb.attr('data-id'),
                        url   = $thumb.attr('data-url'),
                        title = $thumb.attr('data-title');

                    win.ui.find(".add-scene-widget-url").val(url);
                    win.ui.find(".add-scene-widget-title").val(title);
                    win.ui.find(".add-scene-widget-appCode").val(id);

                    $thumb.addClass('s-disabled').
                    siblings('.s-disabled').removeClass('s-disabled');
                });
            },

            renderTemplates: function (scene, template, json) {
                var url = URLS.sceneTemplateOverview,
                    html = _.template(template, {
                        overviewUrl: url || '',
                        selectedId : scene ? scene.appCode||'' : '',
                        rows       : json
                    });
                return html;
            },

            /**
             * 生成桌面列表HTML
             * @private
             * @method sceneList
             * @param {tbc.Scene} scene 应用、文件夹或快捷方式当前所在的桌面
             * @returns {String} HTML代码片段
             */
            sceneList: function(scene) {
                var scenes = desktop.tabs,
                    htmlTpl = '<div><label style="color:{{color}};"><input {{disabled}} type="radio" name="move_to_scene" data-index="{{index}}" /> {{title}}</label></div>',
                    html = ['<div style="padding:2em;">'];

                html.push('<div style="padding:12px 0; font-weight:bold; border-bottom:1px solid #eee;">'+i18n('v4.js.deskNotNullTips') +'</div>');
                $.each(scenes, function(i) {
                    var disabled, h, color,
                        current = scene === this,
                        type = (this.options.type || '').toLowerCase(),
                        title = i18n('v4.js.deskIndexList', i+1); //'第' + (i + 1) + '屏';

                    title += this.options.title ? "：" + this.options.title : '';
                    title += current ?
                        ' - (<span class="text-red">'+ i18n('v4.js.deletingDesk') +'</span>)' :
                        ((type === 'link' || type==='application' || type==='admin') ? ' - ('+ i18n('v4.js.notSupportedApp') +')' : '');

                    disabled = current || type === 'link' || type==='application' || type==='admin';
                    color = disabled ? '#aaa' : '#333';
                    disabled = disabled ? ' disabled="disabled" ' : '';

                    h = htmlTpl.replace(/\{\{title\}\}/g, title)
                        .replace(/\{\{index\}\}/g, i)
                        .replace(/\{\{disabled\}\}/g, disabled)
                        .replace(/\{\{color\}\}/g, color);
                    html.push(h);
                });
                html.push('</div>');

                return html.join('');
            },

            /**
             * 转移应用和文件夹
             *
             * @public
             * @method moveAppFolder
             * @param {tbc.Scene} scene 应用、文件夹或快捷方式当前所在的桌面
             * @param {Array} apps 应用、文件夹或快捷方式的实例列表
             * @param {Function} callback 回调方法
             */
            moveAppFolder: function(scene, apps, callback) {

                var html = this.sceneList(scene),
                    SELF = this;

                var buttons = {},
                    title1 = i18n('v4.js.removeAppAnddelDesk'),
                    title2 = i18n('v4.js.cancel');

                buttons[title1] = function() {
                    var index = this.container.find('input:checked').attr('data-index'),
                        target = desktop.tabs[index],
                        ids = [];
                    if (target) {

                        // 如果要删除的桌面已经加载，则直接在前端转移应用和文件夹
                        if (scene.loaded) {
                            $.each(apps, function() {
                                ids.push(this.options.userDeskItemId);
                                this.moveToScene(target, false);
                            });
                            tbc.Shortcut.moveToScene(target.options.id, ids.join(','));
                            SELF.deleteDesktopRemote(scene);
                        } else {
                            SELF.deleteDesktopRemote(scene, target);
                        }

                        // 回调方法
                        if ($.isFunction(callback)) {
                            callback();
                        }

                        this.close();
                    }
                };

                buttons[title2] = function() {
                    this.close();
                }

                tbc.dialog({
                    name: i18n('v4.js.delDesktop'), //'删除桌面',
                    html: html,
                    width: 400,
                    height: 400,
                    buttons: buttons
                });
            },

            contentTransfer: function(scene, $apps) {
                var apps = [];
                $apps.each(function() {
                    apps.push(tbc.getTaskByElement(this, false));
                });
                this.moveAppFolder(scene, apps);
            },

            /**
             * 从服务器删除桌面
             * @method deleteDesktopRemote
             * @param  {String} id       要删除的桌面ID
             * @param  {String} takeover 接收被删除桌面内的应用和文件夹的新桌面ID
             * @async
             */
            deleteDesktopRemote: function(scene, takeover) {

                if (!scene) { return; }

                var data = {
                    deskId: scene.options.id
                };

                if (takeover) {
                    data.deskId_new = takeover.options.id;
                }

                $.ajax({
                    url      : URLS.sceneDelete,
                    type     : 'post',
                    data     : data,
                    dataType : 'json',
                    success  : function(json) {
                        if (json && json.success) {
                            scene.close();
                            desktop.arrayTab(function() {
                                var opt = this.options;
                                return (opt.type === 'ADMIN' || opt.visable);
                            });

                            // 如果有接管被删除桌面内容的新桌面
                            if (takeover) {
                                setTimeout(function(){
                                    takeover.reload();
                                }, 800);
                            }

                        } else {
                            tbc.alert(json.message);
                        }
                    }
                });
            },

            /**
             * 删除桌面
             * @public
             * @method deleteDesktop
             * @param {instance of tbc.Scene} scene 要删除的桌面实例
             */
            deleteDesktop: function(scene) {
                var desktop = window.desktop,
                    shortcuts = scene.container.children('.tbc-shortcut[tbc]'),
                    isScene = (scene.options.type==='LINK' ||
                                scene.options.type==='APPLICATION' ||
                                scene.options.type==='DESKTOP');

                // 转移应用和文件夹
                if (isScene && (!scene.loaded || shortcuts.size() > 0)) {
                    this.contentTransfer(scene, shortcuts);
                    return;
                } else {
                    this.deleteDesktopRemote(scene);
                }
            },

            /**
             * 设置为默认桌面
             *
             * @public
             * @method setDefault
             * @param {String} id 桌面ID
             * @param {Boolean} forAllUser 是否设为所有学员的默认桌面
             * @asynch
             */
            setDefault: function(id, forAllUser, callback) {

                var data = {
                    deskId: id
                };

                if (forAllUser === true) {
                    data.forAllUser = "true";
                }

                callback = callback || ($.isFunction(forAllUser) ? forAllUser : null);

                $.ajax({
                    url: URLS.setDefaultDesktop,
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    success: function(json) {
                        if (!$.isFunction(callback) || callback() !== false) {
                            tbc.alert(json.message);
                        }
                    }
                });
            }
        }).init();
    };
}(window.tbc, window.jQuery, URLS));
