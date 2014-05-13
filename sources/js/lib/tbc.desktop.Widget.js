/*
 * @Class:  tb.desktop.Widgets (桌面小插件) ##########################################
 *
 * @Copyright   : 时代光华
 * @Author      : 罗志华
 * @mail        : mail@luozhihua.com
 */

tbc.namespace("tbc.desktop");
tbc.desktop.Widget = function(settings) {
    var SELF = tbc.self(this, arguments);

    SELF.packageName = "tbc.desktop.Widget";

    var defaults = {
          url    : null
        , id     : null
        , width  : 230
        , height : 260
        , target : ".tbc-slide-scene.current"
    },

    options = $.extend({}, defaults, settings),

    wid = $('<div widgetid="" class="tbc-widget" _widgetId="'+ options.id +'" data-appcode="'+ options.appCode +'"></div>')
       .html('<div class="tbc-widget-tools">' +
            '   <a role="close" class="tbc-widgets-close" href="#" title="'+ i18n('v4.js.close') +'">&times;</a>' +
            '   <a role="refresh" class="tbc-widgets-refresh" href="#" title="'+ i18n('v4.js.refresh') +'">&times;</a>' +
            '   <a role="fix" class="tbc-widgets-fix" href="#" title="'+ i18n('v4.js.fix') +'">&times;</a>' +
            '</div>' +
            '<div class="tbc-widget-msg"></div>' +
            '<div class="tbc-widget-inner">' +
            '   <iframe frameborder="0;" src="about:blank" border="0" allowtransparency="true"></iframe>' +
            '</div>' +
            '<div class="tbc-widget-locklayer"></div>' +
            '<div class="clear"></div>')
        .css({left:"auto", right:options.right, top:options.top}),

    iframe = wid.find("iframe")[0],
    msgbox = $(".tbc-widget-msg", wid),
    ctrl   = $(".tbc-widget-tools", wid);

    wid.attr("tbc", SELF.guid);

    SELF.ui = wid;
    SELF.id = options.id;

    // 隐藏或显示控制器
    ctrl
    .delegate("a", "click", function() {
        var role = this.getAttribute("role");
        switch(role) {
            case "fix"      : SELF.triggerFix();break;
            case "refresh"  : SELF.reload();    break;
            case "close"    : SELF.toggle();    break;
        }
    });

    onload = function() {

        var mx, my, delay;

        var idoc = iframe.contentWindow.document;
            idoc.oncontextmenu = null;

        $(idoc.body).css({
            "-moz-user-select": "none", "-webkit-user-select": "none", "-o-user-select": "none", "-ms-user-select": "none", "user-select": "none"
        }).bind("selectstart", function() {return false;});

        // 鼠标样式
        $("body", idoc).css({cursor:"move"});

        var timerHideCtrl,timerShowCtrl;

        if (options.control) {
            ctrl
            .unbind("mouseenter")
            .unbind("mouseleave")
            .bind({
                "mouseenter" : function() {
                    clearTimeout(timerHideCtrl); ctrl.stop().slideDown();
                },
                "mouseleave" : function() {
                    timerHideCtrl = setTimeout(function() { ctrl.stop().slideUp(); },200);
                }
            });

            $(idoc)
            .unbind("mouseenter")
            .unbind("mouseleave")
            .bind({
                "mouseenter" : function() { clearTimeout(timerHideCtrl); timerShowCtrl=setTimeout(function() { ctrl.slideDown(); },500);},
                "mouseleave" : function() { clearTimeout(timerShowCtrl); timerHideCtrl=setTimeout(function() { ctrl.slideUp(); },500); }
            });
        }

        $(idoc)
        .unbind("mousedown")
        .unbind("mouseup")
        .unbind("contextmenu")
        .bind({
            "mouseup":function() { clearTimeout(delay); $("body", this).unbind("selectstart"); },
            "contextmenu" : function(event) {
                try{
                    var ifr = $(iframe),
                        offset = ifr.offset(),
                        top  = offset.top + event.pageY,
                        left = offset.left + event.pageX;

                    $(ifr).trigger("contextmenu", {top:top, left:left});
                }catch(e) {

                }finally{
                    ifr = ifr[0] = offset = top = left = null;
                }
                return false;
            },

            "mousedown" : function(event) {

                // 隐藏右键菜单
                $(this).trigger("click.hideContextmenu");
                $("body", this).bind({
                    "selectstart":function() {return false;}
                });

                if ((!tbc.msie||tbc.browserVersion>8) && event.preventDefault) {
                    event.preventDefault();
                }

                mx = event.pageX - idoc.documentElement.scrollLeft + iframe.offsetLeft;
                my = event.pageY - idoc.documentElement.scrollTop + iframe.offsetTop;

                if (tbc.mozilla || tbc.opera) {

                    var cx = event.pageX + iframe.offsetLeft,
                        cy = event.pageY + iframe.offsetTop,
                        last={};

                        last.left = event.pageX;
                        last.top  = event.pageY;

                    wid.css({
                        right   : (document.documentElement.scrollLeft + document.body.offsetWidth) - wid[0].offsetLeft - wid.width(),
                        left    : "auto",
                        top     : wid[0].offsetTop
                    });

                    var delay2;
                    delay = setTimeout(function() {
                        wid.css({zIndex:7});
                        $(idoc).bind({
                            "mousemove.drag":function(event) {

                                if (SELF.fixed)return;
                                ctrl.hide();

                                clearTimeout(delay2);
                                delay2 = setTimeout(function() {
                                    var n = {left:event.pageX, top:event.pageY};
                                    wid.stop().animate({ left:"auto", right:"-="+(n.left-last.left)+"px", top:"+="+(n.top-last.top)+"px" });
                                }, 30);
                            },
                            "mouseup.drag":function() {
                                ctrl.show();
                                $(idoc).unbind(".drag");
                                clearTimeout(delay);
                                wid.css({zIndex:""});
                                SELF.triggerEvent("drop", {top:wid.css("top"), right:wid.css("right")});
                            }
                        });
                    },0);
                }else{
                    delay = setTimeout(function() {
                        wid.css({zIndex:7});
                        SELF.dragMask = $('<div><input type="text" /></div>').css({background:"#fff", display:"none", opacity:.005, width:"100%", height:"100%", position:"absolute", left:0, top:0, zIndex:100000})
                        .bind({
                            "mouseup.drag" : function(e) {
                                ctrl.show();
                                this.style.display="none";
                                wid.css({zIndex:""});
                                SELF.dragMask.unbind(".drag").remove();
                                SELF.triggerEvent("drop", {top:wid.css("top"), right:wid.css("right")});
                                clearTimeout(delay);
                            },
                            "mousemove.drag" : function(e) {
                                if (SELF.fixed)return;
                                ctrl.hide();
                                wid.css({
                                    right:document.body.offsetWidth - e.pageX - wid.width() + mx,
                                    left:"auto",//e.pageX-mx,
                                    top:e.pageY-my});
                            }
                        });

                        SELF.dragMask.appendTo("body").show();
                        SELF.dragMask.find("input").focus();
                        window.focus();
                    },200);
                }
            }
        });

        SELF.triggerEvent("load");
    };


    SELF.addEvent("load", function() {SELF.unlock();});

    wid
    .css({width:options.width, height:options.height})
    .appendTo(options.target);

    iframe.attachEvent ? iframe.attachEvent("onload", onload) : iframe.onload = onload;

    // 如果不用iframe
    if (!options.iframe) {
        $.ajax({
            url:options.url,
            dataType:"html",
            error:function() {
                var i = iframe;
                    i.src = options.url;
                    i=null;
            },
            success:function(html) {
                html = $(html);
                var i = html.filter("iframe");
                    i = i.size() ? i : html.find("iframe");
                var url     = i.size() ? i.attr("src") : null,
                    width   = i.css("width"),
                    height  = i.css("height");
                iframe.src = url || options.url;
                SELF.ui.css({ width:width, height:height });
            }
        })
    }else{
        iframe.src = options.url;
    }

    /* 从插件内部iframe中调用插件方法的通道;
     * 例:[iframe]window.frameElement.execute(methodName);
     */
    iframe.execute = function(method) {
        var para = [];
        for(var i=1; i<arguments.length; i++) {
            para.push(arguments[i]);
        }
        if (tbc.isFunction(SELF[method]))SELF[method].apply(SELF, para);
    };

    /* 从插件内部iframe中触发事件;
     * 例:[iframe]window.frameElement.execute(methodName);
     */
    iframe.trigger = function(eventType, data) {
        SELF.triggerEvent(eventType, data);
    };

    /* 右键菜单 */
    wid.contextmenu({
        items : [
            {
                text  : function() { return SELF.fixed ? i18n("v4.js.noFix") : i18n("v4.js.fix");}, disabled:false,
                icon  : function() { return SELF.fixed ? "icon-marker_rounded_remove" : "icon-marker_rounded_red";},
                click : function() {    SELF.fixed ? SELF.unfix() : SELF.fix(); }
            },
            {text: i18n('v4.js.refresh'), icon:"icon-refresh", click:function() {SELF.reload(); }, disabled : function() {return SELF.locked; } },
            {text:i18n('v4.js.removeWidget'), icon:"icon-tag_remove", click:function() {SELF.toggle(); }}
        ]
    });

    SELF.appendTo = function(target) {
        wid.appendTo(target);
        return SELF;
    }

    SELF.toggle = function() {
        SELF.visible===false ? SELF.show() : SELF.hide();
    }

    SELF.hide = function() {
        SELF.visible = false;
        SELF.ui.hide();
    }

    SELF.show = function() {
        SELF.visible = true;
        SELF.ui.show();
    }

    /* Method: 关闭插件(下次登录仍然会显示) */
    SELF.close = function() {
        if (SELF.triggerEvent("close") !== false) {
            wid.fadeOut(300, function() {
                try{
                    iframe.contentWindow.document.write("");
                    iframe.src = null;
                    iframe = null;
                }catch(e) {}

                wid.remove();
                wid = null;
                SELF.DESTROY();
            });
        }
    }

    /* Method: 移除插件(下次登录不再显示) */
    SELF.remove = function() {
        SELF.lock();

        $.ajax({
              url : ""
            , type:"post"
            , data:{}
            , dataType : "json"
            , complete : function() {}
            , error : function() {}
            , success : function(json) {
                wid.fadeOut(300, function() {
                    SELF.close();
                    SELF.triggerEvent("remove");
                });
            }

        });

    }

    /* Method: 刷新 */
    SELF.reload = function() {
        try{
            SELF.lock();
            iframe.contentWindow.document.location.reload();
        }catch(e) {
        }
        return SELF;
    }

    /* Method: 锁定 */
    SELF.lock = function() {
        wid.find(".tbc-widget-locklayer").hide();
        SELF.locked = true;
        SELF.triggerEvent("lock");
        return SELF;
    }

    /* Method: 解锁 */
    SELF.unlock = function() {
        wid.find(".tbc-widget-locklayer").hide();
        SELF.locked = false;
        SELF.triggerEvent("unlock");
        return SELF;
    }

    /* 切换固定模式 */
    SELF.triggerFix = function() {
        SELF.fixed ? SELF.unfix() : SELF.fix();
    }

    /* Method: 固定 */
    SELF.fix = function() {
        SELF.fixed = true;
        ctrl.children("a[role='fix']").addClass("tbc-widgets-fix-disabled");
        SELF.triggerEvent("fix");
        return SELF;
    }

    /* Method: 解除固定 */
    SELF.unfix = function() {
        SELF.fixed = false;
        ctrl.children("a[role='fix']").removeClass("tbc-widgets-fix-disabled");
        SELF.triggerEvent("unfix");
        return SELF;
    }

    SELF.addEvent({
        "drop" : function(offset) {
            wid.css(tbc.extend(offset, {zIndex:""}));
            $.ajax({
                url     : URLS["saveWidgetPosition"],
                data    : tbc.extend(offset, {id: "40288059360aeabc01360af9cce20076"}),
                type    : "post",
                dataType: "json",
                complete: function() {},
                error   : function() {},
                success : function(json) {
                    if (json.state === "success") {
                        //SELF.msg("位置已保存.");
                        //alert("保存位置成功(tbc.desktop.Widget.js第201行)");
                    }
                }

            });
        },
        "startDrag" : function() {
            wid.css({zIndex:"7"});
        }
    });

    SELF.msg = function(msg) {
        msgbox.html(msg||"").stop().slideDown();
        setTimeout(function() {
            msgbox.slideUp();
        }, 2000);
    }

    SELF.addMsg = function(msg) {

    }
}
