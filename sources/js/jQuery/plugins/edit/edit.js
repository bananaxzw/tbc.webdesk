
(function ($) {

    $.fn.edit = function (settings) {

        var defaults = {

            saveUrl: null,     // 保存编辑结果的路径
            type: "input",  // input、textarea
            position: "static", // absolute/static/relative/fixed
            postname: "data",   // 发送时用的数据名称，如： action=save&data="编辑后发送给服务器的文字"
            saveButton: true,     // 是否显示导航按钮
            maxlength: null,     // 字数限制
            autoSave: false,     // 自动保存
            //filter : function(){}, 内容采集

            textSave: "确定", // 保存按钮的文字
            textCancel: "取消", // 取消按钮的文字

            classEditor: null,   // 编辑框的样式
            classText: null,   // 输入框的样式
            classSave: null,   // 保存按钮样式
            classCancel: null,   // 取消按钮样式

            onCreate: null,    // 创建编辑框时
            onSave: null,    // 保存时
            onCancel: null,    // 取消
            success: null,    // 保存成功: 若有保存的URL，则在AJAX保存成功后执行
            error: null     // 保存错误
        }

        var options = $.extend({}, defaults, settings);

        return this.each(function () {
            var _this = $(this);
            var zIndex = pt37.getMaxZIndex() + 1;
            var coor = pt37.getCoordinate(this);

            $.isFunction(options.onBeforeCreate) && options.onBeforeCreate.call(_this);

            // 生成编辑框
            var editor = $('<div class="text_editor" style="display:inline-block; _display:inline; _zoom:1;"></div>')
				.css({ position: "absolute", zIndex: zIndex, left: coor.left, top: coor.top })
				.bind("remove", function () {
				    $(this).fadeOut("normal", function () { $(this).remove(); _this.show(); });
				    _this.removeClass("editing");
				})
				.appendTo("body");

            // 原始的HTML内容
            var original = $.isFunction(options.filter) ? options.filter.call(this) : $(this).text();

            /* Start: 生成输入框 */
            var ipt = options.type == "input"
				? $('<input type="text" value="' + original + '" ' + (options.maxlength ? 'maxlength="' + options.maxlength + '"' : "") + ' />')
				: $('<textarea>' + original + '</textarea>');

            options.classText
				? ipt.addClass(options.classText)
				: ipt.css({ width: $(this).width(), height: $(this).height() });

            ipt.keyup(function (event) {

                if ((options.type == "input" && event.keyCode == 13) || (options.type != "input" && event.ctrlKey && event.keyCode == 13)) {
                    save.trigger("click");
                }

                save.text(options.textSave);
                return false;
            })
				.blur(function () {
				    if (options.autoSave) { save.trigger("click"); };
				})
				.appendTo(editor);

            /* End: 生成输入框 */

            /* Start: 生成保存按钮 */
            var save = $('<button type="button">' + options.textSave + '</button>')
				.addClass(options.classSave)
				.click(function () {

				    var newText = ipt.val();
				    if ($.isFunction(options.onSave)) {
				        if (options.onSave.call(_this, newText) === false) {
				            return false;
				        }
				    }

				    // 如果设置了用于保存编辑结果的URL，则向该URL发送编辑后的结果
				    if (options.saveUrl) {

				        $.ajax({
				            url: options.saveUrl,
				            type: "post",
				            data: (options.postname || "data") + "=" + encodeURIComponent(newText),
				            beforeSend: function () {
				                ipt.attr("disabled", "disabled");
				                save.attr("disabled", "disabled");
				                save.text("...");
				            },
				            complete: function () {
				                ipt.removeAttr("disabled");
				                save.removeAttr("disabled");
				            },
				            success: function (html) {
				                _this.text(newText);
				                if ($.isFunction(options.success)) {
				                    if (options.success.call(_this, newText) !== false) {
				                        editor.trigger("remove");
				                    }
				                } else {
				                    editor.trigger("remove");
				                }
				            },
				            error: function () {
				                save.text("请重试");
				                $.isFunction(options.error) && options.error.call(_this);
				            }
				        });

				        // 当没有设置用于保存编辑结果的URL时，直接更改页面上的元素值
				    } else {
				        try {
				            _this.text(newText);

				            $.isFunction(options.success) && options.success.call(_this, newText);
				            editor.trigger("remove");
				        } catch (e) {
				            $.isFunction(options.error) && options.error.call(_this);
				        }
				    }
				});
            /* End: 生成保存按钮 */

            // 生成取消按钮
            var cancel = $('<button type="button">' + options.textCancel + '</button>')
				.addClass(options.classCancel)
				.click(function () {
				    editor.trigger("remove");
				    $.isFunction(options.onCancel) && options.onCancel.call(_this);
				});

            if (options.saveButton) {
                editor.append(save).append(cancel);
            } else {
                ipt.css({ width: _this.width() });
            }

            if (options.position != "static") { editor.css({ boxShadow: "1px 1px 2px #000", backgroundColor: "#fff" }); }
            switch (options.position) {
                case "static":
                    editor.insertAfter($(this).hide()).css("position", "static");
                    var _w = editor.width() - save.width() - cancel.width();

                    // ipt.width( _w );
                    break;
                case "absolute":

                    break;
                case "relative":

                    break;
                case "fixed":

                    break;
            }
            ipt.focus();

            _this.bind({
                "save.edit": function () { save.trigger("click"); },
                "cancel.edit": function () { cancel.trigger("click"); },
                "adsorb.edit": function (e, data) {
                    var _coor = pt37.getCoordinate(_this[0]);
                    data == "animate"
					? editor.animate({ left: _coor.left, top: _coor.top })
					: editor.css({ left: _coor.left, top: _coor.top });
                }
            }).addClass("editing");

            $.isFunction(options.onCreate) && options.onCreate.call(_this);

        });
    }

})(jQuery);