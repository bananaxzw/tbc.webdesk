;(function(tbc, $, URLS) {

    "use strict";

    /**
     * 桌面分屏
     * @class tbc.Scene
     * @uses tbc.Tabpage
     * @constructor
     * @copyright 时代光华(2013)
     * @author mail@luozhihua.com
     */
    tbc.Scene = function(settings) {
        var defaults = {
              gridWidth   : 116
            , gridHeight  : 110
            , paddingTop  : 40
            , paddingLeft : 80
            , type        : null
            , url         : null
        },
        options    = $.extend({}, defaults, settings),
        list,
        height, width,
        row, col,
        paddingTop, paddingLeft,
        gridWidth, gridHeight,
        visibleWidth, visibleHeight,
        sceneTop, sceneLeft,
        desktop = window.desktop
        ;

        settings.closable = settings.own;

        tbc.self(this, arguments)
        .extend([tbc.Tabpage, settings], {

            /**
             * 初始化
             *
             * @method init
             * @private
             * @chainable
             */
            init : function() {

                var SELF = this;

                this.packageName= "tbc.Scene";
                this.classType  = "scene";
                this.options    = options;
                this.svid       = this.options.id;
                this.shortcutsContainer = $('<div class="tbc-desktop-shortcutsContainer"></div>')
                    .appendTo(this.container);

                height  = this.container.height();
                width   = this.container.width();
                row     = 0;
                col     = 0;
                paddingTop  = this.options.paddingTop;
                paddingLeft = this.options.paddingLeft;
                gridWidth   = this.options.gridWidth;
                gridHeight  = this.options.gridHeight;

                visibleWidth= width   - paddingLeft - (gridWidth);
                visibleHeight= height - paddingTop  - (gridHeight);
                sceneTop    = 0;
                sceneLeft   = 0;

                // 布局参数
                this.setLayoutInfo = function() {
                    height  = SELF.container.height();
                    width   = SELF.container.width();
                    visibleWidth  = width - (gridWidth);
                    visibleHeight = height - (gridHeight*1.5);
                };

                this.addEvent({
                    "show" : function() {
                        var stype = options.type;
                        if (this.loaded !== true) {
                            this.load();
                        }

                        if (stype!=='USER' && stype!=='ADMIN' && stype!=='OTHER') {
                            SELF.group.hideDock();
                        } else {
                            SELF.group.showDock();
                        }

                        /*
                         * 如果类型是网站、单应用的桌面，或者系统设置不允许显示，则不渲染“加号”
                         */
                        if (options.type==="LINK" || options.type==="APPLICATION") {
                            taskbar.hide();
                        } else {
                            taskbar.show();
                        }

                        this.layout();
                    },
                    "beforeShow" : function() {

                    }
                });

                this.initContextmenu();
                this.initPlus();

                return this;
            },

            /**
             * 初始化桌面的 加 号
             *
             * @private
             * @method initPlus
             */
            initPlus : function() {

                var settings = tbc.system.settings,
                    SELF = this;
                /*
                 * 如果类型是网站、单应用的桌面，或者系统设置不允许显示，则不渲染“加号”
                 */
                if (options.type==="LINK" || options.type==="APPLICATION" || options.type==='WIDGETS') {
                    return this;
                }

                if (!this.plusSignInited) {
                    this.plusSign = $('<div title="'+ i18n('v4.js.add') +'" _shortcutid="plus" class="tbc-shortcut tbc-plus-shortcut"></div>')
                    .html(
                        '<div class="tbc-shortcut-inner">' +
                        '   <i class="tbc-shortcut-icon"><em></em></i>' +
                        //'   <span class="tbc-shortcut-label"></span>' +
                        '</div>'
                   )
                    .css({left:options.paddingLeft, top:options.paddingTop});

                    this.plusSign.contextmenu({
                        items : [
                            {
                                text: function() {
                                    return desktop.isSysAdmin() || settings.allowCreateFolder ?
                                        i18n('v4.js.createFolder') : null;
                                },
                                icon:"icon-folder_modernist_add_simple",
                                disabled:false,
                                click:function() {
                                    desktop.creatFolder(SELF);
                                }
                            }, {
                                text: function() {
                                    return desktop.isSysAdmin() || settings.allowCreateShortcut ?
                                        i18n('v4.js.createShortcuts') : null;
                                },
                                disabled:false,
                                click:function() {
                                    desktop.startSimpleShortcutsAdd();
                                }
                            }, {
                                text: function() {
                                    return desktop.isSysAdmin() || settings.allowManagerShortcut ?
                                    i18n('v4.js.manageShortcuts') : null;
                                },
                                disabled:false,
                                click:function() {
                                    desktop.startShortcutsManager();
                                }
                            }, {
                                text: i18n('v4.js.addDesktop'),
                                disabled:false,
                                icon:"icon-add_small",
                                click:function() {
                                    desktop.manager.addDesktop();
                                }
                            }
                        ]
                    })
                    .bind({
                        "click" : function(event) {
                            var self = $(this);

                            setTimeout(function() {
                                var pos = self.offset(),
                                    width = self.width(),
                                    height= self.height();

                                self.trigger('contextmenu', {left:pos.left+24, top:pos.top+height-28});
                                self = null;
                            });
                        }
                    });

                    this.append(this.plusSign);
                    this.addEvent("beforeLayout", function() {
                        this.append(this.plusSign);
                    });

                    this.plusSignInited = true;
                }

                return this;
            },

            /**
             * 初始化右键菜单以及拖动、点击等事件
             *
             * @method initContextmenu
             * @private
             */
            initContextmenu : function() {
                var SELF = this;

                this.container.bind ({
                    click : function(event) {
                        if (!event.ctrlKey) {
                            $(".tbc-shortcut-selected", this).removeClass("tbc-shortcut-selected");
                        }
                    }
                });

                $(this.options.handleNode)
                .bind({
                    "dragin" :  function(event, locate) {
                        var index = SELF.index;
                        SELF.group.show(index);
                        locate.transfer = locate.container;
                    },
                    "dragout" : function() {

                    }
                })
                .contextmenu({
                    items : [

                        {
                            text: i18n('v4.js.reload'), //"重新加载",
                            icon:"icon-refresh",
                            disabled:SELF.group,
                            click:function() {
                                if (SELF.group) {
                                    SELF.group.current().reload();
                                } else {
                                    SELF.reload();
                                }
                            }
                        }, {
                            text: i18n('v4.js.switchToDesktop'), //"切换到此桌面",
                            icon:"icon-arrow_state_blue_right",
                            disabled:SELF.group,
                            click:function() {
                                if (SELF.group) {
                                    SELF.group.show(SELF.index);
                                }
                            }
                        }, {
                            text: function() {
                                //设为初始桌面
                                return desktop.isSysAdmin() || tbc.system.settings.allowSetDefaultDesk ?
                                    i18n('v4.js.setDefaultDesktop') : false;
                            },
                            icon: "icon-home_green",
                            disabled: options.setDefault,
                            click: function() {
                                desktop.manager.setDefault(options.id);
                            }
                        }, {
                            text: function() {
                                // 设为所有人的初始桌面
                                return desktop.isSysAdmin() ?
                                    i18n('v4.js.setAllDefaultDesktop') : false;
                            },
                            icon: "icon-home_grey",
                            disabled: options.setDefault,
                            click: function() {
                                desktop.manager.setDefault(options.id, true);
                            }
                        },
                        //{text:function() {return false; }, icon:"", disabled:options.setDefault, click:function() {
                        {
                            // 修改桌面
                            text : function() { return i18n('v4.js.edit')+
                                (!options.own?' - ('+ i18n('v4.js.onlyEditOwnDesk') +')':'');
                            },
                            icon : "icon-pencil",
                            disabled: !options.own,
                            click: function() {
                                desktop.manager.editDesktop(SELF);
                            }
                        },
                        /*
                        {text:"隐藏",icon:"", display: !options.own, click:function(event) {
                            desktop.hide(SELF.index);
                        }},
                        */
                        {
                            // 删除桌面
                            text: function(){ return i18n('delete')+ (!options.own?' - ('+i18n('v4.js.onlyDelOwnDesk')+')':''); },
                            icon: "icon-remove_outline",
                            disabled: !options.own,
                            click: function() {

                                if (options.isTem === true) {
                                    //"真的要删除这个屏吗? 删除后所有学员此屏都将被删除并且无法恢复!"
                                    tbc.confirm(i18n('v4.js.sysDeskDelTips'), function() {
                                        desktop.manager.deleteDesktop(SELF);
                                    });
                                } else {
                                    //"删除后将无法恢复"
                                    tbc.confirm(i18n('v4.js.deskDelTips'), function() {
                                        desktop.manager.deleteDesktop(SELF);
                                    });
                                }
                            }
                        }, {
                            text: i18n('v4.js.cleanDesk'),//"清理其他桌面",
                            icon:"icon-error_do_not_small",
                            disabled:SELF.group,
                            click:function() {
                                var group = SELF.group,
                                    curr = group.current().index,
                                    i, len, scene,
                                    count = 0;

                                for (i=0,len=group.tabs.length; i<len; i++) {
                                    scene = group.tabs[i];
                                    if (scene.index !== curr) {
                                        count += scene.loaded ? 1 : 0;
                                        scene.loaded = false;
                                        scene.clean();
                                    }
                                }

                                tbc.alert(count ?
                                    i18n('v4.js.cleanDeskSuccess') : //'清理成功' :
                                    i18n('v4.js.cleanDeskNull') //'没有需要清理的桌面'
                                );
                                scene = null;
                            }
                        }
                    ]
                });
            },

            /**
             * 将类型转换成对应的名称
             *
             * @public
             * @method nameTranslator
             * @param {String} type 桌面类型
             * @return {String} 返回转换后的名称
             * @ux-ogle.in
             */
            nameTranslator : function(type) {
                var T = {
                    "USER"    : i18n('!v4.js.user'), //"学员",
                    "ADMIN"   : i18n('!v4.js.admin'), //"管理员",
                    "OTHER"   : i18n('!v4.js.other'), //"其他",
                    "DESKTOP" : i18n('!v4.js.customDesktop') //"自定义桌面"
                };

                return T[type] || type;
            },

            /**
             * 插入元素或对象
             *
             * @public
             * @method append
             * @param {Object} child tbc的UI组件或者任何jQuery对象和HTMLElement
             * @chainable
             */
            append : function(child) {

                switch(child.constructor) {
                    case tbc.Shortcut:
                        this.appendShortcut.apply(this, arguments);
                        break;
                    case tbc.Widgets:
                        this.appendWidget.apply(this, arguments);
                        break;

                    case tbc.Window:
                    case tbc.Folder:
                        this.container.append(child.ui||child);
                        break;

                    default:
                        this.container.append(child.ui||child);
                }
                return this;
            },

            /**
             * 插入一个快捷方式
             *
             * @public
             * @method appendShortcut
             * @param {Object} shortcut tbc.Shortcut的实例
             * @param {Boolean} prev 是否显示在最前面
             * @param {Object} data 应用或快捷方式的配置数据
             * @chainable
             */
            appendShortcut : function(shortcut, prev, data) {
                var index, position, plusSign, posPlus;

                this.setLayoutInfo();

                shortcut.host = this;
                data = data || shortcut.options;

                if (prev) {
                    shortcut.prependTo(this);
                    this.layout();
                } else {
                    plusSign = this.container.children('.tbc-plus-shortcut');
                    index    = this.container.children(".tbc-shortcut").not(plusSign).size();
                    position = this.getSpaceByIndex(index);
                    posPlus  = this.getSpaceByIndex(index+1);

                    shortcut.ui.css({ left:position.left, top:position.top, position:"absolute" });
                    plusSign.css({left:posPlus.left, top:posPlus.top});
                    shortcut.appendTo(this);
                }

                // 存储数据
                tbc.jdc.set(["shortcuts", this.packageName, this.svid].join("_"), data.userDeskItemId, data);

                this.shortcuts = this.shortcuts || {};
                this.shortcuts[shortcut.id] = shortcut;
                return this;
            },

            /**
             * 批量插入快捷方式
             *
             * @public
             * @method appendShortcuts
             * @param {Array} list 应用或快捷方式列表
             * @chainable
             */
            appendShortcuts : function(list) {
                var self        = this,
                    folderIds   = [],
                    dataStore, folderStore,
                    i, len,
                    shortcut,
                    type
                    ;

                dataStore  = tbc.webdesk.data;
                folderStore = dataStore.folders = dataStore.folders || {};

                for (i=0,len=list.length; i<len; i+=1) {
                    shortcut = list[i];
                    type = tbc.system.getOpenType(shortcut);

                    // 如果存在folderId, 则此图标位于文件夹内
                    if (typeof shortcut.folderId === 'string') {
                        if (!this.children[shortcut.folderId]) {
                            this.appendShortcut(new tbc.Shortcut(shortcut), false, shortcut);
                        }
                    } else {
                        this.appendShortcut(new tbc.Shortcut(shortcut), false, shortcut);
                    }

                    if (type === "FOLDER") {
                        //this.setFolderContent(shortcut.userDeskItemId);
                    }
                }

                return this;
            },

            /**
             * 设置文件夹内容
             *
             * @public
             * @method setFolderContent
             * @param {String} id 文件夹ID
             */
            setFolderContent : function(id) {
                return this;
                var folderSht = tbc.webdesk.data.folders[id].children,
                    folderIcon = tbc.system.getTaskByElement("[_shortcutid='"+ id +"']"),
                    i, len,
                    child,
                    jdcId = ["shortcuts", "tbc.Folder", id].join("_");

                if (folderIcon) {
                    for (i=0,len=folderSht.length; i<len; i+=1) {
                        child = folderSht[i];
                        tbc.jdc.set(jdcId, child.userDeskItemId, child);
                        folderIcon.thumbnail.append(child.userDeskItemId, child.applicationIconUrl);
                    }
                    folderIcon.thumbInited = true;
                    folderIcon.receiveReminder();
                }
            },

            /**
             * 向桌面插入图标
             *
             * @public
             * @method appendWidget
             * @param {Array} widget tbc.desktop.Widget实例
             * @param {Boolean} prev 是否显示在最前面
             * @param {Object} _options widget的配置数据
             * @chainable
             */
            appendWidget : function(widget, prev, options_w) {

                var quickLaunch = window.quickLaunch;

                if (widget.scene) {
                    delete widget.scene[widget.userDeskItemId];
                }
                widget.scene = this;

                if (prev) {
                    this.container.prepend(widget.ui);
                } else {
                    this.container.append(widget.ui);
                }

                this.widgets = this.widgets || {};
                this.widgets[widget.userDeskItemId] = widget;

                // 添加小图标到任务栏左侧
                if (!quickLaunch.isExist(options_w.applicationId)) {
                    quickLaunch.append({
                        guid  : options_w.applicationId,
                        title : options_w.applicationName,
                        icon  : options_w.applicationIconUrl,
                        click : function() {
                            if (widget.visible===false) {
                                widget.show();
                            }else{
                                widget.ui.stop()
                                .animate({opacity:0}, 100)
                                .animate({opacity:1}, 100)
                                .animate({opacity:0}, 100)
                                .animate({opacity:1}, 400);
                            }
                        }
                    });
                }

                return this;
            },

            /**
             * 向桌面插入图标
             *
             * @public
             * @method appendWidgets
             * @param {Array} list widgets列表
             * @chainable
             */
            appendWidgets : function(list) {
                var SELF = this;
                $.each(list, function(i, widget) {

                    // widgets
                    if (widget.itemType === "WIDGET") {
                        SELF.appendWidget(
                            new tbc.desktop.Widget({
                                id        : widget.applicationId,
                                url        : widget.homePageUrl,
                                width    : widget.preferredWidth,
                                height    : widget.preferredHeight,
                                right    : widget.right,
                                top        : widget.top,
                                target    : desktop,
                                title    : widget.applicationName,
                                icon    : widget.applicationIconUrl,
                                control    : widget.control||true
                            }), null, widget
                       );

                    // 自动打开的应用
                    } else {
                        tbc.system.open(widget);
                    }

                });
                this.layoutWidget();
                return this;
            },

            /**
             * 延迟排列桌面图标
             * @private
             * @property layoutTimeout
             */
            layoutTimeout : null,

            /**
             * 排列桌面图标
             *
             * @public
             * @method layout
             */
            layout : function() {
                var self = this;
                this.triggerEvent("beforeLayout");
                clearTimeout(this.layoutTimeout);
                row  = 0;
                col  = 0;
                list = self.container.children(".tbc-shortcut").add(self.container.children(".tbc-shortcut-plus"));

                self.setLayoutInfo();
                $.each (list, function(i) {
                    var pos = self.getSpaceByIndex(i),
                        sid = this.getAttribute("tbc"),
                        sh  = tbc.TASKS(sid);

                    $(this).data({ reallyLeft:pos.left, reallyTop:pos.top })
                    .css ({ position:"absolute",left:pos.left, top:pos.top });

                    if (sh instanceof Object) {
                        sh.triggerEvent("moved", pos);
                        sh = null;
                    }
                });

                self.triggerEvent("layout");
                self = null;

                return this;
            },

            /**
             * 排列桌面Widget
             *
             * @public
             * @method layoutWidget
             */
            layoutWidget : function() {

                var wids   = this.container.children(".tbc-widget"),
                    height = this.container.height(),
                    width  = this.container.width(),
                    currentIndex = 0,

                    W=0, H=0, R=0, MR=20, T=0, MT=24;

                wids.each(function() {
                    var wid = $(this),
                        r = window.parseInt(wid.css("right")),
                        t = window.parseInt(wid.css("top")),
                        w = wid.width(),
                        h = wid.height();

                    r = isNaN(r) ? 0 : r;
                    t = isNaN(t) ? 0 : t;

                    if (height < T+h) {
                        R += W;
                        wid.css({ right:R+MR, top:H+MT });
                    } else {
                        wid.css({ right:R+MR, top:H+T+MT });
                    }

                    W = w;
                    H = h;
                    T = (T<t+MT+h) ? t+MT : t+h+MT;
                    wid = null;
                });
            },

            // 获得新位置
            getSpace : function() {
                return {
                    left : sceneLeft + (col*gridWidth)  + paddingLeft,
                    top  : sceneTop  + (row*gridHeight) + paddingTop
                };
            },

            /**
             * 计算某一个图标的坐标位置
             *
             * @public
             * @method getSpaceByChild
             * @param {Object} child HTMLElement of chortcut or jQuery object
             * @returns {Object} 与 getSpaceByIndex方法的参数一致
             */
            getSpaceByChild : function(child) {
                var index = this.container.children(".tbc-shortcut:not(.tbc-plus-shortcut)").index(child);
                return this.getSpaceByIndex(index);
            },

            /**
             * 根据序号计算图标位置
             *
             * @public
             * @method getSpaceByIndex
             * @param {Number} index 序号
             * @returns {Object} 返回坐标值{left:*, top:*}
             */
            getSpaceByIndex : function(index) {

                // 计算公式:top = i%Math.floor(H/h)*h
                var rows_1 = (visibleHeight)/gridHeight,
                    rows   = rows_1>Math.floor(rows_1) ? Math.floor(rows_1)+1 : rows_1,
                    top    = index%rows*gridHeight + paddingTop,
                    left   = Math.floor(index/rows)*gridWidth + paddingLeft;

                return {left:left, top:top};
            },

            /**
             * 保存桌面图标的排序
             *
             * @public
             * @method saveOrder
             * @async
             */
            saveOrder : function() {
                var list = [];

                this.container.children(".tbc-shortcut:not(.tbc-plus-shortcut)").each(function() {
                    list.push(this.getAttribute("_shortcutId"));
                });

                $.ajax({
                      url        : URLS.orderDesktopShorcuts
                    , type        : "post"
                    , dataType    : "json"
                    , data        : {deskid:this.svid, items:list.join(",")}
                    , complete    : function() {}
                    , error        : function() {}
                    , success    : function(json) {
                        if (json && json.result === "success") {
                            json.success = true;
                        }
                    }
                });
                this.shortcutSequence = list;

                return this;
            },

            /**
             * 锁住桌面（用一个灰色的层覆盖桌面）
             *
             * @public
             * @method lock
             */
            lock : function(msg) {

                var layer,
                    zindex = Math.max(tbc.getMaxZIndex(this.ui)+1, 10);

                if (typeof this.lockLayer === 'undefined') {
                    this.lockLayer = $('<div class="tbc-desktop-scene-locker">' +
                          '<div class="tbc-desktop-locker-bg"></div>' +
                          '<div class="tbc-desktop-locker-icon"></div>' +
                          '<div class="tbc-desktop-locker-text">'+ (msg||'') +'</div>'+
                      '</div>')
                      .css({zIndex: zindex})
                      .contextmenu({items:[]});
                }
                this.lockLayer.show().appendTo(this.ui);
            },

            /**
             * 解锁桌面, 对应于lock方法
             *
             * @public
             * @method unlock
             */
            unlock : function() {
                if (this.lockLayer) {
                    this.lockLayer.fadeOut(400);
                }
            },

            /**
             * 加载桌面（不区分桌面类型， 在此方法内会判断桌面类型，并自动调用相应的方法加载不同的桌面
             *
             * @public
             * @method load
             */
            load : function() {

                if (this.loaded !== true) {
                    switch (options.type) {
                        case "PAGE":
                        case "APPLICATION":
                        case "APP":
                        case "LINK":
                        case "SHORTCUT":
                        case "WIDGETS":
                            this.loadContentAsIframe();
                            break;

                        case "DESKTOP":
                        case "ADMIN":
                        case "USER":
                        case "OTHER":
                            this.loadContent();
                            break;

                        default:
                            tbc.log('undefined desktop type!');
                    }

                }
                return this;
            },

            /**
             * 重新载入桌面内容
             *
             * @public
             * @method reload
             */
            reload: function() {
                if (this.loaded) {
                    this.loaded = false;
                    this.clean();
                    this.load();
                }
            },

            /**
             * 清理桌面
             *
             * @public
             * @method clean
             */
            clean: function() {
                var appid, apps, iframe;

                if (this.iframe) {
                    this.iframe.src = null;
                    iframe = $(this.iframe);
                    iframe.siblings('.tbc-scene-iframe-header').remove();
                    iframe.remove();

                    delete this.iframe;
                }

                if (this.shortcuts instanceof Object) {

                    for (appid in this.shortcuts) {
                        if ($.isFunction(this.shortcuts[appid].DESTROY)) {
                            this.shortcuts[appid].DESTROY();
                            delete this.shortcuts[appid];
                        }
                    }
                }
                return true;
            },

            /**
             * 匹配IFRAME并返回其src属性
             * @private
             * @method matchIframeSrc
             * @param {String} html HTML代码
             * @return {String} url
             */
            matchIframeSrc : function(html) {
                var x,y,z;

                // 网址导航(兼容性代码)
                if (html.match(/http:\/\/hao.qq.com/)) {
                    z = "http://hao.qq.com";
                } else {
                    x = html ? html.match(/<iframe[^>]+>/) : null;
                    y = x&&x[0] ? x[0].match(/src\s*=\s*["']?\s*\S+\s*["']?/) : null;
                    z = y&&y[0] ? y[0].replace(/(src\s*=\s*["']?\s*|\s*["']*\s*>?$)/g,"") : null;
                    z = !z||z.match(/^("|'|,|\+|\()/) ? null : z;
                }

                try { return z; } finally { html = x = y = z = null; }
            },

            /**
             * 以iframe方式加载一个页面做为桌面, 通常只能加载配置项的type为LINK/APPLICATION类型的桌面
             *
             * @public
             * @method loadContentAsIframe
             */
            loadContentAsIframe : function() {
                var SELF = this,
                    url  = this.options.url,
                    type = this.options.type,
                    onTaskbarToggle,
                    regexpDomain = /^([\w\d]([\w\d\-]{0,61}[\w\d])?\.)+[\w]{2,6}([\?\#\/]|$){1,}/,
                    regexpPath = /^((\.{1,2}\/)+|(\.\/)+|(\/))?([\w\d\-_\.]{1,}[\?#\/$]{1})+[^$]*/
                    ;

                // 如果是网站类型的桌面，则给url补充没有http://头
                if ((type === 'LINK' || type === 'SHORTCUT') && !url.match(/^http/)) {
                    if (url.match(regexpDomain)) {
                        url = "http://" + url;
                    }
                }

                this.iframe = this.container.find('iframe')[0];

                if (!this.iframe) {
                    this.iframe = $('<iframe class="tbc-scene-iframe" frameborder="0" scrolling="auto" style="height:100%; width:100%; "></iframe>');
                    this.append('<div class="tbc-scene-iframe-header" style="height:"><h2>'+ (type!=='WIDGETS'?options.name||"":"") +'</h2></div>');
                    this.append(this.iframe);
                    this.iframe = this.iframe[0];

                    $(window).add(document).bind('resize', function() {
                        SELF.resizeIframe();
                    });

                    this.resizeIframe();

                    if (window.taskbar) {

                        onTaskbarToggle = function() {
                            var group = SELF.group,
                                curr = group ? group.current() : null;
                            if (curr) {
                                curr.resizeIframe();
                            }
                        }

                        taskbar
                        .addEvent('hide.resizeIframe'+this.svid, onTaskbarToggle)
                        .addEvent('show.resizeIframe'+this.svid, onTaskbarToggle);

                        this.addEvent({
                            'destroy': function(){
                                taskbar.removeEvent('hide.resizeIframe');
                            },
                            'show': function() {
                                SELF.resizeIframe();
                            }
                        });
                    }
                }

                // 如果是应用屏，则提取内部iframe地址
                if (options.type=='APPLICATION') {
                    $.ajax ({
                        url     : url,
                        success : function(html) {
                            var subUrl = SELF.matchIframeSrc(html);
                            if (subUrl) {
                                SELF.iframe.setAttribute("src", subUrl);
                            } else {
                                SELF.iframe.setAttribute("src", url);
                            }
                        },
                        error   : function() {
                            SELF.iframe.setAttribute("src", url);
                        }
                    });
                } else {
                    this.iframe.setAttribute("src", url);
                }

                this.loaded = true;
            },

            resizeIframe: function() {

                if (this.index === this.group.currIndex) {
                    var hei = this.container.height(),
                        padding = 34;

                    if (window.taskbar && window.taskbar.state !== 'min') {
                        padding += 32;
                    }

                    $(this.iframe).css({
                        height    : hei-padding,
                        marginTop : 32
                    });
                }
            },

            /**
             * 加载桌面上的应用和快捷方式, 加载完后会自动调用appendShortcuts()方法将
             * 应用和快捷方式显示在桌面上
             *
             * @public
             * @method loadContent
             * @async
             */
            loadContent : function() {
                var SELF = this,
                    index;

                $.each(this.group.tabs, function(i, o) {
                    if (o === SELF) {
                        index = i;
                    }
                });

                $.ajax({
                      url     : URLS.getSceneContents
                    , data    : {deskindex:SELF.index, loadDockItem:index===0, deskId:options.id, '_ajax_toKen':"elos"}
                    , type    : "post"
                    , cache   : false
                    , dataType: "json"
                    , beforeSend  : function() {
                        // 正在加载桌面应用...
                        SELF.lock(i18n('v4.js.loadingDeskApps'));
                    }
                    , complete : function() {
                        SELF.unlock();
                    }
                    , error    : function() {
                        tbc.log("ERROR: at tbc.Scene.loadContent()>$.ajax");
                    }
                    , success    : function(json) {
                        var translator = tbc.webdesk.data.translator,
                            shortcuts = translator.shortcuts.transformList(json.shortcuts, 'antique');

                        SELF.unlock();
                        SELF.cacheShortcut(shortcuts);
                        SELF.loaded = true;
                        SELF.ui.attr({"tbc": SELF.guid, svid:options.id });
                        SELF.appendShortcuts(shortcuts);

                        // 测试页面加载时间
                        if (document.location.href.indexOf("DEBUG")!==-1 && window.console) {
                            window.console.log(new Date().getTime() - window.START_TIME);
                        }
                    }
                });

                return this;
            },

            /**
             * 缓存应用列表: 将有folderId的应用或快捷方式放入对应的文件夹下,
             * 以便在显示文件夹图标时在文件夹上显示缩略图, 而不用每显示一个文
             * 件夹都必须循环一次应用列表的Array
             *
             * @public
             * @method cacheShortcut
             * @param {Array} list 应用列表
             */
            cacheShortcut : function(list) {
                var dataStore = tbc.webdesk.data,
                    shortcutStore = dataStore.shortcuts = dataStore.shortcuts || {},
                    folderStore = dataStore.folders = dataStore.folders || {},
                    i, len,
                    id,
                    type,
                    sht,
                    folderId;

                this.children = this.children || {};

                for (i=0,len=list.length; i<len; i+=1) {
                    sht = list[i];
                    type = tbc.system.getOpenType(sht).toUpperCase();
                    id = sht.userDeskItemId;
                    folderId = sht.folderId;

                    this.children[id] = id;

                    switch (type) {

                        case "FOLDER":
                            folderStore[id] = folderStore[id] || sht;
                            sht.children = sht.children || [];
                            break;

                        case "APP":
                        case "APPLICATION":
                        case "SHORTCUT":
                        case "LINK":
                            shortcutStore.push(sht);
                            shortcutStore[id] = sht;
                            break;
                    }
                }

                // 建立文件夹内的应用索引
                for (i=0,len=list.length; i<len; i+=1) {
                    sht = list[i];
                    type = tbc.system.getOpenType(sht).toUpperCase();
                    id = sht.userDeskItemId;
                    folderId = sht.folderId;

                    if (typeof folderId === 'string' && folderId.length>0) {
                        //folderStore[folderId] = folderStore[folderId] || [];
                        if (folderStore[folderId]) {
                            folderStore[folderId].children = folderStore[folderId].children || [];
                            folderStore[folderId].children.push(sht);
                            folderStore[folderId].children[id] = sht;
                        }
                    }
                }
            },

            // 删除本地数据
            deleteJDC : function(id) {

            },

            // 增加本地数据
            saveToJDC : function() {

            }
        })
        .init();
    };
}(window.tbc, window.jQuery, window.URLS));
