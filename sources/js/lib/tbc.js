/**
 * -+ 时代光华JS库 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 * 此库主要实现代码层的一些功能，集合了一些常用的功能方法，
 * tbc.self方法和tbc.extend方法组合一起实现了类的继承以及多
 * 继承，此外tbc.extend还可以用于合并两个对象的属性；
 * tbc.self和tbc.extend是此库的核心方法，基本实现了类的管理、
 * 扩展、继承、销毁等功能；
 *
 * @namespace tbc
 * @main tbc
 * @global
 * @static
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */

;(function(window, $) {

    "use strict";

    var tbc,
        methods,
        /* 浏览器识别 */
        ua      = window.navigator.userAgent,
        rwebkit = /(webkit)[ \/]([\w.]+)/,
        ropera  = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        rmsie   = /(msie) ([\w.]+)/,
        rmozilla= /(mozilla)(?:.*? rv:([\w.]+))?/,
        browserMatch, classExtend;

    // 判断是否可继承
    function canInherit(attr, noInherit) {
        var i;
        if (typeof attr !== "string") {
            return;
        }
        for (i=0; i<noInherit.length; i+=1) {
            if (attr === noInherit[i]) {
                return false;
            }
        }

        return true;
    }

    function uaMatch(ua) {
        ua = ua.toLowerCase();

        var match = rwebkit.exec(ua) ||
            ropera.exec(ua) ||
            rmsie.exec(ua) ||
            ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];

        return {browser: match[1] || "", version: match[2] || "0"};
    }

    // IE HTML5 支持
    (function() {
        if (!/*@cc_on!@*/0) {
            return;
        }
        var t = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,time,video,section,summary",
            e = t.split(','),
            i = e.length;
        while(i--) { document.createElement(e[i]); }
    }());

    window.console = window.console || { log : function(msg) {} };
    window.tbc = tbc = window.tbc || {nspath:"tbc"};

   /**
    * 创建命名空间
    * @public
    * @method namspace
    * @param {String} ns 命名空间path
    * @param {Object} [obj] 命名空间创建于此对象下，默认window.tbc
    * @example
    * tbc.namespace("tbc.sub1.sub2");
    * @example
    * tbc.namespace("tbc>sub1>sub2");
    * @example
    * tbc.namespace("tbc/sub1/sub2");
    * @example
    * tbc.namespace("tbc\sub1\sub2");
    * @return {Object} 返回创建的命名空间
    */
    tbc.namespace = tbc.ns = function (ns, obj) {
        ns = ns.split(/[.\/\\>]/);
        var namespace = obj || tbc,
            nspath = namespace.nspath || "window",
            i, len;

        for (i = 0, len = ns.length; i < len; i+=1) {
            if (i !== 0 || ns[i] !== "tbc") {
                nspath += "."+ns[i];
                namespace[ns[i]] = namespace[ns[i]] || { superClass: namespace };
                namespace[ns[i]].nspath = namespace[ns[i]].nspath || nspath;
                namespace = namespace[ns[i]];
            }
        }

        try {
            return namespace;
        } finally {
            namespace = nspath = null;
        }
    };

    // 版本号
    tbc.version = "1.0";


    function classExtend() {
        var arg = [this],
            i, k, l, exist;
        this.parentClass = this.parentClass || [];

        for (i=0; i<arguments.length; i+=1) {
            exist = null;
            for (k=0, l=this.parentClass.length; k<l; k+=1) {
                if (this.parentClass[k]===arguments[i]) {
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                this.parentClass.push(arguments[i]);
                arg.push(arguments[i]);
            }
        }

        tbc.extend.apply(this, arg);

        arg = null;
        return this;
    };

    /**
     * 封装实例，用于使用tbc.extend()方法继承类时,统一父类和子类中的this对象;
     * @param  {[type]} algateThis      [description]
     * @param  {[type]} algateArguments [description]
     * @return {[type]}                 [description]
     */
    tbc.self    = function(algateThis, algateArguments) {

        var args = algateArguments||[],
            subc = args[args.length-1],
            self = (subc && typeof(subc)==="object" && subc.subclass) ? subc.subclass : algateThis;

        // 给当前对象增加extend方法
        if (self) {

            self.extend = classExtend;

            // 继承核心类: 事件类和实例管理类
            self.extend(tbc.ClassManager,  tbc.Event);
        }

        try{
            return self;
        }finally{
            args = subc = self = null;
        }
    };

    /**
     * 用于继承类,或者合并对象属性、方法
     * 参数数量不限,为Object类型
     * 后面的将覆盖前面的
     *
     * @method extend
     * @param {Object|Class} obj1
     * @example
     * var a={a:1, b:2}, b={a:7,b:8}, c={c:9}, d={c:10};
     *  tbc.extend(a,b,c,d);
     *  alert(a.c); //结果:10
     * @example
     * function Person() {
     *     this.theName='';
     *     this.age=0;
     * }
     * function Connect() {
     *     this.tel='139****5678';
     *     this.mail='mail@luozhihua.com'
     * }
     *
     * var person_1 = tbc.extend(Person, Connect, {theName:'罗志华'});
     *
     * tbc.log(person_1.theName); // 罗志华
     * tbc.log(person_1.age); // 0
     * tbc.log(person_1.mail); // mail@luozhihua.com
     */
    tbc.extend = function () {
        var args = arguments,
            len  = args.length,
            noInherit = "nspath,superClass,extend,iid,guid,packageName", // 不可继承的属性
            obj, i, p;

        noInherit = noInherit.split(",");

        if (len > 1) {
            for (i = 1; i < len; i+=1) {
                //var _notInherit  = parseProperty(args[i]["notInherit"]),
                //    _notOverride = parseProperty(args[i]["notOverride"]);

                switch(typeof(args[i])) {
                    case "object" :
                        if (args[i] && args[i].constructor === Array && typeof(args[i][0]) === "function") {
                            obj = new args[i][0](args[i][1], {subclass:args[0]});
                        } else {
                            obj = args[i];
                        }
                        break;

                    case "function":
                        obj = new args[i]({subclass:args[0]});
                        break;

                    default:
                        obj = {};
                }

                for (p in obj) {
                    if (obj.hasOwnProperty(p) && canInherit(p, noInherit) !== false) {
                        if (typeof obj[p] !== "undefined") {
                            arguments[0][p] = obj[p];
                        }
                    }
                }
            }
        }

        try {
            return arguments[0];
        } finally {
            args = obj = null;
        }
    };

    browserMatch = uaMatch(ua);
    if (browserMatch.browser) {
        tbc[ browserMatch.browser ] = true;
        tbc.browserVersion = browserMatch.version;
    }

    /**
     * 是否支持触控事件
     * @public
     * @property touchable
     * @type {Boolean}
     */
    tbc.touchable = 'ontouchstart' in document.documentElement;


    /*
     * 公共方法
     */
    methods = {


        /**
        * 获取节点在页面中的坐标区域
        *
        * @public
        * @method getCoordinate
        * @param {Element|jQuery Object} elem HTML元素或jQuery选择结果集
        * @param {Element} offsetParent 相对的上级元素
        * @return {Object} {
        *     top:{number},
        *     bottom:{number},
        *     left:{nuber},
        *     right:{number},
        *     width:{number},
        *     height:{number}
        * }
        */
        getCoordinate: function (elem, offsetParent) {
            elem = $(typeof (elem) === "string" ? document.getElementById(elem) : elem);

            var offset_1 = elem.size() ? elem.offset() : {left:0, top:0},
                offset  =
                {
                    left   : offset_1.left,
                    top    : offset_1.top,
                    bottom : 0,
                    right  : 0,
                    width  : elem.outerWidth(),
                    height : elem.outerHeight()
                };

            offset.right  = offset.left + offset.width;
            offset.bottom = offset.top  + offset.height;

            try {
                return offset;
            } finally {
                offset = elem = offsetParent = offset_1 = null;
            }
        },

        // 获取页面元素的scrollTop和scrollLeft(包括所有上级节点的scrollTop和srollLeft)
        getScroll : function(elem, scrollParent) {
            var scroll={top:0, left:0},
                elem_2 = elem.parentNode;

            if (elem_2 || (elem_2 && elem_2.nodeName === "body")) {
                return scroll;
            }

            while (elem_2 && elem_2 !== (scrollParent||document.body))
            {
                scroll.left += elem_2.scrollLeft||0;
                scroll.top  += elem_2.scrollTop||0;
                elem_2      = elem_2.parentNode;
            }

            try {
                return scroll;
            } finally {
                elem = elem_2 = scrollParent = scroll = null;
            }
        },

        cookie: function (key, value, expires) {
            if (typeof value !== 'undefined') {
                value = '' + value;
                this.setCookie.apply(this, arguments);
            } else {
                return this.getCookie(key);
            }
        },

        setCookie: function (key, value, expires, domain, path) {
            var exdate,
                expiresStr = "";

            if (expires) {
                exdate = new Date();
                exdate.setDate(exdate.getDate() + expires);
                expiresStr = ";expires=" + exdate.toGMTString();
            }

            domain = ';domain='+ (domain || document.location.host);
            path = ';path='+ (path || '/');

            document.cookie = [key, "=", escape(value), expiresStr, path, domain].join('');
        },

        getCookie: function (key) {
            var cookie = document.cookie,
                start, end;
            if (cookie && cookie.length>0) {
                start = cookie.lastIndexOf(key + "=");
                if (start !== -1) {
                    start = start + key.length + 1;
                    end   = cookie.indexOf(";", start);
                    if (end === -1) {
                        end = cookie.length;
                    }
                    return unescape(cookie.substring(start, end));
                }
            }
            return "";
        },


        /**
         * 锁定一个元素(在其上面遮罩一层半透明的DIV)
         * @public
         * @methos lock
         * @param {Element|jQuery Object} HTML元素
         * @param {Number} zIndex 遮罩层的zIndex排序
         * @return {jQuery Object} 遮罩层
         */
        lock    : function(elem, zIndex) {
            elem = $(elem||document.body);

            var css    = typeof(zIndex) === "number" ? {zIndex:zIndex} : zIndex,
                pos = elem.css("position"),
                zin = ($.isNumeric(zIndex)) ? zIndex : this.getMaxZIndex(elem),
                wid = elem.innerWidth(),
                hei = elem.innerHeight(),
                mask= $('<div class="elem_mask"></div>').appendTo(elem);

            css = $.extend({ position:"absolute", top:0, left:0, width:wid, cursor:"wait", height:hei, backgroundColor:"#000", opacity:0.2, zIndex:zin+1}, css);
            mask.css(css);

            if (!pos || pos==="static" || pos==="") {
                elem.css({position: "relative"});
            }

            try { return mask; } finally { elem=pos=mask=zin=css=null; }
        },

        /**
         * 相对于方法lock，把通过lock遮罩的层移除
         * @public
         * @methos unlock
         * @param {Element|jQuery Object} HTML元素
         */
        unlock    : function (elem) {
            elem = $(elem||document.body);
            elem.children(".elem_mask").fadeOut(200, function() {
                $(this).remove();
                elem = null;
            });
        },

        /**
         * 将含有百分号的字符串转换成整型数字
         * @public
         * @method percentToInt
         * @param {String} value 以百分号“%”结尾的字符串形式的数字
         * @param {Number} base 基数, 以此来计算百分数的值
         * @return {Number:int} 返回计算结果
         */
        percentToInt : function(value, base) {
            return (typeof(value) === "string" && value.match(/%$/)) ?
                window.parseInt(value)/100*base :
                value;
        },

        /**
         * 将含有百分号的字符串转换成浮点数
         * @public
         * @method percentToFloat
         * @param {String} value 以百分号“%”结尾的字符串形式的数字
         * @param {Number} base 基数, 以此来计算百分数的值
         * @return {Number:float} 返回计算结果 (含小数)
         */
        percentToFloat : function(value, base) {
            return (typeof(value) === "string" && value.match(/%$/))
                ? window.parseFloat(value)/100*base
                : value;
        },

        /**
         * 按字节数截取字符, 1个中文字符按2个英文字符计算
         * @public
         * @method substr
         * @param {String} str 被截取的字符串
         * @param {Number} len 截取长度
         */
        substr : function (str, len) {

            if (!str || !len) { return str||""; }

            var a = 0, //预期计数:中文2字节,英文1字节
                i = 0, //循环计数
                temp = '';//临时字串

            for (i=0;i<str.length;i+=1) {

                a += (str.charCodeAt(i)>255) ? 2 : 1;

                //如果增加计数后长度大于限定长度,就直接返回临时字符串
                if (a > len) { return temp; }

                //将当前内容加到临时字符串
                temp += str.charAt(i);
            }

            //如果全部是单字节字符,就直接返回源字符串
            return str;
        },

        /**
         * 格式化字符串
         * @public
         * @method formatString
         * @param  {String} str 字符串模板
         * @return {String}     格式化好的字符串
         * @example
         * var str = "{0}，欢迎登录，您现在的IP是{1}",
         *     result = tbc.formatString(str, 'luozhihua', '127.0.0.1');
         * tbc.log(result); // luozhihua，欢迎登录，您现在的IP是127.0.01
         */
        formatString : function(str) {
            if (arguments.length === 0) {
                return "";
            }

            var i, re;
            for(i=1; i<arguments.length; i+=1) {
                re = new RegExp('\\{' + (i-1) + '\\}','gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        },

        /**
         * 格式化字符串模板（简易）
         * @public
         * @method stringTemplate
         * @param  {String} templete 字符串模板
         * @param  {Object} values 要替换的字段
         * @param {Function} transform 将字段值转换成另外的值
         * @return {String}     格式化好的字符串
         * @example
         * var str    = "<em>姓名：{name}；性别：{sex}</em>",\n
              values = {name:luozhihua, sex:male},\n
              trans  = {
                  male : "男",
                  female : "女"
              },
              result = tbc.stringTemplate(str, values, trans);
          tbc.log(result); // <em>姓名：luozhihua；性别：男</em>
         */
        stringTemplate : function(templete, values, transform) {
            if (values && typeof values !== "object") {
                return templete;
            }
            transform = transform||{};

            var k, re;

            for (k in values) {
                if (values.hasOwnProperty(k)) {
                    re = new RegExp('\\{' + k + '\\}','gm');
                    templete = templete.replace(re, transform[values[k]]||values[k]||"");
                }
            }

            templete = templete.replace(/\{\w+\}/g, "");
            return templete;
        },

        // 获取页面中最大的zIndex值
        getMaxZIndex: function (offsetParent) {
            var zindex = 0,
                child;

            offsetParent = $(offsetParent || "body");
            child = offsetParent.children();

            child.each(function (i, o) {
                var z = $(this).css("zIndex");
                    z = (z && !isNaN(z)) ? z : 0;
                zindex = Math.max(zindex, z);
            });

            try {
                return zindex;
            } finally {
                child = offsetParent = null;
            }
        },

        getElementByMaxZIndex : function(n1, n2) {
            n1 = $(n1);
            n2 = $(n2);

            var p1 = n1[0],
            p2 = n2[0],
            _1, _2, z1, z2;

            while(p1 && p1 !== document.body) {
            _1 = p1.offsetParent;
            while(_1 && p2 && p2 !== document.body) {
                _2 = p2.offsetParent;
                if (_2 && _1 === _2) {
                z1 = $(p1).css("zIndex");
                z2 = $(p2).css("zIndex");
                z1 = z1==="auto"?0:z1;
                z2 = z2==="auto"?0:z2;

                var isNext = $(_1).nextAll().index(_2) === -1;
                p1 = p2 = _1 = _2 = null;
                return z1>z2 ? n1 : ((z1 === z2 && isNext)?n1:n2);
                }
                p2 = _2;
            }
            p2 = n2[0];
            p1 = _1;
            }
        },

        /**
        * getCursorPosition Method
        *
        * Created by Blank Zheng on 2010/11/12.
        * Copyright (c) 2010 PlanABC.net. All rights reserved.
        *
        * The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
        */
        getCursorPosition : function (textarea) {
            var rangeData = {text: "", start: 0, end: 0 };
            textarea.focus();
            if (textarea.setSelectionRange) { // W3C
            rangeData.start= textarea.selectionStart;
            rangeData.end = textarea.selectionEnd;
            rangeData.text = (rangeData.start !== rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end): "";
            } else if (document.selection) { // IE
            var i,
                oS = document.selection.createRange(),
                // Don't: oR = textarea.createTextRange()
                oR = document.body.createTextRange();
            oR.moveToElementText(textarea);

            rangeData.text = oS.text;
            rangeData.bookmark = oS.getBookmark();

            // object.moveStart(sUnit [, iCount])
            // Return Value: Integer that returns the number of units moved.
            for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i ++) {
                // Why? You can alert(textarea.value.length)
                if (textarea.value.charAt(i) === '\n') {
                i ++;
                }
            }
            rangeData.start = i;
            rangeData.end = rangeData.text.length + rangeData.start;
            }

            return rangeData;
        },

        /**
        * setCursorPosition Method
        *
        * Created by Blank Zheng on 2010/11/12.
        * Copyright (c) 2010 PlanABC.net. All rights reserved.
        *
        * The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
        */
        setCursorPosition : function (textarea, rangeData) {
            if (!rangeData) {
            alert("You must get cursor position first.")
            }
            if (textarea.setSelectionRange) { // W3C
            textarea.focus();
            textarea.setSelectionRange(rangeData.start, rangeData.end);
            } else if (textarea.createTextRange) { // IE
            var oR = textarea.createTextRange();
            // Fixbug :
            // In IE, if cursor position at the end of textarea, the setCursorPosition function don't work
            if (textarea.value.length === rangeData.start) {
                oR.collapse(false)
                oR.select();
            } else {
                oR.moveToBookmark(rangeData.bookmark);
                oR.select();
            }
            }
        },

        // 设置鼠标光标
        setCursors : function(el,st,end) {
            if (el.setSelectionRange) {
            el.focus();
            el.setSelectionRange(st,end);
            } else {
            if (el.createTextRange) {
                range = el.createTextRange();
                range.collapse(true);
                range.moveEnd("character",end);
                range.moveStart("character",st);
                range.select();
            }
            }
        },

        // 设置鼠标光标
        setCursor : function(el) {
            var range = this.getCursorPosition(el);
            this.setCursorPosition(el, range);
        },

        // 分批执行
        batch : function (queue, size, current, timeout, method, callback, _nextPort) {

            if (!$.isArray(queue)) {
            return false;
            }

            current = current || 0;
            size    = size || 1000; // 设置每批执行的数量,
            timeout    = timeout || 20;

            var start    = current * size,
            length    = queue.length,
            end    = Math.min((current+1)*size, length),
            portion    = queue.slice(start, end);

            // 首批任务
            $.isFunction(method)
            ? method(portion, end === length, current)
            : (window.console&&console.log("Error: tbc.batch(...). arguments[4] must be a function;"));

            // 排队任务
            setTimeout(function() {
            current+=1;
            if (size*(current)<length) {
                tbc.batch(queue, size, current, timeout, method, callback );
            }
            }, timeout);

            if (end === length && $.isFunction(callback)) {
            callback.call(this);
            }
        },

        // 表单串行化
       seriesForm : function(obj) {
            var field = $("input,textarea,select", obj),
                serialize = [],
                checkbox = {}, // 多选框
                selected = [],
                radio = {}, // 单选框
                k;

            field.each(function () {
                var tag = this.tagName.toLowerCase();

                // 如果控件被禁用则跳过
                // if (this.disabled || this.name === "__VIEWSTATE" || this.name === "__EVENTVALIDATION") return true;
                if (this.disabled) {
                    return true;
                }

                switch (tag) {
                    case "input":

                        switch (this.type) {
                            case "checkbox":
                                checkbox[this.name] = checkbox[this.name] || [];
                                if (this.checked) {
                                    checkbox[this.name].push(this.value);
                                }
                                break;

                            case "radio":
                                radio[this.name] = radio[this.name] || [];
                                if (this.checked) {
                                    radio[this.name].push(this.value);
                                }
                                break;

                            case "button":
                            case "reset": break;

                            case "submit":
                                // 用于触发ASP.NET的服务器端事件。
                                if (!$(this).hasClass("trigger_aspnet_event")) {
                                    break;
                                }

                            default:
                                serialize.push([this.name || this.id, encodeURIComponent(this.value)].join("="));
                                break;
                        }
                        break;

                    case "textarea":
                        serialize.push([this.name || this.id, encodeURIComponent(this.value)].join("="));
                        break;

                    case "select":
                        $("option", this).each(function () {
                            if (this.selected) {
                                selected.push(encodeURIComponent(this.value));
                            }
                        });
                        serialize.push([this.name || this.id, selected.join(",")].join("="));
                        break;
                    case "button":
                        serialize.push([this.name || this.id, encodeURIComponent(this.value)].join("="));
                    break;
                }
            });

            field = null;

            // 获取多选框的值
            for (k in checkbox) {
                serialize.push([k, checkbox[k].join(",")].join("="));
            }

            // 获取单选框的值
            for (k in radio) {
                serialize.push([k, radio[k].join(",")].join("="));
            }

            try {
                return serialize.join("&");
            } finally {
                serialize = radio = checkbox = selected = null;
            }
        },

        replaceUrlParam : function(key, value, url) {
            var keys = this.isObject(key) ? key : (function() {var o={}; o[key]=value; return o;})();

            var s = url || document.location.search;
            s = s.substring(s.indexOf("?")+1).split("&");
            var search = {};
            $.each(s, function(i) {
            var ks = this.split("=");
            search[ks[0]] = ks[1]||"";
            });
            $.extend(search, keys);
            return search;
        },

        // 合并路径和文件名
        mergerPath : function (base, url) {
            var base = (base || document.location.href);

            if (url.match(/^https?:\/\//)) {

            if ($.browser.msie && $.browser.version < 6 && false) {
                var lct = document.location;
                var fullHost = lct.protocol + "//" + lct.host + "/";
                var exps = new RegExp("^" + fullHost);
                url = url.replace(exps, "");
                url = url.substring(url.indexOf("/") + 1, url.length);
            } else {
                return url;
            }
            }

            var dt = base.split("?")[0].split("/");
            dt.length--;

            if (!url.match(/^\/{1}/)) {
            while (url.indexOf("../") === 0) {
                url = url.slice(3);
                dt.length--;
            }
            url = unescape(dt.join("/") + "/" + url)
            }

            return url;
        },

        /* 随机字符串 */
        randomString : function(num) {
            num = num ? num-1 : 15; // 字符长度
            var chars = "0123456789abcdefghijklmnoprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+|=-`";

            return (function(m,s,c) {
                return (c ? arguments.callee(m,s,c-1) : '') + s[m.floor(m.random() * s.length)]
            }
           )(Math, chars, num);
        },

        i18nData:{},
        i18n: function(key) {

            var text, noIcon, params,
                icon = '<i class=I18N data-key={0}>{1}<i></i></i>',
                mode = tbc.cookie('translationMode'),
                iconReg = /^\!/;

            noIcon = !!key.match(iconReg);
            key = key.replace(iconReg, '');
            text = key ? (tbc.i18nData[key] || key) : "";
            text = text.replace(/\'/g, '\\\'');

            // 应用参数
            if (arguments.length > 1) {
                params = Array.prototype.slice.call(arguments, 1);
                params = [text].concat(params);

                text = tbc.formatString.apply(tbc, params);
            }

            // 判断是否显示翻译图标
            if (mode === 'true' && !noIcon) {
                if (noIcon) {
                    text = key +'='+ text;
                } else {
                    text = tbc.formatString(icon, key, text);
                }
            }
            return text;
        },

        /**
         * 获取当前语言代码
         * @return {[type]} [description]
         */
        getLocal: function() {
            return tbc.cookie('local_');
        },

        /* 随机颜色 */
        randColor : function(_c)
        {
            return (
            function(m,s,c)
            {
                return (c>0 ? arguments.callee(m,s,c-1): '#') + s[m.floor(m.random() * 16)];
            }
           )(Math, _c||['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f'], 5);
        },

        /* 随机数 */
        random : function(start, end) {
            switch(arguments.length) {
            case 1 : return Math.floor(Math.random()*start+1);
            case 2 : return Math.floor(Math.random()*(end-start+1)+start);
            default : return 0;
            }
        },

        isSight : function(elem) {

            var _el = $(elem)[0] ? $(elem)[0].parentNode : elem;
            var parent = this.getCoordinate($(elem)[0]); // { left:0, top:0 };
            var offset = this.getCoordinate($(elem)[0]);


            if (parent.top<offset.top || parent.top>offset.bottom || parent.left<offset.left)
            {
                return false;
            }

            try{
                return true;
            }finally{
                _el = elem = parent = offset = null;
            }
        },

        inArea : function(area, elem) {
            var a1 = this.getCoordinate(area);
            var a2 = this.getCoordinate(elem);
            a2.centerX = a2.left + (a2.width/2);
            a2.centerY = a2.top + (a2.height/2);

            if (a2.left>a1.left && a2.right<a1.right && a2.top>a1.top && a2.bottom<a1.bottom)
            {
            return true;
            }

            try{
            return false;
            }finally{
            area = elem = a1 = a2 = null;
            }
        },

        // 是否倾斜于该对象内
        isIncline : function(area, elem) {
            var a1 = this.getCoordinate(area);
            var a2 = this.getCoordinate(elem);
            a2.centerX = a2.left + (a2.width/2);
            a2.centerY = a2.top + (a2.height/2);

            if (a2.centerX>a1.left && a2.centerX<a1.right && a2.centerY>a1.top && a2.centerY<a1.bottom)
            {
            return true;
            }

            try{
            return false;
            }finally{
            area = elem = a1 = a2 = null;
            }
        },

        // 对象2和对象1是否有重叠的地方
        isOverlap : function(area, elem) {
            var a1 = $.isPlainObject(area) ? area : this.getCoordinate(area);
            var a2 = $.isPlainObject(elem) ? elem : this.getCoordinate(elem);

            var left   = Math.max(a1.left, a2.left),
            top    = Math.max(a1.top, a2.top),
            right  = Math.min(a1.right, a2.right),
            bottom = Math.min(a1.bottom, a2.bottom);

            try{
            return left<right && top<bottom;
            }finally{
            area = elem = a1 = a2 = null;
            }
        },

        /*
         * 居中窗体
         */
        center : function(elem, container, callback) {

            elem = $(elem);
            container = $(container);

            /* 计算窗口要显示的坐标位置:left、top、width、height */
            var _wid = elem.width(),
                _hei = elem.height(),
                _left= elem.css("left"),
                _top = elem.css("top"),
                pageW, pageH, scrlT, scrlL;

            if (container.size()) {
                pageW = container.innerWidth();
                pageH = container.innerHeight();
                scrlT = container.scrollTop();
                scrlL = container.scrollLeft();
            } else {
                pageW = document.documentElement.clientWidth||document.documentElement.offsetWidth;
                pageH = document.documentElement.clientHeight||document.documentElement.offsetHeight;
                scrlT = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                scrlL = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            }

            /** 水平居中 */
            _left = pageW<_wid ? scrlL : (pageW/2) + scrlL - (_wid/2);

            /** 垂直居中*/
            _top =  pageH<_hei ? scrlT : (pageH/2) + scrlT - (_hei/2);

            elem.css({ top: _top, left: _left, width:_wid, height:_hei});

            callback = callback || container;
            if ($.isFunction(callback)) {
                callback.call(elem);
            }
        },

        array :
        {
            // 去除数组重复项
            unique: function (array) {
                var arr = [],
                    exist,
                    i, len, k;
                for (i=0,len=array.length; i < len; i+=1) {
                    exist = false;
                    for (k=0; k < arr.length; k+=1) {
                        if (array[i] === arr[k]) {
                            exist = true;
                        }
                    }
                    if (exist !== true) {
                        arr.push(array[i]);
                    }
                }
                try { return arr; } finally { arr=null; }
            },

            // 合并数组
            merge: function () {
                var args = arguments,
                    len = args.length,
                    arr = [],
                    i;
                for (i = 0; i < len; i+=1) {
                    if (typeof args[i] === 'object' && args[i].constructor === Array) {
                    arr = arr.concat(args[i]);
                    }
                }

                try { return this.unique(arr); } finally { args=arr=null; }
            },

            // 清理数组
            clear : function (arr) {
                var newArr = [],
                    i, len;
                for (i=0,len=arr.length; i<len; i+=1) {
                    if (typeof arr[i] !== 'undefined') {
                    newArr.push(arr[i]);
                    }
                }
                try { return newArr; } finally { newArr=null; }
            },

            // 删除数组项: 要删除的项作为参数“array”以外的参数
            remove: function (array) {
                var arr = [],
                args = arguments;
                args = tbc.isArray(args[1]) ? [1].concat(args[1]) : args;
                $.each(array, function (k, a) {
                    var d = false, i, len;
                    for (i=1, len = args.length; i < len; i+=1) {
                        if (!d && args[i] === a) {
                            d = true;
                            break;
                        }
                    }

                    if (!d) {
                        arr.push(a);
                    }
                });
                return arr;
            },

            // 获取元素在数组中的位置
            indexOf : function(item_1, arr) {

                var i, len;
                arr = (arr&&typeof(arr) === "object"&&arr.constructor === Array)
                    ? arr : [];
                for(i=0,len=arr.length; i<len; i+=1) {
                    if (item_1 === arr[i]) {
                        return i;
                    }
                }
                return -1;
            },

            sort : function(array, type) {
                var arr;
                if (typeof type == 'string' && type.toLowerCase() === "desc") {
                    arr = array.sort(this.sortASC);
                } else if (typeof type == 'function') {
                    arr = array.sort(type);
                } else {
                    arr = array.sort(this.sortDESC);
                }

                try {
                    return arr;
                } finally {
                    arr = null;
                }
            },

            sortASC : function(a,b) { return a-b; },
            sortDESC :function(a,b) { return b-a; }
            },
            isNumber: function (n) {
                return typeof (n) === "number";
            },
            isString: function (s) {
                return typeof (s) === "string";
            },
            isFunction: function (f) {
                return typeof (f) === "function";
            },
            isNull: function (n) {
                return n === null;
            },
            isBool: function (b) {
                return typeof (b) === "boolean";
            },
            isArray: function (a) {
                return !!a && a.constructor === Array;
            },
            isObject: function (o) {
                return !!o && o.constructor === Object;
            },
        debug: {
            printObj:function(o, v) {
                var s=["{\n"],
                    k;
                for(k in o) {
                    if (o.hasOwnProperty(k)) {
                        s.push(v?("    "+k+":"+o[k]+",\n") : ("    "+k+"; "));
                    }
                }
                s.push("}");
                    return s.join("");
                }
            },
        log : function(t) {
            if (window.console) {window.console.log(t);}
        },
        st : function() {
            this.st.time = new Date().getTime();
            return this.st.time;
        },
        et : function() {
            var et = new Date().getTime(),
                lg = "tbc.et: "+ (et-this.st.time);
            tbc.log(lg);
            return et-this.st.time;
        }
    };
    tbc.extend(tbc, methods);

    if (!window.i18n) {
        window.i18n = function() {
           return tbc.i18n.apply(tbc, arguments);
        };
    }

}(window, jQuery));

(function(){

    /**
     * 为不支持function(){}.bind方法的浏览器扩展Function原型
     * @method bind
     * @for  Function.prototype
     * @param {Object} target 将函数绑定到此对象
     * @param {Any} args* 一个或多个任意类型的参数
     * @return {Function} 返回一个封装好的函数，此函数的this指向
     *         target参数所指定的对象，如果无此参数则指向window对
     *         象。
     */
    Function.prototype.bind = Function.prototype.bind || function() {
        var func   = this,
            target = arguments[0],
            args   = Array.prototype.slice.call(arguments, 1);

        return function() {
            var argsMerged = Array.prototype.concat.apply(args, arguments);
            return func.apply(target, argsMerged);
        }
    }
}());