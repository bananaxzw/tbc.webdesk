/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */(function($){
	
	$.extend( $.fn, {
		
		/*
		 * 相对于substance居中对齐 
		 * @para: substance; 要居中对齐的参照节点，默认为body
		 */
		"center" : function( substance ){
			
			/* 计算窗口要显示的坐标位置：left、top、width、height */
			var _wid  = this.width(),
				_hei  = this.height(),
				_left = options.left,
				_top  = options.top,
				
				scrollLeft, scrollTop, width, height;
				
			if(substance){
				scrollLeft	= this[0].scrollLeft;
				scrollTop	= this[0].scrollTop;
				width		= this[0].offsetWidth;
				height		= this[0].offsetHeight;
			}else{
				scrollLeft	= Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
				scrollTop	= Math.max(document.documentElement.scrollTop, document.body.scrollTop)
				width		= Math.max(document.documentElement.clientWidth, document.documentElement.offsetWidth, document.documentElement.scrollWidth);
				height		= Math.max(document.documentElement.clientHeight, document.documentElement.offsetHeight, document.documentElement.scrollHeight);
			}
				
			/** 水平居中 /**/
			_left = (width < _wid) ? scrollLeft : (width/2) + scrollLeft - (_wid/2);
		
			/** 垂直居中/**/
			_top =  (height < _hei) ? scrollTop : (height/2) + scrollTop - (_hei/2);
			
			return this.css({ top: _top, left: _left});
		},
		
		// 临时禁止选中文字;
		disableSelect : function () {
			$ (this)
			.css({"-moz-user-select":"none", "-webkit-user-select":"none", "-o-user-select":"none", "-ms-user-select":"none", userSelect:"none"})
			.bind("selectstart", function(){return false;});
		},
		
		// 取消禁止选中文字;
		enableSelect : function ( elem ) {
			// 临时禁止选中文字;
			$ (this)
			.css({"-moz-user-select":"", "-webkit-user-select":"", "-o-user-select":"", "-ms-user-select":"", userSelect:""})
			.unbind("selectstart");
		},
		
		// 闪
		flash : function(){
			_this.animate( {opacity:0.5}, 40 )
			.animate( {opacity:1}, 40 )
			.animate( {opacity:0.5}, 40 )
			.animate( {opacity:1}, 40 )
			.animate( {opacity:0.5}, 40 )
			.animate( {opacity:1}, 40, function(){});
		},
		
		// 左右摇动
		shake : function( callback ){
			return this.each(function(){
				var _this = $(this),
					ml = _this.css("marginLeft");
				if(ml=="auto"){
					_this.css("marginLeft", _this.parent().width()/2 - _this.width()/2);
				}
				
				_this.animate( {marginLeft:"-=5px"}, 40 )
					.animate( {marginLeft:"+=10px"}, 40 )
					.animate( {marginLeft:"-=5px"}, 40 )
					.animate( {marginLeft:"+=4px"}, 40 )
					.animate( {marginLeft:"-=4px"}, 40 )
					.animate( {marginLeft:"+=2px"}, 40 )
					.animate( {marginLeft:"-=2px"}, 40, function(){
						$.isFunction(callback)&&callback.call(_this);
						if(ml=="auto")$(_this).css({marginLeft:"auto"});
					});
			});
		},
		
		scaleTo : function( offset, callback ){
			return this.each(function(){
				var _this = $(this);
				var wid = _this.width(),
					hei = _this.height(),
					lft = _this.css("left"),
					top = _this.css("top");
				
				var _offset = !$.isPlainObject(offset)
					? $.extend({}, $(offset).offset(), {width:$(offset).width(), height:$(offset).height(), opacity:0})
					: offset;
				
				panel.animate(_offset, 1200,"easeOutBounce", function(){
					_this.css({display:"none",width:wid, height:hei,left:lft, top:top, opacity:1});
					$.isFunction(callback) && callback.call(_this);
				});
			});
		},
		
		// 反转
		evert : function(){
			return this.css({
				"-moz-transform"    : "translateZ(-300px) rotateY(90deg) rotateX(0deg)",
				"-webkit-transform" : "translateZ(-800px) rotateY(90deg) rotateX(0deg)",
				"-o-transform"      : "translateZ(-300px) rotateY(90deg) rotateX(0deg)",
				"-ms-transform"     : "translateZ(-300px) rotateY(90deg) rotateX(0deg)",
				"transform"         : "translateZ(-300px) rotateY(90deg) rotateX(0deg)"
			});
		},
		
		// 正面
		facade : function(){
			return this.css({
				"-moz-transform"    : "translateZ(0px) rotateY(0deg) rotateX(0deg)",
				"-webkit-transform" : "translateZ(0px) rotateY(0deg) rotateX(0deg)",
				"-o-transform"      : "translateZ(0px) rotateY(0deg) rotateX(0deg) ",
				"-ms-transform"     : "translateZ(0px) rotateY(0deg) rotateX(0deg)",
				"transform"         : "translateZ(0px) rotateY(0deg) rotateX(0deg)"
			});
		},
		
		// 启用3D透视效果
		enable3D : function(){
			this.parent().css({
				"-moz-transform-style"    : "preserve-3d",
				"-webkit-transform-style" : "preserve-3d",
				"-ms-transform-style"     : "preserve-3d",
				"-o-transform-style"      : "preserve-3d",
				"transform-style"         : "preserve-3d",
				"-webkit-transform-style" : "perspective"
			});
			return this;
		},
		
		// 禁用3D透视效果
		disable3D : function(){
			this.parent().css({
				"-moz-transform-style"    : "",
				"-webkit-transform-style" : "",
				"-ms-transform-style"     : "",
				"-o-transform-style"      : "",
				"transform-style"         : ""
			});
			return this;
		},
		
		// 启用动态变幻效果
		enableAnimate : function( duration, delay, easing ){
			var v1 = duration || ".4s",
				v2 = easing || "ease",
				v3 = delay || "0s",
				v  = [v1,v2,v3].join(" ");
			this.css({
				"-moz-transition"    : "-moz-transform "+v,
				"-webkit-transition" : "-web-transform "+v,
				"-o-transition"      : "-o-transform "+v,
				"-ms-transition"     : "-ms-transform "+v,
				"transition"         : "transform "+v
			});
			return this;
		},
		
		// 禁用动态变幻效果
		disableAnimate : function(){
			return this.css({
				"-moz-transition"    : "",
				"-webkit-transition" : "",
				"-o-transition"      : "",
				"-ms-transition"     : "",
				"transition"         : ""
			});
		}
		
	});
	
})(jQuery)/* 
 * @CLASS: 拖动组件
 * @Copyright: 时代光华
 * @Author: 罗志华
 * @mail: mail@luozhihua.com
 */
 
