<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
sadadad
<%
	var id	= Request.Form("id"),
		right= Request.Form("right"),
		top	= Request.Form("top");
	
	Response.Write("{ \"right\":"+ right +", \"top\":\""+ top +"\"}");
%>