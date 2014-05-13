// JavaScript Document

(function($){
	
	$.fn.tabs= function( settings, returnTab ){
		
		$.fn.tabs.length = $.fn.tabs.length || 0;
		var tabviews  = {length: $.fn.tabs.length};
		
		this.each(function(tabviewIndex){
			settings.tabview = this;
			settings.id      = "tabview_" + tabviews.length;
			
			var tabset = $.tabs(settings);
			
			tabviews[tabviewIndex] = tabset;
			tabviews[settings.id]  = tabset;
			tabviews.length  += 1;
			$.fn.tabs.length += 1;
		});
		
		return returnTab ? tabviews : this;
	}
	
	$.tabs = function( settings ){
		var defaults = {
			  tabview   : ".ue-tabview"
			, header    : ".ue-tab-header"   //
			
			, title      : ".ue-tab-title"  // 
			, titleModel : '<li><a href="{url}">{title}</a></li>' // 
			, titleText  : ".icon-text"        // tab 标题放置文字的标签
			, titleIcon  : "img"               // tab 标题放置图标的img标签
			, closeHandle: ".icon-16-del"      // tab 标题放置图标的img标签
			, ridHeight  : null                // 用最外层的节点的高度减去这些节点的高度得到显示区域的高度
			, ridWidth   : null                // 用最外层的节点的宽度减去这些节点的宽度得到显示区域的宽度
			
			, container : ".ue-tab-container" // 设置tab内容视图的可显示区域的大小
			, tabset    : ".ue-tab-tabset"    // 通过设置该对象的宽、高、相对定位，可以实现tab页的布局，横排（用于slide-x效果）、竖排（用于slide-y效果）、或者层叠（用于fade效果）
			, tab 	    : ".ue-tab-item"      // 单个的tab页内容
			, tabModel  : '<div class="ue-tab-item"></div>'
			
			, prevHandle : ".ue-tab-prev"
			, nextHandle : ".ue-tab-next"
			, id         : "tabs"
			
			, current   : "current"      // 当前tab页头的样式
			, effects   : "slide-x"      // [fade, slide-x, slide-y]
			, easing    : "swing"            
			
			, loop      : true
			, auto      : true           // 自动切换
			, defaultTab : true
			, timeout   : 5000           // 自动切换的间隔时间（毫秒，1000ms==1s）
			, speed     : 800
			
			, onHeaderMouseOver : function(){}
			, onHeaderMouseOut  : function(){}
			, onShow : function(){}
			, onHide : function(){}
			, event : {
				
			}
		}
		
		var options    = $.extend({}, defaults, settings);
		
		var _this      = $(options.tabview),
			_header    = _this.find(options.header).filter(":first");
			_header    = _header.size() ? _header : $(options.header);
			
		var	_title     = _header.find(options.title),
			_container = _this.find(options.container),
			_tabset    = _this.find(options.tabset).filter(":first"),
			_tab       = _tabset.find(options.tab),
			_prevHandle= _this.find(options.prevHandle),
			_nextHandle= _this.find(options.nextHandle);
						
		var tabset = {length:0, animateProcess:null};
		
		
		_prevHandle.bind({"click":function(){ tabset.prev(); }});
		_nextHandle.bind({"click":function(){ tabset.next(); }});
		
		$.extend(tabset, {
			
			formatTitle : function(text, url, icon, id, closeable ){
				
				var t = typeof(text)=="object" 
				? text 
				: {title:text, url:url, icon:icon, id:id, closeable:closeable}
				
				var tmdl;
					tmdl = options.titleModel
					.split("{url}")  .join(t.url   || "javascript:void(0);")
					.split("{title}").join(t.title || "未命名标签")
					.split("{icon}") .join(t.icon  || "")
					.split("{id}")   .join(t.id    || "");
				return tmdl;
			},
			
			add  : function( tabSettings ){
				
				/*
				tabSettings.title
				tabSettings.id
				tabSettings.content
				tabSettings.current
				
				tabSettings.parent
				tabSettings.index
				*/
				
				if(tabset[tabSettings.id]){
					if(tabSettings.current){
						return tabset[tabSettings.id].show();
					}else{
						return tabset[tabSettings.id].flash();
					}
				};
				
				// 如果是HTML代码
				var title 
					= typeof tabSettings.title != "string" 
					? $(tabSettings.title)
					: $( this.formatTitle( tabSettings ) ); 
					
					title.appendTo( _header );
					
				// 指定标签页是否可以关闭
				var _closeable 
					=  tabSettings.closeable 
					|| title.hasClass("closeable") 
					|| (title.attr("_closeable")||"false").toLowerCase()!=="false"
					|| (title.attr("closeable")||"false").toLowerCase()!=="false";
				tabSettings.closeable = _closeable;
				
				title.attr("_closeable", _closeable?"true":"false").addClass(_closeable?"closeable":"");
				
				var content = $(tabSettings.content).css({display:tabSettings.current?"":"none"})
					.attr("_tab_of_"+options.id,"true")
					.appendTo(_tabset);
				
				// alert([$(tabSettings.content).size(),  _tabset.size()]);
				
				$.extend( tabSettings, {
					content : content,
					title   : title,
					parent  : tabset,
					index   : this.length
				});
				
				var tab = new $.tabpage( tabSettings, options );
				
				this.effects(this._effects);
				if(tabSettings.current) tab.show();
				
				tabset[tabset.length] = tab;
				if(tabSettings.id && tabSettings.id!=="")tabset[tabSettings.id] = tab;
				tabset.length += 1;
				
				
				return tab;
			},
			close  : function( id ){
				var _index = this[id]["_index"]
				delete this[_index];
				delete this[id];
			},
			
			lock : function(){
				var mask = $("<div />")
					.css({position:"absolute", zIndex:1, left:0, top:0, width:"100%", height:"100%", opacity:0.01, background:"#fff"})
					.attr("id", "locker_"+options.id)
					.appendTo(_tabset);
				return this;
			},
			
			unlock : function(){
				$("#locker_"+options.id).remove();
				return this;
			},
			
			remove  : function(){
				
				return this;
			},
						
			prev    : function(){ tabset.current().prev(); return this; },
			next    : function(){ tabset.current().next(); return this; },
			reorder : function(){
				
				var k = [];
				for(var i=0; i<this.length; i++){
					if(this[i]){
						k.push(this[i]);
						delete this[i];
					}
				}
				for(var i=0; i<k.length; i++){
					this[i]=k[i];
					this[i]["_index"]=i;
				}
				
				this.length = k.length;
				return this;
			},
			
			current : function( curr ){
				if(curr)
				{
					tabset._current = curr;
					return this;
				}else{
					return tabset._current;
				}
			},
			
			remove : function( items ){
				
			},
			
			/* 设置切换效果
			 * 参数：effect="fade","slide-x","slide-y","none"]
			 		straight: true // 立即切换
			 */
			effects : function ( effects, straight ){
				
				if(effects===undefined)return this._effects;
				clearTimeout(this.animateProcess);
				
				var _tab = _tabset.find(options.tab);
				
				this._effects = effects;
				
				switch(effects){
					case "fade"    :  this.effectForFade(); break;
					
					case "slide"   :
					case "slide-x" :  this.effectForSlideX();
					 break;
					
					case "slide-y" :  this.effectForSlideY(); break;
					
					case "none"    :
					default        : this.effectForNone(); break;
				}
				
				// 立即切换效果
				if(straight===true){
					var c = tabset.current();
						c && c.show( straight );
				}
				return this;
			},
			
			effectForSlideX : function(){
				
						var _wid = _this.width() - this.getRidWidth();
						var _hei = _this.height() - this.getRidHeight();
						
						var _tab = _tabset.find(options.tab);
						
						_container.css({ width: _wid, height:_hei });
						_tab.css({ width: _wid, height:_hei, float: "left", position:"relative", left:"auto", top:"auto", overflow:"auto", display:"block", opacity:1 });
						_tabset.css({ width: (_tab.size()+1) * _wid, height:_hei, position:"absolute", top:0 });
			},
			
			effectForSlideY : function(){
				
						var _wid = _this.width() - this.getRidWidth();
						var _hei = _this.height() - this.getRidHeight();
						var _tab = _tabset.find(options.tab);
						
						_container.css({ width: _wid, height:_hei });
						_tabset.css({ width: _wid, height: (_tab.size()+1)*_hei, position:"absolute", left:0 });
						_tab.css({ width: _wid, height:_hei, position:"relative", left:"auto", top:"auto", display:"block", opacity:1, overflow:"auto"  });
			},
			
			effectForFade : function(){
				
						var _wid = _this.width() - this.getRidWidth();
						var _hei = _this.height() - this.getRidHeight();
						var _tab = _tabset.find(options.tab);
						
						_container.css({ width: _wid, height:_hei });
						_tabset.css({ width: _wid, height: (_tab.size()+1)*_hei, position:"relative", top:"auto", left:"auto" });
						_tab.css({ width: _wid, height:_hei, position:"absolute", left:0, top:0, zIndex:0, display:"block", overflow:"auto"}).not(".current").hide();
			},
			
			effectForNone : function(){
						var _wid = _this.width() - this.getRidWidth();
						var _hei = _this.height() - this.getRidHeight();
						var _tab = _tabset.find(options.tab);
						
						_container.css({ width: _wid, height:_hei });
						_tabset.css({ width:_wid, height:_hei, position:"relative", left:0, top:0 });
						_tab.css({ width: _wid, height:_hei, position:"relative", left:"auto", top:"auto", overflow:"auto" });
			},
			
			getRidHeight : function(){
				var r = 0;
				$(options.ridHeight, _this).each(function(){
					r += this.offsetHeight;
				});
				return r;
			},
			
			getRidWidth  : function(){
				var w = 0;
				$(options.ridWidth, _this).each(function(){
					w += this.offsetWidth;
				});
				return w;
			}
		});
		
		$(window,document.body).bind("resize",function(){
			tabset.effects(options.effects, true);
		});
		
		if(options.defaultTab){
			_title.each(function( i ){
				tabset.add({title:this, content:_tab[i], id:"default_"+tabset.length, event:{show:options.event.onItemShow}});
			});
		}
		
		tabset.effects(options.effects);
		
		if(options.auto && tabset.length){
			tabset[0].show();
		}
		
		return tabset;
	}
	
	
	/*
	 * 类： tab页
	 */
	$.tabpage = function( sets, options ) {
		
		var def = {
			  title     : ""
			, id        : ""
			, icon      : ""
			, content   : ""
			, current   : true
			, closeable : true
			
			, event : {
				  close : function(){}
				, titleChange : function(){}
				
			}
		}
		
		$.extend(def, sets);
		
		this._title   = def.title   ? $(def.title)   : null		
		this._id      = def.id      ? def.id      : "tabview"
		this._icon    = def.icon    ? $(def.icon)    : ""
		this._content = def.content ? $(def.content) : null
		this._current = def.current!=undefined ? def.current : true
		this._closeable= def.closeable;
		this._parent  = def.parent;
		this._index   = def.index || ( def.parent ? def.parent.length : 0 );
		
		var iscurr = this._current;
		var tabset = this._parent;
		
		if(iscurr || tabset.length==0 || this._title.hasClass("current")) tabset.current(this);
		
		var _this = this;
		// 标签头的点击事件
		this._title.bind({
			"click.tab" : function(){
				_this.show();
			}
		})
		.find(options.closeHandle)
		.click(function(event){
			event.stopPropagation();
			_this.close();
		});
		
		this._content.bind({
			"mouseenter" : function(){}
		});
		
		this.triggerEvent = function( key ){
			if( $.isFunction(def.event[key]) ){
				return def.event[key].call( this );
			}
		}
		
		// 
		this.title = function( t ){
				if(t){
					this._titleText = t;
					$(options.titleText, this._title).text(t);
					return this;
				}
				return $(options.titleText, this._title).text();
			}
			
		// 
		this.icon = function( icon ){
				if(icon){
					this._icon = icon;
					$(options.titleIcon, this._title).attr("src", icon);
					return this;
				}
				return $(options.titleIcon, this._title).attr("src");
			},
			
		this.close = function( callback ){
			
			if(!def.closeable || this.triggerEvent("close")===false){ return false; }
			
			this._parent.close(this._id);
			
			this._title.animate({width:0, paddingLeft:0, paddingRight:0}, function(){$(this).remove()})
			
			try{
				var ifr = this._content.find("iframe")[0];
				var url = ifr.contentWindow.document.location.href;
				
				//ifr.contentWindow.document.location = url.indexOf("?") ? url+"&___="+colin.rand() : "?&___="+colin.rand();
			}catch(e){}
			
			this._content.animate({opacity:1}, 300, function(){
				$(this).remove();
				
				_this._parent.reorder();
				
				try{
					$.isFunction(callback) && callback.call(_this);
					_this.prev();
				}catch(e){
					try{
						_this.next();
					}catch(e){}
				}

			});
			
			
			return null;
		},
		
		// 闪动
		this.flash = function(){
			$(this._title)
			.fadeTo(120,0.1).fadeTo(100,1)
			.fadeTo(80,0.2).fadeTo(50,1)
			.fadeTo(80,0.01).fadeTo(100,1)
			.fadeTo(100,0.6).fadeTo(200,1)
			.besiege();
			
			return this;
		}
		
		// 显示
		this.show = function( straight ){
				clearTimeout(this._parent.animateProcess);
						
				this.impromptu(straight);
				
				this._title.addClass(options.current).siblings().removeClass(options.current);
				this._content.addClass("current").siblings().removeClass("current");
				tabset.current(this);
				
				this.triggerEvent("show");
				
				if(options.auto){
					var _this = this;
					this._parent.animateProcess = setTimeout(function(){_this.next();}, options.timeout);
				}
				
				return this;
			}
		
		// 临时显示	
		this.impromptu = function(straight){
			
				clearTimeout(this._parent.animateProcess);
			
				switch(this._parent._effects){
					
					case "fade":
						this.fadeIn();
					break;
					
					case "slide"  :
					case "slide-x":
					case "slide-y":
						// 滑动之前隐藏滚动条
						var tabp = this._content.add(this._content.siblings()).css({overflow:"hidden"});
						tabp.find("iframe").attr("scrolling","no");
						
						this.slideIn( function(){
							// 滑动之后显示滚动条
							var tabp = this._content.add(this._content.siblings()).css({overflow:"auto"});
							tabp.find("iframe").attr("scrolling","auto");
						}, straight);
					break;
					
					case "none":
					default :
						this.appear();
					break;
				}
				
				return this;
		}
		
		// 显示上一个Tab
		this.prev = function(){
			
				var pnum = this._index-1;
					pnum = (pnum<0 && options.loop) ? tabset.length-1 : pnum;
					
				tabset[pnum] && tabset[pnum].show();
				
				return tabset[pnum];
			}
			
		// 显示下一个Tab
		this.next = function(){
				
				var pnum = this._index+1;
					pnum = (pnum>=tabset.length && options.loop) ? 0 : pnum;
					
				tabset[pnum] && tabset[pnum].show();
				
				return tabset[pnum];
			}
			
		// 显示
		this.appear = function(){
				if( $.isFunction(options.event.beforeShow) )
				{
					options.event.beforeShow.call(this);
				}
				
				this._content.show().siblings("['_tab_of_"+options.id+"']:visible").hide();
				if( $.isFunction(options.onShow) )
				{
					options.onShow.call(this);
				}
				return this;
			}
									
		// 滚动到
		this.slideIn = function( callback, disableAnimate ){
			
				if( $.isFunction(options.event.beforeShow) )
				{
					options.event.beforeShow.call(this);
				}
				
				var left = this._content.size() ? this._content[0].offsetLeft : 0,
					top  = this._content.size() ? this._content[0].offsetTop  : 0;
				
				var _tab = this;
				
				if(!disableAnimate){
					this._content.parent().stop().animate(
						{left:0-left, top:0-top},
						options.speed,
						options.easing||"swing",
						function(){
							
							$.isFunction(callback) && callback.call(_tab);
							if( $.isFunction(options.onShow) )
							{
								options.onShow.call(_tab);
							}
						}
					);
				}else{
					this._content.parent().stop().css({left:0-left, top:0-top});
					
					$.isFunction(callback) && callback.call(_tab);
					if( $.isFunction(options.onShow) )
					{
						options.onShow.call(_tab);
					}
				}
				return this;
			}
			
			// 渐隐
		this.fadeIn = function(){
				
				if( $.isFunction(options.event.beforeShow) )
				{
					options.event.beforeShow.call(this);
				}
				
				var c = this._content;
				
				c.siblings("['_tab_of_"+options.id+"']:visible")
				.fadeOut(options.speed, "swing", function(){
					if( $.isFunction(options.onHide) )
					{
						options.onHide.call(this);
					}
					
					c.fadeIn(options.speed, options.easing||"swing", function(){
						if( $.isFunction(options.onShow) )
						{
							options.onShow.call(this);
						}
					})
				});
				return this;
			}
		
	}
	
})(jQuery);
/* 
*/


