/* 
 * @CLASS: Resize组件
 * @Copyright: 时代光华
 * @Author: 罗志华
 * @mail: mail@luozhihua.com
 */
(function($){
	$.fn.resizable = function(settings){
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
	
})(jQuery);