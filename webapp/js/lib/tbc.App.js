/**
 * 桌面应用构造类
 * @class tbc.App
 * @constructor
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.appManager = function() {
        this.appStore = {};

    };

    tbc.App = function(settings, appOptions) {
        var options = tbc.extend ({
                  width     : settings.preferredWidth || 900
                , height    : settings.preferredHeight || 400
                , name      : settings.userDeskItemName || settings.applicationName
                , icon      : settings.applicationIconUrl
                , homepage  : settings.homePageUrl
                , minWidth  : 480
                , minHeight : 320
                , translatable : true
            }, settings, appOptions),
            url;

        url = options.homePageUrl + (
                (options.homePageUrl.indexOf("current_app_id") === -1)
                ? (options.homePageUrl.indexOf("?") !== -1 ? "&" : "?") + "current_app_id=" + appOptions.applicationId
                : ""
            );

        $.extend(options, {
            homePageUrl : url,
            homepage    : url,
            refreshable : true, // 可刷新
            resettable  : true,  // 可重置
            helpable    : true,    // 有帮助内容
            autoLoad    : true,    // 自动加载应用内容
            scrolling   : false  // 窗口内容可滚动
        });

        tbc.self(this, arguments)
        .extend ([tbc.Window, options], {
            /**
             * 初始化
             * @method init
             * @private
             */
            initApp : function() {
                this.packageName = "tbc.App";
                this.ui.addClass('helpable refreshable');
                return this;
            }
        })
        .addEvent({

            destroy : function() {
                options = settings = appOptions = null;
            }
        })
        .initApp();
    };
}(tbc, jQuery));
