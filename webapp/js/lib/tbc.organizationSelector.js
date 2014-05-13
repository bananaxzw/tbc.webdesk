// JavaScript Document organizationSelector
;(function(){

    'use strict';

    tbc.organizationSelector = function (settings) {

        if (document.body.style.overflow!=='hidden') {
            $("html,body").css({ overflow:"hidden", background:"transparent" });
        }

        var SELF = tbc.self(this, arguments),

        defaults = {

        },
        options = tbc.extend({}, defaults, settings);

        // 注册事件
        SELF.addEvent(options.event);

        SELF.packageName = "tbc.organizationSelector";
        SELF.ui = $('<div class="tbc-blendSelector tbc-organizationSelector"></div>').html(''+
            '<div role="header" class="tbc-blendSelector-header">' +
            '   <h3>'+ i18n('v4.js.pleaseSelect') +'</h3>' +
            '<span role="tips"><i class="tbc-icon icon-info"></i>'+ i18n('v4.js.usltAutoSaveTips') +'</span>' +
            '</div>' +
            '<div role="org" class="tbc-blendSelector-organize"></div>' +
            '<div role="items" class="tbc-blendSelector-items"></div>' +
            '<div style="clear:both;"></div>' +
            '<div role="footer" class="tbc-blendSelector-footer">' +
            '   <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText||i18n("v4.js.confirm")) +'</span></a>' +
            '   <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText||i18n("v4.js.cancel")) +'</span></a>' +
            '</div>');

        SELF.container = SELF.ui;
        SELF.part = {};
        SELF.ui.find("[role]").each(function() {
            var role = this.getAttribute("role");
            SELF.part[role] = $(this);
        });

        // 隐藏提示
        if (options.itemSelectorOptions.autoSave===false || options.itemSelectorOptions.lazy===true) {
            SELF.part.tips.hide();
        }

        // 项目选择器
        options.itemSelectorOptions = $.extend({}, options.itemSelectorOptions, {
            isOrganize      : true,
            textTransform   : {
                "ORGANIZATION"      : "["+ i18n('v4.js.minDep') +"] ",
                "POSITION"          : "["+ i18n('v4.js.minJob') +"] ",
                "POSITION_CATEGORY" : " ",
                "GROUP"             : "["+ i18n('v4.js.minGroup') +"] ",
                "GROUP_CATEGORY"    : " "
            },
            post            : options.post,
            itemTemplate    : '<li data-id="{id}" title="{np}" title="{nm}"><i>{nm}</i></li>',
            itemTemplateSelected    : '<li data-id="{id}" title="{np}"><i>{tp}{nm}{parentheses1}{rnm}{icn}{parentheses2}</i></li>',
            dataTemplate    : {id:"id",text:"nm",title:"np"},

            vauleSetFormater : function (vals) {

                var nodeType = accSelector.getCurrent().container.data("options").nodeType,
                    val = {},
                    k;

                for (k in vals) {
                    switch (k) {
                        case "nm":
                        case "text":
                            val.nm = vals.nm||vals.text;
                            val.text = vals.nm||vals.text;
                            break;
                        case "selected":
                            val[k] = (vals[k] || this._cache.selected.names[vals.id]) ? " checked" : "";
                            break;
                        case "rnm":
                            val[k] = vals[k] ? vals[k] : "";
                            break;
                        case "icn":
                            val[k] = vals[k] ?  vals[k] : "";
                            break;
                        default:
                            val[k] = vals[k];
                    }
                }
                try { return val; } finally { val=null; }
            },

            // 格式化保存结果
            postFormater    : function(items) {
                var ids = [],
                    i, len;
                for (i=0,len=items.length; i<len; i++) {
                    ids.push([ items[i].ic, items[i][dt.id], items[i].tp||"ORGANIZATION", items[i].rid ].join(":"));
                }
                return ids.join(",");
            },

            //
            itemDataFormater : function(items) {

                var nodeType = accSelector.getCurrent().container.data("options").nodeType,
                    node     = accSelector.getSelected() || {},
                    i, len;

                for (i=0,len=items.length; i<len; i++) {
                    switch (items[i].tp || nodeType) {
                        case "POSITION" :
                            items[i].rnm = items[i].rnm||node.nm||node.text;
                            items[i].rid = items[i].rid||node.id;
                            items[i].tp = items[i].tp||"POSITION";
                            if (items[i].rnm) {
                                items[i].parentheses1=" (";
                                items[i].parentheses2=")";
                            }
                            items[i].ic = accSelector.includeChild;
                            if (items[i].ic) {
                                items[i].parentheses1=" (";
                                items[i].parentheses2=")";
                            }
                        break;

                        case "ORGANIZATION" :
                            items[i].tp = items[i].tp || "ORGANIZATION";
                            delete items[i].rid;
                            delete items[i].rnm;
                            if (items[i].ic) {
                                items[i].parentheses1=" (";
                                items[i].parentheses2=")";
                            }
                        break;

                        case "GROUP":
                        break;
                    }
                }

                return items;
            }
        });

        //
        options.orgSelectorOptions = $.extend({}, options.orgSelectorOptions, {
            autoSelect : false, // 自动选中某个节点
            height : 365
        });

        var dt = options.itemSelectorOptions.dataTemplate;

        var itemSelector = new tbc.itemSelector(options.itemSelectorOptions),
            accSelector  = new tbc.accordionSelector (options.orgSelectorOptions);

        // 已选栏和待选栏
        itemSelector.prepend('<div class="tbc-itemSelector-header">' +
            '    <div class="padding">' +
            '        <div class="abs_right">' +
            '            <input type="text" placeholder="'+ i18n('v4.js.enterKeywords') +'" class="tbc-inputer searchKeywords">' +
            '            <select name="which" style="display:none;">' +
            '                <option value="0">'+ i18n('v4.js.available') +'</option>' +
            '                <option value="1">'+ i18n('v4.js.selected') +'</option>' +
            '            </select>' +
            '            <a class="tbc-button searchButton" type="button">'+ i18n('v4.js.filter') +'</a>' +
            '        </div>' +
            '     </div>' +
            '</div>');

        // 关键词
        itemSelector.ui.find(".searchKeywords").keyup(function(event) {
            var value = $.trim(this.value),
                placeholder = this.getAttribute('placeholder');
            if ( value !== placeholder) {
                itemSelector._ajaxDataAvailable.keyword = value;
                itemSelector._ajaxDataSelected.keyword = value;
            }
            if (event.keyCode === 13) {
                itemSelector.ui.find(".searchButton").trigger('click');
            }
        }).focus(function() {
            var value = $.trim(this.value);
            if ( value === this.getAttribute('placeholder')) {
                this.value = "";
            }
        }).blur(function() {
            var value = $.trim(this.value);
            if (value === "") {
                this.value = this.getAttribute('placeholder');
            }
        });

        function search_item (which, keyword) {
            var txtinp = itemSelector.ui.find(".searchKeywords"),
                placeholder = txtinp.attr('placeholder') || txtinp.attr('title');


            if (!keyword || keyword.length === 0 || keyword === placeholder) {
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

        itemSelector.addEvent({
            "beforeSave": function() { tbc.lock(SELF.ui); return false; },
            "afterSave" : function() { tbc.unlock(SELF.ui); return false; }
        });

        SELF.extend({
            appendTo : function (box) {

            }
        });
        // 依赖
        itemSelector.depend(SELF);
        accSelector.depend(SELF);

        // 隐藏itemSelector的功能
        $(itemSelector.part.operaAddCurrPage).hide();
        $(itemSelector.part.operaRemoveCurrPage).hide();
        $(itemSelector.part.addAll).hide();

        $(itemSelector.part.availContainer).parent().hide();
        $(itemSelector.part.selectedContainer).parent().css({width:410});

        if (options.itemSelectorOptions.deletable === false) {
            $(itemSelector.part.removeAll).hide();
            $(itemSelector.part.operaRemoveSelected).attr("disabled", "disabled").addClass("tbc-button-disabled");
            $(itemSelector.part.operaRemoveCurrPage).attr("disabled", "disabled").addClass("tbc-button-disabled");
        }

        //
        itemSelector.appendTo(SELF.part.items);
        itemSelector.loadAvailableByPage(1);

        accSelector.appendTo(SELF.part.org);

        accSelector.addEvent({
            "afterLoad" : function(itm) {
                var opt = itm.container.data("options");
                if (opt.nodeType === "POSITION") {
                    var treeId = itm.container.data("treeId"),
                        tree   = tbc.TASKS(treeId);
                    tree && tree.setCurrent();
                }
            },
            "active"    : function(itm) {
                var opt = itm.container.data("options");
                if (opt.nodeType === "POSITION") {
                    var sltBox = $(itemSelector.part.selectedContainer).parent(),
                        width  = sltBox.outerWidth();
                    $(itemSelector.part.selectedContainer).parent().css({width:203});
                    sltBox.css({width:203}).show();
                    $(itemSelector.part.availContainer).parent().show();

                } else {
                    var avlBox = $(itemSelector.part.availContainer).parent();
                    avlBox.hide();

                    avlBox.find("li.selected").removeClass("selected");
                    $(itemSelector.part.selectedContainer).parent().css({width:418});
                }

                if (opt.nodeType === "POSITION") {
                    var treeId = itm.container.data("treeId"),
                        tree   = tbc.TASKS(treeId);
                    tree && tree.setCurrent();
                }
                itemSelector.clearAvailable();
            },

            'check' : function (list) {
                var nodeType = this.getCurrent().container.data("options").nodeType;
                for (var i=0,len=list.length; i<len; i++) {
                    var icn     = accSelector.includeChild ? i18n('v4.js.includeSubCls') : "",
                        pro     = list[i].property,
                        data    = [{ id:pro.id, tp:pro.tp, nm:pro.nm||pro.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];
                    if (pro.id && !itemSelector._cache.available.names[pro.id]) {
                        itemSelector.addAvailableItem(data);
                    }
                }
            },

            'deselect' : function (list) {
                for (var i=0,len=list.length; i<len; i++) {
                    itemSelector.removeAvailableItem (list[i].property.id);
                }
            },

            "select" : function (selectedNode, b, c) {
                itemSelector._ajaxDataAvailable.nodeType=b;
                itemSelector._ajaxDataAvailable.nodeId=selectedNode.id;

                var nodeType = this.getCurrent().container.data("options").nodeType;

                if ( selectedNode.tp === nodeType || (!selectedNode.tp&&nodeType !== "POSITION") || nodeType === "ORGANIZATION" || (nodeType === "GROUP"&&selectedNode.tp === "GROUP")) {

                    if (selectedNode.tp==="POSITION") {

                        // itemSelector.loadAvailableByPage(1);
                    } else {
                        var icn, data;
                        if (!selectedNode.tp || selectedNode.tp==="ORGANIZATION") {
                            icn = accSelector.includeChild ? i18n('v4.js.includeSubCls') : "";
                            data = [{ id:selectedNode.id, tp:selectedNode.tp, nm:selectedNode.nm||selectedNode.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];
                        } else {
                            data = [{ id:selectedNode.id, tp:selectedNode.tp, nm:selectedNode.nm||selectedNode.text, ic:accSelector.includeChild, rnm:"" }];
                        }
                        itemSelector.addAvailableItem(data);
                    }

                // 如果是岗位
                } else if (nodeType === "POSITION") {
                    itemSelector.loadAvailableByPage(1);
                }
            },
            "includechild" : function(include) {
                itemSelector._ajaxDataAvailable.includeChild = include;
            }
        });

        itemSelector.addEvent({
            "select"    : function (list) {
                var accItm  = accSelector.getCurrent(),
                    opt     = accItm.container.data("options");

                if (opt.nodeType !== "POSITION") {
                    this.clearAvailable();
                }
            },

            "beforeAvailableLoad" : function() {
                var accItm  = accSelector.getCurrent(),
                    opt     = accItm.container.data("options");

                if (opt.nodeType !== "POSITION") return false;
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
                    a = [];
                for (var k in s) {
                    if (k && s[k]) {
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
                lazy    = options.itemSelectorOptions.lazy;

            if ((autoSave !== false) && lazy===true && options.lazyUrl) {
                var data = options.itemSelectorOptions.post || {};
                    data[options.itemSelectorOptions.postKey||"orgIds"] = options.itemSelectorOptions.postFormater(selected);

                $.ajax({
                    url : options.lazyUrl,
                    data    : data,
                    dataType: "json",
                    type    : "post",
                    beforeSend: function() { tbc.lock(SELF.ui); },
                    complete: function() { tbc.unlock(SELF.ui); },
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

    tbc.organizationSelector.prototype = {
        init: function() {

        }
    };
}());
