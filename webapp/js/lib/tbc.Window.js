;(function(tbc, $){

    "use strict";

    tbc.Window = function(settings) {

        var desktop = window.desktop,
            URLS = window.URLS;

        var SELF = tbc.self(this, arguments);

        SELF.extend([tbc.Panel, settings]);

        var defaults = {
              loadType  : "iframe"    // 加载类型,默认为iframe; 其他选项:html,ajax
            , homepage  : null         // 主页地址
            , autoLoad  : true
            , scrolling : true        // 滚动
        };
        var options = $.extend({}, defaults, settings);
        options.homepage = options.homepage || options.url;

        if (options.loadType == 'iframe') {
            options.scrolling = false;
        }

        var toolbar  = $('<div class="tbc-window-toolbar"></div>'),
            winbody  = $('<div class="tbc-window-body" style="'+ (options.scrolling?"overflow:auto;":"") +'"></div>'),
            statebar = $('<div class="tbc-window-statebar"></div>');

        SELF.html(toolbar.add(winbody).add(statebar));
        SELF.addEvent({
            "resize": function() {
                var outerH = this.part.container.innerHeight(),
                    toolsH = toolbar.css("display") !== "none" ? toolbar.outerHeight() : 0,
                    statebarH = statebar.css("display") !== "none" ? statebar.outerHeight() : 0;
                winbody.height(outerH - toolsH - statebarH);
            },
            "load" : function(url, data) {
                // 添加历史记录
                if (this.history) {
                    this.history.add(url, data);
                }
            }
        });

        SELF.container = winbody;
        SELF._html = SELF.html;


        tbc.extend(SELF, {
            init: function() {
                this.packageName = "tbc.Window";
                this.initEvent();
                this.initHistory();
                this.initRoleSwitch();
            },

            /**
             * 初始化事件
             * @private
             * @method initEvent
             */
            initEvent: function() {
                this.addEvent({
                    'open' : function() {
                        if (this.task) {
                            this.task.remove();
                            delete this.task;
                        }
                        this.addTaskbar();
                        this.task.setCurrent();
                    }
                });
            },

            /**
             * 初始化历史记录管理器
             * @private
             * @method initHistory
             */
            initHistory: function() {
                var self = this;
                this.history = new tbc.History(function(record, noNewHistory) {
                    self.load(record.url, record.method, record.data, noNewHistory);
                });

                // 使 this.history 依赖 this 对象: 以在销毁this对象时, 能同时销毁 this.history;
                this.history.depend(this);
            },

            /**
             * 初始化应用角色切换器
             * @private
             * @method initRoleSwitch
             */
            initRoleSwitch: function() {
                var self = this;
                // 角色切换
                if (options.appRoles && options.appRoles.length>1) {

                    this.part.roleList.empty();
                    this.part.roleBox
                    .css({display:"block"})
                    // .show() // IE下无效
                    .bind ({
                        "mouseleave" : function () {
                            self.part.roleList.hide();
                        }
                    });
                    this.part.roleHandle.click(function() {
                        self.part.roleList.show();
                    });
                    this.part.roleName.click(function() {
                        self.part.roleList.show();
                    });

                    $.each (options.appRoles, function (i, role) {

                        if (role.currentRole) {
                            self.part.roleName.html (role.roleName);
                        }

                        $ ("<li/>") .html (role.roleName)
                        .appendTo(self.part.roleList)
                        .click (function() {

                            self.part.roleName.html (role.roleName);
                            self.switchRole(role.roleId, role.roleCode);
                            self.part.roleList.hide();
                            var s=options.originateSettings;
                            options.originateSettings.appRoles[i].currentRole = true;
                            $.each (options.appRoles, function (j) {
                                if (i !== j) {
                                    options.originateSettings.appRoles[j].currentRole = false;
                                }
                            });
                        });
                    });
                } else {
                    this.part.roleBox.hide();
                }
            },

            /**
             * 在任务栏添加一个任务项
             * @private
             * @method addTaskbar
             */
            addTaskbar: function() {
                var self = this;

                if (tbc.Task) {
                    // 创建任务实例
                    this.task = new tbc.Task({
                        title : options.name || options.userDeskItemName,
                        icon  : options.icon
                    });

                    // 使 this.task 依赖 this 对象: 以保证在销毁this对象时, 能同时销毁 this.task;
                    this.task.depend(this);

                    this.task.handle.contextmenu({
                        items : [
                            {text:"最小化", icon:"", click:function() {self.min();}, disabled:function() { return !options.minimizable||self.minimize; },inheritable:true},
                            {
                                text  : function() {return self.sizeType === "max"?"还原":"最大化"},
                                icon  : "",
                                click : function() { if (self.sizeType === "max") {self.restore();}else{self.max();} },
                                disabled:function() {return !options.maximizable},
                                inheritable:true
                            },
                            {text:"关闭", icon:"icon-application_windows_remove", click:function() {self.close();}, inheritable:true},
                            {text:"关闭全部", icon:"icon-remove_outline", click:function() {

                                var win, seq, i;
                                for (seq=tbc.Panel.sequence, i=seq.length; i>=0; i-=1) {
                                    win = tbc.Panel.cache[seq[i]];
                                    if (win && win.close) {
                                        win.close(true);
                                    }
                                }
                                win = null;

                            }, inheritable:true}
                        ]
                    });

                    this.task.handle.bind({
                        "click" : function() {

                            var sceneUi = self.ui.parent(),
                                isCurrScene = sceneUi.hasClass("current"),
                                scene = tbc.system.getTaskByElement(sceneUi),
                                index,
                                state;

                            if (!isCurrScene && scene) {
                                index = scene.index;
                                desktop.show(index);
                            }

                            if (self.minimize) {
                                state = self.sizeType;
                                self.resize(state);
                            } else {
                                if (self.focused) {
                                    isCurrScene ? self.min() : self.flash();
                                } else {
                                    self.focus();
                                    if (self.focused) {
                                        self.task.setCurrent();
                                    }
                                }
                            }

                            sceneUi = isCurrScene = scene = null;
                        }
                    });

                    this.addEvent({
                         "focus" : function() { if (!self.minimize) {self.task.setCurrent();} }
                        ,"show"  : function() { self.task.show(); }
                        ,"hide"  : function() { self.task.hide(); }
                        ,"blur"  : function() { self.task.removeCurrent(); }
                        ,"afterClose"  : function() { self.task.remove();  delete self.task.handle; self=null; }
                        ,"changeTitle" : function(t, n) { self.task.title(n&&t ? n+": "+t : (n||t)); }
                        ,"changeIcon"  : function(i) { self.task.icon(i); }
                        // ,"flash"        : function() { self.task.flash(); }
                    });
                }
            },

            html : function(html) {
                (this.container||winbody).html(html);
                return this;
            },

            tools : {

                store : {},
                length: 0,
                container : toolbar,
                add   : function(tools_1, obj_1) {
                    if (!tools_1) {
                        return this;
                    }

                    toolbar[0].style.display = "block";

                    var tools, id, obj;
                    if (typeof tools_1 === "string" && obj_1) {
                        tools = {};
                        tools[tools_1] = obj_1;
                    }else{
                        tools = tools_1;
                    }

                    for(id in tools) {
                        if (tools.hasOwnProperty(id)) {
                            obj = tools[id];
                            this.store[id] = obj;

                            obj = obj&&obj.ui ? obj.ui : obj;

                            toolbar.append(obj);
                            SELF.triggerEvent("tools.add", obj);

                            this.length += 1;
                        }
                    }

                    SELF.triggerEvent("resize");
                    tools = null;

                    return this;
                },
                get   : function(id) {
                    return this[id];
                },
                remove : function(id) {
                    this.store[id].remove();
                    delete this.store[id];
                    SELF.triggerEvent("tools.remove");
                    this.length-=1;
                    if (this.length<1) {
                        toolbar.hide();
                    }
                    return this;
                },
                clear:function() {
                    var k;
                    for(k in this.store) {
                        if (this.store.hasOwnProperty(k)) {
                            this.remove(k);
                        }
                    }
                    return this;
                }
            },

            reload : function() {
                this.history.prohibited = true;
                var record = this.history.current();
                if (record) {
                    this.load (record.url, record.method, record.data);
                } else {
                    this.load(null, options.data?"post":"get", options.data);
                }
                record = null;
                return this;
            },

            refresh : function() {
                this.load (options.homepage, options.data?"post":"get", options.data);
                return this;
            },

            reset : function() {
                if ((options.windowInitialType !== "MAX" && options.windowInitialType !== "FULL") && this.maximize) {
                    this.restore();
                }
                this.initForOpen(); // 初始化窗口

                this.load (options.homepage, options.data?"post":"get", options.data);
                return this;
            },

            help : function () {

                if (URLS.help) {

                    var loadHelp = function (appId) {

                        var app = window.applicationMap[appId],
                            appCode = app ? (app.appCode || null) : null;

                        $.ajax({
                            url      : URLS.help,
                            type     : "post",
                            data     : {applicationId: appId, appCode:appCode, corpCode: window.corpCode},
                            dataType : "html",
                            complete : function () { tbc.system.helpwin.unlock("loading"); },
                            error    : function () { tbc.system.helpwin.load('<div style="padding:180px 2em; text-align:center;">没有找到与 <strong>'+ (options.applicationName||options.userDeskItemName) +'</strong> 相关的帮助内容.</div>'); },
                            beforeSend : function () { tbc.system.helpwin.lock("loading", "loading..."); },
                            success    : function (html) {
                                tbc.system.helpwin.html("");
                                var tcn  = $('<div class="apphelp-frame"></div>'),
                                    tabs = $(html).find("div.apphelp-tab-frame"),
                                    head = $('<div class="infotitle_a"><ul></ul></div>'),
                                    cont = $('<div class="apphelp-frame-container" style=""></div>'),
                                    tab;

                                if (tabs.size() === 0) {
                                    tbc.system.helpwin.load(html);
                                } else {
                                    tab = new tbc.Tabset({
                                          container : cont
                                        , header    : head.children("ul")
                                        , effects   : "fade"
                                    });

                                    tabs.each(function(i) {

                                        var t         = this.getAttribute("title"),
                                            content   = $(this).children(),
                                            titleNode = $('<li class="">'+ t +'</li>'),
                                            T         = new tbc.Tabpage({
                                                  title      : t
                                                , handleNode : titleNode
                                                , titleNode  : titleNode
                                                , iconNode   : null
                                                , container  : $('<div class="apphelp-tab-frame"></div>').append(content)
                                                , content    : this
                                                , autoShow   : false
                                                , currentClass : "cur"
                                            });
                                        tab.append(T);
                                        tab.dependSelf(T);
                                    });
                                    tab.show(0);

                                    // 依赖关系
                                    tab.depend (tbc.system.helpwin);

                                    // 在载入新内容前,销毁上次创建的内容
                                    tbc.system.helpwin.addEvent ("beforeunload", function () {
                                        $.each (tab.tabs, function() { this.DESTROY(); });
                                        tab.DESTROY();
                                        tcn = tabs = head = cont = tab = null;
                                    });

                                    tcn.append(head);
                                    tcn.append(cont);
                                    tbc.system.helpwin.append(tcn);
                                }
                            }
                        });
                    };

                    if (tbc.system.helpwin) {
                        tbc.system.helpwin.focus().flash().name("帮助 "+ (settings.userDeskItemName || settings.applicationName));
                        loadHelp(options.applicationId || options.userDeskItemId );
                    } else {
                        tbc.system.helpwin = new tbc.Window({
                            name        : "帮助 "+ (settings.userDeskItemName || settings.applicationName),
                            icon        : "icon-comment_question",
                            loadType    : "html",
                            width       : 580,
                            height      : 450,
                            minWidth    : 580,
                            minHeight   : 450,
                            scrolling   : false,
                            resizable   : true,
                            minimizable : true,
                            maximizable : false,
                            refreshable : true
                        })
                        .addEvent("close", function() {delete tbc.system.helpwin;})
                        .show();

                        tbc.system.helpwin.refresh = function () {
                            loadHelp(options.applicationId || options.userDeskItemId);
                        };

                        loadHelp(options.applicationId || options.userDeskItemId);
                    }
                }
            },

            load : function(url, method, data, noHistory) {
                var can = SELF.triggerEvent("beforeunload");
                SELF.loadTime = new Date().getTime();

                url = url || options.homepage;

                if (can !== false || window.confirm("您确定离开该页面吗?")) {
                    _load();
                }

                data = $.extend({}, options.data, data);
                method = method || (options.data && data ? 'post' : 'get');

                function _load() {
                    switch(options.loadType) {

                        case "iframe":
                            SELF.loadByIframe(url, method, data, noHistory);
                            break;

                        case "ajax":
                            SELF.loadByAjax(url, method, data, noHistory);
                            break;

                        case "html":
                            SELF.html(data||url);
                            break;

                        default:

                            break;
                    }
                }

                return SELF;
            },

            loadByAjax : function(url, method, data, noHistory) {
                var SELF = this;

                $.ajax({
                    url     : url,
                    method  : method || (data?"post":"get"),
                    data    : data   || null,
                    error   : function() {},
                    beforeSend : function() {
                        this.ui.addClass('loading');
                    }.bind(this),
                    complete: function() {
                        if (noHistory !== true) {
                            this.addHistory(url, method, data);
                        }
                        this.ui.removeClass('loading');
                    }.bind(this),
                    success : function(html) {
                        html = $.isFunction(options.ajaxResultProcessor) ? options.ajaxResultProcessor(html) : html;
                        if (html !== false) {
                            this.html(html);
                        }
                    }.bind(this)
                });

                return this;
            },

            /**
             * 角色切换
             * @param {String} roleId 角色ID.
             * @param {String} roleCode 角色代码.
             */
            switchRole : function (roleId, roleCode) {
                if (roleId) {
                    var appId = options.applicationId;
                    $.ajax ({
                        url     : tbc.formatString(URLS.switchAppRole, "elos", appId, roleId),
                        dataType: "json",
                        type    : "get",
                        error    : function() {},
                        success    : function(json) {
                            SELF.load(options.homepage, "post", {
                                "current_role_code" : roleCode,
                                "current_role_id"   : roleId,
                                "current_app_id"    : options.userDeskItemId
                            });
                        }
                    });
                }
            },

            matchIframeSrc : function(html) {
                var x, y, z;

                // 网址导航(兼容性代码)
                if (html.match(/http:\/\/hao.qq.com/)) {
                    z = "http://hao.qq.com";
                } else {
                    x = html ? html.match(/<iframe[^>]+>/) : null;
                    y = x&&x[0] ? x[0].match(/src\s*=\s*["']?\s*\S+\s*["']?/) : null;
                    z = y&&y[0] ? y[0].replace(/(src\s*=\s*["']?\s*|\s*["']*\s*>?$)/g,"") : null;
                    z = !z||z.match(/^("|'|,|\+|\()/) ? null : z;
                }

                try { return z; } finally { html = x = y = z = null; }
            },

            /**
             * 判断是否启用历史记录
             * @return {Boolean} 返回true表示已启用，否则未启用
             */
            isHistoryEnable : function () {
                var enable = false,
                    win;
                try {
                    win = this.iframe.contentWindow;
                    enable = win ? win.enableAppHistory : false;
                } catch(e) {

                }
                win = null;

                return enable;
            },

            /**
             * 添加历史记录
             * @param  {Object} request(Object) 请求对象
             *     @param  {String} request.url 请求路径
             *     @param  {String} request.method 请求方法，get或post
             *     @param  {Object} request.data 发送给服务器的数据
             *
             * @param  {String} request 请求路径
             * @param  {String} method 请求方法，get或post
             * @param  {Object} data 发送给服务器的数据
             */
            addHistory : function(request, method, data) {
                var req;

                if (this.noHistory) {
                    delete this.noHistory;
                    return this;
                }

                if (typeof request === 'string') {
                    req = {
                        url    : request,
                        method : method,
                        data   : data
                    }
                } else {
                    req = request;
                }

                if (req && req.url) {
                    this.history.add(req);
                }
            },

            loadByIframe : function (url, method, data, noHistory) {

                var loadTime = this.loadTime,
                    realUrl;

                this.ui.addClass('loading');

                // 存储APP的实际路径
                tbc.Window.iframeUrls = tbc.Window.iframeUrls || {};

                realUrl = tbc.Window.iframeUrls[options.applicationId];

                // 判断app是否已经加载过
                if (false && realUrl) {

                    url = url == options.homepage ? realUrl||url : url || realUrl;

                    this.doLoadByIframe (url || realUrl, method, data, noHistory);
                } else {

                    $.ajax ({
                        url     : url,
                        beforeSend : function() {
                            this.lock ("loading", i18n('v4.js.waitServer'));
                        }.bind(this),
                        success : function(html) {
                            if (loadTime === SELF.loadTime) {
                                var z = SELF.matchIframeSrc(html);

                                url = z || url;

                                SELF.doLoadByIframe (url, method, data, noHistory);

                                if (!realUrl) {
                                    tbc.Window.iframeUrls[options.applicationId] = url;
                                }
                                z = null;
                            }
                        },
                        error    : function() {
                            SELF.doLoadByIframe (url, method, data, noHistory);
                        }
                    });
                }
                return SELF;
            },

            doLoadByIframe : function (url, method, data, callback, noHistory) {

                noHistory = typeof callback === 'boolean' ? callback : noHistory;

                if (noHistory !== true) {
                    this.lock("loading", i18n("v4.js.loadingApp"));
                }

                var queryStr    = [],
                    iframe    = SELF.iframe,
                    iname    = "tbc_window_iframe_"+ SELF.guid,
                    form,
                    _form,
                    k;

                url = url.replace(/#$/, "");

                if (method === "post" && data) {
                    form = $('<form action="'+ url +'" target="'+ iname +'" method="post" enctype="application/x-www-form-urlencoded" style="display:none;"></form>').appendTo(SELF.container);
                    for (k in data) {
                        if (data.hasOwnProperty(k)) {
                            $('<input class="default_data" type="hidden" name="'+ k +'" id="'+ k +'" value="'+ data[k] +'" />').appendTo(form);
                        }
                    }
                    $('<input class="default_data" type="submit" name="submit_default_data" id="submit_default_data" value="submit" />').appendTo(form);

                    setTimeout(function() {
                        form[0].submit();
                        form.find(".default_data").remove();
                        form.remove();
                        form = null;
                    },1);

                }else if (method === "get" && data) {
                    if (typeof(data) === "object") {
                        if (data.constructor === Array) {
                            queryStr = queryStr.concat(data);
                        }else{
                            for(k in data) {
                                if (data.hasOwnProperty(k)) {
                                    queryStr.push([k,data[k]].join("="));
                                }
                            }
                        }
                    }else{
                        queryStr.push(data);
                    }

                    queryStr = queryStr.join('&');

                    url = queryStr==='' ? url : (url.indexOf("?") !== -1
                            ? url + "&" + queryStr
                            : url + "?" + queryStr
                            );

                    this.loadIframe(url);
                }else{
                    this.loadIframe(url);
                }

                // 添加历史记录
                if (noHistory !== true) {
                    this.addHistory(url, method, data);
                } else {
                    this.noHistory = noHistory;
                }

                setTimeout(function() {
                    if (SELF && typeof SELF.unlock === 'function') {
                        SELF.unlock("loading");
                    }
                }, 1000);

                queryStr = iname = iframe = null;
                return SELF;
            },

            loadIframe : function(url) {
                var search, hash, pathname,
                    iframe = this.iframe,
                    ifrUrl,
                    doc;

                try {
                    doc      = iframe.contentWindow;
                    doc      = doc.document;
                    ifrUrl   = doc.location;
                    search   = ifrUrl.search;
                    pathname = ifrUrl.pathname;

                    if (url.indexOf('#') !== -1) {
                        hash     = url.substring(url.indexOf('#')+1);
                        hash     = '!' + hash.replace(/^\!/, '');
                    }
                } catch(e) {}

                if (hash) {
                    if(hash !== '!' && url.indexOf(search)!==-1 && url.indexOf(pathname)!==-1) {
                        ifrUrl.hash = hash;

                        // 如果是IE或不支持hashChange事件的浏览器
                        var browser     = navigator.appName,
                            b_version   = navigator.appVersion,
                            version     = b_version.match(/MSIE/)
                                ? b_version.split(";")[1].replace(/[MSIE ]/g,"")
                                : 0;

                        if ( !$.support.hashchange || (version && version<8 ) ) {
                            try {
                                iframe.contentWindow.$(iframe.contentWindow).trigger('hashchange');
                            } catch(e) {}
                        }

                        return this;
                    }
                }

                iframe.src = url;

                iframe = ifrUrl = search = doc = hash = null;
            }
        })
        .init();

        // 解决iPhone/iPad/Android浏览器不能滑动iframe内容的问题；
        function fixIframeTouchmove() {
            var c = 12,
                t = 1000,
                touchY = 0,
                touchX = 0,
                iframe = this,
                ifrWin = iframe.contentWindow,
                timer;

            timer = setInterval(function() {
                c--;
                try {
                    var ifrDoc = ifrWin.document;

                    // 记录手指按下的位置
                    ifrDoc.body.addEventListener("touchstart", function(event) {
                        touchX = event.targetTouches[0].pageX;
                        touchY = event.targetTouches[0].pageY;
                    });

                    ifrDoc.body.addEventListener("touchmove", function(event) {

                        if (iframe.parentNode.scrollHeight > 20+iframe.parentNode.offsetHeight) {
                            event.preventDefault(); // 阻止整个页面拖动
                        }
                        //event.preventDefault(); // 阻止整个页面拖动

                        var moveX = (touchX - event.targetTouches[0].pageX),
                            moveY = (touchY - event.targetTouches[0].pageY);

                        iframe.parentNode.scrollLeft += moveX;
                        iframe.parentNode.scrollTop  += moveY;
                        this.scrollLeft += moveX;
                        this.scrollTop += moveY;
                        ifrDoc.documentElement.scrollLeft += moveX;
                        ifrDoc.documentElement.scrollTop += moveY;
                    });

                    ifrDoc.body.addEventListener("touchend", function(event) {
                        // alert($(this).css("height"));
                    });

                    clearInterval(timer);
                } catch(e) {
                    // alert("ERROR: "+[e.line,e.message,ifrDoc].join("; "));
                }

                if (c<1) { clearInterval(timer); }

            }, t);
        }

        /**
         * iframe加载完成后调用此方法
         * @return {[type]} [description]
         */
        function onIframeLoad() {
            var iframe = this;
            SELF.ui.removeClass('loading');
        }

        if (options.loadType === "iframe") {
            var iframe;

            SELF.html('<iframe class="tbc-window-iframe" scrolling="auto" frameborder="no" hidefocus="" allowtransparency="true" id="tbc_window_iframe_'+SELF.guid+'" name="tbc_window_iframe_'+SELF.guid+'"></iframe');
            iframe = SELF.iframe = SELF.container.children(".tbc-window-iframe")[0];

            SELF.addEvent({
                "beforeClose" : function() {
                    SELF.returnValue = iframe.contentWindow.returnValue;
                }
            });

            if (tbc.msie && tbc.browserVersion<8) {
                iframe.attachEvent("onload", function() {
                    var t = 10, timer;
                    timer = setInterval(function() {
                        t--;
                        if (t<0) {
                            clearInterval(timer);
                        }

                        $(".tbc-slide-scene.current,.tbc-desktop-slide,.tbc-desktop,body").each(function() {
                            //this.scrollTop = 0;
                            //this.scrollLeft = 0;
                        });
                    }, 500);
                });
                iframe.attachEvent("onfocus", function (event) { event.preventDefault && event.preventDefault(); return false; });
            }

            // iPad及平板电脑等iframe等不能滚动的问题
            if (tbc.touchable) {
                iframe.onload = function() {
                    fixIframeTouchmove.call(this);
                }
            }

            SELF.unlock("loading");

            var iframe = iframe;
            if (iframe.attachEvent) {
                iframe.attachEvent("onload", onIframeLoad);
            } else {
                iframe.onload = onIframeLoad;
            }

            /**
            var _onload = function(event) {
                SELF.lock("loading", "...加载完成...");
                var iframe    = SELF.iframe,
                    idoc;
                try{
                    //idoc    = SELF.iframe.contentWindow.document;
                    //idoc.oncontextmenu = null;
                    //SELF.title(idoc.title);

                    // 点击iframe区域时触发焦点事件
                    if (SELF.history.prohibited) {
                        SELF.history.prohibited = false;
                    }else{
                        SELF.history.add({url:iframe.contentWindow.document.location.href, method:"get", data:null});
                    }

                    if (idoc.addEventListener) {
                        idoc.addEventListener ("click", function() { var s = SELF; s.focus(); s=null; });
                        idoc.addEventListener ("mousedown", function(event) { SELF.ui.trigger("click.hideContextmenu"); });
                    } else {
                        idoc.attachEvent("onclick", function() { var s = SELF; s.focus(); s=null; });
                        idoc.addEventListener ("onmousedown", function(event) { SELF.ui.trigger("click.hideContextmenu"); });
                    }

                    // 右键菜单 *
                    $(idoc).bind({

                        "click" : function() {
                            SELF.focus();
                        },

                        "contextmenu" : function(event) {

                            if (event.ctrlKey) return true;

                            try{
                                var iframe = $(SELF.iframe),
                                    offset = iframe.offset(),
                                    top  = offset.top + event.pageY,
                                    left = offset.left + event.pageX;

                                $(SELF.iframe).trigger("contextmenu", {top:top, left:left, ctrlKey:true});
                            }catch(e) {

                            }finally{
                                iframe = iframe[0] = offset = top = left = null;
                            }

                            return false;
                        },

                        "mousedown" : function() {

                            // 隐藏右键菜单
                            SELF.ui.trigger("click.hideContextmenu");

                        }
                    });
                    //
                    idoc = null;
                }catch(e) {
                    SELF.unlock("loading");
                    if (idoc) idoc = null;
                }
                //SELF.triggerEvent("iframeLoad", iframe);
                SELF.unlock("loading");

                iframe = null;
            }

            var iframe = SELF.iframe;
            if (iframe.attachEvent) {
                iframe.attachEvent("onload", _onload);
            } else {
                iframe.onload = _onload;
            }
            // **

            var iframe = SELF.iframe;
            SELF.addEvent("close.clearIframe", function() {
                var iframe = SELF.iframe,
                    idoc;
                if (iframe.detachEvent) {
                    iframe.detachEvent("onload", _onload);
                } else {
                    iframe.onload = "";
                }
                iframe.src = null;

                try{

                    try{
                        iframe.contentWindow.jQuery('*',iframe.contentWindow.document).each(function(i, e) {
                            (events = iframe.contentWindow.jQuery.data(this, 'events')) && iframe.contentWindow.jQuery.each(events, function(i, e1) {
                                iframe.contentWindow.jQuery(e).unbind(i + '.*');
                            });
                            try{
                                iframe.contentWindow.jQuery.event.remove(this);
                                iframe.contentWindow.jQuery.removeData(this);
                            }catch(e) {}
                        });

                        for (var k in iframe.contentWindow) {
                            try {
                                delete iframe.contentWindow [k];
                            } catch (e) {}
                        }

                    }catch(e) {

                    }

                    iframe.contentWindow.document.write("");
                    iframe.contentWindow.close();
                }catch(e) {
                    var s=e;
                }

                try {
                    idoc    = SELF.iframe.contentWindow.document;
                    $(idoc).unbind("click").unbind("contextmenu").unbind("mousedown").remove();
                    idoc = null;
                } catch (e) {
                    if (idoc) idoc = null;
                }

                iframe.parentNode.removeChild(iframe);

                delete SELF.iframe;
                iframe = null;
            });
            */

            SELF.addEvent("beforeClose.clearIframe", function() {
                var iframe = $(SELF.iframe).hide();
                try {
                    iframe[0].contentWindow.document.write("");
                    iframe[0].contentWindow.document.clear();
                } catch(e) {

                }
                SELF.iframe.src = "about:blank";
                delete SELF.iframe.execute;
                delete SELF.iframe.trigger;
                iframe.remove();
                SELF.iframe = iframe = null;
            });

            // 从iframe内部调用方法
            SELF.iframe.execute = function(method) {
                var para = [];
                for (var i=1; i<arguments.length; i++) {
                    para.push(arguments[i]);
                }

                if (typeof method === 'function') {
                    method.apply(SELF, para);
                } else {
                    SELF[method].apply(SELF, para);
                }
                para = null;
            };

            // 从iframe内部获取窗体属性
            SELF.iframe.property = function(prop) {
                var existProp = SELF[prop];
                return (typeof existProp !== 'function') ? existProp : undefined;
            };

            /* 从插件内部iframe中触发事件;
             * 例:[iframe]window.frameElement.trigger(eventType);
             */
            SELF.iframe.trigger = function(eventType) {
                var para = [eventType];
                for(var i=1; i<arguments.length; i++) {
                    para.push(arguments[i]);
                }
                SELF.triggerEvent.apply (SELF, para);
                para = null;
            };
            //iframe = null;
        }

        // 加载内容
        if (options.homepage && options.autoLoad) {
            options.loadType = options.loadType || (options.data ? 'post' : 'get');
            SELF.load(null, options.loadType, options.data);
        }

        /* 右键菜单 */
        SELF.ui.contextmenu({
            items : [
                "-",
                {
                    text: function() {
                        return !SELF.isHistoryEnable() ? 
                            null : 
                            i18n('v4.js.forward')//"前进"
                    },
                    icon:"",
                    click:function() {
                        SELF.history.forward();
                    },
                    disabled: function() {
                        return SELF.history.isLast();
                    }
                }, {
                    text: function() {
                        return !SELF.isHistoryEnable() ?
                            null:
                            i18n('v4.js.back') //"后退"
                    },
                    icon: "",
                    click: function() {
                        SELF.history.back();
                    },
                    disabled: function() {
                        return SELF.history.isFirst();
                    }
                }, {
                    text : i18n('v4.js.refresh'), //"刷新",
                    icon : "",
                    disabled : !!SELF.reload,
                    click : function() {
                        SELF.reload && SELF.reload();
                    }
                }
            ]
        });

        // 关闭窗口时清除工具栏的按钮
        SELF.addEvent ({
              "afterClose" : function () { SELF.tools.clear(); }
            , "destroy" : function () {
                try {
                    options = settings = defaults = toolbar = statebar = winbody = SELF = null;
                } catch (e) {}
            }
        });

        return SELF;
    };
}(tbc, jQuery));
