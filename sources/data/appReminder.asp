<%@Language="JavaScript" CODEPAGE="65001" %> 
<%
	var id = Request.QueryString("id");
	var number = 0;
	
	if(id=="4028805935c7addf0135c8521b89004b"){ number = 10; }
	else if(id=="4028805935c7addf0135c86aad73005a"){ number = 23; }
	else if(id=="4028805935c7addf0135c8374cfa004a"){ number = 19; }
	else if(id=="4028805935c7addf0135c878db9e0063"){ number = 5; }
	else if(id=="8a8081ec397755a201399a8e9d4d0861"){ number = 62; }
	else if(id=="4028805935c7addf0135c89d30340074"){ number = 32; }
	else if(id=="4028805935c7addf0135c86f851e005c"){ number = 12; }
	
	Response.Write('{ "result":20120607, "number":'+ number +',"data":[{"title":"第 <b> 1 </b> 条通知","url":""},{"title":"第 <b>1</b> 条通知","url":""},{"title":" 第 <b>1</b> 条通知 ","url":""}]}');

%>