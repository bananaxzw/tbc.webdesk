;tbc.namespace("tbc.historyStore");

/* 历史记录管理器 *******************************************************
 
 * METHOD - 方法 --------------------------------------------------------
 * @Method: get(id[string]);    // 根据ID返回其历史记录对象,如果不存在则会自动创建;
 * @Method: remove(id[string]); // 根据ID移除历史记录;
 */
tbc.extend(tbc.historyStore, {
    cache  : {},
    
    get    : function(id) {
        return this.cache[ id ];
    },
    
    set    : function(id, redirector) {
        this.cache[id] = new tbc.history(redirector);
        return his;
    },
    
    add    : function(id, history) {
        this.cache[ id ] = this.cache[id] || history;
        return this.cache[ id ];
    },
    
    remove : function(id) {
        delete this.cache[id];
    }
});



/*
 * 历史记录类 ***********************************************************
 
 * PARAMETER - 参数 -----------------------------------------------------
 * @para: func_redirect; 必须,用于执行历史记录跳转的函数。
 
 * METHOD - 方法 --------------------------------------------------------
 * @Method: [object]  go(indexOfHistory); return this;
 * @Method: [object]  forward(FunctionForRedirect); return this;
 * @Method: [object]  back(FunctionForRedirect); return this;
 * @Method: [boolean] isFirst();
 * @Method: [boolean] isLast();
 
 * INHERITED - 继承的方法 -----------------------------------------------
 * @Method: addEvent(eventType, Function); 继承自tbc.event;
 * @Method: removeEvent(eventType, Function); 继承自tbc.event;
 * @Method: triggerEvent(eventType, Parameter[Array]); 继承自tbc.event;
 
 * EVENT - 事件 ---------------------------------------------------------
 * @Event:  go;         // on execute method go();
 * @Event:  back;       // on execute method back();
 * @Event:  forward;       // on execute method forward();
 * @Event:  redirect;   // on execute method redirect();
 */
tbc.History = function(redirector) {
    
    // 初始化
    (function init(self, _arguments) {
            
        var SELF = tbc.self(self, _arguments);
        
            SELF.packageName = "tbc.History";
            SELF.cache = [];
            SELF.currentIndex = 0;  
            
        try { return SELF; } finally { SELF=null; }
        
    })(this, arguments)
    
    .extend ({
        
        current : function() {
            return this.cache[this.currentIndex];
        },
        
        add : function (url, method, data) {

            var record, last;

            if (this.prohibited === true) {
                return this;
            } else {
                delete this.prohibited;
                
                last = this.cache[this.currentIndex];
                record = typeof(url) === "string" ? {url:url, method:method, data:data} : url;
                
                if (last) {
                    console.log(last.url);
                    console.log(record.url);
                    console.log(last.url !== record.url);
                }

                if (!last || last.url !== record.url) { 
                    this.clear();
                    this.cache.push(record);
                    this.currentIndex = this.cache.length-1;
                    this.triggerEvent("add");
                }
                return this;
            }
        },
        
        // 转向对应的历史记录
        redirect : function(record, subRedirector, noNewHistory) {
            var func = subRedirector || redirector;
            
            if (typeof func === "function") {
                this.triggerEvent("beforeRedirect");
                try{
                    //this.prohibited = true;
                    if (!subRedirector || ($.isFunction(subRedirector) && subRedirector(record, noNewHistory) !== false)) {
                        redirector(record, noNewHistory);
                    }
                }catch(e) {}
                this.triggerEvent("afterRedirect"); 
            }
            return this;
        },
        
        // 清除当前页面所处位置的时间轴近端的历史记录
        clear : function() {
            this.cache = this.cache.slice(0, this.currentIndex+1);
            return this;
        },
        
        /*
         * 跳转到某一页,_index要跳转的索引;
         * 当_index值为负数时,将基于当前页后退相应的页数
         */
        go : function(_index, redirect) {
            var index   = _index>=0 ? _index : this.currentIndex + _index;
                index   = this.limitIndex(index);
            var record  = this.cache[index];
            
            this.currentIndex = index;
            
            if (record) {
                this.redirect(record, redirect, true);
                this.triggerEvent("go");
            }
            return this;
        },
        
        // 向前一页
        forward : function(redirect) {
            if (!this.isLast()) {
                var index   = this.currentIndex+1,
                    record  = this.cache[index];
                
                this.currentIndex = index;
                
                this.redirect(record, redirect, true);
                this.triggerEvent("forward");
            }
            return this;
        },
        
        // 后退一页
        back : function(redirect) {
            if (!this.isFirst()) {
                var index = this.currentIndex-1,
                    record   = this.cache[index];
                
                this.currentIndex = index;
                
                this.redirect(record, redirect, true);
                this.triggerEvent("back");
            }
            return this;
        },
        
        // 后退一页
        reload : function() {
            if (!this.isFirst()) {
                var record   = this.current();
                this.redirect(record, null, true);
                this.triggerEvent("reload");
            }
            return this;
        },
        
        // 保持索引值在缓存路径数量的范围之类
        limitIndex : function(index) {
            index = Math.max(index, 0);
            return Math.min(index, this.cache.length-1);
        },
        
        // 是否可以向前跳转
        isLast : function() {
            return (this.currentIndex === this.cache.length-1) || this.cache.length === 0;
        },
        
        // 是否可以后退
        isFirst : function() {
            return this.currentIndex===0;
        }
    });
}
