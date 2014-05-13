/**
 * 快速启动, Widgets图标
 * @class tbc.QuickLaunch
 * @constructor
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $) {

    "use strict";

    tbc.QuickLaunch = function(settings) {
        var defaults = {
              container : ".tbc-task-quickLaunch"
            , ui        : ".tbc-task-quickLaunch"
            , invisible : ".tbc-task-invisible"
            , invisibleHandle : ".tbc-task-invisible-handle"
        },
        options = $.extend({}, defaults, settings),
        iconModel = '<i class="tbc-imgicon tbc-icon" title="{0}"><img _src="{1}"/></i>';

        tbc.self(this, arguments).extend({
            init : function() {
                var SELF = this;

                this.packageName  = "tbc.QuickLaunch";
                this.cache_length = 0;
                this.cache     = {};
                this.ui        = $(options.ui);
                this.container = $(options.container, this.ui);
                this.handle    = $(options.invisibleHandle, this.ui);
                this.invisible = $(options.invisible, this.ui);
                this.container = this.container.size() ? this.container : this.ui;

                this.handle.click(function(event) {
                    SELF.toggleInvisible();
                    event.stopPropagation();
                    return false;
                });
            },

            /**
             * 追加一个图标
             * @param  {Object} sets 配置项
             */
            append : function(sets) {
                var def = {
                    guid  : null,
                    icon  : "",
                    title : "",
                    click : null
                },
                opt = $.extend({}, def, sets),
                iconNode = $(tbc.formatString(iconModel, opt.title, opt.icon));
                
                if (!opt.guid) {
                    throw ("缺少配置项: {guid:undefined}");
                }
                
                iconNode.appendTo(this.container);
                
                // 图标
                if ( opt.icon.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || opt.icon.indexOf("sf-server/file/getFile/") !== -1 ) {
                    iconNode.find("img").show().attr("src", opt.icon);
                } else {
                    iconNode.find("img").hide().parent().addClass(opt.icon);
                }
                
                iconNode
                .attr("guid", opt.guid)
                .bind({ "click" : opt.click });
                
                if (!this.cache[opt.guid]) {
                    this.cache[opt.guid] = iconNode;
                    this.cache_length++;
                    this.toggleHandle();
                }
                
                taskbar.resize();
                
                def = opt = sets = iconNode = null;
            },

            /**
             * [ description]
             * @param  {string} guid
             * @chainable
             */
            drop : function(guid) {
                var ico = this.cache[guid];
                if (ico) {
                    ico.remove();
                    delete this.cache[guid];
                    this.cache_length--;
                    this.toggleHandle();
                }
                ico = null;
                return this;
            },
            
            /**
             * 设置图标
             * @param  {String} ico
             * @chainable
             */
            icon : function(ico) {
                if (ico.match(/(jpg|jpeg|gif|png|bmp|ico|img)$/)|| ico.indexOf("sf-server/file/getFile/") !== -1) {
                    iconNode.children("img").show().attr("src", img);
                }else{
                    iconNode.addClass(ico).children().hide();
                }
                return this;
            },
            
            /**
             * 设置HTML元素的title属性
             * @param  {String} title
             * @chainable
             */
            tips : function(title) {
                iconNode.attr("title", title);
                return this;
            },
            
            /**
             * 判断快速启动栏是否有空间
             * @return {Boolean}
             */
            hasSpace : function() {
                var WID = this.container[0].clientWidth,
                    wid = this.cache_length*18;
                return wid<WID;
            },
            
            /**
             * 显示隐藏的图标
             * @param {Boolean} sign 是否记录显示状态，
             *  @default true;
             * @chainable
             */
            showInvisible : function(sign) {
                var SELF = this;
                this.invisible.stop().slideDown(200);
                sign !== false && (this.invisibleState = "show");
                
                $(document).bind({
                    "click.hideQuicklaunch" : function() {
                        SELF.hideInvisible();
                        $(document).unbind("click.hideQuicklaunch");
                    }
                });
            },
            
            /**
             * 隐藏超出数量的图标
             * @param  {Boolean} sign 是否记录显示状态，默认true;
             * @chainable
             */
            hideInvisible : function(sign) {
                this.invisible.stop().slideUp(200);
                sign !== false && (this.invisibleState = "hide");
                
                $(document).unbind(".hideQuicklaunch");
            },
            
            toggleInvisible : function() {
                if (this.invisibleState === "hide") {
                    this.showInvisible();
                }else{
                    this.hideInvisible();
                }
            },
            
            /**
             * 切换状态
             * @chainable
             */
            toggleHandle : function() {
                if (this.container[0].clientWidth/18 > this.cache_length) {
                    this.handle.show();
                }else{
                    this.handle.hide();
                }

                return this;
            },
            
            /**
             * 检测是否已经存在
             * @param  {String} guid 需要检测的ID
             * @return {Boolean} 返回true表示已经存在，否则不存在
             */
            isExist : function(guid) {
                return this.cache[guid] ? true : false;
            }
        })
        .init();
    }
}(tbc, jQuery));
  
