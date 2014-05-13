<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<%
	var folderName = Request.Form("folderName"),
		userDeskId = Request.Form("userDeskId"),
        json = '{"name":"'+ folderName +'","type":"FOLDER","openType":null,"roles":null,"icon":null,"height":null,"width":null,"url":null,"appId":null,"tooltips":"'+ folderName +'","referType":"APPLICATION","folderId":null,"accessTime":null,"initialType":null,"appType":null,"remind":null,"itemId":"'+ (+new Date()) +'","autorun":null,"autologin":null}';

	if(folderName && userDeskId){
		Response.Write(json.replace(/\"/ig, '\"'));
	}
%>