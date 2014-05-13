<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<%
	var accessUrl		= Request.Form("accessUrl");
	var appName			= Request.Form("appName");
	var fixedAccessUrl	= Request.Form("fixedAccessUrl");
	var iconUrl			= Request.Form("iconUrl");
	var showInUserDesk	= Request.Form("showInUserDesk");
	var userDeskId		= Request.Form("userDeskId");
	
	if(accessUrl && appName && fixedAccessUrl && iconUrl && showInUserDesk && userDeskId){
		Response.Write("{\"result\":\"success\",\"userDeskItem\":{\"userDeskPosition\":null,\"appRoles\":[],\"reminderUrl\":null,\"lastAccessTimestamp\":null,\"openType\":\"NEW_PAGE\",\"itemType\":\"ICON\",\"position\":null,\"corpCode\":\"xiaomu209\",\"applicationId\":null,\"userDeskId\":\"4028805b3994482601399a5800c91973\",\"folderId\":null,\"autoRun\":null,\"userDeskItemId\":\"4028805b3a86517f013a87474d0b00c8\",\"userDesk\":null,\"needSet\":null,\"referType\":\"SHORTCUT\",\"shortcut\":true,\"shortcutUrl\":\"http://www.baidu.com\",\"userDeskItemManager\":null,\"userDeskItemName\":\"百度\",\"applicationIconUrl\":\"/webos/images/shortcut/default_shortcut.png\",\"applicationMiniIconUrl\":\"/webos/images/shortcut/shortcut_min.png\",\"windowInitialType\":null,\"preferredWidth\":null,\"preferredHeight\":null,\"homePageUrl\":\"http://www.baidu.com\",\"widgetUrl\":null,\"applicationName\":null,\"tooltips\":null,\"applicationType\":null,\"positionInFolder\":null,\"application\":null,\"userDeskdockItemList\":null,\"folder\":null,\"folderItemList\":null,\"corpUserDeskItemName\":\"xiaomu209:百度\",\"shortcutIconUrl\":\"/webos/images/shortcut/default_shortcut.png\",\"openShortcutType\":\"NEW_PAGE\",\"shortcutInitType\":null,\"createTime\":null,\"createBy\":null,\"lastModifyTime\":null,\"lastModifyBy\":null,\"optTime\":null,\"dto\":true,\"formObject\":false,\"selectedInShowSelect\":false}}");
	}else{
		Response.Write("{\"result\":\"缺少参数\"}");
	}
%>