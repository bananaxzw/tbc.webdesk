/**
 * @class tbc.Tree
 * @constructor
 * @author mail@luozhihua.com
 *
 * @param {Object} settings 配置项
 *
 * @param {Number} [settings.width='auto'] 宽度
 * @param {Number} [settings.height='auto'] 高度
 * @param {jQuery Selector|jQuery Object|Element} settings.container 从第几级开始不自动渲染
 * @param {String} [settings.dataType='ajax'] 设置数据来源，ajax或json,
 *                                            当dataType==ajax时，settings.url为必须项；
 *                                            当dataType==json时，settings.data为必须项；
 * @param {String} settings.url 加载数据的URL
 * @param {JSON} settings.data 用于渲染树的JSON数据对象
 * @param {Number} [settings.lazyLevel=4] 从第几级开始不自动渲染
 * @param {Boolean} [settings.checkbox=false] 是否显示复选框
 * @param {Boolean} [settings.cascadeCheck=true] 勾选一个节点后，是否自动勾选其子节点
 * @param {Boolean} [settings.singleCheck=true] 勾选一个节点后，是否取消勾选其他所有节点；
 *                                              如果cascadeCheck==true，则不会取消其子节点
 * @param {Boolean} [settings.cascadeSelect=false] 选中一个节点后，是否自动选中其子节点
 * @param {Boolean} [settings.multipleSelect=false] 是否允许选中多个；如果cascadeSelect==true，
 *                                                  则无论是否允许多选都会选中其所有子节点。
 * @param {Boolean} [settings.filterVisible=true] 是否显示筛选框，默认显示
 * @example
 * var orgTree = new tbc.Tree({url:‘url/of/tree-data.json’});
 *
 */

/*global tbc:true*/

