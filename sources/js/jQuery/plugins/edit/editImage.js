(function($){
	
	$.fn.editImg = $.fn.editImage = function( settings ){
		return this.each(function(){
			
			settings.img = this;
			$.editImg( settings );
			
		});
	}
	
	$.editImg = $.editImage = function( settings ){
		
		var defaults = 
		{
			  url: null              // 上传图片的地址
			, postImgName : "img"    // 上传的图片名称：用于服务器端读取上传的图片
			, dataType    : "html"   // [json,xml,html]
			, align       : "bottom-left"   // [left, top, right, bottom, top-left, top-right, bottom-left, bottom-right]
			, alignType   : "outside"  // 对齐类型：[inside:内对齐, outside: 外对齐]
			, position    : "absolute" //
			, tips        : "选择图片." // 
			, img         : null       // 编辑的图片（必须）
			
			, beforeSend  : function(){}
			, success     : function(){}
			, error       : function(){}
			, complete    : function(){}
		}
		
		var options = $.extend( {}, defaults, settings);
		var _img = $(options.img);
		
		var _id    = "imgUploader_"+((Math.random()+"").replace(".",""));
		var z      = pt37.getMaxZIndex();
		var coor   = pt37.getCoordinate(_img[0]);

		var loader = $('<div class="op_menu_list" style="display:none; background:#fff; -moz-box-shadow:1px 1px 2px #666; -webkit-box-shadow:1px 1px 2px #666; box-shadow:1px 1px 2px #666;">\
				<div style="padding:12px;">\
					<form action="' + (options.url||"?action=upload") + '" target="'+_id+'_frame" enctype="multipart/form-data" method="post">\
						<input type="file" name="'+ (options.postImgName||"img") +'" />\
						<input class="savebtn" type="submit" name="submit_1" value=" 上传 " />\
						<input class="cancel canclebtn" type="button" name="submit_1" value="取消" />\
					</form>\
					<iframe id="'+_id+'_frame" name="'+_id+'_frame" style="display:none;" src="about:blank" scrolling="no" height="0" width="0"></iframe>\
					<div style="text-align:left;">' + options.tips + '</div>\
					<div class="result" style="padding:0px; text-align:left; font-size:12px;"></div>\
				</div>\
			</div>')
			.appendTo("body");
		
		
		var _top, _left, _right, _bottom;
		switch(options.align){
			case "left":
				_top  = coor.top;
				_left = coor.left - (options.alignType=="outside"?loader.width():0);
				break;
			case "top":
				_top  = coor.top - (options.alignType=="outside"?loader.height():0);
				_left = coor.left;
				break;
			case "right":
				_top  = coor.top;
				_left = coor.right - (options.alignType=="outside"?0:loader.width());
				break;
			case "bottom":
				_top  = coor.bottom - (options.alignType=="outside"?0:loader.height());
				_left = coor.left;
				break;
			case "top-left":
				_top = coor.top - (options.alignType=="outside"?loader.height():0);
				_left = coor.left;
				break;
			case "top-right":
				_top = coor.top - (options.alignType=="outside"?loader.height():0);
				_left = coor.right - loader.width();
				break;
			case "bottom-left":
				_top = coor.bottom - (options.alignType=="outside"?0:loader.height());
				_left = coor.left;
				break;
			case "bottom-right":
				_top = coor.bottom - (options.alignType=="outside"?0:loader.height());
				_left = coor.right - loader.width();
				break;
		}
		
		loader
		.css({ position: "absolute", zIndex: z + 1, display: "block", borders: "1px solid #000",
			left: _left, top: _top, right:_right, bottom:_bottom, opacity: 0
		});
		
		if(options.position=="fixed"){
			loader.insertAfter(options.img).css({position: "static"});
		}

		loader.find(".result").html("");
		loader.animate({ left: _left, top: _top, opacity: 1 }, "fast");
		
		var upload = false;
		var iframe = loader.find("iframe")[0];
		loader.find("form").submit(function () {
			upload = true;
			if(loader.find("input[type='file']").val()==""){
				loader.find(".result").slideDown("fast").html("请选择图片。");
				return false;
			}else{
				loader.find(".result").slideDown("fast").html("正在上传...");
			}
		});

		loader.find("input[type='file']").val("");
		
		// 取消
		loader.find(".cancel")
		.click(function () {
			loader.fadeOut("fast");
		});

		// 上传完毕后的方法
		function onload(t) 
		{
			if(!upload)return;
			try {
				var result = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
				var parseResult;
				
				switch(options.dataType)
				{
					case "xml":
						try{
							if(ActiveXObject)
							{
								parseResult = new ActiveXObject("Microsoft.XMLDOM");
								parseResult.async="false";
								parseResult.loadXML(result);
								
							//Firefox, Mozilla, Opera, etc.
							}else{
								parser = new DOMParser();
								parseResult = parser.parseFromString(result, "text/xml");
							}
							
						}catch(e){
							if($.isFunction(options.error))
							{
								if(options.error.call(loader, result)!==false)
								{
									loader.find(".result").slideDown("fast").html('<span style="color:red;">上传图片错误，返回的数据不是正确的XML格式。</span>');
								}
							}
							return false;
						}
						break;
					case "json":
						try{
							eval("parseResult="+result);
						}catch(e){
							if($.isFunction(options.error))
							{
								if(options.error.call(loader, result)!==false)
								{
									loader.find(".result").slideDown("fast").html('<span style="color:red;">上传图片错误: 返回的数据不是JSON格式。</span>');
								}
							}
							return false;
						}
						break;
					case "html":
					default:
						parseResult = result;
						break;
				}
				
				$.isFunction(options.success) && options.success.call(loader, parseResult);
				
			} catch (e) {
				loader.find(".result").slideDown("fast").html('<span style="color:red;">上传图片错误，请重试。</span>');
				$.isFunction(options.error) && options.error.call(loader);
			}
			upload = false;
			$.isFunction(options.complete) && options.complete.call(loader);
		}

		if (iframe.attachEvent) {
			iframe.attachEvent( "onload", onload );
		} else {
			iframe.onload = onload;
		}
		
		$.extend(loader, {
			close  : function(){var _t=this; this.fadeOut("fast", function(){_t.remove()}); return this;},
			tip    : function(t, color){this.find(".result").slideDown("fast").html('<span style="color:'+(color||"#000")+';">'+t+'</span>'); return this;},
			error  : function(t){this.tip(t||"上传图片错误，请重试。", "red"); return this;},
			clear  : function(){this.find("input[type='file']").val(""); return this;}
		});
		
		return loader;
		
	}
	
})(jQuery);