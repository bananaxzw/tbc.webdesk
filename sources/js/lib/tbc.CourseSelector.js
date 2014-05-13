// JavaScript Document organizationSelector
;(function($, tbc) {

    "use strict";

    tbc.CourseSelector = function (settings) {

        if (!tbc.CourseSelector.bodyOverflowHidden) {
            tbc.CourseSelector.bodyOverflowHidden = true;
            $("html,body").css({ overflow:"hidden", background:"transparent" });
        }

        var  defaults = {
                selectButtons : function() {

                }
            },
            options = tbc.extend({}, defaults, settings),
            itemSelector,
            accSelector,
            dt,
            SELF = tbc.self(this, arguments);

        // 注册事件
        SELF.addEvent(options.event);

        SELF.packageName = "tbc.CourseSelector";
        SELF.ui = $('<div class="tbc-blendSelector tbc-courseSelector"></div>').html(
                '<div role="header" class="tbc-blendSelector-header"><h3>'+ i18n('v4.js.pleaseSelect') +'</h3><span role="tips"><i class="tbc-icon icon-info"></i>'+ i18n('v4.js.usltAutoSaveTips') +'</span> </div>' +
                '<div role="org" class="tbc-blendSelector-organize"></div>' +
                '<div role="items" class="tbc-blendSelector-items"></div>' +
                '<div style="clear:both;"></div>' +
                '<div role="footer" class="tbc-blendSelector-footer">' +
                '    <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText || i18n("v4.js.confirm")) +'</span></a>' +
                '    <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText || i18n("v4.js.cancel")) +'</span></a>' +
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
        options.itemSelectorOptions = $.extend({}, options.itemSelectorOptions, {isOrganize        : true,

            textTransform : {
                "COURSE"  : i18n('v4.js.courseMin'), //"[课] ",
                "SUBJECT" : i18n('v4.js.subject') //"[专题] "
            },
            post : options.post,
            itemTemplate : '<li data-id="{id}" title="{title}" class="{selected} {checked}"><i>{title}</i></li>',
            dataTemplate : {id:"id", text:"title", title:"title"},
            itemTemplateSelected : '<li data-id="{id}" title="{title}"><i>{type}{title}</i></li>',
            vauleSetFormater : function (vals) {

                var nodeType = accSelector.getCurrent().container.data("options").nodeType,
                    val = {},
                    k;

                for (k in vals) {
                    if (vals.hasOwnProperty(k)) {
                        switch (k) {
                            case "type":
                                val.type = vals.type || "COURSE";
                                break;

                            case "nm":
                            case "text":
                            case "title":
                                val.nm = vals.nm || vals.text || vals.title;
                                val.text = vals.nm || vals.text || vals.title;
                                val.title = vals.nm || vals.text || vals.title;
                                break;

                            case "selected":
                                val[k] = (vals[k] || this._cache.selected.names[vals.id]) ? " checked" : "";
                                break;
                            default:
                                val[k] = vals[k];
                        }
                    }
                }
                try { return val; } finally { val=null; }
            },

            // 格式化保存结果
            postFormater    : function(items) {
                var ids = [],
                    type,
                    i, len;
                for (i=0,len=items.length; i<len; i+=1) {
                    type = items[i].tp || "COURSE";
                    ids.push([type, items[i].id].join(":"));
                }
                return ids.join(",");
            },

            //
            itemDataFormater : function(items) {
                var nodeType = accSelector.getCurrent().container.data("options").nodeType,
                    node     = accSelector.getSelected() || {},
                    i, len;

                for (i=0,len=items.length; i<len; i+=1) {
                    switch (items[i].tp||nodeType) {

                        case "SUBJECT" :
                            items[i].tp = items[i].type||"SUBJECT";
                            items[i].nm = items[i].title;
                            delete items[i].rid;
                            delete items[i].rnm;
                        break;

                        //case "COURSE" :
                        default:
                            items[i].tp = items[i].type||"COURSE";
                            items[i].nm = items[i].title;
                        break;
                    }
                }

                return items;
            }
        });

        //
        options.orgSelectorOptions = $.extend({}, options.orgSelectorOptions, {
            autoSelect : false // 自动选中某个节点
        });

        dt = options.itemSelectorOptions.dataTemplate;

        options.orgSelectorOptions = $.extend(options.orgSelectorOptions||{}, {height:365});
        itemSelector = new tbc.itemSelector(options.itemSelectorOptions);
        accSelector  = new tbc.accordionSelector (options.orgSelectorOptions);

        itemSelector.prepend('<div class="tbc-itemSelector-header">' +
                        '<div class="padding">' +
                        '   <div class="abs_right">' +
                        '        <input type="text" value="'+ i18n('v4.js.enterCourseCodeOrTitle') +'" title="'+ i18n('v4.js.enterCourseCodeOrTitle') +'" class="tbc-inputer searchKeywords">' +
                        '        <select name="device" style="display:'+ (options.itemSelectorOptions.device!==false?'':'none') +';">' +
                        '            <option value="">'+ i18n('v4.js.allDevice') +'</option>' +
                        '            <option value="COMPUTER">PC</option>' +
                        '            <option value="IPHONE">iPhone</option>' +
                        '            <option value="IPAD">iPad</option>' +
                        '            <option value="ANDROIDPHONE">Android</option>' +
                        '            <option value="ANDROIDPAD">Android Pad</option>' +
                        '        </select>' +
                        '        <a class="tbc-button searchButton" type="button">'+ i18n('v4.js.filter') +'</a>' +
                        '    </div>' +
                        '</div>' +
                    '</div>');

        itemSelector.addEvent({
            "beforeSave" : function() { tbc.lock(SELF.ui); return false; },
            "afterSave"  : function() { tbc.unlock(SELF.ui); return false; }
        });

        // 筛选按钮
        itemSelector.ui.on('click', '.searchButton', function(event){
            var kwdInput = itemSelector.ui.find('input.searchKeywords'),
                keyword  = kwdInput.val(),
                device   = itemSelector.ui.find("select[name='device']").val();

            // 如果是默认值则删除关键字属性
            if ($.trim(keyword) !== kwdInput.attr('title')) {
                itemSelector._ajaxDataAvailable.keyword = keyword;
            } else {
                delete itemSelector._ajaxDataAvailable.keyword;
            }

            // 如果是不过滤适用设备, 则删除关键字属性
            if (options.itemSelectorOptions.device!==false) {
                itemSelector._ajaxDataAvailable.device = device;
            } else {
                delete itemSelector._ajaxDataAvailable.device;
            }

            itemSelector.pageAvailable(1);
        });

        itemSelector.ui.find("input.searchKeywords").bind({
            focus : function(event) {
                if ($.trim(this.value) === this.title) {
                    this.value = "";
                }
            },

            blur : function(event) {
                 if ($.trim(this.value)==="") {
                     this.value = this.title;
                 }
            }
        });

        SELF.extend({
            appendTo : function (box) {

            }
        });

        // 依赖
        itemSelector.depend(SELF);
        accSelector.depend(SELF);

        // 隐藏itemSelector的功能
        //$(itemSelector.part.operaAddCurrPage).hide();
        //$(itemSelector.part.operaRemoveCurrPage).hide();
        //$(itemSelector.part.operaRemoveCurrPage).hide();
        $(itemSelector.part.addAll).hide();


        if (options.itemSelectorOptions.deletable===false) {
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
                var opt = itm.container.data("options"),
                    treeId = itm.container.data("treeId"),
                    tree   = tbc.TASKS(treeId);

                if (tree && typeof tree.setCurrent === 'function') {
                    tree.setCurrent();
                }

            },
            "active"    : function(itm) {
                var opt = itm.container.data("options"),
                    treeId = itm.container.data("treeId"),
                    tree   = tbc.TASKS(treeId);

                if (tree && typeof tree.setCurrent === 'function') {
                    tree.setCurrent();
                }
            },

            'check' : function (list) {
                var nodeType = this.getCurrent().container.data("options").nodeType,
                    i, len,
                    icn, pro, data;

                for (i=0,len=list.length; i<len; i+=1) {
                    icn  = accSelector.includeChild ? i18n('v4.js.includeSubCls') : "";
                    pro  = list[i].property;
                    data = [{ id:pro.id, tp:pro.tp, nm:pro.nm||pro.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];

                    if (pro.id && !itemSelector._cache.available.names[pro.id]) {
                        itemSelector.addAvailableItem(data);
                    }
                }
            },

            'deselect' : function (list) {
                var i, len;
                for (i=0,len=list.length; i<len; i+=1) {
                    itemSelector.removeAvailableItem (list[i].property.id);
                }
            },

            "select" : function (selectedNode, b, c) {
                itemSelector._ajaxDataAvailable.nodeType=b;
                itemSelector._ajaxDataAvailable.nodeId=selectedNode.id;

                itemSelector.loadAvailableByPage(1);
            },

            "includechild" : function(include) {
                itemSelector._ajaxDataAvailable.includeChild = include;
            }
        });

        itemSelector.addEvent({
            "select"    : function (list) {
                var accItm = accSelector.getCurrent(),
                    opt    = accItm.container.data("options");
            },

            "beforeAvailableLoad" : function() {
                var accItm = accSelector.getCurrent(),
                    opt    = accItm.container.data("options");
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
                var arr;
                if ($.isFunction(itemSelector.getSelected)) {
                    arr = itemSelector.getSelected();
                } else {
                    var s = itemSelector._cache.selected.names,
                        arr = [],
                        k;
                    for (k in s) {
                        if (s.hasOwnProperty(k) && s[k]) {
                            arr.push(s[k]);
                        }
                    }
                }
                return arr;
            }
        });

        if (!options.verifyButton) {
            SELF.part.verify.hide();
        }

        if (!options.cancelButton) {
            SELF.part.cancel.hide();
        }

        // 确认按钮
        SELF.part.verify.click(function() {
            var selected = SELF.getSelected(),
                autoSave = options.itemSelectorOptions.autoSave,
                lazy    = options.itemSelectorOptions.lazy,
                data;

            if ((autoSave !== false) && lazy===true && options.lazyUrl) {
                data = options.itemSelectorOptions.post || {};
                data[options.itemSelectorOptions.postKey||"courseIds"] =  options.itemSelectorOptions.postFormater(selected);

                $.ajax({
                    url  : options.lazyUrl,
                    data : data,
                    type : "post",
                    dataType  : "json",
                    beforeSend: function() { tbc.lock(SELF.ui); },
                    complete  : function() { tbc.unlock(SELF.ui); },
                    success   : function() {
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

}(jQuery,tbc));
