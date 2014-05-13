<%@ page language="java" contentType="application/json; charset=utf-8" pageEncoding="utf-8"%>
<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>
<%
	String folderName = request.getParameter("folderName").intern();
	String userDeskId = request.getParameter("userDeskId").intern();
	if(folderName!="" && userDeskId!=""){
		out.print("{\"userDeskPosition\":null,\"appRoles\":[],\"reminderUrl\":null,\"lastAccessTimestamp\":null,\"openType\":null,\"itemType\":\"FOLDER\",\"position\":4171,\"corpCode\":\"xiaomu209\",\"applicationId\":null,\"userDeskId\":\"4028805b3994482601399a5800c91973\",\"folderId\":null,\"autoRun\":null,\"userDeskItemId\":\"4028805c3a86551b013a872b6f30022c\",\"userDesk\":null,\"needSet\":null,\"referType\":\"LINK\",\"shortcut\":null,\"shortcutUrl\":null,\"userDeskItemManager\":null,\"userDeskItemName\":\""+ folderName +"\",\"applicationIconUrl\":null,\"applicationMiniIconUrl\":null,\"windowInitialType\":null,\"preferredWidth\":null,\"preferredHeight\":null,\"homePageUrl\":null,\"widgetUrl\":null,\"applicationName\":null,\"tooltips\":null,\"applicationType\":null,\"positionInFolder\":0,\"application\":null,\"userDeskdockItemList\":null,\"folder\":null,\"folderItemList\":null,\"corpUserDeskItemName\":\"xiaomu209:"+ folderName +"\",\"shortcutIconUrl\":null,\"openShortcutType\":null,\"shortcutInitType\":null,\"createTime\":null,\"createBy\":null,\"lastModifyTime\":null,\"lastModifyBy\":null,\"optTime\":null,\"dto\":true,\"formObject\":false,\"selectedInShowSelect\":false}");
	}else{
		out.print("{\"error\":\"确少参数(folderName或userDeskId)...\"}");
	}
%>