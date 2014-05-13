;(function(tbc, $, URLS) {

"use strict";

/**
 * 命名空间tbc.shortcut
 */
tbc.namespace("tbc.shortcut");

/**
 * 桌面应用或快捷方式图标类
 *
 * @class tbc.Shortcut
 * @constructor
 * @param {Object} settings 应用配置
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.Shortcut = function(settings) {
    var defaults = {
            html     : null,
            cssClass : null,
            remind_timeout : 3600000,//(1000*60*60=36000000),
            size     : "big", // big/middle/small
            iconBox  : ".tbc-shortcut-icon",
            iconNode : ".tbc-shortcut-icon>img",
            nameNode : ".tbc-shortcut-label",
            tipsNode : ".tbc-shortcut-tips em",
            popNode  : ".tbc-shortcut-pop ol"
        },
        options = tbc.extend({}, defaults, settings),
        desktop = window.desktop;

    options.originateSettings = settings;

    /*
        type = tbc.system.getOpenType(options),
        app  = window.applicationMap[options.applicationId],
        id   = options.userDeskItemId || options.applicationId,
        icon = options.shortcutIconUrl || options.applicationIconUrl,
        name = options.userDeskItemName || options.applicationName,

        shortcut = $(options.html || '<div _id="'+ [type, "shortcut", id].join("_") +'" class="tbc-shortcut" _shortcutId="'+id+'" title="'+ name +'"></div>')
                      .html(
                          '<div class="tbc-shortcut-inner">' +
                          '     <i class="tbc-shortcut-icon"><img title="" alt="" src="'+(icon||'')+'" onerror="this.style.display=\'none\';" onload="this.style.display=\'block\';"><em></em></i>' +
                          '     <span class="tbc-shortcut-label"></span>' +
                          '</div>' +
                          '<sup class="tbc-shortcut-tips" style="display:none;">' +
                          '      <em>0</em>' +
                          '      <div class="tbc-shortcut-pop" style="display:none;"><ol></ol></div>' +
                          '</sup>'
                     ).addClass(options.cssClass),
        iconBox  = $(options.iconBox, shortcut),
        iconNode = $(options.iconNode, shortcut),
        nameNode = $(options.nameNode, shortcut),
        tipsNode = $(options.tipsNode, shortcut),
        popNode  = $(options.popNode, shortcut),
        thumbnail,
        openTipsTimer,
        desktop = window.desktop;


    SELF.packageName = 'tbc.Shortcut';
    SELF.options = options;
    SELF.id   = id;
    SELF.svid = id;
    SELF.ui   = shortcut;
    SELF.ui.attr({tbc: SELF.guid});
    */

    tbc.self (this, arguments)
    .extend({

        /**
         * 类名称
         * @public
         * @property packageName
         * @readOnly
         * @type {String}
         */
        packageName : 'tbc.Shortcut',

        /**
         * 配置数据
         * @public
         * @property options
         * @type {Object}
         */
        options : null,

        /**
         * 图标的html元素
         * @public
         * @property ui
         * @type {jQuery Object}
         */
        ui : null,

        /**
         * 图标的ID, 同数据库ID
         * @public
         * @property svid
         * @type {jQuery Object}
         */
        svid : null,

        /**
         * 图标的寄主，类型可以是文件夹、桌面、dock等实例
         * @public
         * @property host
         * @type {Object}
         */
        host : null,

        /**
         * 图标的UI元素
         * @public
         * @property parts
         * @type {Object}
         */
        parts: {

            /**
             * 快捷方式图标容器, 用于放置图标的<img/> 元素
             * @public
             * @property parts.iconBox
             * @type {jQuery Object}
             */
            iconBox  : null,

            /**
             * 快捷方式的图片元素（<img />）
             * @public
             * @property parts.iconNode
             * @type {jQuery Object}
             */
            iconNode : null,

            /**
             * 快捷方式的名称容器
             * @public
             * @property parts.nameNode
             * @type {jQuery Object}
             */
            nameNode : null,

            /**
             * 快捷方式的数字容器
             * @public
             * @property parts.tipsNode
             * @type {jQuery Object}
             */
            tipsNode : null,

            /**
             * 快捷方式的提示内容预览容器
             * @public
             * @property parts.popNode
             * @type {jQuery Object}
             */
            popNode  : null
        },

        /**
         * 初始化
         * @private
         * @method init
         */
        init : function() {

            var SELF = this,
                icon = options.shortcutIconUrl || options.applicationIconUrl,
                name = options.userDeskItemName || options.applicationName,
                uiid, img;

            this.packageName = "tbc.Shortcut";
            this.type = tbc.system.getOpenType(options);
            this.options = options;
            this.svid = options.userDeskItemId || options.applicationId;
            this.id   = this.svid;

            uiid = [this.type, "shortcut", this.id].join("_");
            img = tbc.system.isImg(icon)
                ? '<img title="" alt="" src="'+ icon +'" onerror="this.style.display=\'none\';" onload="this.style.display=\'block\';"/>'
                : '<img title="" alt="" style="display:none;" onerror="this.style.display=\'none\';" onload="this.style.display=\'block\';"/>';

            this.ui = options.html ?
                    $(options.html) :
                    $('<div class="tbc-shortcut"></div>')
                      .html(
                          '<div class="tbc-shortcut-inner">' +
                          '     <i class="tbc-shortcut-icon">'+ img +'<em></em></i>' +
                          '     <span class="tbc-shortcut-label"></span>' +
                          '</div>' +
                          '<sup class="tbc-shortcut-tips" style="display:none;">' +
                          '      <em>0</em>' +
                          '      <div class="tbc-shortcut-pop" style="display:none;"><ol></ol></div>' +
                          '</sup>'
                    )
                    .addClass(options.cssClass);

            this.ui.attr({
                'tbc'   : this.guid,
                '_id'   : uiid,
                'title' : name,
                '_shortcutId' : options.userDeskItemId
            });

            tbc.extend(this.parts, {
                iconBox  : $(options.iconBox, this.ui),
                iconNode : $(options.iconNode, this.ui),
                nameNode : $(options.nameNode, this.ui),
                tipsNode : $(options.tipsNode, this.ui),
                popNode  : $(options.popNode, this.ui)
            });

            this.icon(icon);
            this.name(name);

            if (!icon) {
                this.parts.iconNode.hide();
            }

            this.initReminder();
            this.initContextmenu();
            this.initEvent();
            this.initFolderIcon();
            this.initClick();
        },

        /**
         * 初始化应用的数字提示
         * @private
         * @method initReminder
         */
        initReminder : function() {
            var SELF = this,
                remindTime = (this.type==='FOLDER') ? options.remind_timeout/2 : options.remind_timeout;
            // 向服务器轮询消息
            if (this.type === "FOLDER" || (options.reminderUrl && $.trim(options.reminderUrl.length>0))) {
                this.receiveReminder();
                this.interval = setInterval(function() {
                    SELF.receiveReminder();
                }, remindTime);
            }

            this.parts.tipsNode.parent().bind({
                "mouseenter": function(event) {

                    SELF.openTipsTimer = setTimeout(function() {
                        if (this.parts.popNode.filter(":visible").size()===0) {
                            SELF.openTips();
                        }
                    },300);

                    event.stopPropagation();
                    return false;
                },
                "mouseleave": function() {
                    clearTimeout(SELF.openTipsTimer);
                    SELF.hideTips();
                }
            });

            this.parts.popNode.click(function(event) {
                event.stopPropagation();
                return false;
            });
        },

        /**
         * 初始化文件夹图标, 为文件夹增加缩略图的相关方法
         * @private
         * @method initFolderIcon
         */
        initFolderIcon : function() {
            var SELF = this,
                thumbnail;

            switch (this.type) {
                case "FOLDER":

                    /**
                     * 设置文件夹内容
                     * @public
                     * @method setFolderContent
                     * @param {String} id 文件夹ID
                     */
                    this.setFolderContent = function() {
                        var id = this.options.userDeskItemId,
                            data = tbc.webdesk.data.folders[id],
                            folderSht = data ? data.children : [],
                            i, len,
                            child,
                            jdcId = ["shortcuts", "tbc.Folder", id].join("_");

                        for (i=0,len=folderSht.length; i<len; i+=1) {
                            child = folderSht[i];
                            tbc.jdc.set(jdcId, child.userDeskItemId, child);
                            this.thumbnail.append(child.userDeskItemId, child.applicationIconUrl, child.itemType);
                        }
                        this.thumbInited = true;
                        this.receiveReminder();
                    };

                    /**
                     * 加载数据
                     * @method loadData
                     * @return {[type]} [description]
                     */
                    this.loadData = function () {
                        var SELF = this;
                        tbc.Folder.load (options.folderId || options.userDeskItemId, function(data) {
                            options.data = data;

                            $.each (data, function (i) {
                                tbc.jdc.set(["shortcuts", "tbc.Folder", SELF.svid].join("_"), this.userDeskItemId, this);
                                SELF.thumbnail.append(this.userDeskItemId, this.applicationIconUrl, this.type);
                            });

                            SELF.receiveReminder();
                        });
                    };

                    this.ui.addClass("tbc-folder-shortcut");

                    thumbnail = $('<i class="tbc-folder-thumbnail"></i>').insertAfter(this.parts.iconNode);
                    this.parts.iconNode.remove();

                    this.thumbnail = {
                        length:0,
                        store:{},
                        append : function(id, icon, type) {
                            var img;

                            icon = icon || (type==='FOLDER'?'/webdesk/css/default/images/folder_min.png':'');

                            if (!this.store[id]) {
                                img = tbc.system.isImg(icon)
                                    ? '<img title="" alt="" src="'+ icon +'" />'
                                    : '<img title="" alt="" style="display:none;" />';

                                thumbnail.append('<i class="tbc-folder-thumbnail-icon" _folderid="'+id+'" class="tbc-folder-thumbnail-icon">'+ img +'</i>');
                                this.length+=1;
                                this.store[id] = id;
                            }
                            return this;
                        },
                        remove : function(id) {
                            $('[_folderid='+id+']', thumbnail).empty().remove();
                            if (this.store[id]) {
                                this.length-=1;
                            }
                            delete this.store[id];
                            return this;
                        }
                    };

                    this.setFolderContent();

                    break;

                case "APP":
                case "APPLICATION":
                    this.ui.addClass("tbc-app-shortcut");

                    break;

                case "LINK":

                    break;
            }
        },

        /**
         * 初始化右键菜单
         * @private
         * @method initContextmenu
         */
        initContextmenu : function() {
            var SELF = this;
            this.ui.contextmenu({
                items : [
                    {
                        text: i18n('v4.js.open'), //"打开",
                        icon:"icon-application_windows_add",
                        click: function() { SELF.open(); }
                    }, {
                        text: function() {
                            return SELF.type === "FOLDER" ?
                                i18n('v4.js.rename'): //"重命名文件夹" :
                                false;
                        },
                        icon: function(){
                            return SELF.type ==='FOLDER' ? 
                                'icon-folder_modernist_edit' : 
                                "icon-tag_edit";
                        },
                        click: function() { SELF.startRename(); },
                        disabled: function() {
                            return SELF.type !== "FOLDER";
                        }
                    },
                    {
                        text: function() {
                            return SELF.type === "FOLDER"?
                                i18n('v4.js.delete'): //"删除文件夹":
                                false;
                        },
                        icon: "icon-folder_classic_stuffed_remove", 
                        click:function() { SELF.del(); },
                        disabled:function() {
                            return SELF.type !== "FOLDER"; 
                        }
                    }, {
                        text: function() {
                            return SELF.ui.parent().hasClass("tbc-desktop-dock") ? 
                                false : 
                                i18n('v4.js.moveTo') //"移动到...";
                            },
                        icon:"icon-breadcrumb_separator_arrow_2_dots",
                        submenu : function() {
                            if (window.desktop.tabs.length>1) {
                                var sm = [];
                                $.each(window.desktop.tabs, function(i, o) {
                                    var opt = this.options,
                                        text,
                                        disabled;

                                    text = (i18n('v4.js.deskIndexList', (i+1))+" - [") + this.nameTranslator(opt.name || opt.title) + "]";

                                    if (opt.type === "USER" || opt.type === "ADMIN" || opt.type === "OTHER" || opt.type === "DESKTOP") {
                                        if (o===SELF.host) {
                                            disabled = true;
                                            text += " -- "+i18n('v4.js.currDesk');
                                        }
                                    } else {
                                        //text += " -- (此桌面不支持应用)";
                                        text += " -- ("+ i18n('v4.js.deskNotAllowApp') +")";
                                        disabled = true;
                                    }

                                    sm.push({
                                        text    : text,
                                        icon    : o.icon(),
                                        click    : function (event) {
                                            var oldSecen = SELF.host,
                                                from;

                                            // 移动其他选中的图标
                                            SELF.ui.siblings(".tbc-shortcut-selected").each(function(i,shc) {
                                                var shcCtrl = $(shc).attr("tbc"), shct = tbc.TASKS(shcCtrl);
                                                if (shct) {
                                                    shct.moveToScene(o);
                                                }
                                            });

                                            // 如果是文件夹或者快捷文件夹
                                            from = tbc.system.getTaskByElement (SELF.ui.parent());
                                            if (from.packageName === "tbc.Folder" || from.packageName === "tbc.folder.Pop") {
                                                SELF.moveOutFolder(from, o);
                                            }

                                            // 移动点击的图标
                                            SELF.moveToScene(o);

                                            oldSecen.layout();
                                            if (event && event.ctrlKey) {
                                                window.desktop.show(i);
                                            }
                                            oldSecen = null;
                                        },
                                        disabled : disabled
                                    });
                                });
                                return sm;
                            }
                            return false;
                        }
                    }
                ],
                event:{
                    show : function() { this.find(".tbc-shortcut-inner").addClass("tbc-shortcut-inner-mousedown"); },
                    hide : function() { this.find(".tbc-shortcut-inner").removeClass("tbc-shortcut-inner-mousedown"); }
                }
            });
        },

        /**
         * 初始化鼠标事件
         * @private
         * @method initClick
         */
        initClick : function() {
            var SELF = this;
            this.ui.bind({
                "click" : function(event) {

                    var ui = $(this),
                        task;

                    clearTimeout(SELF.openTimeout);

                    $.post(URLS.accessicon, {userDeskItemId : options.userDeskItemId });

                    // 按住CTRL键时只选中不做任何其他操作
                    if (event.ctrlKey) {

                        if (ui.hasClass("tbc-shortcut-selected")) {
                            ui.removeClass("tbc-shortcut-selected");
                        } else if (SELF.type !== 'FOLDER') {
                            ui.addClass("tbc-shortcut-selected");
                        }

                    } else {

                        task = tbc.TaskManager.get("folder", options.userDeskItemId);

                        // 如果是文件夹并且没有打开,则以POP快速打开方式打开
                        if (SELF.type === "FOLDER" && !task) {
                            if (SELF.pop) {
                                SELF.pop.close();
                            } else {
                                SELF.openTimeout = setTimeout(function() { SELF.pop = SELF.openPopFolder(); }, 100);
                            }

                            $("body").trigger("click.hideContextmenu");

                        // 打开应用或文件夹
                        }else{
                            SELF.open();
                        }
                        task=null;
                    }
                },
                "dblclick": function() {
                    clearTimeout(SELF.openTimeout);
                    SELF.open();
                    if (SELF.pop) {
                         SELF.pop.close();
                    }
                }
            });
        },

        /**
         * 初始化事件
         * @private
         * @method initEvent
         */
        initEvent : function() {

            this.addEvent({

                /* 准备移动前 **
                 * @PARA: context{}
                 *         from    : 来源节点,即原来所在的节点;
                 *        to        : 移动到的节点,即新的节点;
                 *        marks    : 位置参照节点,即移动到该节点前面或后面;
                 *        node    : 被拖动的节点;
                 *        selected: 其他选中的节点;
                 *
                 * @RETURN: boolean 返回false将会阻止移动到新位置;其他没有任何作用;
                 */
                beforeMove : function(context) {

                    var fromDock = context.from.hasClass("tbc-desktop-dock"),
                        toDock   = context.to.hasClass("tbc-desktop-dock"),
                        ret, sid,

                        sh, op, shts, exist, existO, newShortcut,

                        guid, folderIcon, fd;

                    // 文件夹
                    if (context.node.hasClass("tbc-folder-shortcut") && (context.to.hasClass("tbc-folder-container")||context.to.hasClass("tbc-pop-container"))) {

                        // 拖到文件夹上
                        if (context.marks.hasClass("tbc-folder-shortcut")) {
                            context.transfer = context.from;
                        }
                        ret = false;

                    // 移进或移出 快捷启动栏
                    } else if (fromDock || toDock) {

                        if (fromDock && toDock) {
                            setTimeout(function(){
                                desktop.saveDockShortcuts();
                            }, 100);
                            return;
                        }

                        if (fromDock && !toDock) {

                            sid = context.node.attr("tbc");
                            tbc.TASKS(sid).DESTROY();
                            context.node.remove();
                        }

                        if (toDock && !fromDock) {
                            if (context.node.hasClass("tbc-folder-shortcut")) {
                                //alert("暂不支持在快捷栏放置文件夹.");
                                alert(i18n('v4.js.dockNotAllowFolder'));
                            } else if (context.selected.size()) {
                                //alert("不能拖多个图标到快捷栏.");
                                alert(i18n('v4.js.dockNotAllowMultApps'));
                            } else {

                                sh    = tbc.system.getTaskByElement(context.node);
                                op    = sh.options;
                                shts  = $(".tbc-desktop-dock .tbc-shortcut");
                                exist = false;

                                shts.each(function(i, o) {
                                    var sht = tbc.system.getTaskByElement(this);
                                    //if (this.getAttribute("_shortcutid") === op.userDeskItemId) {
                                    if ((sht.options.applicationId === op.applicationId) || (sht.options.appCode === op.appCode && op.appCode)) {
                                        exist  = true;
                                        existO = this;
                                        return false;
                                    }
                                });

                                if (exist === true) {
                                    context.transfer = existO;
                                } else {
                                    newShortcut = new tbc.Shortcut(op);

                                    if (context.marks.size()) {
                                        newShortcut.ui.insertAfter(context.marks);
                                    } else {
                                        newShortcut.appendTo(context.to);
                                    }

                                    if (shts.size()>4) {
                                        sh = tbc.system.getTaskByElement(shts.filter(":last"));
                                        shts.filter(":last").empty().remove();
                                        if (sh) {
                                            sh.DESTROY();
                                        }
                                    }
                                }

                            }
                        }

                        setTimeout(function(){
                            desktop.saveDockShortcuts();
                        }, 100);

                        ret = false;

                    // 移动到文件夹图标上方:(接受子文件夹图标)
                    //} else if (context.marks.hasClass("tbc-folder-shortcut") && context.node[0] !== context.marks[0]) {

                    // 移动到文件夹图标上方:(只接受非文件夹图标)
                    } else if (context.marks.hasClass("tbc-folder-shortcut") && context.node[0] !== context.marks[0] && !context.node.hasClass("tbc-folder-shortcut")) {

                        guid    = context.marks.attr("tbc");
                        folderIcon = tbc.TASKS.get(guid);
                        fd = tbc.TaskManager.get("folder", folderIcon.svid);

                        if (fd) {

                            // 移动到打开的文件夹
                            context.transfer = fd.container;

                        } else if (folderIcon.pop) {

                            // 移动到快速打开的POP文件
                            context.transfer = folderIcon.pop.container;

                        } else {
                            context.terminal = context.marks;
                        }
                        folderIcon = fd = null;
                        ret = false;
                    }
                    return ret;
                },

                /* 移动后 */
                afterMove : function(context) {
                    var to = context.terminal || context.transfer || context.to,
                        scene;

                    // 如果拖动前后都在同一容器内, 则视为排序;
                    if (context.to[0]===context.from[0]) {
                        scene = tbc.system.getTaskByElement(context.from) || tbc.system.getTaskByElement(context.from.parents("[tbc]:first"));
                        setTimeout(function(){
                            scene.saveOrder();
                        }, 200);
                    }

                    // 如果新容器不是桌面,则清除图标的绝对定位;
                    if (to.hasClass("tbc-desktop-dock") || to.hasClass("tbc-folder-container") || to.hasClass("tbc-pop-container")) {

                        context.selected.css({position:"relative", left:"auto", top:"auto"});
                        context.node.css({position:"relative", left:"auto", top:"auto"});

                    // 如果是桌面,设置图标为绝对定位;
                    } else if (to.hasClass("tbc-slide-scene")) {
                        context.node.css({position:"absolute"});
                        context.selected.css({position:"absolute"});
                    }
                    to = null;

                    this.move(context);
                },

                destroy : function () {
                    if (this.host instanceof tbc.Scene) {
                        this.host.layout();
                    }
                    this.stopReceiveReminder();
                    defaults = options = null;
                }
            });
        },

        /**
         * 更新应用或快捷方式的配置数据
         * @public
         * @method updateOptions
         * @param {String key | Object} 配置项key或者配置单
         */
        updateOptions : function(key, value) {
            var opts,
                k;
            if (typeof key === 'string' && typeof value !== 'undefined') {
                opts = {};
                opts[key] = value;
            } else {
                opts = key;
            }

            if (opts instanceof Object) {
                for (k in opts) {
                    if (opts.hasOwnProperty(k)) {
                        this.options[k] = this.options.originateSettings[k] = opts[k];
                    }
                }
            }
        },

        /**
         * 设置或获取快捷方式的icon 路径
         * @public
         * @method icon
         * @param {string} [url] 设置图标的图片路径，如果传入该参数将改变快捷方式的图标，否则返回原图标的地址
         * @return {Object|String} 如果有url参数，则返回实例本身，否则返回原图标地址
         */
        icon : function(url) {
            var ret;
            if (url===undefined) {
                ret = this.parts.iconNode.attr("src");
            } else if (typeof url === "string") {

                if (url.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || url.indexOf("sf-server/file/getFile/") !== -1) {
                    this.parts.iconNode.show().attr("src", url);
                } else {
                    this.parts.iconNode.hide().parent().addClass(url);
                }

                this.updateOptions('shortcutIconUrl', url);
                this.triggerEvent("changeIcon", url);
                return this;
            }
            return ret;
        },

        /**
         * 设置或获取快捷方式的显示名称
         * @public
         * @method name
         * @param {string} [name] 快捷方式的名称，如果传入该参数将改变显示名称，否则返回原来的名称
         * @param {Boolean} [stopRenameWindow] 阻止重命名与此快捷方式有关的窗口，一般情况不需要此
         *          参数, 如果是从改快捷方式打开的窗口内重命名，则需要传入true, 否则会引起死循环.
         * @return {Object|String} 如果有name参数，则返回实例本身，否则返回原名称
         */
        name : function(name, stopRenameWindow) {

            var ret;

            if (typeof name === undefined) {
                ret = this.parts.nameNode.html();
            } else {

                this.updateOptions('userDeskItemName', name);

                this.parts.nameNode.html(name);
                this.ui.attr("title", name);
                this.updateOptions("userDeskItemName", name);
                this.triggerEvent("changeName", name);

                if (stopRenameWindow !== true && this.window) {
                    this.window.name(name);
                }
                return this;
            }

            return ret;
        },

        /**
         * 设置或获取快捷方式的提示数字
         * @public
         * @method tip
         * @param {Number} [tips] 快捷方式的提示数字，如果传入该参数将改变提示数字，否则返回提示数字
         * @return {Object|Number} 如果有tips参数，则返回实例本身，否则返回提示数字
         */
        tip : function(tips) {
            var ret;
            if (tips && tips.match) {
                if (tips.match(/^\+=/)) {
                    tips = this.tip() + window.parseInt(tips.replace(/^\+=/,""));
                } else if (tips.match(/^\-=/)) {
                    tips = this.tip() - window.parseInt(tips.replace(/^\-=/,""));
                }
            }

            if (!isNaN(tips) && tips>0) {
                this.parts.tipsNode.html(tips).parent().show();
                this.triggerEvent("changeTips", tips);
                ret = this;
            } else if (tips===0 || window.parseInt(tips)===0) {
                this.parts.tipsNode.html("").parent().hide();
                ret = this;
            } else {
                ret = window.parseInt($.trim(this.parts.tipsNode.html()) || 0);
            }

            try {
                return ret;
            } finally {
                ret = null;
            }
        },

        data : {},


        /**
         * 设置或获取快捷方式的提示数字
         * @public
         * @beta
         * @method tip
         * @param {Number} [tips] 快捷方式的提示数字，如果传入该参数将改变提示数字，否则返回提示数字
         * @return {Object|Number} 如果有tips参数，则返回实例本身，否则返回提示数字
         */
        openTips : function() {
            this.parts.popNode.empty();
            if (this.data.reminder) {
                var l = [];
                $.each(this.data.reminder, function(i, r) {
                    if (i>4) {
                        return false;
                    }

                    l.push('<li>'+ r.title +'</li>');
                });

                if (l.length>0) {
                    this.parts.popNode.append(l.join(""));
                    this.parts.popNode.parent()
                    .css({width:0, height:0, display:"block"});

                    this.keepVisible();
                    this.parts.popNode.parent().animate({ width:260, height:140 }, 300, "easeInOutBack");
                }
            }
            return this;
        },

        // 保持pop提示可见
        keepVisible : function() {

            var uiw        = this.ui.width(),
                uih        = this.ui.height(),
                uil        = this.ui[0].offsetLeft,
                uit        = this.ui[0].offsetTop,
                uir        = uil + uiw,
                uib        = uit + uih,
                pw        = 260,
                ph        = 140,
                bodyH    = this.ui.offsetParent()[0].offsetHeight,
                bodyW    = this.ui.offsetParent()[0].offsetWidth,

                right, left, top="0", bottom="auto";

            if (uir+pw>bodyW && pw<uil) {
                right    = uiw-18;
                left    = "auto";
            }else{
                right    = "auto";
                left    = "18px";
            }

            top = uit+ph>bodyH ? bodyH-(uit+ph) : 0;

            this.parts.popNode.parent().css({top:top, bottom:bottom, left:left, right:right});
        },

        // 收起提醒
        hideTips : function() {
            this.parts.popNode.parent().animate({ width:0, height:0 }, function() { $(this).css({ display:"none" }); });
        },

        // 在某区域显示
        appendTo : function(target) {

            if (target.container) {
                this.host = target;
                target.shortcuts = target.shortcuts || {};
                target.shortcuts[options.userDeskItemId] = settings;
                this.ui.appendTo(target.container);
                this.position = target;
            } else {
                this.ui.appendTo(target);
            }

            return this;
        },

        // 在某区域显示
        prependTo : function(target) {
            if (target.container) {
                this.host = target;
                target.shortcuts = target.shortcuts || {};
                target.shortcuts[options.userDeskItemId] = settings;
                this.ui.appendTo(target.container);
            }else{
                this.ui.prependTo(target);
            }

            return this;
        },

        // 从某一容器移动到另一容器
        move : function(context) {

            var nodes = $(context.node).add($(context.selected)),
                to    = tbc.system.getTaskByElement(context.terminal||context.transfer||context.to),
                from  = tbc.system.getTaskByElement(context.from),
                method,
                methodFrom;

            if (from) {
                switch(from.constructor) {
                    case tbc.Scene     : methodFrom="moveOutScene";    break;
                    case tbc.Folder    :
                    case tbc.folder.Pop:
                    case tbc.Shortcut  : methodFrom="moveOutFolder";    break;
                    default: break;
                }
            }

            if (to) {
                switch(to.constructor) {
                    case tbc.Scene     : method = "moveToScene";        break;
                    case tbc.Folder    : method = "moveToFolder";        break;
                    case tbc.folder.Pop: method = "moveToFolderPop";    break;
                    case tbc.Shortcut  : method = "moveToFolderIcon";    break;
                    default : break;
                }
            }

            if (method) {
                nodes.each(function(i, icon) {
                    var sht        = tbc.system.getTaskByElement(icon);
                        from.reLayout = to.reLayout = (i>=nodes.length-1);
                    if (sht && from !== to) {

                        if (tbc.isFunction(sht[methodFrom])) {
                            sht[methodFrom](from, to);
                        }

                        if (tbc.isFunction(sht[method])) {
                            sht[method](to);
                        }
                    }
                    sht = icon = null;
                });
            }

            this.receiveReminder();

            nodes = to = from = method = methodFrom = context = null;
        },

        // 移动到某一屏幕
        moveToScene : function(scene, saveToServer) {

            var dataOfCache,
                packageName,
                guid, svid, shortcutsOld;
            if (this.host) {
                this.undepend(this.host);

                if (this.host.layout) {
                    this.host.layout();
                }

                // 缓存数据
                packageName = this.host.packageName === "tbc.folder.Pop" ? "tbc.Folder" : this.host.packageName;

                dataOfCache = tbc.jdc.select(["shortcuts", packageName, this.host.svid].join("_"), this.svid);
                tbc.jdc.del(["shortcuts", packageName, this.host.svid].join("_"), this.svid);
                tbc.jdc.set(["shortcuts", scene.packageName, scene.svid].join("_"), this.svid, dataOfCache);

                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {

                    svid = this.host.svid;
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    shortcutsOld.thumbnail.remove(this.svid);
                    shortcutsOld.receiveReminder();
                }

                if (saveToServer !== false){
                    tbc.Shortcut.moveToScene(scene.options.id, this.svid);
                }

                // 设置新的host(宿主)
                this.host = scene;

            }
            this.depend(scene);

            if (scene.container.children().index(this.ui) === -1) {
                scene.append(this, false, dataOfCache);
            }
            dataOfCache = null;

            this.triggerEvent("moveToScene", scene);
            //SELF.

            // 如果图标所移到的桌面还没有加载，则销毁此图标实例，因为当桌面加载时会重新加载此图标
            if (!scene.loaded) {
                this.DESTROY();
            }
        },

        // 移出某一屏幕
        moveOutScene : function(scene, terminal) {

        },

        // 移动到左边快捷栏
        moveToDock : function() {
            var dock;
            if (this.host) {
                this.undepend(this.host);
                if (this.host.layout) {
                    this.host.layout();
                }
                this.host = null;
            }

            dock = $(".tbc-desktop-dock");
            if (dock.children().index(this.ui) === -1) {
                this.appendTo(dock);
            }
            this.triggerEvent("moveToDock", dock);
        },

        // 移出左边快捷栏
        moveOutDock : function(terminal) {

        },

        // 移动到文件夹
        moveToFolder : function(folder, saveToServer) {
            var dataOfCache,
                packageName,
                host = this.host,
                svid = this.svid,
                h_svid,
                guid, shortcutsOld, folderIcon
                ;

            if (host) {

                h_svid = host.svid;

                this.undepend(host);

                if (host.layout && folder.reLayout) {
                    host.layout();
                }

                // 缓存数据
                packageName = (host.packageName === "tbc.folder.Pop") ? "tbc.Folder" : host.packageName;

                dataOfCache = tbc.jdc.select(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.del(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.set(["shortcuts", folder.packageName, folder.svid].join("_"), svid, dataOfCache);

                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ h_svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    shortcutsOld.thumbnail.remove(svid);
                    shortcutsOld.receiveReminder();
                }

                // 保存到服务器
                if (saveToServer !== false) {
                    tbc.Shortcut.moveToFolder(folder.svid, svid);
                }

                // 增加文件夹图标的缩略图
                folderIcon = tbc.system.getTaskByElement (".tbc-folder-shortcut[_shortcutid='"+ folder.svid +"']");
                folderIcon.thumbnail.append (svid, dataOfCache.applicationIconUrl, dataOfCache.itemType);
                folderIcon.receiveReminder();

                this.host = folder;
                dataOfCache = null;
            }

            this.depend(folder);

            if (folder.container.children().index(this.ui) === -1) {
                folder.append(this.ui);
            }
            this.triggerEvent("moveToFolder", folder);
        },

        // 移出文件夹
        moveOutFolder : function(from, terminal) {
            var SELF = this,
                svid = from.svid,
                task = tbc.system.getTaskByElement($("[_shortcutid='"+svid+"']"));
                task.thumbnail.remove(svid);

            $.ajax({
                url        : URLS.shortcutMoveOutFolder,
                type    : "post",
                dataType: "json",
                data    : { "folderUserDeskItemId":svid, "userDeskItemId":this.svid },
                success    : function(json) {
                    if (json.result) {
                        if (terminal.packageName === "tbc.Scene") {
                            var dataOfCache = tbc.jdc.select(["shortcuts", "tbc.Folder", svid].join("_"), SELF.svid);
                            tbc.jdc.del(["shortcuts", "tbc.Folder", svid].join("_"), SELF.svid);
                            if (dataOfCache) {
                                tbc.jdc.set(["shortcuts", terminal.packageName, terminal.svid].join("_"), SELF.svid, dataOfCache);
                                dataOfCache = null;
                            }
                        }
                    }
                }
            });
        },

        /**
         * 移动到POP文件夹
         * @param  {tbc.folder.Pop} folderPop    快捷文件夹实例
         * @param  {Boolean} [saveToServer=true] 是否保存到服务器, 如果参数值不为
         *                                       false，则会调用一个AJAX请求，否则
         *                                       不保存，默认true
         */
        moveToFolderPop : function(folderPop, saveToServer) {
            var dataOfCache,
                packageName,
                host = this.host,
                svid = this.svid,
                h_svid = host.svid,
                guid,
                shortcutsOld,
                folderIcon;

            if (host) {
                this.undepend(host);

                if (host.layout && folderPop.reLayout) {
                    host.layout();
                }

                packageName = (host.packageName === "tbc.folder.Pop") ? "tbc.Folder" : host.packageName;

                // 缓存数据
                dataOfCache = tbc.jdc.select(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.del(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.set(["shortcuts", "tbc.Folder", folderPop.svid].join("_"), svid, dataOfCache);

                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ h_svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);

                    shortcutsOld.thumbnail.remove(svid);
                    shortcutsOld.receiveReminder();
                }

                // 保存到服务器
                if (saveToServer !== false) {
                    tbc.Shortcut.moveToFolder(folderPop.svid, svid);
                }

                // 增加文件夹图标的缩略图
                folderIcon = tbc.system.getTaskByElement(".tbc-folder-shortcut[_shortcutid='"+ folderPop.svid +"']");

                folderIcon.thumbnail.append(svid, dataOfCache.applicationIconUrl, dataOfCache.itemType);
                folderIcon.receiveReminder();

                this.host = folderPop;
                if (folderPop.layout && folderPop.reLayout) {
                    folderPop.layout();
                }
                dataOfCache = null;
            }
            this.depend(folderPop);
            if (folderPop.container.children().index(this.ui) === -1) {
                folderPop.append(this.ui);
            }

            this.triggerEvent("moveToFolder", folderPop);
        },

        // 移出POP文件夹
        moveOutFolderPop : function(folderPop, terminal) {

        },

        // 移动到文件夹图标上
        moveToFolderIcon : function (shortcut) {
            var dataOfCache,
                packageName,
                host = this.host,
                svid = this.svid,
                h_svid = host.svid,
                guid, shortcutsOld,
                icon = this.options.shortcutIconUrl || this.options.applicationIconUrl;

            if (host) {
                this.undepend(host);
                if (host.layout && shortcut.reLayout) {
                    host.layout();
                }

                // 缓存数据
                packageName = host.packageName === "tbc.folder.Pop" ? "tbc.Folder" : host.packageName;

                dataOfCache = tbc.jdc.select(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.del(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.set(["shortcuts", "tbc.Folder", shortcut.svid].join("_"), svid, dataOfCache);

                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ h_svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    shortcutsOld.thumbnail.remove(svid);
                    shortcutsOld.receiveReminder();
                }

                // 保存到服务器
                tbc.Shortcut.moveToFolder(shortcut.svid, svid);

                this.host = null;
            }
            dataOfCache = null;

            shortcut.thumbnail.append(svid, icon, this.options.itemType);
            shortcut.receiveReminder();
            this.triggerEvent("moveToFolderIcon", shortcut);
            this.ui.remove();
            this.DESTROY();
        },

        // 移动到开始菜单
        moveToStartMenu : function(StartMenu) {
            if (this.host) {
                this.undepend(this.host);
                if (this.host.layout) {
                    this.host.layout();
                }
                this.host = StartMenu;
            }

            this.depend(StartMenu);

            if (StartMenu.container.children().index(this.ui)===-1) {
                StartMenu.append(this.ui);
            }
            this.triggerEvent("moveToStartMenu", StartMenu);
        },

        // 移出开始菜单
        moveOutStartMenu : function(startmenu) {

        },

        // 移除某一容器
        removeData : function(host) {
            if (host) {
                switch(host.constructor) {
                    case tbc.Folder:
                        this.moveOutFolder(host);
                        break;

                    case tbc.folder.Pop:
                        this.moveOutFolderPop(host);
                        break;

                    case tbc.desktop.Scene:
                        this.moveOutScene(host);
                        break;

                    case tbc.Startmenu:
                        this.moveOutStartMenu(host);
                        break;
                }
            }
        },

        // 接收提示
        receiveReminderDeferTime:null,
        receiveReminder : function(noCache) {
            var SELF = this;
            clearTimeout(this.receiveReminderDeferTime);
            this.receiveReminderDeferTime = setTimeout(function() {
                if (SELF.type) {
                    switch (SELF.type) {
                        case "FOLDER":
                            SELF.receiveReminderForFolder(noCache);
                            break;

                        case "APP":
                            SELF.receiveReminderForApp(noCache);
                            break;

                        default:
                            SELF.receiveReminderForApp(noCache);
                            break;
                    }
                }
            }, 300);
        },

        // 文件夹提示
        receiveReminderForFolder : function(noCache) {

            var SELF = this,
                data = tbc.jdc.select("shortcuts_tbc.Folder_"+ options.userDeskItemId, "all"),
                lastRemind = tbc.jdc.select("appLastRemindTime", options.userDeskItemId),
                countAll;

            // 文件夹内的应用图标
            if (data) {

                this.data = this.data||{};
                this.data.reminder = [];
                //SELF.tip(0);

                countAll = 0;
                $.each(data, function(i, opt) {

                    if (opt === null) {
                        return;
                    }

                    // 在本地存储最后请求消息的时间
                    var lastRemind     = tbc.jdc.select("appLastRemindTime", opt.applicationId || opt.userDeskItemId),
                        lastRemindTime = options.lastAccessTimestamp,
                        now = new Date().getTime();

                    // 如果不从缓存取提示的数字
                    // 或者没有最后更新数字的时间戳
                    // 或者有上次更新的时间戳，但是已经超过设定的时间间隔
                    if (noCache || !lastRemind || (now-lastRemind.readTime)>SELF.options.remind_timeout) {

                        if (opt.reminderUrl) {
                            $.ajax ({
                                url     : opt.reminderUrl,
                                type    : "post",
                                data    : {lastAccessTimestamp: lastRemindTime},
                                dataType: "json",
                                cache   : false,
                                complete: function() {},
                                error   : function() {},
                                success : function(json) {
                                    // json = '{ "result":20120607, "number":111, "reminder":[{title:"111"}]}';
                                    var itemId = opt.applicationId || opt.userDeskItemId;
                                    countAll += json.number || 0;

                                    if (json.number>0) {
                                        options.reminder = options.reminder || json;
                                        SELF.data.reminder = SELF.data.reminder.concat(json.data);

                                        SELF.tip(countAll);
                                    }

                                    // 缓存应用消息数量和时间
                                    tbc.jdc.set("appLastRemindTime", itemId, {time:lastRemindTime, readTime:now, count:json.number || (lastRemind?lastRemind.count:0) });
                                }
                            });
                        }
                    } else {
                        countAll += (lastRemind ? lastRemind.count||0 : 0);
                        SELF.tip(countAll);
                    }
                });
            }
        },

        // 应用提示
        receiveReminderForApp : function(noCache) {

            var SELF = this,
                lastRemind     = tbc.jdc.select("appLastRemindTime", options.applicationId),
                lastRemindTime = options.lastAccessTimestamp,
                url            = options.reminderUrl,
                now            = new Date().getTime();

            if (url && (noCache || !lastRemind || (now-lastRemind.readTime)>this.options.remind_timeout)) {
                $.ajax({
                    url   : url,
                    type  : "post",
                    data  : { lastAccessTimestamp : lastRemindTime },
                    cache : false,
                    dataType : "json",
                    complete : function() {},
                    error    : function() {},
                    success  : function(json) {
                        // json === '{ "result":20120607, "number":111}';

                        options.reminder = json;

                        if (SELF.tip) {
                            SELF.tip(json.number);
                        }
                        SELF.data = SELF.data || {};
                        SELF.data.reminder = json.data;

                        // 缓存消息数量和最后请求时间
                        tbc.jdc.set("appLastRemindTime", options.applicationId, { time:lastRemindTime, readTime:now, count:json.number });
                    }
                });
            } else if (lastRemind && typeof this.tip === 'function') {
                this.tip(lastRemind.count);
            }
        },

        // 停止接收提示
        stopReceiveReminder : function() {
            clearInterval(this.interval);
            return this;
        },

        // 更新 读取消息的时间
        updateRemindeTime : function() {

            if (this.type === "APP") {
                var last    = tbc.jdc.select("appLastRemindTime", options.applicationId),
                    now     = new Date().getTime(),
                    reminde = {
                        time     : last && last.time ? last.time : options.lastAccessTimestamp,
                        readTime : now,
                        count    : last ? last.count||0 : 0
                    };

                options.lastAccessTimestamp = now;

                // 缓存消息数量和最后请求时间
                tbc.jdc.set("appLastRemindTime", options.applicationId, reminde);
            }
        },

        // 按不同的打开方式打开
        open : function() {

            var SELF = this,
                appId = options.userDeskItemId;

            this.updateRemindeTime();
            this.window = tbc.system.open(options);

            if (appId) {
                if (this.window) {
                    this.window.addEvent ("afterClose", function() {
                        var ic = $(".tbc-folder-thumbnail-icon[_folderid='"+ appId +"']"),
                            task=tbc.system.getTaskByElement(ic);
                        if (ic.size() && task) {
                            task.receiveReminder(true);
                        } else {
                            // 关闭后更新提示数字
                            SELF.receiveReminder(true);
                        }
                        appId = null;
                    });
                }
            }

            if (this.pop) {
                this.pop.close();
                this.pop = null;
            }

            if (this.window) {
                this.window.addEvent({
                    "changeTitle":function(n, t) {
                        SELF.name(t, true);
                    }
                });
            }

            this.triggerEvent("open");
            return this;
        },

        // 重命名
        rename : function(n) {
            if (this.type === "FOLDER") {
                this.renameFolder(n);
            } else {
                this.renameApp(n);
            }
        },

        // 重命名应用
        renameApp : function() {

        },

        // 重命名文件夹
        renameFolder : function(folderName) {
            if (!folderName) { return; }
            var SELF = this,
                folderId  = options.folderId||options.userDeskItemId,
                desktopId = window.desktop.current().ui.attr("svid");

            $.ajax({
                  url    : URLS.renameFolder
                , type   : "post"
                , data   : { "_ajax_toKen":"elos", folderName:folderName, userDeskId:desktopId, userDeskItemId:folderId }
                , complete : function() {}
                , error    : function() {}
                , dataType : 'json'
                , success  : function(json) {
                    if (json.success || $.trim(json).toLowerCase() === "true") {
                        SELF.name(folderName);
                    } else {
                        new tbc.Pop({
                              width    : 240
                            , height   : 80
                            , autoClose: true
                            , timeout  : 3
                        })
                        .locate(SELF.ui.find(".tbc-shortcut-icon"))
                        .show()
                        .html('<p style="padding:2em;">'+ i18n('v4.js.renameFolderFailed') +'</p>');
                        SELF.startRename();
                    }
                }
            });
        },

        // 开启重命名
        startRename : function() {
            var SELF = this,
                inp;

            this.parts.nameNode.addClass("tbc-shortcut-label-focus").focus();

            inp = $('<input type="text" value="' + this.parts.nameNode.text() + '"/>')
            .css({ border:"0px", height:"100%", width:"100%", background:"transparent", borderRadius:"0px", textAlign:"center" })
            .bind({
                "click.stopWhenEdit" : function(event) {
                    //event.stopPropagation();
                    return false;
                },
                "keyup" : function(event) {
                    if (event.keyCode === 13) {
                        this.blur();
                        return;
                    }
                },
                "blur focusout" : function (event) {
                    // 截取前10个字节
                    var n = tbc.substr($.trim(this.value), 10);

                    SELF.rename(n);

                    inp.remove();
                    inp = null;
                    SELF.parts.nameNode.html(n).removeAttr("contenteditable").removeClass("tbc-shortcut-label-focus");
                    event.stopPropagation();
                    return false;
                }
            });

            this.parts.nameNode.html("").append(inp);
            inp[0].select();
            inp[0].focus();
        },

        // 删除shortcuts
        del : function() {
            if (this.type==="FOLDER") {
                this.delFolder();
            } else {
                this.delApp();
            }
        },

        //
        delFolder : function() {

            var SELF = this;

            if (this.thumbnail.length>0) {
                new tbc.Pop({
                      width : 240
                    , height: 80
                    , autoClose    :true
                    , timeout    : 3
                })
                .locate(this.ui.find(".tbc-shortcut-icon"))
                .show()
                .html('<p style="padding:2em;">'+ i18n('v4.js.renameFolderFailed') +', '+ i18n('v4.js.folderIsNotEmpty') +'</p>');
                //.html('<p style="padding:2em;">无法删除,文件夹不为空!</p>');
                return;
            }

            tbc.Folder.del(this.svid, function(r) {
                if (r.result || r.success) {
                    var guid = $(SELF.ui).parents("[tbc]:first").attr("tbc"),
                        task = tbc.TASKS(guid);

                    SELF.ui.remove();
                    task.layout();
                    SELF.DESTROY();
                }else{
                    new tbc.Pop({
                          width : 200
                        , height: 80
                        , icon    : null
                        , autoClose    :true
                        , timeout    : 3
                        , locate    : SELF.ui
                        , parent    : null
                    })
                    .locate(SELF.ui.find(".tbc-shortcut-icon"))
                    .show()
                    .html('<p style="padding:2em;">'+ i18n('v4.js.renameFolderFailed') + '!</p>');
                }
            });
        },

        // pop 文件夹
        openPopFolder : function() {
            var SELF = this;

            if (!this.pop) {
                this.pop = new tbc.folder.Pop(tbc.extend({}, options, { width:200, height:480, parent:".tbc-slide-scene.current", locate:SELF.ui }));
                this.pop.addEvent({
                    "close" : function() {
                        SELF.removeEvent("moved.locatePop");
                        SELF.pop = null;
                    }
                });

                SELF.addEvent({
                    "moved.locatePop" : function(pos) {
                        SELF.pop.locate(SELF.ui, pos);
                    }
                });

            }else{
                SELF.pop.ui.fadeOut(100).fadeIn();
            }
            return SELF.pop;
        }
    })
    .init();

};


/**
 * 从文件夹移除
 * @static
 * @for tbc.Shortcut
 * @param {String} folderId 文件夹ID
 * @param {String} shortcutId 快捷方式或应用ID
 */
tbc.Shortcut.moveOutFolder = function(folderId, shortcutId) {

};

/**
 * 移动到文件夹
 * @static
 * @for tbc.Shortcut
 * @method moveToFolder
 * @param {string} folderId 文件夹ID
 * @param {string} shortcutId 快捷方式或应用ID
 */
tbc.Shortcut.moveToFolder = function(folderId, shortcutId) {
    $.ajax({
         url      : URLS.shortcutMoveToFolder,
         type     : "post",
         data     : { "folderUserDeskItemId":folderId, "userDeskItemId":shortcutId },
         dataType : "json",
         success  : function(json) {
            if (!json.success) {
                tbc.alert(json.message);
            }
        }
    });
};

/**
 * 静态方法: 移动到文件夹
 * @static
 * @for tbc.Shortcut
 * @method moveToScene
 * @param {String} folderId 文件夹ID
 * @param {String} shortcutId 快捷方式或应用ID
 */
tbc.Shortcut.moveToScene = function(deskId, shortcutId) {
    $.ajax({
        url     : URLS.shortcutMoveToScene,
        type    : "post",
        data    : { "deskId":deskId, "shortcutId":shortcutId },
        dataType: "json",
        success : function(json) {
            if (!json.success) {
                tbc.alert(json.message);
            }
        }
    });
};


/*
 * 静态方法: 根据ID获取桌面上的快捷方式和应用实例
 * @static
 * @for tbc.Shortcut
 * @method getInstanceById
 * @param {String} shortcutId
 */
tbc.Shortcut.getInstanceById = function(shortcutId) {
    var d = tbc.TASK_DEPOT,
        i;
    for (i in d) {
        if (d.hasOwnProperty(i) && d[i].packageName==='tbc.Shortcut' && d[i].id===shortcutId) {
            return d[i];
        }
    }
};

}(window.tbc,window.jQuery, window.URLS));
