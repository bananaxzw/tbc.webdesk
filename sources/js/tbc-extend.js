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
        browserMatch;

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
    
    /**
     * 封装实例，用于使用tbc.extend()方法继承类时,统一父类和子类中的this对象;
     * @param  {[type]} algateThis      [description]
     * @param  {[type]} algateArguments [description]
     * @return {[type]}                 [description]
     */
    tbc.self    = function(algateThis, algateArguments) {
        
        var args = algateArguments||[],
            subc = args[args.length-1],
            self = (subc && typeof(subc)==="object" && subc.subclass) ? subc.subclass : algateThis,
            i, k, l, exist;
        
        // 给当前对象增加extend方法
        if (self) {
            self.extend = function() {
                var arg = [this];
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
                            args[0][p] = obj[p];
                        }
                    }
                }
            }
        }
            
        try {
            return args[0];
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
            return (typeof(value) === "string" && value.match(/%$/))
                ? window.parseInt(value)/100*base
                : value;
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
                return null;
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
        
        /* 随机数 */
        random : function(start, end) {
            switch(arguments.length) {
            case 1 : return Math.floor(Math.random()*start+1);
            case 2 : return Math.floor(Math.random()*(end-start+1)+start);
            default : return 0;
            }
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
                if (type && type.toLowerCase() === "desc") {
                    arr = array.sort(this.sortASC);
                }else{
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

/**
 * 命名空间 
 * @namespace tbc
 */
;(function(tbc, $){

    "use strict";

    /**
     * @class tbc.Event
     * @for  tbc
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.Event = function() {

        // 私有方法: 根据事件名称删除事件
        function REMOVE(eventType, func) {
            if (typeof func === "function") {

                var store = this.eventStorage[eventType],
                    newEvent = [],
                    i, len;

                if (typeof store === "object" && store.constructor === Array) {
                    for (i=0, len=store.length; i<len; i+=1) {
                        if (store[i].toString() !== func.toString()) {
                            newEvent.push(store[i]);
                        }
                    }
                    this.eventStorage[eventType] = newEvent;
                }
            }else{
                this.eventStorage[eventType]=[];
            }
        }

        // 私有方法: 触发事件
        function TRIGGER(eventType, parameters) {

            var result, res,
                store = this.eventStorage[eventType],
                i;

            if (typeof store === "object" && store.constructor === Array) {
                for (i=store.length-1; i>-1; i-=1) {
                    if (typeof(store[i]) === "function") {
                        try {
                            res = store[i].apply(this, parameters);
                            result = res===false ? false : result;

                            // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                            if (res ===true) {
                                return true;
                            }
                        } catch(e) {

                        }
                    }
                }
            }
            return result===false?false:result;
        }

        tbc.self(this, arguments).extend({

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {
                this.packageName = "tbc.Event";
                return this;
            },

            /**
             * 事件存储器 
             * @private
             * @for tbc.Event
             * @property {Object} eventStorage
             * @type {Object}
             */
            eventStorage : {},

            /**
             * 私有方法: 根据事件名称删除事件，如果传入@func参数，则只删除
             * 指定的事件方法，否则删除事件类的所有方法
             * @private
             * @method REMOVE
             * @param {String} eventType 事件类型
             * @param {Function} [func] 回调方法
             */
            REMOVE : function(eventType, func) {
                if (typeof func === "function") {

                    var store = this.eventStorage[eventType],
                        newEvent = [],
                        i, len;

                    if (typeof store === "object" && store.constructor === Array) {
                        for (i=0, len=store.length; i<len; i+=1) {
                            if (store[i].toString() !== func.toString()) {
                                newEvent.push(store[i]);
                            }
                        }
                        this.eventStorage[eventType] = newEvent;
                    }
                } else {
                    this.eventStorage[eventType]=[];
                }
            },

            /**
             * 私有方法: 触发事件，参数parameters会分发给事件类的
             * 所有方法，以数组形式传递，数组的每一个元素都作；
             * 为事件方法的一个参数；
             * @private
             * @method TRIGGER
             * @param {String} eventType 事件类型
             * @param {Array} [parameters] 此参数分发给事件类的所有方法，
             *                             数组的每一个元素都作为事件方法
             *                             的一个参数，parameters有几个元
             *                             素，那么事件方法就会接收到几个
             *                             参数；
             */
            TRIGGER : function(eventType, parameters) {

                var result, res,
                    store = this.eventStorage[eventType],
                    i;

                if (typeof store === "object" && store.constructor === Array) {
                    for (i=store.length-1; i>-1; i-=1) {
                        if (typeof(store[i]) === "function") {
                            try {
                                res = store[i].apply(this, parameters);
                                result = res===false ? false : result;

                                // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                                if (res ===true) {
                                    return true;
                                }
                            } catch(e) {

                            }
                        }
                    }
                }
                return result===false?false:result;
            },

            /**
             * 添加事件方法
             * @public
             * @method addEvent
             * @param  {String} eventType 事件类型
             * @param  {Function} func    事件方法
             * @chainable
             */
            addEvent : function(eventType, func) {

                var t,
                    store = this.eventStorage,
                    events,
                    existing,
                    i, len;

                if (typeof eventType === "object") {
                    for (t in eventType) {
                        if (eventType.hasOwnProperty(t)) {
                            this.addEvent(t, eventType[t]);
                        }
                    }
                    return this;
                }

                if (typeof func === "function") {
                    if ($.isArray(store[eventType])) {
                        events = store[eventType];
                    } else {
                        events = store[eventType] = [];
                    }

                    existing = false;
                    for(i=0, len=events.length; i<len; i+=1) {
                        if (events[i].toString() === func.toString()) {
                            existing = true;
                        }
                    }

                    if (!existing) {
                        store[eventType].push(func);
                    }
                }
                return this;
            },

            /**
             * 移除事件
             * @public
             * @method removeEvent
             * @param  {EventType} eventType 事件类型
             * @param  {Function}  func      事件方法
             * @chainable
             */
            removeEvent : function(eventType, func) {
                var stores = this.eventStorage,
                    e,
                    eventMatch = new RegExp("(^|\\.)" + eventType.substring(eventType.indexOf(".")+1,eventType.length) + "($|\\.)");

                for (e in stores) {
                    if (stores.hasOwnProperty(e) && (e === eventType || e.match(eventMatch))) {
                        this.REMOVE(e, func);
                    }
                }
                stores = null;
                return this;
            },

            /**
             * 触发事件，此方法接收多个参数，除eventType外的其他参数
             * 都将分发给eventType指定的事件类型的所有方法；
             * @public
             * @method triggerEvent
             * @param  {String} eventType* 事件类型
             * @return {Boolean}           如果事件类型的任一方法返回false
             *                             那么此方法也将返回false, 否则返
             *                             回触发此事件的实例；
             */
            triggerEvent : function(eventType) {
                var parameters = [],
                    result, res,
                    stores = this.eventStorage,
                    i,len,e,
                    eventMatch = new RegExp("(^|\\.)" + eventType.substring(eventType.indexOf(".")+1,eventType.length) + "($|\\.)");

                for (i=1,len=arguments.length; i<len; i+=1) {
                    parameters.push(arguments[i]);
                }

                for (e in stores) {
                    if (stores.hasOwnProperty(e) && (e === eventType || e.match(eventMatch))) {
                        res = this.TRIGGER(e, parameters);
                        result = res===false ? false : result;

                        // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                        if (res ===true ) {
                            return false;
                        }
                    }
                }
                stores = null;

                return result===false ? false : this;
            }
        });
    };
}(tbc, jQuery));

;(function(tbc, $){

    "use strict";

    /**
     * 实例存储器
     * @protected
     * @property {Object} TASK_DEPOT
     * @for tbc
     * @type {Object}
     */
    tbc.TASK_DEPOT = tbc.TASK_DEPOT || {};

    /**
     * 实例计数器
     * @protected
     * @property {Number} TASK_DEPOT_COUNT
     * @for tbc
     * @type {Number}
     */
    tbc.TASK_DEPOT_COUNT = tbc.TASK_DEPOT_COUNT || 0;

    /**
     * 实例ID递增器，会根据实例的增加而递增, 初始值为0
     * @protected
     * @property {Number} guid
     * @for tbc
     * @type {Number}
     */
    tbc.guid = tbc.guid || 0;

    /**
     * 根据GUID取得一个实例, 或者存储一个实例（如果有task）
     * @protected
     * @method TASKS
     * @for tbc
     * @param  {Number} id   实例GUID
     * @param  {Object} [task] 任意类型的tbc实例
     * @return {Object}      返回实例，如果没有找到则返回null
     */
    tbc.TASKS = function(id, task) {
        if (!id) {
            return null;
        }
        
        if (task && !tbc.TASK_DEPOT[id]) {
            tbc.TASK_DEPOT[id] = task;
            tbc.TASK_DEPOT_COUNT+=1;
        }else{
            return tbc.TASK_DEPOT[id] || null;
        }
    };

    /**
     * 存储实例，同tbc.TASKS(id, task);
     * @protected
     * @method set
     * @for tbc.TASKS
     * @param  {Number} id    实例GUID
     * @param  {Object} task  实例
     */
    tbc.TASKS.set = function(id,task) {
        this(id,task);
    };

    /**
     * 获取实例
     * @protected
     * @method get
     * @for tbc.TASKS
     * @param  {Number} id 实例GUID
     * @return {Object}     返回找到的实例, 否则返回null
     */
    tbc.TASKS.get = function(id) {
        return this(id);
    };

    /**
     * 删除实例
     * @protected
     * @method del
     * @for tbc.TASKS
     * @param  {Number} id      实例GUID
     */
    tbc.TASKS.del=function(id) {
        var t = tbc.TASK_DEPOT[id],
            depend,
            k;
        if (id && t) {
            try {
                if (t.container) {
                    tbc.TASK_DEPOT[id].container.empty().remove();
                }

                if (t.ui) {
                    tbc.TASK_DEPOT[id].ui.empty().remove();
                }
            } catch(e) {

            }
            
            // 删除依赖对象
            depend    = t.DEPENDS || [];
            tbc.TASKS.killAll(depend);
            
            // 删除对象属性
            for (k in t) {
                if (t.hasOwnProperty(k)) {
                    delete tbc.TASK_DEPOT[id][k];
                }
            }

            t=null;
            delete tbc.TASK_DEPOT[id];
        }
    };

    /**
     * 批量销毁对象
     * @protected
     * @method killAll
     * @for tbc.TASKS
     * @param  {Array} depends 要销毁的实例GUID集合
     */
    tbc.TASKS.killAll = function(depends) {
        if (typeof depends === 'array' && depends.length>0) {

            var k, i, len;

            for (k in tbc.TASK_DEPOT) {
                if (tbc.TASK_DEPOT.hasOwnProperty(k) && tbc.TASK_DEPOT[k].DEPENDS) {
                    for (i=0, len=depends.length; i<len; i++) {
                        if (depends[i] === k) {
                            tbc.TASK_DEPOT[k].DESTROY();
                        }
                    }
                }
            }
        }
    };

    /**
     * 根据GUID取得一个实例, 或者存储一个实例（如果有task）
     * @protected
     * @method getTaskByElement
     * @for tbc
     * @param  {Element} elem HTML Element
     * @return {Object}  返回实例，如果没有找到则返回null
     */
    tbc.getTaskByElement = function(elem) {
        var guid = $(elem).attr("tbc");
            guid = guid || $(elem).parents("[tbc]:first").attr("tbc");

        return tbc.TASKS(guid);
    };

    /**
     * TBC实例管理器
     * @class tbc.ClassManager
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.ClassManager = function(o) {

        tbc.self(this, arguments)
        .extend({
        
            /**
             * 依赖此实例的其他实例GUID存储器，在销毁此实例
             * 时, 同时销毁依赖此实例的其他实例;
             * @private
             * @property {Array} DEPENDS
             * @type {Array}
             */
            DEPENDS : [],
            
            /**
             * 使此实例依赖于另外一个对象
             * @public
             * @method depend
             * @param  {Object} obj 被依赖的对象
             * @chainable
             */
            depend : function(obj) {
                if (tbc.isArray(obj.DEPENDS)) {
                    obj.DEPENDS.push(this.guid);
                }
                return this;
            },

            /**
             * 让另外一个对象依赖本实例
             * @public
             * @method dependSelf
             * @param  {Object} obj 要求依赖此实例的对象
             * @chainable
             */
            dependSelf : function(obj) {
                var guid = typeof obj === "object" ? obj.guid : obj;
                this.DEPENDS.push(guid);
                return this;
            },
            
            /**
             * 解除此实例对某一对象的依赖
             * @public
             * @method ubdepend
             * @param  {Object} obj 正在被此实例依赖的对象
             * @chainable
             */
            undepend : function(obj) {
                if (obj && tbc.isArray(obj.DEPENDS)) {
                    obj.DEPENDS = tbc.array.remove(obj.DEPENDS, this.guid);
                }
                return this;
            },
            
            /**
             * 解除某对象对此实例的依赖
             * @public
             * @method undependSelf
             * @param  {Object} obj 正在依赖此实例的对象
             * @chainable
             */
            undependSelf : function(obj) {
                var guid = typeof obj === "object" ? obj.guid : obj;
                this.DEPENDS = tbc.array.remove(this.DEPENDS, guid);
                return this;
            },
            
            /**
             * 初始化
             * @private
             * @method INIT
             * @chainable
             */
            INIT : function() {
                
                var constr = this.constructor;

                this.packageName = "tbc.ClassManager";

                // 正在被初始化的类的构造器的id
                constr.maxid = constr.maxid || 0;
                constr.maxid = constr.maxid + 1;
                this.iid = constr.maxid;
                constr.count = constr.count&&!isNaN(constr.count)?constr.count+1:1;
                
                // 实例存储器
                tbc.guid += 1;
                this.guid = tbc.guid;
                constr.instance = constr.instance || {};
                this.CREATE_TIME = new Date().getTime();

                this.INIT_INSTANCE();

                this.INSTANCE(this.iid, this);
                tbc.TASKS(this.guid, this);

                return this;
            },
            
            /**
             * 销毁当前对象(销毁自己)
             * @public
             * @method DESTROY
             */
            DESTROY : function() {
                var guid = this.guid,
                    iid  = this.iid;

                this.INSTANCE(iid, "del");
                this.triggerEvent("destroy");
                tbc.TASKS.del(guid, false);
                guid = iid = null;
            },
            
            /**
             * 缓存实例到本实例的构造器（不推荐使用）
             * @public
             * @deprecated 不再推荐使用此方法，实例已经缓存到全
             *             局的tbc.TASK_DEPOD实例缓存器, 不推荐
             *             重复缓存，除非要实现特定的功能；
             * @param  {Number} iid       实例的iid，iid通常是此实例的
             *                            构造类的一个递增器，随着其被
             *                            实例化的次数而递增
             * @param  {Object} instance 某一构造类的实例
             * @chainable
             */
            INSTANCE : function(iid, instance) {
                if (!iid) {
                    return null;
                }

                if (instance === "del" && this.constructor.instance[iid]) {
                    delete this.constructor.instance[iid];
                    this.constructor.count = this.constructor.count-1;
                } else if (instance && !this.constructor.instance[iid]) {
                    this.constructor.instance[iid] = instance;
                } else {
                    return this.constructor.instance[iid] || null;
                }
                return this;
            },

            INIT_INSTANCE : function() {

                // 获取实例
                this.INSTANCE.get = function(id) {
                    return this(id);
                };
                
                // 托管实例
                this.INSTANCE.set = function(id, instance) {
                    this(id, instance);
                };
                
                // 删除托管版本
                this.INSTANCE.del = function(id) {
                    this(id, "del");
                };
            }
        })
        .INIT();
    };
}(tbc, jQuery));

