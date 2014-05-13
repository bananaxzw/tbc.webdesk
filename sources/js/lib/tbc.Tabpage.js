;(function(tbc, $){

    "use strict";

    /**
     *标签基类
     * @class tbc.Tabpage
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.Tabpage = function (settings) {

        var defaults = {
              title     : null
            , icon      : null
            , closable  : false
            , closeNode : null
            , handleNode: ""
            , titleNode : null
            , iconNode  : null
            , container : null
            , content   : null
            , duration  : 300
            , easing    : null
            , autoShow  : true
        }
        ,options = tbc.extend({}, defaults, settings)
        ,handleNode = $(options.handleNode)
        ,iconNode   = $(options.iconNode, handleNode)
        ,titleNode  = $(options.titleNode, handleNode)
        ,container  = $(options.container)
        ;

        tbc.self (this, arguments).extend({
            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {
                this.packageName = "tbc.Tabpage";

                if (options.group) {
                    this.group = options.group;
                    this.appendTo(this.group);
                }
                if (options.autoShow) { this.show(); }
            },

            /**
             * 标签页头
             * @public
             * @property handle
             * @type {jQuery Object}
             */
            handle : handleNode,

            /**
             * 标签内容容器
             * @public
             * @property container
             * @type {jQuery Object}
             */
            container : container,

            /**
             * 标签内容容器
             * @private
             * @property ui
             * @type {jQuery Object}
             */
            ui : container,

            /**
             * 设置或者获取标签页的标题
             * @public
             * @method title
             * @param {String} [title] 新标题
             * @return {String} 如果没有title参数，则返回标签页的名称，否则设置新标题并返回实例自己
             */
            title : function(title) {
                var ret;
                if (title) {
                    titleNode.html(title);
                    ret = this;
                }else{
                    ret = $.trim(titleNode.html());
                }
                try {
                    return ret;
                } finally {
                    ret = null;
                }
            },

            /**
             * 设置或者获取标签页的图标
             * @public
             * @method icon
             * @param {String} [icon] 图标路径
             * @return {String} 如果没有icon参数，则返回标签页的路径，否则设置新图标并返回实例自己
             */
            icon : function(icon) {
                var ret;
                if (icon) {
                    iconNode.attr("src", icon);
                    ret = this;
                } else {
                    ret = iconNode.attr("src");
                }

                try {
                    return ret;
                } finally {
                    ret = null;
                }
            },

            /**
             * 向底部滑出
             * @public
             * @method outToBottom
             * @param {Function} func 回调方法
             */
            outToBottom : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    parent = container.parent(),
                    height = parent.height();

                container.animate({top:height}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },

            /**
             * 向顶部滑出
             * @public
             * @method outToTop
             * @param {Function} func 回调方法
             */
            outToTop : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    height = container.height();
                container.animate({top:-height}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },

            /**
             * 向右侧滑出
             * @public
             * @method outToRight
             * @param {Function} func 回调方法
             */
            outToRight : function(func) {
                this.triggerEvent("beforeHide");
                var SELF   = this,
                    parent = container.parent(),
                    width  = parent.width();
                container.animate({left:width}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },

            /**
             * 向左侧滑出
             * @public
             * @method outToLeft
             * @param {Function} func 回调方法
             */
            outToLeft : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    width = container.width();

                container.animate({left:-width}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },

            /**
             * 从顶部滑入标签页
             * @public
             * @method inFromTop
             * @param {Function} func 回调方法
             */
            inFromTop : function(func) {

                this.triggerEvent("beforeShow");
                var SELF = this,
                    height = container.height();
                container.css({ top:-height }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },

            /**
             * 从底部滑入标签页
             * @public
             * @method inFromBottom
             * @param {Function} func 回调方法
             */
            inFromBottom : function(func) {

                this.triggerEvent("beforeShow");

                var SELF = this,
                    parent = container.parent(),
                    height = parent.height();
                container.css({ top:height }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },

            /**
             * 从左侧滑入标签页
             * @public
             * @method inFromLeft
             * @param {Function} func 回调方法
             */
            inFromLeft : function(func) {
                var SELF = this,
                    width = container.width();

                this.triggerEvent("beforeShow");

                container.css({ left:-width }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },

            /**
             * 从右侧滑入标签页
             * @public
             * @method inFromRight
             * @param {Function} func 回调方法
             */
            inFromRight : function(func) {
                var SELF = this,
                    parent = container.parent(),
                    width = parent.width();

                this.triggerEvent("beforeShow");

                container.css({ left:width }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },

            /**
             * 淡出标签页
             * @public
             * @method fadeOut
             * @param {Function} func 回调方法
             */
            fadeOut : function(func) {
                var SELF = this;
                this.triggerEvent("beforeHide");
                container.css({top:0,left:0}).animate({opacity:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },

            /**
             * 淡入标签页
             * @public
             * @method fadeIn
             * @param {Function} func 回调方法
             */
            fadeIn : function(func) {
                var SELF = this;
                this.triggerEvent("beforeShow");
                container.css({top:0,left:0}).show().animate({opacity:1}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },

            /**
             * 显示标签页
             * @public
             * @method show
             * @param {Function} func
             */
            show : function(func) {
                this.triggerEvent("beforeShow");
                container.css({top:0,left:0, opacity:1}).show();
                if ($.isFunction(func)) {
                    func();
                }
                this.triggerEvent("show");
            },

            /**
             * 隐藏标签页
             * @public
             * @method hide
             * @param {Function} func 回调方法
             */
            hide : function(func) {
                this.triggerEvent("beforeHide");
                container.css({top:0,left:0}).hide();
                if($.isFunction(func)) {
                    func();
                }
                this.triggerEvent("hide");
            },

            /**
             * 关闭标签页
             * @public
             * @method close
             */
            close : function() {
                if (options.closable && this.triggerEvent("beforeClose") !== false) {
                    $(options.handleNode).empty().remove();
                    container.empty().remove();
                    this.triggerEvent("close");
                    delete this.group;

                    this.DESTROY();

                    defaults = options = handleNode = iconNode = titleNode = container = null;
                }
            },

            /**
             * 将标签页添加到一个标签集的后面
             * @public
             * @param {Object} group 标签集
             * @chainable
             */
            appendTo : function(group) {

                // 从原来的标签集合中移除
                if (this.group) {
                    this.group.remove(this.index);
                }

                // 加入新的选项卡集合
                group.append(this);
                this.group = group;
                return this;
            },

            /**
             * 将标签页添加到一个标签集的最前面
             * @public
             * @param {Object} group 标签集
             * @chainable
             */
            prependTo : function(group) {
                // 从原来的标签集合中移除
                if (this.group) {
                    this.group.remove(this.index);
                }

                // 加入新的选项卡集合
                group.prepend(this);
                this.group = group;
                return this;
            }

        })
        .addEvent({
            "beforeShow" : function() {
                this.handle.addClass(options.currentClass || "current");
                this.container.addClass(options.currentClass || "current");
            },
            "beforeHide" : function() {
                this.handle.removeClass(options.currentClass || "current");
                this.container.removeClass(options.currentClass || "current");
            },
            "hide" : function() {
                container.hide();
            },
            "destroy" : function () {
                defaults = options = settings = handleNode = iconNode = titleNode = container = null;
            }
        })
        .init();

    };
}(tbc, jQuery));
