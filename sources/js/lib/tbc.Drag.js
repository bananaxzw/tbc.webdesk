/**
 * 拖动类
 * @class tbc.Drag
 * @param {Options} setting 配置
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $) {

    "use strict";

    tbc.Drag = function(settings) {

        var SELF = tbc.self(this, arguments)
        , defaults = {
              node     : null
            , selected : null
            , window   : window    // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
            , document : document
            , handle   : null
            , cursor   : "move"   // 鼠标样式
            , circles  : null // HTMLElement 限制仅在此区域类拖动;
            , circlesRound : {} //    能够超出限定区域的距离,值类别:top/right/bottom/left; 取值范围:百分数、负数、0、正整数;

            , targets   : null // 目标节点集;jQuery Selector/DOM/jQuery Object
            , rangeMode : "y"
            , disableItem : null
            , disableInsertTargets : null // 不接受插入新节点的节点
            , timeout   : 0
            , pauseTimeout : 40
        }
        , options = tbc.extend({}, defaults, settings)
        , touchable = !!document.documentElement.ontouchstart
        , circles = {}
        , handle  = $(options.node).find(options.handle)

        , mousedownPosition = {left:0, top:0} // 鼠标点击位置
        , lastPosition = {left:0, top:0} // 拖动前的位置
        , pointToNode  = {left:0, top:0} // 点击位置距离被拖动对象顶边和左边的距离

        , parents      = options.targets || $(options.node).parent()
        , containers   = []
        , replica      = null
        , timeout      = null
        , pauseTimeout = null
        ;

        SELF.packageName = "tbc.Drag";
        SELF.pointer = $('<div></div>').
        addClass('tbc-drag-pointer').
        css({
            position:"absolute",zIndex:100, background:"#fff", height:"1px", border:"1px solid #888", borderRadius:"10px", overflow:"hidden", lineHeight:"0", opacity:0.5
        });

        if (handle.size()) {
            handle.css({cursor: options.cursor || 'move'});
        }

        // 禁用插入的节点
        $(options.disableInsertTargets).data("tbc_drag_"+SELF.guid, true);

        SELF.node   = null;
        SELF.replica= [];

        SELF.a=function() {alert(options.targets.size());};
        SELF.addContainer = function(box) {

            $(box).each(function() {
                containers.push(this);
            });
            options.targets = $(containers);

            // 鼠标点击
            $(box).delegate(options.handle, "mousedown", {}, function(event) {

                var $this = $(this);
                SELF.node = $this.parents(options.node);

                // 禁止拖动的对象
                if (SELF.node.size() === 0 ||
                    event.originalEvent.draggable === false ||
                    (options.disableItem && SELF.node.filter(options.disableItem).size() > 0) ||
                    (tbc.msie&&tbc.browserVersion<9 && event.button !== 1) || // 如果不是左键则返回
                    (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button !== 0) // 如果不是左键则返回
                ) {
                    return false;
                }



                // 禁止选中文字
                $("body").disableSelect();

                mousedownPosition.left = event.pageX;
                mousedownPosition.top  = event.pageY;

                SELF.init(event);
                event.disableSelectArea = true;
                return false;
            });
        };

        SELF.addContainer(parents);

        // 移除区域
        SELF.removeContainer = function(box) {
            var con = [];
            options.targets.each(function(i, c) {
                $(box).each(function() {
                    if (c  !== this) {
                        con.push(c);
                    }
                });
            });
            options.targets = $(con);
        };

        /*
         * 初始化拖动
         */
        SELF.init = function(event) {
            $ (document).bind({
                "mouseup.tbc_drag": function(event) { SELF.stop(event, SELF.getPositionByEvent(event)); }
            });

            if (options.timeout) {
                timeout = setTimeout(function() { SELF.start(event); }, options.timeout);
            } else {
                SELF.start(event);
            }

            return SELF;
        };

        /*  */
        SELF.getPositionByEvent = function(event) {
            return {left:event.pageX-pointToNode.left, top:event.pageY-pointToNode.top};
        };

        /*
         * 开始拖动
         */
        SELF.start = function(event) {
            var offset = SELF.node.offset(),
                bodyScrTop  = document.documentElement.scrollTop||document.body.scrollTop,
                bodyScrLeft = document.documentElement.scrollLeft||document.body.scrollLeft;

            SELF.triggerEvent("start", event);

            // 创建拖动对象的虚拟对象
            SELF.createReplica();

            if (options.rangeMode==="y") {
                SELF.pointer.css({width:SELF.node.width(),height:2}).appendTo("body");
            } else {
                SELF.pointer.css({width:2,height:SELF.node.height()}).appendTo("body");
            }

            // 点击位置距离被拖动对象顶边和左边的距离
            pointToNode = {left:event.pageX-offset.left, top:event.pageY-offset.top};

            $(document).bind("mousemove.tbc_drag", function(event) { SELF.move(event); });

            SELF.starting = true;
        };

        /*
         * 移动被拖动对象
         */
        SELF.move = function(event) {

            clearTimeout(pauseTimeout);
            pauseTimeout = setTimeout(function() {
                SELF.pause(event);
            }, options.pauseTimeout);

            var newPoint = SELF.getPositionByEvent(event);
                newPoint.right = newPoint.left+1;
                newPoint.bottom = newPoint.top+1;

            if (SELF.replica) {
                SELF.moveReplica(newPoint);
            }

            SELF.triggerEvent("move", newPoint);
            return SELF;
        };

        // 暂停
        SELF.pause = function(event, offset) {

            // 遍历所有目标节点,插入临近的位置
            if (options.targets && $(options.targets).size()>0) {

                if ((!tbc.msie || (tbc.msie && tbc.browserVersion>7)) && SELF.starting===true) {
                    var locate = SELF.locateInsertPosition(event),
                        offset2 = locate.offset;

                    if (locate.marks.size()) {
                        SELF.pointer.show().css({
                            width    : options.rangeMode==="y" ? offset2.width : 2,
                            height    : options.rangeMode==="y" ? 2 : offset2.height,
                            left    : offset2.left,
                            top        : locate.replica.top<offset2.halfY ? offset2.top : offset2.bottom
                        });
                    } else {
                        SELF.pointer.hide();
                    }
                }
            }

            SELF.triggerEvent("pause", event, offset);
            return SELF;
        };

        /*
         * 停止(结束)拖动
         */
        SELF.stop = function(event, offset) {

            clearTimeout(timeout);
            clearTimeout(pauseTimeout);
            $(document).unbind(".tbc_drag");

            // 允许选中文字
            $("body").enableSelect();

            if (SELF.starting !== true) {
                return SELF;
            }

            var locate  = SELF.locateInsertPosition(event),
                node    = SELF.node,
                selected= options.selected ? node.siblings(options.selected) : $(),
                relative= locate.replica.top < locate.offset.halfY ? 'before' : 'after',
                context = {
                    node     : node,
                    selected : selected,
                    marks    : locate.marks,
                    from     : node.parent(),
                    to       : locate.transfer || locate.dropBox,
                    offset   : locate.offset
                };

            context.offset.relative = relative;

            SELF.insertTo(locate, context);

            SELF.starting = false;
            SELF.triggerEvent("stop", context);

            return SELF;
        };

        /*
         * 创建虚拟节点
         */
        SELF.createReplica = function() {

            var offset = SELF.node.offset(),
                replica = [],
                nr = {
                    node : SELF.node,
                    clone : SELF.node.clone()
                          .appendTo("body")
                          .css({position:"absolute",zIndex:"100",left:offset.left, top:offset.top, opacity:0.5})
                },
                sel;

            replica.push(nr);

            if (options.selected) {
                sel = SELF.node.siblings(options.selected);
                sel.each(function(i,o) {
                    var n    = $(this),
                        off = n.offset(),
                        rot = "rotate("+tbc.random(-15,15)+"deg)",
                        rep = {
                            node  : n,
                            clone : n.clone().appendTo("body").css({
                                position : "absolute",
                                zIndex : "99",
                                left   : off.left,
                                top    : off.top,
                                opacity: (0.5),
                                MozTransform : rot,
                                WebkitTransform : rot,
                                OTransform  : rot,
                                msTransform : rot,
                                transform   : rot
                            })
                        };
                    replica.push(rep);
                    rep.clone.animate(nr.clone.offset(), 800);
                    o = null;
                });
            }

            SELF.replica = replica;

            offset = replica = nr = null;

            return SELF.replica;
        };

        /*
         * 移动虚拟节点
         */
        SELF.moveReplica = function(offset) {
            $.each(SELF.replica, function(i, rep) {
                rep.clone.stop().css({left:offset.left, top:offset.top});
            });
            return SELF;
        };

        /*
         * 删除虚拟节点
         */
        SELF.deleteReplica = function() {

            $.each(SELF.replica, function(i, rep) {
                var off  = rep.transfer ? $(rep.transfer).offset() : $(rep.node).offset(),
                    left = off.left,
                    top  = off.top;

                rep.clone.animate({top:top, left:left, opacity:0}, 400, function() {
                    rep.clone.remove();
                    delete rep.clone;
                });
            });
            delete SELF.replica;
            return SELF;
        };

        SELF.isOpenFor = function(target) {
            var s=true;
            $(options.disableInsertTargets).each(function() {
                if ($(target)[0] === this) {
                    s=false;
                    return false;
                }
            });
            return s;
        };

        /*
         * 移动到新的位置
         */
        SELF.insertTo = function(locate, context) {
            if (!locate) {
                return SELF;
            }

            var node    = context.node,
                selected= context.selected,
                dropBox = context.to,
                ele, off, verify,
                desktop = window.desktop;

            $(locate.dropBox).removeClass("tbc-dragin").parent().removeClass("tbc-dragin-parent");

            // 如果目标对象接受拖入新节点
            if (SELF.isOpenFor(dropBox)) {

                // 如果位于可拖动的节点上
                if (locate.marks.size()) {

                    ele = locate.marks;
                    off = locate.offset;
                    verify = SELF.triggerEvent("beforeInsert", context);

                    if (verify===false) {
                        $.each(SELF.replica, function(i, rep) { SELF.replica[i].transfer = context.transfer ; });
                        if (locate.marks[0] !== node[0]) {

                            //if (context.terminal) { }

                            SELF.triggerEvent("afterInsert", context);
                            //desktop.current().layout();
                        }
                    } else if (locate.marks[0] !== node[0]) {

                        if (context.offset.relative === 'before') {
                            node.insertBefore(ele);
                        } else {
                            node.insertAfter(ele);
                        }

                        selected.insertAfter(node);
                        //desktop.current().layout();

                        SELF.triggerEvent("afterInsert", context);
                    }
                    ele = off = null;
                }

                //  如果位于容器中
                else if (dropBox.size()) {

                    if (SELF.triggerEvent("beforeInsert", context) !== false) {
                        node.appendTo(dropBox);
                        selected.insertAfter(node);
                        //desktop.current().layout();
                        SELF.triggerEvent("afterInsert", context);
                    }
                }
            }

            SELF.pointer.remove();
            SELF.deleteReplica();

            node = selected = context = null;
        };


        /*
         * 定位容器
         */
        SELF.locateTarget = function(event, rep) {

            var overlayDropBox = [],
                dropBox    = {},
                tt = $(options.targets),
                t,r,b,l,o,i;

            for (i=0; i<tt.size(); i+=1) {
                o = tt[i];
                l = $(o).offset().left;
                t = $(o).offset().top;
                r = l+o.offsetWidth;
                b = t+o.offsetHeight;
                if ($(o).filter(":visible").size()>0 && tbc.isOverlap({left:l,top:t,bottom:b,right:r}, rep)) {
                    overlayDropBox.push(o);
                }
            }

            // 获取排列在最前面的节点
            $.each(overlayDropBox, function(i,o) {
                dropBox.self = dropBox.self||o;
                dropBox.self = $(dropBox.self).find("*").index(o) !== -1 ? o : tbc.getElementByMaxZIndex(dropBox.self, o)[0];
            });

            tt.not(dropBox.self)
            .removeClass("tbc-dragin")
            .trigger("dragout")
            .parent().removeClass("tbc-dragin-parent");

            if (dropBox.self) {
                $(dropBox.self)
                .addClass("tbc-dragin")
                .trigger("dragin", dropBox)
                .parent()
                .addClass("tbc-dragin-parent");
            }

            return dropBox;
        };

        /*
         * 定位子节点
         */
        SELF.locateInsertPosition = function(event) {

            var rep        = {left:event.pageX, top:event.pageY, right:event.pageX+1, bottom:event.pageY+1},
                dropBox    = SELF.locateTarget(event, rep),
                marks    = null,
                offset    = {};

            $(dropBox.self).children(options.node).each(function(i, o) {
                var l    = $(o).offset().left,
                    t    = $(o).offset().top,
                    w    = o.offsetWidth,
                    h    = o.offsetHeight,
                    r    = l+w,
                    b    = t+h,
                    hx    = l+(w/2),
                    hy    = t+(h/2),
                    p    = {left:l, top:t, right:r, bottom:b+10, width:w, height:h, halfX:hx, halfY:hy};
                if (tbc.isOverlap(p,  rep)) {
                    marks    = o;
                    offset    = p;
                    return false;
                }
            });

            return {dropBox:$(dropBox.self), transfer:dropBox.transfer, offset:offset, marks:$(marks), replica:rep};
        };

        /*
         * 禁用拖动功能
         */
        SELF.disable = function() {
            $(options.node).unbind(".tbc_drag").css({cursor:'default'});
            SELF.triggerEvent("disable");
        };

        /*
         * 启动拖动
         */
        SELF.enable = function(event) {
            var node = $(options.node);
            node.each(function(i, n) {
                var handle = options.handle ? $(options.handle, n) : $(this);
                if (touchable) {
                    handle.bind("touchstart.tbc_drag", function(event, data) {
                        SELF.start(event, n);
                    });
                } else {
                    handle
                    .css({cursor: options.cursor || 'move'})
                    .bind("mousedown.tbc_drag", function(event, data) {
                        SELF.start(event, n);
                    });
                }
            });
            return SELF;
        };

        SELF.maskDoc = function() {
            var mask = $(options.document.body).children('.tbc-drag-mask');
                mask = mask.size() !== 0 ? mask : $('<div class="tbc-drag-mask" />').appendTo(options.document.body);
            mask.show();
        };

        SELF.unmaskDoc = function() {
            var mask = $(options.document.body).children('.tbc-drag-mask');
            mask.hide();
        };

        SELF.addEvent({
            start : function() {
                this.maskDoc();
            },
            stop : function() {
                this.unmaskDoc();
            }
        });
    };

}(window.tbc, jQuery));