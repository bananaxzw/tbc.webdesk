(function($){

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

				_this.animate(_offset, 1200, "easeOutBounce", function(){
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

})(jQuery)