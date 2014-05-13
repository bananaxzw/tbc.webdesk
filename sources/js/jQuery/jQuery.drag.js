/*
 * @CLASS: 拖动组件
 * @Copyright: 时代光华
 * @Author: 罗志华
 * @mail: mail@luozhihua.com
 */

;(function($){
	$.fn.drag = function(settings) {

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
				  dragStart       : function(){}
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
		var _updateArea = function() {
			var a = options.area,
				m = options.areaMargin,
				c = tbc.percentToInt;
			if (a === true) {
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
		};

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
					});

				},
				"mouseleave" : function(){ clearTimeout(timeout); },
				"mouseup"    : function(){ clearTimeout(timeout); },
				"mousedown"  : function(event){

					//event.stopPropagation();
					event.disableSelectArea = true;

					if ( !options.enabled() || (tbc.msie&&tbc.browserVersion<9 && event.button!=1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button!=0) ){
						return;
					}

					if(options.timeout) {
						timeout = setTimeout(_start, options.timeout);
					} else {
						_start();
					}

					var timer, eventData;

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

						if (moving===false) {
							startDrag(event);
							moving = true;
						}

						clearTimeout(timer);
						/**
						event.clientX = event.clientX || event.changedTouches[0].clientX;
						event.clientY = event.clientY || event.changedTouches[0].clientY;
						event.pageX   = event.pageX   || event.changedTouches[0].pageX;
						event.pageY   = event.pageY   || event.changedTouches[0].pageY;
						*/

						var offset = getDragingOffset(event);
						eventData = offset;

						if(options.target){
							_wrap.css({position: "absolute", top:offset.top, left:offset.left, width:offset.width});
						}else{
							_this.css({top:offset.top, left:offset.left});
						}

						$.extend( offset, {mouseX : event.clientX + _scrLeft, mouseY : event.clientY + _scrTop} );

						timer = setTimeout(function() {
							draging(event, offset);
						}, 30);
					}

					function mouseup_drag(event){

						var eTarget
							, xy , cb
							, insertable
							, dropon = _ghost ? _ghost[0] : null;

						event.dropon = dropon;

						moving = false;

						insertable = $.isFunction(options.event.drop)
							? (options.event.drop.call(_this[0], event, eventData)!==false)
							: true;

						$(options.document).unbind(".drag");

						$("body").css({"-moz-user-select":"normal", "webkitUserSelect":"normal", "oUserSelect":"normal", "userSelect":"normal"})
						.unbind( "selectstart");

						if (options.target) {
							eTarget = _ghost.parent();

							$.extend(event, {target:eTarget});

							xy = tbc.getCoordinate( _ghost[0] );

							cb = function() {
								// 执行自定义结束事件
								try {
									if (insertable) {
										_this.removeClass("dragging").insertAfter( _ghost );
									};

									hideWrap();
									hideGhost(); // 隐藏虚线框
									$.isFunction(options.event.dragEnd) && options.event.dragEnd.call(_this[0], event, eventData)
								} catch (e) {}

								// 如果设置为:拖动后不获得焦点,
								// 则改回拖动之前的z-index值;
								if (options.focus) {
									_this.css("zIndex", _this.data("_zIndex")).data("_zIndex", null);
								}
							}

							if (options.animate) {
								_wrap.animate({ width:xy.width, height:xy.height, left:xy.left, top:xy.top }, 400, cb);
							} else {
								_wrap.css({left:xy.left, top:xy.top }); cb();
							}

						} else {

							// 如果设置为:拖动后不获得焦点,
							// 则改回拖动之前的z-index值;
							if(options.focus)
							{
								_this.css("zIndex", _this.data("_zIndex")).data("_zIndex", null);
							}
							// 执行自定义结束事件
							if ($.isFunction(options.event.dragEnd)) {
								options.event.dragEnd.call(_this[0], event, eventData);
							}

							hideWrap();

						}

						eTarget = xy = cb = insertable = dropon = null;
					}
				}
			})


			// 用于临时放置被拖动对象的克隆对象的盒子
			function wrap(w, h) {
				var wrap = $("#drag_wrap");
				return wrap.size() ? wrap : $('<div id="drag_wrap"></div>').css({width:w, height:h});
			}

			function hideWrap() {
				$("#drag_wrap").remove();
				_wrap = null;
			}

			// 创建拖动时的目标占位模块
			function ghost(w, h) {

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
			var hideGhost = function() {
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
				if (options.target) {
					_ghost = ghost().show();
					_ghost.css({width:_width, height:_height}).insertAfter(_this);
					var __ = _this.clone().remove().removeClass("ue-app").addClass("ue-app-clone") ;//$("<div></div>").append( );

					_wrap.append(__);
				}

				var offset = getDragingOffset(event);
				_wrap.css({position: "absolute", top:offset.top, left:offset.left, width:offset.width});
			}

			function getScrollTop() {
				_scrTop  = options.document.documentElement.scrollTop ||options.document.body.scrollTop;
				_scrLeft = options.document.documentElement.scrollLeft||options.document.body.scrollLeft;

				return {top: _scrTop, left:_scrLeft};
			}

			//
			function getDragingOffset(event) {
				getScrollTop();
				_updateArea();
				var _scrTop_parent  = 0,
					_scrLeft_parent = 0,
					offset = _wrap ?
						tbc.getCoordinate(_wrap[0].offsetParent) :
						{left:0, top: 0},
					parentOff = _wrap ?
						tbc.getCoordinate(_wrap[0].offsetParent) :
						{left: 0, top: 0},
					iframe,
					iframeTop=0,
					iframeLeft=0;

				try {
					iframe = options.window.frameElement;
				} catch(e) {}

				if (iframe !== null) {
					var iframeOffset = $(iframe).offset();
					if (iframeOffset) {
						iframeTop = iframeOffset.top;
						iframeLeft = iframeOffset.left;
					}
				};

				// 计算将要拖动到的新坐标位置
				var _top    = event.pageY
							- offset.top
							- _this.offsetParent().offset().top
							- mouseToTargetTop
							+ _scrTop
							+ iframeTop,
					_left   = event.pageX
							- offset.left
							- _this.offsetParent().offset().left
							- mouseToTargetLeft
							+ _scrLeft
							+ iframeLeft,
					_width  = _this.width(),
					_height = _this.height(),
					_bottom = _top  + _height,
					_right  = _left + _width;

				var o = {top:_top, left:_left, right:_right, bottom:_bottom, width:_width, height:_height};

				// 根据设定的限制区域重新计算拖动对象的新坐标位置
				if (options.area) {
					o.top  = o.bottom >= _area.bottom ? (_area.bottom - o.height) : Math.max(_area.top, o.top);
					o.left = o.right >= _area.right ? (_area.right - o.width) : Math.max(_area.left, o.left);
				}

				return o;
			}

			function draging(event, data) {

				if (options.area && (data.mouseX < _area.left || data.mouseX > _area.right || data.mouseY<_area.top || data.mouseY >_area.bottom)) {
					return;
				}

				// 检测列下面是否有可拖动的元素
				function hasSiblings(block, column){
					var size = 0;
					block.each(function(i, o){
						if( $("*", column).index(o)!=-1 )size ++;
					});

					return size!==0;
				}

				var $tgt;
				if (options.target!==null) {
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
						if (data && data.mouseX > t_pos.left && data.mouseX < t_pos.right && data.mouseY>t_pos.top && data.mouseY <t_pos.bottom) {
							//if(options.targetChild !== null)

							// 触发区域鼠标移入感应事件
							if ($tgt.attr("_dragHover")!="true") {
								var e = $.extend({}, event, {target: $tgt});

								$.isFunction(options.onTargetMouseover)&&options.onTargetMouseover.call( _this[0], e );
								$.isFunction(options.event.targetMouseover) && options.event.targetMouseover.call(_this[0], e );

								$tgt.attr("_dragHover", "true");
							}

							// 判断是否有可拖动子节点,如果没有则直接移动到该区域
							if (!hasSiblings(options.targetChild, $tgt)) {

								if(options.insertToTarget && acceptAlight)
									_ghost.appendTo($tgt);
								return false;
							} else {

								var a=[];
								$(options.targetChild, $tgt).each(function(){a.push($(".ue-apptitle",this).text())});

								if (options.insertToTarget && acceptAlight && $tgt[0]==_ghost.parent()[0]) {
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
						} else {
							if (data && data.mouseX > t_pos.left && data.mouseX < t_pos.right && data.mouseY>p_pos.top && data.mouseY <p_pos.bottom) {
								if(options.insertToTarget && acceptAlight)
									_ghost.appendTo($tgt);
							}

							// 触发目标区域的mouseout事件
							if ($tgt.attr("_dragHover") == "true") {
								var e = $.extend({}, event, {target: $tgt});
								$.isFunction(options.onTargetMouseout) && options.onTargetMouseout.call( _this[0], e );
								$.isFunction(options.event.targetMouseout) && options.event.targetMouseout.call(_this[0], e );
								$tgt.removeAttr("_dragHover");
							}
						}
					});
				}

				/**/
				if ($.fn.scrollTo) {
					var top = document.documentElement.scrollTop;
					var btm = top + Math.max(document.body.clientHeight,document.documentElement.clientHeight,
											 document.body.offsetHeight,document.documentElement.offsetHeight);

					if (event.pageY < top+20) {
						$(options.area).scrollTo("-=20px", 0);
					} else if(event.pageY > btm-20) {
						$(options.area).scrollTo("+=20px", 0);
					}
				}
				/**/

				$.extend(event, {target: $tgt});
				// 执行自定义拖动事件

				if ($.isFunction(options.onDrag)) {
					options.onDrag.call(_this[0], event, data);
				}

				if ($.isFunction(options.event.drag)) {
					options.event.drag.call(_this[0], event, data);
				}
			}
		});

	}
})(jQuery);

function t(t){$("#tips").append("<div>"+t+"; </div>");}