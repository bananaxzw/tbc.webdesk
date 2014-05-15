(function(tbc, $, URLS) {

    'use strict';

    /**
     * @method tbc.dialog
     * @for tbc
     *
     * @param {String|jQuery Object} html 显示的内容
     * @param {Object} settings
     *
     * @copyright 时代光华
     * @author mail@luozhihua.com
     *
     */
    tbc.dialog = function(html, settings) {

        if (html && html instanceof Object && !html.size) {
            settings = html;
            html = settings.html;
        }

        settings = settings || {};

        if (!(this instanceof tbc.dialog)) {
            return new tbc.dialog(html, settings);
        }

        var parentClass = settings.parentClass || (settings.url ? tbc.Window : tbc.Panel),
            options = tbc.extend({
                name         : i18n('v4.js.systemPrompt'), //'提示',
                width        : 320,
                height       : 190,
                target       : 'body',
                modal        : true,
                icon         : 'icon-application_windows',
                autoLoad     : false,
                scrolling    : false,
                buttonsAlign : 'right'
            }, settings);

        options.homepage = settings.url;

        var SELF = tbc.self(this, arguments)
        .extend([parentClass, options], {
            initDialog : function() {

                var dialog = this,
                    viewer = $('<div style="overflow:auto;"></div>'),
                    buttons,
                    mask,
                    btns = [],
                    k, text, btn, cls
                    ;

                viewer.append(html||options.html);
                this.append(viewer);

                // 按钮
                if (options.buttons) {

                    // jquery UI 按钮定义方式
                    if (typeof options.buttons === 'object' && !(options.buttons instanceof Array)) {
                        for (k in options.buttons) {
                            if (options.buttons.hasOwnProperty(k)) {
                                btn = options.buttons[k];
                                text = dialog.renderButtons(btn, k);
                                btns.push(text);
                            }
                        }

                    // 按钮对象list
                    } else if (options.buttons instanceof Array) {
                        for (k=0; k<options.buttons.length; k++) {
                            btn = options.buttons[k];
                            text = dialog.renderButtons(btn, k);
                            btns.push(text);
                        }
                    }

                    if (btns.length>0) {
                        buttons = $('<div class="tbc-dialog-buttons" style="text-align:'+ options.buttonsAlign +'; padding:10px; background-color:#f6f6f6;"></div>');
                        buttons.html(btns.join(''));
                    }

                    // 按钮点击
                    buttons.on('click', 'button', function() {
                        var type = this.getAttribute('data-action'),
                            func = type && /^\d+$/.test(type) ?
                                options.buttons[parseInt(type)].action :
                                options.buttons[type];

                        if ($.isFunction(func)) {
                            func.call(SELF);
                        }
                    });

                    this.container.css({overflow:'hidden'});
                    this.append(buttons);
                }

                // 设置dialog的内容容器
                this.container = viewer;
                this.show();
                this.initModal();

                this.addEvent({
                    'close' : function() {
                        var mask = this.mask;

                        if (mask && $.isFunction(mask.fadeOut)) {
                            mask.fadeOut(function() { mask.remove(); });
                        }
                    },
                    'resize': function(size) {
                        var hei,
                            headHei = this.part.header.height(),
                            footHei = this.part.footer.height();

                        if (buttons && $.isFunction(buttons.height)) {
                            hei = size.height - headHei - footHei - buttons.outerHeight();
                        } else {
                            hei = '100%';
                        }

                        viewer.height(hei);
                    }
                });

                return this;
            },

            renderButtons: function(button, key) {
                var text, cls;
                if (typeof button === "function") {
                    text = key;
                    cls = '';
                } else {
                    text =  button.text || '';
                    cls = button.cssClass || '';
                }
                return ('<button class="tbc-button '+ cls +'" data-action="'+ key +'" type="button">'+ text +'</button>');
            },

            initModal : function() {
                var dialog = this;

                // 如果是模态对话框
                if (options.modal) {
                    this.mask = $('<div class="tbc-mask"/>').css({
                        position : 'absolute',
                        zIndex   : (this.ui.css('zIndex')||1)-1,
                        backgroundColor : '#000',
                        opacity : 0.2,
                        left    : 0,
                        top     : 0,
                        width   : '100%',
                        height  : '100%'
                    })
                    .insertBefore(this.ui)
                    .bind('click', function() {
                        if ($.isFunction(dialog.flash)) {
                            dialog.flash();
                        }
                    });
                }
            }

        })
        .initDialog();

        SELF.triggerEvent('resize', {
            width: options.width,
            height: SELF.ui.height()
        });

        if ($.isFunction(SELF.load)) {
            SELF.load();
        }

        return SELF;
    };

    /**
     * @method tbc.confirm
     * @for tbc
     * @depands tbc.dialog

     * @param {String} msg 消息内容
     * @param {Function} callback 回调方法
     * @param {Object} [settings] 弹出框的配置信息

     * @copyright 时代光华
     * @author 罗志华
     * @mail mail#luozhihua.com
     *
     */
    tbc.confirm = function(msg, callback, settings) {


        var buttons = {};

        settings = settings || ($.isPlainObject(callback) ? callback : {});

        buttons[settings.verifyText|| i18n('v4.js.confirm')] = function() {
            if ($.isFunction(callback)) {
                callback.call(this);
            }
            this.close();
        };

        buttons[settings.cancelText||i18n('v4.js.cancel')] = function() {
            this.close();
        };

        settings.buttons = buttons;
        settings.icon = settings.icon || 'icon-warning_triangle';
        settings.name = settings.name || settings.title || i18n('v4.js.confirm');
        msg = $('<div style="padding:24px;"></div>').empty().append(msg);

        return tbc.dialog(msg, settings);
    };

    /**
     * @method tbc.alert
     * @for tbc
     * @depands tbc.dialog

     * @param {String} msg 显示的消息
     * @param {Function} [callback] 回调函数
     * @param {Object} [settings] 弹出框配置

     * @copyright 时代光华
     * @author 罗志华
     * @mail mail#luozhihua.com
     *
     */
    tbc.alert = function(msg, callback, settings) {
        var buttons = {};

        settings = settings || ($.isPlainObject(callback) ? callback : {});

        buttons[settings.verifyText||i18n('v4.js.confirm')] = function() {
            if ($.isFunction(callback)) {
                callback.call(this);
            }
            this.close();
        };

        settings.buttons = buttons;
        settings.icon = settings.icon || 'icon-information';
        settings.name = settings.name || settings.title || i18n('v4.js.systemPrompt');
        msg = $('<div style="padding:24px;"></div>').append(msg);

        return tbc.dialog(msg, settings);
    };

}(window.tbc, window.jQuery, window.URLS));
