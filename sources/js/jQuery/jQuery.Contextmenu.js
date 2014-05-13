// JavaScript Document
// JavaScript Document
;(function($){
    
    "use strict";
    
    $(document).ready(function(e) {
        
        // 添加CSS样式
        $("head").append('<style type="text/css" id="contextmenuStyle">' +
        '    /* insert by jQuery.Contextmenu.js */' +
        '    .ue-contextmenu{position:absolute; z-index:1000; left:100px; top:100px; font-size:12px;}' +
        '    .ue-contextmenu *{-moz-transition:.3s;-webkit-transition:.3s;-o-transition:.3s;-ms-transition:.3s;transition:.3s;}' +
        '    .ue-contextmenu ul{+width:180px; min-width:180px; background-color:#fff; box-shadow:3px 3px 4px rgba(0,0,0,0.8); border:1px solid #888;}' +
        '    .ue-contextmenu ul,.ue-contextmenu li{ list-style:none; margin:0; padding:0;}' +
        '    .ue-contextmenu li{height:28px; line-height:28px; +width:100%; position:relative; +float:left;}' +
        '    .ue-contextmenu .ue-item,.ue-contextmenu .ue-item:visited{display:block; width:100%; height:100%; white-space:nowrap; word-break:keep-all; text-decoration:none; color:#333;}' +
        '    .ue-contextmenu .ue-item:hover{ color:#fff;}' +
        '    .ue-contextmenu li.hover{ background-color:#219CCB;}' +
        '    .ue-contextmenu li.hover .ue-item{color:#fff;}' +
        '    .ue-contextmenu li.hover li .ue-item{color:#333;}' +
        '    .ue-contextmenu .ue-item span{ display:block; height:100%; cursor:default;}' +
        '    .ue-contextmenu .ue-item span.ue-icon{ width:28px; float:left; overflow:hidden;' +
        '        background-color:#eee; background-color:rgba(27,138,228,0.15); background-position:50% 50%; background-repeat:no-repeat;' +
        '        position:absolute; left:0; top:0;}' +
        '    .ue-contextmenu .ue-item span.ue-icon span{ height:16px; margin:6px 0 0 6px;}' +
        '    .ue-contextmenu li.hover span.ue-icon span{ -moz-transform:rotate(360deg); -webkit-transform:rotate(360deg); -o-transform:rotate(360deg); -ms-transform:rotate(360deg); transform:rotate(360deg);}' +
        '    .ue-contextmenu li.disabled .ue-item span.ue-icon span{ -moz-transform:rotate(0deg); -webkit-transform:rotate(0deg); -o-transform:rotate(0deg); -ms-transform:rotate(0deg); transform:rotate(0deg);}' +
        '    .ue-contextmenu .ue-item span.ue-text{ margin-left:29px; padding:0 40px 0 4px; _zoom:1;}' +
        '    .ue-contextmenu li.disabled{background-color:#fff !important;}' +
        '    .ue-contextmenu li.hover .ue-item span.ue-icon{filter:alpha(opacity=80);}' +
        '    .ue-contextmenu li.disabled .ue-item span.ue-icon span{filter:alpha(opacity=30); opacity:0.3;}' +
        '    .ue-contextmenu li.disabled .ue-item span.ue-text{color:#000; filter:alpha(opacity=30); opacity:0.3;}' +
        '    .ue-contextmenu li.ue-line{height:0px; overflow:hidden; line-height:0px; +float:left;' +
        '        border-top:1px solid #e0e0e0;}' +
        '    .ue-contextmenu ul ul{ clear:both; position:absolute; left:100%; top:-1px; display:none;}' +
        '    .ue-contextmenu ul ul.ue-submenu ul{ display:none;}' +
        '    .ue-contextmenu li:hover>ul, .ue-contextmenu li.hover>ul{display:block !important;}' +
        '    .ue-submenu-more{ position:absolute; right:1px; text-align:center; top:0; height:100%; width:10px;' +
        '        font-size:20px; overflow:hidden; text-indent:-12px;}' +
        '</style>');
    });
    
    $.fn.contextmenu = function( settings ){
        
        return this.each(function(){
            var data = $(this).data("contextMenuItems") || [],
                touchstartTimeout,
                touchstart, touchend
                ;
            
            data.inited = data.inited || true;
                
            if (settings.items.length>0) {
                if(settings.before){
                    data = settings.items.concat(data);
                }else{
                    data = data.concat(settings.items);
                }
            }
            $(this).data("contextMenuItems", data);
            settings.items = data;
            
            if ( !data.inited ){
                $(this).unbind("contextmenu").bind("contextmenu", function( event, offset ){
                    
                    var opt, cm;
                    
                    if( $(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size() ) {
                        event.stopPropagation(); return false;
                    }
                    
                    if (event.ctrlKey) {
                        return true;
                    }
                    
                    opt = offset ? $.extend({}, settings, offset ) : settings;
                    
                    event.stopPropagation();
                    
                    cm = new $.contextmenu(opt, this);
                    cm.show(event);
                    
                    return false;
                });
                
                if ( this.addEventListener ){
                    
                    touchstart = function( event ){
                        clearTimeout( touchstartTimeout );
                        document.body.style.webkitTouchCallout='none';
                        
                        if ( !event.stopContextmenu )
                        {
                            event.stopContextmenu = true; // 阻止上级节点触发右键菜单
                            touchstartTimeout = setTimeout( function(){
                                var touchX = event.targetTouches[0].pageX,
                                    touchY = event.targetTouches[0].pageY,
                                    opt = $.extend({}, settings, {left:touchX, top:touchY}),
                                    cm  = new $.contextmenu(opt, this);
                                    cm.show(event);
                            }, 800);
                        }
                    };
                    
                    touchend = function( event ){
                        clearTimeout( touchstartTimeout );
                    };
                    
                    this.removeEventListener("touchstart", touchstart);
                    this.addEventListener( "touchstart", touchstart);
                    
                    this.removeEventListener("touchend", touchend);
                    this.addEventListener( "touchend",  touchend);
                }
            }    
        });
    };
    
    $.contextmenu = function( settings, srcElement ){
        
        var id, defaults, options;
        
        $.contextmenu.id = $.contextmenu.id || 0;
        $.contextmenu.id+=1;
        
        id = $.contextmenu.id;
        
        $.contextmenu.actions = $.contextmenu.actions || {};
        $.contextmenu.actions[id] = {};
        
        defaults = {
                  items : {length:0}
                , left  : 0
                , top   : 0
                , event : {
                show:function(){},
                hide:function(){}
            }
        };
        options = $.extend({}, defaults, settings);
        
        $.contextmenu.style = {
              animate                  : $.contextmenu.animate                  || true
            , shadow                   : $.contextmenu.shadow                   || true
            , textColor                : $.contextmenu.textColor                || "#666"
            , highlightTextColor       : $.contextmenu.highlightTextColor       || "#000"
            , backgroundColor          : $.contextmenu.backgroundColor          || "#fff"
            , highlightBackgroundColor : $.contextmenu.highlightBackgroundColor || "#ccf"
        };
        
        $.contextmenu.action = function( index, htmlItem ){
            try {
                var f = $.contextmenu.actions[id][index];
                if ($.isFunction(f)) {
                    f.call(htmlItem);
                }
            } catch (e) {}
        };
        
        $.contextmenu.hoverIn = function( sm ){
            
            sm = $(sm).addClass("hover").children("ul").show();
            
            // 修正子菜单的位置, 保证右键菜单位于窗口边缘时,子菜单不会超出窗口的可视范围;
            
            if (sm.size()===0) {
                return;
            }
            
            var bodyBottom     = document.documentElement.scrollTop+document.body.offsetHeight,
                bodyRight    = document.documentElement.scrollLeft+document.body.offsetWidth,
                offset        = sm.offset(),
                ml = offset.left,
                mt = offset.top,
                mb = mt+sm.height(),
                mr = ml+sm.width();
                
            if (bodyBottom<mb) {
                sm.css({ top:bodyBottom-mb });
            }
            
            if (bodyRight<mr) {
                sm.css({
                    left:"auto", right:"100%"
                });
            }
        };
        
        $.contextmenu.hoverOut = function(li) {
            $(li).removeClass("hover").children("ul").hide();
        };
        
        this.items = options.items || [];
        
        this.addItem =
        this.append  =
        this.push    = function(objItem) {
            this.items[this.items.length] = objItem;
            //this.items.length += 1;
            
            return this;
        };
        
        this.removeItem = function(id) {
            delete this.items[id];
            return this;
        };
        
        this.disableItem = function(id) {
            this.items[id].enabled = false;
            return this;
        };
        
        this.show = function(event) {
            
            var actindex, x, y, cm,
                bodyBottom, bodyRight, menuBottom, menuRight, top, left,
                hideCMENU;
            
            hideCMENU = function(cm){
                
                setTimeout(function(){
                    var i;
                    cm.remove();
                    
                    for (i=0; i<id; i+=1) {
                        delete $.contextmenu.actions[i];
                    }
                    cm=null;
                }, 1);
                
                $(document).unbind("click.hideContextmenu blur.hideContextmenu");
                
                // 事件: hide
                if ($.isFunction(options.event.hide)) {
                    options.event.hide.call($(srcElement));
                }
            };
            
            // 生成菜单结构
            function createHtml( items, cssClass ){
                
                var ul = '<ul class="' + (cssClass || '') + '">';
                
                items = $.isFunction(items) ? items() : items;
                
                $.each(items, function( i, o ){
                    
                    var li = "",
                        itm, icon, text, disabled, visible, submenu, clc, hvr;
                    
                    actindex+=1;
                    switch(o){
                        case "line":
                        case "-":
                        case "--":
                        case "---":
                            li = '<li class="ue-line"></li>';
                            break;
                        default:
                            
                            itm     = $.isFunction(o) ? o() : o;
                            text    = $.isFunction(itm.text) ? itm.text() : itm.text;
                            
                            if (!text || text==="") {
                                break;
                            }
                            
                            icon    = $.isFunction(itm.icon) ? itm.icon() : itm.icon||"";
                            disabled= $.isFunction(itm.disabled) ? itm.disabled() : itm.disabled;
                            visible = $.isFunction(itm.visible) ? itm.visible() : itm.visible;
                            submenu = $.isFunction(itm.submenu) ? itm.submenu() : itm.submenu;
                            
                            clc = disabled ? "null" : "$.contextmenu.action("+ actindex +")";
                            hvr = disabled ? "" : 'onmouseover="$.contextmenu.hoverIn(this);" onmouseout="$.contextmenu.hoverOut(this);"';
                            
                            $.contextmenu.actions[id][actindex] = itm.click;
                            
                            li = visible!==true
                            ? '<li class="'+ (disabled?"disabled":"") +'" '+ hvr +'>'+
                                    '<span class="ue-item" href="javascript:void(null);" onclick="'+ clc +';">'+
                                        ( (icon.match(/\.(jpg|jpeg|gif|png|img|ico|bmp)$/) || icon.indexOf("sf-server/file/getFile/") !== -1)
                                        ? '<span class="ue-icon"><span class="tbc-icon"><img src="'+ icon +'" style="border:0px; width:16px;" /></span></span>'
                                        : '<span class="ue-icon"><span class="tbc-icon '+ icon +'"></span></span>') +
                                        '<span class="ue-text">'+ text +'</span>' +
                                    '</span>'+
                                    (submenu?'<span class="ue-submenu-more">&diams;</span>'+createHtml(submenu, "ue-submenu"):"") + 
                                '</li>'
                            : "";
                            
                            break;
                    }
                    ul+=li;
                });
                ul+="</ul>";
                
                return ul;
            }
            
            if ($(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size()) {
                event.stopPropagation();
                return false;
            }
            
            // 事件: show
            if ($.isFunction(options.event.show)) {
                options.event.show.call( $(srcElement) );
            }
            
            $(document).trigger("click.hideContextmenu");
            
            actindex = 0;
            x  = options.left||event.pageX||event.targetTouches[0];
            y  = options.top||event.pageY||event.targetTouches[0];
            cm = $('<div class="ue-contextmenu"></div>')
                    .append(createHtml(this.inherit( event )))
                    .css({left:x, top:y, zIndex:window.tbc?window.tbc.getMaxZIndex():"auto"})
                    .appendTo("body");
                
            bodyBottom = document.documentElement.scrollTop+document.body.offsetHeight;
            bodyRight  = document.documentElement.scrollLeft+document.body.offsetWidth;
            menuBottom = y  + cm.height();
            menuRight  = x + cm.width();
            top  = bodyBottom<menuBottom ? bodyBottom-cm.height() : y;
            left = bodyRight<menuRight ? bodyRight-cm.width() : x;
                
            if (bodyBottom<menuBottom) {
                cm.css({ top:"auto", bottom:"0px" });
            }
            
            if( bodyRight<menuRight ){
                cm.css({
                    left:"auto", right:"0px"
                });
            }
            
            
            $(document).bind("click.hideContextmenu blur.hideContextmenu", function(){
                
                if (!$(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size() === 0) {
                    hideCMENU(cm);
                }else{
                    event.stopPropagation();
                    return false;
                }
            });
            
            return this;
        };
        
        this.inherit = function( event ){
            
            var o = [],
                w;
                
            $.each(this.items,function(i,it){
                o.push(it);
            });
            
            function GetDataByTag(i){
                var data = $(this).data("contextMenuItems"),
                    self = this;
                
                if (data && data.length>0 && srcElement !== self) {
                    o.push("line");
                }
                
                if (data) {
                    $.each(data, function(i, oi){
                        if (oi.inheritable===true && srcElement !== self) {
                            o.push(oi);
                        }
                    });    
                }
            }
            
            $(event.target).parents().each(GetDataByTag);
            
            try{
                w = window;
                while(w){
                    $(window.frameElement).parents().each(GetDataByTag);
                    if (w.parent === w) {
                        break;
                    }
                    w = w.parent;
                }
            }catch(e){}
            
            return o;
        };
    };
}(jQuery));