;(function($){
	$.fn.drag = function(settings){
		
		// 实例统计
		$.fn.drag.count = $.fn.drag.count ? $.fn.drag.count++ : 1;
		var _count = $.fn.drag.count;
		
		var defaults = {
			  window      : window   // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
			, document    : document // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
			, handle      : null     // 拖动手柄,类型:jQuery Selector
			, timeout     : 0        // 鼠标按下后延迟一定时间再触发拖放动作 
			, area        : null     // 拖动的限制区域,  类型:jQuery Object or Selector, 默认不限制, 设为true时为body。
			, areaMargin  : 0		 // 被拖动对象离限制区域边缘的距离
			, targetChild : null     // 要拖动到的目标节点的下的同级节点
			, focus       : false    // 拖动后是否获得焦点
			, animate     : false    // 动态效果
			, cursor      : "move"   // 鼠标样式
			, target      : null     // 目标节点集, 类型:jQuery Object or Selector, 默认:null
			, staff       : "x"      // 判断被拖动元素在同级节点中的排列是上下排列还是左右排列
			, disableInsert  : null  // 目标节点集, 类型:jQuery Object or Selector, 默认:null
			, insertToTarget : true  // 拖动完毕后是否把拖动对象插入到目标节点,类型:boolean,默认:true
			, onDragStart    : function(event){}         // 拖动前的事件,类型:function
			, onDrag         : function(event, offset){} // 拖动时的事件,类型:function
			, onDragEnd      : function(event){}         // 拖动完毕的事件,类型:function
			, onItemMouseover: function(event){} // 
			, onItemMouseout : function(event){} // 
			, ghostClass     : null // 拖动位置指示的class
			, enabled        : function(){ return true; }
			
			, event : {
				  dargStart       : function(){}
				, drag            : function(){}
				, drop            : function(){}
				, dragEnd         : function(){}
				, itemMouseover   : function(){}
				, itemMouseout    : function(){}
				, targetMouseover : function(){}
				, targetMouseout  : function(){}
			}
		}
		
		var options = $.extend( {}, defaults, settings);
			options.document    = options.document || document;
			options.targetChild = $( options.targetChild || this.selector || this );
		// options.area = options.area || options.document.body;
		
		var _area;  // 限制拖动区域
		var _updateArea = function()
		{
			var a = options.area,
				m = options.areaMargin,
				c = tbc.percentToInt;
			if(a===true)
			{
				a = options.area = options.document.body;
				_area = tbc.getCoordinate( $(a)[0] );
				_area.bottom = Math.max(options.document.body.offsetHeight,
										options.document.body.scrollHeight,
										options.document.body.clientHeight,
										options.document.documentElement.clientHeight,
										options.document.documentElement.offsetHeight,
										options.document.documentElement.scrollHeight);
				_area.right  = Math.max(options.document.body.offsetWidth,
										options.document.body.scrollWidth,
										options.document.body.clientWidth,
										options.document.documentElement.clientWidth,
										options.document.documentElement.offsetWidth,
										options.document.documentElement.scrollWidth);
				
				_area.height = _area.bottom-_area.top;
				_area.width  = _area.right-_area.left;
				
			}else if( !$.isPlainObject(a) ){
			
				_area = tbc.getCoordinate( $(a)[0] );
				
				$(a).each(function( i, o ) {
					var _a = tbc.getCoordinate( o);
					_area.left   = Math.min(_area.left, _a.left);
					_area.right  = Math.max(_area.right, _a.right);
					_area.top    = Math.min(_area.top, _a.top);
					_area.bottom = Math.max(_area.bottom, _a.bottom);
				});
				
			}else{
				var h = $this.offsetParent().height(),
					w = $this.offsetParent().width();
				_area = { left: c(a.left, w), top:c(a.top, h), right:c(a.right,w), bottom:c(a.bottom, h) };
			}
			
			if(m && m.left && m.top){
				_area.left   += c( m.left, $this.width() );
				_area.right  += c( m.right, $this.width() );
				_area.top    += c( m.top, $this.height() );
				_area.bottom += c( m.bottom, $this.height() );
			}
			a = m = c = null;
		}
		
		// 给被禁止插入的区域添加标记,用于在拖动时判断是否能够移动到该区域
		if(options.disableInsert){
			var dsb = $(options.disableInsert).data("onDragDisableInsert");
				dsb = dsb || [];
				if(tbc.array.indexOf(dsb,_count)==-1) dsb.push(_count);
			$(options.disableInsert).data("onDragDisableInsert", dsb);
		}
		
		var $this   = this;
		
		return this.each ( function ( index, _this ) {
			_this = $(_this);
			
			var moving = false;
			
			// 鼠标按下后延迟一定时间再触发拖放动作
			var timeout 
			
				// 记住原位置,当拖动结束而没有找到目标时,则让被拖动对象归位
				, org_position = {
					parent : _this.parent(),
					prev : _this.prev()
				}
				
				, handle = $(options.handle, _this)
				, _wrap
				, _ghost
			
				// 记录鼠标点击位置 到 对象上边、左边的距离
			 	, mouseStartPos
				, mouseToTargetTop
				, mouseToTargetLeft
				, _scrTop  = options.document.documentElement.scrollTop ||options.document.body.scrollTop
				, _scrLeft = options.document.documentElement.scrollLeft||options.document.body.scrollLeft;
				
			handle = handle.size() ? handle : _this;
			
			// 绑定事件
			handle.bind({
				
				// 针对触摸屏的触控拖动
				"touchstart" : function( event ){
					event = event.originalEvent;
					event.stopContextmenu = true;
					
					var _touchstartOffset = {
						x : event.changedTouches[0].pageX - parseInt(_this.css("left")),
						y : event.changedTouches[0].pageY - parseInt(_this.css("top"))
					};
					
					mouseToTargetTop = _touchstartOffset.y;
					mouseToTargetLeft = _touchstartOffset.x;
						
					$(this).bind({
						"touchmove.touchDrag": function(event){
							event = event.originalEvent;
							var offset = getDragingOffset(event),
								x = offset.left,
								y = offset.top;
								
							_this.css({left: x, top:y});
							return false;
						},
						"touchend.touchDrag" : function(event){
							$(this).unbind(".touchDrag");
						}
					})
					
				},
				"mouseleave" : function(){ clearTimeout(timeout); },
				"mouseup"    : function(){ moving = false; clearTimeout(timeout); },
				"mousedown"  : function(event){
					
					//event.stopPropagation();
					event.disableSelectArea = true;
					
					if ( !options.enabled() || (tbc.msie&&tbc.browserVersion<9 && event.button!=1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button!=0) ){
						return;
					}
					
					if(options.timeout)
					{
						timeout = setTimeout(_start, options.timeout);
					}else{
						_start();
					}
					
					var timer;
					
					function _start() {
						
						$(options.document)
						.unbind(".drag")
						.bind({
							"mousemove.drag"   : mousemove_drag,
							"mouseup.drag"     : mouseup_drag,
							"contextmenu.drag" : function(){ return false;}
						});
					}
					
					function mousemove_drag(event){
						
						if ( moving===false ) {
							startDrag(event);
							moving = true;
						}
						
						clearTimeout(timer);
						/**
						event.clientX = event.clientX || event.changedTouches[0].clientX;
						event.clientY = event.clientY || event.changedTouches[0].clientY;
						event.pageX   = event.pageX   || event.changedTouches[0].pageX;
						event.pageY   = event.pageY   || event.changedTouches[0].pageY;
						/**/
						
						var offset = getDragingOffset(event);
						
						if(options.target){
							_wrap.css({position: "absolute", top:offset.top, left:offset.left, width:offset.width});
						}else{
							_this.css({top:offset.top, left:offset.left});
						}
						
						$.extend( offset, {mouseX : event.clientX + _scrLeft, mouseY : event.clientY + _scrTop} );
						
						timer = setTimeout(function(){
							draging(event, offset);
						},30);
					}
					
					function mouseup_drag(event){
						
						var eTarget
							, xy
							, cb
							, insertable
							, dropon = _ghost ? _ghost[0] : null;
							
						event.dropon = dropon;
						
						insertable = $.isFunction(options.event.drop) 
						? (options.event.drop.call(_this[0], event)!==false)
						: true;
						
						$(options.document).unbind(".drag");
						
						$("body").css({"-moz-user-select":"normal", "webkitUserSelect":"normal", "oUserSelect":"normal", "userSelect":"normal"})
						.unbind( "selectstart");
							
						if( options.target )
						{
							eTarget = _ghost.parent();
							
							$.extend(event, {target:eTarget});
							
							xy = tbc.getCoordinate( _ghost[0] );
							
							cb = function() 
							{								
								// 执行自定义结束事件
								try{
									if( insertable ){
										_this.removeClass("dragging").insertAfter( _ghost );
									};
									
									hideWrap();
									hideGhost(); // 隐藏虚线框
									$.isFunction(options.event.dragEnd) && options.event.dragEnd.call(_this[0], event)
								}catch(e){}
								
								// 如果设置为:拖动后不获得焦点,
								// 则改回拖动之前的z-index值;
								if(options.focus)
								{
									_this.css("zIndex", _this.data("_zIndex")).data("_zIndex", null);
								}
							}
							
							if( options.animate )
							{
								_wrap.animate({ width:xy.width, height:xy.height, left:xy.left, top:xy.top }, 400, cb);
							}else{
								_wrap.css({left:xy.left, top:xy.top }); cb();
							}
							
						}else{
							
							// 如果设置为:拖动后不获得焦点,
							// 则改回拖动之前的z-index值;
							if(options.focus)
							{
								_this.css("zIndex", _this.data("_zIndex")).data("_zIndex", null);
							}
							// 执行自定义结束事件
							try{
								$.isFunction(options.event.dragEnd) && options.event.dragEnd.call(_this[0], event);
							}catch(e){
								
							}
							
							hideWrap();
							
						}
						
						eTarget = xy = cb = insertable = dropon = null;
					}
				}
			})
			
			
			// 用于临时放置被拖动对象的克隆对象的盒子
			function wrap(w, h){
				var wrap = $("#drag_wrap");
				return wrap.size() ? wrap : $('<div id="drag_wrap"></div>').css({width:w, height:h});
			}
			
			function hideWrap(){
				$("#drag_wrap").remove();
				_wrap = null;
			}
			
			// 创建拖动时的目标占位模块
			function ghost(w, h){
				
				var drag_ghost_tag = ($this[0].tagName||$this[0].nodeName).toLowerCase();
				var g = $("#drag_ghost");
					g = g.size() 
						? g.show()
						: $('<'+drag_ghost_tag+' id="drag_ghost"></'+drag_ghost_tag+'>').insertAfter(_this);
				
				options.ghostClass 
				? g.addClass(options.ghostClass)
				: g.css({border:"#000 1px dotted", width: w, height: h})
				
				return g;
			}
			
			// 隐藏拖动时的目标占位模块
			var hideGhost = function(){
				$("#drag_ghost").remove();
				_ghost = null;
			}
			
			// Start Drag
			function startDrag(event, data) {
				
				$.isFunction(options.onDragStart) && options.onDragStart.call(_this[0], event );
				$.isFunction(options.event.dragStart) && options.event.dragStart.call(_this[0], event );
				
				getScrollTop();
									
				// 记录鼠标点击位置 到 对象上边、左边的距离
				mouseStartPos     = tbc.getCoordinate(_this[0]);
				
				// 鼠标指针到被拖动对象的上边距离
				mouseToTargetTop  = event.clientY - mouseStartPos.top  + (options.document.documentElement.scrollLeft||options.document.body.scrollTop);
				
				// 鼠标指针到被拖动对象的左边距离
				mouseToTargetLeft = event.clientX - mouseStartPos.left + (options.document.documentElement.scrollLeft||options.document.body.scrollLeft);
				
				$("body")
				.css({"-moz-user-select":"none", "webkitUserSelect":"none", "oUserSelect":"none", "userSelect":"none"})
				.bind( "selectstart", function(){return false;} );
				
				var _width  = _this.width(),
					_height = _this.height();
				
				_wrap  = wrap()
				.css({position:"absolute", visible:"visible", display:"none", width:_this.outerWidth(), height:_this.outerHeight(), zIndex:tbc.getMaxZIndex()})
				.appendTo("body").show();
								
				// 生成虚线框
				if(options.target){
					_ghost = ghost().show();
					_ghost.css({width:_width, height:_height}).insertAfter(_this);
					var __ = _this.clone().remove().removeClass("ue-app").addClass("ue-app-clone") ;//$("<div></div>").append( );
								
					_wrap.append(__);
				}
				
				var offset = getDragingOffset(event);
				_wrap.css({position: "absolute", top:offset.top, left:offset.left, width:offset.width});
			}
			
			function getScrollTop(){
				_scrTop  = options.document.documentElement.scrollTop ||options.document.body.scrollTop;
				_scrLeft = options.document.documentElement.scrollLeft||options.document.body.scrollLeft;
				
				return {top: _scrTop, left:_scrLeft};
			}
			
			// 
			function getDragingOffset(event)
			{
				getScrollTop();
				_updateArea();
				var _scrTop_parent  = 0,
					_scrLeft_parent = 0;
				
				var offset = _wrap ? tbc.getCoordinate(_wrap[0].offsetParent) : {left:0,top:0};
				var parentOff = _wrap ? tbc.getCoordinate(_wrap[0].offsetParent) : {left:0,top:0} ;
				var iframeTop=0,iframeLeft=0;
				if ( options.window.frameElement!==null ){
					var iframeOffset = $(options.window.frameElement).offset();
					if ( iframeOffset ) {
						iframeTop = iframeOffset.top;
						iframeLeft = iframeOffset.left;
					}
				};
				
				// 计算将要拖动到的新坐标位置
				var _top    = event.pageY 
							- offset.top 
							- _this[0].offsetParent.offsetTop  
							- mouseToTargetTop
							+ _scrTop
							+ iframeTop,
					_left   = event.pageX 
							- offset.left 
							- _this[0].offsetParent.offsetLeft  
							- mouseToTargetLeft
							+ _scrLeft
							+ iframeLeft,
					_width  = _this.width(),
					_height = _this.height(),
					_bottom = _top  + _height,
					_right  = _left + _width;
					
				var o = {top:_top, left:_left, right:_right, bottom:_bottom, width:_width, height:_height};
				
				// 根据设定的限制区域重新计算拖动对象的新坐标位置
				if(options.area)
				{
					o.top  = o.bottom >= _area.bottom ? (_area.bottom - o.height) : Math.max(_area.top, o.top);
					o.left = o.right >= _area.right ? (_area.right - o.width) : Math.max(_area.left, o.left);
				}
				
				return o;
			}
			
			function draging(event, data){
				
				if( options.area && (data.mouseX < _area.left || data.mouseX > _area.right || data.mouseY<_area.top || data.mouseY >_area.bottom))
				return;
				
				// 检测列下面是否有可拖动的元素
				function hasSiblings(block, column){
					var size = 0;
					block.each(function(i, o){
						if( $("*", column).index(o)!=-1 )size ++;
					});
					
					return size!==0;
				}
				
				var $tgt;
				if ( options.target!==null )
				{
					options.targetChild = $(options.targetChild.selector );
					
					// 遍历拖动的目标区域
					$(options.target)
					.each ( function(){
						$tgt = $(this);
						var acceptAlight = (function(){
								var data = $tgt.data("onDragDisableInsert");
								return (tbc.array.indexOf(_count, data) == -1);
							})();
						var t_pos = tbc.getCoordinate(this);
						var p_pos = tbc.getCoordinate(this.parentNode);
						if(data && data.mouseX > t_pos.left && data.mouseX < t_pos.right && data.mouseY>t_pos.top && data.mouseY <t_pos.bottom)
						{
							//if(options.targetChild !== null)
							
							// 触发区域鼠标移入感应事件
							if($tgt.attr("_dragHover")!="true"){
								var e = $.extend({}, event, {target: $tgt});
								
								$.isFunction(options.onTargetMouseover)&&options.onTargetMouseover.call( _this[0], e );
								$.isFunction(options.event.targetMouseover) && options.event.targetMouseover.call(_this[0], e );
								
								$tgt.attr("_dragHover", "true");
							}
							
							// 判断是否有可拖动子节点,如果没有则直接移动到该区域
							if( !hasSiblings(options.targetChild, $tgt) ){
								
								if(options.insertToTarget && acceptAlight)
									_ghost.appendTo($tgt);
								return false;
							}
							else{
								
								var a=[];
								$(options.targetChild, $tgt).each(function(){a.push($(".ue-apptitle",this).text())});
								
								if(options.insertToTarget && acceptAlight && $tgt[0]==_ghost.parent()[0])
								{
									_ghost.appendTo($tgt);
								}
								
								$(options.targetChild, $tgt)
								.each(function(i, o){
									
									var t_child_pos = tbc.getCoordinate(o),
										t_child     = o;
									
									if(_wrap.children()[0]==o) return true;
									
									// 如果是当前对象则跳过
									if( t_child == _this[0] ) return true;
									
									if(data.mouseX > t_child_pos.left && data.mouseX < t_child_pos.right
									   && data.mouseY > t_child_pos.top && data.mouseY < t_child_pos.bottom)
									{
										var _halfY = $(t_child).height()/2,
											_halfX = $(t_child).width()/2
											
										if ( (options.staff=="y" && (data.mouseY - t_child_pos.top) <  _halfY) || (options.staff=="x" && (data.mouseX - t_child_pos.left) < _halfX) ) 
										{
											if(options.insertToTarget && acceptAlight)
											{
												_ghost.insertBefore(t_child);
											}
										}
										else if( (options.staff=="y" && data.mouseY+_halfY>t_child_pos.top) || (options.staff=="x" && data.mouseX+_halfX>t_child_pos.right) )
										{
											if(options.insertToTarget && acceptAlight)
												_ghost.insertAfter(t_child);
										}else if(options.insertToTarget && acceptAlight){
												_ghost.insertAfter(t_child);
										}
										
										// 触发可拖动对象在options中设置好的mouseover事件
										if($(t_child).attr("_dragHover")!="true"){
											var e = $.extend({}, event, {target: t_child});
											
											$.isFunction(options.onItemMouseover) && options.onItemMouseover.call( _this[0], e );
											$.isFunction(options.event.itemMouseover) && options.event.itemMouseover.call(_this[0], e );
										
											$(t_child).attr("_dragHover", "true");
										}
										
										return true;
									}else{
										if($(t_child).attr("_dragHover") == "true"){
											var e = $.extend({}, event, {target: t_child});
											options.onItemMouseout.call( _this[0], e);
											$.isFunction(options.event.itemMouseout) && options.event.itemMouseout.call(_this[0], e );
											$(t_child).removeAttr("_dragHover");
										}
									}
									
								});
								
							}
							
							
							
						// 当某一列高度小于其他列时,扩展感应的区域
						}else{
							if(data && data.mouseX > t_pos.left && data.mouseX < t_pos.right && data.mouseY>p_pos.top && data.mouseY <p_pos.bottom)
							{
								if(options.insertToTarget && acceptAlight)
									_ghost.appendTo($tgt);
							}
							
							// 触发目标区域的mouseout事件					
							if($tgt.attr("_dragHover") == "true"){
								var e = $.extend({}, event, {target: $tgt});
								$.isFunction(options.onTargetMouseout) && options.onTargetMouseout.call( _this[0], e );
								$.isFunction(options.event.targetMouseout) && options.event.targetMouseout.call(_this[0], e );
								$tgt.removeAttr("_dragHover");
							}
						}
					});
				}
				
				/**/
				if ( $.fn.scrollTo )
				{
					var top = document.documentElement.scrollTop;
					var btm = top + Math.max(document.body.clientHeight,document.documentElement.clientHeight,
											 document.body.offsetHeight,document.documentElement.offsetHeight);
					
					if( event.pageY < top+20 ){
						$(options.area).scrollTo("-=20px", 0);
					}else if(event.pageY > btm-20){
						$(options.area).scrollTo("+=20px", 0);
					}
				}
				/**/
				
				$.extend(event, {target: $tgt});
				// 执行自定义拖动事件
				try{
					$.isFunction(options.onDrag) && options.onDrag.call( _this[0], event, data );
					$.isFunction(options.event.drag) && options.event.drag.call( _this[0], event, data );
				}catch(e){
					
				}
			}
		});
		
	}
})(jQuery);

