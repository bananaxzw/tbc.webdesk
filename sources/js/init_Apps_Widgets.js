 
try{
	// 域名(跨域问题)
	var domain	= document.location.host;
		domain	= domain.split(".").length<3 ? domain : domain.substring( domain.indexOf(".")+1 );
		
	document.domain = domain;
}catch(e){}

jQuery(function( $ ){
	/* 右键菜单 */
	$(document).bind({
		contextmenu : function( event ){
			try{
				var iframe = $(window.frameElement),
					offset = iframe.offset(),
					top  = offset.top + event.pageY,
					left = offset.left + event.pageX;
				
				window.top.$( window.frameElement ).trigger("contextmenu", {top:top, left:left});
			}catch(e){
				
			}
			return false;
		}
	});
	
	
	//解决IE下IFRAME里面的input无法获得光标的问题。
	var inputSample = $('<input norender="true" type="text" style="width:0;height:0;overflow:hidden;background:transparent;border:none;position:absolute;top:0" />')
		.appendTo("body")
		.focus()
		.hide();
	
	// 桌面widgets 插件
	var widget = $(window.frameElement).parents(".tbc-widget");
	
	// 如果是widgets
	if( widget.size() ){
		$("body").css({cursor:"move"});
	}
	
	$(document).bind({
		"mousedown" : function( event ){
			// 隐藏右键菜单
			$(window.frameElement).trigger("click.hideContextmenu");
			$("body").bind({
				"selectstart":function(){return false;}
			});
		},
		"mouseup" : function(){
			$("body").unbind("selectstart");
			widget.css({opacity:1,cursor:"default"});
		}
		
	});
});

// 关闭
window.closeApp = 
window.closeWidget = function(){
	window.frameElement.execute("close");
}

// 重新载入
window.reload = function(){
	window.frameElement.execute("reload");
}