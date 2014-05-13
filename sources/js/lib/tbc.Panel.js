
;(function(tbc, $) {

    "use strict";

    /**
     * 用于生产弹出层、窗体容器、消息框等
     * @class tbc.Panel
     * @constructor
     * @uses tbc.Event
     * @uses tbc.ClassManager
     * @copyright 时代光华
     * @author mail@luozhihua.com
     *
     * @param {Object} settings 配置项
     *     @param {Window} [settings.window] 用于多个框架页或含有iframe的页面
     *                                      设置弹出窗口在哪一个框架页里面打开
     *     @param {Object} [settings.opener] 打开此窗口的窗口对象
     *     @param {String} [settings.title=""] 窗口标题
     *     @param {String} [settings.name="未命名"] 窗口名称（readOnly）
     *     @param {String} [settings.icon] 窗口图标
     *     @param {String} [settings.html] 窗口内容
     *     @param {Element | Object} [settings.area="body"] 限制窗口的坐标位置在某
     *                       一元素的坐标区域内
     *     @param {Number} [settings.width=400] 宽度，默认400px
     *     @param {Number} [settings.height=300] 高度，默认400px
     *     @param {Number} [settings.left="auto"] 左边距，默认auto
     *     @param {Number} [settings.top="auto"] 上边距，默认auto
     *     @param {Element} [settings.target] 窗口渲染到哪一个元素内
     *     //@param {Boolean} [settings.modal] 是否是模态窗口
     *     @param {String} [settings.sizeType] 初始显示状态， min/max/restore
     *     @param {Number} [settings.minWidth=180] 最小宽度， 默认180px
     *     @param {Number} [settings.minHeight=100] 最小高度， 默认100px
     *     @param {Boolean} [settings.autoShow=true] 是否自动显示
     *     @param {Boolean} [settings.autoClose=false] 是否自动关闭（此功能咱未实现）
     *     @param {Boolean} [settings.autoCloseTimeout=5] 自动关闭的等待时间，单位秒（此功能咱未实现）
     *     @param {Boolean} [settings.draggable=true] 是否可以拖动，默认true;
     *     @param {Boolean} [settings.resizable=true] 是否可以调整大小，默认true;
     *     @param {Boolean} [settings.minimizable=true] 是否可以最小化，默认false;
     *     @param {Boolean} [settings.maximizable=true] 是否可以最大化，默认false;
     */
    tbc.Panel = function(settings, panel) {

        var defaults = {
              window    : window
            , opener    : null    // 打开此窗口的窗口对象
            , title     : null    // 窗口标题(根据窗口内容改变)
            , name      : null    // 窗口名称(不变)
            , icon      : ""      // 图标,类型:string,默认:""
            , html      : ""      // 对话框要加载的HTML内容
            , area      : "body"
            , width     : 400    // 对话框的宽度,类型:number,默认:400
            , height    : 300    // 对话框的高度,类型:number,默认:300
            , top       : "auto" // 右边距离
            , left      : "auto" // 左边距离
            , target    : null     // 窗口显示在哪一个元素内
            , modal     : true     // 是否是模态窗口,类型:boolean,默认:true
            , enable3D  : true     // 启用3D效果
            , sizeType  : "restore" // 初始显示状态: max/min/restore
            , minWidth  : 180    // 对话框的宽度,类型:number,默认:400
            , autoShow  : true    //
            , minHeight : 100    // 对话框的高度,类型:number,默认:300
            , autoClose : false    // 是否会自动关闭, 类型:boolean,默认:false
            , draggable : true     // 是否可拖动,类型:boolean,默认:true
            , resizable : true     // 是否可重置尺寸, 类型:boolean,默认:true
            , minimizable : false    // 是否可最小化, 类型:boolean,默认:false
            , maximizable : false    // 是否可最大化, 类型:boolean,默认:false
            , translatable : false    // 是否有翻译按钮, 类型:boolean,默认:false
            , headless : false // 无标题
            , flatten  : false // 扁平风格的（没有标题栏背景）
            , defaultSate : "restore" // [min, max] 初始状态
            , autoCloseTimeout : 5   // 自动关闭的间隔时间(秒),类型:number,默认:5
            , className   : null // 样式类

            // 事件
            , event       : {}  // 如果这里没有设置,可以在实例化后使用 new tbc.Panel().addEvent(type:function)注册新的事件;
        },

        /**
         * 实例配置数据
         * @ignore
         * @private
         * @type {Object}
         */
        options = $.extend({}, defaults, settings);

        options.window = options.window || window;

        tbc.self(this, arguments)
        .extend({

            /**
             * 类名
             * @property {String} packageName
             * @type {String}
             */
            packageName : "tbc.Panel",

            /**
             * 面板组成部件
             * @property {Object} part
             * @type {Object}
             */
            part : {},

            /**
             * 窗体UI外框
             * @public
             * @property {ELement} ui
             */
            ui : null,

            /**
             * 窗体内容容器
             * @public
             * @property {Element} container
             */
            container : null,

            /**
             * 窗口最后一次更改前的大小和位置
             * @public
             * @property {Object} lastSize
             *     @property {Number} lastSize.width 宽度
             *     @property {Number} lastSize.height 高度
             *     @property {Number} lastSize.left 距离window窗口的左边距
             *     @property {Number} lastSize.top 距离window窗口的上边距
             *     @property {Number} lastSize.right 距离window窗口的右边距
             *     @property {Number} lastSize.bottom 距离window窗口的下边距
             * @type {Object}
             */
            lastSize : {
                width  : 0,
                height : 0,
                left   : 0,
                top    : 0,
                right  : "auto",
                bottom : "auto"
            },

            /**
             * 初始化UI
             * @private
             * @method initUi
             * @chainable
             */
            initUi : function(){

                var zindex = tbc.getMaxZIndex($(".tbc-slide-scene.current")[0]),
                    tag = (tbc.msie&&tbc.browserVersion<9) ? "div" : "div",
                    className = [];

                // 窗体的HTML代码(jQuery对象)
                this.ui = $('<'+ tag +' class="tbc-panel shadow" style="filter:alpha(opacity=0); opacity:0; z-index:'+ (zindex+1) +';"></'+ tag +'>')
                    .attr ("tbc", this.guid)
                    .html (
                        '<div role="header" class="tbc-panel-header" unselectable="on" onselectstart="return false;">' +
                        '    <div class="tbc-panel-top-left resize-handle" role="north-west"></div>' +
                        '    <div class="tbc-panel-top-right resize-handle" role="north-east"></div>' +
                        '    <div role="controls" class="tbc-panel-controls">' +
                        '        <div class="tbc-switch-role" role="roleBox">' +
                        '            <span class="tbc-switch-role-roleName" role="roleName"></span>' +
                        '            <span class="tbc-switch-role-handle tbc-icon icon-arrow_state_blue_expanded" role="roleHandle"></span>' +
                        '            <ul class="tbc-switch-role-list" role="roleList"><li>1111</li><li>2222</li></ul>' +
                        '        </div>' +
                        '        <span class="tbc-panel-controls-box">' +
                        '            <a role="close" class="tbc-panel-btn-close" hidefocus="true" title="'+ i18n('v4.js.close') +'">×</a>' +
                        '            <a role="restore" class="tbc-panel-btn-max" hidefocus="true" title="'+ i18n('v4.js.maximize') +'/'+ i18n('v4.js.restore') +'">■</a>' +
                        '            <a role="min" class="tbc-panel-btn-min" hidefocus="true" title="'+ i18n('v4.js.minimize') +'">▁</a>' +
                        '            <a role="refresh" class="tbc-panel-btn-refresh" hidefocus="true" title="'+ i18n('v4.js.refresh') +'">&hArr;</a>' +
                        '            <a role="reset" class="tbc-panel-btn-reset" hidefocus="true" title="'+ i18n('v4.js.reopen') +'">&otimes;</a>' +
                        '            <a role="help" class="tbc-panel-btn-help" hidefocus="true" title="">?</a>' +
                        '            <a role="translate" class="tbc-panel-btn-translate" hidefocus="true" title="">?</a>' +
                        '        </span>' +
                        '    </div>' +
                        '    <div class="tbc-panel-top-center">' +
                        '        <div class="tbc-panel-top-center-handle resize-handle" role="north"></div>' +
                        '        <span class="tbc-panel-icon"><img role="icon" height="16" onerror="this.style.display=\'none\';" /></span>' +
                        '        <div role="title" class="tbc-panel-title">' +
                        '            <!--标题区域-->窗体基类' +
                        '        </div>' +
                        '    </div>' +
                        '</div>' +
                        '<div class="tbc-panel-body">' +
                        '    <div class="tbc-panel-middle-left resize-handle" role="west"></div>' +
                        '    <div class="tbc-panel-middle-right resize-handle" role="east"></div>' +
                        '    <div class="tbc-panel-middle-center tbc-panel-main">' +
                        '        <div role="container" class="tbc-panel-container">' +
                        '            <!--内容区域-->' +
                        '        </div>' +
                        '        <div role="mask" class="tbc-panel-locked-layer" style="display:none;">' +
                        '            <div role="maskTips" class="tbc-panel-locked-layertips"></div>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>' +
                        '<div role="footer" class="tbc-panel-footer">' +
                        '    <div class="tbc-panel-footer-left resize-handle" role="south-west"></div>' +
                        '    <div class="tbc-panel-footer-right resize-handle" role="south-east"></div>' +
                        '    <div class="tbc-panel-footer-center resize-handle" role="south"></div>' +
                        '</div>');

                if (options.className) {
                    className.push(options.className);
                }

                if (options.headless) {
                    className.push('no-title');
                }

                if (options.flatten) {
                    className.push('layerMode');
                }
                this.ui.addClass(className.join(' '));

                this.ui.bind ("click", function (event) {
                    var et = event.target,
                        t  = et.tagName.toLowerCase(),
                        self = tbc.getTaskByElement(this);

                    if (self && $.isFunction(self.focus)) {
                        self.focus();
                    }

                    if (t === "input"||t === "textarea"||t === "button" ||t === "a"||et.contenteditable) {
                        setTimeout(function() {
                            et.focus();
                            et = null;
                        },0);
                    }
                    self = null;
                });

                tbc.Panel.cacheid++;
                this.cacheid = tbc.Panel.cacheid;
                this.ui.attr("iid", this.iid);
                this.ui.attr("cacheid", this.cacheid);
                tbc.Panel.cache[ this.cacheid ] = this;
                tbc.Panel.cache_length += 1;

                // 为最小化、最大化、还原等添加CSS Class
                if (options.closable!==false) this.ui.addClass("closable");
                if (options.minimizable) this.ui.addClass("minimizable");
                if (options.maximizable) this.ui.addClass("maximizable");
                if (options.refreshable) this.ui.addClass("refreshable");
                if (options.resettable) this.ui.addClass("resettable");
                if (options.helpable) this.ui.addClass("helpable");
                if (options.translatable===true && tbc.cookie('translationMode')==='true') {
                    this.ui.addClass("translatable");
                }

                return this;
            },

            /**
             * 初始化面板零部件
             * @private
             * @chainable
             */
            initPart : function() {
                var self = this;

                // 缓存面板零部件
                this.ui.find("[role]").each(function(inx, elem) {
                    var role = elem.getAttribute("role");
                    this.part[role] = $(elem);
                }.bind(this));

                this.container = this.part.container;

                // 表单提交
                if (this.part.form) {
                    this.part.form.submit(function(event) {
                        event.preventDefault();
                        this.triggerEvent("submit");
                    }.bind(this));
                }

                // 窗体控制按钮, 包括最小化、最大化、关闭等的操作
                this.part.controls
                .bind ("mousedown", function(event) { event.disableSelectArea = true; event.stopPropagation(); })
                .delegate ("a", "click", null, function(event) {

                    event.preventDefault();

                    var elem = event.currentTarget,
                        role = elem.getAttribute("role");

                    switch (role) {
                        case "close":
                            event.stopPropagation();
                            this.close();
                            break;

                        case "min":
                            if (options.minimizable) { setTimeout(function(){ self.min();}, 10); }
                            break;

                        case "max":
                            if (options.maximizable) { this.max(); }
                            break;

                        case "restore":
                            if (options.maximizable) {
                                if (this.sizeType === "max") {
                                    this.restore();
                                } else {
                                    this.max();
                                }
                            }
                            break;

                        case "refresh":
                            if (options.refreshable && this.refresh) {
                                this.refresh();
                            }
                            break;

                        case "reset":
                            if (options.resettable && this.reset) {
                                this.reset();
                            }
                            break;

                        case "help":
                            if (options.helpable) {
                                this.help();
                            }
                            break;

                        case "translate":
                            if (options.translatable || tbc.cookie('translationMode')==='true') {
                                this.openTranslateWin();
                            }
                            break;

                        default:
                            break;
                    }
                }.bind(this));

                // 双击标题栏
                this.part.title.dblclick(function() {
                    if (self.sizeType !== "max" && options.maximizable) {
                        self.max();
                    } else {
                        self.restore();
                    }
                });

                if (tbc.msie && tbc.browserVersion<8) {
                    var controlsWidth = self.part.controls.children(".tbc-panel-controls-box").children().size() * 24 +2;
                    self.part.controls.width(controlsWidth);
                }

                return this;
            },

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {

                this.packageName = "tbc.Panel";

                this.initUi();
                this.initPart();
                this.initDrag();
                this.initResize();
                this.initContextmenu();

                return this;
            },

            /**
             * 初始化打开
             * @private
             * @method initForOpen
             * @chainable
             */
            initForOpen : function () {
                var mw, mh, l, r, t, b, taskbarH;

                if (options.windowInitialType === "FULL" || options.windowInitialType === "MAX") {
                    mw = "100%";
                    mh = "100%";
                    l = r = t = b = 0;
                } else {
                    taskbarH = window.taskbar ? taskbar.ui.height() : 0;
                    mw = tbc.system ? Math.min(tbc.system.getDesktopWidth(), (options.width||options.minWidth)) : (options.width||options.minWidth);
                    mh = tbc.system ? Math.min(tbc.system.getDesktopHeight()-24-taskbarH, (options.height||options.minHeight)) : (options.height||options.minHeight);
                    l = options.left;
                    r = options.right;
                    b = options.bottom;
                    t = options.top;
                }

                this.appendTo(options.target || tbc.Panel.parent || "body")
                .name(options.name|| "窗口")
                .icon(options.icon || tbc.Panel.defaultIcon || (window.DEFAULT_ICONS?DEFAULT_ICONS.window_icon:null) || "")
                .resize(mw, mh, t, r, b, l, false);

                if (options.windowInitialType === "FULL" || options.windowInitialType === "MAX") {
                    this.resize("max").rememberSize(options.width, options.height, options.top, options.left);
                } else {
                    this.rememberSize();
                }

                this.opened = true;

                /* 自定义滚动条(后期实现)
                if ($.fn.nanoScroller) {
                    try{
                        $(".tbc-panel-main", SELF.ui).nanoScroller({
                            paneClass    : "tbc-window-slidebar",
                            sliderClass  : "tbc-window-slider",
                            contentClass : "tbc-panel-container"
                        });
                    }catch(e) {}
                }
                */

                /**
                 * 在窗口第一次打开被打开时触发此事件
                 * @event open
                 */
                this.triggerEvent("open");
                return this;
            },

            /**
             * 初始化拖动
             * @private
             * @method initDrag
             * @chainable
             */
            initDrag : function() {

                var SELF = this;

                // 如果可拖动:
                try{
                    if (options.draggable) {

                        SELF.addEvent ("drop", function () {
                            SELF.rememberSize();
                        });

                        if ($.fn.drag) {
                            SELF.ui
                            .addClass("draggable")
                            .drag
                            ({
                                  document : document
                                , area    : "body"
                                , areaMargin: {top:-6, left:"-80%", bottom:"80%", right:"80%"}
                                , handle  : SELF.part.title
                                , enabled : function() {return SELF.ui.hasClass("draggable");}
                                , timeout : 1
                                , event   : {
                                    dragStart : function () {
                                        var z = SELF.ui.css('zIndex') || 2;

                                        tbc.lock("body", {zIndex:9999999, opacity:0.001, cursor:"move"});

                                        SELF.dragSaveOnIframe = $('<div />')
                                        .insertAfter(SELF.ui)
                                        .css({position:'absolute', z:z-1, background:'#fff', opacity:0.01, width:'100%', height:'100%', left:0, top:0 });

                                        /**
                                         * 在拖动开始时会触发此事件
                                         * @event dragStart
                                         */
                                        SELF.triggerEvent("dragStart");
                                    },
                                    drag : function (event, offset) {
                                        SELF.triggerEvent("drag", offset);
                                    },
                                    drop : function (event, offset) {
                                        if (SELF.dragSaveOnIframe) {
                                            SELF.dragSaveOnIframe.remove();
                                        }

                                        tbc.unlock("body");

                                        /**
                                         * 在拖动结束后会触发此事件
                                         * @event drop
                                         */
                                        SELF.triggerEvent("drop", offset);
                                    }
                                }
                            });
                        }

                        SELF.part.title.mousedown(function() { SELF.focus(); });
                    } else if (options.draggable && !$.fn.drag) {
                        throw "jQuery plugins 'jQuery.fn.drag' was not found! jQuery.fn.dialog Dependent on the plugin.";
                    }
                }catch(e) {
                    tbc.log(e);
                }
                return this;
            },

            /**
             * 初始化调整大小功能
             * @private
             * @method initResize
             * @chainable
             */
            initResize : function() {
                var SELF = this;
                // 如果可缩放:
                try{
                    if (options.resizable && $.fn.resizableForTbc) {
                        SELF.ui
                        .addClass("resizable")
                        .resizableForTbc({
                              handle    : ".resize-handle"
                            , vector    : "normal" // 类型: string, 取值范围: north, north-west, north-east, west, east, south, south-west, south-east
                            , document  : document // 用于不同框架的元素重置大小。
                            , margin    : { top: 7, left: 7, right: 9, bottom: 9 }
                            , minWidth  : options.minWidth
                            , minHeight : options.minHeight
                            , enabled : function() {return SELF.ui.hasClass("resizable");}

                            /* 事件 */
                            , onResizeStart : function () { SELF.focus().lock(); }
                            , onResize      : function () { }
                            , onResizeEnd   : function (size) {
                                SELF.resize(size);
                                SELF.unlock();
                            }
                        });

                    } else if (options.resizable && !$.fn.resizableForTbc) {
                        throw "jQuery plugins 'jQuery.fn.resizableForTbc' was not found! jQuery.fn.dialog Dependent on the plugin.";
                    }
                } catch(err) {
                    tbc.log(err);
                }
                return this;
            },

            /**
             * 初始化右键菜单
             * @private
             * @method initContextmenu
             * @chainable
             */
            initContextmenu : function() {
                var SELF = this;
                // 右键菜单
                if ($.isFunction($.fn.contextmenu)) {
                    this.ui.contextmenu({
                        items:[
                            {
                                text : i18n('v4.js.minimize'), //"最小化",
                                icon :"",
                                click:function() {SELF.min();},
                                disabled:!options.minimizable,
                                inheritable:true
                            }, {
                                text  : function() {
                                    return SELF.sizeType === "max" ?
                                        i18n('v4.js.restore') :
                                        i18n('v4.js.maximize');
                                },
                                icon  : "",
                                click : function() {
                                    if (SELF.sizeType === "max") {
                                        SELF.restore();
                                    } else {
                                        SELF.max();
                                    }
                                },
                                disabled:!options.maximizable,
                                inheritable:true
                            },
                            {
                                text:i18n('v4.js.close'),
                                icon:"",
                                click:function() {
                                    SELF.close();
                                },
                                inheritable:true
                            }
                        ]
                    });
                }
                return this;
            },

            /**
             * 计算并渲染窗体各零部件的尺寸
             * @public
             * @method panelLayout
             * @chainable
             */
            panelLayout : function() {
                var self = this;
                try{
                    var panel = self.ui;
                    //  调整弹出层内部元素的布局
                    var _bodyHeight    = panel.innerHeight() - self.part.header.height() - self.part.footer.height(),
                        _contWidth    = panel.width() - $(".tbc-panel-middle-left", panel).width() - $(".tbc-panel-middle-right", panel).width();

                    $(".tbc-panel-body", panel).height(_bodyHeight);
                    self.part.container.height(_bodyHeight).width(_contWidth);
                }catch(e) {
                }
                self = null;
                return this;
            },

            /**
             * 显示窗体
             * @public
             * @method show
             */
            show : function() {
                var self = this;

                if (!this.opened) { this.initForOpen(); }

                this.minimize = false;

                this.ui
                .css({opacity:0, display:"block"})
                .animate({opacity:1}, 200); // 影响性能(5~10s)

                this.facade();

                setTimeout(function() {
                    self.focus();
                    self = null;
                }, 0);

                /**
                 * 在窗口显示时会触发此事件
                 * @event show
                 */
                this.triggerEvent("show");

                return this;
            },

            /**
             * 隐藏
             * @public
             * @method hide
             * @chainable
             */
            hide : function() {
                var SELF = this;

                if (tbc.msie && tbc.browserVersion<8) {
                    this.ui.css({opacity:0,display:"none"});
                } else {
                    this.ui.animate({opacity:0,display:"none"}, 200,  function() {
                        SELF.ui.hide();
                        SELF = null;
                    });
                }

                this.evert();

                /**
                 * 隐藏窗口时会触发此事件
                 * @event hide
                 */
                this.triggerEvent("hide");

                return this;
            },

            /**
             * 设置或者获取HTML代码，如果传入一个String或Element类型的参数，
             * 则设置在窗体的内容区域（this.container）的HTML; 否则获取HTML;
             * @public
             * @method html
             * @param {String} [html] 新的HTML代码
             */
            html : function(html) {
                this.triggerEvent("beforeChange");

                if (html) {
                    this.container.html(html);
                    this.triggerEvent("afterChange");
                    return this;
                } else {
                    return this.container.html();
                }
            },

           /**
            * 给窗体容器追加节点或HTML内容
            * @public
            * @method append
            * @param {Element} ele 节点或HTML内容.
            * @chainable
            */
            append : function(ele) {
                /**
                 * 在调用append/prepend方法前会触发此事件
                 * @event beforeChange
                 */
                this.triggerEvent("beforeChange");
                this.container.append(ele);

                /**
                 * 在调用append/prepend方法前会触发此事件
                 * @event afterChange
                 */
                this.triggerEvent("afterChange");
                return this;
            },

            /**
             * 将窗体显示到某一容器
             * @public
             * @method append
             * @param {Element} elem 节点或HTML内容;
             */
            appendTo : function(elem) {
                this.ui.appendTo(elem);
                return this;
            },

            /**
             * 从窗体前面插入节点或HTML内容
             * @public
             * @method prepend
             * @param {Element} elem 节点或HTML内容, 必须;
             */
            prepend : function(elem) {
                this.triggerEvent("beforeChange");
                if (elem.ui) {
                    this.container.prepend(elem.ui);
                } else {
                    this.container.prepend(elem);
                }
                this.triggerEvent("afterChange");
                return this;
            },

            /**
             * 将窗口渲染到某一容器的前部
             * @public
             * @method prepend
             * @param {Element} elem 节点或HTML内容, 必须;
             */
            prependTo : function(elem) {
                if (elem.container) {
                    this.ui.prependTo(elem.container);
                } else {
                    this.ui.prependTo(elem);
                }
                return this;
            },

            /**
             * 标题模板
             * titleModel description
             * @property {String} titleModel
             * @type {String}
             */
            titleModel:"{0}<span style='filter:alpha(opacity=70); opacity:0.7; font-weight:lighter;' title='{0} {1}'>{1}</span>",

            /**
             * 设置或获取窗体的title
             * @method title
             * @param {String} [title] 要设置的新title,可选的,当没有该参数时返回旧的title
             * @return {String} 窗体的Title
             */
            title : function (title) {
                if (title) {
                    options.title = title;

                    var name = options.name,
                        title_1 = options.title,
                        title_2,
                        t = (title_1 && title_1 !== name)
                            ? tbc.formatString(this.titleModel||"", title_1?name+" > ":name, title_1)
                            : options.name;

                    title_2 = title_1 ? (name+" > " + title_1) : (name||"");
                    this.part.title.html(t).attr("title", title_2);

                    /**
                     * 在更改窗体标题后会触发此事件
                     * @event changeTitle
                     */
                    this.triggerEvent("changeTitle", title, name);
                    return this;
                }
                return options.title;
            },

            /**
             * 设置或获取窗体的name
             * @public
             * @method name
             * @param {String} [name] 要设置的新name,可选的,当没有该参数时返回旧的name
             * @return {String} 返回名称
             */
            name : function (name) {
                if (name) {
                    options.name = name;

                    var name_1 = name,
                        title_1 = options.title,
                        name_2,
                        n = (title_1 && title_1 !== name_1)
                            ? tbc.formatString(SELF.titleModel, title_1?(name_1+" > "):name_1, title_1)
                            : options.name;

                    name_2 = title_1 ? (name_1+" > "+title_1) : (name_1||"");

                    this.part.title.html(n).attr("title", name_2);

                    /**
                     * 在更改窗体标题后会触发此事件
                     * @event changeTitle
                     * @param {String} title_1 窗口标题
                     * @param {String} name 窗口名称
                     */
                    this.triggerEvent("changeTitle", title_1, name);

                    return this;
                }
                return options.name;
            },

            /**
             * 设置或获取窗体的icon路径
             * @public
             * @method icon
             * @param {String} [icon] 要设置的新icon路径或CSS class, 当没有该参数时返回旧的icon路径
             * @return {String} 窗体的icon地址
             */
            icon : function (icon) {

                var isimg = tbc.system.isImg(icon);
                if (isimg || !icon || icon === "null") {
                    icon = isimg ? icon : window.DEFAULT_ICONS ? DEFAULT_ICONS.window_icon : '';

                    this.part.icon.show().parent().css({backgroundPosition:"center center"});
                    this.part.icon.attr("src", icon);

                    /**
                     * 在改变窗体图标后会触发此事件
                     * @event changeIcon
                     */
                    this.triggerEvent("changeIcon", icon);
                    return this;
                } else {
                    this.part.icon.parent().addClass("tbc-icon "+icon).css({backgroundImage:""});
                    this.part.icon.hide();
                    return this;
                }

                return this.part.icon.attr("src");
            },

            /**
             * 关闭窗体和销毁窗体实例，如果参数focusNext不为true，则在关闭后
             * 使下一个窗体获得焦点
             * @public
             * @method close
             * @param {Boolean} focusNext 是否在关闭后让下一个窗体获得焦点，默认true
             */
            close : function(focusNext) {
                var SELF = this;

                // 如果有打开的子模态窗体,则使子模态窗体获得焦点
                if (this.modalWindow) {
                    try {
                        if (focusNext) {
                            this.modalWindow.close(focusNext);
                        } else {
                            this.modalWindow.show().focus().flash();
                            return this;
                        }
                    } catch (e) {}
                }

                /**
                 * 在关闭窗体前会触发此事件，如果事件内的任何一个方法返回
                 * false，都将阻止窗口关闭
                 * @event beforeClose
                 */
                if (this.triggerEvent("beforeClose") === false) {
                    return this;
                }

                /**
                 * 在关闭窗体后会触发此事件
                 * @event beforeClose
                 * @param {AnyType} returnValue 窗口的放回值，如果窗口的类型loadType
                 *                              是iframe，则返回iframe的contentWindow
                 *                              对象的returnValue值（不能跨域）
                 */
                this.triggerEvent("close", this.returnValue);

                tbc.Panel.cache_length -= 1;
                delete tbc.Panel.cache[this.cacheid];
                tbc.Panel.removeSequence(this.cacheid);

                if (this.opener && this.opener.modalWindow) {
                    delete this.opener.modalWindow;
                }

                // 关闭当前窗口时,让下一个窗口(仅限当前分屏的窗口)获得焦点(异步执行)
                if (!focusNext) {
                    setTimeout(function() {
                        var scene1 = window.desktop ? window.desktop.current().container[0] : null,
                            scene2,
                            win,
                            seq, i;

                        for (seq=tbc.Panel.sequence, i=seq.length; i>=0; i-=1) {
                            win = tbc.Panel.cache[seq[i]];
                            if (win) {
                                scene2 = tbc.Panel.cache[seq[i]].ui.parent()[0];
                                if (scene1 === scene2 || scene2 === document.body) {
                                    tbc.Panel.cache[seq[i]].focus();
                                    break;
                                }
                            }
                        }

                        scene1 = scene2 = win = null;
                    }, 0);
                }

                function deleteSELF() {
                    if (SELF) {
                        var k;

                        SELF.ui.empty().remove();

                        for (k in SELF.part) {
                            if (SELF.part.hasOwnProperty(k)) {
                                delete SELF.part[k];
                            }
                        }

                        /**
                         * 在窗口完全关闭后会触发此事件，此事件可能会有延迟
                         * @event afterClose
                         * @param {AnyType} returnValue 窗口的放回值，如果窗口的类型loadType
                         *                              是iframe，则返回iframe的contentWindow
                         *                              对象的returnValue值（不能跨域）
                         */
                        SELF.triggerEvent("afterClose", SELF.returnValue);
                        SELF.DESTROY();
                    }
                    options = defaults = SELF = null;
                }

                if (tbc.msie && tbc.browserVersion<8) {
                    deleteSELF();
                } else {
                    this.evert();
                    this.ui.animate(
                        {opacity:0, marginTop:"-=20px"}, 300, deleteSELF
                  );
                }
            },

            /**
             * 关闭其他窗口
             * @return {[type]} [description]
             */
            closeOther : function() {

            },

            /**
             * 把窗体最小化到任务栏
             * @public
             * @method min
             * @chainable
             */
            min : function() {
                this.blur();
                this.ui.hide();

                this.minimize = true;
                this.maximize = false;

                /**
                 * 在最小化窗口后触发此事件
                 * @event min
                 */
                this.triggerEvent("min");
                return this;
            },


            /**
             * 窗体最大化
             * @public
             * @method max
             * @chainable
             */
            max : function() {

                if (this.minimize) { this.show(); }
                this.disableResize().disableDrag();
                this.resize("100%","100%",null,null,null,null,false);
                this.sizeType = "max";
                this.maximize = true;
                this.minimize = false;
                this.ui.addClass("maximize");

                /**
                 * 在最大化窗口后触发此事件
                 * @event max
                 */
                this.triggerEvent("max");
                return this;
            },

            /**
             * 还原窗体尺寸
             * @public
             * @method restore
             * @chainable
             */
            restore : function() {

                if (this.minimize) { this.show(); }

                var ls = this.lastSize || {},
                    l  = ls.left   || 0,
                    t  = ls.top    || 0,
                    w  = ls.width  || this.ui.width(),
                    h  = ls.height || this.ui.height();

                this.enableResize().enableDrag();
                this.resize(w, h, t, null, null, l, false);
                this.sizeType = "restore";
                this.minimize = false;
                this.maximize = false;
                this.ui.removeClass("maximize");

                /**
                 * 在窗口取消最大化或最小化状态后触发此事件
                 * @event restore
                 */
                this.triggerEvent("restore");

                return this;
            },

            /**
             * 当前窗口的尺寸状态: min/max/restore
             * @public
             * @property {String} sizeType
             * @type {String}
             */
            sizeType : options.sizeType || "restore",

            /**
             * 记忆窗体尺寸
             * @param  {Number} w 宽度
             * @param  {Number} h 高度
             * @param  {Number} t 上边距
             * @param  {Number} l 左边距
             * @chainable
             */
            rememberSize : function(w, h, t, l) {
                this.lastSize = {
                    top    : t || this.ui.css("top"),
                    left   : l || this.ui.css("left"),
                    width  : w || this.ui.width(),
                    height : h || this.ui.height()
                };
                return this;
            },

            /**
             * 打开模态窗体
             * @param  {Object} opt       同className的参数
             * @param  {Class} [className] 指定模态窗体的基类
             * @return {Object}           返回创建的模态窗体
             */
            openModalDialog:function(opt, className) {

                var SELF = this,
                    BaseClass = className || SELF.constructor || tbc.Panel;

                this.modalWindow = new BaseClass(opt);
                this.modalWindow.opener = this;
                this.modalWindow.addEvent({
                    "afterClose" : function() {
                        SELF.modalWindow = null;
                        SELF.show().focus();
                    }
                });

                BaseClass = null;
                return this.modalWindow;
            },

            /**
             * 打开非模态窗体
             * @param  {Object} opt       同className的参数
             * @param  {Class} [className] 指定模态窗体的基类
             * @return {Object}           返回创建的模态窗体
             */
            openModalessDialog : function(opt, className) {

                var SELF = this,
                    BaseClass = className || SELF.constructor || tbc.Panel;

                this.modalWindow = new BaseClass(opt);
                this.modalWindow.opener = this;
                this.modalWindow.modaless = true;
                this.modalWindow.addEvent({
                    "afterClose" : function() {
                        SELF.modalWindow = null;
                        SELF.show().focus();
                    }
                });

                BaseClass = null;
                return this.modalWindow;
            },

            /**
             * 是否处于获得焦点状态
             * @public
             * @property {Boolean} focused
             * @type {Boolean}
             */
            focused:false,

            /**
             * 让窗口获得焦点, 如果此窗口所在的桌面处于隐藏状态，
             * 则会自动显示此桌面，并让此窗口获得焦点；如果此窗口
             * 有打开的模态窗口，则仅让基于此窗口的模态窗口获得焦
             * 点；
             * @public
             * @method focus
             * @chainable
             */
            focus : function() {

                var p = this.ui.parent(),
                    modalWin = this.modalWindow,
                    Z, task, index,
                    Za, Ta, c, w;

                // 如果已经最小化,则不再获得焦点
                //if (this.minimize === true) return this;

                // 显示对应的分屏
                if (!p.hasClass("current")) {
                    task = tbc.system ? tbc.system.getTaskByElement(p) : null;

                    if (task) {
                        index = task.index;
                        desktop.show(index);
                    }

                    p = task = null;
                }

                // 如果有打开的子模态窗体,则使子模态窗体获得焦点
                if (modalWin) {
                    Z  = tbc.getMaxZIndex(this.ui.parent()[0]);
                    this.ui.css({ zIndex:Z });

                    if (modalWin && !modalWin.modaless) {
                        if (modalWin.focused) {
                            modalWin.focus().flash();
                        } else {
                            modalWin.focus();
                        }
                        return this;
                    } else {
                        modalWin.ui.css({zIndex: Z+1});
                    }
                }

                if (this.focused === true) {
                    return this;
                }
                this.focused = true;

                tbc.Panel.removeSequence(this.cacheid);
                tbc.Panel.sequence.push(this.cacheid);
                this.unlock("blur");

                Ta = Math.max(window.parseInt(this.ui.css("top")), -6);

                // 如果有非模态或模态窗口，则保持模态窗口在最前面；
                if (modalWin) {
                    this.ui.addClass("shadow");
                } else {
                    Za = tbc.getMaxZIndex(this.ui.parent()[0]);
                    this.ui.addClass("shadow").css({ zIndex:Za + 1, top:Ta });
                }

                /**
                 * 在窗口获得焦点后触发此事件
                 * @event focus
                 */
                this.triggerEvent("focus");

                // 使其他窗口失去焦点
                c = tbc.Panel.cache;
                for(w in c) {
                    if (c.hasOwnProperty(w) && c[w] !== this && c[w].blur && c[w].focused) {
                        c[w].blur(true);
                    }
                }
                c=null;

                return this;
            },

            /**
             * 使窗体失去焦点
             * @public
             * @method blur
             * @param  {Boolean} [focusNext=false] 是否让下一个窗口获得焦点，默认false;
             * @chainable
             */
            blur : function (focusNext) {

                var i, seq, w;

                if (focusNext !== true) {
                    seq = tbc.Panel.sequence;
                    for (i=seq.length-2; i>-1; i--) {
                        w = tbc.Panel.cache[seq[i]];
                        if (this.ui && w.ui && this.ui.parent()[0] === w.ui.parent()[0]) {
                            if (w && !w.minimize && !w.focused) {
                                w.focus();
                                break;
                            }
                        }
                    }
                    w = seq = null;
                }

                this.focused = false;
                this.ui.removeClass ("shadow");
                if (!this.modalWindow || !this.modalWindow.modaless) {
                    this.lock("blur", "", 0.1);
                }

                /**
                 * 在窗口失去焦点后触发此事件
                 * @event blur
                 */
                this.triggerEvent ("blur");

                return this;
            },

            /**
             * 重新设置宽度和高度
             * @public
             * @method resize
             * @param {String | Object | Number} newSize 新的尺寸；类型说明：
             *     String: 字符串类型仅支持“min”，“max”, “restore”；
             *     Number: 如果是数字，则表示宽度，并且必须传后面几个参数；
             *     Object: 则必须有下面这些子属性；
             *     @param {Number} newSize.width 宽度
             *     @param {Number} newSize.height 高度
             *     @param {Number} newSize.top 上边距
             *     @param {Number} newSize.right 右边距
             *     @param {Number} newSize.bottom 下边距
             *     @param {Number} newSize.left 左边距
             * @param {Number} [height] 高度
             * @param {Number} [top] 上边距
             * @param {Number} [right] 右边距
             * @param {Number} [bottom] 下边距
             * @param {Number} [left] 左边距
             * @chainable
             */
            resize : function(newSize) {
                var size, arg;

                switch (newSize) {
                    case "min"     : this.min();     break;
                    case "max"     : this.max();     break;
                    case "restore" : this.restore(); break;
                    default:
                        if (newSize) {
                            var parent   = $(options.area).size() ? $(options.area) : this.ui.parent(),
                                remember = true;

                            if (typeof(newSize) !== "object") {
                                arg = arguments;
                                size = { width:arg[0], height:arg[1], top:arg[2],  right:arg[3], bottom:arg[4], left:arg[5] };
                            } else {
                                size = newSize;
                                arg = [size.width, size.height, size.top, size.right, size.bottom, size.left];
                            }

                            remember = arguments[arguments.length-1] === false ? false : remember;

                            size.width = size.width === "auto"
                                ? parent.innerWidth() -((!isNaN(size.left) ? size.left : 20) + (!isNaN(size.right) ? size.right :20))
                                : (size.width === "100%" ? parent.innerWidth()+12 : size.width);

                            size.height = size.height === "auto"
                                ? parent.innerHeight() -((!isNaN(size.top) ? size.top : 20) + (!isNaN(size.bottom) ? size.bottom :20))
                                : (size.height === "100%" ? parent.innerHeight()+12 : size.height);

                            var width  = Math.max(size.width, options.minWidth),
                                height = Math.max(size.height, options.minHeight),
                                left   = arg[0] === "100%" ? -6 : (size.left === "auto" ? Math.max(0, (parent.width()-width)/2) : size.left),
                                right  = size.right === "auto" ? Math.max(0, (parent.width()-width)/2) : size.right,
                                top    = arg[1] === "100%" ? -6 : (size.top === "auto" ? Math.max(0, (parent.height()-height)/2) : size.top),
                                bottom = size.bottom === "auto" ? Math.max(0, (parent.height()-height)/2) : size.bottom;

                            if (remember !== false) {
                                $.extend(this.lastSize, {
                                    left   : parseInt(this.ui.css("left")),
                                    top    : parseInt(this.ui.css("top")),
                                    width  : this.ui.width(),
                                    height : this.ui.height()
                                });
                            }

                            this.ui.css({ width:width, height:height, left:left, right:right, top:top, bottom:bottom });

                            this.panelLayout();

                            /**
                             * 在窗口调整尺寸后触发此事件
                             * @event resize
                             * @param {Object} size 尺寸
                             *     @param {Number} size.width 宽度
                             *     @param {Number} size.height 高度
                             */
                            this.triggerEvent("resize", {width: width, height:height});
                        }
                        break;
                }

                return this;
            },

            /**
             * 设置或返回宽度
             * @public
             * @method resizeWidth
             * @param {Number} width 要设置的宽度, “auto”为减去第二个参数后的宽度;
             * @param {Number} [margin=0] 默认为0; 当参数width值为“auto”时才有效；
             * @chainable
             */
            resizeWidth : function(width, margin) {

                width = !isNaN(width) ? width : {width:width, left:margin, right:margin};
                this.resize(width);

                return this;
            },

            /**
             * 设置或返回高度
             * @public
             * @method resizeHeight
             * @param {Number} height 要设置的宽度, “auto”为减去第二个参数后的宽度;
             * @param {Number} [margin=0] 默认为0; 当参数height值为“auto”时才有效；
             * @chainable
             */
            resizeHeight : function(height, margin) {
                height = !isNaN(height) ? height : {height:height, top:margin, bottom:margin};
                this.resize(height);

                return this;
            },

            locateTransWin: function(transWin) {
                var transWidth = transWin.ui.width() + 10,
                    pOffset = this.offset(),
                    left = (pOffset.left + pOffset.width) - transWidth,
                    top = pOffset.top + 32;

                transWin.ui.css({left:left, top:top});
            },

            openTranslateWin: function (key) {
                var a = new Date().getTime();
                var self = this,
                    pOffset = self.offset(),
                    width = 320,
                    height = 200,
                    left = (pOffset.left + pOffset.width) - width -10,
                    top = pOffset.top + 32,
                    transWin;

                desktop.transWin = desktop.transWin || this.openModalessDialog({
                    name      : i18n('v4.js.translate'),
                    icon      : 'icon-i18n',
                    width     : width,
                    height    : height,
                    maxWidth  : 480,
                    left      : left,
                    top       : top,
                    // homepage  : URLS['translateForm'],
                    // autoLoad  : true,
                    // loadType  : 'ajax',
                    className :'layerMode',
                    resizable : true
                }, tbc.Panel)
                .addEvent({
                    open: function() {
                        this.container.load(URLS['translateForm']);
                        self.locateTransWin(transWin);
                    },
                    resize: function(size) {
                        var schBarHei = this.ui.find('.trans-inputer').outerHeight(),
                            box = this.ui.find('.trans-tips, .trans-list');
                        box.height(size.containerHeight - schBarHei);
                    }
                });

                transWin = desktop.transWin;
                transWin.i18nKey = key;
                transWin.removeEvent('close').addEvent({
                    close: function() {
                        desktop.transWin = null;
                        self.removeEvent('drop.translate');
                    }
                });

                if ($.isFunction(transWin.search)) {
                    transWin.search(key);
                }

                // 将词条维护窗口附着在
                if (transWin.opener !== this) {
                    transWin.opener.modalWindow = null;
                    transWin.opener.
                        removeEvent('drop.translate').
                        removeEvent('resize.translate');
                    transWin.opener = this;
                    this.modalWindow = transWin;
                }

                this.addEvent({
                    'drop.translate': function() {
                        this.locateTransWin(transWin);
                    },
                    'resize.translate': function(offset) {
                        this.locateTransWin(transWin);
                    }
                });

                transWin.show().focus();
            },

            /**
             * 禁止调整大小
             * @public
             * @method disableResize
             * @chainable
             */
            disableResize : function() {
                this.ui.removeClass("resizable");
                return this;
            },

            /**
             * 启用大小调整功能
             * @public
             * @method enableResize
             * @return {[type]} [description]
             */
            enableResize : function() {
                this.ui.addClass("resizable");
                return this;
            },

            /**
             * 禁止拖动
             * @public
             * @method disableDrag
             * @chainable
             */
            disableDrag : function() {
                this.ui.removeClass("draggable");
                return this;
            },

            /**
             * 启动拖动
             * @public
             * @method enableDrag
             * @chainable
             */
            enableDrag : function() {
                this.ui.addClass("draggable");
                return this;
            },

            /**
             * 让窗口居中显示
             * @public
             * @method center
             * @chainable
             */
            center : function(callback, w, h) {

                /* 计算窗口要显示的坐标位置:left、top、width、height */
                var width  = w&&!isNaN(w) ? w : this.ui.width(),
                    height = h&&!isNaN(h) ? h : this.ui.height(),
                    left   = options.left,
                    top    = options.top,
                    docEle = document.documentElement,
                    body   = document.body,
                    pageW  = docEle.clientWidth  || docEle.offsetWidth,
                    pageH  = docEle.clientHeight || docEle.offsetHeight;

                /** 水平居中  */
                left = (pageW < width
                        ? Math.max(docEle.scrollLeft, body.scrollLeft)
                        : (pageW / 2)
                            + Math.max(docEle.scrollLeft, body.scrollLeft)
                            - (width / 2));

                /** 垂直居中 */
                top =  (pageH < height
                        ? Math.max(docEle.scrollTop, body.scrollTop)
                        : (pageH / 2)
                            + Math.max(docEle.scrollTop, body.scrollTop)
                            - (height / 2));

                this.ui.css({ top: top, left: left, width:width, height:height});
                $.isFunction(callback) && callback.call(this);

                /**
                 * 窗口居中显示时触发此事件
                 * @event center
                 */
                this.triggerEvent("center");

                docEle = body = null;
                return this;
            },

            /**
             * 锁定窗口，在某些情况下需要禁止窗口暂时禁止用户继续操作，
             * 那么可以将窗口lock()；
             * @param  {String} type    锁定类型 "lock", "loading", "waiting", "moving", "modal"；
             * @param  {String} msg     显示在锁定蒙版上的提示
             * @param  {Number} [opacity] 蒙版透明度：一个表示透明度的小数；
             * @chainable
             */
            lock: function (type, msg, opacity) {
                // type 取值范围: "lock", "loading", "waiting", "moving", "modal"
                var l = $('.tbc-panel-locked-layer', this.ui);
                    l.css({ display:"block" });
                    opacity && l.css({opacity:opacity});
                    type && l.addClass(type);
                this.part.maskTips.html(msg);

                /**
                 * 锁定窗口时触发此事件
                 * @event lock
                 */
                this.triggerEvent("lock");
                return this;
            },

            /**
             * 将窗口解锁，此方法相对于lock; 可以解除某一种锁定状态
             * @param  {String} type 取值类型 "lock", "loading", "waiting", "moving", "modal"；
             * @example
             *     this.lock("loading");
             *     this.unlock("loading");
             * @chainable
             */
            unlock: function (type) {
                // type 取值范围: "lock", "loading", "waiting", "moving", "modal"

                var layer=$('.tbc-panel-locked-layer', this.ui);

                type && layer.removeClass(type);
                if ($.trim(layer.attr("class")) === "tbc-panel-locked-layer") {
                    layer.css({ display:"none" });
                    layer.css({ opacity:""});
                }
                this.part.maskTips.html("");

                /**
                 * 窗口解除锁定时触发此事件
                 * @event unlock
                 */
                this.triggerEvent("unlock");

                return this;
            },

            /**
             * 让窗口抖动（已更名为shake）
             * @deprecated
             * @async
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            fling : function(callback) {
                return this.shake();
            },

            /**
             * 让窗口抖动
             * @async
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            shake : function(callback) {
                var SELF = this,
                    panel = this.ui;

                panel.animate({left:"-=5px"}, 40);
                panel.animate({left:"+=10px"}, 40);
                panel.animate({left:"-=5px"}, 40);
                panel.animate({left:"+=4px"}, 40);
                panel.animate({left:"-=4px"}, 40);
                panel.animate({left:"+=2px"}, 40);
                panel.animate({left:"-=2px"}, 40, function() { $.isFunction(callback)&&callback.call(SELF); });
                panel = null;

                /**
                 * 窗口抖动时触发此事件
                 * @event shake
                 */
                this.triggerEvent("shake");

                /**
                 * 窗口抖动时触发此事件(不赞成继续使侦听事件)
                 * @deprecated 已经更名为shake
                 * @event fling
                 */
                this.triggerEvent("fling");

                return this;
            },

            /**
             * 让窗口缩放至某一尺寸和位置
             * @param {Obejct | Element} offset 如果是一个表示位置和尺寸的对象, 则
             *     要包含以下子参数；
             *     @param {Number} offset.width 宽度；
             *     @param {Number} offset.height 高度；
             *     @param {Number} offset.top 上边距；
             *     @param {Number} offset.left 左边距；
             *     @param {Number} offset.opacity 透明度；
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            scaleTo : function(offset, callback) {
                var SELF = this,
                    panel = SELF.ui,
                    wid = panel.width(),
                    hei = panel.height(),
                    lft = panel.css("left"),
                    top = panel.css("top"),
                    offset_2 = !$.isPlainObject(offset)
                        ? $.extend({}, $(offset).offset(), {width:$(offset).width(), height:$(offset).height(), opacity:0 })
                        : offset;

                panel.animate(offset_2, 1200, "easeOutBounce", function() {
                    SELF.ui.css({display:"none",width:wid, height:hei,left:lft, top:top, opacity:1});
                    if ($.isFunction(callback)) {
                        callback.call(SELF);
                    }
                    SELF = null;
                });
                panel = null;
                return this;
            },

            /**
             * 让窗口翻转到反面（基于CSS 3，在IE10以下浏览器没有效果 ）
             * @public
             * @method evert
             * @chainable
             */
            evert : function() {
                try {
                    this.ui.css({
                        "-moz-transform"    : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-webkit-transform" : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-o-transform"      : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-ms-transform"     : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "transform"         : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)"
                    });
                } catch(e) {}

                //if (!tbc.msie || tbc.browserVersion>9) {}

                /**
                 * 窗口反转时触发
                 * @event evert
                 */
                this.triggerEvent("evert");
                return this;
            },

            /**
             * 让窗口翻转到正面，此方法相对于evert（基于CSS 3，在IE10以下浏览器没有效果 ）
             * @public
             * @method facade
             * @chainable
             */
            facade : function() {

                try {
                    this.ui.css({
                        "-moz-transform"    : "none",
                        "-webkit-transform" : "none",
                        "-o-transform"      : "none",
                        "-ms-transform"     : "none",
                        "transform"         : "none"
                    });
                } catch (e) {

                }

                // if (!tbc.msie || tbc.browserVersion>9) {
                // }

                /**
                 * 窗口正面显示时触发此事件
                 * @event facade
                 */
                this.triggerEvent("facade");
                return this;
            },

            // 启用3D透视效果
            enable3D : function() {
                this.ui.parent().css({
                    "-moz-transform-style"    : "preserve-3d",
                    "-webkit-transform-styles" : "preserve-3d",
                    "-ms-transform-style"     : "preserve-3d",
                    "-o-transform-style"      : "preserve-3d",
                    "transform-style"         : "preserve-3d",
                    "-webkit-transform-style" : "perspective"
                });

                /**
                 * 窗口启用3D时触发此事件
                 * @event enable3D
                 */
                this.triggerEvent("enable3D");
                return this;
            },

            // 禁用3D透视效果
            disable3D : function() {
                this.ui.parent().css({
                    "-moz-transform-style"    : "none",
                    "-webkit-transform-style" : "none",
                    "-ms-transform-style"     : "none",
                    "-o-transform-style"      : "none",
                    "transform-style"         : "none"
                });

                /**
                 * 窗口禁用3D时触发此事件
                 * @event disable3D
                 */
                this.triggerEvent("disable3D");
                return this;
            },

            // 启用动态变幻效果
            enableAnimate : function (duration, delay, easing) {
                var v1 = duration || ".4s",
                    v2 = easing || "ease",
                    v3 = delay || "0s",
                    v  = [v1,v2,v3].join(" ");

                this.ui.css({
                    "-moz-transition"    : "-moz-transform " + v,
                    "-webkit-transition" : "-web-transform " + v,
                    "-o-transition"      : "-o-transform " + v,
                    "-ms-transition"     : "-ms-transform " + v,
                    "transition"         : "transform " + v
                });
                this.triggerEvent("enableAnimate");

                return this;
            },

            // 禁用动态变幻效果
            disableAnimate : function () {
                this.ui.css ({
                    "-moz-transition"    : "",
                    "-webkit-transition" : "",
                    "-o-transition"      : "",
                    "-ms-transition"     : "",
                    "transition"         : ""
                });
                this.triggerEvent("disableAnimate");
                return this;
            },

            active : function (o) {
                o
                ? this.ui.addClass("active")
                : this.ui.removeClass("active");

                this.triggerEvent("active");
                return this;
            },

            /**
             * 让窗口闪烁
             * @public
             * @method flash
             * @param {Function} [callback] 回调函数
             * @chainable
             */
            flash : function (callback) {
                var panel = this.ui,
                    aniCB = function () {
                        panel.dequeue ("flash");
                    },
                    _time = 40;

                this.ui.queue ("flash", [
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:1}).addClass("shadow");    setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:1}).addClass("shadow");    setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () {
                        panel.css ({opacity:1}) .addClass ("shadow");
                        setTimeout (function() {
                            aniCB();
                            panel.verifyButton
                            ? panel.verifyButton.focus()
                            : panel.cancelButton && panel.cancelButton.focus();

                            $.isFunction(callback)&&callback.call(panel);
                        }, _time);
                    }
                ]).dequeue("flash");

                /**
                 * 窗口闪烁时触发此事件
                 * @event flash
                 */
                this.triggerEvent("flash");
                return this;
            },

            /**
             * 获取窗口的位置及尺寸
             * @public
             * @method offset
             * @param {Object} return 返回值
             *     @param {Number} return.offsetWidth 外框宽度
             *     @param {Number} return.offsetHeight 外框高度
             *     @param {Number} return.containerWidth 内容容器的宽度
             *     @param {Number} return.containerHeight 内容容器的高度
             *     @param {Number} return.width 宽度（不包含margin）
             *     @param {Number} return.height 高度（不包含margin）
             *     @param {Number} return.scrollWidth 页面内容宽度（包含超出可视范围的宽度）
             *     @param {Number} return.scrollHeight 页面内容高度（包含超出可视范围的高度）
             */
            offset : function() {
                var panel = this.ui,
                    off   = panel.offset(),
                    con   = this.part.container;

                $.extend(off, {
                      offsetWidth     : panel.outerWidth()
                    , offsetHeight    : panel.outerHeight()
                    , containerWidth  : con.innerWidth()
                    , containerHeight : con.innerHeight()
                    , width           : panel.width()
                    , height          : panel.height()
                    , scrollWidth     : con[0].scrollWidth
                    , scrollHeight    : con[0].scrollHeight
                });

                return off;
            }
        })
        .addEvent({
            "afterClose" : function() {

                var p,
                    hasMax = false,
                    k;

                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        p = tbc.Panel.cache[k];
                        hasMax = hasMax || p.maximize;
                    }
                }

                // 如果目前没有最大化的窗口,则显示分屏导航条和左侧快捷启动栏
                if (!hasMax) {
                    if (window.taskbar) {
                        taskbar.show();
                    }

                    desktop.setDockZindex();
                    $(".tbc-desktop-nav").css({zIndex:5});
                }

                p=null;
            },

            "max" : function () {
                if(window.taskbar) {
                    taskbar.hide();
                }
                $(".tbc-desktop-dock").css({zIndex:3});
                //$(".tbc-desktop-nav").css({zIndex:3});
            },

            "min" : function () {
                var p, k;
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        p = tbc.Panel.cache[k];
                        if (p.sizeType === "max" && !p.minimize) {
                            return;
                        }
                    }
                }
                p=null;

                if (window.taskbar) {
                    taskbar.show();
                }
                desktop.setDockZindex();
                $(".tbc-desktop-nav").css({zIndex:5});
            },

            "restore" : function () {
                var p, k;
                for (k in tbc.Panel.cache) {
                    p = tbc.Panel.cache[k];
                    if (p.sizeType === "max" && !p.minimize) return;
                }
                p=null;

                if (window.taskbar) {
                    taskbar.show();
                }
                desktop.setDockZindex();
                $(".tbc-desktop-nav").css({zIndex:5});
            },

            "destroy" : function () {
                try {
                    options = settings = null;
                } catch (e) {

                }
            }
        })
        .init();
    };

    //tbc.Panel.defaultIcon    = "images/icons/newWindow.png";

    /**
     * 存储所有已经打开的窗体实例;
     * @property {Object} cache
     * @type {Object}
     */
    tbc.Panel.cache = tbc.Panel.cache || {};

    /**
     * 缓存ID, 数值会随着实例的增加而递增
     * @static
     * @property {Number} cacheid
     * @type {Number}
     */
    tbc.Panel.cacheid = (isNaN(tbc.Panel.cacheid) || !tbc.Panel.cacheid) ? 0 : tbc.Panel.cacheid;

    /**
     * 实例数量, 创建或销毁任何实例时都会更新此值
     *
     * @static
     * @property {Number} cache_length
     * @type {Number}
     */
    tbc.Panel.cache_length = isNaN(tbc.Panel.cache_length) ? 0 : tbc.Panel.cache_length;

    /**
     * 保存所有已经打开的窗口的显示顺序;
     * @static
     * @property {Array} sequence
     * @type {Array}
     */
    tbc.Panel.sequence = tbc.Panel.sequence || [];

    /**
     * 设置窗体默认在哪一元素内打开
     * @static
     * @property {String} parent
     * @type {String}
     */
    tbc.Panel.parent        = ".tbc-slide-scene.current";

    /**
     * 删除某一窗体ID在排序中的序列号
     * @static
     * @method removeSequence
     * @param  {String} windowID 窗口ID
     */
    tbc.Panel.removeSequence  = tbc.Panel.removeSequence || function(windowID) {
        tbc.Panel.sequence = tbc.array.remove(tbc.Panel.sequence, windowID);
    };

}(tbc, jQuery));