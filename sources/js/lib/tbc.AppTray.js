/**
 * 应用托盘
 * @class tbc.AppTray
 * @constructor
 * @public
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */

;(function(tbc, $) {

    "use strict";

    tbc.AppTray = function(settings) {

        var defaults = {
              container : ".tbc-appsTray"
            , ui        : ".tbc-appsTray"
            , invisible : ".tbc-task-invisible"
            , invisibleHandle : ".tbc-task-invisible-handle"
        },
        options   = $.extend({}, defaults, settings),
        iconModel = '<span class="tbc-button-link" title="{0}"><i class="tbc-imgicon tbc-icon icon-18"><img src="{1}"/></i><span class="tbc-button-text">{0}</span></span>';

        tbc.self(this, arguments)
        .extend({
            init : function() {

                var SELF = this;

                this.cache = {};
                this.cache_length = 0;
                this.packageName = "tbc.AppTray";
                this.ui        = $(options.ui);
                this.handle    = $(options.invisibleHandle, this.ui);
                this.container = $(options.container, this.ui);
                this.invisible = $(options.invisible, this.ui);
                this.container = this.container.size() ? this.container : this.ui;

                this.handle.click(function(event) {
                    SELF.toggleInvisible();
                    event.stopPropagation();
                    return false;
                });
            },

            append : function(sets) {
                var def = {
                    guid    : null,
                    icon    : "",
                    title    : "",
                    click    : null
                },
                opt = $.extend({}, def, sets),
                iconNode = $(tbc.formatString(iconModel, opt.title, opt.icon||""));

                if (tbc.system.isImg(opt.icon)) {
                    iconNode.find("img").show().attr("src", opt.icon);
                } else {
                    iconNode.find("img").hide().parent().addClass(opt.icon);
                }

                if (!opt.showTitle) { iconNode.children(".tbc-button-text").html(""); }

                if (!opt.guid) {
                    throw ("缺少配置项: {guid:undefined}");
                }

                iconNode.appendTo(this.container);

                iconNode
                .attr("guid", opt.guid)
                .bind({ "click" : opt.click});

                if (!this.cache[opt.guid]) {
                    this.cache[opt.guid] = iconNode;
                    this.cache_length+=1;
                    this.toggleHandle();
                }

                window.taskbar.resize();

                def = opt = sets = iconNode = null;
            },

            update: function(id, sets, resize) {
               var def = {
                    icon  : "",
                    title : "",
                    click : null
                },
                opt = $.extend({}, def, sets),
                iconNode = this.container.find("[guid='"+ id +"']");

                if (iconNode.size() > 0) {

                    if (tbc.system.isImg(opt.icon)) {
                        iconNode.find("img").show().attr("src", opt.icon);
                    } else if(opt.icon) {
                        iconNode.find("img").hide().parent().addClass(opt.icon);
                    }

                    if (!opt.showTitle) {
                        iconNode.children(".tbc-button-text").html("");
                    } else {
                        iconNode
                        .attr('title', (opt.title||'').replace(/\<[^>]*\>/ig, ''))
                        .children(".tbc-button-text").html(opt.title);
                    }

                    if (resize!==false) {
                        window.taskbar.resize();
                    }
                }
            },

            drop : function(guid) {
                var ico = this.cache[guid];
                if (ico) {
                    ico.remove();
                    delete this.cache[guid];
                    this.cache_length-=1;
                    this.toggleHandle();
                }
                ico = null;
            },

            icon : function(ico) {
                if (tbc.system.isImg(ico)) {
                    this.handle.find(".tbc-icon").children("img").show().attr("src", ico);
                }else{
                    this.handle.find(".tbc-icon").addClass(ico).children().hide();
                }
            },

            tips : function(title) {
                this.handle.find('.tbc-button-text').attr("title", title).html(title);
            },

            // 判断快速启动栏是否有空间
            hasSpace : function() {
                var WID = this.container[0].clientWidth,
                    wid = this.cache_length*18;
                return wid<WID;
            },

            showInvisible : function(sign) {
                var SELF = this;
                this.invisible.stop().slideDown(200);
                if (sign !== false) {
                    this.invisibleState = "show";
                }

                $(document).bind({
                    "click.hideQuicklaunch" : function() {
                        SELF.hideInvisible();
                    }
                });
            },

            hideInvisible : function(sign) {
                this.invisible.stop().slideUp(200);
                if (sign !== false) {
                    this.invisibleState = "hide";
                }

                $(document).unbind(".hideQuicklaunch");
            },

            toggleInvisible : function() {
                if (this.invisibleState === "hide") {
                    this.showInvisible();
                } else {
                    this.hideInvisible();
                }
            },

            toggleHandle : function() {
                if (this.container[0].clientWidth/18 > this.cache_length) {
                    this.handle.show();
                } else {
                    this.handle.hide();
                }
            },

            isExist : function(guid) {
                return this.cache[guid] ? true : false;
            },

            /**
             * 打开
             */
            open : function() {

            }
        })
        .init();
    };
}(tbc, jQuery));