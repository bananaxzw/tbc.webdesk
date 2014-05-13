;(function($){
	
	$.extend($.fn, {
		
		// 散开的波纹
		"diffuse" : function(settings){
			var defaults = {
				  number : 3
				, color : "#ccc" // 颜色
				, distance: 32   // 距离后多远结束
				, borderWidth : 5
			};
			var options = $.extend({}, defaults, settings);
			
			return $(this).each(function(i, o){		
				var _off = imis.getCoordinate(this);
				
				var color = options.color||"#ccc";
				var repo = $("<div></div>").css({
					  border     : options.borderWidth + "px solid " + color
					, background : "transparent"
					, width      : _off.width-(options.borderWidth*2)
					, height     : _off.height-(options.borderWidth*2)
					, left       : _off.left
					, top        : _off.top
					, position   : "absolute"
					, zIndex     : 1
					, opacity    : 1
				});
				
				var step = options.distance/options.number;
		
				var off = off||$.extend({},_off);
					off.opacity=0;
					
				var offTott = function(){
					off.left   -= step;
					off.top    -= step;
					off.width  += (step*2);
					off.height += (step*2);
				};
				offTott();
				
				show.call(repo, _off);
				var i=0;
				while(i<4){
					setTimeout(function(){
						var _r = repo.clone().appendTo("body").css({left:_off.left, top:_off.top})
						
						show.call(_r, off);
						offTott();
					}, 200);
					i++;
				}
			});
				
			function show(e){
				$(this).animate(e, 400, "swing", function(){$(this).remove();});
			}
		},
		
		// 聚集的波纹
		"besiege" : function(settings){
			var defaults = {
				  number : 3
				, color : "#ccc" // 颜色
				, distance: 32   // 距离后多远结束
				, borderWidth : 5
			};
			var options = $.extend({}, defaults, settings);
			
			return $(this).each(function(i, o){
								
				var step = options.distance/options.number;
					
				var _off = imis.getCoordinate(this);
					_off.left   -= options.distance;
					_off.top    -= options.distance;
					_off.width  += (options.distance*options.number)-options.borderWidth*2;
					_off.height += options.distance*options.number-options.borderWidth*2;
					_off.opacity = 0;
				
				var color = options.color||"#ccc";
				var repo = $("<div/>").css({
					  border     : options.borderWidth+"px solid "+color
					, background : "transparent"
					, width      : _off.width
					, height     : _off.height
					, left       : _off.left
					, top        : _off.top
					, position   : "absolute"
					, zIndex     : 1
					, opacity    : 0
				})
				//.appendTo("body");
		
				var off = off||$.extend({},_off);
					
				var offTott = function(){
					off.left   += step;
					off.top    += step;
					off.width  -= (step*2)+(options.borderWidth*2);
					off.height -= (step*2)+(options.borderWidth*2);
				};
				offTott();
				
				show.call(repo, _off);
				var i=0;
				while(i<3){
					setTimeout(function(){
						var _repo = repo.clone().appendTo("body").css({left: _off.left, top:_off.top});
						show.call(_repo, $.extend({}, off, {opacity:0.5}) );
						offTott();
					}, 200);
					i++;
				}
			});
				
			function show(e){
				$(this).animate(e, 400, function(){$(this).remove();});
			}
		}
	});
	
})(jQuery);