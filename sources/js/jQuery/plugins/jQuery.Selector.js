
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
					
					if( event.disableSelectArea || event.target!=this ){
						return false;
					}else{
						event.stopPropagation();
					}
					
					// Disable selecting text for this node;
					$(this).css({"-moz-user-select":"none","-webkit-user-select":"none","-o-user-select":"none","-ms-user-select":"none",userSelect:"none"})
					.bind("selectstart", function(){return false;})
					
					var _this = $(this),
						_x	= event.pageX,
						_y	= event.pageY,
						a	= area(),
						timeout = null,
						startSelect = false;
					
					a.appendTo("body");
					
					$(document).bind({
						"mousemove.selector.a" : function( event ){
							
							startSelect = true;
							var offset = getOffset(event);
								a.css(offset);
							
							if(!tbc.msie || tbc.browserVersion>7){
								selectElement(event);
							}
						},
						"mouseup.selector.a" : function(event){
							clearTimeout(timeout);
							if(startSelect){
								selectElement(event);
								startSelect = false;
							}
							a.remove();
							$(this).unbind(".selector.a");
						}
					});
					
					function getOffset( event ){
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
					
					function selectElement(event){
						var offset = getOffset(event);
						_this.children(options.item).not(options.exclude).each(function(){
							if( tbc.isOverlap(offset, this)){
								$(this).addClass(options.classSelected);
								options.event.select.call(this, event);
							}else{
								$(this).removeClass(options.classSelected);
								options.event.unselect.call(this, event);
							}
							
						});
						
					}
				}
			});
		});
		
		function area(){
			var a = $('<div><div></div></div>');
			var z = tbc.getMaxZIndex()+1;
			a.css({backgroung:"transparent", border:"1px dotted #09f", position:"absolute",left:0, top:0, width:0, height:0, zIndex:z});
			a.find("div").css({width:"100%", height:"100%", background:"#0af", opacity:0.1});
			return a;
		}
		
	}
})(jQuery);