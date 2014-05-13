/*
 * @Class:  tb.Button (按钮) #########################################
 *
 * @Copyright    : 时代光华
 * @Author        : 罗志华
 * @mail         : mail@luozhihua.com
 */

tbc.Button = function(settings) {
    var SELF = tbc.self(this, arguments);
    SELF.extend(tbc.Event);
    SELF.extend(tbc.ClassManager);
    SELF.packageName = "tbc.Button";

    var defaults = {
          border : true
        , icon     : null
        , text     : "&nbsp;"
        , click     : null
        , target : null
    },
    options = tbc.extend({}, defaults, settings)
    ;

    /**
    SELF.ui = $('<a href="#" class="">\
        <span class="tbc-icon icon-application_windows_add"><img src="" onerror="this.style.display=\'none\'" style="width:16px; height:16px;"/></span>\
        <span class="tbc-button-text"></span>\
    </a>')
    .addClass(options.border?"tbc-button":"tbc-button-link");
    /**/

    SELF.ui = $('<button class="">\
        <span class="tbc-icon icon-application_windows_add"><img src="" onerror="this.style.display=\'none\'" style="width:16px; height:16px;"/></span>\
        <span class="tbc-button-text"></span>\
    </button>')
    .addClass(options.border?"tbc-button":"tbc-button-link");


    var icon = SELF.ui.find("img"),
        text = SELF.ui.find(".tbc-button-text");

    // 设置或获取按钮图标
    SELF.icon = function(_icon) {
        if (_icon && typeof(_icon) === "string") {

            if (_icon.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || _icon.indexOf("sf-server/file/getFile/") !== -1) {
                icon.show().attr("src", _icon)
                .parent().removeAttr("class").addClass("tbc-icon");
            }else{
                icon.hide()
                .parent().removeAttr("class")
                .addClass("tbc-icon")
                .addClass(_icon);
            }

            return SELF;
        }else{
            return options.icon;
        }
    }

    // 设置或获取按钮文字
    SELF.text = function(_text) {
        if (_text && typeof(_text) === "string") {
            text.html(_text);
            options.text = _text;
            return SELF;
        }else{
            return options.text;
        }
    }

    // 禁用
    SELF.disable = function() {
        SELF.disabled = true;
        SELF.ui.addClass("tbc-button-disabled");
        SELF.triggerEvent("disable");
        return SELF;
    }

    // 启用
    SELF.enable = function() {
        SELF.disabled = false;
        SELF.ui.removeClass("tbc-button-disabled");
        SELF.triggerEvent("enable");
        return SELF;
    }

    // 点击
    SELF.click = function() {
        if (!SELF.disabled) {
            $.isFunction(options.click) && options.click.call(SELF);
            SELF.triggerEvent("click");
        }
        return SELF;
    }

    // 加入到目标节点
    SELF.appendTo = function(target) {
        target = target&&target.container ? target.container : target;
        SELF.ui.appendTo(target);
        SELF.triggerEvent("append", target);
        return SELF;
    }

    // 移除
    SELF.remove = function() {
        SELF.ui.remove();
        SELF.triggerEvent("remove");
    }


    SELF.icon(options.icon);
    SELF.text(options.text);
    SELF.appendTo(options.target);
    SELF.ui.click(function() { SELF.click(); });

}