;(function($){

    "use strict";

    window.tbc = tbc || {};

    tbc.Tree = function(settings) {

        // 默认配置
        var SELF = tbc.self(this, arguments),
            defaults = {
                width       : 'auto',
                height      : 'auto',
                cssClass    : 'tbc-tree',
                dataType    : 'ajax',
                container   : '',
                url         : null,
                data        : null,
                lazyLevel   : 4,
                selected    : '',
                checkbox       : false,
                cascadeCheck   : true,
                singleCheck    : true,
                cascadeSelect  : false,
                multipleSelect : false,
                filterVisible  : true,
                filterEmptyText: "没有找到<b>{keyword}</b>相关的内容",

                formatExtool: function() {},
                isRetracted : true
                // selectRule : "ALL", //

                /*
                onLoad      : function() {},
                onCheck     : function() {},
                onSelect    : function() {},
                onDelete    : function() {},

                event : {
                      'addNode'      : function(opt) { } // opt={id:newNodeId, pr:parentNodeId, nm:nodeName, sg:before}
                    , 'deleteNode'   : function(node, parents) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode}; parents=[parentsId,...]
                    , 'fold'         : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'unfold'       : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'check'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'uncheck'      : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'select'       : function(node, HTMLElement_Of_Node, child) {}

                    , 'beforeLoad'   : function() {}
                    , 'afterLoad'    : function() {}
                    , 'error'        : function() {}
                    , 'beforeRender' : function() {}
                    , 'afterRender'  : function() {}
                }
                */
            },

            // 选项
            options = $.extend({}, defaults, settings);

        options.container = options.ui ? $(options.ui).find(options.container) : $(options.container);
        options.ui        = options.ui ? $(options.ui) : options.container;

        options.ui[0].onselectstart = function() {
            return false;
        };

        SELF.addEvent(options.event);
        SELF.addEvent({
            'afterRender' : function() {
                if ($.isFunction(options.onLoad)) {
                    options.onLoad.apply(this, arguments);
                }

                // 默认选中的节点
                if (options.selected) {
                    this.setCurrent(options.selected, false);
                }
            },
            'select' : function() {
                if ($.isFunction(options.onSelect)) {
                    options.onSelect.apply(this, arguments);
                }
            },
            'deleteNode' : function() {
                if ($.isFunction(options.onDelete)) {
                    options.onDelete.apply(this, arguments);
                }
            },
            'check' : function() {
                if ($.isFunction(options.onCheck)) {
                    options.onCheck.apply(this, arguments);
                }
            },
            'move' : function() {
                if ($.isFunction(options.onMove)) {
                    options.onMove.apply(this, arguments);
                }
            },
            'addNode' : function() {
                if ($.isFunction(options.onAdd)) {
                    options.onAdd.apply(this, arguments);
                }
            }
        });

        SELF.packageName = "tbc.Tree";
        SELF.extend ({

            ui        : options.ui,
            container : options.container,
            appendTo  : function(box) {
                if ($(box).size()) {
                    this.container.appendTo(box);
                }
            },

            data    : null,

            // 初始化
            init    : function () {
                switch (options.dataType) {
                    case "json" :
                        this.render(options.data);
                        break;

                    case "ajax" :
                        this.load();
                        break;

                    default:
                        this.load();
                        break;
                }
            },

            /**
             * 增加筛选输入框
             * @method appendFilter
             */
            appendFilter : function() {

                var tree = this,
                    keyupTimeout,
                    filter = $('<div class="tbc-tree-filter">'+
                    '   <div class="s-wrapper">' +
                    '       <input class="tbc-tree-keyword" type="search" title="输入关键字，按回车键筛选." />' +
                    '       <input class="tbc-tree-search" type="button" value="筛选" title="筛选." />' +
                    '       <input class="tbc-tree-clear" type="button" value="X" title="退出筛选模式" />' +
                    '   </div>' +
                    '</div>' +
                    '<div class="tbc-tree-filter-place"><div class="tbc-tree-empty"></div></div>'
                    );

                this.filterBar = filter;

                filter
                .prependTo(this.container.children('.tbc-tree'))
                .on('click', '.tbc-tree-search', function() {
                    var $this = $(this).siblings('.tbc-tree-keyword'),
                        keyword = $.trim($this.val()),
                        title = $.trim($this.attr('title'));

                    if(keyword !== '' && keyword !==title) {
                        tree.filter(keyword);
                    }
                })
                .on('click', '.tbc-tree-clear', function() {
                    $(this).hide()
                    .siblings('.tbc-tree-keyword').val('').trigger('blur');
                    tree.cancelFilter();
                })

                .find('input')
                .on('focus', null, function() {
                    var title = $.trim(this.title),
                        val = $.trim(this.value);
                    if (title === val) {
                        this.value = '';
                    }
                })
                .on('blur', null, function() {
                    var title = $.trim(this.title),
                        val = $.trim(this.value);
                    if ('' === val) {
                        this.value = title;
                    }
                })
                .on('keyup', null, function(event) {
                    var $this = $(this),
                        xx = $this.siblings('.tbc-tree-clear'),
                        title = $.trim(this.title),
                        val = $.trim(this.value),
                        lastValue = this.getAttribute('data-last');

                    if (val !== '') {
                        xx.show();
                    } else {
                        xx.hide();
                    }

                    clearTimeout(keyupTimeout);

                    if ('' !== val && val !== title) {

                        if (lastValue && lastValue !== val) {
                            keyupTimeout = setTimeout(function() {
                                tree.filter(val);
                            }, 400);
                        }

                        if (event.keyCode === 13) {
                            tree.filter(val);
                        }
                    }

                    if (val === '' && (lastValue && lastValue !== '')) {
                        tree.cancelFilter();
                    }

                    this.setAttribute('data-last', val);
                })
                .trigger('focus');

                if (!options.filterVisible) {
                    filter.hide();
                }
            },

            load    : function () {


                var url = options.url.replace(/\=$/, '');
                    url = url + (url.indexOf('?')===-1 ? '?_=' : '&_=') + (+new Date());
                var ah = $.ajax({
                    url        : url,
                    type       : options.param ? "post" : "get",
                    data       : $.extend({}, options.param, {noDepPath:options.noDepPath}),
                    dataType   : "json",
                    cache      : false,
                    beforeSend : function () { SELF.triggerEvent("beforeLoad"); },
                    complete   : function () { SELF.triggerEvent("afterLoad"); },
                    error      : function () { SELF.triggerEvent("error", "loading failed!"); },
                    success    : function (json) { SELF.render(json); }
                });

                this.addEvent({
                    "destroy" : function() {
                        if (ah.abort) {
                            ah.abort();
                        }
                        ah = null;
                    }
                });
            },

            /**
             * 树节点容器
             * @type {Element|jQuery Object}
             */
            treeContainer: null,

            /**
             * 渲染tree
             * @method render
             * @param  {Object} data 数据
             */
            render    : function (data) {
                this.triggerEvent("beforeRender");
                var st = new Date().getTime(),
                    tree = $('<div class="tbc-tree"><div class="tbc-tree-container"></div></div>'),
                    box  = tree.children('.tbc-tree-container'),
                    height = this.container.height() - 42;

                this.treeContainer = box;
                tree.addClass(options.cssClass);
                if (options.filterVisible) {
                    tree.addClass('tbc-tree-hasfilter');
                }

                this.container.append(tree);
                box.html(this.createChild(data));

                if (height>42) {
                    box.height(height);
                }

                //window.console && console.log(">tbc.Tree> render time: "+ (new Date().getTime()-st) + "ms");
                this.addHtmlCache();
                //window.console && console.log(">tbc.Tree> cache time: "+ (new Date().getTime()-st) + "ms");

                this.appendFilter();

                this.triggerEvent("afterRender");
            },

            resize: function(height) {
                if (height && !isNaN(height)) {
                    this.ui.height(height);
                }
                this.trigger('resize', height);
            },

            renderNode : function(id, keyword) {
                var node   = this.cache(id),
                    property= node.property,
                    child   = property.sn || property.children,
                    level, html, li, childNodes;

                // 如果没有渲染,则渲染子节点
                if (property && child && !node.rendered) {
                    level = parseInt(node.level, 10) + 1;
                    html  = this.createChild(child, level, node.parents.concat([id]));

                    node.rendered = true;
                    this.cache(id, "rendered", true);

                    li = $(node.html.parentNode).append(html);
                    childNodes = li.find("dt.stree-node");

                    // 缓存新渲染的tree节点
                    this.addHtmlCache(childNodes);
                    this.triggerEvent("itemRender", child);
                }

                node = property = child = childNodes = level = html = null;
            },

            /**
             * 筛选节点
             * @method filter
             * @param  {String} keyword 关键字
             * @async
             */
            filter: function(keyword) {
                var that  = this,
                    ids   = {},
                    list  = this._cacheIndex,
                    cache = this._cacheData;

                this.cancelFilter();

                tbc.lock(this.container);
                tbc.batch(list, 1000, 0, 10, function (portion, isEnd, current) {
                    var i, len = portion.length,
                        node,
                        parents,
                        parent,
                        prop, text, id,
                        j, l;

                    for (i=0; i<len; i++) {
                        node = cache[portion[i]];
                        prop = node.property;
                        text = prop.text || prop.nm;
                        id = prop.id;
                        parents = node.parents;

                        // 如果含有关键字，则记录此节点的ID, true表示含有关键字
                        // 的节点，false表示不含关键字，但是必须关联显示的节点；
                        if (typeof text === 'string' && text.indexOf(keyword) !== -1) {
                            ids[id] = true;
                            node.matched = true;

                            // 记录其所有父级节点ID: 因为子节点含有关键字时，父
                            // 节点必须显示才可以显示子节点
                            for (j=0, l=parents.length; j<l; j++) {
                                parent = parents[j];
                                ids[parent] = ids[parent] || false;
                            }
                        }
                    }

                    if (isEnd) {
                        that.filterResult = ids;
                        that.mode = 'filter';
                        that.keyword = keyword;
                        that.highLightKeyWord(ids, keyword);
                        tbc.unlock(that.container);
                    }
                });
            },

            /**
             * 高亮匹配到的树节点
             * @method highLightKeyWord
             * @param  {Object} list    已经匹配到的树节点列表
             * @param  {String} keyword 关键词
             *
             */
            highLightKeyWord : function(list, keyword) {
                var length = 0,
                    cache = this._cacheData,
                    nodeElem,
                    textElem, text,
                    k;

                for (k in list) {
                    if (list.hasOwnProperty(k)) {
                        length+=1;
                        nodeElem = $(cache[k].html);
                        if (list[k] === true) {
                            textElem = nodeElem.children('.stree-text');
                            text = textElem.text().replace(keyword, '<strong class="keyword">'+ keyword +'</strong>');
                            textElem.html(text);
                            nodeElem.addClass('matched-keyword');
                        }
                        nodeElem.addClass('matched');
                        nodeElem.parents('ul:first').addClass('matched-parent');
                    }
                }

                if (length === 0) {
                    this.container.find('.tbc-tree-filter-empty');
                }

                this.container.children('.tbc-tree').addClass('tbc-tree-filter-mode');
            },

            /**
             * 退出筛选模式
             * @method cancelFilter
             */
            cancelFilter : function() {
                var list = this.filterResult,
                    cache = this._cacheData,
                    nodeElem,
                    textElem, text,
                    k;

                for (k in list) {
                    if (list.hasOwnProperty(k)) {
                        delete cache[k].match;
                        nodeElem = $(cache[k].html);
                        textElem = nodeElem.children('.stree-text');
                        textElem.html(textElem.text());
                        nodeElem.removeClass('matched matched-keyword');
                        nodeElem.parents('ul.matched-parent').removeClass('matched-parent');
                    }
                }

                this.filterResult = [];
                this.container.children('.tbc-tree').removeClass('tbc-tree-filter-mode');
                this.mode = 'normal';
                this.keyword = '';
            },

            /**
             * 更新HTML缓存
             * @param {Element} html tree节点的HTML Element
             */
            addHtmlCache : function (html) {
                html = html ? $(html) : this.container.find("dt.stree-node");

                var self = this;

                $(html).each(function() {
                    var id = this.getAttribute("data-id");
                    self.cache(id, "html", this);
                });
                self = html = null;
            },

            /*
             * 缓存数据
             * @param {String} id 节点ID;
             * @param {String} key 缓存key;
             * @param {Any Type} data 任何类型的缓存数据;
             */
            cache : function(id, key, data) {
                if (id === "index") {
                    return this._cacheIndex;
                } else if (id) {
                    var cache = this._cacheData[id];
                    if (!cache) {
                        cache = this._cacheData[id] = {};
                    }

                    if (key) {
                        if (data !== undefined) { cache[key] = data; }
                    } else {
                        try{ return cache; } finally { cache=null; }
                    }

                    try{ return cache[key]; } finally { cache=null; }
                } else {
                    return this._cacheData;
                }
            },

            // 缓存存储器
            _cacheData  : {},
            _cacheIndex : [],

            /*
             * 创建子节点
             */
            createChild : function(children, level, parents, notRender) {

                level = level || 0;
                parents = parents||[];

                var root,
                    curr,
                    keyword = this.keyword,
                    leng = children.length,
                    id, properties,
                    node, selected,
                    self = SELF,
                    i;

                for (i=0; i<leng; i+=1) {

                    properties = children[i];
                    id = properties.id;

                    // 兼容旧数据
                    if (properties.children && !properties.sn) {
                        properties.sn = properties.children;
                    }

                    // 缓存每个节点的数据
                    this.cache(id, "property", properties);
                    this.cache(id, "level", level);
                    this.cache(id, "parents", parents);

                    if (typeof(properties.checked) !== 'undefined') {
                        this.cache(id, "checked", !!properties.checked);
                    }

                    selected = typeof(properties.selected)!=='undefined' ?
                        properties.selected :
                        properties.current;

                    if (typeof(selected) !== 'undefined') {
                        this.cache(id, "current", !!properties.checked);
                    }

                    this._cacheIndex.push(id);

                    if (notRender === true) {
                        if (this._delayCreateNode) {
                            this._delayCreateNode(properties, level, parents.concat([id]), curr, notRender);
                        } else {
                            break;
                        }
                    } else {
                        if (i === 0) {
                            curr = "first";
                        }
                        if (i === leng-1) {
                            curr = "last";
                        }
                        if (!root) {
                            root = (this.mode === 'filter' && this.keyword!=='') ? ['<ul class="matched-parent">'] : ['<ul>'];
                        }
                        root.push (this.createNode(properties, level, parents.concat([id]), curr, notRender));
                        if (curr === "last") {
                            root.push('</ul>');
                        }
                    }
                }

                // 返回并清除引用
                try { return root ? root.join("") : ""; } finally { root = null; }
            },

            /*
             * 延迟遍历子节点
             */
            _delayCreateNode : function(a, b, c, d, e) {
                var self = this;
                setTimeout(function() {
                    if (self.createNode) {
                        self.createNode (a, b, c, d, e);
                    }
                    self = null;
                }, 40);
            },

            /*
             * 创建节点
             * @param    : properties
             */
            createNode : function(properties, level, parents, firstLast, notRender) {

                var id    = properties.id,
                    child = properties.sn || properties.children,
                    lazyLevel, cache, name, tooltips,
                    keyword = this.keyword,
                    keywordText, isMatch,
                    childHtml, FLCLS, classN, tools, checkbox, html;

                // 如果是懒渲染, 则直接遍历子节点并返回
                if (notRender===true && child && child.length>0) {
                    this.createChild(child, level+1, parents, notRender);
                    child = null;
                    return "";
                }

                lazyLevel= options.lazyLevel || 2;
                cache    = this.cache(id);
                name     = properties.nm || properties.text;
                tooltips = properties.tips || name;
                childHtml= "";
                FLCLS    = firstLast==="first" ? " stree-node-first" : firstLast==="last" ? " stree-node-last" : "";
                classN   =  [
                                'stree-node',
                                'stree-level-{3}',
                                properties.tp,
                                FLCLS,
                                (!child||child.length===0 ? " stree-leaf" : ""),
                                (cache&&cache.current ? 'stree-node-selected' : '')
                            ];
                tools    = '<div class="stree-node-tools" style="display:none; float:none;"></div>';
                checkbox = options.checkbox ?
                                '<span class="tbc-checkbox stree-checkbox" data-id="{0}" data-text="{1}">' +
                                   '    <input type="checkbox" name="'+ options.checkboxName +'" value="{0}" title="{1}" ' +(cache&&cache.checked?' checked="checked" ':'')+ '/>' +
                                   '</span>'
                                :  '';

                // 0:id; 1:name; 2:class; 3:level; 4:tools; 5:children
                html     =  '<li>' +
                               '    <dt data-id="{0}" data-text="{1}" title="{1}" class="{2}">' +
                               '        <span class="stree-space" style="width:'+ (level*16) +'px;"></span>' +
                               '        <span class="stree-handle" level="{3}"></span>' +
                                        checkbox +
                               '        <span class="stree-icon stree-icon-{3}"></span>' +
                               '        <span class="stree-text">{4}</span>' +
                               '       {5}' +
                               '    </dt>' +
                               '    {6}' +
                               '</li>';

                // 如果是筛选模式，则为匹配到的结果添加样式使其可见
                if (this.mode==='filter') {
                    isMatch = this.filterResult[id];

                    // 含有关键字或子节点含有关键字
                    if (typeof isMatch !== 'undefined') {
                        classN.push('matched');
                    }

                    //含有关键字
                    if (isMatch === true) {
                        classN.push('matched-keyword');
                        keywordText = name.replace(keyword, '<b class="keyword">'+keyword+'</b>');
                    } else {
                        keywordText = name;
                    }
                } else {
                    keywordText = name;
                }

                if (child && child.length>0) {

                    // 直接渲染子节点
                    if (level<lazyLevel) {
                        childHtml = this.createChild(child, level+1, parents);
                        this.cache(id, "rendered", true);

                    // 懒渲染
                    } else if (child) {
                        this.createChild(child, level+1, parents, true);
                        classN.push('stree-node-retracted');
                    }
                }

                html = tbc.formatString(html, id, tooltips, classN.join(' '), level, keywordText, tools, childHtml);

                // 返回并清除引用
                try {
                    return html;
                } finally {
                    classN = child = html = id = name = null;
                }
            },

            /*
             * 新增节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             * @param: before; 插入节点的位置(可选, 没有该参数将插入父节点的最后);
             */
            addNode : function (id, text, parentId, before) {
                var opt    = typeof id==="string" ? {id:id, pr:parentId, nm:text, sg:before} : id,
                    parent = this.cache(parentId),
                    pNode  = $(parent.html).removeClass("stree-leaf"),
                    node;

                switch (before) {
                    case "prepend" :
                        this.prependNode.apply (this, arguments);
                        break;
                    case "append" :
                        this.appendNode.apply (this, arguments);
                        break;
                    default:
                        this.insertNode.apply (this, arguments);
                }

                opt = parent = pNode = node = null;
            },

            /*
             * 从最后面追加节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             */
            appendNode : function (id, text, parentId) {
                var opt    = typeof id==="string" ? {id:id, pr:parentId, nm:text} : id,
                    parent = this.cache(parentId),
                    pNode  = $(parent.html).removeClass("stree-leaf"),
                    node,
                    p;

                if (opt) {
                    p = parent.parents.concat([opt.pr]);
                    node = $(this.createChild([opt], parent.level+1, p));

                    if (pNode.next("ul").size()) {
                        pNode.next("ul").append (node.html());
                    } else {
                        pNode.after(node);
                    }

                    this.addHtmlCache(pNode.next("ul").find(".stree-node"));
                    parent.rendered = true;
                }
                parent.property.sn = parent.property.sn || [];
                parent.property.sn.push(opt);

                this.triggerEvent("addNode", opt);
                opt = parent = pNode = node = p = null;
            },

            /*
             * 在最前面插入节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             */
            prependNode : function (id, text, parentId) {
                var opt    = typeof id==="string" ? {id:id, pr:parentId, nm:text} : id,
                    parent = this.cache(parentId),
                    pNode  = $(parent.html).removeClass("stree-leaf"),
                    node, p;

                if (opt) {
                    p = parent.parents.concat([opt.pr]);
                    node = $(this.createChild([opt], parent.level+1, p));

                    if (pNode.next("ul").size()) {
                        pNode.next("ul").prepend (node.html());
                    } else {
                        pNode.after(node);
                    }

                    this.addHtmlCache(pNode.next("ul").find(".stree-node"));
                    parent.rendered = true;
                }
                parent.property.sn = [opt].concat(parent.property.sn || []);

                this.triggerEvent("addNode", opt);
                opt = parent = pNode = node = p = null;
            },

            /*
             * 级别调整
             *
             */
            adjustNode : function (id, parentId) {

            },

            /*
             * 插入节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             * @param: before; 插入节点的位置(可选, 没有该参数将插入父节点的最后);
             */
            insertNode : function (id, text, parentId, before) {
                var opt     = typeof id==="string" ? {id:id, pr:parentId, nm:text, sg:before} : id,
                    parent  = this.cache(parentId),
                    pNode   = $(parent.html).removeClass("stree-leaf"),
                    sibling = parent.property.sn || [],
                    node,
                    p, i, len;
                before = typeof before==="string" ? this.cache(before) : before;

                if (!before) {
                    this.appendNode(id, text, parentId);
                } else {
                    p = parent.parents.concat([opt.pr]);
                    node = $(this.createChild([opt], parent.level+1, p));

                    for (i=0,len=sibling.length; i<len; i+=1) {
                        if (sibling[i].id === before.property.id) {
                            parent.property.sn = sibling.slice(0,i).concat([opt]).concat(sibling.slice(i, len));

                            if (pNode.next("ul").size()) {
                                $(this.cache(sibling[i].id, "html")).after(node.html());
                            } else {
                                pNode.after(node);
                            }
                            break;
                        }
                    }

                    this.addHtmlCache(pNode.next("ul").find(".stree-node[data-id='"+opt.id+"']"));
                    parent.rendered = true;
                }

                this.triggerEvent("addNode", opt);
                opt = parent = pNode = sibling = node = p = null;
            },

            /*
             * 重命名节点
             * @param    : id[string]; 节点ID
             * @param    : name[string]; 节点新名称
             */
            renameNode : function(id, name) {
                id = typeof id==="string" ? this.cache(id) : id;

                if (id && name) {
                    var ond = $(id.html).find(".stree-text"),
                        onm = ond.text();

                    if (id.property) {
                        id.property.nm = name;
                    }

                    ond.html(name);

                    this.triggerEvent("rename", id, name, onm);

                    ond = onm = null;
                }
            },

            /*
             * 删除节点
             * @param {String} id 节点ID
             */
            deleteNode : function (id) {
                id = typeof id==="string" ? this.cache(id) : id;

                if (this.hasChildren(id)) {
                    return;
                }

                var parents = id.parents,
                    parent, sibling, newSib,
                    i, len;

                if (parents && parents.length>0) {
                    parent  = this.cache(parents[parents.length-1]);
                    sibling = parent.property.sn||[];
                    newSib  = [];

                    for (i=0,len=sibling.length; i<len; i+=1) {
                        if (sibling[i].id !== id.property.id) {
                            newSib.push(sibling[i]);
                        }
                    }
                    parent.property.sn = newSib;
                }
                $(id.html).remove();

                this.triggerEvent("deleteNode", id, parents);
                sibling = newSib = null;
            },

            /**
             * 展开或者折叠树节点
             * @method toggleNode
             * @param {String|element|jQuery Selector} id;
             */
            toggleNode    : function (id) {
                var itm = typeof id === "string" ?
                        this.container.find("div[data-id='"+ id +"']") :
                        $(id);

                if (itm.size() !== 0) {
                    if (itm.hasClass("stree-node-retracted")) {
                        this.unfoldNode(itm);
                    } else {
                        this.foldNode(itm);
                    }
                }
            },

            /**
             * 展开树节点
             * @method unfoldNode
             * @param {String|element|jQuery Selector} id;
             */
            unfoldNode : function (id) {
                var itm = typeof id === "string" ?
                    this.container.find("div[data-id='"+ id +"']") :
                    $(id);

                if (itm.size() !== 0) {
                    itm.removeClass("stree-node-retracted");
                    itm.next("ul").removeClass("hide");
                }
                this.triggerEvent("unfold", itm);
            },

            /**
             * 折叠树节点
             * @method foldNode
             * @param {string|htmlElement|jQuery selector|jQuery object} id;
             */
            foldNode : function (id) {
                var itm = typeof id === "string" ?
                    this.container.find("div[data-id='"+ id +"']") :
                    $(id);

                if (itm.size() !== 0) {
                    itm.addClass("stree-node-retracted");
                    itm.next("ul").addClass("hide");
                }

                this.triggerEvent("fold", itm);
            },

            /**
             * 获取树结构
             * @param  {String} [id] 节点ID
             * @return {Array}
             */
            getTreeNode: function(id) {
                var nodes = [],
                    children = !id ?
                        [this.getFirstNode()] :
                        this.getChildNodes(id);

                id = id || this.getFirstNode().property.id;

                $.each(children, function() {
                    var prop = this.property;
                    var children = SELF.getTreeNode(prop.id),
                        node = $.extend({}, this.property, {
                            sn       : children,
                            children : children,
                            checked  : this.checked,
                            selected : this.current,
                            parents  : this.parents
                        });

                    nodes.push(node);
                });
                return nodes;
            },

            // 返回选中的节点
            getChecked : function() {
                var checked = [],
                    index    = this._cacheIndex,
                    node,
                    i, len;
                for (i=0,len=index.length; i<len; i+=1) {
                    node = this.cache(index[i]);
                    if (node.checked) {
                        checked.push(node);
                    }
                }

                try { return checked; } finally { checked=node=index=null; }
            },

            /**
             * 获取子节点
             * @method getChildNodes
             * @param {String} [varname] [description]
             */
            getChildNodes : function (id, traversal) {

                var cache = typeof id==="string" ? this.cache(id) : id,
                    child = cache&&cache.property ? cache.property.sn||cache.property.children||[] : [],
                    nodes = [],
                    itm, ele,
                    i, len;
                for (i=0,len=child.length; i<len; i+=1) {
                    itm = child[i];
                    ele = this.cache(itm.id);

                    if (ele) {
                        nodes.push(ele);
                    }

                    if (traversal && (itm.sn||itm.children)) {
                        nodes = nodes.concat(this.getChildNodes(itm.id, traversal));
                    }
                }

                try{ return nodes; } finally { cache = child = nodes = itm = ele = id = null; }
            },

            /**
             * 是否是顶级节点
             * @method isRoot
             * @param  {String}  id 节点ID
             */
            isRoot : function (id) {
                var cache = typeof id==="string" ? this.cache(id) : id;
                try {
                    return (cache && cache.level===0);
                } finally {
                    cache = null;
                }
            },

            /**
             * 获取一个节点在同级节点中的索引（index）值
             * @param  {String|Object} id 节点ID或者节点对象
             * @param {Array} [siblings] 同级节点
             * @return {Number}  返回索引值，如果为-1，表示不存在此节点；
             */
            getIndex: function(id, siblings) {

                var node = typeof id==="string" ? this.cache(id) : id,
                    sid = node.property.id,
                    parentId, parent, i, len;

                if (!siblings || siblings.length === 0) {
                    parentId = node.parents ? node.parents[node.parents.length-1] : null;
                    parent   = this._cacheData[parentId];
                    siblings = parent&&parent.property ? parent.property.sn||parent.property.children||[] : [];
                }

                for (i=0, len=siblings.length; i<len; i++) {
                    if (siblings[i].id === sid) {
                        return i;
                    }
                }
                return -1;
            },

            /**
             * 获取同级节点
             * @method getSiblings
             * @param {String} id 节点ID
             * @param {String} position 返回前面或者后面的同级节点，取值：'prev'/'next'
             * @return {Array} 返回同级节点列表
             */
            getSiblings : function (id, position, cascade) {
                var cache    = typeof id==="string" ? this.cache(id) : id,
                    parentId = cache.parents ? cache.parents[cache.parents.length-1] : null,
                    parent   = this._cacheData[parentId],
                    siblings = parent&&parent.property ? (parent.property.sn||parent.property.children||[]) : [],
                    sid      = cache.property.id,
                    nodes    = [],
                    itm, ele, start, end, index,
                    i, len, pass, sign = false;

                // 获取当前节点的idnex值
                index = this.getIndex(sid, siblings);

                if (position === 'prev') {
                    start = 0;
                    end   = index;
                } else if (position === 'next') {
                    start = index+1;
                    end   = siblings.length;
                } else if(typeof position==='string' || (position && position.property)) {
                    start = this.getIndex(id, siblings);
                    end   = this.getIndex(position, siblings);
                    index = Math.min(start, end);
                    end   = Math.max(start, end) + 1;
                    start = index;
                } else {
                    start = 0;
                    end   = siblings.length;
                }

                for (i=start; i<end; i++) {
                    itm = siblings[i];
                    ele = this.cache(itm.id);

                    nodes.push(ele);

                    // 包含兄弟节点的子节点
                    if (cascade) {
                        nodes = nodes.concat(this.getChildNodes(ele, true));
                    }
                }

                try{ return nodes; } finally { cache = parent  = siblings = nodes = itm = ele = id = null; }
            },

            /**
             * 选中节点
             * @method checkNode
             * @param  {Array} list     要勾选的节点
             * @param  {Function} callback 回调函数，全部选中之后会调用回调函数
             */
            checkNode : function(list, callback) {
                var SELF = this,
                    checkedList = [];

                if (!tbc.isArray(list)) {
                    return tbc.log("Error at tbc.Tree().checkNode(list): arguments[0]:list must be an array;");
                }

                // 分批选中
                if (false !== this.triggerEvent("beforeCheck", list)) {
                    if (list.length>0) {
                        tbc.batch(
                            list, 1000, 0, 10,
                            function (portion, isEnd, current) {
                                var node,
                                    i, len;
                                for (i=0,len=portion.length; i<len; i+=1) {
                                    node = portion[i];
                                    if (SELF.mode!=='filter' || node.matched) {
                                        if (typeof node==="string") {
                                            node = SELF.cache(node);
                                        }

                                        node.checked = true;
                                        $(node.html).addClass(options.checkedCss||"stree-node-checked")
                                        .find("input[type='checkbox']").attr("checked", true);

                                        checkedList.push(node);
                                    }
                                }

                                if (isEnd && (!tbc.isFunction(callback) || callback.call(SELF, list) !== false)) {
                                    SELF.triggerEvent("check", checkedList);
                                }

                                if (current===4) {
                                    tbc.lock(SELF.ui);
                                }
                            },
                            function() {
                                tbc.unlock(SELF.ui);
                            }
                       );
                    }
                }
            },

            /**
             * 取消选中某个节点
             * @method uncheckNode
             * @param {Array} list 要取消勾选的节点列表;
             * @param {Function} callback 回调函数
             */
            uncheckNode : function (list, callback) {

                if (!tbc.isArray(list)) {
                    return tbc.log("Error at tbc.Tree().uncheckNode(list): arguments[0]:list must be an array;");
                }

                if (false !== this.triggerEvent("beforeUncheck", list)) {

                    // 分批取消选中
                    if (list.length>0) {
                        tbc.batch (
                            list, 1000, 0, 10,
                            function (portion, isEnd, current) {
                                var node, i, len;
                                for (i=0,len=portion.length; i<len; i+=1) {
                                    node = portion[i];
                                    if (typeof node==="string") {
                                        node = SELF.cache(node);
                                    }

                                    node.checked = false;
                                    $(node.html).removeClass(options.checkedCss||"stree-node-checked")
                                    .find("input[type='checkbox']").removeAttr("checked");
                                }

                                if (isEnd && (!tbc.isFunction(callback) || callback.call(SELF, list) !== false)) {
                                    SELF.triggerEvent("uncheck", list);
                                }

                                if (current===4) {
                                    tbc.lock(SELF.ui);
                                }
                            },
                            function() {
                                tbc.unlock(SELF.ui);
                            }
                       );
                    }
                }
            },

            /**
             * 选中或取消节点
             * @method chooseNode
             * @param  {String} id       节点ID
             * @param  {Boolean} multiple 是否允许同时勾选多个节点
             */
            chooseNode: function (id, ctrlKey) {
                id = typeof id==="string" ? this.cache(id) : id;

                var tree = this,
                    o = options,
                    current = this.getWillBeSelect(id, options.cascadeCheck),
                    callback, deselectList;

                if (!o.singleCheck) {
                    if (id.checked) {
                        this.uncheckNode(current);
                    } else {
                        this.checkNode(current);
                    }
                } else {

                    callback = function() {
                        if (id.checked) {
                            tree.uncheckNode(current);
                        } else {
                            tree.checkNode(current);
                        }
                    };

                    if (!ctrlKey && o.singleCheck) {
                        deselectList = this.getWillBeDeselect(id, options.cascadeCheck);

                        if (deselectList.length > 0) {
                            this.uncheckNode(deselectList, callback);
                        } else {
                            callback();
                        }
                    }
                }

                id = current = o = null;
            },

            /**
             * 获取准备勾选的节点
             * @param  {String} id 节点ID
             * @return {Array}    将要被勾选的节点列表
             */
            getWillBeCheck : function(id) {
                id = typeof id==="string" ? this.cache(id) : id;

                var child = [id];
                // 如果是级联选择，并且不是筛选模式
                // 则勾选所有子节点
                if (options.cascadeCheck) {
                    child = child.concat(this.getChildNodes(id, true));
                }
                try { return child; } finally { child = id = null; }
            },

            /**
             * 获取要取消勾选的子节点
             * @param  {Array} exclude 要排除的节点ID列表
             * @return {Array}         要取消勾选的节点
             */
            getWillBeUncheck : function(exclude) {
                exclude = typeof exclude==="string" ? this.cache(exclude) : exclude;
                var cache = this.cache(),
                    id,
                    index = this.cache("index"),
                    checked = [],
                    i, len;

                for (i=0,len=index.length; i<len; i+=1) {
                    id = index[i];
                    if (!options.cascadeCheck && (exclude&&exclude.property.id !== id) && cache[id].checked) {
                        checked.push(cache[id]);
                    } else if (
                        (exclude&&exclude.property.id !== id) &&
                        cache[id].checked &&
                        tbc.array.indexOf(exclude.property.id, cache[id].parents)===-1
                    ) {
                        checked.push(cache[id]);
                    }
                }

                try { return checked; } finally { checked = cache = index = id = null; }
            },

            /**
             * 获取准备选中的节点
             * @param  {String} id 节点ID
             * @return {Array}    将要被选中的节点列表
             */
            getWillBeSelect : function(id, cascade) {
                id = typeof id==="string" ? this.cache(id) : id;

                var child = [id];
                // 如果是级联选择，并且不是筛选模式
                // 则勾选所有子节点
                if (cascade) {
                    child = child.concat(this.getChildNodes(id, true));
                }
                try { return child; } finally { child = id = null; }
            },

            /**
             * 获取要取消选中的子节点
             * @param  {Array} exclude 要排除的节点ID列表
             * @return {Array}         要取消选中的节点
             */
            getWillBeDeselect : function(exclude, cascade) {
                exclude = typeof exclude==="string" ? this.cache(exclude) : exclude;
                var cache = this.cache(),
                    id,
                    index = this.cache("index"),
                    checked = [],
                    i, len;

                for (i=0,len=index.length; i<len; i+=1) {
                    id = index[i];
                    if (!cascade && (!exclude||exclude.property.id !== id) && cache[id].checked) {
                        checked.push(cache[id]);
                    } else if (
                        (!exclude||
                         (exclude.property.id !== id &&
                          tbc.array.indexOf(exclude.property.id, cache[id].parents) === -1)) &&
                        cache[id].checked
                    ) {
                        checked.push(cache[id]);
                    }
                }

                try { return checked; } finally { checked = cache = index = id = null; }
            },

            /**
             * 是否有子节点
             * @method  hasChildren
             * @param  {String}  id 节点ID
             * @return {Boolean}    返回true表示有子节点，否则没有
             */
            hasChildren : function (id) {
                var node = typeof id==="string" ? this.cache(id) : id;
                try {
                    return node && node.property.sn && node.property.sn.length>0;
                } finally {
                    node = null;
                }
            },

            /**
             * 是否处于所有统计节点的最前面
             * @method isFirst
             * @param  {String}  id 节点ID
             * @return {Boolean}    返回true表示是第一个节点，否则不是
             */
            isFirst    : function (id) {
                var node    = typeof id==="string" ? this.cache(id) : id,
                    paren    = node.parents[node.parents.length-1],
                    sibling    = paren ? this.cache(paren).property.sn : null,
                    retn    = (sibling && sibling[0].id===id) ? true : false;

                try { return retn; } finally { node = paren = sibling = null; }
            },

            /**
             * 是否处于所有统计节点的最后面
             * @method isLast
             * @param  {String}  id 节点ID
             * @return {Boolean}    返回true表示是最后一个节点，否则不是
             */
            isLast    : function (id) {
                var node   = typeof id==="string" ? this.cache(id) : id,
                    paren  = node.parents[node.parents.length-1],
                    sibling= paren ? this.cache(paren).property.sn : null,
                    retn   = sibling && sibling[sibling.length-1].id===id;
                try { return retn; } finally { node = paren = sibling = null; }
            },

            /**
             * 设为当前节点
             * @param {String} id 节点ID
             * @param {Boolean} trigger 是否触发select事件
             */
            setCurrent: function (id, trigger) {

                id = typeof id==="string" ? this.cache(id) : id||this.getCurrent();

                var cls   = options.currentCss||"stree-node-selected",
                    data  = id.property,
                    elem  = id.html,
                    child = data && data.sn && data.sn.length>0,
                    oid;

                if (data) {
                    data.tp = data.tp||"ORGANIZATION";
                }

                // 已被选中为当前状态
                if ($(id.html).hasClass(cls)) {
                    this.triggerEvent("select",  data, $(elem), child);
                    cls = data = elem = child = null;
                    return;
                }

                oid = this.container.find("dt."+cls).removeClass(cls).attr("data-id");
                this.cache(oid, "current", false);

                $(id.html).addClass(cls);
                id.current = true;

                if (trigger !== false) {
                    this.triggerEvent("select",  data, $(elem), child);
                }
                cls = data = elem = child = null;
            },

            /**
             * 设为当前节点
             * @param  {String} id       节点ID
             * @param  {Boolean} multiple 是否允许多选
             * @param  {Boolean} dbl      是否是被双击事件调用
             */
            ___selectNode : function (id, multiple, dbl) {

                var node    = typeof id==="string" ? this.cache(id) : id||this.getCurrent(),
                    cls        = options.currentCss||"stree-node-selected",
                    data    = node.property,
                    elem    = node.html,
                    child    = data && data.sn && data.sn.length>0;

                if (data) {
                    data.tp = data.tp||"ORGANIZATION";
                }

                // Toggle selected
                if (node.current===true) {

                    if (multiple !== true) {
                        this.deselectNode(this.getSelectedList());
                    } else {
                        $(node.html).removeClass(cls);
                        node.current = false;
                    }

                } else {
                    $(node.html).addClass(cls);
                    node.current = true;
                    this.triggerEvent("select",  data, $(elem), child, dbl);
                    if (multiple !== true) {
                        this.deselectNode(this.getSelectedList([node.property.id]));
                    }
                }

                cls = data = elem = child = null;
            },

            /**
             * 设为当前节点
             * @param  {String} id       节点ID
             * @param  {Boolean} multiple 是否允许多选
             * @param  {Boolean} dbl      是否是被双击事件触发
             */
            selectNode : function (id, ctrlKey, dbl) {

                var node     = typeof id==="string" ? this.cache(id) : id||this.getCurrent(),
                    cls      = options.currentCss||"stree-node-selected",
                    property = node.property,
                    elem     = node.html,
                    child    = property && property.sn && property.sn.length>0,
                    selectList = [],
                    children;

                if (property) {
                    property.tp = property.tp || "ORGANIZATION";
                }

                // Toggle selected
                if (node.current===true && !dbl) {

                    if (ctrlKey !== true) {
                        this.deselectNode(this.getSelectedList());
                    } else {
                        $(node.html).removeClass(cls);
                        node.current = false;
                    }

                } else if(this.mode !=='filter' || node.matched) {

                    if (ctrlKey !== true || options.multipleSelect!==true) {
                        this.deselectNode(this.getSelectedList([node.property.id]));
                    }

                    $(node.html).addClass(cls);
                    node.current = true;
                    this.triggerEvent("select", property, $(elem), child, dbl);

                    if (options.cascadeSelect) {
                        children = this.getChildNodes(property.id, true);

                        tbc.batch(children, 1000, 0, 10, function (portion, completed, current) {
                            var i=0, length=portion.length,
                                node;
                            for (; i<length; i++) {
                                node = portion[i];
                                $(node.html).addClass(cls);
                                node.current = true;
                            }

                            if (current===3) {tbc.lock(SELF.ui);}
                            SELF.triggerEvent("select", portion, null, child, dbl);
                            if (completed) {tbc.unlock(SELF.ui);}
                        });
                    }
                }

                cls = property = elem = child = null;
            },

            deselectNode : function (nodeList) {
                var cls = options.currentCss || "stree-node-selected";

                // for (i=0,len=nodeList.length; i<len; i+=1) {
                //     $(nodeList[i].html).removeClass(cls);
                //     nodeList[i].current = false;
                // }

                tbc.batch(nodeList, 1000, 0, 10, function (portion, completed, current) {
                    var i=0, length=portion.length,
                        node;
                    for (; i<length; i++) {
                        node = portion[i];
                        $(node.html).removeClass(cls);
                        node.current = false;
                    }

                    if (current===3) {tbc.lock(SELF.ui);}
                    SELF.triggerEvent ("deselect", portion);
                    if (completed) {tbc.unlock(SELF.ui);}
                });


            },

            getCurrent : function() {
                var node, id,
                    i, len;

                for (i=0,len=this._cacheIndex.length; i<len; i+=1) {
                    id   = this._cacheIndex[i];
                    node = this.cache(id);
                    if (node.current === true) {
                        try { return node; } finally { id = node = null; }
                    }
                }

                try { return this.getFirstNode(); } finally { id = node = null; }
            },


            /*
             * 获取已选中的节点
             * @param    : excludeList; // 排除的节点
             * @return    : Array: [{property:{id:"",nm:"",tp:"",np:""}, html, ...},...,{...}]; // 返回节点数组
             */
            getSelectedList : function(excludeList) {

                excludeList = $.isArray(excludeList) ? excludeList : [excludeList];

                var nodes = [],
                    id,
                    i, len, isExclude, j, k;

                for (i=0,len=this._cacheIndex.length; i<len; i+=1) {
                    id = this._cacheIndex[i];
                    if (this.cache(id).current) {
                        isExclude = false;
                        for (j=0,k=excludeList.length; j<k; j+=1) {
                            if (excludeList[j]===id) {
                                isExclude = true;
                                break;
                            }
                        }

                        if (!isExclude) {
                            nodes.push (this.cache(id));
                        }
                    }
                }

                try { return nodes; } finally { id = nodes = null; }
            },

            // 获取第一个节点
            getFirstNode : function() {
                var id = this.container
                    .children(".tbc-tree")
                    .children(".tbc-tree-container")
                    .children("ul:first")
                    .children("li:first")
                    .children(".stree-node").attr("data-id");
                try { return this.cache(id); } finally { id = null; }
            },

            /**
             * 获取多个节点共同的祖先节点
             * @param {Object} node1 缓存中的节点对象
             *     @param {Element} node1.html 节点的HTML element对象
             *     @param {Boolean} node1.checked 是否被勾选
             *     @param {Boolean} node1.selected 是否被选中（没有复选框时的选择状态）
             *     @param {Boolean} node1.rendered 是否已经渲染
             *     @param {Number} node1.level 节点位于树中的层级数
             *     @param {Array} node1.parents 此节点所有的父节点id
             * @param {Object} node2 缓存中的节点对象
             * @return {[type]} [description]
             */
            getCommonParent: function(node1, node2) {
                var i, ilen, iParents = node1.parents,
                    j, jlen, jParents = node2.parents,
                    iParent;

                for (i=iParents.length-1; i>=0; i--) {
                    iParent = iParents[i];
                    for (j=jParents.length-1; j>=0; j--) {
                        if (iParent === jParents[j]) {
                            return iParent;
                        }
                    }
                }
            },

            /**
             * 获得两节点的前后顺序
             * @param  {[type]} node1        [description]
             * @param  {[type]} node2        [description]
             * @param  {[type]} commonParent [description]
             * @return {[type]}              [description]
             */
            getSequence: function(node1, node2, commonParent) {
                commonParent = commonParent || this.getCommonParent(node1, node2);

                if (!commonParent) {
                    return null;
                }

                var cache = this._cacheData[commonParent],
                    parent = cache.property,
                    siblings = parent.children || parent.sn,
                    parents1 = node1.parents,
                    parents2 = node2.parents,
                    i, len, id, sequence=[];

                for (i=0, len=siblings.length; i<len && (node1 || node2); i++) {
                    id = siblings[i].id;
                    if (node1 && tbc.array.indexOf(id, parents1)!==-1) {
                        sequence.push(node1);
                        node1 = null;
                    }

                    if (node2 && tbc.array.indexOf(id, parents2)!==-1) {
                        sequence.push(node2);
                        node2 = null;
                    }
                }
                sequence[2] = commonParent;

                return sequence;
            },

            getNextSiblings: function(id, cascade) {
                var sib = this.getSiblings(id, 'next'),
                    i, len = sib.length,
                    list = [];
                if (cascade) {
                    for (i=0; i<len; i++) {
                        list = list.concat(this.getChildNodes(sib[i]));
                    }
                }
                return list;
            },

            getPrevSiblings: function(id) {
                return this.getSiblings(id, 'prev');
            },

            /**
             * 获取按住shift键时要选中的节点
             * @method getShiftSelect
             * @param  {String|Object} node1 被点击的节点
             * @param  {String|Object} node2 上次被点击的节点
             * @param  {Boolean} sib   是否限制只能选中同级节点
             * @return {Array}       返回节点列表
             */
            getShiftSelect: function(node1, node2, sib) {
                var seq  = this.getSequence(node1, node2),
                    list = [],
                    parents1, parents2, index1, index2, position1, position2,
                    id1, id2, i, ilen, j, jlen, sibling;

                if (seq === null) {
                    return list;
                }

                parents1  = node1.parents;
                parents2  = node2.parents;
                index1    = tbc.array.indexOf(seq[2], parents1) + 1;
                index2    = tbc.array.indexOf(seq[2], parents2) + 1;
                position1 = seq[0]===node1 ? 'next' : 'prev';
                position2 = seq[0]===node2 ? 'next' : 'prev';
                list      = [];

                parents1 = index1>-1 ? parents1.slice(index1) : [];
                parents2 = index2>-1 ? parents2.slice(index2) : [];
                ilen   = parents1.length;
                jlen   = parents2.length;

                // 如果只选中同级节点，直接返回对应的同级节点
                if (sib) {
                    if (ilen===0 && jlen===0) {
                        return this.getSiblings(node2, node1, true);
                    } else {
                        return this.getSiblings(node2, position2, true);
                    }
                }

                for (i=ilen-1; i>=0; i--) {
                    id1 = parents1[i];
                    sibling = this.getSiblings(id1, position1, true);
                    list = list.concat(sibling);

                    // 如果是选择当前节点后面的节点，则不包括父节点
                    if (position1 !== 'next') {
                        list.push(this.cache(id1));
                    }
                }

                for (j=jlen-1; j>=0; j--) {
                    id2 = parents2[j];
                    sibling = this.getSiblings(id2, position2, true);
                    list = list.concat(sibling);

                    // 如果是选择当前节点后面的节点，则不包括父节点
                    if (position2 !== 'next') {
                        list.push(this.cache(id2));
                    }
                }

                list.push(node1);
                list.push(node2);
                list = list.concat(this.getSiblings(node1, position1, true));
                list = list.concat(this.getSiblings(node2, position2, true));

                return list;
            },

            shiftSelect: function(id, sib) {
                var node = typeof id==="string" ? this.cache(id) : id||this.getCurrent(),
                    lastNode = this.lastClickNode,
                    selected = this.getSelectedList(),
                    list = this.getShiftSelect(node, lastNode, sib),
                    that = this,
                    selectedList = [];

                this.deselectNode(selected);

                function batch(portion, completed, current) {
                    var i, len = portion.length,
                        cssClass = options.currentCss || "stree-node-selected",
                        node;
                    for (i=0; i<len; i++) {
                        node = portion[i];
                        if (that.mode !== 'filter' || node.matched) {
                            node.current = true;
                            $(node.html).addClass(cssClass);
                            selectedList.push(node);
                        }
                    }

                    if (completed) {
                        tbc.unlock(that.ui);
                        that.triggerEvent('select', selectedList, null, false);
                    }
                }

                tbc.lock(this.ui);
                tbc.batch(list, 1000, 0, 10, batch);
            },

            /**
             * 更新tree选项
             * @param key {String}
             * @param value {unknow}
             * @return {[type]} [description]
             */
            options: function(key, value) {
                if ($.isPlainObject(key)) {
                    $.extend(true, options, key);
                } else if(typeof key =='string' && typeof value !== 'undefined') {
                    if ($.isPlainObject(options[key]) && $.isPlainObject(value)) {
                        $.extend(true, options[key], value);
                    } else {
                        options[key] = value;
                    }
                }
            }
        });


        SELF.addEvent({
            resize: function(height) {
                var filterHei = 0;

                if (options.filterVisible && this.filterBar) {
                    filterHei = this.filterBar.height();
                }

                this.treeContainer.height(height-filterHei);
            }
        });

        /*
         <div class="stree-node stree-level-3 stree-node-first stree-node-retracted" title="产品管理部" data-text="产品管理部" data-id="">
             <span class="stree-space"></span>
            <span level="3" class="stree-handle"></span>
            <span class="stree-icon stree-icon-3"></span>
            <span class="stree-text">产品管理部</span>
         </div>
         */
        SELF.ui.css({
            '-webkit-user-select': 'none',
            '-moz-user-select'   : 'none',
            '-ms-user-select'    : 'none',
            '-o-user-select'     : 'none',
            'user-select'        : 'none'
        })

        // 收缩、展开节点
        .delegate(".stree-handle", "click", function(event) {

            event.stopPropagation();

            var self    = SELF,
                node    = this.parentNode,
                id      = node.getAttribute("data-id");

            self.toggleNode(node);
            self.renderNode(id);

            self = node = id = null;
        })

        // 选中或取消选中节点
        .delegate(".stree-node", "click", function(event) {
            var id = this.getAttribute("data-id");

            // 没有按住shift键则记录为最后点击的节点
            if (!event.shiftKey) {
                SELF.lastClickNode = SELF._cacheData[id];
            }

            if (event.shiftKey) {
                SELF.shiftSelect(id, true);
            } else {
                SELF.selectNode(id, event.ctrlKey && options.multipleSelect, false, event.shiftKey);
            }
        })

        // (双击) 选中或取消选中节点
        .delegate(".stree-node", "dblclick", function(event) {
            var id = this.getAttribute("data-id"),
                dbl = true;

            // 没有安装shift键则记录为最后点击的几点
            if (!event.shiftKey) {
                SELF.lastClickNode = SELF._cacheData[id];
            }

            SELF.selectNode(id, event.ctrlKey && options.multipleSelect, dbl, event.shiftKey);
        });

        // 选择框
        if (options.checkbox) {
            SELF.ui.delegate("input[type='checkbox']", "click", function(event) {
                SELF.chooseNode(this.value, event.ctrlKey || !options.singleCheck);
                event.stopPropagation();
            });
        }
    };
}(jQuery));
