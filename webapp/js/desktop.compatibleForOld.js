/*
 * 兼容之前的版本
 * author    : mail@luozhihua.com
 * copyright : 时代光华(2012-2015)
 */
;(function(global) {

    $.fn.desktop = function(type, data) {

        switch(type){

            /* 设置桌面背景 */
            case "setBg":
                $.get(data.url, function(t){
                    desktop.setBackground(t.url);
                });
                break;

            case "openwin":
                var opt = getAppOptions(data);
                if (opt) {
                    tbc.system.open(opt, null, true);
                }
                break;

            case "opennew":
                if (data.courseId) {
                    $("body").attr("appPostId", data.courseId);
                }
                $.fn.desktop("openwin", data);
                break;

            default:

                break;
        }
    }


    function getAppOptions(data) {
        var opt, appId, app;
        for (appId in applicationMap) {
            app = applicationMap[appId];
            var s = [app.appCode, data.appCode, app.applicationId, data.id];

            if (app.appCode === data.appCode || app.applicationId === data.id ) {
                opt = $.extend({}, app);

                opt.iframe = false ; //data.iframe;
                opt.homePageUrl = data.url || opt.homePageUrl;
                opt.itemType = "APP";
            }
        }
        return opt;
    }

    // 从iframe中打开新窗口
    global.desktopWindow = function(id, param) {
        tbc.system.open(id, param);
    }

    global.desktopWindowWithUrl = function(appId, url) {
        var win = tbc.system.open(appId);
            win.load(url);
    }

    global.openWindowWithAppCode = function(appCode, url) {
        var opt = getAppOptions({appCode: appCode}),
            win = tbc.system.open(opt);

        if (url) {
            win.load(url);
        }
    };
}(this));