function t(t){$("#tips").append("<div>"+t+"; </div>");}/* 
 * @CLASS: Resize组件
 * @Copyright: 时代光华
 * @Author: 罗志华
 * @mail: mail@luozhihua.com
 */
(function($){
	$.fn.resizableForTbc = function(settings){
		var defaults = {
			  minWidth       : 10
			, minHeight      : 10
			, maxWidth       : document.documentElement.offsetWidth
			, maxHeight      : document.documentElement.scrollHeight
			, handle         : null // $(".resize-handle", this)			
			, vector         : "normal" // 类型: string, 取值范围: north, north-west, north-east, west, east, south, south-west, south-east
			, document       : document // 用于不同框架的元素重置大小。
			, margin         : {left:0, top:0, right:0, bottom:0} // 虚线框与被拖动对象边框的间距，如果被拖动对象设有margin值，这里就要相应设置该对象的每一个值
			, enabled        : function(){ return true; }
			
			/* 事件 */
			, onResizeStart : function(){}
			, onResize      : function(){}
			, onResizeEnd   : function(){}
		}
		
		return this.each(function(){
			var $this   = $(this);
			var options = $.extend( {}, defaults, settings );
				options.handle = $(options.handle, this);
			
			
			if( !options.handle.size() ){
				if( $this.css("position")==="static" ){
					$this.css({position:"relative"});
				}
				
				// 为木有调节手柄的节点添加调节手柄。
				options.handle = $('<div role="south-east" />')
				.css({width:"6px", height:"6px", position:"absolute", right:"0px", bottom:"0px", lineHeight:"0", overflow:"hidden",
					 border:"3px solid #f90", borderWidth:"0 3px 3px 0", cursor:"se-resize"})
				.hover(
					function(){ $(this).css({borderColor:"#09f"}); },
					function(){ $(this).css({borderColor:"#f90"}); }
				)
				.append('<div style="overflow: hidden; border: solid #fff 0px; border-width:3px 0pt 0pt 3px; width: 1px; height: 1px;"></div>')
				.appendTo(this)
				.fadeOut();
				
				$this.hover
				(
					function(){ options.handle.fadeIn(); },
					function(){ options.handle.fadeOut(); }
				);
			}
			
			// 限定拖动的方向			
			var vector = {x:0,y:0};
			
			options.handle.each(function(){
				/**
				 switch( this.getAttribute("role").toLowerCase() ) {
					case 'west'	      : $(this).css({cursor:"w-resize"});  break;
					case 'east'	      : $(this).css({cursor:"e-resize"});  break;
					case 'north'      : $(this).css({cursor:"n-resize"});  break;
					case 'south'      : $(this).css({cursor:"s-resize"});  break;
					case 'north-west' : $(this).css({cursor:"nw-resize"}); break; 
					case 'south-west' : $(this).css({cursor:"sw-resize"}); break; 
					case 'north-east' : $(this).css({cursor:"ne-resize"}); break; 
					case 'south-east' : $(this).css({cursor:"se-resize"}); break; 
					default:;
				}
				**/
			})
			.bind( "mousedown", function( event ){
				
				if(!options.enabled()){ return null; }
				
				var _this = this;
				
				
				// 临时禁止选中文字;
				$("body").css({"-moz-user-select":"none","-webkit-user-select":"none","-o-user-select":"none","-ms-user-select":"none",userSelect:"none"})
				.bind("selectstart", function(){return false;})
				
				options.onResizeStart.call($this);
				
				// 调整前的位置和大小
				var bound = tbc.getCoordinate( $this[0] );
					bound.left   += options.margin.left;
					bound.right  -= options.margin.right;
					bound.top    += options.margin.top;
					bound.bottom -= options.margin.bottom;
					bound.width  -= (options.margin.left+options.margin.right);
					bound.height -= (options.margin.top+options.margin.bottom);
				
				// 调整后的位置和大小
				var newSize = $.extend( {}, bound );
					
				// 调整大小时用虚线框标识调整后的位置和大小
				var mirror = $('<div />')
				.css({
					 position:"absolute", zIndex:tbc.getMaxZIndex(options.document)+1, left:bound.left, top:bound.top
					 , width:bound.width, height:bound.height
					 , border:"1px dotted blue", background:"#fff", opacity:0.7
					 })
				.appendTo($("body", options.document));
				
				// 设置调整的方向
				var vector;
				var _thisVector = $(this).attr("role");
				switch( _thisVector ) {
					case 'west'	      : vector = {x:-1, y: 0}; break;
					case 'east'	      : vector = {x: 1, y: 0}; break;
					case 'north'      : vector = {x: 0, y:-1}; break;
					case 'south'      : vector = {x: 0, y: 1}; break;
					case 'north-west' : vector = {x:-1, y:-1}; break; 
					case 'south-west' : vector = {x:-1, y: 1}; break; 
					case 'north-east' : vector = {x: 1, y:-1}; break; 
					case 'south-east' : vector = {x: 1, y: 1}; break; 
					default: return false;
				}
					
				$(options.document).bind( "mousemove.resizable", function( event ){
					
					options.maxWidth = document.documentElement.offsetWidth;
					options.maxHeight= document.documentElement.offsetHeight;
					
					// 修正X,Y
					var x = Math.max( Math.min( event.pageX, bound.right ), bound.left );
					var y = Math.max( Math.min( event.pageY, bound.bottom ), bound.top ); 
					
					// 向左增加宽度
					if( vector.x===-1 ){
						newSize.left  = Math.max(0, bound.right-options.maxWidth, Math.min(event.pageX, bound.right-options.minWidth));
						newSize.width = Math.min(options.maxWidth, Math.max(bound.left-event.pageX+bound.width, options.minWidth));
					}				
						// 向右增加宽度
					if( vector.x=== 1 ){ 
						newSize.width = Math.min(options.maxWidth, Math.max(event.pageX-bound.left, options.minWidth)); 
						newSize.right = Math.min(bound.left+options.maxWidth, Math.max(event.pageX, bound.left+options.minWidth));
						}
					if( vector.y===-1 ){			
						// 向上增加宽度
						newSize.top = Math.max(0,bound.bottom-options.maxHeight, Math.min(event.pageY, bound.bottom-options.minHeight));
						newSize.height = Math.min(options.maxHeight, Math.max(bound.top-event.pageY+bound.height, options.minHeight));}
						// 向下增加宽度
					if( vector.y=== 1 ){ 
						newSize.height = Math.min(options.maxHeight, Math.max(event.pageY-bound.top, options.minHeight)); 
						newSize.bottom = Math.min(bound.top+options.maxHeight, Math.max(event.pageY, bound.top+options.minHeight));
						}
					
					mirror.css({'left':newSize.left, 'top':newSize.top, 'width':newSize.width,'height':newSize.height});
					
					var _new = $.extend({}, newSize);
						_new.left   -= options.margin.left;
						_new.right  += options.margin.right;
						_new.top    -= options.margin.top;
						_new.bottom += options.margin.bottom;
						_new.width  += (options.margin.left+options.margin.right);
						_new.height += (options.margin.top+options.margin.bottom);
					
					// 如果元素不是绝对定位则删掉top/left/right/bottom等CSS值
					if( $this.css("position")!="absolute" ){
						delete(_new.top);
						delete(_new.left);
						delete(_new.right);
						delete(_new.bottom);
					}
					
					options.onResize.call($this, _new);
									
				}).bind("mouseup.resizable", function(){
					
					
					// 解除禁止选中文字;
					$("body").css({"-moz-user-select":"","-webkit-user-select":"","-o-user-select":"","-ms-user-select":"",userSelect:""})
					.unbind("selectstart");
					
					$(this).unbind(".resizable");
					
					newSize.left   -= options.margin.left;
					newSize.right  += options.margin.right;
					newSize.top    -= options.margin.top;
					newSize.bottom += options.margin.bottom;
					newSize.width  += (options.margin.left+options.margin.right);
					newSize.height += (options.margin.top+options.margin.bottom);
					
					// 如果元素不是绝对定位则删掉top/left/right/bottom等CSS值
					if( $this.css("position")!="absolute" ){
						delete(newSize.top);
						delete(newSize.left);
						delete(newSize.right);
						delete(newSize.bottom);
					}
					
					$this.css(newSize);
					options.onResizeEnd.call($this, newSize);
					
					mirror.remove();
				});
				
				return false;
			});
		});
	}
	
})(jQuery);// JavaScript Document
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
			.ue-contextmenu .ue-item,.ue-contextmenu .ue-item:visited{display:block; width:100%; height:100%; white-space:nowrap; word-break:keep-all; text-decoration:none; color:#333;}\
			.ue-contextmenu .ue-item:hover{ color:#fff;}\
			.ue-contextmenu li.hover{ background-color:#219CCB;}\
			.ue-contextmenu li.hover .ue-item{color:#fff;}\
			.ue-contextmenu li.hover li .ue-item{color:#333;}\
			.ue-contextmenu .ue-item span{ display:block; height:100%; cursor:default;}\
			.ue-contextmenu .ue-item span.ue-icon{ width:28px; float:left; overflow:hidden;\
				background-color:#eee; background-color:rgba(27,138,228,0.15); background-position:50% 50%; background-repeat:no-repeat;\
				position:absolute; left:0; top:0;}\
			.ue-contextmenu .ue-item span.ue-icon span{ height:16px; margin:6px 0 0 6px;}\
			.ue-contextmenu li.hover span.ue-icon span{ -moz-transform:rotate(360deg); -webkit-transform:rotate(360deg); -o-transform:rotate(360deg); -ms-transform:rotate(360deg); transform:rotate(360deg);}\
			.ue-contextmenu li.disabled .ue-item span.ue-icon span{ -moz-transform:rotate(0deg); -webkit-transform:rotate(0deg); -o-transform:rotate(0deg); -ms-transform:rotate(0deg); transform:rotate(0deg);}\
			.ue-contextmenu .ue-item span.ue-text{ margin-left:29px; padding:0 40px 0 4px; _zoom:1;}\
			.ue-contextmenu li.disabled{background-color:#fff !important;}\
			.ue-contextmenu li.hover .ue-item span.ue-icon{filter:alpha(opacity=80);}\
			.ue-contextmenu li.disabled .ue-item span.ue-icon span{filter:alpha(opacity=30); opacity:0.3;}\
			.ue-contextmenu li.disabled .ue-item span.ue-text{color:#000; filter:alpha(opacity=30); opacity:0.3;}\
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
					
					if( $(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size() ) {
						event.stopPropagation(); return false;
					}
					
					if(event.ctrlKey) return true;
					
					var opt = offset ? $.extend({}, settings, offset ) : settings;
					
					event.stopPropagation();
					var cm = new $.contextmenu(opt, this);
						cm.show(event);
					
					return false;
				});
				
				var touchstartTimeout;
				
				if ( this.addEventListener ){
					
					var touchstart = function( event ){
						clearTimeout( touchstartTimeout );
						document.body.style.webkitTouchCallout='none';
						
						if ( !event.stopContextmenu )
						{
							event.stopContextmenu = true; // 阻止上级节点触发邮件菜单
							touchstartTimeout = setTimeout( function(){
								touchX = event.targetTouches[0].pageX;
								touchY = event.targetTouches[0].pageY;
								
								var opt =  $.extend({}, settings, {left:touchX, top:touchY}),
									cm	= new $.contextmenu(opt, this);
									cm.show(event);
							}, 800);
						}
					},
					touchend = function( event ){
						clearTimeout( touchstartTimeout );
					}
					
					this.removeEventListener("touchstart", touchstart);
					this.addEventListener( "touchstart", touchstart);
					
					this.removeEventListener("touchend", touchend);
					this.addEventListener( "touchend",  touchend);
				}
			}	
		});
	}
	
	$.contextmenu = function( settings, srcElement ){
		
		$.contextmenu.id = $.contextmenu.id || 0;
		$.contextmenu.id++;
		
		var id = $.contextmenu.id;
		
		$.contextmenu.actions = $.contextmenu.actions || {};
		$.contextmenu.actions[id] = {};
		
		
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
		
		$.contextmenu.action = function( index, htmlItem ){
			try {
				var f = $.contextmenu.actions[id][index];
				$.isFunction(f) && f.call(htmlItem);
			} catch (e) {}
		}
		
		$.contextmenu.hoverIn = function( sm ){
			
			sm = $(sm).addClass("hover").children("ul").show();
			
			// 修正子菜单的位置, 保证右键菜单位于窗口边缘时,子菜单不会超出窗口的可视范围;
			
			if(sm.size()==0)return;
			
			var bodyBottom 	= document.documentElement.scrollTop+document.body.offsetHeight,
				bodyRight	= document.documentElement.scrollLeft+document.body.offsetWidth,
				offset		= sm.offset(),
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
		$.contextmenu.hoverOut = function( li ){
			$(li).removeClass("hover").children("ul").hide();
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
			
			if( $(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size() ){
				event.stopPropagation();
				return false;
			}
			
			// 事件: show
			if($.isFunction(options.event.show))options.event.show.call( $(srcElement) );
			
			$(document).trigger("click.hideContextmenu");
			
			var _actindex = 0;
			var x = options.left||event.pageX||event.targetTouches[0],
				y = options.top||event.pageY||event.targetTouches[0];
				
			var cm = $('<div class="ue-contextmenu"></div>')
					.append(createHtml(this.inherit( event )))
					.css({left:x, top:y, zIndex:tbc?tbc.getMaxZIndex():"auto"})
					.appendTo("body"),
				
				bodyBottom 	= document.documentElement.scrollTop+document.body.offsetHeight,
				bodyRight	= document.documentElement.scrollLeft+document.body.offsetWidth,
				menuBottom	= y  + cm.height(),
				menuRight	= x + cm.width(),
				top			= bodyBottom<menuBottom ? bodyBottom-cm.height() : y,
				left		= bodyRight<menuRight ? bodyRight-cm.width() : x;
				
			if(bodyBottom<menuBottom){
				cm.css({ top:"auto", bottom:"0px" });
			}
			
			if( bodyRight<menuRight ){
				cm.css({
					left:"auto", right:"0px"
				});
			}
			
			var hideCMENU = function(cm){
				
				setTimeout(function(){
					cm.remove();
					for(var i=0; i<id; i++){
						delete $.contextmenu.actions[i];
					}
					cm=null;
				}, 1);
				
				$(document).unbind("click.hideContextmenu");
				
				// 事件: hide
				if($.isFunction(options.event.hide))options.event.hide.call($(srcElement));
			}
			
			$(document).bind("click.hideContextmenu", function(){
				
				if( !$(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size()==0 ){
					hideCMENU(cm);
				}else{
					event.stopPropagation();
					return false;
				}
			});
			
			// 生成菜单结构
			function createHtml( items, cssClass ){
				
				var ul = '<ul class="' + (cssClass?cssClass:'') + '">';
				
				items = $.isFunction(items) ? items() : items;
				
				$.each(items, function( i, o ){
					
					_actindex++;
					var li = "";
					switch(o){
						case "line":
						case "-":
						case "--":
						case "---":
							li = '<li class="ue-line"></li>';
							break;
						default:
							var itm		= $.isFunction(o) ? o() : o,
								icon	= $.isFunction(itm.icon) ? itm.icon() : itm.icon||"",
								text	= $.isFunction(itm.text) ? itm.text() : itm.text,
								disabled = $.isFunction(itm.disabled) ? itm.disabled() : itm.disabled,
								submenu	= $.isFunction(itm.submenu) ? itm.submenu() : itm.submenu
								
								clc = disabled ? "null" : "$.contextmenu.action("+ _actindex +")";
								hvr = disabled ? "" : 'onmouseover="$.contextmenu.hoverIn(this);" onmouseout="$.contextmenu.hoverOut(this);"'
							
							if(text===false){
								break;
							}
							
							$.contextmenu.actions[id][_actindex] = itm.click;
							
							li = '<li class="'+ (disabled?"disabled":"") +'" '+ hvr +'>'+
									'<span class="ue-item" href="javascript:void(null);" onclick="'+ clc +';">'+
										( (icon.match(/\.(jpg|jpeg|gif|png|img|ico|bmp)$/) || icon.indexOf("sf-server/file/getFile/")!=-1)
										? '<span class="ue-icon"><span class="tbc-icon"><img src="'+ icon +'" style="border:0px; width:16px;" /></span></span>'
										: '<span class="ue-icon"><span class="tbc-icon '+ icon +'"></span></span>') +
										'<span class="ue-text">'+ text +'</span>' +
									'</span>'+
									(submenu?'<span class="ue-submenu-more">&diams;</span>'+createHtml(submenu, "ue-submenu"):"") + 
								'</li>';
							break;
					}
					ul+=li;
				});
				ul+="</ul>";
				
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
(function($){
	$.fn.selectArea = function( settings ){
		var defaults = {
			  item : this.children()
			, exclude	: null
			, classSelected : "selected"
			, event : {
				select : function(){},
				unselect : function(){}
			}
		}
		
		var options = $.extend({}, defaults, settings);
		
		return this.each(function(){
			$(this).bind({
				"mousedown.selector" : function( event ){
					
					if ( (tbc.msie&&tbc.browserVersion<9 && event.button!=1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button!=0) ){
						return;
					}
					
					if ( event.disableSelectArea || event.target!=this ){
						return;
					} else {
						event.stopPropagation();
					}
					
					var _this = $(this),
						_x	= event.pageX,
						_y	= event.pageY,
						a,
						timeout = null,
						startSelect = false;
					
					$(document).bind({
						"mousemove.selector.a" : function( event ){
						
							// 临时禁止选中文字;
							$("body").disableSelect();
							a = a || $.fn.selectArea.area().appendTo("body")
					
							startSelect = true;
							var offset = $.fn.selectArea.getOffset( event, _x, _y );
								a.css(offset);
							
							if (!tbc.msie || tbc.browserVersion>7){
								$.fn.selectArea.selectElement.call(_this, options, event, _x, _y);
							}
						},
						"mouseup.selector.a" : function ( event ){
							if ( startSelect ) {
								$.fn.selectArea.selectElement.call(_this, options, event, _x, _y);
								startSelect = false;
							}
							
							// 允许选中文字;
							$("body").enableSelect();
							a && a.remove();
							
							$(this).unbind(".selector.a");
						}
					});
				}
			});
		});
	}
	
	$.fn.selectArea.selectElement = function ( options, event, _x, _y ){
		
		var offset = $.fn.selectArea.getOffset(event, _x, _y);
		$(this).children(options.item).not(options.exclude).each(function(){
			if( tbc.isOverlap(offset, this) ){
				$(this).addClass(options.classSelected);
				options.event.select.call(this, event);
			}else{
				$(this).removeClass(options.classSelected);
				options.event.unselect.call(this, event);
			}
			
		});
	}
	
	$.fn.selectArea.getOffset = function ( event, _x, _y ){
		var x      = event.pageX,
			y 	   = event.pageY,
			left   = Math.min(x,_x),
			right  = Math.max(x, _x),
			top    = Math.min(y, _y),
			bottom = Math.max(y, _y),
			width  = Math.abs(left-right),
			height = Math.abs(top-bottom);
		  
		return {left:left, top:top, right:right, bottom:bottom, width:width, height:height};
	}
	
	$.fn.selectArea.area = function (){
		var a = $('<div><div></div></div>'),
			z = tbc.getMaxZIndex()+1;
		a.css({backgroung:"transparent", border:"1px dotted #09f", position:"absolute",left:0, top:0, width:0, height:0, zIndex:z});
		a.find("div").css({width:"100%", height:"100%", background:"#0af", opacity:0.1});
		try {
			return a;
		} finally {
			a = z = null;
		}
	}
	
})(jQuery);