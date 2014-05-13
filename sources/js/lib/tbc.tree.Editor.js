// 在线人数更新
tbc.namespace("tbc.tree");
tbc.tree.Editor = tbc.tree.Editor || function (settings) {

    var SELF = tbc.self(this, arguments),

        defaults = {
            hideDisabledTools : false,
            addible   : true,
            editable  : true,
            deletable : true,
            editUrl   : null,
            addUrl    : null,
            deleteUrl : null,
            moveUrl   : null,
            level     : 0 // 限制最多可以增加到多少级
        },

        options = $.extend({}, defaults, settings);

    SELF.extend ([tbc.Tree, settings], {

        packageName: "tbc.tree.Editor",

        // 是否能删除
        isDeletable: function (id) {
            return options.deletable && this.hasChildren (id);
        },

        // 操作菜单
        hoverTools: function (id) {

            var tools  = [],
                node   = typeof id === "string" ? this.cache(id) : id,
                isRoot = this.isRoot(id);

            (!options.level || node.level<options.level) && options.addible
                ? tools.push('<a href="javascript:void(0);" class="stree-add">新增</a>')
                : (!options.hideDisabledTools ? tools.push('<span style="color:#888; text-decoration:line-through;">新增</span>') : '');

            if (!isRoot) {
                tools.push('<a href="javascript:void(0);" class="stree-edit">编辑</a>');

                !this.isFirst(id)
                    ? tools.push('<a href="javascript:void(0);" class="stree-moveup">上移</a>')
                    : (!options.hideDisabledTools ? tools.push('<span style="color:#888; text-decoration:line-through;">上移</span>') : '');

                !this.isLast(id)
                    ? tools.push('<a href="javascript:void(0);" class="stree-movedown">下移</a>')
                    : (!options.hideDisabledTools ? tools.push('<span style="color:#888; text-decoration:line-through;">下移</span>') : '');

                !this.isDeletable(id)
                    ? tools.push('<a href="javascript:void(0);" class="stree-delete">删除</a>')
                    : (!options.hideDisabledTools ? tools.push('<span style="color:#888; text-decoration:line-through;">删除</span>') : '');
            }

            try { return tools.join("&nbsp;&nbsp;|&nbsp;&nbsp;"); } finally { node = tools = ""; }
        },

        // 新增
        nodeAddHandle : function (id) {
            var node = typeof(id) === "string" ? this.cache(id) : id;

            if (node && this.triggerEvent("beforeAdd", node) !== false) {

                if (this.addbox) {
                    this.addbox.show();
                    this.addbox.locate($(".stree-text", node.html));
                    this.addbox.container.find("._cont")
                    .empty().load(options.addUrl);
                } else {
                    this.addbox = new tbc.Pop({ name:"新增", width:400, height:340});
                    this.addbox.appendTo("body");
                    this.addbox.show();
                    this.addbox.locate($(".stree-text", node.html));
                    this.addbox.addEvent({close:function() {SELF.addbox=null;} });

                    this.addbox.append('<div class="tbc-titleBar"><b>新增</b> &nbsp;<i style="color:#aaa;">(双击标题关闭)</i></div><div class="_cont"><div style="text-align:center;">Loading...</div></div>');

                    this.addbox.container
                    .delegate(".tbc-titleBar", "dblclick", function() { SELF.addbox.close(); })
                    .find("._cont").load(options.addUrl, {id:node.property.id});

                }
                this.addbox.__nodeid = node.property.id;
            }
        },

        // 编辑
        nodeEditHandle : function (id) {
            var node = typeof(id) === "string" ? this.cache(id) : id;
            if (node && this.triggerEvent("beforeEdit", node) !== false) {

                if (this.editbox) {
                    this.editbox.show();
                    this.editbox.locate($(".stree-text", node.html));
                    this.editbox.container.find("._cont")
                    .empty().load(options.editUrl);
                } else {
                    this.editbox = new tbc.Pop({ width:400, height:340});
                    this.editbox.appendTo("body");
                    this.editbox.show();
                    this.editbox.locate($(".stree-text", node.html));
                    this.editbox.addEvent({close:function() {SELF.editbox=null;} });

                    this.editbox.append('<div class="tbc-titleBar"><b>编辑:</b><i>'+ (node.property.nm||node.property.text||"") +'</i> &nbsp;<i style="color:#aaa;">(双击标题关闭)</i></div><div class="_cont"></div>');

                    this.editbox.container
                    .delegate(".tbc-titleBar", "dblclick", function() { SELF.editbox.close(); })
                    .find("._cont").load(options.editUrl, {id:node.property.id});
                }
                this.editbox.__nodeid = node.property.id;
            }
        },

        // 检测
        nodeDeleteCheck : function() {

        },

        // 删除
        nodeDelete : function (id) {
            id = typeof id === "string" ? this.cache(id) : id;

            var node    = $(id.html).css({background:"yellow"});

            if (node.hasClass("disabled")) {
                node=null;
                return false;
            } else {
                node.addClass("disabled");
            }

            var self    = SELF,
                button  = node.find(".stree-delete"),
                offset  = button.offset(),
                tips    = $('<div class="tbc-tips">确定删除吗?&nbsp;&nbsp;<a class="_dle" href="javascript:void(0);">删除</a>&nbsp;<a class="_cancel" href="javascript:void(0);">取消</a></div>')
                    .css({ left:offset.left, top:offset.top-12, opacity:0, background:"#fff", border:"1px solid #ccc", padding:"6px", position:"absolute", zIndex:"10000"})
                    .appendTo("body")
                    .animate({left:"+=24px", opacity:1}, 200),
                close   = function() {
                    tips&&tips.stop().animate
                    (
                        { left:"-=64px", opacity:0 },
                        200,
                        function() {
                            node&&node.css({background:""}).removeClass("disabled");
                            tips&&tips.remove();
                            id=self=node=button=offset=tips=close=null;
                        }
                    )
                };

            tips.delegate("a._dle", "click", function(event) { self.nodeDeleteAjax(id); close(); });
            tips.delegate("a._cancel", "click", function(event) { close(); });

            tips.animate({opacity:0}, 10000, close);
        },

        removeNode : function (id) {
            var node    = typeof id === "string" ? this.cache(id) : id,
                parent  = node.parents[node.parents.length-1],
                sibling = this.cache(parent).property.sn,
                index,
                nnode   = node.html;

            for (var i=0,len=sibling.length; i<len; i++) {
                if (sibling[i].id === id) {
                    index = i;
                    break;
                }
            }
            this.cache(parent).property.sn = sibling.slice(0, index).concat(sibling.slice(index+1,len));
            nnode.parentNode.removeChild(nnode);

            node = parent = sibling = index = nnode = len = null;
        },

        nodeDeleteAjax : function (id) {
            id = typeof id === "string" ? id : id.property?id.property.id:null;
            var self = SELF;
            if (options.deleteUrl && id) {
                $.ajax({
                    url         : options.deleteUrl,
                    type        : "post",
                    dataType    : "json",
                    data        : { id:id, action:"delete" },
                    beforeSend  : function() {},
                    complete    : function() {},
                    error       : function() {},
                    success     : function(result) {
                        if (result.success) {
                            self.deleteNode(id);
                            self.triggerEvent("delete", id);
                            self=null;
                        } else {
                            alert(result.message||"删除失败");
                        }
                    }
                });
            }
        },

        // 上移
        nodeMoveup : function (id) {
            if (!id || this.isFirst(id)) { return }

            var node    = this.cache(id),
                parent  = node.parents[node.parents.length-1],
                sibling = this.cache(parent).property.sn,
                prev, nnode;

            for (var i=0,len=sibling.length; i<len; i++) {
                if (sibling[i].id === id) {
                    prev = sibling[i-1];
                    sibling[i-1] = sibling[i];
                    sibling[i] = prev;
                    break;
                }
            }

            // HTML节点
            nnode = $(node.html).parent();
            nnode.insertBefore(nnode.prev());

            this.nodeMoveAjax(id, "up");

            node = nnode = paren = sibling = next = null;
        },

        // 下移
        nodeMovedown : function (id) {
            if (!id || this.isLast(id)) { return }

            var node    = this.cache(id),
                parent  = node.parents[node.parents.length-1],
                sibling = this.cache(parent).property.sn,
                next;

            for (var i=0,len=sibling.length; i<len; i++) {
                if (sibling[i].id === id) {
                    next = sibling[i+1];
                    sibling[i+1] = sibling[i];
                    sibling[i] = next;
                    break;
                }
            }

            // HTML节点
            var nnode = $(node.html).parent();
                nnode.insertAfter(nnode.next());

            this.nodeMoveAjax(id, "down");

            node = nnode = paren = sibling = next = null;
        },

        nodeMoveAjax : function (id, type) {
            id = typeof id === "string" ? id : id.property?id.property.id:null;
            var self = SELF;
            if (options.moveUrl && id && type) {
                $.ajax({
                    url         : options.moveUrl,
                    type        : "post",
                    data        : { id:id, type:type },
                    dataType    : "html",
                    beforeSend  : function() {},
                    complete    : function() {},
                    error       : function() {},
                    success     : function() {
                        self.triggerEvent("move", id, type);
                        self=null;
                    }
                });
            }
        }
    });

    // HoverIn
    SELF.ui.delegate(".stree-node", "mouseenter", function (event) {
        var id = this.getAttribute("data-id"),
            tools = SELF.hoverTools (id);
        $(this).addClass("stree-node-hover")
        .find(".stree-node-tools").css({display:"inline"}).html(tools);
    })

    // HoverOut
    .delegate(".stree-node", "mouseleave", function (event) {
        $(this).removeClass("stree-node-hover")
        .find(".stree-node-tools").hide().html("");
    })

    // 新增
    .delegate(".stree-add", "click", function (event) {
        event.stopPropagation();
        var id = this.parentNode.parentNode.getAttribute("data-id");
        SELF.nodeAddHandle(id);
    })

    // 上移
    .delegate(".stree-moveup", "click", function (event) {
        event.stopPropagation();
        var id = this.parentNode.parentNode.getAttribute("data-id");
        SELF.nodeMoveup(id);
    })

    // 下移
    .delegate(".stree-movedown", "click", function (event) {
        event.stopPropagation();
        var id = this.parentNode.parentNode.getAttribute("data-id");
        SELF.nodeMovedown(id);
    })

    // 编辑
    .delegate(".stree-edit", "click", function (event) {
        event.stopPropagation();
        var id = this.parentNode.parentNode.getAttribute("data-id");
        SELF.nodeEditHandle(id);
    })

    // 删除
    .delegate(".stree-delete", "click", function (event) {
        event.stopPropagation();
        var id = this.parentNode.parentNode.getAttribute("data-id");
        SELF.nodeDelete(id);
    });

}