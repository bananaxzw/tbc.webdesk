/**
 * 选项卡视图
 * @class tbc.Tabset
 * @constructor
 * @uses tbc.Event
 * @uses tbc.ClassManager
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.Tabset = function(settings) {

        var defaults = {
              container  : ".tbc-tabset"
            , header     : ".tbc-desktop-nav"   //
            , prevHandle : ".tbc-tabset-prev"
            , nextHandle : ".tbc-tabset-next"
            , effects   : "slide-x"      // [fade, slide-x, slide-y]
            , easing    : "swing"
            , loop      : true
            , auto      : true           // 自动切换
            , timeout   : 5000           // 自动切换的间隔时间(毫秒,1000ms === 1s)
            , speed     : 800
        },
        options    = $.extend({}, defaults, settings);

        tbc.self(this, arguments)
        .extend ({
            init : function() {

                var SELF = this;

                this.packageName = "tbc.Tabset";
                this.header     = $(options.header);
                this.container  = $(options.container);
                this.tabs       = [];
                this.currIndex  = 0;

                // 触控
                if (tbc.touchable) {
                    var sx=0, sy=0, st;
                    this.container[0].addEventListener("touchstart", function(event) {
                        sx = event.touches[0].pageX;
                        sy = event.touches[0].pageY;
                        st = new Date().getTime();
                    });

                    this.container[0].addEventListener("touchmove", function(event) {
                        var nx = event.touches[0].pageX,
                            ny = event.touches[0].pageY;
                        SELF.current().ui.css({ left: nx-sx });
                        nx = ny = null;
                    });

                    this.container[0].addEventListener("touchend", function(event) {
                        var nx = event.changedTouches[0].pageX,
                            ny = event.changedTouches[0].pageY,
                            et = new Date().getTime(),
                            r  = Math.abs(nx-sx), // 移动的距离
                            w  = SELF.container.width();

                        if (r > (w/2) || r > (w/2)/(1000/(et-st))) {
                            if (nx<sx && !SELF.isLast()) {
                                SELF.next();
                            } else if (nx>sx && !SELF.isFirst()) {
                                SELF.prev();
                            } else {
                                SELF.current().ui.animate({left:0});
                            }
                        } else {
                            SELF.current().ui.animate({left:0});
                        }
                        nx = ny = w = null;
                    });
                }
            },

            /**
             * 判断当前处于可视状态的标签页是不是第一个
             * @public
             * @method isFirst
             * @return {Boolean}
             */
            isFirst : function() {
                return this.currIndex === 0;
            },

            /**
             * 判断当前处于可视状态的标签页是不是最后一个
             * @public
             * @method isLast
             * @return {Boolean}
             */
            isLast : function() {
                return this.currIndex === this.tabs.length-1;
            },

            /**
             * 获得当前的标签页
             * @public
             * @method current
             * @return {Object}
             */
            current : function() {
                return this.tabs[this.currIndex];
            },

            /**
             * 显示下一个标签页
             * @public
             * @method next
             * @param  {Number} [index1] 指定下一个的索引值
             * @chainable
             */
            next : function(index1) {

                var current = this.tabs[this.currIndex],
                    index	= !isNaN(index1) ? index1 : this.getNextIndex();

                switch(this.effect()) {
                    case "slide-x":
                        current && current.outToLeft();
                        this.tabs[index].inFromRight();
                        break;
                    case "slide-y":
                        current && current.outToTop();
                        this.tabs[index].inFromBottom();
                        break;
                    case "fade":
                        current && current.fadeOut();
                        this.tabs[index].fadeIn();
                        break;
                    default:
                        current && current.hide();
                        this.tabs[index].show();
                        break;
                }
                this.currIndex = index;

                return this;
            },

            /**
             * 显示上一个标签页
             * @public
             * @method prev
             * @param  {Number} [index1] 指定上一个的索引值
             * @chainable
             */
            prev : function(index1) {

                var current = this.tabs[this.currIndex],
                    index	= !isNaN(index1) ? index1 : this.getPrevIndex(),
                    tab = this.tabs[index],
                    methodShow,
                    methodHide;

                switch(this.effect()) {
                    case "slide-x":
                        methodShow = "inFromLeft";
                        methodHide = "outToRight";
                        break;
                    case "slide-y":
                        methodShow = "inFromTop";
                        methodHide = "outToBottom";
                        break;
                    case "fade":
                        methodShow = "fadeIn";
                        methodHide = "fadeOut";
                        break;
                    default:
                        methodShow = "show";
                        methodHide = "hide";
                        break;
                }

                if (current && typeof(current[methodHide]) === "function") {
                    current[methodHide]();
                }

                if (tab && typeof(tab[methodShow]) === "function") {
                    tab[methodShow]();
                }

                this.currIndex = index;

                return this;
            },

            /**
             * 获得当前tab页后面的、并且最靠近当前tab的可见tab页，
             * 此方法会排除被隐藏的tab页
             * @method getNextIndex
             * @return {Number} 返回tab页的索引值
             */
            getNextIndex : function() {
                var index,
                    tabs = this.tabs,
                    i, len;

                for (i=this.currIndex+1, len=tabs.length; i<len; i++) {
                    if (tabs[i].visible!==false) {
                        index = i;
                        break;
                    }
                }

                if (!index) {
                    index = 0;
                }

                return index;
            },

            /**
             * 获得当前tab页前面的、并且最靠近当前tab的可见tab页，
             * 此方法会排除被隐藏的tab页
             * @method getPrevIndex
             * @return {Number} 返回tab页的索引值
             */
            getPrevIndex : function() {
                var index,
                    tabs = this.tabs,
                    i;

                for (i=this.currIndex-1; i>=0; i--) {
                    if (tabs[i].visible!==false) {
                        index = i;
                        break;
                    }
                }

                if (!index && index!==0) {
                    index = tabs.length;
                }

                return index;
            },

            /**
             * 显示指定的标签页
             * @public
             * @method show
             * @param  {Number} index 指定要显示的标签的序号
             * @chainable
             */
            show : function(index) {
                var curIndex = this.currIndex,
                    cur;

                index = index || 0;
                //if (index === cur)return this;

                if (index<curIndex) {
                    this.prev(index);
                } else if (index>curIndex) {
                    this.next(index);
                } else {
                    cur = this.tabs[this.currIndex];
                    if (cur) {
                        cur.fadeIn();
                    }
                }
                return this;
            },

            /**
             * 隐藏tab页
             * @param  {Number} index tab页的序号
             * @chainable
             */
            hide : function(index) {
                if (isNaN(index)) {
                    return;
                }

                var tab = this.tabs[index],
                    next;

                if (index === this.currIndex) {
                    this.show(index+1);
                }

                tab.handle.hide();
                tab.container.hide();
                tab.visible = false;
                this.arrayTab();

                return this;
            },

            arrayTab : function(ignore) {
                var index = 1,
                    tabs = this.tabs,
                    i, len;

                function isIgnore(ignore, tab) {
                    var  opt = tab.options;
                    if ($.isFunction(ignore)) {
                        return ignore.call(tab);
                    } else if(typeof ignore === 'string') {
                        ignore = ignore.toLowerCase();
                        switch (ignore) {
                            case 'hidden':
                                return tab.visible;
                            case 'visible':
                                return !tab.visible;
                            case 'admin':
                                return opt.type === 'ADMIN';
                            case '!admin':
                                return opt.type !== 'ADMIN';
                            case 'link':
                                return opt.type === 'LINK';
                            case 'user':
                                return opt.type === 'USER';
                            case 'other':
                                return opt.type === 'OTHER';
                        }
                    }
                }

                for (i=0, len=tabs.length; i<len; i++) {
                    if (!isIgnore(ignore, tabs[i])) {
                        tabs[i].handle.find('i').html(index);
                        index += 1;
                    } else {
                        tabs[i].handle.find('i').html('');
                    }
                }

                tabs = null;
            },

            /**
             * 初始化新增加的tab页
             * @private
             * @method onAddTab
             * @param {tbc.Tabpage} tab tbc.Tabpage实例
             */
            onAddTab: function(tab) {
                var self = this;

                tab.handle.bind("click", function() {
                    self.show(tab.index);
                });
                tab.group = this;
                tab.addEvent({
                    close : function() { self.remove(tab.index); },
                    beforeShow  : function() {
                        var ind = this.index;
                        $.each(self.tabs, function(i, tab) {
                            if (i !== self.currIndex && i !== ind) {
                                tab.hide();
                            }
                        });
                    }
                });

                if (tab.autoShow) {
                    this.show(tab.index);
                }
            },

            /**
             * 追加一个标签页，标签页只能是tbc.Tabpage的实例
             * @public
             * @method append
             * @param  {tbc.Tabpage} tabpage 要追加的标签页，tbc.Tabpage的实例
             * @chainable
             */
            append : function(tabpage) {

                var self = this;

                this.header.append(tabpage.handle);
                this.container.append(tabpage.container);
                this.tabs.push(tabpage);
                tabpage.index = this.tabs.length-1;
                this.onAddTab(tabpage);

                return this;
            },

            /**
             * 从前面追加一个标签页，标签页只能是tbc.Tabpage的实例
             * @public
             * @method prepend
             * @param  {tbc.Tabpage} tabpage 要追加的标签页，tbc.Tabpage的实例
             * @chainable
             */
            prepend : function(tabpage) {

                this.header.prepend(tabpage.handle);
                this.container.prepend(tabpage.container);
                this.tabs = [tabpage].concat(this.tabs);
                tabpage.index = 0;
                this.onAddTab(tabpage);

                return this;
            },

            insert: function(tabpage, prev) {
                if (!isNaN(prev)) {
                    prev = this.tabs[prev];
                }

                if (!prev) {
                    return this.prepend(tabpage);
                }

                var tabs = this.tabs,
                    prevSlice, nextSlice,
                    i, len;

                tabpage.handle.insertAfter(prev.handle);
                tabpage.container.insertAfter(prev.container);

                prevSlice = tabs.slice(0, prev.index+1);
                nextSlice = tabs.slice(prev.index+1, tabs.length);
                this.tabs = prevSlice.concat([tabpage]).concat(nextSlice);
                tabpage.index = prev.index + 1;

                // 如果是插入到当前tab前面，则把当前tab页的索引值+1；
                if (prev.index < this.currIndex) {
                    this.currIndex += 1;
                }

                for (i=0, len=nextSlice.length; i<len; i++) {
                    nextSlice[i].index += 1;
                }

                this.onAddTab(tabpage);
            },

            /**
             * 设置标签页切换的方式
             * @public
             * @method effect
             * @param  {String} effects 效果，取值范围：['slide-x', 'slide-y', 'fade', 'none']
             * @chainable
             */
            effect : function(effects) {
                if (typeof(effects) !== "string") {
                    return options.effects;
                }else{
                    options.effects = effects;
                }
                return this;
            },

            /**
             * 设置标签页切换的缓冲效果
             * @public
             * @method easing
             * @param  {String} effects 缓冲效果，取值范围：jQuery.easing所设置的值
             * @chainable
             */
            easing : function(easing) {
                if (typeof(easing) !== "string") {
                    return options.easing;
                }else{
                    options.easing = easing;
                }
                return this;
            },

            /**
             * 移除一个标签页
             * @public
             * @method remove
             * @param  {Number} index 要移除的标签页序号
             * @chainable
             */
            remove : function(index) {
                if (index === this.currIndex) {
                    if (index<this.tabs.length-1) {
                        this.excludeTab(index);
                        this.next();
                    } else if (index>0) {
                        this.excludeTab(index);
                        this.prev();
                    }
                } else if (index < this.currIndex) {
                    this.excludeTab(index);
                    this.currIndex-=1;
                    this.show(this.currIndex);
                } else {
                    this.excludeTab(index);
                }
                //this.excludeTab(index);
                return this;
            },

            /**
             * 将一个标签页的序号从此标签集排除，不在接受
             * 此标签集的管理
             * @public
             * @method excludeTab
             * @param {Number} index 标签页的序号
             * @chainable
             */
            excludeTab : function(index) {

                var tabs = [],
                    _tab,
                    i,
                    len;
                for (i=0,len=this.tabs.length; i<len; i++) {
                    _tab = this.tabs[i];
                    if (_tab && _tab.index !== index) {
                        _tab.index = tabs.length;
                        tabs.push(_tab);
                    }
                }

                _tab = null;
                this.tabs = tabs;
                return this;
            }
        })
        .addEvent ({
            "destroy" : function () {
                defaults = options = settings = null;
            }
        })
        .init();
    }
}(tbc, jQuery));
