;(function(tbc, $){

    "use strict";

    /**
     * 桌面任务栏构造类
     * @class  tbc.Task
     * @constructor
     * @param options 任务配置
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.Task = function(options) {

        var cssHover   = "tbc-task-hover",
            cssActive  = "tbc-task-active",
            cssCurrent = "tbc-task-current",
            CONTAINER  = ".tbc-task-container";

        /**
         * 渲染
         * @method RENDER
         * @private
         * @return {jQuery Object} 任务栏菜单项
         */
        function RENDER() {
            var icon = tbc.system.isImg(options.icon)
                ? options.icon
                : (tbc.system.isImg(window.DEFAULT_ICONS.window_icon) ? window.DEFAULT_ICONS.window_icon : ""),

            model = '<li class="tbc-task">' +
                '    <i class="tbc-icon icon icon-16"><img onerror="this.style.display=\'none\';" src="{icon}"></i>' +
                '    <span class="tbc-task-title">{title}</span>' +
                '    <em></em>' +
                '</li>',

            html = $(model.replace(/\{title\}/g, options.title).replace(/\{icon\}/g, icon));

            html.bind({
                mouseenter:function() {$(this).addClass("tbc-task-hover");},
                mouseleave:function() {$(this).removeClass("tbc-task-hover");},
                mousedown:function() {
                    $(this).addClass("tbc-task-active");
                    $(document).bind("mouseup.TBC_TASK_CLICK",function() {
                        html.removeClass("tbc-task-active");
                        $(document).unbind("mouseup.TBC_TASK_CLICK");
                    });
                }
            });

            return $(html).appendTo(CONTAINER);
        }

        tbc.self (this, arguments)
        .extend({

            /**
             * 类名
             * @property
             * @type {String}
             * @public
             */
            packageName : "tbc.Task",

            /**
             * 任务栏链接
             * @property
             * @type {Object}
             * @public
             */
            handle : null,

            /**
             * 初始化
             * @method init
             * @private
             */
            init : function() {
                this.packageName = "tbc.Task";
                this.handle = RENDER();
                this.icon(options.icon || window.DEFAULT_ICONS.window_icon);
                return this;
            },

            /**
             * 显示任务栏链接
             * @public
             * @method show
             * @chainable
             */
            show : function() {
                this.handle.show();
                return this;
            },

            /**
             * 隐藏任务栏链接
             * @public
             * @method hide
             * @chainable
             */
            hide : function() {
                this.handle.hide();
                return this;
            },

            /**
             * 移除任务栏链接
             * @public
             * @method remove
             * @chainable
             */
            remove : function() {
                this.handle.remove();
                this.DESTROY();
            },

            /**
             * 设置任务栏链接的名称
             * @public
             * @method title
             * @param {String} title 名称
             * @chainable
             */
            title : function(title) {
                if (typeof title === "string") {
                    this.handle.children(".tbc-task-title").html(title).attr("title", title);
                }
                return this;
            },

            /**
             * 设置任务栏链接的图标
             * @public
             * @method icon
             * @param {String} url 图标路径或者CSS类
             * @chainable
             */
            icon  : function(url) {
                if (tbc.system.isImg(url)) {
                    this.handle.find(".tbc-icon img").attr("src", url).parent().addClass("icon");
                }else{
                    this.handle.find(".tbc-icon").addClass(url).removeClass("icon");
                }
                return this;
            },

            /**
             * 使任务栏链接闪烁
             * @public
             * @method flash
             * @chainable
             */
            flash  : function() {
                var SELF = this;
                setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },0);
                setTimeout (function() { SELF.handle.removeClass("tbc-task-current"); },80);
                setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },160);
                setTimeout (function() { SELF.handle.removeClass("tbc-task-current"); },220);
                setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },280);
                setTimeout (function() { SELF.handle.removeClass("tbc-task-current"); },320);

                if (this.current) {
                    setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },360);
                }

                return this;
            },

            /**
             * 设置任务栏链接的为活动状态
             * @public
             * @method setCurrent
             * @chainable
             */
            setCurrent : function() {
                if (this.handle) {
                    this.current = true;
                    this.handle.addClass("tbc-task-current");
                }
                return this;
            },

            /**
             * 取消任务栏链接的活动状态（变灰）
             * @public
             * @method removeCurrent
             * @chainable
             */
            removeCurrent : function () {
                if (this.handle) {
                    this.current = false;
                    this.handle.removeClass("tbc-task-current");
                }
                return this;
            }
        })
        .addEvent ({
            "destroy" : function () {
                RENDER = options = cssHover = cssActive = cssCurrent = CONTAINER = null;
            }
        })
        .init();
    };
}(tbc, jQuery));