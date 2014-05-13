<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <script type="text/javascript" src="/webos/js/jquery.js"></script>
    <title>${appName!}</title>
    <script type="text/javascript">
        <#if paramList??>
        $(function () {
            $('#postForm').submit();
        })
        </#if>
    </script>
</head>
<body>
<#if paramList??>
<form id="postForm" method="post" action="${accessUrl!}">
    <#list paramList as param>
        <input type="hidden" name="${param.paramName!}" value="${param.paramValue!}">
    </#list>
</form>
<#else>
 <p>该快捷方式已被管理员删除，无法继续访问目标网页。</p>
</#if>
</body>
</html>