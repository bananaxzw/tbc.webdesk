<%@ page language="java" contentType="application/json; charset=utf-8" pageEncoding="utf-8"%>
<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %> 
<%
	String id	= request.getParameter("id").intern();
	String right= request.getParameter("right").intern();
	String top	= request.getParameter("top").intern();
	
	out.print("{ \"result\":20120607, \"state\":\"success\"}");
%>
