<div class="msSetPanel">
    <p class="msSetTip">提供学员在首次登录后，下次以自动登录的方式进入，注意它不适用于需要验证码登录的网站。</p>

    <div class="msSetTit"><b>基本设置</b></div>
    <table class="scform" style="font-size:12px;width:96%;margin:0 auto 10px;">

        <tr>
            <td width="130" align="right" valign="top" style="color:#ABABAB"><i>*</i>用户名属性：</td>
            <td>
                <input type="hidden" name="userParamId" value="${userParamId!}">
                <div class="scform_cell"><input id="msSetInput1" name="userParam" value="${userParam!}" required type="text"/> <em class="sctip_right hide"></em>&nbsp;&nbsp;<span
                        class="sctip_normal">目标网站中用户名的变量名</span></div>
            </td>
        </tr>
        <tr>
            <td width="130" align="right" valign="top" style="color:#ABABAB"><i>*</i>密码属性：</td>
            <td>
                <input type="hidden" name="passwordParamId" value="${passwordParamId!}">
                <div class="scform_cell"><input id="msSetInput2" name="passwordParam" value="${passwordParam!}" required type="text"/> <em class="sctip_right hide"></em>&nbsp;&nbsp;<span
                        class="sctip_normal">目标网站中密码的变量名</span></div>
            </td>
        </tr>
        <tr>
            <td width="130" align="right" valign="top" style="color:#ABABAB">额外固定参数串：</td>
            <td>
                <div class="scform_cell"><textarea cols="65" rows="5" name="extraParam">${extraParam!}</textarea></div>
            </td>
        </tr>
    </table>
    <div class="msSetTit"><b>其他参数设置</b></div>
    <div id="msSetLoader">
    </div>
    <div class="msSetAddbar">
        <button type="button" class="msSetAddBtn" onclick="loadNewParamForm();">+ 新增参数</button>
    </div>
</div>
<script type="text/javascript">
    $(function(){
        $('#msSetLoader').load('elos.loadExistsParams.do?settingId=${settingId!}',function(){
            fixParamOrder();
        });
    })
</script>