/**
 * 手风琴类
 * @class tbc.Accordion
 * @constructor
 * @copyright http://www.21tb.com
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.Accordion = function (settings) {
        var defaults = {
                  height: 320
                , header: ".tbc-accordion-header"
                , container: null//".tbc-accordion-container"
                , itemHeader: ".tbc-accordion-itemHeader", itemContainer: ".tbc-accordion-itemContainer", currentCss: "current", active: 0 // 初始化时默认显示的项目
                , event: {
                    "titleClick": function () {
                        
                    },
                    "active": function (header, container) {

                    },
                    "retire": function (header, container) {

                    }
                }
            },
            options = tbc.extend({}, defaults, settings); 

            options.height = (!options.height || options.height==="auto") ? 356 : options.height; 

        tbc.self(this, arguments)
        .extend({

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init: function () {
                var SELF = this;

                this.addEvent(options.event);
                this.packageName = "tbc.Accordion";

                if (options.container) {
                    this.ui = $(options.container);
                    this.container = this.ui;
                } else {
                    this.ui = $('<div class="tbc-accordion"></div>');
                    this.container = this.ui;
                }

                this.ui.height(options.height);
                this.crimpleAll();

                // 设置为活动项目
                setTimeout(function () {
                    SELF.setCurrent(options.active, true);
                }, 100);

                this.ui.delegate(options.itemHeader, "click touchend dblclick", function () {
                    var index = $(this).prevAll(options.itemHeader).size();
                    SELF.setCurrent(index);
                });
            },

            /**
             * 获取手风琴tab总数
             * @public
             * @method getSize
             * @return {Number} 返回手风琴页数
             */
            getSize: function () {
                return this.container.children(options.header).size();
            },

            /**
             * 将手风琴显示到容器中
             * @public
             * @method appendTo
             * @param  {Element | jQuery Object} box 目标容器
             * @chainable
             */
            appendTo: function (box_1) {
                var box = $(box_1);
                if (box.size()) {
                    box.append(this.ui);
                }
                return this;
            },

            /**
             * 追加HTML元素或一个手风琴tab页
             * @public
             * @method append
             * @param  {Element | jQueryObeject | Object} module 任何的HTML元素、
             *                    jQuery对象或手风琴tab页，如果参数是Object类型
             *                    并且包含header、container属性，则调用appendItem
             *                    方法。
             * @chainable
             */
            append: function (module) {
                if (module.header && module.container) {
                    this.appendItem.apply(this, arguments);
                } else {
                    this.container.append(module);
                }
                return this;
            },

            /**
             * 追加一个手风琴tab页s
             * @public
             * @method appendItem
             * @param  {Object} module 手风琴tab页.
             *     @param {Element} module.header 手风琴TAB页头.
             *     @param {Element} module.container 手风琴TAB页内容.
             * @chainable
             */
            appendItem: function (module) {
                if (module.header && module.container) {
                    module.container.hide();
                    this.container
                        .append(module.header.addClass("tbc-accordion-itemHeader"))
                        .append(module.container.addClass("tbc-accordion-itemContainer"));
                }
                return this;
            },

            /**
             * 从前面追加HTML元素或一个手风琴tab页
             * @public
             * @method prepend
             * @param  {Element | jQuery Selector | Object} module 任何的HTML元素、
             *                    jQuery对象或手风琴tab页，如果参数是Object类型
             *                    并且包含header、container属性，则调用prependItem
             *                    方法。
             * @chainable
             */
            prepend: function (module) {
                if (module.header && module.container) {
                    this.prependItem.apply(this, arguments);
                } else {
                    this.container.prepend(module);
                }
                return this;
            },

            /**
             * 从前面追加一个手风琴tab页
             * @public
             * @method prependItem
             * @param  {Object} module 手风琴tab页
             *     @param {Element|jQueryObject} module.header 手风琴TAB页头
             *     @param {Element|jQueryObject} module.container 手风琴TAB页内容
             * @chainable
             */
            prependItem: function (module) {
                if (module.header && module.container) {
                    module.container.hide();
                    this.container
                        .prepend(module.container.addClass("tbc-accordion-itemContainer"))
                        .prepend(module.header.addClass("tbc-accordion-itemHeader"));
                }
                return this;
            },

            /**
             * 移除手风琴tab页
             * @public
             * @method removeItem
             * @param  {Number} index 要移除的tab页的序号
             * @return {[type]}       [description]
             */
            removeItem: function (index) {
                var header, container;
                if (index && !isNaN(index)) {
                    header = this.container.children(options.itemHeader).eq(index);
                    container = header.next(options.itemContainer);
                    header.remove();
                    container.remove();
                } else if (typeof(index) === "string") {
                    this.container.children(options.itemHeader).each(function () {
                        if (this.innerHTML.indexOf(index) !== -1) {
                            header = $(this);
                            return false;
                        }
                    });
                    container = header.next(options.itemContainer);
                    header.remove();
                    container.remove();
                }
                header = container = null;
                return this;
            },

            /*
             * 获取手风琴内的所有tab页
             * @public
             * @method getAll
             * @return {Array} [options] 返回手风琴内的所有tab页集合
             *         @header {Element|jQueryObject} 手风琴tab页头
             *         @container {Element|jQueryObject} 手风琴tab页内容
             */
            getAll: function () {
                var items = [],
                    head = this.container.children(options.itemHeader),
                    i,
                    len;
                for (i = 0 , len = head.length; i < len; i += 1) {
                    items.push({
                        "header": $(head[i]), "container": $(head[i]).next(options.itemContainer)
                    });
                }

                try {
                    return items;
                } finally {
                    items = head = null;
                }
            },

            /**
             *
             收起全部手风琴菜单
             * @public
             * @method crimpleAll
             * @chainable
             */
            crimpleAll: function () {
                var conter = this.container,
                    heads = conter.children(options.itemHeader),
                    conts = conter.children(options.itemContainer);

                heads.removeClass(options.currentCss);
                conts.slideUp();
                return this;
            },

            /**
             * 获取Accordion的当前tab页
             * @public
             * @method getCurrent
             * @return {object} 处于活动状态的tab页 {header, container}
             */
            getCurrent: function () {
                var header = this.container.children(options.itemHeader).filter("." + options.currentCss),
                    container = header.next(options.itemContainer);

                try {
                    return header.size() ? { header: header, container: container } : null;
                } finally {
                    header = container = null;
                }
            },

            /**
             * 设置Accordion tab页为活动状态（即展开一个tab页）
             * @public
             * @method setCurrent
             * @param  {Number} index tab页序号
             * @param  {Boolean} force 立即切换
             * @chainable
             */
            setCurrent: function (index, force) {
                index = index === 0 || !index ? 0 : index;

                if (force || !this.isCurrent(index)) {

                    var self = this,
                        curr = this.getCurrent(),
                        future = this.findItem(index);

                    if (curr && future) {
                        curr.header.removeClass(options.currentCss);
                        curr.container.stop().animate({ height: 0 }, 300, function () {
                            curr.container.hide();
                            self.triggerEvent("retire", curr);
                            curr = null;
                        });
                    }

                    if (future) {
                        future.header.addClass(options.currentCss);
                        future.container.show().stop().animate({ height: this.getAvailableHeight() }, 300, function () {
                            future.container.css({overflow: "auto", position: ""});
                            self.triggerEvent("active", future);
                            future = null;
                        });
                    }
                }
                return this;
            },

            /**
             * 判断tab页是否处于展开状态
             * @public
             * @method isCurrent
             * @param  {Number} index
             * @return {Boolean} 返回true表示展开，否则没有展开
             */
            isCurrent: function (index) {
                var itm = this.findItem(index);
                return (itm && itm.header.hasClass(options.currentCss));
            },

            /**
             * 根据索引或者标题查找项目
             * @public
             * @method findItem
             * @param {Number|String} index 数组或者手风琴菜单的标题
             * @return {Object} 返回一个手风琴菜单项的对象，对象结构：
             *      {header:{jQuery Object}, container:{jQuery Object} }
             */
            findItem: function (index) {
                var items = this.getAll(),
                    future,
                    i, len;

                if (index === 0 || (index && !isNaN(index))) {
                    future = items[index];
                } else {
                    for (i = 0, len = items.length; i < len; i += 1) {
                        if (items[i].header.innerHTML.indexOf(index) !== -1) {
                            future = items[i];
                            break;
                        }
                    }
                }

                try {
                    return future;
                } finally {
                    items = future = null;
                }
            },

            /**
             * 获取Accordion的高度
             * @public
             * @method getHeight
             * @return {Number} 返回高度值
             */
            getHeight: function () {
                return this.container.innerHeight();
            },

            /**
             * 设置Accordion的高度
             * @public
             * @method setHeight
             * @param {Number} height 新高度
             * @chainable
             */
            setHeight: function (height) {
                var hei = this.getHeadersHeight();

                this.getCurrent().container.css({ height: height - hei });
                this.ui.css({ height: height });

                this.trigerEvent("resize", height);
                return this;
            },

            /**
             * 获取Accordion的可用高度(Accordion减去所有项目标题的高度)
             * @public
             * @method getAvailableHeight
             * @return {Number} 返回可用高度（内容器高度）
             */
            getAvailableHeight: function () {
                var height1 = this.getHeight(),
                    height2 = this.getHeadersHeight();

                return height1 - height2;
            },

            /**
             * 设置Accordion的可用高度，设置此高度后，整个手风琴的
             * 高度将会根据内容高度变化
             * @public
             * @method setAvailableHeight
             * @param {Number} availHeight 新的内容高度;
             * @chainable
             */
            setAvailableHeight: function (availHeight) {
                var hei = this.getHeadersHeight();

                this.ui.css({ height: availHeight + hei });
                this.getCurrent().container.css({ height: availHeight });

                this.trigerEvent("resize", availHeight + hei);
                return this;
            },

            /**
             * 获取所有项目的标题的高度的和
             * @public
             * @method getHeadersHeight
             * @return {Number};
             */
            getHeadersHeight: function () {
                var height = 0,
                    headers = this.container.children(options.itemHeader),
                    i, len;

                for (i = 0, len = headers.length; i < len; i += 1) {
                    height += $(headers[i]).outerHeight();
                }
                try {
                    return height;
                } finally {
                    height = headers = i = len = null;
                }
            }
        })
        .init();
    }
}(tbc, jQuery));

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
                includeChild : false,
                multiple     : true,
                height       : 356,
                treeOptions  : {},
                accordionOptions : {},
                items        : [
                    {title: "部门", type: "ajax", nodeType: "ORGANIZATION", content: "", active: true, options: {}},
                    {title: "岗位", type: "ajax", nodeType: "POSITION_CATEGORY", content: "", options: {}}, 
                    {title: "群组", type: "ajax", nodeType: "GROUP_CATEGORY", content: "", options: {}}
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

        accordion = new tbc.Accordion(options.accordionOptions);
        SELF.accordion = accordion;

        accordion.depend(SELF);
        accordion.appendTo(SELF.container);
        accordion.addEvent({
            active : function (itm) {

                var guid, tree, treeOpt, opt, loading;

                try {
                    SELF.includeChild = itm.header.find("[name^='includeChild']")[0].checked;
                } catch(e) {}

                if (itm && itm.container) {
                    if (itm.container.data("rendered") || itm.container.data("rendering")) {
                        if (options.autoSelect !== false) {
                            guid = itm.container.data("treeId");
                            tree = tbc.TASKS(guid);

                            if (!tree) {
                                return;
                            } else {
                                tree.setCurrent();
                            }
                        }
                    } else {
                        opt = itm.container.data("options");
                        if (opt.type === "ajax" && typeof opt.content === "string") {
                            loading = $("<div/>").html("loading...").css({ margin:"1em", textAlign:"center" }).appendTo(itm.container);
                            treeOpt = $.extend({}, opt.treeOptions, {
                                nodeType  : opt.nodeType,
                                url       : opt.content,
                                container : itm.container,
                                lazyLevel : 3,
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
                                    tbc.unlock (itm.container);
                                    itm.container.data("rendering", false);
                                    SELF.triggerEvent("afterLoad", itm);
                                    loading = itm = null;
                                },
                                select: function(a, b, c, dbl) {
                                    SELF._selected = a;
                                    SELF.triggerEvent("select", a, a.tp||a.nodeType, dbl);
                                    SELF.triggerEvent("selected", a, a.tp||a.nodeType, dbl);
                                },
                                deselect    : function(list) {
                                    return SELF.triggerEvent("deselect", list);
                                },
                                beforeLoad    : function() {tbc.lock(itm.container, 10);},
                                afterLoad    : function() {
                                    tbc.unlock(itm.container, 10);
                                }
                            });

                            itm.container.data("treeId", tree.guid);

                            setTimeout(function() {
                                tree.load();
                                tree=null;
                            }, 1);

                        } else if (typeof opt.content === "object") {
                            itm.container.append(opt.content);
                        }

                        itm.container.data("rendered", true);
                    }
                }
                SELF.triggerEvent("active", itm);
            }
        });

        SELF.extend ({
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
            isInclude = this.includeChild || ((options.includeChild && this.nodeType==='ORGANIZATION')||undefine);
            include = $ ('<div class="tbc-accordion-includeChild"></div>')
                .html('<input type="checkbox" name="includeChild_'+ i +'" '+ ((isInclude)?' checked="checked" ':'') +' /><label for="includeChild_'+ i +'">包含子类</label>');

            //include.show();
            //如果是全局属性设置了includeChild, 则仅视为部门包含子类；
            if (typeof(isInclude)!=="undefined") {
                include.hide().css({display:"block"});
            } else {
                include.show().css({display:"none"});
            }

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

(function(tbc, $, URLS) {
        
    "use strict";
    
    /**
     * @method tbc.dialog
     * @for tbc
     * 
     * @param {String|jQuery Object} html 显示的内容
     * @param {Object} settings
     * 
     * @copyright 时代光华
     * @author mail@luozhihua.com
     * 
     */
    tbc.dialog = function(html, settings) {
        
        if (html && html instanceof Object && !html.size) {
            settings = html;
            html = settings.html;
        }
        
        if (!(this instanceof tbc.dialog)) {
            return new tbc.dialog(html, settings);
        }
        
        var options = tbc.extend({
            name    : '提示',
            width   : 320,
            height  : 190,
            scrolling : false,
            target  : 'body',
            modal   : true
        }, settings);
        
        tbc.self(this, arguments)
        .extend([tbc.Panel, options], {
            initDialog : function() {
                
                var dialog = this,
                    viewer = $('<div style="overflow:auto;"></div>'),
                    buttons,
                    mask,
                    btns = [],
                    text
                    ;
                
                viewer.append(html||options.html);
                this.append(viewer);
                
                // 按钮
                if (options.buttons instanceof Object) {
                    for (text in options.buttons) {
                        if (options.buttons.hasOwnProperty(text)) {
                            btns.push('<button class="tbc-button" data-type="'+ text +'">'+ text +'</button>');
                        }
                    }
                    
                    if (btns.length>0) {
                        buttons = $('<div style="text-align:right; padding:10px; background-color:#f6f6f6;"></div>');
                        buttons.html(btns.join(''));
                    }
                    
                    // 按钮点击
                    buttons.on('click', 'button', function() {
                        var type = this.getAttribute('data-type'),
                            func = options.buttons[type];
                        if ($.isFunction(func)) {
                            func.call(dialog);
                        }
                    });
                    
                    this.container.css({overflow:'hidden'});
                    this.append(buttons);
                }
                
                // 设置dialog的内容容器
                this.container = viewer;
                this.show();
                this.initModal();
                
                this.addEvent({
                    'close' : function() {
                        var mask = this.mask;
                        
                        if (mask && $.isFunction(mask.fadeOut)) {
                            mask.fadeOut(function() { mask.remove(); });
                        }
                    },
                    'resize': function(size) {
                        var hei,
                            headHei = this.part.header.height(),
                            footHei = this.part.footer.height();
                        
                        if (buttons && $.isFunction(buttons.height)) {
                            hei = size.height - headHei - footHei - buttons.outerHeight();
                        } else {
                            hei = '100%';
                        }
                        
                        viewer.height(hei);
                    }
                });
                
                return this;
            },
            
            initModal : function() {
                var dialog = this;
                
                // 如果是模态对话框
                if (options.modal) {
                    this.mask = $('<div class="tbc-mask"/>').css({
                        position : 'absolute',
                        zIndex   : (this.ui.css('zIndex')||1)-1,
                        backgroundColor : '#000',
                        opacity : 0.2,
                        left    : 0,
                        top     : 0,
                        width   : '100%',
                        height  : '100%'
                    })
                    .insertBefore(this.ui)
                    .bind('click', function() {
                        dialog.flash();
                    });
                }
            }
            
        })
        .initDialog()
        .triggerEvent('resize', options)
        ;
        
        return this;
    };
    
    /**
     * @method tbc.confirm
     * @for tbc
     * @depands tbc.dialog
     
     * @param {String} msg 消息内容
     * @param {Function} callback 回调方法
     * @param {Object} [settings] 弹出框的配置信息
     
     * @copyright 时代光华
     * @author 罗志华
     * @mail mail#luozhihua.com
     * 
     */
    tbc.confirm = function(msg, callback, settings) {
        
        
        var buttons = {};
        
        settings = settings instanceof Object ? settings : {};
        
        buttons[settings.verifyText||'确认'] = function() {
            if ($.isFunction(callback)) {
                callback.call(this);
            }
            this.close();
        };
        
        buttons[settings.cancelText||'取消'] = function() {
            this.close();
        };
        
        settings.buttons = buttons;
        settings.name = settings.name || settings.title || '请您确认';
        msg = $('<div style="padding:24px;"></div>').empty().append(msg);
        
        return tbc.dialog(msg, settings);
    };
    
    /**
     * @method tbc.alert
     * @for tbc
     * @depands tbc.dialog
     
     * @param {String} msg 显示的消息
     * @param {Function} [callback] 回调函数
     * @param {Object} [settings] 弹出框配置
     
     * @copyright 时代光华
     * @author 罗志华
     * @mail mail#luozhihua.com
     * 
     */
    tbc.alert = function(msg, callback, settings) {
        var buttons = {};
        
        settings = settings instanceof Object ? settings : {};
        
        buttons[settings.verifyText||'确认'] = function() {
            if ($.isFunction(callback)) {
                callback.call(this);
            }
            this.close();
        };
        
        settings.buttons = buttons;
        settings.name = settings.name || settings.title || '提示';
        msg = $('<div style="padding:24px;"></div>').append(msg);
        
        return tbc.dialog(msg, settings);
    };
    
}(window.tbc, window.jQuery, window.URLS));

/*
 * @Class:  tb.Button (按钮) ########################################## 
 * 
 * @Copyright    : 时代光华
 * @Author        : 罗志华
 * @mail         : mail@luozhihua.com
 */

tbc.Button = function(settings) {
    var SELF = tbc.self(this, arguments);
    SELF.extend(tbc.Event);
    SELF.extend(tbc.ClassManager);
    SELF.packageName = "tbc.Button";
    
    var defaults = {
          border : true
        , icon     : null
        , text     : "按钮"
        , click     : null
        , target : null
    },
    options = tbc.extend({}, defaults, settings)
    ;
    
    /**
    SELF.ui = $('<a href="#" class="">\
        <span class="tbc-icon icon-application_windows_add"><img src="" onerror="this.style.display=\'none\'" style="width:16px; height:16px;"/></span>\
        <span class="tbc-button-text"></span>\
    </a>')
    .addClass(options.border?"tbc-button":"tbc-button-link");
    /**/
    
    SELF.ui = $('<button class="">\
        <span class="tbc-icon icon-application_windows_add"><img src="" onerror="this.style.display=\'none\'" style="width:16px; height:16px;"/></span>\
        <span class="tbc-button-text"></span>\
    </button>')
    .addClass(options.border?"tbc-button":"tbc-button-link");
    
    
    var icon = SELF.ui.find("img"),
        text = SELF.ui.find(".tbc-button-text");
    
    // 设置或获取按钮图标
    SELF.icon = function(_icon) {
        if (_icon && typeof(_icon) === "string") {
            
            if (_icon.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || _icon.indexOf("sf-server/file/getFile/") !== -1) {
                icon.show().attr("src", _icon)
                .parent().removeAttr("class").addClass("tbc-icon");
            }else{
                icon.hide()
                .parent().removeAttr("class")
                .addClass("tbc-icon")
                .addClass(_icon);
            }
            
            return SELF;
        }else{
            return options.icon;
        }
    }
    
    // 设置或获取按钮文字
    SELF.text = function(_text) {
        if (_text && typeof(_text) === "string") {
            text.html(_text);
            options.text = _text;
            return SELF;
        }else{
            return options.text;
        }
    }
    
    // 禁用
    SELF.disable = function() {
        SELF.disabled = true;
        SELF.ui.addClass("tbc-button-disabled");
        SELF.triggerEvent("disable");
        return SELF;
    }
    
    // 启用
    SELF.enable = function() {
        SELF.disabled = false;
        SELF.ui.removeClass("tbc-button-disabled");
        SELF.triggerEvent("enable");
        return SELF;
    }
    
    // 点击
    SELF.click = function() {
        if (!SELF.disabled) {
            $.isFunction(options.click) && options.click.call(SELF);
            SELF.triggerEvent("click");
        }
        return SELF;
    }
    
    // 加入到目标节点
    SELF.appendTo = function(target) {
        target = target&&target.container ? target.container : target;
        SELF.ui.appendTo(target);
        SELF.triggerEvent("append", target);
        return SELF;
    }
    
    // 移除
    SELF.remove = function() {
        SELF.ui.remove();
        SELF.triggerEvent("remove");
    }
    
    
    SELF.icon(options.icon);
    SELF.text(options.text);
    SELF.appendTo(options.target);
    SELF.ui.click(function() { SELF.click(); });
    
}
 

/*
 * 综合选择器
 */
;(function(tbc, $){
    
    "use strict";
    
    $("html,body").css({ overflow:"hidden", background:"transparent" });
    tbc.blendSelector = function (settings) {
        
        var SELF = tbc.self (this, arguments),
        defaults = {
            max            : 0,
            title        : "选择人员",
            verifyButton: true,
            cancelButton: true,
            verifyText    : "确定",
            cancelText    : "取消"
        },
        options = tbc.extend({}, defaults, settings);
        
        // 注册事件
        SELF.addEvent(options.event);
        
        SELF.packageName = "tbc.blendSelector";
        SELF.ui = $('<div class="tbc-blendSelector"></div>').html(
            '<div role="header" class="tbc-blendSelector-header"><h3>请选择人员</h3><span role="tips"><i class="tbc-icon icon-info"></i>友情提醒:转入”已选人员“的名单即时生效,系统自动保存</span> </div>' +
            '<div role="org" class="tbc-blendSelector-organize"></div>' +
            '<div role="items" class="tbc-blendSelector-items"></div>' +
            '<div style="clear:both;"></div>' +
            '<div role="footer" class="tbc-blendSelector-footer">' +
            '    <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText||"确定") +'</span></a>' +
            '    <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText||"取消") +'</span></a>' +
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
                    '            <option value="ALL" selected="selected">全部人员</option>' +
                    '            <option value="ENABLE">激活人员</option>' +
                    '            <option value="FORBIDDEN">冻结人员</option>' +
                    '        </select>' +
                    '        <div class="abs_right">' +
                    '            <input type="text" value="工号/姓名/用户名" title="工号/姓名/用户名" class="tbc-inputer searchKeywords">' +
                    '            <select name="which">' +
                    '                <option value="0">待选人员</option>' +
                    '                <option value="1">已选人员</option>' +
                    '            </select>' +
                    '            <a class="tbc-button searchButton" type="button">筛选</a>' +
                    '        </div>' +
                    '     </div>' +
                    '</div>');
        
        // 隐藏提示
        if (options.itemSelectorOptions.autoSave===false || options.itemSelectorOptions.lazy===true) {
            SELF.part.tips.hide();
        }
        
        itemSelector.addEvent({
            "beforeSave": function() { tbc.lock(SELF.ui); return false; },
            "afterSave"    : function() { tbc.unlock(SELF.ui); return false; }
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
                lazy    = options.itemSelectorOptions.lazy,
                list    = [];
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

// JavaScript Document organizationSelector
;(function($, tbc) {

    "use strict";

    $("html,body").css({ overflow: "hidden", background: "transparent" });
    tbc.CourseSelector = function (settings) {

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
                '<div role="header" class="tbc-blendSelector-header"><h3>请选择资源</h3><span role="tips"><i class="tbc-icon icon-info"></i>友情提醒:转入”已选“栏的选项即时生效,系统自动保存</span> </div>' +
                '<div role="org" class="tbc-blendSelector-organize"></div>' +
                '<div role="items" class="tbc-blendSelector-items"></div>' +
                '<div style="clear:both;"></div>' +
                '<div role="footer" class="tbc-blendSelector-footer">' +
                '    <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText || "确定") +'</span></a>' +
                '    <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText || "取消") +'</span></a>' +
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
                "COURSE"  : "[课] ",
                "SUBJECT" : "[专题] "
            },
            post : options.post,
            itemTemplate : '<li data-id="{id}" title="{title}" class="{selected} {checked}"><i>{title}</i></li>',
            dataTemplate : {id:"id",text:"title",title:"title"},
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
                        '        <input type="text" value="输入课程编号或名称" title="输入课程编号或名称" class="tbc-inputer searchKeywords">' +
                        '        <select name="device" style="display:'+ (options.itemSelectorOptions.device!==false?'':'none') +';">' +
                        '            <option value="">全部终端</option>' +
                        '            <option value="COMPUTER">PC</option>' +
                        '            <option value="IPHONE">iPhone</option>' +
                        '            <option value="IPAD">iPad</option>' +
                        '            <option value="ANDROIDPHONE">Android</option>' +
                        '            <option value="ANDROIDPAD">Android Pad</option>' +
                        '        </select>' +
                        '        <a class="tbc-button searchButton" type="button">筛选</a>' +
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
                    icn  = accSelector.includeChild ? "含子类" : "";
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
                var s = itemSelector._cache.selected.names,
                    a = [],
                    k;
                for (k in s) {
                    if (s.hasOwnProperty(k) && s[k]) {
                        a.push(s[k]);
                    }
                }
                return a;
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

// JavaScript Document organizationSelector
;
$("html,body").css({ overflow:"hidden", background:"transparent" });
tbc.organizationSelector = function (settings) {
	
	var SELF = tbc.self(this, arguments),
	
	defaults = {
		
	},
	options = tbc.extend({}, defaults, settings);
	
	// 注册事件
	SELF.addEvent(options.event);
	
	SELF.packageName = "tbc.organizationSelector";
	SELF.ui = $('<div class="tbc-blendSelector tbc-organizationSelector"></div>').html(''+
		'<div role="header" class="tbc-blendSelector-header"><h3>请选择组织</h3><span role="tips"><i class="tbc-icon icon-info"></i>友情提醒:转入”已选“栏的选项即时生效,系统自动保存</span> </div>\
		<div role="org" class="tbc-blendSelector-organize"></div>\
		<div role="items" class="tbc-blendSelector-items"></div>\
		<div style="clear:both;"></div>\
		<div role="footer" class="tbc-blendSelector-footer">\
			<a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText||"确定") +'</span></a>\
			<a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText||"取消") +'</span></a>\
		</div>\
	');
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
		isOrganize		: true,
		
		textTransform	: {
			"ORGANIZATION"		: "[部] ",
			"POSITION"			: "[岗] ",
			"POSITION_CATEGORY"	: " ",
			"GROUP"				: "[群] ",
			"GROUP_CATEGORY"	: " "
		},
		post : options.post,
		
		itemTemplate	: '<li data-id="{id}" title="{np}"><i>{nm}</i></li>',
		itemTemplateSelected	: '<li data-id="{id}" title="{np}"><i>{tp}{nm}{parentheses1}{rnm}{icn}{parentheses2}</i></li>',
		dataTemplate	: {id:"id",text:"nm",title:"np"},
		
		vauleSetFormater : function (vals) {
			
			var nodeType = accSelector.getCurrent().container.data("options").nodeType,
				val = {};
			for (var k in vals) {
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
						val[k] = vals[k] ? vals[k] : "";
						break;
					case "icn":
						val[k] = vals[k] ?  vals[k] : ""
						break;
					default:
						val[k] = vals[k];
				}
			}
			try { return val; } finally { val=null; }
		},
		
		// 格式化保存结果
		postFormater	: function(items) {
			var ids = [];
			for (var i=0,len=items.length; i<len; i++) {
				ids.push([ items[i]["ic"], items[i][dt["id"]], items[i]["tp"]||"ORGANIZATION", items[i]["rid"] ].join(":"));
			}
			return ids.join(",");
		},
		
		//
		itemDataFormater : function(items) {
			var nodeType	= accSelector.getCurrent().container.data("options").nodeType,
				node		= accSelector.getSelected() || {};
			
			for (var i=0,len=items.length; i<len; i++) {
				switch (items[i].tp||nodeType) {
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
					
					case "GROUP" : 
					break;
				}
			}
			
			return items;
		}
	});
	
	// 
	options.orgSelectorOptions = $.extend({}, options.orgSelectorOptions, {
		  autoSelect : false // 自动选中某个节点
		, height : 365
	});
	
	var dt = options.itemSelectorOptions.dataTemplate;
	
	var itemSelector	= new tbc.itemSelector(options.itemSelectorOptions),
		accSelector		= new tbc.accordionSelector (options.orgSelectorOptions);
	
	itemSelector.addEvent({
		"beforeSave": function() { tbc.lock(SELF.ui); return false; },
		"afterSave"	: function() { tbc.unlock(SELF.ui); return false; }
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
	$(itemSelector.part.operaRemoveCurrPage).hide();
	$(itemSelector.part.addAll).hide();
	
	$(itemSelector.part.availContainer).parent().hide();
	$(itemSelector.part.selectedContainer).parent().css({width:410});
	
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
			var opt = itm.container.data("options");
			if (opt.nodeType === "POSITION") {
				var treeId = itm.container.data("treeId"),
					tree   = tbc.TASKS(treeId);
				tree && tree.setCurrent();
			}
		},
		"active"	: function(itm) {
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
				var icn		= accSelector.includeChild ? "含子类" : "",
					pro		= list[i].property,
					data	= [{ id:pro.id, tp:pro.tp, nm:pro.nm||pro.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];
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
						icn = accSelector.includeChild ? "含子类" : "";
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
		"select"	: function (list) {
			var accItm	= accSelector.getCurrent(),
				opt		= accItm.container.data("options");
			
			if (opt.nodeType !== "POSITION") {
				this.clearAvailable();
			}
		},
		
		"beforeAvailableLoad" : function() {
			var accItm	= accSelector.getCurrent(),
				opt		= accItm.container.data("options");
			
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
			lazy	= options.itemSelectorOptions.lazy;
		
		if ((autoSave !== false) && lazy===true && options.lazyUrl) {
			var data = options.itemSelectorOptions.post || {};
				data[options.itemSelectorOptions.postKey||"orgIds"] =  options.itemSelectorOptions.postFormater(selected);
			
			$.ajax({
				url	: options.lazyUrl,
				data	: data,
				dataType: "json",
				type	: "post",
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
}

/**
 * 拖动类
 * @class tbc.Drag 
 * @param {Options} setting 配置
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $) {
    
    "use strict";
    
    tbc.Drag = function(settings) {
        
        var SELF = tbc.self(this, arguments)
        , defaults = {
              nodes : null
            , selected : null
            , window : window    // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
            , document : document
            
            , handle : null
            
            , cursor : "move"   // 鼠标样式
            , circles: null // HTMLElement 限制仅在此区域类拖动;
            , circlesRound : {} //    能够超出限定区域的距离,值类别:top/right/bottom/left; 取值范围:百分数、负数、0、正整数; 
            
            , targets : null // 目标节点集;jQuery Selector/DOM/jQuery Object
            , rangeMode : "y"
            , disableInsertTargets : null // 不接受插入新节点的节点
            , timeout : 0
            , pauseTimeout : 40
        }
        , options = tbc.extend({}, defaults, settings)
        , touchable = !!document.documentElement.ontouchstart
        , circles = {}
        , handle  = $(options.handle, options.node)
        
        , mousedownPosition = {left:0, top:0} // 鼠标点击位置
        , lastPosition = {left:0, top:0} // 拖动前的位置
        , pointToNode  = {left:0, top:0} // 点击位置距离被拖动对象顶边和左边的距离
        
        , parents      = options.targets || $(options.node).parent()
        , containers   = []
        , replica      = null
        , timeout      = null
        , pauseTimeout = null
        ;
        
        SELF.packageName = "tbc.Drag";
        SELF.pointer = $('<div></div>').css({
            position:"absolute",zIndex:100, background:"#fff", height:"1px", border:"1px solid #888", borderRadius:"10px", overflow:"hidden", lineHeight:"0", opacity:0.5
        });
        
        
        // 禁用插入的节点
        $(options.disableInsertTargets).data("tbc_drag_"+SELF.guid, true);
        
        SELF.node   = null;
        SELF.replica= [];
        
        SELF.a=function() {alert(options.targets.size());};
        SELF.addContainer = function(box) {
            
            $(box).each(function() {
                containers.push(this);
            });
            options.targets = $(containers);
            
            // 鼠标点击
            $(box).delegate(options.handle, "mousedown", {}, function(event) {
                
                // 如果不是左键则返回
                if ((tbc.msie&&tbc.browserVersion<9 && event.button !== 1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button !== 0)) {
                    return false;
                }
                
                // 禁止选中文字
                $("body").disableSelect();
                
                SELF.node = $(this).parent();
                mousedownPosition.left = event.pageX;
                mousedownPosition.top  = event.pageY;
                
                SELF.init(event);
                event.disableSelectArea = true;
                return false;
            });
        };
        
        SELF.addContainer(parents);
        
        // 移除区域
        SELF.removeContainer = function(box) {
            var con = [];
            options.targets.each(function(i, c) {
                $(box).each(function() {
                    if (c  !== this) {
                        con.push(c);
                    }
                });
            });
            options.targets = $(con);
        };
        
        /*
         * 初始化拖动
         */
        SELF.init = function(event) {
            $ (document).bind({
                "mouseup.tbc_drag": function(event) { SELF.stop(event, SELF.getPositionByEvent(event)); }
            });
            
            if (options.timeout) {
                timeout = setTimeout(function() { SELF.start(event); }, options.timeout);
            } else {
                SELF.start(event);
            }
            
            return SELF;
        };
        
        /*  */
        SELF.getPositionByEvent = function(event) {
            return {left:event.pageX-pointToNode.left, top:event.pageY-pointToNode.top};
        };
        
        /*
         * 开始拖动
         */
        SELF.start = function(event) {
            var offset = SELF.node.offset(),
                bodyScrTop  = document.documentElement.scrollTop||document.body.scrollTop,
                bodyScrLeft = document.documentElement.scrollLeft||document.body.scrollLeft;
            
            SELF.triggerEvent("start", event);
            
            // 创建拖动对象的虚拟对象
            SELF.createReplica();
            
            if (options.rangeMode==="y") {
                SELF.pointer.css({width:SELF.node.width(),height:2}).appendTo("body");
            } else {
                SELF.pointer.css({width:2,height:SELF.node.height()}).appendTo("body");
            }
            
            // 点击位置距离被拖动对象顶边和左边的距离
            pointToNode = {left:event.pageX-offset.left, top:event.pageY-offset.top};
            
            $(document).bind("mousemove.tbc_drag", function(event) { SELF.move(event); });
            
            SELF.starting = true;
        };
        
        /*
         * 移动被拖动对象
         */
        SELF.move = function(event) {
            
            clearTimeout(pauseTimeout);
            pauseTimeout = setTimeout(function() {
                SELF.pause(event);
            }, options.pauseTimeout);
            
            var newPoint = SELF.getPositionByEvent(event); 
                newPoint.right = newPoint.left+1;
                newPoint.bottom = newPoint.top+1;
                
            if (SELF.replica) {
                SELF.moveReplica(newPoint);
            }
            
            SELF.triggerEvent("move", newPoint);
            return SELF;
        };
        
        // 暂停
        SELF.pause = function(event, offset) {
            
            // 遍历所有目标节点,插入临近的位置
            if (options.targets && $(options.targets).size()>0) {
                
                if ((!tbc.msie || (tbc.msie && tbc.browserVersion>7)) && SELF.starting===true) {
                    var locate = SELF.locateInsertPosition(event),
                        offset2 = locate.offset;
                    
                    if (locate.marks.size()) { 
                        SELF.pointer.show().css({
                            width    : options.rangeMode==="y" ? offset2.width : 2,
                            height    : options.rangeMode==="y" ? 2 : offset2.height,
                            left    : offset2.left,
                            top        : locate.replica.top<offset2.halfY ? offset2.top : offset2.bottom
                        });
                    } else {
                        SELF.pointer.hide();
                    }
                }
            }
            
            SELF.triggerEvent("pause", event, offset);
            return SELF;
        };
        
        /*
         * 停止(结束)拖动
         */
        SELF.stop = function(event, offset) {
            
            clearTimeout(timeout);
            clearTimeout(pauseTimeout);
            $(document).unbind(".tbc_drag");
            
            // 允许选中文字
            $("body").enableSelect();
            
            if (SELF.starting !== true) {
                return SELF;
            }
            
            var locate = SELF.locateInsertPosition(event);
            
            SELF.insertTo(locate);
            
            SELF.starting = false;
            SELF.triggerEvent("stop", event);
            
            return SELF;
        };
        
        /*
         * 创建虚拟节点
         */
        SELF.createReplica = function() {
            
            var offset = SELF.node.offset(),
                replica = [],
                nr = {
                    node : SELF.node,
                    clone : SELF.node.clone()
                          .appendTo("body")
                          .css({position:"absolute",zIndex:"100",left:offset.left, top:offset.top, opacity:0.5})
                },
                sel;
            
            replica.push(nr);
            
            if (options.selected) {
                sel = SELF.node.siblings(options.selected);
                sel.each(function(i,o) {
                    var n    = $(this),
                        off = n.offset(),
                        rot = "rotate("+tbc.random(-15,15)+"deg)",
                        rep = {
                            node  : n, 
                            clone : n.clone().appendTo("body").css({
                                position : "absolute",
                                zIndex : "99",
                                left   : off.left,
                                top    : off.top,
                                opacity: (0.5),
                                MozTransform : rot,
                                WebkitTransform : rot,
                                OTransform  : rot,
                                msTransform : rot,
                                transform   : rot
                            })
                        };
                    replica.push(rep);
                    rep.clone.animate(nr.clone.offset(), 800);
                    o = null;
                });
            }
            
            SELF.replica = replica;
            
            offset = replica = nr = null;
            
            return SELF.replica;
        };
        
        /*
         * 移动虚拟节点
         */
        SELF.moveReplica = function(offset) {
            $.each(SELF.replica, function(i, rep) {
                rep.clone.stop().css({left:offset.left, top:offset.top});
            });
            return SELF;
        };
        
        /*
         * 删除虚拟节点
         */
        SELF.deleteReplica = function() {
            
            $.each(SELF.replica, function(i, rep) {
                var off  = rep.transfer ? $(rep.transfer).offset() : $(rep.node).offset(),        
                    left = off.left,
                    top  = off.top;
                    
                rep.clone.animate({top:top, left:left, opacity:0}, 400, function() {
                    rep.clone.remove();
                    delete rep.clone;
                });
            });
            delete SELF.replica;
            return SELF;
        };
        
        SELF.isOpenFor = function(target) {
            var s=true;
            $(options.disableInsertTargets).each(function() {
                if ($(target)[0] === this) {
                    s=false;
                    return false;
                }
            });
            return s;
        };
        
        /*
         * 移动到新的位置
         */
        SELF.insertTo = function(locate) {
            if (!locate) {
                return SELF;
            }
            
            var node    = SELF.node,
                selected= node.siblings(options.selected),
                from    = {
                    node    : node,
                    selected: selected,
                    marks    : locate.marks,
                    from    : node.parent(),
                    to        : locate.transfer || locate.dropBox,
                    offset    : locate.offset
                },
                dropBox = from.to,
                ele, off, verify,
                desktop = window.desktop;
            
            $(locate.dropBox).removeClass("tbc-dragin").parent().removeClass("tbc-dragin-parent");
            
            // 如果目标对象接受拖入新节点
            if (SELF.isOpenFor(dropBox)) {
                
                // 如果位于可拖动的节点上
                if (locate.marks.size()) {
                    
                    ele = locate.marks;
                    off = locate.offset;
                    verify = SELF.triggerEvent("beforeInsert", from);
                    
                    if (verify===false) {
                        $.each(SELF.replica, function(i, rep) { SELF.replica[i].transfer = from.transfer ; });
                        if (locate.marks[0] !== node[0]) {
                            
                            //if (from.terminal) { }
                            
                            SELF.triggerEvent("afterInsert", from);
                            desktop.current().layout();
                        }
                    } else if (locate.marks[0] !== node[0]) {
                        
                        if (locate.replica.top<off.halfY) {
                            node.insertBefore(ele);
                        } else {
                            node.insertAfter(ele);
                        }
                         
                        selected.insertAfter(node);
                        desktop.current().layout();
                            
                        SELF.triggerEvent("afterInsert", from);
                    }
                    ele = off = null;
                }
                
                //  如果位于容器中
                else if (dropBox.size()) {
                    
                    if (SELF.triggerEvent("beforeInsert", from) !== false) {
                        node.appendTo(dropBox);
                        selected.insertAfter(node);
                        desktop.current().layout();
                        SELF.triggerEvent("afterInsert", from);
                    }
                }
            }
            
            SELF.pointer.remove();
            SELF.deleteReplica();
            
            node = selected = from = null;
        };
        
        
        /*
         * 定位容器
         */
        SELF.locateTarget = function(event, rep) {
            
            var overlayDropBox = [],
                dropBox    = {},
                tt = $(options.targets),
                t,r,b,l,o,i;
            
            for (i=0; i<tt.size(); i+=1) {
                o = tt[i];
                l = $(o).offset().left;
                t = $(o).offset().top;
                r = l+o.offsetWidth;
                b = t+o.offsetHeight;
                if ($(o).filter(":visible").size()>0 && tbc.isOverlap({left:l,top:t,bottom:b,right:r}, rep)) {
                    overlayDropBox.push(o);
                }
            }
            
            // 获取排列在最前面的节点
            $.each(overlayDropBox, function(i,o) {
                dropBox.self = dropBox.self||o;
                dropBox.self = $(dropBox.self).find("*").index(o) !== -1 ? o : tbc.getElementByMaxZIndex(dropBox.self, o)[0];
            });
            
            tt.not(dropBox.self)
            .removeClass("tbc-dragin")
            .trigger("dragout")
            .parent().removeClass("tbc-dragin-parent");
            
            if (dropBox.self) {
                $(dropBox.self)
                .addClass("tbc-dragin")
                .trigger("dragin", dropBox)
                .parent()
                .addClass("tbc-dragin-parent");
            }
            
            return dropBox;
        };
        
        /*
         * 定位子节点
         */
        SELF.locateInsertPosition = function(event) {
            
            var rep        = {left:event.pageX, top:event.pageY, right:event.pageX+1, bottom:event.pageY+1},
                dropBox    = SELF.locateTarget(event, rep),
                marks    = null,
                offset    = {};
            
            $(dropBox.self).children(options.node).each(function(i, o) {
                var l    = $(o).offset().left,
                    t    = $(o).offset().top,
                    w    = o.offsetWidth,
                    h    = o.offsetHeight,
                    r    = l+w,
                    b    = t+h,
                    hx    = l+(w/2),
                    hy    = t+(h/2),
                    p    = {left:l, top:t, right:r, bottom:b+10, width:w, height:h, halfX:hx, halfY:hy};
                if (tbc.isOverlap(p,  rep)) {
                    marks    = o;
                    offset    = p;
                    return false;
                }
            });
            
            return {dropBox:$(dropBox.self), transfer:dropBox.transfer, offset:offset, marks:$(marks), replica:rep};
        };
        
        /*
         * 禁用拖动功能
         */
        SELF.disable = function() {
            $(options.node).unbind(".tbc_drag");
            SELF.triggerEvent("disable");
        };
        
        /*
         * 启动拖动
         */
        SELF.enable = function(event) {
            var node = $(options.node);
            node.each(function(i, n) {
                var handle = options.handle ? $(options.handle, n) : $(this);
                if (touchable) {
                    handle.bind("touchstart.tbc_drag", function(event, data) {
                        SELF.start(event, n);
                    });
                } else {
                    handle.bind("mousedown.tbc_drag", function(event, data) {
                        SELF.start(event, n);
                    });
                }
            });
            return SELF;
        };
        
        SELF.maskDoc = function() {
            var mask = $(options.document.body).children('.tbc-drag-mask');
                mask = mask.size() !== 0 ? mask : $('<div class="tbc-drag-mask" />').appendTo(options.document.body);
            mask.show();
        };
        
        SELF.unmaskDoc = function() {
            var mask = $(options.document.body).children('.tbc-drag-mask');
            mask.hide();
        };
        
        SELF.addEvent({
            start : function() {
                this.maskDoc();
            },
            stop : function() {
                this.unmaskDoc();
            }
        });
    };

}(window.tbc, jQuery));
;(function(tbc, $){
    tbc.itemSelector = function (settings) {

        var SELF = tbc.self (this, arguments),

        defaults = {
            availableUrl   : null,// "url or JSON", 可选项
            selectedUrl    : null,            // "URL or JSON", 已选项
            selectUrl      : null,            // 保存选中的项目
            deselectUrl    : null,            // 保存移除的项目
            selectAllUrl   : null,            // 选择所有 
            deselectAllUrl : null,            // 取消所有已选的项
            itemTemplate   : null,
            itemTemplateSelected    : null,
            dataTemplate   : {id:"userId", text:"employeeCode", depict:"userName", title:""},
            htmlFormater   : null,    // function() {},  // 格式化HTML
            resultFormater : null,    // function() {}, // 格式化选择结果
            max        : 0,                // 选择数量限制
            lazy       : false,        // 延迟保存; 默认 false
            postKey    : "userIds",
            autoSave   : true,            // 自动保存
            multiple   : true,                // 多选;默认:true
            dataType   : "html",            // [html,json,xml]
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
                '        <div class="tbc-itemSelector-pagination">' +
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
                '        <div class="tbc-itemSelector-pagination">' +
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
        
        // ui part
        SELF.part = {
            /**
            availTitle        : 0,
            availNum        : 0,
            availContainer    : 0,
            availPageSize    : 0,
            availPrevPage    : 0,
            availPageTyper    : 0,
            availPageTotal    : 0,
            availNextPage    : 0,
            operaList        : 0,
            operaAddSelected    : 0,
            operaRemoveSelected    : 0,
            operaAddCurrPage    : 0,
            operaRemoveCurrPage    : 0,
            selectedTitle        : 0,
            selectedNum            : 0,
            removeAll            : 0,
            selectedContainer    : 0,
            selectedPageSize    : 0,
            selectedPrevPage    : 0,
            selectedPageTyper    : 0,
            selectedPageTotal    : 0,
            selectedNextPage    : 0
            /**/
        };
        
        ui.find("[role]").each (function() {
            var role = this.getAttribute("role");
                SELF.part[role] = this;
                role=null;
        });
        
        // 缓存
        SELF._cache = {
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
        SELF._ajaxDataAvailable = tbc.extend({}, this._cache.selected.page, {includeChild:true, keyword :"" });
        SELF._ajaxDataSelected = tbc.extend({}, this._cache.available.page, {keyword :""});
        
        if (options.max) {
            
            // 限制为1时,禁用选择当前页的按钮
            if (options.max===1) {
                $(SELF.part.operaAddCurrPage)
                .attr("disabled", "disabled")
                .addClass("tbc-button-disabled");
            }
            
            $(SELF.part.maxSelected).append('/<b title="最多只能选择'+ options.max +'项" style="font-weight:bold; color:red; cursor:default; text-decoration:underline;">'+ options.max +'</b>');
        }
        
        SELF.extend ({
            ui    : ui,
            
            container:ui,
            
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
                        url            : options.availableUrl,
                        dataType    : options.dataType,
                        data        : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page, {"page.pageNo":page, lazy:lazy}),
                        type        : "post",
                        beforeSend    : function () {
                            self.triggerEvent("beforeAvailableLoad");
                        },
                        complete    : function () { },
                        error        : function () { },
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
                        url            : options.selectedUrl,
                        dataType    : options.dataType,
                        type        : "post",
                        data        : $.extend ({}, options.post, SELF._ajaxDataSelected, this._cache.selected.page, {"page.pageNo":page, lazy:lazy}),
                        beforeSend    : function () { },
                        complete    : function () { },
                        error        : function () {
                            var sbox = $(self.part.selectedContainer);
                            sbox.find("ul").size() === 0 && sbox.html("<ul></ul>");
                        },
                        success        : function (data) {
                            
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
                
                var self = this;
                $(self.part.availContainer).empty().append(sets.html);
                self.setPagination ("available", sets.page);
                self._cache.available.page = sets.page;
                self._cache.available.list = [].concat(sets.list);
                
                // 禁用或不禁用上一页按钮
                if (sets.page["page.pageNo"]<=1) {
                    $(self.part.availPrevPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.availPrevPage).removeClass("tbc-button-disabled");
                }
                
                // 禁用或不禁用下一页按钮
                if (sets.page["page.pageNo"]>=sets.page.totalPages) {
                    $(self.part.availNextPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.availNextPage).removeClass("tbc-button-disabled");
                }
            },
            
            // 更新已选栏
            updateSelectedPage : function (sets) {
                var self = this;
                $(self.part.selectedContainer).empty().append(sets.html);
                self.setPagination ("selected", sets.page);
                self._cache.selected.page = sets.page;
                
                if (options.autoSave !== false) {
                //    self._cache.selected.list = [].concat(sets.list);
                }
                
                
                // 禁用或不禁用上一页按钮
                if (sets.page["page.pageNo"]<=1) {
                    $(self.part.selectedPrevPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.selectedPrevPage).removeClass("tbc-button-disabled");
                }
                
                // 禁用或不禁用下一页按钮
                if (sets.page["page.pageNo"]>=sets.page.totalPages) {
                    $(self.part.selectedNextPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.selectedNextPage).removeClass("tbc-button-disabled");
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
                pageSize = pageSize||10;
                
                var count = list.length,
                    totalPages = Math.floor(count/pageSize) + (count%pageSize>0?1:0),
                    start = Math.max(0, (page-1)*pageSize),
                    end   = Math.min(count, (page*pageSize)),
                    rows = list.slice(start, end),
                    hasNext    = start !== 0,
                    hasPrev = end !== count;
                    
                return {
                    totalRecords    : count,
                    totalPages        : totalPages,
                    total            : list.length,
                    rows            : rows,
                    "pageSize"    : pageSize,
                    "pageNo"    : page
                }
            },
            
            formatResult    : function (data, template) {
                
                var rs = {
                    html    : "<ul></ul>",
                    page    : {"page.pageSize":10, "page.pageNo":1, "totalPages":0, "total":0},
                    list    : []
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
                                ? data.rows.length>data.pageSize 
                                    ? this.sliceListByPage(data.rows, data.pageNo, data.pageSize).rows 
                                    : data.rows 
                                : null;
                            
                            rs.html = _list ? this.createHtmlByJSON(_list, template) : "";
                            rs.page    = { "page.pageSize":data.pageSize, "page.pageNo":data.pageNo, "totalPages":data.totalPages, "total":data.total };
                            
                            rs.list = data.rows || this.formatList(rs.html);
                            
                            break;
                    }
                }
                try { return rs; } finally { rs=null; }
            },
            
            // 把JSON数据转换成HTML代码
            createHtmlByJSON : function (json, itemTemplate) {
                if (!json) return "";
                var list = $("<ul/>"),
                    arr = tbc.isArray(json) ? json : json.list||[],
                    len = arr.length,
                    model    = itemTemplate || options.itemTemplate || '<li data-id="{userId}" class="{selected} {checked}"><i>{employeeCode}</i><span>{userName}</span></li>',
                    html    = [],
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
                .addClass("checked")
                ;

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
                        url        : options.addUrl,
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
                                alert(result.message);
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
                        url        : options.removeUrl,
                        type    : "post",
                        data    : data,
                        dataType    : "json",
                        beforeSend    : function() {
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
                                alert(result.message);
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
                
                if (options.max && !isNaN(options.max)) {
                    
                    if (this._cache.selected.page.total>=options.max) {
                        alert("您最多只能选择"+options.max+"条.");
                        return false;
                    }
                    
                    var len = items.length,
                        al    = 0;
                    if (this._cache.selected.page.total+len>options.max) {
                        al = options.max-this._cache.selected.page.total;
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
                        type    : "post",
                        dataType: "json",
                        data    : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page),
                        beforeSend    : function() { 
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
                                alert(result.message);
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
                        type    : "post",
                        dataType: "json",
                        data    : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page),
                        beforeSend:function() { 
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete: function() {
                            tbc.unlock(SELF.ui);
                            SELF.pageSelected(1);
                            SELF.pageAvailable(1);
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true && result.message) {
                                alert(result.message);
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
                    url : options.propertiesUrl,
                    type : "post",
                    dataType : "json",
                    data : data,
                    success:function(json) {
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
            }
        });
        
        
        
        //SELF.loadAvailableByPage(1);
        
        // 已选数据
        if (!options.autoSave && typeof options.selectedData === 'string') {
            var ids = options.selectedData.split(",");
            if (ids.length>0) {
                SELF.getPropertiesById(ids);
            }
        } else if (!options.autoSave && $.isArray(options.selectedData)) {
            setTimeout(function() {
                SELF.setSelected(options.selectedData);
            },100);
        } else {
            SELF.loadSelectedByPage(1);
        }
        
        if (options.autoSave===false || options.lazy===true) {
            $(SELF.part.addAll).hide();
        }
        
        $ (SELF.part.availContainer).add(SELF.part.selectedContainer)
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
                
                if (event.ctrlKey && options.multiple && options.max !== 1) {
                    li.hasClass("selected") 
                    ? li.removeClass("selected")
                    : li.addClass("selected");
                } else {
                    li.addClass("selected").siblings().removeClass("selected");
                }
            }
        });
        
        $ (SELF.part.availContainer).add(SELF.part.selectedContainer)
        .delegate("li", "dblclick", function (event) {
            
        });
        
        $(SELF.part.operaAddCurrPage).click(function(event) { SELF.selectCurrentPage(); });
        
        $(SELF.part.operaRemoveCurrPage).click(function(event) { SELF.deselectCurrentPage(); });
        
        $(SELF.part.operaAddSelected).click(function(event) { SELF.selectChecked(); });
        
        $(SELF.part.operaRemoveSelected).click(function(event) { SELF.deselectChecked();  });
        
        $(SELF.part.availPageTyper).keyup(function(event) {
            if (!this.value.match(/^\d+$/)) {}
            if (event.keyCode === 13) {
                var page = parseInt(this.value);
                SELF.pageAvailable(page);
            }
        });
        $(SELF.part.selectedPageTyper).keyup(function(event) {
            if (!this.value.match(/^\d+$/)) {}
            if (event.keyCode === 13) {
                var page = parseInt(this.value);
                SELF.pageSelected(page);
            }
        });
        
        $(SELF.part.availPageSize).change(function(event) {
            SELF._cache.available.page["page.pageSize"] = this.value;
            SELF.pageAvailable();
        });
        $(SELF.part.selectedPageSize).change(function(event) {
            SELF._cache.selected.page["page.pageSize"] = this.value;
            SELF.pageSelected();
        });
        
        $(SELF.part.availPrevPage).click(function(event) {
            var p = SELF._cache.available.page["page.pageNo"]-1;
            SELF.pageAvailable(p);
            
        });
        
        $(SELF.part.availNextPage).click(function(event) {
            
            var p = SELF._cache.available.page["page.pageNo"]+1;
            SELF.pageAvailable(p);
        });
        
        $(SELF.part.selectedPrevPage).click(function(event) {
            
            var p = SELF._cache.selected.page["page.pageNo"]-1;
            return SELF.pageSelected(p);
        });
        
        $(SELF.part.selectedNextPage).click(function(event) {
            
            var p = SELF._cache.selected.page["page.pageNo"]+1;
            return SELF.pageSelected(p);
        });
        
        $(SELF.part.addAll).click(function(event) {
            SELF.selectAll();
        });

        $(SELF.part.removeAll).click(function(event) {
            SELF.removeAll();
        });
    };
}(tbc, jQuery));

/**
 * 数据缓存器
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.jdc = new function() {
	
	var SELF = tbc.self(this);
	
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	
	SELF.packageName = "tbc";
	
	SELF.db = //window.localStorage || window.sessionStorage || 
	{
		store	: {},
		key 	: function(k) {
			if (!isNaN(parseInt(k))) {
				return this.store[k];
			}
			return null;
		},
		
		getItem : function(key) {
			return this.store[key];
		},
		
		setItem : function(key, value) {
			if (value) {
				this.store[key] = value;
			}
			value.KEY = key;
			return value;
		},
		
		removeItem : function(key) {
			this.store[key] = null;
			delete this.store[key];
		}
	};
	
	var tables = {};
	SELF.db.setItem("tables", tables);
	
	/* 数据表 */
	SELF.getTable = function(tableName) {
		return tables[tableName];
	}
	
	// 创建数据表
	SELF.createTable = function(tableName) {
		if (tableName && !tables[tableName]) {
			tables[tableName] = new tbc.jdc.Table(tableName);
			return tables[tableName];
		}
		return;
	}
	
	// 删除数据表
	SELF.dropTable = function(tableName) {
		if (tables[tableName]) {
			tables[tableName].del("all");
			tables[tableName].DESTROY();
			delete tables[tableName];
		}
	}
	
	// 选择数据
	SELF.select = function(from, key) {
		var t = typeof(from) === "string" ? tables[from] : from;
		
		if (t) {
			var r = t.get(key);
			t=null;
			return r || null;
		}
		return null;
	}
	
	// 插入或更新数据
	SELF.set = function(tableName, key_values, orValue) {
		
		var t = tables[ tableName ];
		
		if (!t) {
			t = SELF.createTable(tableName);
		}
		
		if (t) {
			if (typeof key_values === "object") {
				for(var k in key_values) {
					t.set(k, key_values[k]);
				}
			}else{
				t.set(key_values, orValue);
			}
		}
		t=null;
	}
	
	// 删除数据
	SELF.del = function(fromTable, key) {
		
		var t = tables[ fromTable ];
		t && t.del(key);
		t=null;
	}
}

/* 数据表 */
tbc.jdc.Table = function(tableName) {
	var SELF = tbc.self(this);
	
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	SELF.packageName = "tbc.jdc.Table";
	
	SELF.count = 0;
	SELF.store = {};
	SELF.get = function(key, where) {
		var list = [];
		if (key.toLowerCase() === "all"||key === "*") {
			for(var k in SELF.store) {
				list.push(SELF.store[k]);
			}
			return list;
		}else{
			return SELF.store[key] || null;
		}
	}
	
	SELF.set = function(key, value) {
		
		if (SELF.store[key]) {
			SELF.count++;
		}
		SELF.store[key] = value;
	}
	
	SELF.del = function(key) {
		if (typeof key === "string" && key.toLowerCase() === "all") {
			for (var k in SELF.store) {
				delete SELF.store[k];
			}
		} else if (key) {
			delete SELF.store[key];
		}
	}
}

;(function(tbc, $) {

    "use strict";

    /**
     * 用于生产弹出层、窗体容器、消息框等
     * @class tbc.Panel
     * @constructor
     * @uses tbc.Event
     * @uses tbc.ClassManager
     * @copyright 时代光华
     * @author mail@luozhihua.com
     *
     * @param {Object} settings 配置项
     *     @param {Window} [settings.window] 用于多个框架页或含有iframe的页面
     *                                      设置弹出窗口在哪一个框架页里面打开
     *     @param {Object} [settings.opener] 打开此窗口的窗口对象
     *     @param {String} [settings.title=""] 窗口标题
     *     @param {String} [settings.name="未命名"] 窗口名称（readOnly）
     *     @param {String} [settings.icon] 窗口图标
     *     @param {String} [settings.html] 窗口内容
     *     @param {Element | Object} [settings.area="body"] 限制窗口的坐标位置在某
     *                       一元素的坐标区域内
     *     @param {Number} [settings.width=400] 宽度，默认400px
     *     @param {Number} [settings.height=300] 高度，默认400px
     *     @param {Number} [settings.left="auto"] 左边距，默认auto
     *     @param {Number} [settings.top="auto"] 上边距，默认auto
     *     @param {Element} [settings.target] 窗口渲染到哪一个元素内
     *     //@param {Boolean} [settings.modal] 是否是模态窗口
     *     @param {String} [settings.sizeType] 初始显示状态， min/max/restore
     *     @param {Number} [settings.minWidth=180] 最小宽度， 默认180px
     *     @param {Number} [settings.minHeight=100] 最小高度， 默认100px
     *     @param {Boolean} [settings.autoShow=true] 是否自动显示
     *     @param {Boolean} [settings.autoClose=false] 是否自动关闭（此功能咱未实现）
     *     @param {Boolean} [settings.autoCloseTimeout=5] 自动关闭的等待时间，单位秒（此功能咱未实现）
     *     @param {Boolean} [settings.draggable=true] 是否可以拖动，默认true;
     *     @param {Boolean} [settings.resizable=true] 是否可以调整大小，默认true;
     *     @param {Boolean} [settings.minimizable=true] 是否可以最小化，默认false;
     *     @param {Boolean} [settings.maximizable=true] 是否可以最大化，默认false;
     */
    tbc.Panel = function(settings, panel) {
        
        var defaults = {
              window    : window 
            , opener    : null    // 打开此窗口的窗口对象
            , title     : null    // 窗口标题(根据窗口内容改变)
            , name      : null    // 窗口名称(不变)
            , icon      : ""      // 图标,类型:string,默认:""
            , html      : ""      // 对话框要加载的HTML内容    
            , area      : "body"
            , width     : 400    // 对话框的宽度,类型:number,默认:400
            , height    : 300    // 对话框的高度,类型:number,默认:300
            , top       : "auto" // 右边距离
            , left      : "auto" // 左边距离
            , target    : null     // 窗口显示在哪一个元素内
            , modal     : true     // 是否是模态窗口,类型:boolean,默认:true
            , enable3D  : true     // 启用3D效果
            , sizeType  : "restore" // 初始显示状态: max/min/restore
            , minWidth  : 180    // 对话框的宽度,类型:number,默认:400
            , autoShow  : true    // 
            , minHeight : 100    // 对话框的高度,类型:number,默认:300
            , autoClose : false    // 是否会自动关闭, 类型:boolean,默认:false
            , draggable : true     // 是否可拖动,类型:boolean,默认:true
            , resizable : true     // 是否可重置尺寸, 类型:boolean,默认:true
            , minimizable : false    // 是否可最小化, 类型:boolean,默认:false
            , maximizable : false    // 是否可最大化, 类型:boolean,默认:false
            , defaultSate : "restore" // [min, max] 初始状态
            , autoCloseTimeout : 5   // 自动关闭的间隔时间(秒),类型:number,默认:5

            // 事件
            , event       : {}  // 如果这里没有设置,可以在实例化后使用 new tbc.Panel().addEvent(type:function)注册新的事件;
        },
        
        /**
         * 实例配置数据
         * @ignore
         * @private
         * @type {Object} 
         */
        options = $.extend({}, defaults, settings);

        options.window = options.window || window;
        
        tbc.self(this, arguments)
        .extend({
            
            /**
             * 类名
             * @property {String} packageName
             * @type {String}
             */
            packageName : "tbc.Panel",

            /**
             * 面板组成部件
             * @property {Object} part
             * @type {Object}
             */
            part : {},

            /**
             * 窗体UI外框
             * @public
             * @property {ELement} ui
             */
            ui : null,

            /**
             * 窗体内容容器
             * @public
             * @property {Element} container
             */
            container : null,

            /**
             * 窗口最后一次更改前的大小和位置
             * @public
             * @property {Object} lastSize
             *     @property {Number} lastSize.width 宽度
             *     @property {Number} lastSize.height 高度
             *     @property {Number} lastSize.left 距离window窗口的左边距
             *     @property {Number} lastSize.top 距离window窗口的上边距
             *     @property {Number} lastSize.right 距离window窗口的右边距
             *     @property {Number} lastSize.bottom 距离window窗口的下边距
             * @type {Object}
             */
            lastSize : {
                width  : 0,
                height : 0,
                left   : 0,
                top    : 0,
                right  : "auto",
                bottom : "auto"
            },

            /**
             * 初始化UI
             * @private
             * @method initUi
             * @chainable
             */
            initUi : function(){
                
                var zindex = tbc.getMaxZIndex($(".tbc-slide-scene.current")[0]),
                    tag = (tbc.msie&&tbc.browserVersion<9) ? "div" : "dialog";            
                
                // 窗体的HTML代码(jQuery对象)
                this.ui = $('<'+ tag +' class="tbc-panel closeable shadow" style="filter:alpha(opacity=0); opacity:0; z-index:'+ (zindex+1) +';"></'+ tag +'>')
                    .attr ("tbc", this.guid)
                    .html (
                        '<div role="header" class="tbc-panel-header" unselectable="on" onselectstart="return false;">' +
                        '    <div class="tbc-panel-top-left resize-handle" role="north-west"></div>' +
                        '    <div class="tbc-panel-top-right resize-handle" role="north-east"></div>' +
                        '    <div role="controls" class="tbc-panel-controls">' +
                        '        <div class="tbc-switch-role" role="roleBox">' +
                        '            <span class="tbc-switch-role-roleName" role="roleName"></span>' +
                        '            <span class="tbc-switch-role-handle tbc-icon icon-arrow_state_blue_expanded" role="roleHandle"></span>' +
                        '            <ul class="tbc-switch-role-list" role="roleList"><li>1111</li><li>2222</li></ul>' +
                        '        </div>' +
                        '        <span class="tbc-panel-controls-box">' +
                        '            <a role="close" class="tbc-panel-btn-close" href="javascript:void(null);" hidefocus="true" title="关闭">×</a>' +
                        '            <a role="restore" class="tbc-panel-btn-max" href="javascript:void(null);" hidefocus="true" title="最大化/还原">■</a>' +
                        '            <a role="min" class="tbc-panel-btn-min" href="javascript:void(null);" hidefocus="true" title="最小化">▁</a>' +
                        '            <!--a role="refresh" class="tbc-panel-btn-refresh" href="javascript:void(null);" hidefocus="true" title="刷新">&hArr;</a-->' +
                        '            <a role="reset" class="tbc-panel-btn-reset" href="javascript:void(null);" hidefocus="true" title="重新打开">&otimes;</a>' +
                        '            <a role="help" class="tbc-panel-btn-help" href="javascript:void(null);" hidefocus="true" title="">?</a>' +
                        '        </span>' +
                        '    </div>' +
                        '    <div class="tbc-panel-top-center">' +
                        '        <div class="tbc-panel-top-center-handle resize-handle" role="north"></div>' +
                        '        <span class="tbc-panel-icon"><img role="icon" height="16" onerror="this.style.display=\'none\';" /></span>' +
                        '        <div role="title" class="tbc-panel-title">' +
                        '            <!--标题区域-->窗体基类' +
                        '        </div>' +
                        '    </div>' +
                        '</div>' +
                        '<div class="tbc-panel-body">' +
                        '    <div class="tbc-panel-middle-left resize-handle" role="west"></div>' +
                        '    <div class="tbc-panel-middle-right resize-handle" role="east"></div>' +
                        '    <div class="tbc-panel-middle-center tbc-panel-main">' +
                        '        <div role="container" class="tbc-panel-container">' +
                        '            <!--内容区域-->' +
                        '        </div>' +
                        '        <div role="mask" class="tbc-panel-locked-layer" style="display:none;">' +
                        '            <div role="maskTips" class="tbc-panel-locked-layertips"></div>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>' +
                        '<div role="footer" class="tbc-panel-footer">' +
                        '    <div class="tbc-panel-footer-left resize-handle" role="south-west"></div>' +
                        '    <div class="tbc-panel-footer-right resize-handle" role="south-east"></div>' +
                        '    <div class="tbc-panel-footer-center resize-handle" role="south"></div>' +
                        '</div>');
                
                this.ui.bind ("click", function (event) {
                    var et = event.target,
                        t  = et.tagName.toLowerCase(),
                        self = tbc.getTaskByElement(this);

                    if (self && $.isFunction(self.focus)) {
                        self.focus();
                    }

                    if (t === "input"||t === "textarea"||t === "button" ||t === "a"||et.contenteditable) {
                        setTimeout(function() {
                            et.focus(); 
                            et = null;
                        },0);
                    }
                    self = null;
                });

                tbc.Panel.cacheid++;
                this.cacheid = tbc.Panel.cacheid;
                this.ui.attr("iid", this.iid);
                this.ui.attr("cacheid", this.cacheid);
                tbc.Panel.cache[ this.cacheid ] = this;
                tbc.Panel.cache_length += 1;

                // 为最小化、最大化、还原等添加CSS Class
                if (options.minimizable) this.ui.addClass("minimizable");
                if (options.maximizable) this.ui.addClass("maximizable");
                if (options.refreshable) this.ui.addClass("refreshable");
                if (options.resettable) this.ui.addClass("resettable");
                if (options.helpable) this.ui.addClass("helpable");
                
                return this;
            },

            /**
             * 初始化面板零部件
             * @private
             * @chainable
             */
            initPart : function() {
                var self = this;

                // 缓存面板零部件
                this.ui.find("[role]").each(function(inx, elem) {
                    var role = elem.getAttribute("role");
                    this.part[role] = $(elem);
                }.bind(this));
                
                this.container = this.part.container;

                // 表单提交
                if (this.part.form) {
                    this.part.form.submit(function(event) {
                        event.preventDefault();
                        this.triggerEvent("submit");
                    }.bind(this));
                }

                // 窗体控制按钮, 包括最小化、最大化、关闭等的操作
                this.part.controls
                .bind ("mousedown", function(event) { event.disableSelectArea = true; event.stopPropagation(); })
                .delegate ("a", "click", null, function(event) {

                    event.preventDefault();

                    var elem = event.currentTarget,
                        role = elem.getAttribute("role");

                    switch (role) {
                        case "close":
                            event.stopPropagation();
                            this.close();
                            break;

                        case "min":
                            if (options.minimizable) { this.min(); }
                            break;

                        case "max":
                            if (options.maximizable) { this.max(); }
                            break;

                        case "restore":
                            if (options.maximizable) {
                                if (this.sizeType === "max") {
                                    this.restore();
                                } else {
                                    this.max();
                                }
                            }
                            break;

                        case "refresh":
                            if (options.refreshable && this.refresh) {
                                this.refresh();
                            }
                            break;
                            
                        case "reset":
                            if (options.resettable && this.reset) {
                                this.reset();
                            }
                            break;
                            
                        case "help":
                            if (options.helpable) {
                                this.help();
                            }
                            break;
                            
                        default:
                            break;
                    }
                }.bind(this));
                
                // 双击标题栏
                this.part.title.dblclick(function() {
                    if (self.sizeType !== "max" && options.maximizable) {
                        self.max();
                    } else {
                        self.restore();
                    }
                });

                if (tbc.msie && tbc.browserVersion<8) {
                    var controlsWidth = self.part.controls.children(".tbc-panel-controls-box").children().size() * 24 +2;
                    self.part.controls.width(controlsWidth);
                }

                return this;
            },

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {

                this.packageName = "tbc.Panel";

                this.initUi();
                this.initPart();
                this.initDrag();
                this.initResize();
                this.initContextmenu();

                return this;
            },

            /**
             * 初始化打开
             * @private
             * @method initForOpen
             * @chainable
             */
            initForOpen : function () {
                var mw, mh, l, r, t, b;

                if (options.windowInitialType === "FULL" || options.windowInitialType === "MAX") {
                    mw = "100%";
                    mh = "100%";
                    l = r = t = b = 0;
                } else {
                    mw = tbc.system ? Math.min(tbc.system.getDesktopWidth(), (options.width||options.minWidth)) : (options.width||options.minWidth);
                    mh = tbc.system ? Math.min(tbc.system.getDesktopHeight()-24-taskbar.ui.height(), (options.height||options.minHeight)) : (options.height||options.minHeight);
                    l = options.left;
                    r = options.right;
                    b = options.bottom;
                    t = options.top;
                }
                
                this.appendTo(options.target || tbc.Panel.parent || "body")
                .name(options.name|| "窗口")
                .icon(options.icon || tbc.Panel.defaultIcon || (window.DEFAULT_ICONS?DEFAULT_ICONS.window_icon:null) || "")
                .resize(mw, mh, t, r, b, l, false);
                
                if (options.windowInitialType === "FULL" || options.windowInitialType === "MAX") {
                    this.resize("max").rememberSize(options.width, options.height, options.top, options.left);
                } else {
                    this.rememberSize();
                }
                
                this.opened = true;
                
                /* 自定义滚动条(后期实现)
                if ($.fn.nanoScroller) {
                    try{
                        $(".tbc-panel-main", SELF.ui).nanoScroller({
                            paneClass    : "tbc-window-slidebar",
                            sliderClass  : "tbc-window-slider",
                            contentClass : "tbc-panel-container"
                        });
                    }catch(e) {}
                }
                */
                
                /**
                 * 在窗口第一次打开被打开时触发此事件
                 * @event open
                 */
                this.triggerEvent("open");
                return this;
            },

            /**
             * 初始化拖动
             * @private
             * @method initDrag
             * @chainable
             */
            initDrag : function() {

                var SELF = this;

                // 如果可拖动:
                try{
                    if (options.draggable) {
                        
                        SELF.addEvent ("drop", function () {
                            SELF.rememberSize();
                        });
                        
                        if ($.fn.drag) {
                            SELF.ui
                            .addClass("draggable")
                            .drag
                            ({
                                  document : document
                                , area    : "body"
                                , areaMargin: {top:-6, left:"-80%", bottom:"80%", right:"80%"}
                                , handle  : SELF.part.title
                                , enabled : function() {return SELF.ui.hasClass("draggable");}
                                , timeout : 1
                                , event   : {
                                    dragStart : function () {
                                        var z = SELF.ui.css('zIndex') || 2;
                                        
                                        tbc.lock("body", {zIndex:9999999, opacity:0.001, cursor:"move"});
                
                                        SELF.dragSaveOnIframe = $('<div />')
                                        .insertAfter(SELF.ui)
                                        .css({position:'absolute', z:z-1, background:'#fff', opacity:0.01, width:'100%', height:'100%', left:0, top:0 });
                                        
                                        /**
                                         * 在拖动开始时会触发此事件
                                         * @event dragStart
                                         */
                                        SELF.triggerEvent("dragStart");
                                    },
                                    drag : function () { SELF.triggerEvent("drag");  },
                                    drop : function () {
                                        if (SELF.dragSaveOnIframe) {
                                            SELF.dragSaveOnIframe.remove();
                                        }
                                        
                                        tbc.unlock("body");

                                        /**
                                         * 在拖动结束后会触发此事件
                                         * @event drop
                                         */                                        
                                        SELF.triggerEvent("drop");
                                    }
                                }
                            });
                        }
                        
                        SELF.part.title.mousedown(function() { SELF.focus(); });
                    } else if (options.draggable && !$.fn.drag) {
                        throw "jQuery plugins 'jQuery.fn.drag' was not found! jQuery.fn.dialog Dependent on the plugin.";
                    }
                }catch(e) {
                    tbc.log(e);
                }
                return this;                
            },

            /**
             * 初始化调整大小功能
             * @private
             * @method initResize
             * @chainable
             */
            initResize : function() {
                var SELF = this;
                // 如果可缩放:
                try{
                    if (options.resizable && $.fn.resizableForTbc) {
                        SELF.ui
                        .addClass("resizable")
                        .resizableForTbc({
                              handle    : ".resize-handle"
                            , vector    : "normal" // 类型: string, 取值范围: north, north-west, north-east, west, east, south, south-west, south-east
                            , document  : document // 用于不同框架的元素重置大小。
                            , margin    : { top: 7, left: 7, right: 9, bottom: 9 }
                            , minWidth  : options.minWidth
                            , minHeight : options.minHeight
                            , enabled : function() {return SELF.ui.hasClass("resizable");}

                            /* 事件 */
                            , onResizeStart : function () { SELF.focus().lock(); }
                            , onResize      : function () { }
                            , onResizeEnd   : function (size) {
                                SELF.resize(size);
                                SELF.unlock();
                            }
                        });

                    } else if (options.resizable && !$.fn.resizableForTbc) {
                        throw "jQuery plugins 'jQuery.fn.resizableForTbc' was not found! jQuery.fn.dialog Dependent on the plugin.";
                    }
                } catch(err) {
                    tbc.log(err);
                }
                return this;
            },

            /**
             * 初始化右键菜单
             * @private
             * @method initContextmenu
             * @chainable
             */
            initContextmenu : function() {
                var SELF = this;
                // 右键菜单
                if ($.isFunction($.fn.contextmenu)) {
                    this.ui.contextmenu({
                        items:[
                            {text:"最小化", icon:"", click:function() {SELF.min();}, disabled:!options.minimizable,inheritable:true},
                            {
                                text  : function() {return SELF.sizeType === "max"?"还原":"最大化"; },
                                icon  : "",
                                click : function() { if (SELF.sizeType === "max") { SELF.restore();} else {SELF.max();} },
                                disabled:!options.maximizable,
                                inheritable:true
                            },
                            {text:"关闭", icon:"", click:function() {SELF.close();}, inheritable:true}
                        ]
                    });
                }
                return this;
            },

            /**
             * 计算并渲染窗体各零部件的尺寸
             * @public
             * @method panelLayout
             * @chainable
             */
            panelLayout : function() {
                var self = this;
                try{
                    var panel = self.ui;
                    //  调整弹出层内部元素的布局
                    var _bodyHeight    = panel.innerHeight() - self.part.header.height() - self.part.footer.height(),
                        _contWidth    = panel.width() - $(".tbc-panel-middle-left", panel).width() - $(".tbc-panel-middle-right", panel).width();
                    
                    $(".tbc-panel-body", panel).height(_bodyHeight);
                    self.part.container.height(_bodyHeight).width(_contWidth);
                }catch(e) {
                }
                self = null;
                return this;
            },

            /**
             * 显示窗体
             * @public
             * @method show
             */
            show : function() {
                var self = this;

                if (!this.opened) { this.initForOpen(); }
                
                this.minimize = false;
                
                this.ui
                .css({opacity:0, display:"block"})
                .animate({opacity:1}, 200); // 影响性能(5~10s)
               
                this.facade();
                
                setTimeout(function() {
                    self.focus();
                    self = null;
                }, 0);
                
                /**
                 * 在窗口显示时会触发此事件
                 * @event show
                 */
                this.triggerEvent("show");
            
                return this;
            },
           
            /**
             * 隐藏
             * @public
             * @method hide
             * @chainable
             */
            hide : function() {
                var SELF = this;
                
                if (tbc.msie && tbc.browserVersion<8) {
                    this.ui.css({opacity:0,display:"none"});
                } else {
                    this.ui.animate({opacity:0,display:"none"}, 200,  function() {
                        SELF.ui.hide();
                        SELF = null;
                    });
                }
            
                this.evert();
                
                /**
                 * 隐藏窗口时会触发此事件
                 * @event hide
                 */
                this.triggerEvent("hide");

                return this;
            },
           
            /**
             * 设置或者获取HTML代码，如果传入一个String或Element类型的参数，
             * 则设置在窗体的内容区域（this.container）的HTML; 否则获取HTML;
             * @public
             * @method html
             * @param {String} [html] 新的HTML代码
             */
            html : function(html) {
                this.triggerEvent("beforeChange");
            
                if (html) {
                    this.container.html(html);
                    this.triggerEvent("afterChange");
                    return this;
                } else {
                    return this.container.html();
                }   
            },
           
           /**
            * 给窗体容器追加节点或HTML内容
            * @public
            * @method append
            * @param {Element} ele 节点或HTML内容.
            * @chainable
            */
            append : function(ele) {
                /**
                 * 在调用append/prepend方法前会触发此事件
                 * @event beforeChange
                 */
                this.triggerEvent("beforeChange");
                this.container.append(ele);

                /**
                 * 在调用append/prepend方法前会触发此事件
                 * @event afterChange
                 */
                this.triggerEvent("afterChange");
                return this;
            },

            /**
             * 将窗体显示到某一容器
             * @public
             * @method append
             * @param {Element} elem 节点或HTML内容;
             */
            appendTo : function(elem) {
                this.ui.appendTo(elem);
                return this;
            },

            /**
             * 从窗体前面插入节点或HTML内容
             * @public
             * @method prepend
             * @param {Element} elem 节点或HTML内容, 必须;
             */
            prepend : function(elem) {
                this.triggerEvent("beforeChange");
                if (elem.ui) {
                    this.container.prepend(elem.ui);
                } else {
                    this.container.prepend(elem);
                }
                this.triggerEvent("afterChange");
                return this;
            },
        
            /**
             * 将窗口渲染到某一容器的前部
             * @public
             * @method prepend
             * @param {Element} elem 节点或HTML内容, 必须;
             */
            prependTo : function(elem) {
                if (elem.container) {
                    this.ui.prependTo(elem.container);
                } else {
                    this.ui.prependTo(elem);
                }
                return this;
            },

            /**
             * 标题模板
             * titleModel description
             * @property {String} titleModel
             * @type {String}
             */
            titleModel:"{0}<span style='filter:alpha(opacity=70); opacity:0.7; font-weight:lighter;' title='{0} {1}'>{1}</span>",
               
            /**
             * 设置或获取窗体的title
             * @method title
             * @param {String} [title] 要设置的新title,可选的,当没有该参数时返回旧的title 
             * @return {String} 窗体的Title
             */
            title : function (title) {
                if (title) {
                    options.title = title;
                    
                    var name = options.name,
                        title_1 = options.title,
                        title_2,
                        t = (title_1 && title_1 !== name) 
                            ? tbc.formatString(this.titleModel||"", title_1?name+" > ":name, title_1)
                            : options.name;
                    
                    title_2 = title_1 ? (name+" > " + title_1) : (name||"");
                    this.part.title.html(t).attr("title", title_2);

                    /**
                     * 在更改窗体标题后会触发此事件
                     * @event changeTitle
                     */
                    this.triggerEvent("changeTitle", title, name);
                    return this;
                }
                return options.title;
            },
        
            /**
             * 设置或获取窗体的name
             * @public
             * @method name
             * @param {String} [name] 要设置的新name,可选的,当没有该参数时返回旧的name
             * @return {String} 返回名称
             */
            name : function (name) {
                if (name) {
                    options.name = name;

                    var name_1 = name,
                        title_1 = options.title,
                        name_2,
                        n = (title_1 && title_1 !== name_1) 
                            ? tbc.formatString(SELF.titleModel, title_1?(name_1+" > "):name_1, title_1)
                            : options.name;
                    
                    name_2 = title_1 ? (name_1+" > "+title_1) : (name_1||"");

                    this.part.title.html(n).attr("title", name_2);

                    /**
                     * 在更改窗体标题后会触发此事件
                     * @event changeTitle
                     * @param {String} title_1 窗口标题
                     * @param {String} name 窗口名称
                     */
                    this.triggerEvent("changeTitle", title_1, name);
                
                    return this;
                }
                return options.name;
            },

            /**
             * 设置或获取窗体的icon路径
             * @public
             * @method icon
             * @param {String} [icon] 要设置的新icon路径或CSS class, 当没有该参数时返回旧的icon路径 
             * @return {String} 窗体的icon地址
             */
            icon : function (icon) {
                
                var isimg = tbc.system.isImg(icon);
                if (isimg || !icon || icon === "null") {
                    icon = isimg ? icon : DEFAULT_ICONS.window_icon;
                    
                    this.part.icon.attr("src", icon)
                    .show().parent().css({backgroundPosition:"center center"});

                    /**
                     * 在改变窗体图标后会触发此事件
                     * @event changeIcon
                     */
                    this.triggerEvent("changeIcon", icon);
                    return this;
                } else {
                    this.part.icon.parent().addClass("tbc-icon "+icon).css({backgroundImage:""});
                    this.part.icon.hide();
                    return this;
                }
                
                return this.part.icon.attr("src");
            },

            /**
             * 关闭窗体和销毁窗体实例，如果参数focusNext不为true，则在关闭后
             * 使下一个窗体获得焦点
             * @public
             * @method close
             * @param {Boolean} focusNext 是否在关闭后让下一个窗体获得焦点，默认true
             */
            close : function(focusNext) {
                var SELF = this;
                
                // 如果有打开的子模态窗体,则使子模态窗体获得焦点
                if (this.modalWindow) {
                    try {
                        if (focusNext) {
                            this.modalWindow.close(focusNext);
                        } else {
                            this.modalWindow.show().focus().flash();
                            return this;
                        }
                    } catch (e) {}
                }
                
                /**
                 * 在关闭窗体前会触发此事件，如果事件内的任何一个方法返回
                 * false，都将阻止窗口关闭
                 * @event beforeClose
                 */
                if (this.triggerEvent("beforeClose") === false) {
                    return this; 
                }
                
                /**
                 * 在关闭窗体后会触发此事件
                 * @event beforeClose
                 * @param {AnyType} returnValue 窗口的放回值，如果窗口的类型loadType
                 *                              是iframe，则返回iframe的contentWindow
                 *                              对象的returnValue值（不能跨域）
                 */
                this.triggerEvent("close", this.returnValue);
                
                tbc.Panel.cache_length -= 1;
                delete tbc.Panel.cache[this.cacheid];
                tbc.Panel.removeSequence(this.cacheid);
                
                if (this.opener && this.opener.modalWindow) {
                    delete this.opener.modalWindow;
                }
                
                // 关闭当前窗口时,让下一个窗口(仅限当前分屏的窗口)获得焦点(异步执行)
                if (!focusNext) {
                    setTimeout(function() {
                        var scene1 = window.desktop.current().container[0],
                            scene2,
                            win,
                            seq, i;

                        for (seq=tbc.Panel.sequence, i=seq.length; i>=0; i-=1) {
                            win = tbc.Panel.cache[seq[i]];
                            if (win) {
                                scene2 = tbc.Panel.cache[seq[i]].ui.parent()[0];
                                if (scene1 === scene2 || scene2 === document.body) {
                                    tbc.Panel.cache[seq[i]].focus();
                                    break;
                                }
                            }
                        }
                        
                        scene1 = scene2 = win = null;
                    }, 0);
                }
                
                function deleteSELF()
                {
                    if (SELF) {
                        var k;
                        
                        SELF.ui.empty().remove();
                        
                        for (k in SELF.part) {
                            if (SELF.part.hasOwnProperty(k)) {
                                delete SELF.part[k];
                            }
                        }
                        
                        /**
                         * 在窗口完全关闭后会触发此事件，此事件可能会有延迟
                         * @event afterClose 
                         * @param {AnyType} returnValue 窗口的放回值，如果窗口的类型loadType
                         *                              是iframe，则返回iframe的contentWindow
                         *                              对象的returnValue值（不能跨域）
                         */
                        SELF.triggerEvent("afterClose", SELF.returnValue);
                        SELF.DESTROY();
                    }
                    options = defaults = SELF = null;
                }
                
                if (tbc.msie && tbc.browserVersion<8) {
                    deleteSELF();
                } else {
                    this.evert();
                    this.ui.animate(
                        {opacity:0, marginTop:"-=20px"}, 300, deleteSELF
                  );
                }
            },
            
            /**
             * 关闭其他窗口
             * @return {[type]} [description]
             */
            closeOther : function() {
                
            },
            
            /**
             * 把窗体最小化到任务栏
             * @public
             * @method min
             * @chainable
             */
            min : function() {
                this.blur();
                this.ui.hide();
                
                this.minimize = true;
                this.maximize = false;
                
                /**
                 * 在最小化窗口后触发此事件
                 * @event min
                 */
                this.triggerEvent("min");
                return this;
            },
            
            
            /**
             * 窗体最大化
             * @public
             * @method max
             * @chainable
             */
            max : function() {
                
                if (this.minimize) { this.show(); }
                this.disableResize().disableDrag();
                this.resize("100%","100%",null,null,null,null,false);
                this.sizeType = "max";
                this.maximize = true;
                this.minimize = false;
                this.ui.addClass("maximize");

                /**
                 * 在最大化窗口后触发此事件
                 * @event max
                 */                
                this.triggerEvent("max");
                return this;
            },
            
            /**
             * 还原窗体尺寸
             * @public
             * @method restore
             * @chainable
             */
            restore : function() {
                
                if (this.minimize) { this.show(); }
                
                var ls = this.lastSize || {},
                    l  = ls.left   || 0,
                    t  = ls.top    || 0,
                    w  = ls.width  || this.ui.width(),
                    h  = ls.height || this.ui.height();
                
                this.enableResize().enableDrag();
                this.resize(w, h, t, null, null, l, false);
                this.sizeType = "restore";
                this.minimize = false;
                this.maximize = false;
                this.ui.removeClass("maximize");

                /**
                 * 在窗口取消最大化或最小化状态后触发此事件
                 * @event restore
                 */                
                this.triggerEvent("restore");
                
                return this;
            },
            
            /**
             * 当前窗口的尺寸状态: min/max/restore
             * @public
             * @property {String} sizeType
             * @type {String}
             */
            sizeType : options.sizeType || "restore",
            
            /**
             * 记忆窗体尺寸
             * @param  {Number} w 宽度
             * @param  {Number} h 高度
             * @param  {Number} t 上边距
             * @param  {Number} l 左边距
             * @chainable
             */
            rememberSize : function(w, h, t, l) {
                this.lastSize = {
                    top        : t || this.ui.css("top"),
                    left    : l || this.ui.css("left"),
                    width    : w || this.ui.width(),
                    height    : h || this.ui.height()
                };
                return this;
            },
            
            /**
             * 打开模态窗体
             * @param  {Object} opt       同className的参数
             * @param  {Class} [className] 指定模态窗体的基类
             * @return {Object}           返回创建的模态窗体
             */
            openModalDialog:function(opt, className) {
                
                var SELF = this,
                    BaseClass = className || SELF.constructor || tbc.Panel;
                
                this.modalWindow = new BaseClass(opt);
                this.modalWindow.opener = this;
                this.modalWindow.addEvent({
                    "afterClose" : function() {
                        SELF.modalWindow = null;
                        SELF.show().focus();
                    }
                });
                
                BaseClass = null;
                return this.modalWindow;
            },
            
            /**
             * 是否处于获得焦点状态
             * @public
             * @property {Boolean} focused
             * @type {Boolean}
             */
            focused:false,

            /**
             * 让窗口获得焦点, 如果此窗口所在的桌面处于隐藏状态，
             * 则会自动显示此桌面，并让此窗口获得焦点；如果此窗口
             * 有打开的模态窗口，则仅让基于此窗口的模态窗口获得焦
             * 点；
             * @public
             * @method focus
             * @chainable
             */
            focus : function() {
                
                var p = this.ui.parent(),
                    Z, task, index,
                    Za, Ta, c, w;
                
                // 如果已经最小化,则不再获得焦点
                //if (this.minimize === true) return this;
                
                // 显示对应的分屏
                if (!p.hasClass("current")) {
                    task = tbc.system ? tbc.system.getTaskByElement(p) : null;
                    
                    if (task) {
                        index = task.index;
                        desktop.show(index);
                    }
                        
                    p = task = null;
                }
                
                // 如果有打开的子模态窗体,则使子模态窗体获得焦点
                if (this.modalWindow) {
                    Z  = tbc.getMaxZIndex(this.ui.parent()[0]);
                    this.ui.css({ zIndex:Z });
                    
                    if (this.modalWindow.focused) {
                        this.modalWindow.focus().flash();
                    } else {
                        this.modalWindow.focus();
                    }
                    
                    return this;
                }
                
                if (this.focused === true) {
                    return this;
                }
                this.focused = true;
                
                tbc.Panel.removeSequence(this.cacheid);
                tbc.Panel.sequence.push(this.cacheid);
                this.unlock("blur");
                
                Za = tbc.getMaxZIndex(this.ui.parent()[0]);
                Ta = Math.max(window.parseInt(this.ui.css("top")), -6);
                
                this.ui.addClass("shadow").css({ zIndex:Za+1, top:Ta });

                /**
                 * 在窗口获得焦点后触发此事件
                 * @event focus
                 */                
                this.triggerEvent("focus");
                
                // 使其他窗口失去焦点
                c = tbc.Panel.cache;
                for(w in c) {
                    if (c.hasOwnProperty(w) && c[w] !== this && c[w].blur && c[w].focused) {
                        c[w].blur(true);
                    }
                }
                c=null;
                
                return this;
            },
            
            /**
             * 使窗体失去焦点
             * @public
             * @method blur
             * @param  {Boolean} [focusNext=false] 是否让下一个窗口获得焦点，默认false;
             * @chainable
             */
            blur : function (focusNext) {
                
                var i, seq, w;
                
                if (focusNext !== true) {
                    seq = tbc.Panel.sequence;
                    for (i=seq.length-2; i>-1; i--) {
                        w = tbc.Panel.cache[seq[i]];
                        if (this.ui && w.ui && this.ui.parent()[0] === w.ui.parent()[0]) {
                            if (w && !w.minimize && !w.focused) {
                                w.focus();
                                break;
                            }
                        }
                    }
                    w = seq = null;
                }
                
                this.focused = false;
                this.ui.removeClass ("shadow");
                this.lock ("blur", "", 0.1);

                /**
                 * 在窗口失去焦点后触发此事件
                 * @event blur
                 */                
                this.triggerEvent ("blur");

                return this;
            },
               
            /**
             * 重新设置宽度和高度
             * @public
             * @method resize
             * @param {String | Object | Number} newSize 新的尺寸；类型说明：
             *     String: 字符串类型仅支持“min”，“max”, “restore”；
             *     Number: 如果是数字，则表示宽度，并且必须传后面几个参数；
             *     Object: 则必须有下面这些子属性；
             *     @param {Number} newSize.width 宽度
             *     @param {Number} newSize.height 高度
             *     @param {Number} newSize.top 上边距
             *     @param {Number} newSize.right 右边距
             *     @param {Number} newSize.bottom 下边距
             *     @param {Number} newSize.left 左边距
             * @param {Number} [height] 高度
             * @param {Number} [top] 上边距
             * @param {Number} [right] 右边距
             * @param {Number} [bottom] 下边距
             * @param {Number} [left] 左边距
             * @chainable
             */
            resize : function(newSize) {
                var size, arg;
                
                switch (newSize) {
                    case "min"     : this.min();     break;
                    case "max"     : this.max();     break;
                    case "restore" : this.restore(); break;
                    default:
                        if (newSize) {
                            var parent   = $(options.area).size() ? $(options.area) : this.ui.parent(),
                                remember = true;
                            
                            if (typeof(newSize) !== "object") {
                                arg = arguments;
                                size = { width:arg[0], height:arg[1], top:arg[2],  right:arg[3], bottom:arg[4], left:arg[5] };
                            } else {
                                size = newSize;
                                arg = [size.width, size.height, size.top, size.right, size.bottom, size.left];
                            }
                            
                            remember = arguments[arguments.length-1] === false ? false : remember;
                            
                            size.width = size.width === "auto" 
                                ? parent.innerWidth() -((!isNaN(size.left) ? size.left : 20) + (!isNaN(size.right) ? size.right :20))
                                : (size.width === "100%" ? parent.innerWidth()+12 : size.width);
                
                            size.height = size.height === "auto" 
                                ? parent.innerHeight() -((!isNaN(size.top) ? size.top : 20) + (!isNaN(size.bottom) ? size.bottom :20))
                                : (size.height === "100%" ? parent.innerHeight()+12 : size.height);
            
                            var width  = Math.max(size.width, options.minWidth), 
                                height = Math.max(size.height, options.minHeight),
                                left   = arg[0] === "100%" ? -6 : (size.left === "auto" ? Math.max(0, (parent.width()-width)/2) : size.left),
                                right  = size.right === "auto" ? Math.max(0, (parent.width()-width)/2) : size.right,
                                top    = arg[1] === "100%" ? -6 : (size.top === "auto" ? Math.max(0, (parent.height()-height)/2) : size.top),
                                bottom = size.bottom === "auto" ? Math.max(0, (parent.height()-height)/2) : size.bottom;
                            
                            if (remember !== false) {
                                $.extend(this.lastSize, {
                                    left   : parseInt(this.ui.css("left")),
                                    top    : parseInt(this.ui.css("top")),
                                    width  : this.ui.width(),
                                    height : this.ui.height()
                                });
                            }
                            
                            this.ui.css({ width:width, height:height, left:left, right:right, top:top, bottom:bottom });
                            
                            this.panelLayout();

                            /**
                             * 在窗口调整尺寸后触发此事件
                             * @event resize
                             * @param {Object} size 尺寸
                             *     @param {Number} size.width 宽度
                             *     @param {Number} size.height 高度
                             */                            
                            this.triggerEvent("resize", {width: width, height:height});
                        }
                        break;
                }
                
                return this;
            },
            
            /**
             * 设置或返回宽度
             * @public
             * @method resizeWidth
             * @param {Number} width 要设置的宽度, “auto”为减去第二个参数后的宽度;
             * @param {Number} [margin=0] 默认为0; 当参数width值为“auto”时才有效；
             * @chainable
             */
            resizeWidth : function(width, margin) {
                
                width = !isNaN(width) ? width : {width:width, left:margin, right:margin};
                this.resize(width);
                
                return this;
            },
            
            /**
             * 设置或返回高度
             * @public
             * @method resizeHeight
             * @param {Number} height 要设置的宽度, “auto”为减去第二个参数后的宽度;
             * @param {Number} [margin=0] 默认为0; 当参数height值为“auto”时才有效；
             * @chainable
             */
            resizeHeight : function(height, margin) {
                height = !isNaN(height) ? height : {height:height, top:margin, bottom:margin};
                this.resize(height);
                
                return this;
            },
            
            /**
             * 禁止调整大小
             * @public
             * @method disableResize
             * @chainable
             */
            disableResize : function() {
                this.ui.removeClass("resizable");
                return this;
            },
            
            /**
             * 启用大小调整功能
             * @public
             * @method enableResize
             * @return {[type]} [description]
             */
            enableResize : function() {
                this.ui.addClass("resizable");
                return this;
            },
            
            /**
             * 禁止拖动
             * @public
             * @method disableDrag
             * @chainable
             */
            disableDrag : function() {
                this.ui.removeClass("draggable");
                return this;
            },
            
            /**
             * 启动拖动
             * @public
             * @method enableDrag
             * @chainable
             */
            enableDrag : function() {
                this.ui.addClass("draggable");
                return this;
            },
            
            /**
             * 让窗口居中显示
             * @public
             * @method center
             * @chainable
             */
            center : function(callback, w, h) {
                
                /* 计算窗口要显示的坐标位置:left、top、width、height */
                var width  = w&&!isNaN(w) ? w : this.ui.width(),
                    height = h&&!isNaN(h) ? h : this.ui.height(),
                    left   = options.left,
                    top    = options.top,
                    pageW  = document.documentElement.clientWidth  || document.documentElement.offsetWidth,
                    pageH  = document.documentElement.clientHeight || document.documentElement.offsetHeight;
                    
                /** 水平居中  */
                left = (pageW < width
                        ? Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
                        : (pageW / 2) 
                            + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft) 
                            - (width / 2));
            
                /** 垂直居中 */
                top =  (pageH < height
                        ? Math.max(document.documentElement.scrollTop, document.body.scrollTop)
                        : (pageH / 2) 
                            + Math.max(document.documentElement.scrollTop, document.body.scrollTop) 
                            - (height / 2));
                
                this.ui.css({ top: top, left: left, width:width, height:height});
                $.isFunction(callback) && callback.call(this);
                
                /**
                 * 窗口居中显示时触发此事件
                 * @event center
                 */
                this.triggerEvent("center");
                
                return this;
            },
            
            /**
             * 锁定窗口，在某些情况下需要禁止窗口暂时禁止用户继续操作，
             * 那么可以将窗口lock()；
             * @param  {String} type    锁定类型 "lock", "loading", "waiting", "moving", "modal"；
             * @param  {String} msg     显示在锁定蒙版上的提示
             * @param  {Number} [opacity] 蒙版透明度：一个表示透明度的小数；
             * @chainable
             */
            lock: function (type, msg, opacity) {
                // type 取值范围: "lock", "loading", "waiting", "moving", "modal"
                var l = $('.tbc-panel-locked-layer', this.ui);
                    l.css({ display:"block" });
                    opacity && l.css({opacity:opacity});
                    type && l.addClass(type);
                this.part.maskTips.html(msg);

                /**
                 * 锁定窗口时触发此事件
                 * @event lock
                 */
                this.triggerEvent("lock");
                return this;
            },
            
            /**
             * 将窗口解锁，此方法相对于lock; 可以解除某一种锁定状态
             * @param  {String} type 取值类型 "lock", "loading", "waiting", "moving", "modal"；
             * @example
             *     this.lock("loading");
             *     this.unlock("loading");
             * @chainable
             */
            unlock: function (type) {
                // type 取值范围: "lock", "loading", "waiting", "moving", "modal"
                
                var layer=$('.tbc-panel-locked-layer', this.ui);
                
                type && layer.removeClass(type);
                if ($.trim(layer.attr("class")) === "tbc-panel-locked-layer") {
                    layer.css({ display:"none" });
                    layer.css({ opacity:""});
                }
                this.part.maskTips.html("");

                /**
                 * 窗口解除锁定时触发此事件
                 * @event unlock
                 */
                this.triggerEvent("unlock");
                
                return this;
            },
            
            /**
             * 让窗口抖动（已更名为shake）
             * @deprecated
             * @async
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            fling : function(callback) {
                return this.shake();
            },
            
            /**
             * 让窗口抖动
             * @async
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            shake : function(callback) {
                var SELF = this,
                    panel = this.ui;

                panel.animate({left:"-=5px"}, 40);
                panel.animate({left:"+=10px"}, 40);
                panel.animate({left:"-=5px"}, 40);
                panel.animate({left:"+=4px"}, 40);
                panel.animate({left:"-=4px"}, 40);
                panel.animate({left:"+=2px"}, 40);
                panel.animate({left:"-=2px"}, 40, function() { $.isFunction(callback)&&callback.call(SELF); });
                panel = null;

                /**
                 * 窗口抖动时触发此事件
                 * @event shake
                 */
                this.triggerEvent("shake");
                
                /**
                 * 窗口抖动时触发此事件(不赞成继续使侦听事件)
                 * @deprecated 已经更名为shake
                 * @event fling
                 */
                this.triggerEvent("fling");

                return this;
            },
            
            /**
             * 让窗口缩放至某一尺寸和位置
             * @param {Obejct | Element} offset 如果是一个表示位置和尺寸的对象, 则
             *     要包含以下子参数；
             *     @param {Number} offset.width 宽度；
             *     @param {Number} offset.height 高度；
             *     @param {Number} offset.top 上边距；
             *     @param {Number} offset.left 左边距；
             *     @param {Number} offset.opacity 透明度；
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            scaleTo : function(offset, callback) {
                var SELF = this,
                    panel = SELF.ui,
                    wid = panel.width(),
                    hei = panel.height(),
                    lft = panel.css("left"),
                    top = panel.css("top"),
                    offset_2 = !$.isPlainObject(offset)
                        ? $.extend({}, $(offset).offset(), {width:$(offset).width(), height:$(offset).height(), opacity:0 })
                        : offset;
                
                panel.animate(offset_2, 1200, "easeOutBounce", function() {
                    SELF.ui.css({display:"none",width:wid, height:hei,left:lft, top:top, opacity:1});
                    if ($.isFunction(callback)) {
                        callback.call(SELF);
                    }
                    SELF = null;
                });
                panel = null;
                return this;
            },
            
            /**
             * 让窗口翻转到反面（基于CSS 3，在IE10以下浏览器没有效果 ）
             * @public
             * @method evert
             * @chainable
             */
            evert : function() {
                if (!tbc.msie || tbc.browserVersion>9) {
                    this.ui.css({
                        "-moz-transform"    : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-webkit-transform" : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-o-transform"      : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-ms-transform"     : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "transform"         : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)"
                    });
                }

                /**
                 * 窗口反转时触发
                 * @event evert
                 */
                this.triggerEvent("evert");
                return this;
            },
            
            /**
             * 让窗口翻转到正面，此方法相对于evert（基于CSS 3，在IE10以下浏览器没有效果 ）
             * @public
             * @method facade
             * @chainable
             */
            facade : function() {
                if (!tbc.msie || tbc.browserVersion>9) {
                    this.ui.css({
                        "-moz-transform"    : "none",
                        "-webkit-transform" : "none",
                        "-o-transform"      : "none",
                        "-ms-transform"     : "none",
                        "transform"         : "none"
                    });
                }

                /**
                 * 窗口正面显示时触发此事件
                 * @event facade
                 */
                this.triggerEvent("facade");
                return this;
            },
            
            // 启用3D透视效果
            enable3D : function() {
                this.ui.parent().css({
                    "-moz-transform-style"    : "preserve-3d",
                    "-webkit-transform-styles" : "preserve-3d",
                    "-ms-transform-style"     : "preserve-3d",
                    "-o-transform-style"      : "preserve-3d",
                    "transform-style"         : "preserve-3d",
                    "-webkit-transform-style" : "perspective"
                });

                /**
                 * 窗口启用3D时触发此事件
                 * @event enable3D
                 */
                this.triggerEvent("enable3D");
                return this;
            },
            
            // 禁用3D透视效果
            disable3D : function() {
                this.ui.parent().css({
                    "-moz-transform-style"    : "none",
                    "-webkit-transform-style" : "none",
                    "-ms-transform-style"     : "none",
                    "-o-transform-style"      : "none",
                    "transform-style"         : "none"
                });
                
                /**
                 * 窗口禁用3D时触发此事件
                 * @event disable3D
                 */
                this.triggerEvent("disable3D");
                return this;
            },
            
            // 启用动态变幻效果
            enableAnimate : function (duration, delay, easing) {
                var v1 = duration || ".4s",
                    v2 = easing || "ease",
                    v3 = delay || "0s",
                    v  = [v1,v2,v3].join(" ");
                
                this.ui.css({
                    "-moz-transition"    : "-moz-transform " + v,
                    "-webkit-transition" : "-web-transform " + v,
                    "-o-transition"      : "-o-transform " + v,
                    "-ms-transition"     : "-ms-transform " + v,
                    "transition"         : "transform " + v
                });
                this.triggerEvent("enableAnimate");
                
                return this;
            },
            
            // 禁用动态变幻效果
            disableAnimate : function () {
                this.ui.css ({
                    "-moz-transition"    : "",
                    "-webkit-transition" : "",
                    "-o-transition"      : "",
                    "-ms-transition"     : "",
                    "transition"         : ""
                });
                this.triggerEvent("disableAnimate");
                return this;
            },
            
            active : function (o) {
                o 
                ? this.ui.addClass("active")
                : this.ui.removeClass("active");
                
                this.triggerEvent("active");
                return this;
            },
            
            /**
             * 让窗口闪烁
             * @public
             * @method flash
             * @param {Function} [callback] 回调函数
             * @chainable
             */
            flash : function (callback) {
                var panel = this.ui,
                    aniCB = function () {
                        panel.dequeue ("flash");
                    },
                    _time = 40;
                    
                this.ui.queue ("flash", [
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:1}).addClass("shadow");    setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:1}).addClass("shadow");    setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { 
                        panel.css ({opacity:1}) .addClass ("shadow");
                        setTimeout (function() {
                            aniCB();
                            panel.verifyButton 
                            ? panel.verifyButton.focus()
                            : panel.cancelButton && panel.cancelButton.focus();
                            
                            $.isFunction(callback)&&callback.call(panel);
                        }, _time);
                    }
                ]).dequeue("flash");

                /**
                 * 窗口闪烁时触发此事件
                 * @event flash
                 */
                this.triggerEvent("flash");
                return this;
            },
            
            /**
             * 获取窗口的位置及尺寸
             * @public
             * @method offset
             * @param {Object} return 返回值
             *     @param {Number} return.offsetWidth 外框宽度
             *     @param {Number} return.offsetHeight 外框高度
             *     @param {Number} return.containerWidth 内容容器的宽度
             *     @param {Number} return.containerHeight 内容容器的高度
             *     @param {Number} return.width 宽度（不包含margin）
             *     @param {Number} return.height 高度（不包含margin）
             *     @param {Number} return.scrollWidth 页面内容宽度（包含超出可视范围的宽度）
             *     @param {Number} return.scrollHeight 页面内容高度（包含超出可视范围的高度）
             */
            offset : function() {
                var panel = this.ui,
                    off   = panel.offset(),
                    con   = this.part.container;
                
                $.extend(off, {
                      offsetWidth     : panel.outerWidth()
                    , offsetHeight    : panel.outerHeight()
                    , containerWidth  : con.innerWidth()
                    , containerHeight : con.innerHeight()
                    , width           : panel.width()
                    , height          : panel.height()
                    , scrollWidth     : con[0].scrollWidth
                    , scrollHeight    : con[0].scrollHeight
                });
                
                return off; 
            }
        })
        .addEvent({
            "afterClose" : function() {
                
                var p,
                    hasMax = false,
                    k;
                    
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        p = tbc.Panel.cache[k];
                        hasMax = hasMax || p.maximize;   
                    }
                }
                
                // 如果目前没有最大化的窗口,则显示分屏导航条和左侧快捷启动栏
                if (!hasMax) {
                    if (taskbar) { 
                        taskbar.show();
                    }
                    
                    desktop.setDockZindex();
                    $(".tbc-desktop-nav").css({zIndex:5});
                }
                
                p=null;
            },

            "max" : function () {
                taskbar && taskbar.hide();
                $(".tbc-desktop-dock").css({zIndex:3});
                $(".tbc-desktop-nav").css({zIndex:3});
            },

            "min" : function () {
                var p, k;
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        p = tbc.Panel.cache[k];
                        if (p.sizeType === "max" && !p.minimize) {
                            return;
                        }
                    }
                }
                p=null;
                
                if (taskbar) {
                    taskbar.show();
                }
                desktop.setDockZindex();
                $(".tbc-desktop-nav").css({zIndex:5});
            },

            "restore" : function () {
                var p, k;
                for (k in tbc.Panel.cache) {
                    p = tbc.Panel.cache[k];
                    if (p.sizeType === "max" && !p.minimize) return;
                }
                p=null;
                taskbar && taskbar.show();
                desktop.setDockZindex();
                $(".tbc-desktop-nav").css({zIndex:5});
            },

            "destroy" : function () {
                try {
                    options = settings = null;
                } catch (e) {
                    
                }
            }
        })
        .init();
    };

    //tbc.Panel.defaultIcon    = "images/icons/newWindow.png";
    
    /**
     * 存储所有已经打开的窗体实例;
     * @property {Object} cache
     * @type {Object}
     */
    tbc.Panel.cache = tbc.Panel.cache || {}; 
    
    /**
     * 缓存ID, 数值会随着实例的增加而递增
     * @static
     * @property {Number} cacheid
     * @type {Number}
     */
    tbc.Panel.cacheid = (isNaN(tbc.Panel.cacheid) || !tbc.Panel.cacheid) ? 0 : tbc.Panel.cacheid;
    
    /**
     * 实例数量, 创建或销毁任何实例时都会更新此值
     *
     * @static
     * @property {Number} cache_length
     * @type {Number}
     */
    tbc.Panel.cache_length = isNaN(tbc.Panel.cache_length) ? 0 : tbc.Panel.cache_length;

    /**
     * 保存所有已经打开的窗口的显示顺序;
     * @static
     * @property {Array} sequence
     * @type {Array}
     */
    tbc.Panel.sequence = tbc.Panel.sequence || [];
    
    /**
     * 设置窗体默认在哪一元素内打开
     * @static
     * @property {String} parent
     * @type {String}
     */
    tbc.Panel.parent        = ".tbc-slide-scene.current";
    
    /**
     * 删除某一窗体ID在排序中的序列号
     * @static
     * @method removeSequence
     * @param  {String} windowID 窗口ID
     */
    tbc.Panel.removeSequence  = tbc.Panel.removeSequence || function(windowID) {
        tbc.Panel.sequence = tbc.array.remove(tbc.Panel.sequence, windowID);
    };

}(tbc, jQuery));

;tbc.Pop = function(settings) {
    var SELF = tbc.self (this, arguments);
    
    SELF.extend (tbc.Event, tbc.ClassManager);
    SELF.packageName = "tbc.Pop";
    
    var defaults = {
              width : 320
            , height: 180
            , icon    : null
            , autoClose    :false
            , timeout    : 3
            , locate    : null
            , parent    : null
            , counter    : ".tbc-pop-close i"
        },
        options = tbc.extend ({}, defaults, settings),
        interval= null,
        timeout = options.timeout || 5,
        zindex    = tbc.getMaxZIndex()+1,
        html    =  '<div class="tbc-pop" style="opacity:0.001; filter:alpha(opacity=0.01); z-index:'+ zindex +';">' +
                   '    <div class="tbc-pop-arrow">&diams;</div>' +
                   '    <div class="tbc-pop-close"><i></i><a href="#">&times;</a></div>' +
                   '    <div class="tbc-pop-inner">' +
                   '        <div class="tbc-pop-icon"></div>' +
                   '        <div class="tbc-pop-container"></div>' +
                   '    </div>' +
                   '</div>';
        
    SELF.ui            = $ (html).css ({width:options.width, height:options.height}).attr("tbc", SELF.guid).appendTo(options.parent||"body").bind(function() { SELF.focus(); });
    SELF.container    = SELF.ui.find (".tbc-pop-container");
    SELF.arrow        = SELF.ui.find (".tbc-pop-arrow");
    
    SELF.counter = $(options.counter, SELF.ui);
    
    SELF.extend ({
        "html" : function (t) {
            SELF.container.html(t);
            return SELF;
        },
        
        "focus" : function () {
            var z = tbc.getMaxZIndex();
                SELF.ui.css({ zIndex:z+1 });
            return SELF;
        },
        
        "show" : function () { SELF.ui.show(); return SELF;},
        
        "hide" : function () { SELF.hide(); return SELF;},        
        
        "addCounter" : function(cnt) { SELF.counter.add(cnt); return SELF},
        
        /* 倒计时 */
        "countDown" : function(count) {
            SELF.triggerEvent("beforeCountdown");
            SELF.ui.find(".tbc-pop-close i").html(count);
            SELF.triggerEvent("countdown");
            return SELF;
        },
        
        /* 停止并清除倒计时 */
        "stop" : function() {
            SELF.triggerEvent("beforeStop");
            clearInterval(interval);
            timeout = 0;
            SELF.triggerEvent("stop");
            return SELF;
        },
        
        /* 开始倒计时 */
        "start" : function() {
            interval = setInterval(function() {
                if (timeout<=0) {
                    SELF.close();
                    return;
                }
                timeout--;
                SELF.countDown(timeout);
            }, 1000);
            SELF.triggerEvent("start");
            return SELF;
        },
        
        /* 暂停倒计时 */
        "pause" : function() { clearInterval(interval); return SELF;},
        
        /* 继续倒计时 */
        "resume" : function() { this.start(); return SELF;},
        
        /* 关闭pop */
        "close" : function() {
            if (SELF.triggerEvent("beforeClose") !== false) {
                clearInterval(interval);
                SELF.ui.empty().remove();
                SELF.triggerEvent("close");
                SELF.DESTROY();
                SELF=null;
            }
            return SELF;
        },
        
        /* 从后面添加内容 */
        "append" : function(module) {
            if (SELF.triggerEvent("beforeAppend") !== false) {
                SELF.container.append(module.ui || module);
                SELF.triggerEvent("append");
            }
            return SELF;
        },
        
        /* 从前面添加内容 */
        "prepend" : function(module) {
            if (SELF.triggerEvent("beforeAppend") !== false) {
                SELF.container.prepend(module.ui||module);
                SELF.triggerEvent("append");
            }
            return SELF;
        },
        
        "appendTo" : function(target) {
            SELF.ui.appendTo(target.container||target);
            return SELF;
        },
        
        "prependTo" : function(target) {
            SELF.ui.prependTo(target.container||target);
            return SELF;
        },
        
        "setArrowX" : function(point, position) {
            var offset = SELF.ui.offset(),
                p    = position || $(point).offset(),
                pw    = point.width()/2-14,
                left = p.left+pw-offset.left;
            if (left<0)SELF.ui.css({left:"-="+Math.abs(left)+"px"});
            SELF.arrow.css({top:"",left: Math.max(1, left)+"px"});
            return SELF;
        },
        
        "setArrowY" : function(point, position) {
            var offset = SELF.ui.offset(),
                p    = position || $(point).offset(),
                ph    = point.height()/2-14,
                top = p.top+ph-offset.top;
            if (top<0)SELF.ui.css({top:"-="+Math.abs(top)+"px"});
            SELF.arrow.css({left:"",top:Math.max(top, 1) +"px"});
            return SELF;
        },
        
        //定位
        "locate" : function(point, position) {
            point = (point|| options.locate) ? $(point || options.locate) : SELF.lastLocate;
            SELF.lastLocate = point;
            
            if (point.size<0) {
                return;
            }
            
            var pos        = SELF.getPosition(point, position),
                lastCls    = SELF.ui.data("lastClass")||"tbc-pop-left",
                cls        = "",
                axis    = "y";
            
            if (pos.left === "auto") {
                if (pos.parent.height<pos.locate.bottom) {
                    cls = "tbc-pop-bottom";
                    pos.right -= pos.locate.width;
                    pos.bottom    += (pos.parent.height+pos.parent.scrollTop) - pos.locate.bottom + pos.locate.height + 20;
                    axis = "x";
                } else if (pos.locate.top<0) {
                    cls = "tbc-pop-top";
                    pos.right -= pos.locate.width;
                    pos.top += pos.locate.height+4;
                    axis = "x";
                } else {
                    cls = "tbc-pop-right";
                    pos.right+=4;
                }
            } else {
                if (pos.parent.height<pos.locate.bottom) {
                    cls = "tbc-pop-bottom";
                    pos.left -= pos.locate.width;
                    pos.bottom += (pos.parent.height+pos.parent.scrollTop) - pos.locate.bottom + pos.locate.height + 20;
                    axis = "x";
                } else if (pos.locate.top<0) {
                    cls = "tbc-pop-top";
                    pos.left -= pos.locate.width;
                    pos.top    += pos.locate.height+4;
                    axis = "x";
                } else {
                    cls = "tbc-pop-left";
                    pos.left+=4;
                }
            }
            
            pos.left = pos.left === "auto" ? pos.left : pos.left+"px";
            pos.bottom = pos.bottom === "auto" ? pos.bottom : pos.bottom+"px";
            pos.top = pos.top === "auto" ? pos.top : pos.top+"px";
            pos.right = pos.right === "auto" ? pos.right : pos.right+"px";
            
            SELF.arrow.removeClass(lastCls).addClass(cls).data("lastClass", cls);
            SELF.ui.css({ left:pos.left, right:pos.right, top:pos.top, bottom:pos.bottom, opacity:1 });
            axis === "x" ? SELF.setArrowX(point, position) : SELF.setArrowY(point, position);
            
            return SELF;
        },
        
        
        "getPosition" : function(point, position) {
            var locate    = $(point|| options.locate),
                _left    = position?position.left:0,
                _top    = position?position.top:0,
                offset    = locate.offset(),
                lcw        = locate.width(),
                lch        = locate.height(),
                lcl        = _left || offset.left,
                lct        = _top  || offset.top,
                lcr        = lcl + lcw,
                lcb        = lct + lch,
                uiw        = SELF.ui.width(),
                uih        = SELF.ui.height(),
                bodyH    = SELF.ui.offsetParent()[0].offsetHeight,
                bodyW    = SELF.ui.offsetParent()[0].offsetWidth,
                right, left, top="0", bottom="auto";
                
            if (lcr+uiw>bodyW && uiw<lcl) {
                right    = bodyW-offset.left;
                left    = "auto";
            } else {
                right    = "auto";
                left    = lcr;
            }
            
            if (lct+uih>bodyH) {
                top        = "auto";
                bottom    = 0;
            } else {
                top        = lct;
                bottom    = "auto";
            }
            
            return {
                top        : top,
                bottom    : bottom,
                left    : left,
                right    : right,
                width    : uiw,
                height    : uih,
                locate    : { left:lcl, top:lct, right:lcr, bottom:lcb, width:lcw, height:lch },
                parent    : { height:bodyH, width:bodyW, scrollTop:SELF.ui.offsetParent()[0].scrollTop, scrollLeft:SELF.ui.offsetParent()[0].scrollLeft }
            };
        }
        
    });
    
    SELF.ui.find(".tbc-pop-close a").bind({
        "click": function() {
            SELF.close();
            return;
        }
    });
    
    if (options.autoClose===true) {
        SELF.start();
    }
    
    SELF.addEvent ({
        "destroy" : function () {
            SELF = defaults = options = interval= timeout = zindex    = html    =  null;
        }
    });
};
;(function(tbc, $){
    
    "use strict";
    
    /**
     *标签基类 
     * @class tbc.Tabpage
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
     
    tbc.Tabpage = function (settings) {
        
           
        var defaults = {
              title     : null
            , icon      : null
            , closable  : false
            , closeNode : null
            , handleNode: ""
            , titleNode : null
            , iconNode  : null
            , container : null
            , content   : null
            
            , duration  : 300
            , easing    : null
            , autoShow  : true
        }
        ,options = tbc.extend({}, defaults, settings)
        
        ,handleNode = $(options.handleNode)
        ,iconNode   = $(options.iconNode, handleNode)
        ,titleNode  = $(options.titleNode, handleNode)
        ,container  = $(options.container)
        ;
        
        tbc.self (this, arguments).extend({
            
            /**
             * 初始化
             * @private
             * @method init
             * @chainable 
             */
            init : function() {
                this.packageName = "tbc.Tabpage";
                
                if (options.group) {
                    this.group = options.group;
                    this.appendTo(this.group);
                }
                if (options.autoShow) { this.show(); }
            },
            
            /**
             * 标签页头
             * @public
             * @property handle
             * @type {jQuery Object} 
             */
            handle : handleNode,

            /**
             * 标签内容容器
             * @public
             * @property container
             * @type {jQuery Object} 
             */
            container : container,

            /**
             * 标签内容容器
             * @private
             * @property ui
             * @type {jQuery Object} 
             */
            ui : container,

            /**
             * 设置或者获取标签页的标题
             * @public
             * @method title
             * @param {String} [title] 新标题
             * @return {String} 如果没有title参数，则返回标签页的名称，否则设置新标题并返回实例自己 
             */
            title : function(title) {
                var ret;
                if (title) {
                    titleNode.html(title);
                    ret = this;
                }else{
                    ret = $.trim(titleNode.html());
                }
                try {
                    return ret;
                } finally {
                    ret = null;
                }
            },

            /**
             * 设置或者获取标签页的图标
             * @public
             * @method icon
             * @param {String} [icon] 图标路径
             * @return {String} 如果没有icon参数，则返回标签页的路径，否则设置新图标并返回实例自己 
             */
            icon : function(icon) {
                var ret;
                if (icon) {
                    iconNode.attr("src", icon);
                    ret = this;
                } else {
                    ret = iconNode.attr("src");
                }

                try {
                    return ret;
                } finally {
                    ret = null;
                }
            },

            /**
             * 向底部滑出
             * @public
             * @method outToBottom
             * @param {Function} func 回调方法 
             */
            outToBottom : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    parent = container.parent(),
                    height = parent.height();
                
                container.animate({top:height}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 向顶部滑出
             * @public
             * @method outToTop
             * @param {Function} func 回调方法 
             */
            outToTop : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    height = container.height();
                container.animate({top:-height}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            /**
             * 向右侧滑出
             * @public
             * @method outToRight
             * @param {Function} func 回调方法 
             */
            outToRight : function(func) {
                this.triggerEvent("beforeHide");
                var SELF   = this,
                    parent = container.parent(),
                    width  = parent.width();
                container.animate({left:width}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 向左侧滑出
             * @public
             * @method outToLeft
             * @param {Function} func 回调方法 
             */
            outToLeft : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    width = container.width();
                    
                container.animate({left:-width}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 从顶部滑入标签页
             * @public
             * @method inFromTop
             * @param {Function} func 回调方法 
             */
            inFromTop : function(func) {
                
                this.triggerEvent("beforeShow");
                var SELF = this,
                    height = container.height();
                container.css({ top:-height }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 从底部滑入标签页
             * @public
             * @method inFromBottom
             * @param {Function} func 回调方法 
             */
            inFromBottom : function(func) {
                
                this.triggerEvent("beforeShow");
                
                var SELF = this,
                    parent = container.parent(),
                    height = parent.height();
                container.css({ top:height }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 从左侧滑入标签页
             * @public
             * @method inFromLeft
             * @param {Function} func 回调方法 
             */
            inFromLeft : function(func) {
                var SELF = this,
                    width = container.width();
                
                this.triggerEvent("beforeShow");
                
                container.css({ left:-width }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 从右侧滑入标签页
             * @public
             * @method inFromRight
             * @param {Function} func 回调方法 
             */
            inFromRight : function(func) {
                var SELF = this,
                    parent = container.parent(),
                    width = parent.width();
                
                this.triggerEvent("beforeShow");
                
                container.css({ left:width }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 淡出标签页
             * @public
             * @method fadeOut
             * @param {Function} func 回调方法 
             */
            fadeOut : function(func) {
                var SELF = this;
                this.triggerEvent("beforeHide");
                container.css({top:0,left:0}).animate({opacity:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 淡入标签页
             * @public
             * @method fadeIn
             * @param {Function} func 回调方法 
             */
            fadeIn : function(func) {
                var SELF = this;
                this.triggerEvent("beforeShow");
                container.css({top:0,left:0}).show().animate({opacity:1}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 显示标签页
             * @public
             * @method show
             * @param {Function} func 
             */
            show : function(func) {
                this.triggerEvent("beforeShow");
                container.css({top:0,left:0, opacity:1}).show();
                if ($.isFunction(func)) {
                    func();
                }
                this.triggerEvent("show");
            },
            
            /**
             * 隐藏标签页
             * @public
             * @method hide
             * @param {Function} func 回调方法 
             */
            hide : function(func) {
                this.triggerEvent("beforeHide");
                container.css({top:0,left:0}).hide();
                if($.isFunction(func)) {
                    func();
                }
                this.triggerEvent("hide");
            },
            
            /**
             * 关闭标签页
             * @public
             * @method close 
             */
            close : function() {
                if (options.closable && this.triggerEvent("beforeClose") !== false) {
                    $(options.handleNode).empty().remove();
                    container.empty().remove();
                    this.triggerEvent("close");
                    delete this.group;
                    
                    this.DESTROY();
                    
                    defaults = options = handleNode = iconNode = titleNode = container = null;
                }
            },
            
            /**
             * 将标签页添加到一个标签集的后面 
             * @public
             * @param {Object} group 标签集
             * @chainable
             */
            appendTo : function(group) {
                
                // 从原来的标签集合中移除
                if (this.group) {
                    this.group.remove(this.index);
                }
                
                // 加入新的选项卡集合
                group.append(this);
                this.group = group;
                return this;
            },
            
            /**
             * 将标签页添加到一个标签集的最前面 
             * @public
             * @param {Object} group 标签集
             * @chainable
             */
            prependTo : function(group) {
                // 从原来的标签集合中移除
                if (this.group) {
                    this.group.remove(this.index);
                }
                
                // 加入新的选项卡集合
                group.prepend(this);
                this.group = group;
                return this;
            }
                    
        })
        .addEvent({
            "beforeShow" : function() {
                this.handle.addClass(options.currentClass || "current");
                this.container.addClass(options.currentClass || "current");
            },
            "beforeHide" : function() {
                this.handle.removeClass(options.currentClass || "current");
                this.container.removeClass(options.currentClass || "current");
            },
            "hide" : function() {
                container.hide();
            },
            "destroy" : function () {
                defaults = options = settings = handleNode = iconNode = titleNode = container = null;
            }
        })
        .init();
    
    };
}(tbc, jQuery));

/**
 * 选项卡视图
 * @class tbc.Tabset
 * @constructor
 * @uses tbc.Event
 * @uses tbc.ClassManager
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.Tabset = function(settings) {

        var defaults = {
              container  : ".tbc-tabset"
            , header     : ".tbc-desktop-nav"   //

            , prevHandle : ".tbc-tabset-prev"
            , nextHandle : ".tbc-tabset-next"

            , effects   : "slide-x"      // [fade, slide-x, slide-y]
            , easing    : "swing"

            , loop      : true
            , auto      : true           // 自动切换
            , timeout   : 5000           // 自动切换的间隔时间(毫秒,1000ms === 1s)
            , speed     : 800
        },
        options    = $.extend({}, defaults, settings);

        tbc.self(this, arguments)
        .extend ({
            init : function() {

                var SELF = this;

                this.packageName = "tbc.Tabset";
                this.header     = $(options.header);
                this.container  = $(options.container);
                this.tabs       = [];
                this.currIndex  = 0;

                // 触控
                if (tbc.touchable) {
                    var sx=0, sy=0, st;
                    this.container[0].addEventListener("touchstart", function(event) {
                        sx = event.touches[0].pageX;
                        sy = event.touches[0].pageY;
                        st = new Date().getTime();
                    });

                    this.container[0].addEventListener("touchmove", function(event) {
                        var nx = event.touches[0].pageX,
                            ny = event.touches[0].pageY;
                        SELF.current().ui.css({ left: nx-sx });
                        nx = ny = null;
                    });

                    this.container[0].addEventListener("touchend", function(event) {
                        var nx = event.changedTouches[0].pageX,
                            ny = event.changedTouches[0].pageY,
                            et = new Date().getTime(),
                            r  = Math.abs(nx-sx), // 移动的距离
                            w  = SELF.container.width();

                        if (r > (w/2) || r > (w/2)/(1000/(et-st))) {
                            if (nx<sx && !SELF.isLast()) {
                                SELF.next();
                            } else if (nx>sx && !SELF.isFirst()) {
                                SELF.prev();
                            } else {
                                SELF.current().ui.animate({left:0});
                            }
                        } else {
                            SELF.current().ui.animate({left:0});
                        }
                        nx = ny = w = null;
                    });
                }

            },

            /**
             * 判断当前处于可视状态的标签页是不是第一个
             * @public
             * @method isFirst
             * @return {Boolean}
             */
            isFirst : function() {
                return this.currIndex === 0;
            },

            /**
             * 判断当前处于可视状态的标签页是不是最后一个
             * @public
             * @method isLast
             * @return {Boolean}
             */
            isLast : function() {
                return this.currIndex === this.tabs.length-1;
            },

            /**
             * 获得当前的标签页
             * @public
             * @method current
             * @return {Object} 
             */
            current : function() {
                return this.tabs[this.currIndex];
            },

            /**
             * 显示下一个标签页
             * @public
             * @method next
             * @param  {Number} [index1] 指定下一个的索引值
             * @chainable
             */
            next : function(index1) {

                var current = this.tabs[this.currIndex],
                    index	= !isNaN(index1) ? index1 : (this.currIndex+1 >= this.tabs.length ? 0 : this.currIndex+1);

                switch(this.effect()) {
                    case "slide-x":
                        current && current.outToLeft();
                        this.tabs[index].inFromRight();
                        break;
                    case "slide-y":
                        current && current.outToTop();
                        this.tabs[index].inFromBottom();
                        break;
                    case "fade":
                        current && current.fadeOut();
                        this.tabs[index].fadeIn();
                        break;
                    default:
                        current && current.hide();
                        this.tabs[index].show();
                        break;
                }
                this.currIndex = index;

                return this;
            },
            
            /**
             * 显示上一个标签页
             * @public
             * @method prev
             * @param  {Number} [index1] 指定上一个的索引值
             * @chainable
             */
            prev : function(index1) {

                var current = this.tabs[this.currIndex],
                    index	= !isNaN(index1) ? index1 : (this.currIndex-1<0 ? this.tabs.length-1 : this.currIndex-1),
                    tab = this.tabs[index],
                    methodShow,
                    methodHide;

                switch(this.effect()) {
                    case "slide-x":
                        methodShow = "inFromLeft";
                        methodHide = "outToRight";
                        //current && current.outToRight();
                        //this.tabs[index].inFromLeft();
                        break;
                    case "slide-y":
                        methodShow = "inFromTop";
                        methodHide = "outToBottom";
                        //current && current.outToBottom();
                        //this.tabs[index].inFromTop();
                        break;
                    case "fade":
                        methodShow = "fadeIn";
                        methodHide = "fadeOut";
                        //current && current.fadeOut();
                        //this.tabs[index].fadeIn();
                        break;
                    default:
                        methodShow = "show";
                        methodHide = "hide";
                        //current && current.hide();
                        //this.tabs[index].show();
                        break;
                }

                if (current && typeof(current[methodHide]) === "function") {
                    current[methodHide]();
                }

                if (tab && typeof(tab[methodShow]) === "function") {
                    tab[methodShow]();
                }

                this.currIndex = index;

                return this;
            },
            
            /**
             * 显示指定的标签页
             * @public
             * @method show
             * @param  {Number} index 指定要显示的标签的序号
             * @chainable
             */
            show : function(index) {
                var curIndex = this.currIndex,
                     cur;

                index = index || 0;
                //if (index === cur)return this;

                if (index<curIndex) {
                    this.prev(index);
                } else if (index>curIndex) {
                    this.next(index);
                } else {
                    cur = this.tabs[this.currIndex];
                    if (cur) {
                        cur.fadeIn();
                    }
                }
                return this;
            },

            /**
             * 追加一个标签页，标签页只能是tbc.Tabpage的实例
             * @public
             * @method append
             * @param  {tbc.Tabpage} tabpage 要追加的标签页，tbc.Tabpage的实例
             * @chainable
             */
            append : function(tabpage) {

                var self = this;

                this.header.append(tabpage.handle);
                this.container.append(tabpage.container);
                this.tabs.push(tabpage);

                tabpage.handle.bind("click", function() {
                    self.show(tabpage.index);
                });

                if (tabpage.autoShow) {
                    this.show(this.tabs.length-1);
                }

                tabpage.index = this.tabs.length-1;
                tabpage.group = this;

                tabpage.addEvent({
                    close : function() {
                        self.remove(tabpage.index);
                    },
                    beforeShow  : function() {
                        var ind = this.index;
                        $.each(self.tabs, function(i, tab) {
                            if (i !== self.currIndex && i !== ind) tab.hide();
                        });
                    }
                });
                return this;
            },

            /**
             * 从前面追加一个标签页，标签页只能是tbc.Tabpage的实例
             * @public
             * @method prepend
             * @param  {tbc.Tabpage} tabpage 要追加的标签页，tbc.Tabpage的实例
             * @chainable
             */
            prepend : function(tabpage) {

                var SELF = this;
                this.header.prepend(tabpage.title);
                this.container.prepend(tabpage.content);
                this.tabs = [tabpage].concat(this.tabs);

                if (tabpage.autoShow) { this.show(0); }
                tabpage.index = 0;
                tabpage.group = this;

                tabpage.addEvent({
                    close : function() { SELF.remove(tabpage.index);}
                });

                return this;
            },

            /**
             * 设置标签页切换的方式
             * @public
             * @method effect
             * @param  {String} effects 效果，取值范围：['slide-x', 'slide-y', 'fade', 'none']
             * @chainable
             */
            effect : function(effects) {
                if (typeof(effects) !== "string") {
                    return options.effects;
                }else{
                    options.effects = effects;
                }
                return this;
            },

            /**
             * 设置标签页切换的缓冲效果
             * @public
             * @method easing
             * @param  {String} effects 缓冲效果，取值范围：jQuery.easing所设置的值
             * @chainable
             */
            easing : function(easing) {
                if (typeof(easing) !== "string") {
                    return options.easing;
                }else{
                    options.easing = easing;
                }
                return this;
            },

            /**
             * 移除一个标签页
             * @public
             * @method remove
             * @param  {Number} index 要移除的标签页序号
             * @chainable
             */
            remove : function(index) {
                if (index === this.currIndex) {
                    if (index<this.tabs.length-1) {
                        this.excludeTab(index);
                        this.next();
                    } else if (index>0) {
                        this.excludeTab(index);
                        this.prev();
                    }
                } else if (index < this.currIndex) {
                    this.excludeTab(index);
                    this.currIndex-=1;
                    this.show(this.currIndex);
                } else {
                    this.excludeTab(index);
                }
                //this.excludeTab(index);
                return this;
            },

            /**
             * 将一个标签页的序号从此标签集排除，不在接受
             * 此标签集的管理
             * @public
             * @method excludeTab
             * @param {Number} index 标签页的序号
             * @chainable
             */
            excludeTab : function(index) {

                var tabs = [],
                    _tab,
                    i,
                    len;
                for (i=0,len=this.tabs.length; i<len; i++) {
                    _tab = this.tabs[i];
                    if (_tab && _tab.index !== index) {
                        _tab.index = tabs.length;
                        tabs.push(_tab);
                    }
                }

                _tab = null;
                this.tabs = tabs;
                return this;
            }
        })
        .addEvent ({
            "destroy" : function () {
                defaults = options = settings = null;
            }
        })
        .init();
    }
}(tbc, jQuery));

// 在线人数更新
tbc.namespace("tbc.tree");
tbc.tree.Editor = tbc.tree.Editor || function (settings) {
	
	var SELF = tbc.self(this, arguments),
		
		defaults = {
			editUrl:"",
			
			addible		: true,
			editable	: true,
			deletable	: true
			
		},
		
		options = $.extend({}, defaults, settings);
	
	SELF.extend ([tbc.Tree, settings], {
		
		packageName : "tbc.tree.Editor",
		
		 // 是否能删除
		isDeletable : function (id) {
			return this.hasChildren (id);
		},
		
		// 操作菜单
		hoverTools : function (id) {
			
			var tools = [],
				node  = typeof id === "string" ? this.cache(id) : id;
			
			!options.level || node.level<options.level 
				? tools.push('<a href="javascript:void(0);" class="stree-add">新增</a>')
				: tools.push('<span style="color:#888; text-decoration:line-through;">新增</span>');
			
			var isRoot = this.isRoot(id);
			if (!isRoot) {
				tools.push('<a href="javascript:void(0);" class="stree-edit">编辑</a>');
				
				!this.isFirst(id) 
					? tools.push('<a href="javascript:void(0);" class="stree-moveup">上移</a>')
					: tools.push('<span style="color:#888; text-decoration:line-through;">上移</span>');
				
				!this.isLast(id)
					? tools.push('<a href="javascript:void(0);" class="stree-movedown">下移</a>')
					: tools.push('<span style="color:#888; text-decoration:line-through;">下移</span>');
				
				!this.isDeletable(id)
					? tools.push('<a href="javascript:void(0);" class="stree-delete">删除</a>')
					: tools.push('<span style="color:#888; text-decoration:line-through;">删除</span>');
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
			
			var node	= $(id.html).css({background:"yellow"});
			
			if (node.hasClass("disabled")) {
				node=null;
				return false;
			} else {
				node.addClass("disabled");
			}
			
			var self	= SELF,
				button	= node.find(".stree-delete"),
				offset	= button.offset(),
				tips	= $('<div class="tbc-tips">确定删除吗?&nbsp;&nbsp;<a class="_dle" href="javascript:void(0);">删除</a>&nbsp;<a class="_cancel" href="javascript:void(0);">取消</a></div>')
					.css({ left:offset.left, top:offset.top-12, opacity:0, background:"#fff", border:"1px solid #ccc", padding:"6px", position:"absolute", zIndex:"10000"})
					.appendTo("body")
					.animate({left:"+=24px", opacity:1}, 200),
				close	= function() {
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
			var node	= typeof id === "string" ? this.cache(id) : id,
				parent	= node.parents[node.parents.length-1],
				sibling	= this.cache(parent).property.sn,
				index,
				nnode	= node.html;
			
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
					url 		: options.deleteUrl,
					type		: "post",
					dataType	: "json",
					data		: { id:id, action:"delete" },
					beforeSend	: function() {},
					complete	: function() {},
					error		: function() {},
					success		: function(result) {
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
			
			var node	= this.cache(id),
				parent	= node.parents[node.parents.length-1],
				sibling	= this.cache(parent).property.sn,
				prev;
			
			for (var i=0,len=sibling.length; i<len; i++) {
				if (sibling[i].id === id) {
					prev = sibling[i-1];
					sibling[i-1] = sibling[i];
					sibling[i] = prev;
					break;
				}
			}
			
			// HTML节点
			var nnode = $(node.html).parent();
				nnode.insertBefore(nnode.prev());
				
			this.nodeMoveAjax(id, "up");
			
			node = nnode = paren = sibling = next = null;
		},
		
		// 下移
		nodeMovedown : function (id) { 
			if (!id || this.isLast(id)) { return }
			
			var node	= this.cache(id),
				parent	= node.parents[node.parents.length-1],
				sibling	= this.cache(parent).property.sn,
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
					url 		: options.moveUrl,
					type		: "post",
					data		: { id:id, type:type },
					dataType	: "html",
					beforeSend	: function() {},
					complete	: function() {},
					error		: function() {},
					success		: function() {
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
	});
	
	// HoverOut
	SELF.ui.delegate(".stree-node", "mouseleave", function (event) {
		$(this).removeClass("stree-node-hover")
		.find(".stree-node-tools").hide().html("");
	});
	
	// 新增
	SELF.ui.delegate(".stree-add", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeAddHandle(id);
	});
	
	// 上移
	SELF.ui.delegate(".stree-moveup", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeMoveup(id);
	});
	
	// 下移
	SELF.ui.delegate(".stree-movedown", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeMovedown(id);
	});
	
	// 编辑
	SELF.ui.delegate(".stree-edit", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeEditHandle(id);
	});
	
	// 删除
	SELF.ui.delegate(".stree-delete", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeDelete(id);
	});
	
}
/**
 * @class tbc.Tree
 * @constructor
 * @author mail@luozhihua.com
 */
;(function(tbc, $){
    window.tbc = tbc || {};
    
    tbc.Tree = function(settings) {
        "use strict";
        
        // 默认配置
        var SELF = tbc.self(this, arguments),
            defaults = {
                width       : 'auto',
                height      : 'auto',
                url         : null,
                level       : 1,
                lazyLevel   : 4,
                deleteNode  : true,
                upNode      : true,
                downNode    : true,
                cascadeCheck: true,
                singleCheck : false,
                multiple    : false,
                editable    : true,
                
                addUrl      : null,
                deleteUrl   : null,    
                editUrl     : null,
                moveUrl     : null,
                
                data        : null,
                addNode     : true,
                extool      : [],
                confirmmsg  : '确定要删除{name}吗?',
                exconfirmmsg: '删除后将无法恢复,确定要删除吗?',
                errormsg    : '无法删除',
                
                formatExtool: function() {},
                isRetracted : true,
                renderTo    : ''
                // selectRule : "ALL", // 
                
                /*
                onLoad        : function() {},
                onCheck        : function() {},
                onSelect    : function() {},
                onDelete    : function() {},
                
                event : {
                      'addNode'        : function(opt) { } // opt={id:newNodeId, pr:parentNodeId, nm:nodeName, sg:before}
                    , 'deleteNode'    : function(node, parents) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode}; parents=[parentsId,...]
                    , 'fold'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'unfold'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'check'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'uncheck'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'select'        : function(node, HTMLElement_Of_Node, child) {}
                    
                    
                    , 'beforeLoad'    : function() {}
                    , 'afterLoad'    : function() {}
                    , 'error'        : function() {}
                    , 'beforeRender': function() {}
                    , 'afterRender' : function() {}
                }
                */
            },

            // 选项
            options = $.extend({}, defaults, settings);
        
        options.container    = options.ui ? $(options.ui).find(options.container) : $(options.container);
        options.ui            = options.ui ? $(options.ui) : options.container;
        
        SELF.addEvent(options.event);
        SELF.addEvent({
            'afterRender' : function() { if ($.isFunction(options.onLoad)) {options.onLoad.apply(this, arguments);} },
            'select'      : function() { if ($.isFunction(options.onSelect)) {options.onSelect.apply(this, arguments);} },
            'deleteNode'  : function() { if ($.isFunction(options.onDelete)) {options.onDelete.apply(this, arguments);} },
            'check'       : function() { if ($.isFunction(options.onCheck)) {options.onCheck.apply(this, arguments);} },
            'move'        : function() { if ($.isFunction(options.onMove)) {options.onMove.apply(this, arguments);} },
            'addNode'     : function() { if ($.isFunction(options.onAdd)) {options.onAdd.apply(this, arguments);} }
        });

        SELF.packageName = "tbc.Tree";
        SELF.extend ({
            
            ui            : options.ui,
            container    : options.container,
            
            appendTo    : function(box) {
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

            load    : function () {
                
                var ah = $.ajax({
                    url        : options.url,
                    type    : options.param?"post":"get",
                    data    : $.extend({}, options.param, {noDepPath:options.noDepPath}),
                    dataType: "json",
                    beforeSend    : function () { SELF.triggerEvent("beforeLoad") },
                    complete: function () { SELF.triggerEvent("afterLoad"); },
                    error    : function () { SELF.triggerEvent("error", "loading failed!"); },
                    success    : function (json) { SELF.render(json); }
                });

                this.addEvent({
                    "destroy" : function() {
                        ah.abort && ah.abort();
                        ah = null;
                    }
                });
            },
            
            // 渲染tree
            render    : function (data) {
                this.triggerEvent("beforeRender");
                var st = new Date().getTime();
                this.container.html (this.createChild(data));
                //window.console && console.log(">tbc.Tree> render time: "+ (new Date().getTime()-st) + "ms");
                this.addHtmlCache();
                //window.console && console.log(">tbc.Tree> cache time: "+ (new Date().getTime()-st) + "ms");
                
                this.triggerEvent("afterRender");
            },
            
            // 更新HTML缓存
            addHtmlCache : function (html) {
                html = html ? $(html) : this.container.find("dt.stree-node");
                
                var self = SELF;
                $(html).each(function() {
                    var id = this.getAttribute("data-id");
                    self.cache(id, "html", this);
                });
                self = html = null;
            },
            
            /*
             * 缓存数据
             * @param    : id;
             * @param    : key;
             * @param    : data;
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
                    leng = children.length,
                    id, properties,
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
                    
                    this._cacheIndex.push(id);
                    
                    if (notRender===true) {
                        if (this._delayCreateNode) {
                            this._delayCreateNode(properties, level, parents.concat([id]), curr, notRender);
                        } else {
                            break;
                        }
                    } else {
                        if (i === 0) curr = "first";
                        if (i === leng-1) curr = "last";
                        if (!root) root = ["<ul>"];
                        root.push (this.createNode (properties, level, parents.concat([id]), curr, notRender));
                        if (curr === "last") root.push('</ul>');
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
                    if (self.createNode) self.createNode (a, b, c, d, e); 
                    self = null;
                }, 0);
            },
            
            /*
             * 创建节点
             * @param    : properties
             */
            createNode : function(properties, level, parents, firstLast, notRender) {
                
                var id    = properties.id,
                    child = properties.sn || properties.children,
                    lazyLevel, cache, name, childHtml, FLCLS, classN, tools, checkbox, html;
                
                // 如果是懒渲染, 则直接遍历子节点并返回
                if (notRender===true && child && child.length>0) {
                    this.createChild(child, level+1, parents, notRender);
                    child = null;
                    return "";
                }
                
                lazyLevel= options.lazyLevel || 2;
                cache    = this.cache(id);
                name     = properties.nm||properties.text;
                childHtml= "";
                FLCLS    = firstLast==="first" ? " tbc-tree stree-node-first" : firstLast==="last" ? " stree-node-last" : "";
                classN   = "stree-node stree-level-{3}" + FLCLS + (!child||child.length===0?" stree-leaf":"");
                tools    = '<div class="stree-node-tools" style="display:none; float:none;"></div>';
                checkbox = options.checkbox ? 
                                '<span class="tbc-checkbox stree-checkbox" data-id="{0}" data-text="{1}">' +
                                   '    <input type="checkbox" name="'+ options.checkboxName +'" value="{0}" title="{1}" ' +(cache&&cache.checked?' checked="checked" ':'')+ '/>' +
                                   '</span>'
                                :  '';
                
                // 0:id; 1:name; 2:class; 3:level; 4:tools; 5:children
                html        =  '<li>' +
                               '    <dt data-id="{0}" data-text="{1}" title="{1}" class="{2}">' +
                               '        <span class="stree-space" style="width:'+ (level*16) +'px;"></span>' +
                               '        <span class="stree-handle" level="{3}"></span>' +
                                        checkbox +
                               '        <span class="stree-icon stree-icon-{3}"></span>' +
                               '        <span class="stree-text">{1}</span>' +
                               '       {4}' +
                               '    </dt>' +
                               '    {5}' +
                               '</li>';
            
                if (child && child.length>0) {
                    
                    // 直接渲染子节点
                    if (level<lazyLevel) {
                        childHtml = this.createChild(child, level+1, parents);
                        this.cache(id, "rendered", true);
                    
                    // 懒渲染
                    } else if (child) {
                        this.createChild(child, level+1, parents, true);
                        classN += " stree-node-retracted";
                    }
                }
                
                html = tbc.formatString(html, id, name, classN, level, tools, childHtml);
                
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
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text, sg:before} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
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
             * 在最后面插入节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             */
            appendNode : function (id, text, parentId) {
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    node,
                    p;
                    
                if (opt) {
                    p = parent.parents.concat([opt.pr]);
                    node    = $(this.createChild([opt], parent.level+1, p));
                    
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
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    node, p;
                    
                if (opt) {
                    p = parent.parents.concat([opt.pr]);
                    node    = $(this.createChild([opt], parent.level+1, p));
                    
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
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text, sg:before} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    sibling = parent.property.sn || [],
                    node,
                    p, i, len;
                before = typeof before==="string" ? this.cache(before) : before;
                
                if (!before) {
                    this.appendNode(id, text, parentId);
                } else {
                    p = parent.parents.concat([opt.pr]);
                    node    = $(this.createChild([opt], parent.level+1, p));
                    
                    for (i=0,len=sibling.length; i<len; i+=1) {
                        if (sibling[i].id===before.property.id) {
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
             * @param: id; 节点ID
             */
            deleteNode : function (id) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                if (this.hasChildren(id)) {
                    return;
                }
                
                var parents    = id.parents,
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
            
            /*
             * 展开或者折叠树节点
             * @param    : id[string|htmlElement|jQuery selector|jQuery object];
             */
            toggleNode    : function (id) {
                var itm = typeof id==="string" ?
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
            
            /*
             * 展开树节点
             * @param    : id[string|htmlElement|jQuery selector|jQuery object];
             */
            unfoldNode : function (id) {
                var itm = typeof id==="string" ?
                    this.container.find("div[data-id='"+ id +"']") :
                    $(id);
                    
                if (itm.size() !== 0) {
                    itm.removeClass("stree-node-retracted");
                    itm.next("ul").removeClass("hide");
                }
                this.triggerEvent("unfold", itm);
            },
            
            /*
             * 折叠树节点
             * @param    : id[string|htmlElement|jQuery selector|jQuery object];
             */
            foldNode : function (id) { 
                var itm = typeof id==="string" ?
                    this.container.find("div[data-id='"+ id +"']") :
                    $(id);
                
                if (itm.size() !== 0) {
                    itm.addClass("stree-node-retracted");
                    itm.next("ul").addClass("hide");
                }
                
                this.triggerEvent("fold", itm);
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
            
            /*
             * 获取子节点
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
            
            isRoot : function (id) {
                var cache = typeof id==="string" ? this.cache(id) : id;
                try {
                    return (cache && cache.level===0);
                } finally {
                    cache = null;
                }
            },
            
            /*
             * 获取同级节点
             */
            getSiblings : function (id) {
                var cache = typeof id==="string" ? this.cache(id) : id,
                    parent= cache.parents ? cache.parents[cache.parents.length-1] : null,
                    siblings = parent&&parent.property ? parent.property.sn||parent.property.children||[] : [],
                    nodes = [],
                    itm, ele,
                    i, len;
                    
                if (parent) {
                    parent = this.cache(parent);
                }
                
                for (i=0,len=siblings.length; i<len; i+=1) { 
                    itm = siblings[i];
                    ele = this.cache(itm.id);
                    if (ele && itm.id !== id) {
                        nodes.push(ele);
                    }
                }
                
                try{ return nodes; } finally { cache = parent  = siblings = nodes = itm = ele = id = null; }
            },
            
            // 选中节点
            checkNode : function(list, callback) {
                
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
                                    if (typeof node==="string") {
                                        node = SELF.cache(node);
                                    }
                                    
                                    node.checked = true;
                                    $(node.html).addClass(options.checkedCss||"stree-node-checked")
                                    .find("input[type='checkbox']").attr("checked", true);
                                }
                                
                                if (isEnd && (!tbc.isFunction(callback) || callback.call(SELF, list) !== false)) {
                                    SELF.triggerEvent("check", list);
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
            
            /*
             * 取消选中某个节点
             * @param    : id[string|htmlElement|jQuery object];
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
            
            // 选中或取消节点
            chooseNode: function (id, multiple) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                var o = options,
                    current = this.getWillBeChecked(id);
                    
                if (!o.singleCheck) {
                    if (id.checked) {
                        this.uncheckNode(current);
                    } else {
                        this.checkNode(current);
                    }
                } else {
                    
                    if (!multiple && o.singleCheck) {
                        this.uncheckNode(this.getWillBeUnchecked(id));
                    }
                    
                    if (id.checked) {
                        this.uncheckNode(current);
                    } else {
                        this.checkNode(current);
                    }
                }
                
                id = current = o = null;
            },
            
            // 获取准备选中的节点
            getWillBeChecked : function(id) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                var child = [id];
                if (options.cascadeCheck) {
                    child = child.concat(this.getChildNodes(id, true));
                }
                try { return child; } finally { child = id = null; }
            },
            
            // 获取准备取消选中的节点
            getWillBeUnchecked : function(exclude) {
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
            
            
            hasChildren : function (id) {
                var node = typeof id==="string" ? this.cache(id) : id;
                try { 
                    return node && node.property.sn && node.property.sn.length>0;
                } finally {
                    node = null;
                }
            },
            
            // 是否处于所有统计节点的最前面
            isFirst    : function (id) {
                var node    = typeof id==="string" ? this.cache(id) : id,
                    paren    = node.parents[node.parents.length-1],
                    sibling    = paren ? this.cache(paren).property.sn : null,
                    retn    = (sibling && sibling[0].id===id) ? true : false;
                
                try { return retn; } finally { node = paren = sibling = null; }
            },
            
            // 是否处于所有统计节点的最后面
            isLast    : function (id) {
                var node   = typeof id==="string" ? this.cache(id) : id,
                    paren  = node.parents[node.parents.length-1],
                    sibling= paren ? this.cache(paren).property.sn : null,
                    retn   = sibling && sibling[sibling.length-1].id===id;
                try { return retn; } finally { node = paren = sibling = null; }
            },
            
            // 设为当前节点
            setCurrent: function (id) {
                
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
                
                this.triggerEvent("select",  data, $(elem), child);
                cls = data = elem = child = null;
            },
            
            // 设为当前节点
            selectNode : function (id, multiple, dbl) {
                
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
            
            deselectNode : function (nodeList) {
                var cls = options.currentCss||"stree-node-selected",
                    i, len;
                for (i=0,len=nodeList.length; i<len; i+=1) {
                    $(nodeList[i].html).removeClass(cls);
                    nodeList[i].current = false;
                }
                this.triggerEvent ("deselect", nodeList);
            },
            
            getCurrent : function() {
                var node, id,
                    i, len;
                for (i=0,len=this._cacheIndex.length; i<len; i+=1) {
                    id        = this._cacheIndex[i];
                    node    = this.cache(id);
                    if (node.current === true) {
                        try { return node; } finally { id = node = null; }
                    }
                }
                
                id = this.container.children("ul:first").children("li:first").children(".stree-node").attr("data-id");
                
                try { return this.cache(id); } finally { id = node = null; }
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
                var id = this.container.children("ul:first").children("li:first").children(".stree-node").attr("data-id");
                try { return this.cache(id); } finally { id = null; }
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
         
        // 收缩节点
        SELF.ui.delegate(".stree-handle", "click", function(event) {
            
            event.stopPropagation();
            
            var self = SELF,
                node = this.parentNode,
                id   = node.getAttribute("data-id"),
                cache= self.cache(id),    
                property= cache.property,
                child   = property.sn || property.children,
                level, html, li, childNodes;
            
            self.toggleNode(node);
            
            // 如果没有渲染,则渲染子节点
            if (property && child && !cache.rendered) {
                level = window.parseInt(cache.level) + 1;
                html  = self.createChild(child, level, cache.parents.concat([id]));
                
                cache.rendered = true;
                self.cache(id, "rendered", true);
                
                li = $(this.parentNode.parentNode).append(html);
                childNodes = li.find("dt.stree-node");
                
                // 缓存新渲染的tree节点
                self.addHtmlCache(childNodes);
                self.triggerEvent("itemRender", child);
                
                child = level = html = null;
            }
            
            self = node = id = cache = null;
        });
        
        // 选中或取消选中节点
        SELF.ui.delegate(".stree-node", "click", function(event) {
            var id = this.getAttribute("data-id");
            SELF.selectNode(id, event.ctrlKey && options.multiple);
        });
        
        // (双击) 选中或取消选中节点
        SELF.ui.delegate(".stree-node", "dblclick", function(event) {
            var id = this.getAttribute("data-id"),
                dbl = true;
            SELF.selectNode(id, event.ctrlKey && options.multiple, dbl);
        });
        
        // 选择框
        if (options.checkbox) {
            SELF.ui.delegate("input[type='checkbox']", "click", function(event) {
                SELF.chooseNode (this.value, event.ctrlKey||!options.singleCheck);
                event.stopPropagation();
            });
        }
    };
}(tbc, jQuery));

// 在线人数更新

tbc.namespace("tbc.tree");
tbc.tree.Online = function (settings) {
	var SELF = tbc.self(this, arguments),
		defaults = { },
		options = $.extend({}, defaults, settings),
		ajaxTimeout;
	
	SELF.extend ([tbc.Tree, settings], {
		
		packageName : "tbc.tree.Online",
		
		/* 
		 * 更新部门的在线人数
		 * @param	: curr[number]; 第几批
		 * @length	: 部门总数
		 */
		renderOnlineNumber : function () {
			this.batch (
				this._cacheIndex, 1000, 0, 10,
				function (portion, completed) {
					var id;
					for (var i=0,len=portion.length; i<len; i++) {
						id = portion[i];
						this.render2Html(id, this.cache(id,"amount"));
					}
					portion = id = null;
					
					/* 如果是最后一个部门 */
					if (completed) {
						var _this = this;
						ajaxTimeout = setTimeout(function() {
							_this.request();
							_this = null;
						}, this.interval||(3*60*1000));
					}
				}
			);
		},
		
		/*
		 * 更新某一个部门的在线学员总数
		 * @param	: id[string]; 部门ID
		 */
		singleRender : function (id) {
		    
		    var i, len, _id;
		    
			id = $.isArray(id) ? id : [id];
			
			for (i=0, len=id.length; i<len; i++) { 
			    _id=id[i];
			    this.render2Html(_id, this.cache(_id, "amount")); 
			}
		},
		
		/*
		 * 在界面上显示部门的在线人数
		 * @param	: id[string]; 部门ID
		 * @param	: total[number]; 此部门在线学员的总数
		 */
		render2Html : function (id, total) {
			
			total = (!total||isNaN(total)?0:total);
			
			var itm = $(this.cache(id,"html")),
				num	= itm.find(".stree-count");
			if (itm.size()) {
				num.size()
				? num.html("&nbsp;["+ total +"]")
				: itm.append('<i class="stree-count">&nbsp;['+ total +']</i>');
			}
			
		},
		
		/* 
		 * 统计每个部门的在线学员总数(包括所有子部门的人数)
		 * 从服务器端返回的人数是不包括子部门人数的;
		 */
		countOnlineNumber : function (json, parents) {
			parents = parents||[];
			var id, n, c, js, len;
			for (var k=0,l=json.length; k<l; k++) {
				js	= json[k];
				id	= js.id;
				n	= js.n;
				c	= js.sn||js.c;
				
				this.cache(id, "amount", n);
				
				if (c&&c.length>0) {
					this.countOnlineNumber(c, parents.concat([id]));
				}
				
				this.updateParents (parents, n)
			}
			id = n = c = js = len = null;
		},
		
		/*
		 * 给所有上级部门增加人数
		 * @param	: parents[array]; 所有上级部门
		 * @param	: amount[number]; 需要增加的人数
		 */
		updateParents : function (parents, amount) {
			for (var i=0,l=parents.length; i<l; i++) {
				var _amount = this.cache(parents[i], "amount");
				this.cache(parents[i], "amount", amount+_amount);
			}
		},
		
					
		// 加载各部门在线人数总数
		request : function() {
			var self = SELF;
			$.ajax({
				url 	: options.onlineUrl,
				type	: "get",
				dataType: "json",
				success : function (json) {
					self.countOnlineNumber(json);
					self.renderOnlineNumber();
					self = null;
				}
			});
		},
		
		start : function() {
			this.request();
		},
		
		stop : function() {
			clearTimeout(ajaxTimeout);
		}
	});
	
	SELF.addEvent({
		"itemRender" : function(c) {
			try{
			for (var i=0,l=c.length,d=[]; i<l; i++) {
				d.push(c[i].id);
			}
			this.singleRender(d);
			}catch(e) {
				alert(e.line);
			}
		}
	});
}