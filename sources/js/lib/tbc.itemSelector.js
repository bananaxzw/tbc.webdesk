;(function(tbc, $){
    tbc.itemSelector = function (settings) {


        var  MSG  = {
            'group owner can not quit group': '群主不能退出群',
            'group admin can not quit group': '群管理员不能退出群',
            'only group validateIdentity in OPEN or VALIDATE can exist by yourself': '仅“开放”或“验证”群可自助退出'
        },
        SELF = tbc.self (this, arguments),

        defaults = {
            availableUrl   : null,            // "url or JSON", 可选项
            selectedUrl    : null,            // "URL or JSON", 已选项
            selectUrl      : null,            // 保存选中的项目
            deselectUrl    : null,            // 保存移除的项目
            selectAllUrl   : null,            // 选择所有
            deselectAllUrl : null,            // 取消所有已选的项
            itemTemplate   : null,
            selectedData   : null,      // 将此数据显示在已选栏类，如果是一串以逗号分隔的ID
                                        // 则须通过下面的地址转成对应的详细地址
            propertiesUrl  : null,     // 将一串ID转成对应的详细数据
            itemTemplateSelected    : null,
            dataTemplate   : {id:"userId", text:"employeeCode", depict:"userName", title:""},
            htmlFormater   : null,    // function() {},  // 格式化HTML
            resultFormater : null,    // function() {}, // 格式化选择结果
            max        : 0,                // 选择数量限制
            lazy       : false,        // 延迟保存; 默认 false
            postKey    : "userIds",
            autoSave   : true,            // 自动保存
            multiple   : true,                // 多选;默认:true
            dataType   : "json",            // [html,json,xml]
            cleanable  : true,                // 清除
            resettable : true,                // 可重置
            event      : {
                selected : function (id, text) {
                    // selected = [ {id:"id", text:"text"},... ]
                },

                unselected : function (id, text) {
                    // selected = [ {id:"id", text:"text"},... ]
                },

                complete : function (selected) {

                }
            }
        },
        options = tbc.extend({}, defaults, settings);

        options.autoSave = typeof(options.autoSave) === "undefined" ? true : options.autoSave;

        SELF.packageName="tbc.itemSelector";

        var ui = $('<div class="tbc-itemSelector '+ (!options.multiple?"tbc-itemSelector-single":"") +'"></div>')
            .html('<div class="tbc-itemSelector-panel availableBox">' +
                '        <div class="tbc-itemSelector-title">' +
                '            <span role="availTitle">待选</span> [<i class="" role="availNum">0</i>]' +
                '            <a role="addAll" class="tbc-button tbc-itemSelector-btnAddAll" type="button">添加全部</a>' +
                '        </div>' +
                '        <div role="availContainer" class="tbc-itemSelector-list"></div>' +
                '        <div role="availPagination" class="tbc-itemSelector-pagination">' +
                '            <div class="border">' +
                '                <select role="availPageSize" id="fromPageSize" name="fromPageSize" class="inputxt">' +
                '                    <option value="10">10</option>' +
                '                    <option value="20">20</option>' +
                '                    <option value="50">50</option>' +
                '                    <option value="100">100</option>' +
                '                    <option value="500">500</option>' +
                '                </select>' +
                '                <div class="abs_right">' +
                '                    <a  role="availPrevPage" href="javascript:void(0);" id="fromPrev" class="tbc-buttons prev"><i class="tbc-icon icon-arrow-left"></i></a>' +
                '                    <input role="availPageTyper" type="text" value="1" id="fromPageNO" name="fromPageNo" class="inputxt tbc-inputer" norender="true">' +
                '                    <i>/</i>' +
                '                    <span role="availPageTotal">1</span>' +
                '                    <a role="availNextPage" href="javascript:void(0);" class="tbc-buttons next"><i class="tbc-icon icon-arrow-right"></i></a>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '    <div role="operaList" class="tbc-itemSelector-panel tbc-itemSelector-operation">' +
                '        <button role="operaAddSelected" class="tbc-button normalBtn addSelected" type="button"><i class="tbc-icon icon-arrow-right"></i></button>' +
                '        <button role="operaRemoveSelected" class="tbc-button normalBtn removeSelected" type="button"><i class="tbc-icon icon-arrow-left"></i></button>' +
                '        <button role="operaAddCurrPage" class="tbc-button bigBtn addCurrPage" type="button"><i class="tbc-icon icon-arrow-dblright"></i></button>' +
                '        <button role="operaRemoveCurrPage" class="tbc-button bigBtn removeCurrPage" type="button"><i class="tbc-icon icon-arrow-dblleft"></i></button>' +
                '    </div>' +
                '    <div class="tbc-itemSelector-panel selectedBox">' +
                '        <div class="tbc-itemSelector-title">' +
                '            <span role="selectedTitle">已选</span> <span> [ <i class="" role="selectedNum">0</i><b role="maxSelected"></b> ]</span>' +
                '            <a role="removeAll" class="tbc-button tbc-itemSelector-btnRemoveAll">移除全部</a>' +
                '        </div>' +
                '        <div role="selectedContainer" class="tbc-itemSelector-list"><ul></ul></div>' +
                '        <div role="selectedPagination" class="tbc-itemSelector-pagination">' +
                '            <div class="border">' +
                '                <select role="selectedPageSize" name="toPageSize" class="inputxt">' +
                '                    <option value="10">10</option>' +
                '                    <option value="20">20</option>' +
                '                    <option value="50">50</option>' +
                '                    <option value="100">100</option>' +
                '                    <option value="500">500</option>' +
                '                </select>' +
                '                <div class="abs_right">' +
                '                    <a role="selectedPrevPage" href="javascript:void(0);" class="tbc-buttons prev"><i class="tbc-icon icon-arrow-left"></i></a>' +
                '                    <input role="selectedPageTyper" type="text" value="1" name="toPageNo" class="inputxt tbc-inputer" norender="true">' +
                '                    <i>/</i>' +
                '                    <span role="selectedPageTotal">1</span>' +
                '                    <a role="selectedNextPage" href="javascript:void(0);" class="tbc-buttons next"><i class="tbc-icon icon-arrow-right"></i></a>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>')
                .css({position:"relative",zIndex:1});
/*
        var head = '<div class="tbc-itemSelector-header">' +
                    '    <div class="_padding">' +
                    '        <select>' +
                    '            <option value="0">全部人员</option>' +
                    '        </select>' +
                    '        <div class="abs_right">' +
                    '            <input type="text" class="tbc-inputer" value="工号/姓名/用户名" />' +
                    '            <select>' +
                    '                <option value="0">待选人员</option>' +
                    '                <option value="0">已选人员</option>' +
                    '            </select>' +
                    '            <button type="submit" class="tbc-button">筛选</button>' +
                    '        </div>' +
                    '     </div>' +
                    '</div>';
*/


        SELF.extend ({
            ui    : ui,

            container:ui,

            init: function() {

                // ui part
                var part = this.part = {},
                    max = this.getMax();

                ui.find("[role]").each (function() {
                    var role = this.getAttribute("role");
                    part[role] = this;
                    role=null;
                });

                // 缓存
                this._cache = {
                    // 已选
                    selected : {
                        total : 0,
                        list  : [],
                        names : {},
                        page  : {
                            "page.pageSize" : 10,
                            "page.pageNo"   : 1,
                            totalPages      : 1,
                            total           : 0
                        },
                        selected: {}
                    },

                    // 可选
                    available : {
                        total : 0,
                        list  : [],
                        names : {},
                        page  : {
                            "page.pageSize" : 10,
                            "page.pageNo"   : 1,
                            totalPages      : 1,
                            total           : 0
                        }
                    }
                },

                // AJAX请求的附加数据
                this._ajaxDataAvailable = tbc.extend({}, this._cache.selected.page, {includeChild:true, keyword :"" });
                this._ajaxDataSelected = tbc.extend({}, this._cache.available.page, {keyword :""});

                if (max && !isNaN(max)) {

                    // 限制为1时,禁用选择当前页的按钮
                    if (max===1) {
                        $(part.operaAddCurrPage)
                        .attr("disabled", "disabled")
                        .addClass("tbc-button-disabled");
                    }

                    $(part.maxSelected).append('/<b title="最多只能选择'+ max +'项" style="font-weight:bold; color:red; cursor:default; text-decoration:underline;">'+ max +'</b>');
                }



                // 是否有分页条
                if (options.pagination===false) {
                    $(part.selectedPagination).hide();
                    $(part.availPagination).hide();
                    $(part.selectedContainer).css({height: 262+21 });
                    $(part.availContainer).css({height: 262+21 });
                } else {
                    $(part.selectedPagination).show();
                    $(part.availPagination).show();
                    $(part.selectedContainer).css({height:' ' });
                    $(part.availContainer).css({height:' ' });
                }

                // 已选数据
                if (!options.autoSave && typeof options.selectedData === 'string') {
                    var ids = options.selectedData.split(",");
                    if (ids.length>0) {
                        this.getPropertiesById(ids);
                    }
                } else if (!options.autoSave && $.isArray(options.selectedData)) {
                    setTimeout(function() {
                        this.setSelected(options.selectedData);
                    }.bind(this), 100);
                } else {
                    this.loadSelectedByPage(1);
                }

                if (options.autoSave===false || options.lazy===true) {
                    $(part.addAll).hide();
                }
            },

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

            /* 获取限制选择的数量 */
            getMax: function() {
                var max = options.max,
                    m = typeof max === 'function'
                    ? max()
                    : (!isNaN(max) ? max : 0);

                return m;
            },

            // 获取分页设置
            formatPage : function (elem) {
                /*
                <input type="hidden" name="totalPages" value="95"/>
                <input type="hidden" name="totalRecords" value="948"/>
                <input type="hidden" name="pageNo" value="1"/>
                <input type="hidden" name="pageSize" value="10"/>
                */
                var page = {};

                $("input[type='hidden']", elem).each(function() {
                    switch (this.name) {
                        case "totalPages":
                            page.totalPages = this.value||0;
                            break;
                        case "totalRecords":
                            page.totalRecords = this.value||0;
                            break;
                        case "pageNo" :
                            page["page.pageNo"] = this.value||0;
                            break;
                        case "pageSize":
                            page["page.pageSize"]=this.value||0;
                            break;
                    }
                });

                page.prev = Math.max(page["page.pageNo"]-=1, 1);
                page.next = Math.min(page["page.pageNo"]+=1, page.totalPages);

                try { return page; } finally { page=null; }
            },

            getPages : function(type) {
                var page = {},
                    part = this.part,
                    apage= this._cache.available.page||{},
                    spage= this._cache.selected||{};
                switch (type) {
                    case "available":
                        page["page.pageSize"] = apage["page.pageSize"] || part.availPageSize.value || 10;
                        page["page.pageNo"] = apage["page.pageNo"] || part.availPageTyper.value || 1;
                        page["totalPages"] = apage["totalPages"] || part.availPageTotal.value || 1;
                        page["total"] = apage["total"] || part.availNum.value || 0;
                        break;
                    case "selected":
                        page["page.pageSize"] = spage["page.pageSize"] || part.selectedPageSize.value || 10;
                        page["page.pageNo"] = spage["page.pageNo"] || part.selectedPageTyper.value || 1;
                        page["totalPages"] = spage["totalPages"] || part.selectedPageTotal.value || 1;
                        page["total"] = spage["total"] || part.selectedNum.value || 0;
                        break;
                }
                try { return page; } finally { page=null };
            },

            formatList     : function (elem) {

                var list    = [];
                if (elem && typeof elem === "object" && $.isFunction(elem.size)) {
                    $("li", elem).each(function() {
                        var li = {},
                            dt = options.dataTemplate,
                            id = $("input",this).val()||this.getAttribute("data-id")
                            ;

                        li[dt["id"]]    = $("input",this).val()||this.getAttribute("data-id");
                        li[dt["text"]]    = $("i", this).text()||$("span:first", this).text();
                        li[dt["depict"]]= $("span:last", this).text();
                        li[dt["title"]]    = this.getAttribute("title");

                        list.push(li);
                        li=null;
                    });
                } else if (elem) {
                    list = elem;
                }

                try { return list } finally { list=null; }
            },

            // 设置分页器
            setPagination : function (type, page) {

                var total = !page["total"] ? "0" : page["total"];

                switch (type) {
                    case "available" :
                        this.part.availPageTyper.value = page["page.pageNo"];
                        this.part.availPageTotal.innerHTML = page.totalPages;
                        $(this.part.availPageSize).val(page["page.pageSize"]);
                        $(this.part.availNum).html (total);

                        tbc.extend(this._cache.available.page, page);

                        break;

                    case "selected"    :
                        this.part.selectedPageTyper.value = page["page.pageNo"];
                        this.part.selectedPageTotal.innerHTML = page.totalPages;
                        $(this.part.selectedPageSize).val(page["page.pageSize"]);
                        $(this.part.selectedNum).html (total);
                        tbc.extend(this._cache.selected.page, page);
                        break;
                }
            },

            // 加载可选项
            loadAvailableByPage        : function (page) {
                var self = this;

                if (options.availableUrl && this.triggerEvent("beforeAvailableLoad") !== false)
                {
                    var lazy = (options.autoSave !== false&&options.lazy===true ? true : false)+"";
                        page = page || this.getPages("available")["page.PageNo"] || 1;

                    var a = this._ajaxDataAvailable,
                        b = this._cache.available.page;

                    page = Math.max(0, Math.min(this._cache.available.page.totalPages, page));

                    $.ajax ({
                        url         : options.availableUrl,
                        dataType    : options.dataType,
                        data        : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page, {"page.pageNo":page, lazy:lazy}),
                        type        : "post",
                        beforeSend  : function () {
                            self.triggerEvent("beforeAvailableLoad");
                        },
                        complete    : function () { },
                        error       : function (a, b, c) { },
                        success        : function (data) {

                            if (data && data.rows) {

                                if (options.itemDataFormater) {
                                    data.rows = options.itemDataFormater(data.rows);
                                }

                                $.each(data.rows, function() {
                                    !this.id && (this.id = this.userId);
                                    !this.text && (this.text = this.userName||this.nm);
                                    !this.nm && (this.nm = this.text);
                                    SELF._cache.available.names[ this[options.dataTemplate["id"]] ] = this;
                                });
                            }

                            var result = self.formatResult(data, options.itemTemplate);
                            self.updateAvailablePage(result);

                            self.triggerEvent("afterAvailableLoad");

                            self = result = page = null;
                        }
                    });
                }
            },

            // 加载已选项
            loadSelectedByPage : function (page) {
                var self = this;
                if (options.selectedUrl && options.autoSave && this.triggerEvent("beforeSelectedLoad") !== false)
                {
                    var lazy = (options.autoSave !== false&&options.lazy===true ? true : false)+"";

                    page = page || this.getPages("selected")["page.PageNo"] || 1;

                    $.ajax ({
                        url         : options.selectedUrl,
                        dataType    : options.dataType,
                        type        : "post",
                        data        : $.extend ({}, options.post, SELF._ajaxDataSelected, this._cache.selected.page, {"page.pageNo":page, lazy:lazy}),
                        beforeSend  : function () { },
                        complete    : function () { },
                        error       : function () {
                            var sbox = $(self.part.selectedContainer);
                            sbox.find("ul").size() === 0 && sbox.html("<ul></ul>");
                        },
                        success     : function (data) {

                            if (data && data.rows) {
                                if (options.itemDataFormater) {
                                    data.rows = options.itemDataFormater(data.rows);
                                }

                                // 清除已选的
                                for (var k in SELF._cache.selected.names) {
                                    delete SELF._cache.selected.names[k];
                                }

                                $.each(data.rows, function() {
                                    !this.id && (this.id = this.userId);
                                    !this.text && (this.text = this.userName);
                                    !this.nm && (this.nm = this.text);
                                    SELF._cache.selected.names[ this[options.dataTemplate["id"]] ] = this;
                                    //SELF._cache.selected.selected[this.userId] = true;
                                });
                            }

                            // 从返回结果获取分页设置;
                            var result = self.formatResult(data, options.itemTemplateSelected);
                            self.updateSelectedPage(result);
                            self._cache.selected.list = result.list;
                            result.list = null;
                            self = result = null;
                        }
                    });
                } else {
                    var sbox = $(self.part.selectedContainer);
                    sbox.find("ul").size() === 0 && sbox.html("<ul></ul>");
                }
            },

            // 更新待选栏
            updateAvailablePage : function (sets) {

                var cont = $(this.part.availContainer);

                cont.empty().append(sets.html);

                this.setPagination ("available", sets.page);

                // 如果不显示分页条, 则将其隐藏、增加待选栏高度
                if (options.pagination===false) {
                    $(this.part.availPagination).hide();
                    cont.css({height: 262+21 });
                    return this;
                }

                $(this.part.availPagination).show();
                cont.css({height:' '});

                this._cache.available.page = sets.page;
                this._cache.available.list = [].concat(sets.list);

                // 禁用或不禁用上一页按钮
                if (sets.page["page.pageNo"]<=1) {
                    $(this.part.availPrevPage).addClass("tbc-button-disabled");
                } else {
                    $(this.part.availPrevPage).removeClass("tbc-button-disabled");
                }

                // 禁用或不禁用下一页按钮
                if (sets.page["page.pageNo"]>=sets.page.totalPages) {
                    $(this.part.availNextPage).addClass("tbc-button-disabled");
                } else {
                    $(this.part.availNextPage).removeClass("tbc-button-disabled");
                }
            },

            // 更新已选栏
            updateSelectedPage : function (sets) {
                var cont = $(this.part.selectedContainer);
                cont.empty().append(sets.html);

                this.setPagination ("selected", sets.page);

                // 如果不显示分页条, 则将其隐藏、增加待选栏高度
                if (options.pagination===false) {
                    $(this.part.selectedPagination).hide();
                    cont.css({height: 262+21 });
                    return this;
                }

                $(this.part.selectedPagination).show();
                cont.css({height:' ' });

                this._cache.selected.page = sets.page;

                if (options.autoSave !== false) {
                //    this._cache.selected.list = [].concat(sets.list);
                }

                // 禁用或不禁用上一页按钮
                if (sets.page["page.pageNo"]<=1) {
                    $(this.part.selectedPrevPage).addClass("tbc-button-disabled");
                } else {
                    $(this.part.selectedPrevPage).removeClass("tbc-button-disabled");
                }

                // 禁用或不禁用下一页按钮
                if (sets.page["page.pageNo"]>=sets.page.totalPages) {
                    $(this.part.selectedNextPage).addClass("tbc-button-disabled");
                } else {
                    $(this.part.selectedNextPage).removeClass("tbc-button-disabled");
                }
            },

            // 分页(数据分页或者从服务器加载某一页)
            pageAvailable : function () {
                this.loadAvailableByPage.apply(this, arguments);
            },

            pageSelected : function (page) {
                var page    = page || SELF._cache.selected.page["page.pageNo"],
                    total    = SELF._cache.selected.page.totalPages;
                    page    = Math.max(1, Math.min(total, page));

                if (options.autoSave===false || options.lazy===true) {
                //if ((options.autoSave===false && options.selectedData) || (options.autoSave !== false&&options.lazy===true)) {
                    //if (options.selectedData)
                    this.sliceSelectedByPage.apply(this, arguments);
                } else {
                    this.loadSelectedByPage (page);
                }
            },

            sliceSelectedByPage : function(page) {
                var p = page || this._cache.selected.page["page.pageNo"],
                    t = this._cache.selected.page.totalPages,
                    ps= this._cache.selected.page["page.pageSize"],
                    s = this.sliceListByPage (this._cache.selected.list, Math.max(1, Math.min(t, p)), ps||10),
                    r = this.formatResult(s, options.itemTemplateSelected);

                this.updateSelectedPage (r);
            },

            sliceListByPage : function (list, page, pageSize) {

                /*
                 {"id":null,"first":1,"total":0,"rows":[],"pageNo":1,"pageSize":10,"autoCount":true,"totalPages":0,"hasNext":false,"nextPage":1,"hasPre":false,"prePage":1,"sortName":null,"sortOrder":null,"autoPaging":true}
                 */
                pageSize = options.pagination!==false ? pageSize||10 : list.length;

                var count   = list.length,
                    totalPages = Math.floor(count/pageSize) + (count%pageSize>0?1:0),
                    start   = Math.max(0, (page-1)*pageSize),
                    end     = Math.min(count, (page*pageSize)),
                    rows    = list.slice(start, end),
                    hasNext = start !== 0,
                    hasPrev = end !== count;

                return {
                    totalRecords : count,
                    totalPages   : totalPages,
                    total        : list.length,
                    rows         : rows,
                    "pageSize"   : pageSize,
                    "pageNo"     : page
                }
            },

            formatResult    : function (data, template) {

                var rs = {
                    html : "<ul></ul>",
                    page : {"page.pageSize":10, "page.pageNo":1, "totalPages":0, "total":0},
                    list : []
                };
                if (data) {

                    options.dataType = typeof options.dataType === "string" ? options.dataType.toLowerCase() : options.dataType;

                    var type = (options.dataType === "html"||options.dataType === "text") && (typeof data === "string"||data.jQuery)
                        ? "html"
                        : (options.dataType === "json"||typeof data === "object")
                            ? "json" : (options.dataType === "xml")
                                ? "xml" : options.dataType;

                    switch (type) {
                        case "html":
                            var ele = $("<div/>").html(data);
                            rs.html = $(data);
                            rs.page = this.formatPage(ele);
                            rs.list = this.formatList(ele);
                            ele.remove();
                            ele = null;
                            break;
                        case "json":
                            var _list = data.rows
                                ? (data.rows.length>data.pageSize && options.pagination!==false)
                                    ? this.sliceListByPage(data.rows, data.pageNo, data.pageSize).rows
                                    : data.rows
                                : null;

                            rs.html = _list ? this.createHtmlByJSON(_list, template) : "";
                            rs.page    = {
                                "page.pageSize": options.pagination!==false ? data.pageSize : data.total,
                                "page.pageNo"  : data.pageNo || 0,
                                "totalPages"   : data.totalPages || 0,
                                "total"        : data.total || 0
                            };

                            rs.list = data.rows || this.formatList(rs.html);

                            break;
                    }
                }
                try { return rs; } finally { rs=null; }
            },

            // 把JSON数据转换成HTML代码
            createHtmlByJSON : function (json, itemTemplate) {
                if (!json) {
                    return "";
                }

                var list = $("<ul/>"),
                    arr  = tbc.isArray(json) ? json : json.list || [],
                    len  = arr.length,
                    model= itemTemplate || options.itemTemplate || '<li data-id="{userId}" class="{selected} {checked}" title="{userName}"><i>{employeeCode}</i><span>{userName}</span></li>',
                    html = [],
                    itemData;

                for (var i=0; i<len; i++) {
                    itemData = options.vauleSetFormater ? options.vauleSetFormater.call(this, arr[i]) : arr[i];
                    html.push(tbc.stringTemplate(model, itemData, options.textTransform));
                }
                list.html(html.join(""));

                try { return list; } finally { list=arr=len=model=html=null; }
            },

            // 把XML数据转换成HTML代码(未实现)
            createHtmlByXML : function (xml) {},

            /*
             *
             */
            getAvailablePage : function() {
                return this._cahce.available.page;
            },

            /*
             * 把节点移动到已选栏
             * @param    : items; 准备移动的节点
             */
            selectItems : function (items) {

                var s = $(items);

                items = $(items).filter(function() {
                    var id = this.getAttribute("data-id"),
                        exist = $(SELF.part.selectedContainer).find("li[data-id='"+id+"']").size()>0;
                    return !exist;
                })
                .addClass("checked");

                SELF.setNextSelected (items);
                items.clone().prependTo($("ul", SELF.part.selectedContainer));
                //items.clone().removeClass("checked").prependTo($("ul", SELF.part.selectedContainer));

            },

            saveSelected : function (ids, callback) {
                if (options.autoSave !== false && options.lazy !== true && ids.length>0) {
                    var data = options.post || {},
                        result;

                    if (options.postFormater) {
                        result = options.postFormater(ids);
                        data[options.postKey] = result;
                    } else {
                        var _ids = [];
                        for (var i=0,len=ids.length; i<len; i++) {
                            _ids.push(ids[i][options.dataTemplate["id"]]);
                        }
                        data[options.postKey] = _ids.join(",");
                    }

                    $.ajax ({
                        url     : options.addUrl || options.selectUrl,
                        type    : "post",
                        data    : data,
                        dataType: "json",
                        beforeSend:function() {
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete: function() {
                            tbc.unlock(SELF.ui);
                            if ($.isFunction(callback)) {
                                callback.call(SELF);
                            }
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true &&  result.message) {
                                var msg = MSG[result.message] || result.message;
                                alert(msg);
                            }
                        }
                    });
                    data = null;
                } else {
                    SELF.pageAvailable();
                    SELF.pageSelected();
                }
            },


            /*
             * 把节点从已选栏移除
             * @param    : items; HTMLElement/jQuery()
             */
            deselectItems : function (items) {
                items = $(items);
                SELF.setNextSelected (items);
                items.remove();;
            },

            saveDeselected : function (ids, callback) {
                if (options.autoSave && !options.lazy && ids.length>0) {

                    var data = options.post || {},
                        result;

                    if (options.postFormater) {
                        result = options.postFormater(ids);
                        data[options.postKey] = result;
                    } else {
                        var _ids = [];
                        for (var i=0,len=ids.length; i<len; i++) {
                            _ids.push(ids[i][options.dataTemplate["id"]]);
                        }
                        data[options.postKey] = _ids.join(",");
                    }

                    $.ajax({
                        url        : options.removeUrl || options.deselectUrl,
                        type       : "post",
                        data       : data,
                        dataType   : "json",
                        beforeSend : function() {
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete    : function() {
                            tbc.unlock (SELF.ui);
                            if ($.isFunction(callback)) {
                                callback.call(SELF);
                            }
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true &&  result.message) {
                                var msg = MSG[result.message] || result.message;
                                alert(msg);
                            }
                        }
                    });
                    data = null;
                } else {
                    SELF.pageSelected();
                    SELF.pageAvailable();
                }
            },

            // 单选时,移动一个之后,自动选中后面或者前面的相邻节点
            setNextSelected : function (items) {
                if (items.size() === 1) {
                    var next = items.next();
                        next.size()
                        ? next.addClass("selected")
                        : items.prev().addClass("selected");
                    next=null;
                }
            },

            // 检查选择
            checkSelect : function (items, goNextPage) {
                if (items.length === 0) return false;

                var max = this.getMax();

                if (max && !isNaN(max)) {

                    if (this._cache.selected.page.total >= max) {
                        alert("您最多只能选择"+ max +"条.");
                        return false;
                    }

                    var len = items.length,
                        al    = 0;
                    if (this._cache.selected.page.total+len > max) {
                        al = max - this._cache.selected.page.total;
                        items = items.slice(0, al);
                        alert("数量已经超过限制, 仅前面的"+ al +"个被添加到了已选栏.");
                    }
                }

                var list    = this.getAvailableItems(items),
                    self    = this;

                if (options.itemDataFormater) {
                    list = options.itemDataFormater(list);
                }

                var page = this._cache.available.page["page.pageNo"];
                    page+= (goNextPage ? 1 : 0);

                this.selectItems(items);
                this.selectToCache(list);
                this.saveSelected(list, function() {
                    this.pageAvailable(page);
                    this.pageSelected(page);
                });
                list.length = 0;
                list = items = self = null;
            },

            // 检查移除
            checkDeselect : function (items, noRefresh) {

                if (items.length === 0) { return false; }

                var list    = this.getSelectedItems(items),
                    self    = this;

                this.deselectToCache(list);
                this.deselectItems(items);
                this.saveDeselected(list, function() {
                    this.pageAvailable();
                    this.pageSelected();
                });
                list.length = 0;
                list = items = self = null;
            },

            selectAll    : function () {
                if (options.autoSave !== false && options.lazy !== true) {
                    $.ajax({
                        url        : options.selectAllUrl,
                        type       : "post",
                        dataType   : "json",
                        data       : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page),
                        beforeSend : function() {
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete    : function() {
                            tbc.unlock (SELF.ui);
                            SELF.pageSelected();
                            SELF.pageAvailable();
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true &&  result.message) {
                                var msg = MSG[result.message] || result.message;
                                alert(msg);
                            }
                        }
                    });
                } else {
                    this.pageSelected();
                    this.pageAvailable();
                }
            },

            removeAll    : function () {

                this._cache.selected.list.length = 0;
                this._cache.selected.names = {};

                if (options.autoSave !== false && options.lazy !== true) {
                    $.ajax({
                        url        : options.deselectAllUrl,
                        type       : "post",
                        dataType   : "json",
                        data       : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page),
                        beforeSend : function() {
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete   : function() {
                            tbc.unlock(SELF.ui);
                            SELF.pageSelected(1);
                            SELF.pageAvailable(1);
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true && result.message) {
                                var msg = MSG[result.message] || result.message;
                                alert(msg);
                            }
                        }
                    });
                } else {
                    this.pageSelected(1);
                    this.pageAvailable(1);
                }
            },

            selectCurrentPage    : function () {
                var li = $("li", this.part.availContainer).not(".checked");
                this.checkSelect(li, "goNextPage");
                li = null;
            },

            deselectCurrentPage    : function (noFlush) {
                var li = $("li", this.part.selectedContainer);
                this.checkDeselect(li, noFlush);
                li = null;
            },

            getSelectedItems : function (items) {
                var arr = [];
                $(items).each(function() {
                    var id    = this.getAttribute("data-id"),
                        slc    = SELF._cache.selected.names[id];
                    slc && arr.push(slc);
                });
                try { return arr; } finally { arr=null; }
            },

            getAvailableItems : function (items) {
                var arr = [];
                $(items).each(function() {
                    var id    = this.getAttribute("data-id"),
                        avl    = SELF._cache.available.names[id];
                    if (avl) {
                        arr.push (avl);
                    }
                });
                try { return arr; } finally { arr=null; }
            },

            selectChecked    : function () {

                var li = $("li.selected", this.part.availContainer).not(".checked");
                this.checkSelect(li);
                li = null;
            },

            addAvailableItem : function (data, clear) {

                var html = this.createHtmlByJSON(data).find("li").addClass("selected"),
                    ul = $(this.part.availContainer).children("ul");

                if (clear) {
                    ul.empty();
                }

                ul = ul.size() !== 0 ? ul : $("<ul/>").appendTo(this.part.availContainer);
                ul.append(html);
                this.deselectToCache(data);
            },

            removeAvailableItem : function (id) {
                $(this.part.availContainer).find("li[data-id='"+ id +"']").remove();
                delete this._cache.available.names[id];
            },

            clearAvailable : function () {
                $(this.part.availContainer).children("ul").empty();
                var a = this._cache.selected.names[id];
                for (var k in a) {
                    delete a[k];
                }
                a=null;
                this._cache.selected.list.length = 0;
            },

            deselectChecked    : function () {

                var li = $("li.selected", this.part.selectedContainer);
                this.checkDeselect(li);
                li = null;
            },

            selectToCache : function(items) {
                var self = this,
                    actual = [];
                $.each (items, function(i, o) {
                    if (o) {
                        var id = this[options.dataTemplate["id"]];
                        if (!self._cache.selected.names[id]) {
                            self._cache.selected.names[id] = this;
                            self._cache.selected.list.push(this);
                            actual.push(this);
                        }
                        delete self._cache.available.names[id];
                    }
                });

                this.triggerEvent ("select", actual);
                actual = self = null;
            },

            deselectToCache : function(items) {
                var self = this,
                    i;
                $.each(items, function() {
                    var id = this[options.dataTemplate["id"]];
                    if (!self._cache.available.names[id]) {
                        self._cache.available.names[id] = this;
                        self._cache.available.list.push(this);
                    }
                    delete self._cache.selected.names[id];
                    $(self.part.availContainer).find("li[data-id='"+ id +"']").removeClass("checked");
                });

                self._cache.selected.list.length = 0;
                for (var k in self._cache.selected.names) {
                    i++;
                    self._cache.selected.list.push(self._cache.selected.names[k]);
                    if (i>5000) {
                        tbc.lock(SELF.ui);
                    }
                }
                tbc.unlock(SELF.ui);

                this.triggerEvent ("deselect", items);
                self = null;
            },

            getPropertiesById : function(ids) {
                var self = this;
                var data = options.post || {};
                    data[options.postKey] = ids.join(",");

                $.ajax({
                    url      : options.propertiesUrl,
                    type     : "post",
                    dataType : "json",
                    data     : data,
                    success  : function(json) {
                        if (json) {
                            self.setSelected(json);
                        }
                    }
                });
            },

            /**
             * 设置已选项的值
             */
            setSelected : function(json) {
                var self = this;

                if (json && $.isArray(json) && json.length>0) {
                    tbc.lock(self.ui);
                    self._cache.selected.list = self._cache.selected.list||[];

                    tbc.batch(json, 10000, 0, 0, function(list) {
                        var id,
                            items;
                        for (var i=0,len=list.length; i<len; i++) {
                            id = list[i][options.dataTemplate["id"]];
                            items = self._cache.selected.names[ id ];
                            if (!items) {
                                self._cache.selected.names[ id ] = list[i];
                                self._cache.selected.list.push(list[i]);
                            }
                            self._cache.selected.names[ id ].selected = true;
                        }
                    }, function() {
                        tbc.unlock(self.ui);
                        var s = self.sliceListByPage (self._cache.selected.list, 1, 10),
                            r = self.formatResult(s, options.itemTemplateSelected);

                        $(self.part.selectedContainer).empty().append(r.html);
                        self.setPagination ("selected", r.page);
                    });
                }
            },

            /**
             * 获取选中的项目
             * @return {Array}
             */
            getSelected : function() {
                var selected = this._cache.selected.names,
                    arr = [],
                    k;
                for (k in selected) {
                    if (selected.hasOwnProperty(k) && selected[k]) {
                        arr.push(selected[k]);
                    }
                }
                return arr;
            },

            /**
             * 初始化交互事件
             * @method initEvent
             */
            initEvent : function() {
                var SELF = this,
                    part = this.part;

                $ (part.availContainer).add(part.selectedContainer)
                .delegate("li", "click", function (event) {
                    var li = $(this);

                    if (event.shiftKey) {
                        var shiftStart;
                        li.siblings().add(li).each(function() {

                            if (shiftStart) {
                                $(this).addClass("selected");
                            } else {
                                $(this).removeClass("selected");
                            }

                            if (this === li[0] || $(this).hasClass("lastClicked")) {
                                shiftStart = !shiftStart;
                                $(this).addClass("selected");
                            }

                        });

                    } else {
                        li.addClass("lastClicked").siblings().removeClass("lastClicked");

                        if (event.ctrlKey && options.multiple && SELF.getMax() !== 1) {
                            li.hasClass("selected")
                            ? li.removeClass("selected")
                            : li.addClass("selected");
                        } else {
                            li.addClass("selected").siblings().removeClass("selected");
                        }
                    }
                })
                .delegate("li", "dblclick", function (event) {
                    if (!event.shiftKey && !event.ctrlKey) {
                        var li = $(this);
                        li.addClass("selected").siblings('li').removeClass('selected');
                        SELF.selectChecked();
                    }
                });

                $ (part.availContainer).add(part.selectedContainer)
                .delegate("li", "dblclick", function (event) {

                });

                $(part.operaAddCurrPage).click(function(event) { SELF.selectCurrentPage(); });

                $(part.operaRemoveCurrPage).click(function(event) { SELF.deselectCurrentPage(); });

                $(part.operaAddSelected).click(function(event) { SELF.selectChecked(); });

                $(part.operaRemoveSelected).click(function(event) { SELF.deselectChecked();  });

                $(part.availPageTyper).keyup(function(event) {
                    if (!this.value.match(/^\d+$/)) {}
                    if (event.keyCode === 13) {
                        var page = parseInt(this.value);
                        SELF.pageAvailable(page);
                    }
                });
                $(part.selectedPageTyper).keyup(function(event) {
                    if (!this.value.match(/^\d+$/)) {}
                    if (event.keyCode === 13) {
                        var page = parseInt(this.value);
                        SELF.pageSelected(page);
                    }
                });

                $(part.availPageSize).change(function(event) {
                    SELF._cache.available.page["page.pageSize"] = this.value;
                    SELF.pageAvailable();
                });

                $(part.selectedPageSize).change(function(event) {
                    SELF._cache.selected.page["page.pageSize"] = this.value;
                    SELF.pageSelected();
                });

                $(part.availPrevPage).click(function(event) {
                    var p = SELF._cache.available.page["page.pageNo"]-1;
                    SELF.pageAvailable(p);

                });

                $(part.availNextPage).click(function(event) {

                    var p = SELF._cache.available.page["page.pageNo"]+1;
                    SELF.pageAvailable(p);
                });

                $(part.selectedPrevPage).click(function(event) {

                    var p = SELF._cache.selected.page["page.pageNo"]-1;
                    return SELF.pageSelected(p);
                });

                $(part.selectedNextPage).click(function(event) {

                    var p = SELF._cache.selected.page["page.pageNo"]+1;
                    return SELF.pageSelected(p);
                });

                $(part.addAll).click(function(event) {
                    SELF.selectAll();
                });

                $(part.removeAll).click(function(event) {
                    SELF.removeAll();
                });
            }
        });

        SELF.init();
        SELF.loadAvailableByPage(1);
        SELF.initEvent();

    };
}(tbc, jQuery));
