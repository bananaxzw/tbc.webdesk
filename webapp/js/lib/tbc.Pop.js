;tbc.Pop = function(settings) {
    var SELF = tbc.self (this, arguments);

    SELF.extend (tbc.Event, tbc.ClassManager);
    SELF.packageName = "tbc.Pop";

    var defaults = {
              width : 320
            , height: 180
            , icon    : null
            , autoClose    :false
            , timeout    : 3
            , locate    : null
            , parent    : null
            , counter    : ".tbc-pop-close i"
        },
        options = tbc.extend ({}, defaults, settings),
        interval= null,
        timeout = options.timeout || 5,
        zindex    = tbc.getMaxZIndex()+1,
        html    =  '<div class="tbc-pop" style="opacity:0.001; filter:alpha(opacity=0.01); z-index:'+ zindex +';">' +
                   '    <div class="tbc-pop-arrow">&diams;</div>' +
                   '    <div class="tbc-pop-close"><i></i><a>&times;</a></div>' +
                   '    <div class="tbc-pop-inner">' +
                   '        <div class="tbc-pop-icon"></div>' +
                   '        <div class="tbc-pop-container"></div>' +
                   '    </div>' +
                   '</div>';

    SELF.ui            = $ (html).css ({width:options.width, height:options.height}).attr("tbc", SELF.guid).appendTo(options.parent||"body").bind(function() { SELF.focus(); });
    SELF.container    = SELF.ui.find (".tbc-pop-container");
    SELF.arrow        = SELF.ui.find (".tbc-pop-arrow");

    SELF.counter = $(options.counter, SELF.ui);

    SELF.extend ({
        "html" : function (t) {
            SELF.container.html(t);
            return SELF;
        },

        "focus" : function () {
            var z = tbc.getMaxZIndex();
                SELF.ui.css({ zIndex:z+1 });
            return SELF;
        },

        "show" : function () { SELF.ui.show(); return SELF;},

        "hide" : function () { SELF.hide(); return SELF;},

        "addCounter" : function(cnt) { SELF.counter.add(cnt); return SELF},

        /* 倒计时 */
        "countDown" : function(count) {
            SELF.triggerEvent("beforeCountdown");
            SELF.ui.find(".tbc-pop-close i").html(count);
            SELF.triggerEvent("countdown");
            return SELF;
        },

        /* 停止并清除倒计时 */
        "stop" : function() {
            SELF.triggerEvent("beforeStop");
            clearInterval(interval);
            timeout = 0;
            SELF.triggerEvent("stop");
            return SELF;
        },

        /* 开始倒计时 */
        "start" : function() {
            interval = setInterval(function() {
                if (timeout<=0) {
                    SELF.close();
                    return;
                }
                timeout--;
                SELF.countDown(timeout);
            }, 1000);
            SELF.triggerEvent("start");
            return SELF;
        },

        /* 暂停倒计时 */
        "pause" : function() { clearInterval(interval); return SELF;},

        /* 继续倒计时 */
        "resume" : function() { this.start(); return SELF;},

        /* 关闭pop */
        "close" : function() {
            if (SELF.triggerEvent("beforeClose") !== false) {
                clearInterval(interval);
                SELF.ui.empty().remove();
                SELF.triggerEvent("close");
                SELF.DESTROY();
                SELF=null;
            }
            return SELF;
        },

        /* 从后面添加内容 */
        "append" : function(module) {
            if (SELF.triggerEvent("beforeAppend") !== false) {
                SELF.container.append(module.ui || module);
                SELF.triggerEvent("append");
            }
            return SELF;
        },

        /* 从前面添加内容 */
        "prepend" : function(module) {
            if (SELF.triggerEvent("beforeAppend") !== false) {
                SELF.container.prepend(module.ui||module);
                SELF.triggerEvent("append");
            }
            return SELF;
        },

        "appendTo" : function(target) {
            SELF.ui.appendTo(target.container||target);
            return SELF;
        },

        "prependTo" : function(target) {
            SELF.ui.prependTo(target.container||target);
            return SELF;
        },

        "setArrowX" : function(point, position) {
            var offset = SELF.ui.offset(),
                p    = position || $(point).offset(),
                pw    = point.width()/2-14,
                left = p.left+pw-offset.left;
            if (left<0)SELF.ui.css({left:"-="+Math.abs(left)+"px"});
            SELF.arrow.css({top:"",left: Math.max(1, left)+"px"});
            return SELF;
        },

        "setArrowY" : function(point, position) {
            var offset = SELF.ui.offset(),
                p    = position || $(point).offset(),
                ph    = point.height()/2-14,
                top = p.top+ph-offset.top;
            if (top<0)SELF.ui.css({top:"-="+Math.abs(top)+"px"});
            SELF.arrow.css({left:"",top:Math.max(top, 1) +"px"});
            return SELF;
        },

        //定位
        "locate" : function(point, position) {
            point = (point|| options.locate) ? $(point || options.locate) : SELF.lastLocate;
            SELF.lastLocate = point;

            if (point.size<0) {
                return;
            }

            var pos        = SELF.getPosition(point, position),
                lastCls    = SELF.ui.data("lastClass")||"tbc-pop-left",
                cls        = "",
                axis    = "y";

            if (pos.left === "auto") {
                if (pos.parent.height<pos.locate.bottom) {
                    cls = "tbc-pop-bottom";
                    pos.right -= pos.locate.width;
                    pos.bottom    += (pos.parent.height+pos.parent.scrollTop) - pos.locate.bottom + pos.locate.height + 20;
                    axis = "x";
                } else if (pos.locate.top<0) {
                    cls = "tbc-pop-top";
                    pos.right -= pos.locate.width;
                    pos.top += pos.locate.height+4;
                    axis = "x";
                } else {
                    cls = "tbc-pop-right";
                    pos.right+=4;
                }
            } else {
                if (pos.parent.height<pos.locate.bottom) {
                    cls = "tbc-pop-bottom";
                    pos.left -= pos.locate.width;
                    pos.bottom += (pos.parent.height+pos.parent.scrollTop) - pos.locate.bottom + pos.locate.height + 20;
                    axis = "x";
                } else if (pos.locate.top<0) {
                    cls = "tbc-pop-top";
                    pos.left -= pos.locate.width;
                    pos.top    += pos.locate.height+4;
                    axis = "x";
                } else {
                    cls = "tbc-pop-left";
                    pos.left+=4;
                }
            }

            pos.left = pos.left === "auto" ? pos.left : pos.left+"px";
            pos.bottom = pos.bottom === "auto" ? pos.bottom : pos.bottom+"px";
            pos.top = pos.top === "auto" ? pos.top : pos.top+"px";
            pos.right = pos.right === "auto" ? pos.right : pos.right+"px";

            SELF.arrow.removeClass(lastCls).addClass(cls).data("lastClass", cls);
            SELF.ui.css({ left:pos.left, right:pos.right, top:pos.top, bottom:pos.bottom, opacity:1 });
            axis === "x" ? SELF.setArrowX(point, position) : SELF.setArrowY(point, position);

            return SELF;
        },


        "getPosition" : function(point, position) {
            var locate    = $(point|| options.locate),
                _left    = position?position.left:0,
                _top    = position?position.top:0,
                offset    = locate.offset(),
                lcw        = locate.width(),
                lch        = locate.height(),
                lcl        = _left || offset.left,
                lct        = _top  || offset.top,
                lcr        = lcl + lcw,
                lcb        = lct + lch,
                uiw        = SELF.ui.width(),
                uih        = SELF.ui.height(),
                bodyH    = SELF.ui.offsetParent()[0].offsetHeight,
                bodyW    = SELF.ui.offsetParent()[0].offsetWidth,
                right, left, top="0", bottom="auto";

            if (lcr+uiw>bodyW && uiw<lcl) {
                right    = bodyW-offset.left;
                left    = "auto";
            } else {
                right    = "auto";
                left    = lcr;
            }

            if (lct+uih>bodyH) {
                top        = "auto";
                bottom    = 0;
            } else {
                top        = lct;
                bottom    = "auto";
            }

            return {
                top        : top,
                bottom    : bottom,
                left    : left,
                right    : right,
                width    : uiw,
                height    : uih,
                locate    : { left:lcl, top:lct, right:lcr, bottom:lcb, width:lcw, height:lch },
                parent    : { height:bodyH, width:bodyW, scrollTop:SELF.ui.offsetParent()[0].scrollTop, scrollLeft:SELF.ui.offsetParent()[0].scrollLeft }
            };
        }

    });

    SELF.ui.find(".tbc-pop-close a").bind({
        "click": function() {
            SELF.close();
            return;
        }
    });

    if (options.autoClose===true) {
        SELF.start();
    }

    SELF.addEvent ({
        "destroy" : function () {
            SELF = defaults = options = interval= timeout = zindex    = html    =  null;
        }
    });
};