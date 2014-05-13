<%@LANGUAGE="JAVASCRIPT" CODEPAGE="65001"%>
<%
	var id	= Request.Form("id"),
		right= Request.Form("right"),
		top	= Request.Form("top");
	
	Response.Write("{ \"result\":20120607, \"state\":\"success\"}");
%>