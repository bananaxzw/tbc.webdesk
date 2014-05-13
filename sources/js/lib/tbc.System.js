
;(function(tbc, $) {

    "use strict";

    var System = function() {
        var init = function() {
            var i=0;
        };

        init();
    };

    System.prototype = {

        getDesktopHeight : function() {
            return window.desktop ?
                window.desktop.container.height() :
                document.documentElement.clientHeight;
        },

        getDesktopWidth : function() {
            return window.desktop ?
                window.desktop.container.width() :
                document.documentElement.clientWidth;
        },

        /**
         * 根据ID获取桌面应用或快捷方式的实例
         *
         * @public
         * @method getShortcutById
         * @param {String} id 应用或快捷方式的config id
         * @return {Object}
         */
        getShortcutById : function(id) {
            return this.getTaskByElement("[_shortcutid='"+ id +"']");
        },

        /* 根据配置获取打开类型 */
        getOpenType : function(app) {
            var options = typeof(app) === "string" ? this.getAppOptions(app) : app,
                type    = null,
                type_1;

            if (options.openType === 'NEW_PAGE') {
                type = "LINK";
            } else {

                type_1 = options.itemType.toUpperCase();
                switch(type_1) {

                    case "FOLDER":
                        type = "FOLDER";
                        break;

                    //case "APP":
                    case "APPLICATION":
                        type = "APP";
                        break;

                    case "WIDGET":
                        type = "WIDGET";
                        break;

                    case "shortcut":
                        type = "LINK";
                        break;

                    case "ICON"    :
                        type = options.openType === "NEW_WINDOW"
                        ? "APP"
                        : "LINK";
                        break;

                    default:
                        type = type_1;
                }
            }

            return type;
        },

        /* 根据ID获取App配置 */
        getAppOptions : function(id) {
            return window.applicationMap[id];
        },

        /* 根据节点获取JS任务 */
        getTaskByElement : function(node, alowParents) {
            var guid    = $(node).attr("tbc");
                guid    = guid ? guid : (alowParents!==false ? $(node).parents("[tbc]:first").attr("tbc") : '');

            return tbc.TASKS(guid);
        },

        /* 退出 */
        logout : function(noVerify) {
            if (!noVerify) {
                window.onbeforeunload = null;
                document.location.href = "/login/login.logout.do";
            } else {
                var p = new tbc.Pop({ width:320, height:150 }).appendTo("body").locate(".tbc-startmenu-handle").show(),
                    b = new tbc.Button({ text:i18n('v4.js.logout'), icon:"icon-breadcrumb_separator_arrow_2_dots", click : function() { tbc.system.logout(false); } }),
                    c = new tbc.Button({ text:i18n('v4.js.cancel'), icon:"icon-close", click : function() { setTimeout(function() {p.close(); },1);} }),
                    t = $("<div/>").html(i18n('v4.js.logoutTips')).css({ padding:"0 0 2em 0"}).appendTo(p.container);

                b.depend(p);
                b.appendTo(p);
                b.ui.css("float","left").addClass("tbc-button-blue");

                c.depend(p);
                c.appendTo(p);
                c.ui.css({marginRight:12, "float":"right"});

                p.container.css("padding","2em");
            }
        },

        /* 按类型打开 */
        open : function (options_Or_AppId, param, loadAlways) {
            var options = typeof(options_Or_AppId) === "string"
                    ? this.getAppOptions(options_Or_AppId)
                    : options_Or_AppId,
                type    = this.getOpenType(options),
                task    = null,
                appid   = options.appId || options.applicationId,
                baseApp = tbc.webdesk.data.apps[appid],

                sceneUi, isCurrScene, scene, appOpt, shortcutId, url;

            options = $.extend({}, baseApp, options);

            switch(type) {

                // 文件夹
                case "FOLDER":
                    task = tbc.TaskManager.get("folder", options.userDeskItemId);
                    if (task) {
                        sceneUi = task.ui.parent();
                        isCurrScene = sceneUi.hasClass("current");
                        scene = tbc.system.getTaskByElement(sceneUi);

                        if (!isCurrScene) {
                            scene.group.show(scene.index);
                        }

                        sceneUi = isCurrScene = scene = null;

                        if (task.focused) {
                            task.flash();
                        } else {
                            task.show();
                        }
                    }else{
                        task = new tbc.Folder(options)
                        .addEvent({
                            "afterClose":function() {
                                tbc.TaskManager.exit("folder", options.userDeskItemId);
                            }
                        })
                        .show();

                        tbc.TaskManager.set("folder", options.userDeskItemId, task);
                    }
                    break;

                // 应用
                case "APP":
                case "APPLICATION":
                    task = tbc.TaskManager.get("app", options.applicationId);
                    if (task) {
                        sceneUi = task.ui.parent();
                        isCurrScene = sceneUi.hasClass("current");
                        scene = tbc.system.getTaskByElement(sceneUi);

                        if (!isCurrScene) {
                            scene.group.show(scene.index);
                        }
                        sceneUi = isCurrScene = scene = null;

                        task.show();

                        if (loadAlways) {
                            task.load (options.homePageUrl,  param?"post":"get", param);
                        }

                    } else {

                        if (typeof param !== 'undefined') {
                            options.data = param;
                        }

                        appOpt = window.applicationMap[options.applicationId];
                        options = $.extend(appOpt, options);

                        /**
                        options.originateSettings.abc = options.originateSettings.abc || 1;
                        options.originateSettings.abc++;
                        */

                        task = new tbc.App(options, options)
                        .addEvent({
                            "afterClose":function() {
                                tbc.TaskManager.exit("app", options.applicationId);
                            }
                        })
                        .show();
                        tbc.TaskManager.set("app", options.applicationId, task);

                    }
                    break;

                // 链接
                case "LINK":
                    window.open(options.homePageUrl, options.applicationId);
                    break;

                case "SHORTCUT":

                    // 如果有自动登录的设置
                    if (options.autologin===false) {
                        if (this.startAutoLogin(options) === false) {
                            window.open(options.homePageUrl, options.applicationId);
                        }
                    } else {
                        window.open(options.homePageUrl, options.applicationId);
                    }
                    break;
            }

            try {
                return task;
            } finally {
                task = null;
            }
        },

        /**
         * 开启自动登录设置界面()
         *
         * @public
         * @method startAutoLogin
         * @param {Object} options 快捷方式配置;
         * @return {instanceof tbc.Window || Boolean} 打开成功返回true, 否则返回false;
         */
        startAutoLogin : function(options) {

            var shortcutId = options.userDeskItemId,
                url = window.URLS.autoLoginSetting,
                win,
                sys = this;

            if (typeof url === "string") {
                url = url.replace(/\{\{shortcutId\}\}/, shortcutId);

                this.autoLoginWins = this.autoLoginWins || {};
                win = this.autoLoginWins[options.userDeskItemId];

                if (win) {
                    win.show();
                } else {
                    win = new tbc.Window({
                        width    : 500,
                        height   : 340,
                        name     : options.userDeskItemName + " - " + i18n('v4.js.autoLoginSetting'),
                        homepage : url,
                        loadType : "ajax"
                    }).show();

                    win.addEvent({
                        "close" : function() {
                            delete sys.autoLoginWins[options.userDeskItemId];
                        }
                    });

                    this.autoLoginWins[options.userDeskItemId] = win;
                }
            } else {
                win = false;
            }
            return win;
        },

        /**
         * 判断字符串是否是一个图片地址
         * @method isImg
         * @public
         * @param {Strinf} str 字符串
         * @return {Boolean} 返回true则字符串为图片地址，否则不是
         */
        isImg : function(str) {
            return !!(typeof str === "string" && (str.match(/\.(jpg|jpeg|gif|png|img|bmp|ico|WebP)$/) || str.indexOf("sf-server/file/getFile/") !== -1));
        }
    };

    /**
     * tbc系统对象
     * @property {Object} system
     * @for tbc
     * @type {System}
     */
    tbc.system = new System();

    /**
    function opennew(t, p) {
        var data = $.data(t, "desktop"),
            appData,
            action,
            index;

        if (p.id === undefined) {
            return;
        }

        appData=data.options.itemsData[p.id];

        if (typeof appData === 'undefined') {
            return;
        }

        if (p.param) {
            appData=$.extend(appData,{param:p.param});
        }

        action=appData.homePageUrl;
        if (action && action !== null && appData.openType === "NEW_WINDOW") {
            index = appData.userDeskPosition;

            if (data.options.curDesktopIndex===index || index===null || typeof index===undefined) {
                opennewwin(t, appData);
            } else {
                data.options.curDesktopIndex=index;
                switchScreenPage(t,function() {
                    opennewwin (t,appData);
                });
            }
        }
    }
    */
}(window.tbc, window.jQuery));
