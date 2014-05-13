;(function(tbc, $) {

    "use strict";

    /**
     * 组织选择器
     * @class tbc.accordionSelector
     * @constructor
     * @param {Object} settings 配置数据
     *     @param {Boolean} [settings.autoSelect=true] 是否自动选中被标识为选中状态的节点，
     *      如果没有被标识为选中的节点，则选中第一个节点；
     *     @param {Element} settings.container 渲染手风琴选择器的HTML元素
     *     @param {Boolean} [settings.includeChild=undefined] 是的包含子节点
     *     @param {Boolean} [settings.multiple=true] 是否支持按住ctrl时多选
     *     @param {Number} [settings.height=356] 选择器的高度，默认“356px”
     *     @param {Object} [settings.treeOptions] 见<a href="tbc.Tree.html">tbc.Tree</a>类的参数
     *     @param {Object} [settings.accordionOptions] 见<a href="tbc.Accordion.html">tbc.Accordion</a>类的参数
     *     @param {Array} settings.items 手风琴选项卡列表
     *     @param {String} settings.items[].title 选项卡名称
     *     @param {String} settings.items[].type [description]
     */
    tbc.accordionSelector = function (settings) {

        var SELF = tbc.self(this, arguments),
            defaults = {
                autoSelect   : true,
                container    : null,
                //includeChild : false,
                multiple     : true,
                height       : 356,
                treeOptions  : {},
                accordionOptions : {},
                items        : [
                    {
                        title    : i18n('v4.js.organization'), //"部门",
                        type     : "ajax", 
                        nodeType : "ORGANIZATION",
                        content  : "",
                        active   : true, 
                        options  : {}
                    },
                    {
                        title    : i18n('v4.js.post'), //"岗位",
                        type     : "ajax",
                        nodeType : "POSITION_CATEGORY",
                        content  : "",
                        options  : {}
                    },
                    {
                        title    : i18n('v4.js.group'),//"群组",
                        type     : "ajax",
                        nodeType : "GROUP_CATEGORY",
                        content  : "",
                        options  : {}
                    }
                ],
                event        : {
                    /*
                    selected : function (id, text) {
                        // selected = [ {id:"id", text:"text"},... ]
                    },

                    unselected : function (id, text) {
                        // selected = [ {id:"id", text:"text"},... ]
                    },

                    complete : function (selected) {

                    }
                    */
                }
            },
            options = tbc.extend({}, defaults, settings),
            active = 0,
            accordion,
            pos;

        SELF.packageName = "tbc.orgSelector";

        SELF.addEvent(options.event);

        if (!options.container) {
            SELF.container = $('<div class="tbc-orgSelector"></div>');
            SELF.ui = options.ui ? $(options.ui) : SELF.container;
        } else {
            SELF.container = $(options.container);
            SELF.ui = options.ui ? $(options.ui) : SELF.container;
        }

        pos = SELF.container.css("position");
        if (pos !== "position" && pos !== "fixed") {
            SELF.container.css("position", "relative");
        }

        options.accordionOptions = $.extend({height:options.height}, options.accordionOptions);

        function isIncludeChild(opt) {
            var undef;
            return opt.includeChild!==undef ?
                    opt.includeChild :
                    ((options.includeChild && opt.nodeType==='ORGANIZATION') || undef);
        }

        accordion = new tbc.Accordion(options.accordionOptions);
        SELF.accordion = accordion;

        accordion.depend(SELF);
        accordion.appendTo(SELF.container);
        accordion.addEvent({
            retire : function(tab) {
                tab.header.find('.tbc-accordion-includeChild').hide();
            },
            active : function (tab) {

                var guid, tree, treeOpt, loading,
                    opt = tab.container.data("options");

                if (typeof isIncludeChild(opt) !== 'undefined') {
                    tab.header.find('.tbc-accordion-includeChild').show();
                }

                try {
                    SELF.includeChild = tab.header.find("[name^='includeChild']")[0].checked;
                } catch(e) {}

                if (tab && tab.container) {
                    if (tab.container.data("rendered") || tab.container.data("rendering")) {
                        if (options.autoSelect !== false) {
                            guid = tab.container.data("treeId");
                            tree = tbc.TASKS(guid);

                            if (!tree) {
                                return;
                            } else {
                                tree.setCurrent();
                            }
                        }
                    } else {
                        if (opt.type === "ajax" && typeof opt.content === "string") {
                            loading = $("<div/>").html("loading...").css({ margin:"1em", textAlign:"center" }).appendTo(tab.container);
                            treeOpt = $.extend({}, opt.treeOptions, {
                                nodeType  : opt.nodeType,
                                url       : opt.content,
                                container : tab.container,
                                param     : {
                                    nodeType : opt.nodeType
                                }
                            });
                            tree = new tbc.Tree(treeOpt);

                            tree.depend(SELF);
                            tree.addEvent({
                                afterRender : function() {
                                    var tree_1 = this;
                                    if (options.autoSelect !== false) {
                                        setTimeout(function() { tree_1.setCurrent(); }, 100);
                                    }
                                    loading.remove();
                                    tbc.unlock (tab.container);
                                    tab.container.data("rendering", false);
                                    SELF.triggerEvent("afterLoad", tab);
                                    loading = tab = null;
                                },
                                select: function(a, b, c, dbl) {
                                    console.log(arguments);
                                    SELF._selected = a;
                                    SELF.triggerEvent("select", a, a.tp||a.nodeType, dbl);
                                    SELF.triggerEvent("selected", a, a.tp||a.nodeType, dbl);
                                },
                                deselect    : function(list) {
                                    return SELF.triggerEvent("deselect", list);
                                },
                                beforeLoad    : function() {tbc.lock(tab.container, 10);},
                                afterLoad    : function() {
                                    tbc.unlock(tab.container, 10);
                                }
                            });

                            tab.container.data("treeId", tree.guid);

                            setTimeout(function() {
                                tree.load();
                                tree=null;
                            }, 1);

                        } else if (typeof opt.content === "object") {
                            tab.container.append(opt.content);
                        }

                        tab.container.data("rendered", true);
                    }
                }
                SELF.triggerEvent("active", tab);
            }
        });

        SELF.extend ({
            setHeight: function(height) {
                this.container.height(height);
                var aviHei = this.container.innerHeight(),
                    currTab = this.getCurrent(),
                    guid = currTab.container.data("treeId"),
                    tree = tbc.TASKS(guid);

                this.triggerEvent('resize', aviHei);
            },
            appendTo : function (box) {
                if ($(box).size()) {
                    this.ui.appendTo(box);
                }
            },
            prependTo : function (box) {
                if ($(box).size()) {
                    this.ui.prependTo(box);
                }
            },
            getCurrent : function() {
                return this.accordion.getCurrent();
            },
            getSelected : function() {
                return this._selected;
            }
        })
        .addEvent({
            resize: function(height) {
                accordion.setHeight(height);
            }
        });

        $.each(options.items, function (i) {
            var undefine,
                title    = $('<h3 class="tbc-accordion-itemHeader"/>').html(this.title).appendTo(SELF.container),
                cont    = $('<div class="tbc-accordion-itemContainer"/>').appendTo(SELF.container).hide(),
                icon    = this.icon ?
                     (this.icon.match(/(jpg|jpeg|png|gif|bmp)/) ?
                        '<i class="tbc-icon"><img src="'+ this.icon +'"/></i>' :
                        '<i class="tbc-icon '+ this.icon +'"></i>')
                     : null,
                isInclude, include;

            if (icon) {
                title.prepend (icon);
            }

            // 包含子类
            isInclude = isIncludeChild(this);
            include = $ ('<div class="tbc-accordion-includeChild"></div>')
                .html('<input type="checkbox" name="includeChild_'+ i +'" '+ ((isInclude)?' checked="checked" ':'') +' /><label for="includeChild_'+ i +'">'+ i18n('v4.js.includeSubCls') +'</label>');

            //include.show();
            //如果是全局属性设置了includeChild, 则仅视为部门包含子类；
            if (typeof(isInclude)!=="undefined") {
                //include.hide().css({display:"block"});
            } else {
            }
                include.show().css({display:"none"});

            // 切换包含子类
            include.find("[name='includeChild_"+ i +"']").click(function() {
                SELF.includeChild = this.checked;
                SELF.triggerEvent ("includechild", this.checked);
            });
            title.append(include);

            cont.data ("options", this);

            accordion.appendItem({ header:title, container:cont });

            title = cont = icon = null;
            if (this.active) {
                active=i;
            }
        });

        accordion.setCurrent(active);
    };
}(tbc, jQuery));
