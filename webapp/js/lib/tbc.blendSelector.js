/*
 * 综合选择器
 */
;(function(tbc, $){

    "use strict";

    tbc.blendSelector = function (settings) {

        if (document.body.style.overflow!=='hidden') {
            $("html,body").css({ overflow:"hidden", background:"transparent" });
        }

        var SELF = tbc.self (this, arguments),
        defaults = {
            max          : 0,
            title        : i18n('v4.js.selectUsers'), //"选择人员",
            verifyButton : true,
            cancelButton : true,
            verifyText   : i18n('!v4.js.confirm'), //"确定",
            cancelText   : i18n('!v4.js.cancel') //"取消"
        },
        options = tbc.extend({}, defaults, settings);

        // 注册事件
        SELF.addEvent(options.event);

        SELF.packageName = "tbc.blendSelector";
        SELF.ui = $('<div class="tbc-blendSelector"></div>').html(
            '<div role="header" class="tbc-blendSelector-header"><h3>'+ i18n('v4.js.pleaseSelect') +'</h3><span role="tips"><i class="tbc-icon icon-info"></i>'+ i18n('v4.js.usltAutoSaveTips') +'</span> </div>' +
            '<div role="org" class="tbc-blendSelector-organize"></div>' +
            '<div role="items" class="tbc-blendSelector-items"></div>' +
            '<div style="clear:both;"></div>' +
            '<div role="footer" class="tbc-blendSelector-footer">' +
            '    <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText||i18n('v4.js.confirm')) +'</span></a>' +
            '    <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText||i18n('v4.js.cancel')) +'</span></a>' +
            '</div>');

        SELF.container = SELF.ui;
        SELF.part = {};
        SELF.ui.find("[role]").each(function() {
            var role = this.getAttribute("role");
            SELF.part[role] = $(this);
        });

        options.itemSelectorOptions = $.extend({}, options.itemSelectorOptions, {
            vauleSetFormater : function (vals) {
                var val = {},
                    k;

                for (k in vals) {
                    if (vals.hasOwnProperty(k)) {
                        switch (k) {
                            case "nm":
                            case "text":
                                val["nm"] = vals["nm"]||vals["text"];
                                val["text"] = vals["nm"]||vals["text"];
                                break;
                            case "selected":
                                val[k] = (vals[k] || this._cache.selected.names[vals.id]) ? " checked" : "";
                                break;
                            case "rnm":
                                val[k] = vals[k] ? " ("+vals[k]+")" : "";
                                break;
                            case "icn":
                                val[k] = vals[k] ?  " ("+vals[k]+")" : ""
                                break;
                            default:
                                val[k] = vals[k];
                        }
                    }
                }

                val["selected"] = (vals["selected"] || this._cache.selected.names[vals.id]) ? " checked" : "";

                try { return val; } finally { val=null; }
            }
        });

        options.orgSelectorOptions = $.extend(options.orgSelectorOptions||{}, {height:365});

        var itemSelector    = new tbc.itemSelector(options.itemSelectorOptions),
            accSelector        = new tbc.accordionSelector (options.orgSelectorOptions);

        itemSelector.prepend('<div class="tbc-itemSelector-header">' +
                    '    <div class="padding">' +
                    '        <select name="accountStatus">' +
                    '            <option value="ALL" selected="selected">'+ i18n('!v4.js.all') +'</option>' +
                    '            <option value="ENABLE">'+ i18n('v4.js.activationStaff') +'</option>' +
                    '            <option value="FORBIDDEN">'+ i18n('!v4.js.freezeStaff') +'</option>' +
                    '        </select>' +
                    '        <div class="abs_right">' +
                    '            <input type="text" value="'+ i18n('!v4.js.usltInputTips') +'" title="'+ i18n('v4.js.usltInputTips') +'" class="tbc-inputer searchKeywords">' +
                    '            <select name="which">' +
                    '                <option value="0">'+ i18n('!v4.js.available') +'</option>' +
                    '                <option value="1">'+ i18n('!v4.js.selected') +'</option>' +
                    '            </select>' +
                    '            <a class="tbc-button searchButton" type="button">'+ i18n('v4.js.filter') +'</a>' +
                    '        </div>' +
                    '     </div>' +
                    '</div>');

        // 隐藏提示
        if (options.itemSelectorOptions.autoSave===false || options.itemSelectorOptions.lazy===true) {
            SELF.part.tips.hide();
        }

        itemSelector.addEvent({
            "beforeSave" : function() { tbc.lock(SELF.ui); return false; },
            "afterSave"  : function() { tbc.unlock(SELF.ui); return false; }
        });

        // 选择用户状态
        itemSelector.ui.find("select[name='accountStatus']")
        .val(options.accountStatus)
        .change(function() {
            itemSelector._ajaxDataAvailable.accountStatus=this.value;
            itemSelector._ajaxDataSelected.accountStatus=this.value;
            itemSelector.pageAvailable();
        });

        if (options.accountStatus) {
            itemSelector._ajaxDataAvailable.accountStatus=options.accountStatus;
            itemSelector._ajaxDataSelected.accountStatus=options.accountStatus;
        }

        if (options.accountStatus || (options.accountStatus && options.accountStatus.toLowerCase() !== "all")) {
            itemSelector.ui.find("select[name='accountStatus']").hide();
        }

        // 关键词
        itemSelector.ui.find(".searchKeywords").keyup(function(event) {
            var value = $.trim(this.value);
            if ( value !== this.title) {
                itemSelector._ajaxDataAvailable.keyword = value;
                itemSelector._ajaxDataSelected.keyword = value;
            }
            if (event.keyCode === 13) {
                itemSelector.ui.find(".searchButton").trigger('click');
            }
        }).focus(function() {
            var value = $.trim(this.value);
            if ( value === this.title) {
                this.value = "";
            }
        }).blur(function() {
            var value = $.trim(this.value);
            if (value === "") {
                this.value = this.title;
            }
        });

        function search_item (which, keyword) {
            var txtinp = itemSelector.ui.find(".searchKeywords");


            if (!keyword || keyword.length === 0 || keyword === txtinp[0].title) {
                itemSelector._ajaxDataAvailable.keyword = "";
                itemSelector._ajaxDataSelected.keyword = "";
            } else {
                if (which === "0") {
                    itemSelector._ajaxDataAvailable.keyword = keyword;
                    itemSelector._ajaxDataSelected.keyword = "";
                } else if (which === "1" && options.itemSelectorOptions.autoSave !== false && options.itemSelectorOptions.lazy !== true) {
                    itemSelector._ajaxDataAvailable.keyword = "";
                    itemSelector._ajaxDataSelected.keyword = keyword;
                }
            }

            itemSelector.pageSelected(1);
            itemSelector.pageAvailable(1);
        }

        // 切换待选或已选
        itemSelector.ui.find("select[name='which']").change(function() {
            var which = this.value,
                keyword = itemSelector.ui.find(".searchKeywords").val();

            search_item(which, keyword);
        });

        // 搜索按钮
        itemSelector.ui.find(".searchButton").click(function(event) {
            event.preventDefault();
            var which = itemSelector.ui.find("select[name='which']").val(),
                keyword = itemSelector.ui.find(".searchKeywords").val();

            search_item(which, keyword);
        });

        // 隐藏移除全部按钮
        if (options.itemSelectorOptions.deletable === false) {
            $(itemSelector.part.removeAll).hide();
            $(itemSelector.part.operaRemoveSelected).attr("disabled", "disabled").addClass("tbc-button-disabled");
            $(itemSelector.part.operaRemoveCurrPage).attr("disabled", "disabled").addClass("tbc-button-disabled");
        }

        // 依赖
        itemSelector.depend(SELF);
        accSelector.depend(SELF);

        //
        itemSelector.appendTo(SELF.part.items);
        accSelector.appendTo(SELF.part.org);

        accSelector.addEvent({
            "select" : function (selectedNode, b, c) {
                itemSelector._ajaxDataAvailable.nodeType=b
                itemSelector._ajaxDataAvailable.nodeId=selectedNode.id
                itemSelector.pageAvailable(1);
            },
            "includechild" : function (include) {
                itemSelector._ajaxDataAvailable.includeChild = include;
            }
        });

        SELF.extend({
            append : function(child) {
                this.container.append(child);
            },

            prepend : function(child) {
                this.container.prepend(child);
            },

            appendTo : function(box) {
                this.ui.appendTo(box);
            },

            prependTo : function(box) {
                this.ui.prependTo(box);
            },

            close : function() {
                SELF.triggerEvent("close");
                this.DESTROY();
            },

            getSelected : function() {
                var s = itemSelector._cache.selected.names,
                    a = [],
                    k;
                for (k in s) {
                    if (s.hasOwnProperty(k)) {
                        a.push(s[k]);
                    }
                }
                return a;
            }
        });

        if (!options.verifyButton) SELF.part.verify.hide();
        if (!options.cancelButton) SELF.part.cancel.hide();

        // 确认按钮
        SELF.part.verify.click(function() {
            var selected = SELF.getSelected(),
                autoSave = options.itemSelectorOptions.autoSave,
                lazy     = options.itemSelectorOptions.lazy,
                list     = [];
            if ((typeof autoSave === "undefined"||autoSave===true) && lazy===true && options.lazyUrl) {
                $.each(selected, function() {
                    list.push(this.userId);
                });

                var data = options.itemSelectorOptions.post || {};
                    data[options.itemSelectorOptions.postKey||"userIds"] =  list.join(",");

                $.ajax({
                    url        : options.lazyUrl,
                    data    : data,
                    type    : "post",
                    dataType: "json",
                    beforeSend: function() {
                        tbc.lock(SELF.ui);
                    },
                    complete: function() {
                        tbc.unlock(SELF.ui);
                    },
                    success : function() {
                        if (SELF.triggerEvent("verify", selected) !== false) {
                            SELF.ui.remove();
                            SELF.close();
                        }
                    }
                });
                data = null;

            } else if (SELF.triggerEvent("verify", selected) !== false) {
                SELF.ui.remove();
                SELF.close();
            }
        });

        // 取消按钮
        SELF.part.cancel.click(function() {
            var selected = SELF.getSelected();
            if (SELF.triggerEvent("cancel", selected) !== false) {
                SELF.ui.remove();
                SELF.close();
            }
        });
    };
}(tbc, jQuery));
