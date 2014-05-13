/**
 * 桌面集, 用于管理多个桌面
 * @copyright 时代光华(2013)
 * @author mail@luozhihua.com
 *
 * @class tbc.Desktop
 * @constructor
 * @uses tbc.Tabset
 * @param {Object} settings 配置
 *     @param {Element} [settings.prevHandle] 往前滑动标头
 *     @param {Element} [settings.nextHandle] 往后滑动标头
 *     @param {Element} [settings.container] 显示桌面集的容器
 *     @param {Element} [settings.header] 显示标签头的容器
 *     @param {String} [settings.effects] 标签页转换效果
 *     @param {Element} [settings.easing] 标签页转换过渡缓冲效果
 *     @param {Boolean} [settings.loop] 循环切换
 *     @param {Boolean} [settings.auto] 自动切换
 *     @param {Number} [settings.timeout] 自动切换的时间间隔, 默认5000ms
 *     @param {Number} [settings.speed] 切换速度，默认400ms
 */
;(function(tbc, $, URLS) {

    "use strict";

    tbc.Desktop = function(settings) {

        /**
         * @config options
         */
        var defaults = {
              prevHandle   : ".tbc-tabset-prev"
              , nextHandle : ".tbc-tabset-next"
              , container  : ".tbc-tabset"
              , header     : ".tbc-desktop-nav"   //
              , effects    : "slide-x"      // [fade, slide-x, slide-y]
              , easing     : "swing"
              , loop       : true
              , auto       : true           // 自动切换
              , timeout    : 5000           // 自动切换的间隔时间(毫秒,1000ms = 1s)
              , speed      : 400
        },
        options = $.extend({}, defaults, settings);

        // 继承标签管理类、实现方法
        tbc.self(this, arguments)
        .extend([tbc.Tabset, settings], {

            /**
             * 管理器
             * @property manager
             * @type Object "instance of class tbc.DesktopManager"
             */
            manager : new tbc.DesktopManager(),

            /**
             * 加载桌面列表
             *
             * @public
             * @method loadScene
             * @async
             */
            loadScene : function() {
                var SELF = this;
                $.ajax({
                    url      : URLS.getSceneSettings,
                    type     : "get",
                    datas    : {deskindex:0, loadDockItem:true},
                    dataType : "json",
                    cache    : false,
                    complete : function() {},
                    error    : function(e) {

                        var tips, button, bw;

                        bw = $('<Div/>').css({ textAlign:'center', padding:"10px 32px"});

                        button = new tbc.Button({
                            text  : i18n('!v4.js.refresh'), //"立即刷新",
                            icon  : 'tbc-icon-close',
                            click : function() {
                                tips.close();
                            }
                        })
                        .appendTo(bw);

                        tips = new tbc.Panel({
                            width  : 300,
                            height : 180,
                            name   : i18n('v4.js.systemPrompt') //"提示"
                        })
                        //.append('<div style="padding:30px 30px 10px; color:red;">加载桌面数据失败，请刷新页面...</div>')
                        .append('<div style="padding:30px 30px 10px; color:red;">'+ i18n('v4.js.loadDeskDataDailed') +'</div>')
                        .append(bw)
                        .appendTo('body')
                        .show()
                        .addEvent({
                            "close" : function() {
                                tips.DESTROY();
                                button.DESTROY();
                                $('body').fadeOut(function() {
                                    window.onbeforeunload = null;
                                    document.location.reload();
                                });
                            }
                        });
                    },
                    success    : function(json) {
                        if (json) {
                            SELF.onDataLoad(json);
                        }
                    }
                });
            },

            /**
             * 判断当前登录用户是否拥有管理员角色(包含培训管理员)
             *
             * @public
             * @method isAdmin
             * @return Boolean 返回true为管理员,否则非管理员角色
             */
            isAdmin : function() {
                var userRole = this.userinfo.roles,
                    rolelist = this.rolelist,
                    i, len, J, L,
                    hasAdminRole;

                for (i=0,len=userRole.length; i<len; i+=1) {
                    for (J=0,L=rolelist.length; J<L; J+=1) {
                        if (userRole[i] === rolelist[J].id && rolelist[J].type === 'ADMIN') {
                            return true;
                        }
                    }
                }
                return false;
            },

            /**
             * 判断当前登录用户是否拥有系统管理员角色(不包含培训管理员)
             *
             * @public
             * @method isSysAdmin
             * @return Boolean 返回true为系统管理员,否则非系统管理员角色
             */
            isSysAdmin : function() {
                return this.userinfo && this.userinfo.isHasAdmin;
            },

            /**
             * 不公开
             *
             * @private
             * @event onDataLoad
             * @param {Object} 从服务器端获得的JSON数据
             */
            onDataLoad : function(json) {
                json = json || {};

                var translator = tbc.webdesk.data.translator,
                    tools,
                    k, i, len,
                    appStore = tbc.webdesk.data.apps,
                    defaultScene; // 默认屏幕

                // 旧数据格式
                if (window.applicationMap || json.applicationMap) {
                    window.applicationMap = window.applicationMap || json.applicationMap;

                // 新数据格式
                } else {
                    window.applicationMap = {};

                    for (k in json.apps) {
                        if (json.apps.hasOwnProperty(k)) {
                            window.applicationMap[k] = appStore[k] = translator.apps.transform(json.apps[k], 'antique');
                        }
                    }
                    appStore = null;
                }

                tbc.system.settings = this.systemSettings = json.settings || json.setting || {};
                this.userinfo = json.user;
                this.corpinfo = json.company;
                this.rolelist = json.roles;
                window.corpCode = json.company.corpCode;

                /* 桌面列表 */
                this.initScene(json.scenes);

                /* 桌面左侧快捷方式 */
                this.initDock(json.tools);

                /* 应用托盘 */
                this.initWidget(json.autoruns);

                // 右键菜单
                this.initContextmenu();
            },

            loadLanguageList: function (onLoad) {
                var self = this;
                if (this.languages) {
                    if ($.isFunction(onLoad)) {
                        onLoad(this.languages);
                    }
                } else {
                    $.ajax({
                        url: URLS['languageList'],
                        dataType: 'json',
                        type: 'get',
                        success: function(json) {
                            if (json) {
                                //tbc.cookie('local_', json.corpDefaultLanguage);
                                self.languages = json.allI18NLocale;
                                self.currentLang =  tbc.cookie('local_') ||
                                                    json.corpDefaultLanguage ||
                                                    navigator.language.replace('-', '_');

                                if ($.isFunction(onLoad)) {
                                    onLoad(self.languages);
                                }
                            }
                        }
                    });
                }
            },

            /**
             * 初始化快捷方式栏
             *
             * @private
             * @method initScene
             * @param {Array} list 快捷方式集合
             */
            initScene : function(list) {
                var i, len, defaultScene,
                    j, lenj, list2,
                    tmp1 = [],
                    tmp2 = [];

                // 排序， 将管理员屏排到最后
                if ($.isArray(list)) {

                    for (j=0, lenj=list.length; j<lenj; j++) {
                        if (list[j].type === 'ADMIN') {
                            tmp2.push(list[j]);
                        } else {
                            tmp1.push(list[j]);
                        }
                    }
                    list2 = tmp1.concat(tmp2);
                }

                for (i=0,len=list2.length; i<len; i++) {
                    this.addScene(i, list2[i]);
                    if (list2[i].isDef) {
                        defaultScene = i;
                    }
                }

                this.effect("slide-x");
                this.show(defaultScene||0);
            },

            /**
             * 隐藏左侧栏
             */
            hideDock: function() {
              $('.tbc-desktop-dock').animate({left: -64});
            },

            /**
             * 显示左侧栏
             */
            showDock: function() {
              $('.tbc-desktop-dock').animate({left: 0});
            },

            /**
             * 初始化应用托盘
             * @private
             * @method initAppTray
             * @param {Array} list 应用托盘数组
             * @chainable
             */
            initAppTray : function(list) {
                if (list instanceof Array) {
                    var dataStore = tbc.webdesk.data,
                        trays = dataStore.translator.tools.transformList(list, 'antique'),
                        i, len;

                    dataStore.trays = trays;

                    for (i=0,len=trays.length; i<len; i+=1) {
                        new tbc.Shortcut(trays[i]).appendTo(".tbc-desktop-dock");
                    }

                    dataStore = trays = null;
                }
                return this;
            },

            /**
             * 初始化快捷方式栏
             *
             * @private
             * @method initDock
             * @param {Array} list 快捷方式集合
             */
            initDock : function(list) {
                if ($.isArray(list)) {
                    var dataStore = tbc.webdesk.data,
                        tools = dataStore.translator.tools.transformList(list, 'antique'),
                        i, len;

                    dataStore.tools = tools;

                    for (i=0,len=tools.length; i<len; i+=1) {
                        new tbc.Shortcut(tools[i]).appendTo(".tbc-desktop-dock");
                    }

                    dataStore = tools = null;
                }
            },

            /**
             * 初始化widget
             *
             * @method initDock
             * @param {Array} list Widget集合
             */
            initWidget : function(list) {
                if ($.isArray(list)) {

                    var desk,
                        autoruns,
                        i, len;

                    for (i=0,len=this.tabs.length; i<len; i+=1) {

                        switch (this.tabs[i].options.type) {
                            case 'USER':
                            case 'ADMIN':
                            case 'OTHER':
                            case 'DESKTOP':
                            case 'APP':
                            case 'APPLICATION':
                            case null:
                                desk = this.tabs[i];
                                break;
                        }

                        if (desk) {
                            break;
                        }
                    }

                    if (desk) {
                        autoruns = tbc.webdesk.data.translator.autoruns.transformList(list, 'antique');
                        desk.appendWidgets(autoruns);
                    }
                }
            },

            /**
             * 数据转换, 因为简化后的数据结构与旧版本的数据结构不同，
             * 而程序结构对旧数据有依赖，所以统一把新格式转换为旧格式
             * 来处理（新的数据结构是为了减少网络传输，加快下载速度）
             *
             * @public
             * @method dataTranslate 数据转器
             * @param {Object} json 桌面配置数据
             */
            dataTranslate : function(json) {
                var dataStore    = tbc.webdesk.data,
                    translator   = dataStore.translator,

                    data         = json.requestUserDesk,
                    shortcuts_1  = data.userDeskItemList,
                    autorun_1    = data.autoRunItemList,
                    app_1        = json.applicationMap,
                    toolbar_1    = json.userDeskDock.userDeskDockItemList,
                    tray_1       = [],
                    k,
                    i;

                // appMap
                for (k in app_1) {
                    if (app_1.hasOwnProperty(k)) {
                        dataStore.apps[k] = translator.apps.transform(app_1[k], 'fresh');
                    }
                }

                // shortcuts
                dataStore.shortcuts = translator.shortcuts.transformList(shortcuts_1, 'fresh');

                // autorun
                dataStore.autoruns = translator.autoruns.transformList(autorun_1, 'fresh');

                // 左侧快捷栏
                for (i=0; i<toolbar_1.length; i+=1) {
                    dataStore.tools.push(translator.shortcuts.transform(toolbar_1[i].userDeskItem, 'fresh'));
                }

                // 右下角托盘
                dataStore.trays = translator.shortcuts.transformList(tray_1, 'fresh');

                dataStore.apps = translator.apps.to;
            },

            /**
             * 启动快捷方式管理器
             *
             * @public
             * @method startShortcutsManager
             */
            startShortcutsManager : function() {
                var SELF = this;
                if (!(this.shortcutsManager instanceof tbc.Window)) {
                    this.shortcutsManager = new tbc.Window({
                        name        : i18n('v4.js.manageShortcuts'), //"管理快捷方式",
                        icon        : "icon-add_small",
                        width       : 848,
                        height      : 600,
                        scrolling   : false,
                        resizable   : false,
                        maximizable : false,
                        minimizable : true,
                        loadType    : 'ajax',
                        homepage    : URLS.startShortcutManager
                    });

                    this.shortcutsManager.addEvent({
                        "close" : function() {
                            SELF.shortcutsManager = null;
                            delete SELF.shortcutsManager;
                        }
                    });
                }

                this.shortcutsManager.show();
            },

            /**
             * 启动添加快捷方式管理器
             * @public
             * @method startSimpleShortcutsAdd
             */
            startSimpleShortcutsAdd : function() {

                var self = this;

                if (!(self.simpleShortcutsManager instanceof tbc.Window)) {
                    self.simpleShortcutsManager = new tbc.Window({
                        name        : i18n('v4.js.createShortcuts'), //"新增快捷方式",
                        icon        : "icon-add_small",
                        width       : 640,
                        height      : 320,
                        loadType    : 'ajax',
                        homepage    : URLS.startShortcutAdd,
                        scrolling   : false,
                        resizable   : false,
                        maximizable : false,
                        minimizable : true
                    });

                    self.simpleShortcutsManager.addEvent({
                        "close" : function() {
                            self.simpleShortcutsManager = null;
                            delete self.simpleShortcutsManager;
                        }
                    });
                }

                self.simpleShortcutsManager.show();
            },

            /**
             * 创建一个桌面
             *
             * @public
             * @method createScene
             * @param {Number} i 桌面序号
             * @param {Object} opt 桌面配置数据
             * @return {Object} Instance of class "tbc.Scene"
             */
            createScene : function(i, opt) {

                    var handle = $('<span title="" class="tbc-scene-title scene_title_'+(i+1)+ ' ' + (opt.type==="ADMIN"?"scene_title_admin":"") +'" hidefocus="true">' +
                        '    <i class="tbc-icon">'+ (opt.type !== "ADMIN"?i+1:"") + '</i>' +
                        '</span>'),
                        iconNode  = handle.find("img"),
                        titleNode,// = handle.find("i"),
                        scene,
                        container = $('<div style="display:none;" class="tbc-slide-scene"></div>');

                    container.scroll(function() { this.scrollTop=0; this.scrollLeft=0; });

                    scene = new tbc.Scene($.extend({
                          title    : null
                        , icon     : null
                        , closable : false
                        , closeNode: null
                        , content  : null
                        , type     : opt.type
                        , url      : opt.url
                        , duration : options.speed
                        , easing   : options.easing //"easeInOutExpo"
                        , autoShow : i===0
                        , id       : opt.id
                    }, opt, {
                          handleNode: handle
                        , titleNode : titleNode
                        , iconNode  : iconNode
                        , container : container
                    }));

                    handle.attr("title", scene.nameTranslator(opt.name||opt.title));

                    scene.ui.attr({ "tbc": scene.guid, svid:opt.id });

                    if (opt.type !== "LINK" && opt.type !== "APPLICATION") {

                        // 开启划选
                        scene.container.selectArea({
                            item          : ".tbc-shortcut",
                            exclude       : ".tbc-folder-shortcut,.tbc-plus-shortcut",
                            classSelected : "tbc-shortcut-selected",
                            event         : {
                                select   : function() {},
                                unselect : function() {}
                            }
                        });

                        this.iconsDrager.addContainer(scene.container);
                        this.iconsDrager.addContainer(scene.handle);
                    }

                    try {
                        return scene;
                    } finally {
                        scene = handle = null;
                    }

            },

            /**
             * 同方法：appendScene
             * @private
             */
            addScene: function(i, opt) {
                return this.appendScene(opt);
            },

            /**
             * 在最前面插入一个桌面
             * @public
             * @method appendScene
             * @param {Object} opt 创建tab页需要的配置项
             */
            appendScene: function(opt) {
                var scene = this.createScene(this.tabs.length, opt);
                this.append(scene);
                return this;
            },

            /**
             * 在最前面插入一个桌面
             * @public
             * @method prependScene
             * @param {Object} opt 创建一个桌面需要的配置项
             */
            prependScene: function(opt) {
                var scene = this.createScene(0, opt);
                this.prepend(scene);
                return this;
            },


            /**
             * 在某一位置后面插入一个桌面
             * @public
             * @method insertScene
             * @param {Object} opt 创建桌面页需要的配置项
             * @param {tbc.Scene} PrevTab 标识插入位置的桌面
             */
            insertScene: function(opt, prevTab) {

                var index = isNaN(prevTab) ? prevTab.index : prevTab,
                    scene;
                scene = (opt instanceof tbc.Scene) ? opt : this.createScene(index, opt);
                this.insert(scene, index-1);
                return this;
            },

            /**
             * 保存快捷栏的快捷方式到服务器
             *
             * @public
             * @method saveDockShortcuts
             * @param {Array} items 快捷方式配置数据
             */
            saveDockShortcuts : function(items) {
                items = $.isArray(items) ? items.join(",") : items;

                if (!items) {
                    items = [];
                    $(".tbc-desktop-dock .tbc-shortcut").each(function() {
                        items.push(this.getAttribute("_shortcutid"));
                    });
                    items = items.join(",");
                }

                $.ajax({
                    url     : URLS.saveDockShortcuts,
                    type    : "post",
                    data    : {items:items},
                    dataType: "json",
                    success : function(json) {

                    }
                });
            },

            /**
             * 设置桌面背景显示方式
             *
             * @method setBackgroundMode
             * @param {String} mode 显示方式:
                     cover (填充)
                    contain (适应屏幕)
                    extrude (拉伸)
                    repeat (平铺)
                    center (居中)
             */
            setBackgroundMode : function(mode) {
                var SELF = this,
                    img;

                mode = mode || this.bgMode || "center";
                this.bgMode = mode;

                function BgLoadHandle() {

                    var bw = document.body.offsetWidth,
                        bh = document.body.offsetHeight,
                        w  = this.width, // 图片width
                        h  = this.height, // 图片height
                        scale = { x:bw/w, y:bh/h},
                        url,

                        width,
                        height,
                        top  = 0,
                        left = 0;

                    switch (mode) {

                        // 填充
                        case "cover":

                            if (scale.x>scale.y) {
                                width  = bw;
                                height = "auto";
                                top    = -(h*scale.x-bh)/2;
                            } else {
                                width  = "auto";
                                height = bh;
                                left   = -(w*scale.y-bw)/2;
                            }
                            $(".tbc-wallpaper img").show().css({ width:width, height:height, left:left, top:top })
                            .parent().css({background:""});
                            break;

                        // 适应
                        case "contain" :
                            if (scale.x<scale.y) {
                                width  = bw;
                                height = "auto";
                                top    = -(h*scale.x-bh)/2;
                            } else {
                                width  = "auto";
                                height = bh;
                                left   = -(w*scale.y-bw)/2;
                            }
                            $(".tbc-wallpaper img").show().css({ width:width, height:height, left:left, top:top })
                            .parent().css({background:""});
                            break;

                        // 拉伸
                        case "extrude" :
                            $(".tbc-wallpaper img").show().css({ width:bw, height:bh, left:0, top:0 })
                            .parent().css({background:""});
                            break;

                        // 平铺
                        case "repeat" :
                            url = $(".tbc-wallpaper img").hide().attr("src");
                            $(".tbc-wallpaper").css({background:"url("+ url +") center center repeat"});
                            break;

                        // 居中
                        case "center" :
                            url = $(".tbc-wallpaper img").hide().attr("src");
                            $(".tbc-wallpaper").css({background:"url("+ url +") center center no-repeat"});
                            break;

                        default:
                            url = $(".tbc-wallpaper img").hide().attr("src");
                            $(".tbc-wallpaper").css({background:"url("+ url +") center center no-repeat"});
                            break;
                    }
                    $(".tbc-wallpaper img").attr("src");

                    // 如果打开了背景设置窗口，则将其锁定
                    if (SELF.bgSelector) {
                        SELF.bgSelector.unlock('loading');
                    }
                }

                // 如果打开了背景设置窗口，则将其锁定
                if (this.bgSelector) {
                    this.bgSelector.lock('loading', i18n('v4.js.loading'), 0.8);
                }

                img = new Image();
                img.onload = BgLoadHandle;
                img.src = $(".tbc-wallpaper img").attr("src");

                img = null;
            },

            /**
             * 设置桌面背景显示方式, 可选的显示方式：
             *       cover (填充)
             *       contain (适应屏幕)
             *       extrude (拉伸)
             *       repeat (平铺)
             *       center (居中)
             *
             * @method setBackground
             * @param {String} url 背景图片地址
             * @param {String} mode 显示方式
             * @chainable
             */
            setBackground : function(url, mode) {

                if (url) {
                    try {
                        if (window.screen) {
                            var w = window.screen.width,
                                h = window.screen.height;

                            // 根据分辨率加载不同的背景图片
                            url +=  (w<=800    ? "/big"
                                : w<=1024    ? "/big"
                                : w<=1280    ? (h >800 ? "/square" : "/bigger")
                                : w<=1366    ? "/large"
                                : w<=1440    ? "/larger"
                                : "");
                        }
                    } catch(e) {}

                    //$("body").css({ "backgroundImage": "url('"+url+"')" });
                    $(".tbc-wallpaper img").attr("src", url);

                }
                this.setBackgroundMode(mode);

                return this;
            },

            /**
             * 从服务器端获取当前用户的背景图片的路径
             *
             * @public
             * @method loadBackgorund
             * @asyn
             */
            loadBackgorund : function() {
                var self = this;

                $.ajax({
                    url: URLS.getCurrentBg,
                    dataType: 'json',
                    type: 'get',
                    success: function(json) {
                        self.backgroundData = json;

                        if (json.autoPlay && $.isArray(json.urls)) {
                            json.current = tbc.random(0, json.urls.length);
                            self.nextBackground(json);
                        } else {
                            self.stopBackground(); // 清除上次的延时“线程”
                            self.setBackground(json.url, json.backgroundSpreadType || json.mode);
                        }
                    }
                });
            },

            /**
             * 显示下一个背景图片
             * @param  {Object} data 背景图片对象
             */
            nextBackground: function(data) {
                var json = data || this.backgroundData,
                    self = this,
                    url, mode, index;

                json.current = json.current ? json.current : 0;
                index = Math.max(0, Math.min(json.urls.length-1, json.current));

                url = json.urls[index];
                mode = json.backgroundSpreadType || json.mode;
                this.setBackground(url, mode);

                clearTimeout(this.backgroundTimer); // 清除上次的延时“线程”
                json.current += 1;
                if (json.current >= json.urls.length) {
                    json.current = 0;
                }

                this.backgroundTimer = setTimeout(function() {
                    self.nextBackground(json);
                }, json.timeout || 1000*60);
            },

            /**
             * 停止背景图片
             */
            stopBackground: function() {
                clearTimeout(this.backgroundTimer);
                this.backgroundPlaying = false;
            },

            /**
             * 打开背景图片管理器
             *
             * @method selectBg
             * @param {Boolean} isAdmin 是否是管理员模式
             * @chainabe
             */
            selectBg : function(isAdmin) {
                var SELF = this;
                SELF.selecting = true;

                this.bgSelector = this.bgSelector
                ? this.bgSelector.focus().flash()
                : new tbc.Window
                ({
                    //name        : "设置桌面背景" + (isAdmin ? '(管理员)':''),
                    name        : i18n("v4.js.setWallpaper") + (isAdmin ? '('+i18n('v4.js.admin')+')':''),
                    homepage    : isAdmin ? URLS.selectBgAdmin : URLS.selectBg,
                    loadType    : "ajax",
                    icon        : "icon-image_cultured",
                    width       : 564,
                    height      : 490,
                    resizable   : true,
                    minimizable : true,
                    maximizable : false,
                    scrolling   : true
                })
                .addEvent({
                    "setBackground" : function(url) {
                        SELF.setBackground(url);
                    },
                    "close": function(data) {
                        delete SELF.bgSelector;
                        SELF.selecting = false;
                    }
                })
                .show();

                return this;
            },


            /**
             * 打开创建文件夹的界面
             *
             * @public
             * @method createFolder
             * @param {Object} scene 桌面
             * @chainabe
             */
            createFolder : function(scene) {
                this.creatFolder(scene);
            },

            /*
             * 打开创建文件夹的界面
             *
             * @public
             * @method creatFolder
             * @param {Object} scene 桌面
             * @chainabe
             */
            creatFolder : function(scene) {
                var SELF = this,
                    win,
                    tips = $('<div title="'+ i18n('v4.js.folderNameLength') +'." style="clear:both; margin-bottom:2em; color:#888;">'+ i18n('v4.js.folderNameLength') +'.</div>'),
                    ui = $('<div style="margin:32px;">' +
                        '    <label>'+ i18n('v4.js.inputFolerName') +':<br/></label><br/>' +
                        '</div>'),

                    verify = new tbc.Button({text:i18n("v4.js.create"), icon:"icon-check", click:function() {
                        var n = $.trim(ui.find(".tbc-inputer").val()),
                            n2= tbc.substr(n, 10),
                            niceName    = n2 + "(" + (n.replace(n2,""))+")";

                        if (n2.length <n.length) {
                            tips.shake().html(i18n('v4.js.folderNameLengthOut')+ ', '+ i18n('v4.js.folderNameLength')).css({color:"red"});
                            //SELF.creatFolderFromServer(n2, scene, win, tips);
                        }else{
                            SELF.creatFolderFromServer(n2, scene, win, tips);
                        }
                    }}),

                    inputer = $('<input class="tbc-inputer" value="'+ i18n('!v4.js.untitled') + i18n('!v4.js.folder') +'" type="text" style="width:200px; height:26px; line-height:26px; margin-bottom:4px;" length="5" onclick="this.focus();" />')
                        .bind({
                            "click" : function() { this.focus(); },
                            "focus" : function() { tips.html(tips.attr("title")).css({color:"#888"}); },
                            "keyup" : function(e) { if (e.keyCode === 13) { verify.click(); } }
                        }),
                    cancel = new tbc.Button({
                        text : i18n('v4.js.cancel'),
                        icon : "icon-close",
                        click : function() {
                            win.close();
                        }
                    });

                verify.ui.css({marginRight:"10px"});

                win = new tbc.Window({
                    //name    : "创建文件夹",
                    name    : i18n("v4.js.createFolder"),
                    loadType: "html",
                    icon    : "icon-folder_modernist_add_simple",
                    width   : 369,
                    height  : 240
                })
                .addEvent({
                    focus : function() {inputer.focus();},
                    close : function() { verify = inputer = win =cancel = null; }
                })
                .show();

                cancel.depend(win);
                verify.depend(win);

                inputer.appendTo(ui.find("label"));
                tips.appendTo(ui);
                verify.appendTo(ui);
                cancel.appendTo(ui);
                win.append(ui);
            },

            /**
             * 把新建的文件夹保存到服务器
             *
             * @public
             * @method creatFolderFromServer
             * @param {String} name 文件夹名称
             * @param {Object} scene 桌面
             * @param {Object} win 创建文件夹的窗口(tbc.Window的实例)
             * @param {unknown}
             */
            creatFolderFromServer : function(name, scene, win, tips) {

                $.ajax({
                    url  : URLS.saveNewFolder,
                    data : {folderName:(name|| i18n('v4.js.untitled')+i18n('v4.js.folder')), userDeskId:scene.svid||scene.id},
                    type : "post",
                    dataType   : "json",
                    beforeSend :function() { win.lock("loading", i18n("v4.js.loading")); },
                    complete   : function() { win.unlock("loading", i18n("v4.js.loading")); },
                    error      : function() {},
                    success    : function(json) {
                        var translator, fol;
                        if (json) {
                            translator = tbc.webdesk.data.translator.shortcuts;
                            json = translator.transform(json, 'antique');
                            fol  = new tbc.Shortcut(json).appendTo(scene);
                            scene.layout();
                            tbc.jdc.set(["shortcuts", scene.packageName, scene.svid].join("_"), json.userDeskItemId, json);
                            win.close();
                        } else {
                            tips.html(i18n('v4.js.createFolderFailed')).css({color:"red"});
                        }
                    }
                });
            },

            /**
             * 最小化所有窗口
             *
             * @public
             * @method minAll
             */
            minAll : function() {
                var k;
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        tbc.Panel.cache[k].min();
                    }
                }
                // tbc.TaskManager.doWith(function(t) { t && !t.minimize && t.min && t.min(); }, "all");
            },

            /**
             * 设置dock的层级,如果宽度小于1000将其显示在所有窗口后面
             *
             * @public
             * @method setDockZindex
             */
            setDockZindex : function() {
                var w = document.body.offsetWidth;
                if (w<1000) {
                    $(".tbc-desktop-dock").css({zIndex:3});
                } else {
                    $(".tbc-desktop-dock").css({zIndex:4});
                }
            },

            /**
             * 设置dock垂直居中
             *
             * @public
             * @method setDockPosition
             */
            setDockPosition : function() {
                var H = document.body.offsetHeight,
                    d = $(".tbc-desktop-dock"),
                    h = d.height(),
                    st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

                this.setDockZindex();
                d.css({top: (H-h)/2+st });
            },

            /**
             * 初始化图标拖动功能
             *
             * @private
             * @method initDrager
             */
            initDrager : function() {

                this.iconsDrager = new tbc.Drag ({
                    node    : ".tbc-shortcut:not(.tbc-plus-shortcut)",
                    handle  : ".tbc-shortcut-inner",
                    targets : ".tbc-desktop-dock",
                    timeout : 300,
                    selected: ".tbc-shortcut-selected",
                    disableInsertTargets : ".disableInsertTargets,.tbc-scene-title"
                })
                .addEvent({
                    "move" : function(offset) {

                    },

                    "beforeInsert" : function(context) {
                        try {
                            return tbc.system.getTaskByElement(context.node).triggerEvent("beforeMove", context);
                        } catch (e) {
                            return false;
                        }
                    },

                    "afterInsert" : function(context) {

                        var task = tbc.system.getTaskByElement(context.node),
                            result, scene;
                        try {
                            result = task.triggerEvent("afterMove", context);
                            if (window.desktop) {
                                scene = desktop.current();
                                if (scene && $.isFunction(scene.layout)) {
                                    scene.layout();
                                }
                            }
                            return result;
                        } catch (e) {
                            return false;
                        }
                    }
                });
            },

            /**
             * 初始化右键菜单
             *
             * @private
             * @method initContextmenu
             */
            initContextmenu : function() {

                // 判断能否
                function canCreate(shType) {
                    var curr = SELF.current(),
                        type = curr.options.type;

                    shType = (shType || '').toLowerCase();
                    switch (shType) {
                        case 'folder':
                        case 'shortcut':
                            return (type!=='USER' && type!=='ADMIN' && type!=='DESKTOP');
                    }
                }

                var SELF = this,
                    contextmenuOption = [
                        {
                            role : 'user,admin',
                            disabled : false,
                            icon : "icon-folder_modernist_add_simple",
                            text : function() {
                                return (canCreate('folder') && (SELF.isSysAdmin() || tbc.system.settings.allowCreateFolder !== false)
                                        //? "新建文件夹"
                                        ? i18n("v4.js.createFolder")
                                        : null
                                   );
                            },
                            click : function() {
                                SELF.creatFolder(SELF.current());
                            }
                        },
                        {
                            role : 'user,admin',
                            text : function() {
                                return (canCreate('shortcut') && (SELF.isSysAdmin() || tbc.system.settings.allowCreateShortcut !== false)
                                        //? "新建快捷方式"
                                        ? i18n("v4.js.createShortcuts")
                                        : null
                                   );
                            },
                            icon : "icon-heart_add",
                            click : function() {
                                SELF.startSimpleShortcutsAdd();
                            }
                        },
                        {
                            role : 'user,admin',
                            //text : "管理快捷方式",
                            text : i18n("v4.js.manageShortcuts"),
                            icon : "icon-heart_edit",
                            click : function() { SELF.startShortcutsManager(); }
                        },
                        /*
                        {
                            text:"排列桌面图标", icon:"icon-upload", submenu: [
                                {text:"按名称", icon:"", click:function() {}, disabled:true},
                                {text:"按更新时间", icon:"", click:function() {}, disabled:true}
                            ]
                        },
                        {role:'user', text:"设置桌面背景", icon:"icon-image_cultured", click:function() { SELF.selectBg(); }, disabled:function() {return SELF.selecting===true;}, inheritable:false },
                        */
                        {
                            role : 'user',
                            text : function() {
                                return (!SELF.isSysAdmin() && tbc.system.settings.allowChangeBg===false
                                        ? false
                                        //: "设置桌面背景 "
                                        : i18n('v4.js.setWallpaper')
                                   );
                            },
                            icon : "icon-image_cultured",
                            click : function() { SELF.selectBg(); },
                            disabled : function() { return SELF.selecting===true; },
                            inheritable : false
                        },
                        {
                            role : 'admin',
                            text : function() {
                                return (SELF.isSysAdmin() ?
                                    //"设置、背景管理  (管理员)" :
                                    i18n('v4.js.settingAndWallpaper')+" ("+ i18n('v4.js.admin') +")" :
                                    false);
                            },
                            icon : "icon-sprocket_dark",
                            click : function() { SELF.selectBg(SELF.isSysAdmin()); },
                            disabled : function() { return SELF.selecting===true; },
                            inheritable : false
                        },
                        {
                            //text:"重新加载",
                            text: i18n("v4.js.reload"),
                            icon:"icon-refresh",
                            disabled:SELF.group,
                            click:function() {
                                SELF.current().reload();
                            }
                        }, {
                            //text: "清理其他桌面",
                            text: i18n("v4.js.cleanDesk"),
                            icon:"icon-error_do_not_small",
                            inheritable:true,
                            disabled:SELF.group,
                            click:function() {
                                var curr = SELF.current().index,
                                    i, len, scene,
                                    count = 0;
                                for (i=0,len=SELF.tabs.length; i<len; i++) {
                                    scene = SELF.tabs[i];
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
                        },
                        "line",
                        {
                            role : 'user,admin',
                            //text : "屏幕切换",
                            text : i18n("v4.js.switchTo"),
                            icon : "",
                            disabled : function() { return SELF.tabs.length<2; },
                            inheritable : true,
                            submenu : function() {
                                if (SELF.tabs.length>1) {
                                    var sm = [];
                                    $.each(SELF.tabs, function(i,o) {
                                        var tips = this.nameTranslator(this.options.name || this.options.title);
                                        sm.push({
                                            text  : i18n("v4.js.deskIndexList", i+1)+ " (" + tips + ")",
                                            icon  : o.icon(),
                                            click : function() { SELF.show(i); }, disabled:o===SELF.current()
                                        });
                                    });
                                    return sm;
                                }
                            }
                        },
                        {
                            role:'user,admin',
                            //text:"前一屏",
                            text: i18n("v4.js.prevScreen"),
                            icon:"icon-arrow_medium_left",
                            click:function() {
                                SELF.prev();
                            },
                            disabled:function() {
                                return SELF.isFirst();
                            }
                        }, {
                            role:'user,admin',
                            //text:"后一屏",
                            text:i18n("v4.js.nextScreen"),
                            icon:"icon-arrow_medium_right",
                            click:function() {
                                SELF.next();
                            },
                            disabled:function() {
                                return SELF.isLast();
                            }
                        }
                    ];

                this.container.contextmenu({
                    items: contextmenuOption
                });
            },

            /**
             * 初始化
             *
             * @private
             * @method init
             * @chainable
             */
            init : function() {
                var self = this;

                this.packageName = "tbc.Desktop";

                // 加载背景图片
                this.loadBackgorund();

                this.initDrager();

                $(document).ready(function(e) {
                    self.setDockPosition();
                });

                $(window, document).bind("resize.desktop" + this.guid, function() {
                    var cur = self.current();
                    if (cur instanceof tbc.Scene && typeof cur.layout === 'function') {
                        cur.layout();
                    }

                    self.setBackgroundMode();
                    self.setDockPosition();
                });

                return this;
            }
        })
        .init();
    };
}(window.tbc, window.jQuery, window.URLS));
