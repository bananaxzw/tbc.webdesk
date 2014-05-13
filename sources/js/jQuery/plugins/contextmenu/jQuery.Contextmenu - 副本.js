// JavaScript Document
// JavaScript Document
(function($){
	
	
	$(document).ready(function(e) {
		
		// 添加CSS样式
        $("head").append('<style type="text/css" id="contextmenuStyle">\
			/* insert by jQuery.Contextmenu.js */\
			.ue-contextmenu{position:absolute; z-index:1000; left:100px; top:100px; font-size:12px;}\
			.ue-contextmenu *{-moz-transition:.3s;-webkit-transition:.3s;-o-transition:.3s;-ms-transition:.3s;transition:.3s;}\
			.ue-contextmenu ul{+width:180px; background-color:#fff; border-radius:4px; box-shadow:2px 2px 2px rgba(0,0,0,0.5); border:1px solid #aaa;}\
			.ue-contextmenu ul,.ue-contextmenu li{ list-style:none; margin:0; padding:0;}\
			.ue-contextmenu li{height:28px; line-height:28px; +width:100%; position:relative; +float:left;}\
			.ue-contextmenu a,.ue-contextmenu a:visited{display:block; width:100%; height:100%; white-space:nowrap; word-break:keep-all; text-decoration:none; color:#333;}\
			.ue-contextmenu a:hover{ color:#fff;}\
			.ue-contextmenu li.hover{ background-color:#219CCB;}\
			.ue-contextmenu li.hover a{color:#fff;}\
			.ue-contextmenu li.hover li a{color:#333;}\
			.ue-contextmenu a span{ display:block; height:100%; cursor:default;}\
			.ue-contextmenu a span.ue-icon{ width:28px; float:left; overflow:hidden;\
				background-color:#eee; background-color:rgba(27,138,228,0.15); background-position:50% 50%; background-repeat:no-repeat;\
				position:absolute; left:0; top:0;}\
			.ue-contextmenu a span.ue-icon span{ height:16px; margin:6px 0 0 6px;}\
			.ue-contextmenu li.hover span.ue-icon span{ -moz-transform:rotate(360deg); -webkit-transform:rotate(360deg); -o-transform:rotate(360deg); -ms-transform:rotate(360deg); transform:rotate(360deg);}\
			.ue-contextmenu li.disabled a span.ue-icon span{ -moz-transform:rotate(0deg); -webkit-transform:rotate(0deg); -o-transform:rotate(0deg); -ms-transform:rotate(0deg); transform:rotate(0deg);}\
			.ue-contextmenu a span.ue-text{ margin-left:29px; padding:0 40px 0 4px; _zoom:1;}\
			.ue-contextmenu li.disabled{background-color:#fff !important;}\
			.ue-contextmenu li.hover a span.ue-icon{filter:alpha(opacity=80);}\
			.ue-contextmenu li.disabled a span.ue-icon span{filter:alpha(opacity=30); opacity:0.3;}\
			.ue-contextmenu li.disabled a span.ue-text{color:#000; filter:alpha(opacity=30); opacity:0.3;}\
			.ue-contextmenu li.ue-line{height:0px; overflow:hidden; line-height:0px; +float:left;\
				border-top:1px solid #e0e0e0;}\
			.ue-contextmenu ul ul{ clear:both; position:absolute; left:100%; top:-1px; display:none;}\
			.ue-contextmenu ul ul.ue-submenu ul{ display:none;}\
			.ue-contextmenu li:hover>ul, .ue-contextmenu li.hover>ul{display:block !important;}\
			.ue-submenu-more{ position:absolute; right:1px; text-align:center; top:0; height:100%; width:10px;\
				font-size:20px; overflow:hidden; text-indent:-12px;}\
		</style>');
    });
	
	$.fn.contextmenu = function( settings ){
		
		return this.each(function(){
			var data = $(this).data("contextMenuItems") || [];
			if(settings.items.length>0){
				if(settings.before){
					data = settings.items.concat(data);
				}else{
					data = data.concat(settings.items);
				}
			}
			$(this).data("contextMenuItems", data);
			settings.items = data;
			
			$(this).unbind("contextmenu").bind("contextmenu", function( event, offset ){
				
				var opt = offset ? $.extend({}, settings, offset ) : settings;
				
				event.stopPropagation();
				var cm = new $.contextmenu(opt, this);
					cm.show(event);
				
				return event.ctrlKey ? true : false;
			});
		});
	}
	
	$.contextmenu = function( settings, srcElement ){
		
		$.contextmenu.id = $.contextmenu.id || 0;
		$.contextmenu.id++;
		
		var id = $.contextmenu.id;
		
		$.contextmenu.actions = $.contextmenu.actions || {};
		$.contextmenu.actions[id] = [];
		
		
		var defaults = {
			  items : {length:0}
			, left  : 0
			, top   : 0
			, event : {
				show:function(){},
				hide:function(){}
			}
		},
		options = $.extend({}, defaults, settings);
		
		
		$.contextmenu.style = {
			  animate                  : $.contextmenu.animate                  || true
			, shadow                   : $.contextmenu.shadow                   || true
			, textColor                : $.contextmenu.textColor                || "#666"
			, highlightTextColor       : $.contextmenu.highlightTextColor       || "#000"
			, backgroundColor          : $.contextmenu.backgroundColor          || "#fff"
			, highlightBackgroundColor : $.contextmenu.highlightBackgroundColor || "#ccf"
		}
		
		this.actions = function( index, htmlItem ){
			var f = $.contextmenu.actions[id][index];
			$.isFunction(f) && f.call(htmlItem);
		}
		
		this.items = options.items || [];
		
		this.addItem =
		this.append  =
		this.push    = function( objItem ){
			this.items[this.items.length] = objItem;
			//this.items.length += 1;
			
			return this;
		};
		
		this.removeItem = function( id ){
			delete this.items[id];
			return this;
		};
		
		this.disableItem = function( id ){
			this.items[id]["enabled"] = false;
			return this;
		};
		
		this.show = function( event ){
			
			// 事件: show
			if($.isFunction(options.event.show))options.event.show.call( $(srcElement) );
			
			$(document).trigger("mouseup.hideContextmenu");
			
			var x = options.left||event.pageX,
				y = options.top||event.pageY,
				cm = $('<div class="ue-contextmenu"></div>')
					.append(createHtml(this.inherit( event )))
					.css({left:x, top:y, zIndex:tbc?tbc.getMaxZIndex():"auto"})
					.appendTo("body"),
				
				bodyBottom 	= document.documentElement.scrollTop+document.body.offsetHeight,
				bodyRight	= document.documentElement.scrollLeft+document.body.offsetWidth,
				menuBottom	= y  + cm.height(),
				menuRight	= x + cm.width(),
				top			= bodyBottom<menuBottom ? bodyBottom-cm.height() : y,
				left		= bodyRight<menuRight ? bodyRight-cm.width() : x;
			
			cm.css({left:left, top:top});
			
			var hideCMENU = function(cm){
				
				setTimeout(function(){
					cm.remove();
					cm=null;
				}, 1);
				
				$(document).unbind("mouseup.hideContextmenu");
				
				// 事件: hide
				if($.isFunction(options.event.hide))options.event.hide.call($(srcElement));
			}
			
			$(document).bind("mouseup.hideContextmenu", function(){ hideCMENU(cm); });
			
			// 生成菜单结构
			function createHtml( items, cssClass ){
				
				var ul = $('<ul class="' + (cssClass?cssClass:'') + '"></ul>');
				
				items = $.isFunction(items) ? items() : items;
				
				$.each(items, function( i, o ){
					
					switch(o){
						case "line":
						case "-":
						case "--":
						case "---":
							var li = $('<li class="ue-line"></li>');
							li.appendTo(ul);
							break;
						default:
							var itm = $.isFunction(o) ? o() : o;
							var icon = $.isFunction(itm.icon) ? itm.icon() : itm.icon||"";
							var text = $.isFunction(itm.text) ? itm.text() : itm.text;
							var disabled = $.isFunction(itm.disabled) ? itm.disabled() : itm.disabled;
							var submenu	= $.isFunction(itm.submenu) ? itm.submenu() : itm.submenu;
							if(text===false){
								break;
							}
							
							var li = $('<li><a href="javascript:void(0);"></a></li>');
							
							disabled && li.addClass("disabled");
							
							var iconHtml = ( icon.match(/\.(jpg|jpeg|gif|png|img|ico|bmp)$/) || icon.indexOf("sf-server/file/getFile/")!=-1 )
								? '<span class="ue-icon"><span class="tbc-icon"><img src="'+ icon +'" style="border:0px; width:16px;" /></span></span>'
								: '<span class="ue-icon"><span class="tbc-icon '+ icon +'"></span></span>'
							
							$("a", li)
							.append(iconHtml)
							.append('<span class="ue-text">'+ text +'</span>')
							.click(function( event ){
								if(!disabled && !itm.submenu)
								{
									$.isFunction(itm.click) && itm.click.call(srcElement||event.srcElement, event);
								}else{
									event.stopPropagation();
								}
							});
							
							if(submenu){
								li.append('<span class="ue-submenu-more">&diams;</span>');
								li.append(createHtml(submenu, "ue-submenu"));
							}
							
							function submenuPosition( sm ){
								if(sm.size()==0)return;
								
								var offset = sm.offset(),
									ml = offset.left,
									mt = offset.top,
									mb = mt+sm.height(),
									mr = ml+sm.width();
								if(bodyBottom<mb){
									sm.css({ top:bodyBottom-mb });
								}
								
								if( bodyRight<mr ){
									sm.css({
										left:"auto", right:"100%"
									});
								}
								
							}
							
							li.hover(
								function(){ submenuPosition( $(this).addClass("hover").children("ul").show() ); },
								function(){ $(this).removeClass("hover").children("ul").hide(); }
							)
							
							li.appendTo(ul);
					}
				});
				
				
				return ul;
			}
			
			return this;
		};
		
		this.inherit = function( event ){
			
			var o = [];
			$.each(this.items,function(i,it){
				o.push(it);
			});
			
			var _inherit = [];
			
			function getDataByTag(i){
				var data = $(this).data("contextMenuItems");
				var _this =this;
				
				if(data && data.length>0 && srcElement!=_this){
					o.push("line");
				}
				
				data && $.each(data, function(i, oi){
					if(oi.inheritable===true && srcElement!=_this){
						o.push(oi);
					}
				});
			}
			
			$(event.target).parents().each(getDataByTag);
			
			try{
				var w = window;
				while(w){
					$(window.frameElement).parents().each(getDataByTag);
					if(w.parent==w){break;}
					w = w.parent;
				}
			}catch(e){}
			
			return o;
		}
		
	}
})(jQuery);