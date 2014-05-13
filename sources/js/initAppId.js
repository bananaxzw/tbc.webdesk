if(!window.console){
    window.console = {
         log:function(msg){
         }
    };
};

// set appId
var appId = '';
(function($){
	var _ajax=$.ajax;
	$.ajax=function(){
		//console.log(arguments);
		if(arguments[0].data){
			if(jQuery.type(arguments[0].data)=='string'){
				var _argData = arguments[0].data;
				if(_argData.indexOf('current_app_id') == -1)
					arguments[0].data += '&current_app_id='+appId;
			}
		}
		return _ajax.apply(this,arguments);
	}
	
	$.ajaxSetup({
		cache:false,
		error:function(jqXHR, textStatus, errorThrown){
			try{
				$('#_loading').hide();
			}catch(e){
				//
			}
			if(jqXHR.status==403){
				try{
					parent.sendRedirect(true);
				}catch(e){
					sendRedirect(true);
				}
			}
		}
	});
})(jQuery);

function initAppId(v){
	appId = v;
	$.ajaxSetup({
		data:{'current_app_id':v}
	})
}

function hasChinese(str){
	for(i=0;i<str.length;i++){
		if(str.charCodeAt(i)>128)
			return true;
	}
	return false;
}

/**
 * 打开窗口(同window.js同名方法)
 * 
 * @param appId
 * @param param
 * 页面调用:parent.desktopWindow(calAppId, param);
 */
function desktopWindow(appId, param){
	$('body').desktop('opennew',{
		id:appId,
		param:param||{}
	});
}

/**
 * 打开窗口,并指定URL(同window.js同名方法)
 * 
 * @param appId
 * @param url
 * 
 * 页面调用:parent.desktopWindowWithUrl(calAppId, url);
 */
function desktopWindowWithUrl(appId, url){
	$('body').desktop('opennew',{
		id:appId,
		url:url
	});
}
//每个应用禁用右键
function stop(){
return false;
}
document.oncontextmenu=stop; 

$(function(){
	//解决IE下IFRAME里面的input无法获得光标的问题。
	var inputSample = $('<input norender="true" type="text" style="width:0;height:0;overflow:hidden;background:transparent;border:none;position:absolute;top:0" />')
	$('body').append(inputSample);
	inputSample.focus();
	inputSample.hide();
	//使用管理界面的应该的loading
	// var ajaxloading = $('<div class="progressBar"></div>');
	// if ($('body').find('.innerbody').index()>0) {
		// $('body').ajaxStart(function () {
			// ajaxloading.appendTo('body');
		// }).ajaxStop(function () {
			// $('body').find('.progressBar').remove();
		// });
	// }
	
	// loading html
	var _loadingHtml = '<div id="_loading" style="display:none;"><span class="loading"></span>数据载入中,请稍侯...</div>';
	$('body').append(_loadingHtml);
	$('#_loading').ajaxSend(function(evt, request, settings){
		$(this).show();
	}).ajaxStop(function(){
		$(this).hide();
	});
	
	// 扩展功能 2012-03-30
	try{
		$.extend($.fn.validatebox.defaults.rules, {
			codeValidate:{
				validator: function(value, param) {
					var reg = /^[A-Za-z0-9\._\s-]*$/;
					return reg.exec(value);
				},
				message: '支持英文,数字,空格,下划线,中划线,点号'
			},
			
			nameValidate:{
				validator: function(value, param) {
					var reg = /^[-0-9a-zA-Z_\u4e00-\u9fa5\s\.\(\)()]{1,}$/;
					return reg.exec(value);
				},
				message: '支持中文,英文,数字,空格,括号,下划线,中划线,点号'
			},
			
			telValidate:{
                validator:function (value, param) {
					var telReg = /^(\d{3,4}-)?\d{7,8}(-\d{1,4})?$/;
					var mobileReg = /^0{0,1}(13[0-9]|14[0-9]|15[0-9]|18[0-9])[0-9]{8}$/;
                    return telReg.exec(value)||mobileReg.exec(value);
                },
                message:'请输入规则的电话或手机号码'
            }
		});
	}catch(e){
		//
	}
	//劫持短链
	$('body').on('click','a',function(e){
		
		var href = $(this).attr('href');
		
		if (/eln3.so/g.test(href)||/eln2.so/g.test(href)||/eln.so/g.test(href)) {
			e.preventDefault();
			
			if (href.match(/eln3.so\/(\w*)/)!=null) {
				var param = href.match(/eln3.so\/(\w*)/)[1]
			}
			if (href.match(/eln2.so\/(\w*)/)!=null) {
				var param = href.match(/eln2.so\/(\w*)/)[1]
			}
			if (href.match(/eln.so\/(\w*)/)!=null) {
				var param = href.match(/eln.so\/(\w*)/)[1]
			}
			
			$.ajax({
				url		: '/sl-svc/ShortLink/getShortLinkInfoByCode?shortLinkCode='+param,
				type	: 'get',
				success	: function(d){
					if ( d.applicationCode && d.originalUrl && d.applicationCode!='' && d.originalUrl!='') {
						$.fn.desktop = window.parent.$.fn.desktop;
						$(window.parent.document).find('body').desktop('openwin',{appCode:d.applicationCode,url:d.originalUrl,iframe:true});
					} else {
						window.open(href,'_blank');
					}
				},
				error	: function(){
					window.open(href,'_blank');
				}
			})
		}
	})
});

/* @ webos 4.1新功能以及兼容解决方法;
 * @Author	: 罗志华 
 * @Date	: 2012/11/26
 */
try {
	// 域名(跨域问题)
	var domain = document.location.host, regexp = /[^\.]{1,}\.[^\.]{1,5}$/;
		document.domain = domain.match(regexp) || domain;
} catch (e) {}


// 关闭当前widgets或app;
window.closeApp = 
window.closeWidget = function(){
	window.frameElement.execute("close");
}

// 重新载入当前widgets或app;
window.reload = function(){
	window.frameElement.execute("reload");
} 