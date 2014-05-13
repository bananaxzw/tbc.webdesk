/**
 * 手风琴类
 * @class tbc.Accordion
 * @constructor
 * @copyright http://www.21tb.com
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.Accordion = function (settings) {
        var defaults = {
                  height: 320
                , header: ".tbc-accordion-header"
                , container: null//".tbc-accordion-container"
                , itemHeader: ".tbc-accordion-itemHeader", itemContainer: ".tbc-accordion-itemContainer", currentCss: "current", active: 0 // 初始化时默认显示的项目
                , event: {
                    "titleClick": function () {

                    },
                    "active": function (header, container) {

                    },
                    "retire": function (header, container) {

                    }
                }
            },
            options = tbc.extend({}, defaults, settings);

            options.height = (!options.height || options.height==="auto") ? 356 : options.height;

        tbc.self(this, arguments)
        .extend({

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init: function () {
                var SELF = this;

                this.addEvent(options.event);
                this.packageName = "tbc.Accordion";

                if (options.container) {
                    this.ui = $(options.container);
                    this.container = this.ui;
                } else {
                    this.ui = $('<div class="tbc-accordion"></div>');
                    this.container = this.ui;
                }

                this.ui.height(options.height);
                this.crimpleAll();

                // 设置为活动项目
                setTimeout(function () {
                    SELF.setCurrent(options.active, true);
                }, 100);

                this.ui.delegate(options.itemHeader, "click touchend dblclick", function () {
                    var index = $(this).prevAll(options.itemHeader).size();
                    SELF.setCurrent(index);
                });
            },

            /**
             * 获取手风琴tab总数
             * @public
             * @method getSize
             * @return {Number} 返回手风琴页数
             */
            getSize: function () {
                return this.container.children(options.header).size();
            },

            /**
             * 将手风琴显示到容器中
             * @public
             * @method appendTo
             * @param  {Element | jQuery Object} box 目标容器
             * @chainable
             */
            appendTo: function (box_1) {
                var box = $(box_1);
                if (box.size()) {
                    box.append(this.ui);
                }
                return this;
            },

            /**
             * 追加HTML元素或一个手风琴tab页
             * @public
             * @method append
             * @param  {Element | jQueryObeject | Object} module 任何的HTML元素、
             *                    jQuery对象或手风琴tab页，如果参数是Object类型
             *                    并且包含header、container属性，则调用appendItem
             *                    方法。
             * @chainable
             */
            append: function (module) {
                if (module.header && module.container) {
                    this.appendItem.apply(this, arguments);
                } else {
                    this.container.append(module);
                }
                return this;
            },

            /**
             * 追加一个手风琴tab页s
             * @public
             * @method appendItem
             * @param  {Object} module 手风琴tab页.
             *     @param {Element} module.header 手风琴TAB页头.
             *     @param {Element} module.container 手风琴TAB页内容.
             * @chainable
             */
            appendItem: function (module) {
                if (module.header && module.container) {
                    module.container.hide();
                    this.container
                        .append(module.header.addClass("tbc-accordion-itemHeader"))
                        .append(module.container.addClass("tbc-accordion-itemContainer"));
                }
                return this;
            },

            /**
             * 从前面追加HTML元素或一个手风琴tab页
             * @public
             * @method prepend
             * @param  {Element | jQuery Selector | Object} module 任何的HTML元素、
             *                    jQuery对象或手风琴tab页，如果参数是Object类型
             *                    并且包含header、container属性，则调用prependItem
             *                    方法。
             * @chainable
             */
            prepend: function (module) {
                if (module.header && module.container) {
                    this.prependItem.apply(this, arguments);
                } else {
                    this.container.prepend(module);
                }
                return this;
            },

            /**
             * 从前面追加一个手风琴tab页
             * @public
             * @method prependItem
             * @param  {Object} module 手风琴tab页
             *     @param {Element|jQueryObject} module.header 手风琴TAB页头
             *     @param {Element|jQueryObject} module.container 手风琴TAB页内容
             * @chainable
             */
            prependItem: function (module) {
                if (module.header && module.container) {
                    module.container.hide();
                    this.container
                        .prepend(module.container.addClass("tbc-accordion-itemContainer"))
                        .prepend(module.header.addClass("tbc-accordion-itemHeader"));
                }
                return this;
            },

            /**
             * 移除手风琴tab页
             * @public
             * @method removeItem
             * @param  {Number} index 要移除的tab页的序号
             * @return {[type]}       [description]
             */
            removeItem: function (index) {
                var header, container;
                if (index && !isNaN(index)) {
                    header = this.container.children(options.itemHeader).eq(index);
                    container = header.next(options.itemContainer);
                    header.remove();
                    container.remove();
                } else if (typeof(index) === "string") {
                    this.container.children(options.itemHeader).each(function () {
                        if (this.innerHTML.indexOf(index) !== -1) {
                            header = $(this);
                            return false;
                        }
                    });
                    container = header.next(options.itemContainer);
                    header.remove();
                    container.remove();
                }
                header = container = null;
                return this;
            },

            /*
             * 获取手风琴内的所有tab页
             * @public
             * @method getAll
             * @return {Array} [options] 返回手风琴内的所有tab页集合
             *         @header {Element|jQueryObject} 手风琴tab页头
             *         @container {Element|jQueryObject} 手风琴tab页内容
             */
            getAll: function () {
                var items = [],
                    head = this.container.children(options.itemHeader),
                    i,
                    len;
                for (i = 0 , len = head.length; i < len; i += 1) {
                    items.push({
                        "header": $(head[i]), "container": $(head[i]).next(options.itemContainer)
                    });
                }

                try {
                    return items;
                } finally {
                    items = head = null;
                }
            },

            /**
             *
             收起全部手风琴菜单
             * @public
             * @method crimpleAll
             * @chainable
             */
            crimpleAll: function () {
                var conter = this.container,
                    heads = conter.children(options.itemHeader),
                    conts = conter.children(options.itemContainer);

                heads.removeClass(options.currentCss);
                conts.slideUp();
                return this;
            },

            /**
             * 获取Accordion的当前tab页
             * @public
             * @method getCurrent
             * @return {object} 处于活动状态的tab页 {header, container}
             */
            getCurrent: function () {
                var header = this.container.children(options.itemHeader).filter("." + options.currentCss),
                    container = header.next(options.itemContainer);

                try {
                    return header.size() ? { header: header, container: container } : null;
                } finally {
                    header = container = null;
                }
            },

            /**
             * 设置Accordion tab页为活动状态（即展开一个tab页）
             * @public
             * @method setCurrent
             * @param  {Number} index tab页序号
             * @param  {Boolean} force 立即切换
             * @chainable
             */
            setCurrent: function (index, force) {
                index = index === 0 || !index ? 0 : index;

                if (force || !this.isCurrent(index)) {

                    var self = this,
                        curr = this.getCurrent(),
                        future = this.findItem(index);

                    if (curr && future) {
                        curr.header.removeClass(options.currentCss);
                        curr.container.stop().animate({ height: 0 }, 300, function () {
                            curr.container.hide();
                            self.triggerEvent("retire", curr);
                            curr = null;
                        });
                    }

                    if (future) {
                        future.header.addClass(options.currentCss);
                        future.container.show().stop().animate({ height: this.getAvailableHeight() }, 300, function () {
                            future.container.css({overflow:"auto", position: "relative"});
                            self.triggerEvent("active", future);
                            future = null;
                        });
                    }
                }
                return this;
            },

            /**
             * 判断tab页是否处于展开状态
             * @public
             * @method isCurrent
             * @param  {Number} index
             * @return {Boolean} 返回true表示展开，否则没有展开
             */
            isCurrent: function (index) {
                var itm = this.findItem(index);
                return (itm && itm.header.hasClass(options.currentCss));
            },

            /**
             * 根据索引或者标题查找项目
             * @public
             * @method findItem
             * @param {Number|String} index 数组或者手风琴菜单的标题
             * @return {Object} 返回一个手风琴菜单项的对象，对象结构：
             *      {header:{jQuery Object}, container:{jQuery Object} }
             */
            findItem: function (index) {
                var items = this.getAll(),
                    future,
                    i, len;

                if (index === 0 || (index && !isNaN(index))) {
                    future = items[index];
                } else {
                    for (i = 0, len = items.length; i < len; i += 1) {
                        if (items[i].header.innerHTML.indexOf(index) !== -1) {
                            future = items[i];
                            break;
                        }
                    }
                }

                try {
                    return future;
                } finally {
                    items = future = null;
                }
            },

            /**
             * 获取Accordion的高度
             * @public
             * @method getHeight
             * @return {Number} 返回高度值
             */
            getHeight: function () {
                return this.container.innerHeight();
            },

            /**
             * 设置Accordion的高度
             * @public
             * @method setHeight
             * @param {Number} height 新高度
             * @chainable
             */
            setHeight: function (height) {
                var hei = this.getHeadersHeight();

                this.getCurrent().container.css({ height: height - hei });
                this.ui.css({ height: height });

                this.triggerEvent("resize", height-hei);
                return this;
            },

            /**
             * 获取Accordion的可用高度(Accordion减去所有项目标题的高度)
             * @public
             * @method getAvailableHeight
             * @return {Number} 返回可用高度（内容器高度）
             */
            getAvailableHeight: function () {
                var height1 = this.getHeight(),
                    height2 = this.getHeadersHeight();

                return height1 - height2;
            },

            /**
             * 设置Accordion的可用高度，设置此高度后，整个手风琴的
             * 高度将会根据内容高度变化
             * @public
             * @method setAvailableHeight
             * @param {Number} availHeight 新的内容高度;
             * @chainable
             */
            setAvailableHeight: function (availHeight) {
                var hei = this.getHeadersHeight();

                this.ui.css({ height: availHeight + hei });
                this.getCurrent().container.css({ height: availHeight });

                this.trigerEvent("resize", availHeight);
                return this;
            },

            /**
             * 获取所有项目的标题的高度的和
             * @public
             * @method getHeadersHeight
             * @return {Number};
             */
            getHeadersHeight: function () {
                var height = 0,
                    headers = this.container.children(options.itemHeader),
                    i, len;

                for (i = 0, len = headers.length; i < len; i += 1) {
                    height += $(headers[i]).outerHeight();
                }
                try {
                    return height;
                } finally {
                    height = headers = i = len = null;
                }
            }
        })
        .init();
    };
}(tbc, jQuery));
