/*
 * @Class:  tb.Taskbar(任务栏) ##########################################
 *
 * @Copyright   : 时代光华
 * @Author      : luozhihua (罗志华)
 * @mail        : mail@luozhihua.com
 * @Blog        : http://www.luozhihua.com
 */

tbc.Taskbar =function(settings) {
    var SELF = tbc.self(this, arguments);
        SELF.packageName = "tbc.Taskbar";

    var defaults = {
          ui        : ".tbc-taskbar"
        , handle    : null // 隐藏按钮
        , startBox  : ".tbc-startBox" // 开始菜单
        , taskbbox  : ".tbc-task-box"
        , container : ".tbc-task-container"
        , quickbar  : ".tbc-task-quickLaunch" // 左下角开始菜单盘的快速启动栏
        , appsTray  : ".tbc-appsTray" // 任务栏右下角的托盘,
        , toPrev    : ".tbc-scroll-arrow-toPrev"
        , toNext    : ".tbc-scroll-arrow-toNext"
    },
    options = tbc.extend({}, defaults, settings);

    SELF.ui        = $(options.ui);
    SELF.taskbox   = $(options.taskbox);
    SELF.container = $(options.container);
    SELF.startBox  = $(options.startBox);
    SELF.quickbar  = $(options.quickbar);
    SELF.appsTray  = $(options.appsTray);

    SELF.hide = function(sign) {
        this.container.parent().hide();
        this.quickbar.hide();
        this.appsTray.hide();

        /*
        this.ui.find(".tbc-taskbar-container").stop()
        .animate({ width:"60" }, "slow", function() {
            SELF.ui.css({ overflow: "", width:60 })
        });
        */

        this.ui.addClass("tbc-taskbar-min");
        if (sign !== false) {
            this.state = "min";

            this.ui.children(".tbc-toggle-taskbar")
                .removeClass("tbc-hideTaskbar")
                .addClass("tbc-showTaskbar");
        }

        this.triggerEvent("hide");
    }

    SELF.show = function(sign) {
        this.container.parent().show();
        this.quickbar.show();
        this.appsTray.show();

        /**
        this.ui
        .css("width", "100%")
        .find(".tbc-taskbar-container").stop().animate({ width:"100%"}, function() {
            this.style.overflow = "visible";
        });
        */

        this.ui.removeClass("tbc-taskbar-min");
        if (sign !== false) {

            this.state = "max";

            this.ui.children(".tbc-toggle-taskbar")
                .removeClass("tbc-showTaskbar")
                .addClass("tbc-hideTaskbar");

        }

        this.triggerEvent("show");
    }

    SELF.toggle = function() {
        if (this.state === "min") {
            this.show();
        }else{
            this.hide();
        }
    }

    SELF.slidetoLeft = function() {
        this.container.animate({scrollLeft:"+=100"}, 200);
    }

    SELF.slidetoRight = function() {
        this.container.animate({scrollLeft:"-=100"}, 200);
    }

    SELF.slideTo = function(offset) {
        this.container.animate(offset||{}, 200);
    }

    SELF.slideToTask = function(node) {
        if (node) {
            var w   = this.container.width(),
                n   = $(node),
                sw  = n.size() ? n[0].offsetLeft : 0;

            this.slideTo({ scrollLeft:sw-w/2, scrollTop:0 });
        }
    }

    //
    SELF.resize = function() {
        var W   = $("body").width(),
            sw  = $(".tbc-startBox").width(),
            qw  = 0,
            aw  = 0;
        qw = $(".tbc-task-quickLaunch i.tbc-imgicon").size()*20+10;
        $(".tbc-task-quickLaunch").width(qw);

        $(".tbc-appsTray .tbc-button-link").each(function() {
            aw += $(this).outerWidth() + parseInt($(this).css("marginLeft"))*2;
        });
        aw = Math.max(aw,24);
        $(".tbc-appsTray").width(aw+10);

        $(".tbc-task-box").css({marginLeft:qw === 0?"":qw+sw+24, marginRight:aw === 0?"":aw+40 });
    }

    //
    SELF.addPopLink = function(sets) {
        var def = {
            icon    : null,
            text    : null,
            showText: false,
            url     : null,
            width   : 400,
            height  : 300,
            position: null,
            click   : function() {

            }
        },
        opt = tbc.extend({}, def, sets);


        if (opt.url) {
            $('<div class="tbc-popwindow"></div>').css({width:opt.width||def.width, height:opt.height||opt.height});
        }
    }

    $(options.toPrev).click(function() {
        SELF.slidetoRight();
        return false;
    });

    $(options.toNext).click(function() {
        SELF.slidetoLeft();
        return false;
    });

    $(options.ui).find(".tbc-toggle-taskbar").click(function() {
        SELF.toggle();
        return false;
    });

    $(options.ui).bind({
        "mouseenter" : function() {
            if (SELF.state === "min") SELF.show(false);
        },
        "mouseleave" : function() {
            if (SELF.state === "min") SELF.hide(false);
        }
    });
}