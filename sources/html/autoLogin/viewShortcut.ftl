<#assign comppath="/webos/" />
<script type="text/javascript" src="${ctx!}/js/tbc_common.js"></script>
<div class="mscmain">
    <div class="sctit_tips mstit_cell">
        <div class="mstit_cell_left"><b>基本设置</b></div>
        <div class="mstit_cell_right"><span class="sctip_normal">快捷方式的图标建议为48*48像素的透明PNG图片。</span></div>
    </div>
    <form id="updateShortcutForm">
        <div class="scdialog_panel">
            <div class="scdialog_main">
                <table class="scform" style="font-size:12px">
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>应用名称：</td>
                        <td>
                            <div class="scform_cell">${appName!}<em
                                    class="sctip_right hide"></em></div>
                        </td>
                    </tr>
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>访问地址：</td>
                        <td>
                            <div class="scform_cell">${defaultUrl!}<em
                                    class="sctip_right hide"></em></div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="scdialog_side">
                <div class="scicon_panel"><img alt="快捷方式图标" id="iconimg"
                                               src="${iconUrl!}"/>
                </div>
            </div>
        </div>

    <#if needSet?? && needSet>
        <!--学员管理界面-->
        <input type="hidden" name="deskItemId" value="${deskItemId!}">

        <div class="sctit_tips mstit_cell">
            <div class="mstit_cell_left"><b>自动登录设置</b></div>
        </div>
        <div class="scdialog_panel">
            <table class="scform" id="msUserPanel" style="font-size:12px"></table>
        </div>
        <div class="scform_cell"><label><input type="checkbox" name="userNeedSet"
                                               value="true" <#if userNeedSet?? && !userNeedSet>
                                               checked="checked"</#if> /><b>同意声明并开启自动登录</b></label></div>
        <div class="msLaw">
            <p>勾选开启自动登录后，当您下次通过平台访问该网站时不需要输入登录信息就会自动登录。如果不需要自动登录，则取消勾选即可。</p>
            <textarea readonly="readonly">
                            声    明
    上海时代光华教育发展有限公司尊重用户的选择，由用户自行决定是否开启自动登录。
    用户勾选开启自动登录的，系统会自动记录其用户名和密码，日后登录时可以省去繁琐的登录过程和等待时间，方便快捷。但用户一旦勾选开启自动登录，则这一选择不会因为更换电脑或浏览器而失效，因此需要用户慎重选择。
    用户一旦勾选开启自动登录，将永久有效，若需要更改，则需要进入免登管理（由桌面最后一个应用后面的“+”进入） 进行修改。
    上海时代光华教育发展有限公司将严格保护用户的登录信息不被泄露。但若由于用户个人或其他知情者故意或疏忽而导致用户信息泄露，上海时代光华教育发展有限公司不负任何相关责任。
    本声明内容的最终解释权归上海时代光华教育发展有限公司所有。
            </textarea>
        </div>
        <div class="mscTips" style="margin-bottom:10px"></div>
    </#if>
    </form>
</div>

<#if needSet?? && needSet>
<div class="mscbtnbar">
    <div class="scabcenter">
        <div class="scabcenter_wrap">
            <div class="scabcenter_inner">
                <button type="button" class="mscsavebtn" id="savebtn" onclick="submitForm()">保存</button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(function () {
        loadAutoLoginParams();
    });

    function loadAutoLoginParams() {
        $('#msUserPanel').load('elos.loadAutoLoginSetting.do?appId=${appId!}', function () {
            loadAutoLoginValues();
        })
    }

    function loadAutoLoginValues() {
        $.ajax({
            url:'elos.loadAutoLoginValues.do?deskItemId=${deskItemId!}',
            type:'POST',
            async:false,
            dataType:'json',
            success:function (d) {
                if (d && d.length > 0) {
                    setValues(d);
                }
                initValidate('updateShortcutForm');
            }
        })
    }

    function setValues(valueList) {
        for (var i = 0; i < valueList.length; i++) {
            $('.' + valueList[i].appOtherSettingId + '[name=valueId]').val(valueList[i].valueId);
            $('.' + valueList[i].appOtherSettingId + '[name=paramNameValue]').val(valueList[i].paramNameValue);
        }
    }

    function setNeedSet(value) {
        var appData = $("li[data-appid='${appId!}']").data('appData');
        appData.needSet = value;
        $("li[data-appid='${appId!}']").data('appData', appData);
    }

    function submitForm() {
        if (validateForm('updateShortcutForm')) {
            var data = $('#updateShortcutForm').serializeArray();
            var dataObj = formatArrayToObject(data);
            $.ajax({
                url:'elos.saveShortcutValue.do',
                type:'POST',
                data:data,
                dataType:'json',
                async:false,
                success:function (d) {
                    //修改用户自己的needSet
//                    setNeedSet(dataObj.userNeedSet === 'true' ? false : true);
                    setNeedSet(false);
                    var itemObj = $("div.desktop").first().find("li[data-appid='${appId!}']");
                    if (dataObj.userNeedSet === 'true') {
                        itemObj.find('a').attr('href', d.shortcutUrl);
                    } else {
                        itemObj.find('a').attr('href', d.defaultUrl);
                    }
                    $.vfdialog('follow', {
                        name:'scSkipTipDialog',
                        cls:'scSkipTip',
                        targetId:'savebtn',
                        cont:'操作成功！',
                        header:false,
                        footer:false,
                        lockScreen:false,
                        dialogBtn:false,
                        offsetY:-200
                    });

                    setTimeout(function () {
                        $.vfdialog('close', 'scSkipTipDialog');
                        loadShortcutList(d.userDeskItemId);
                    }, 2000)
                },
                beforeSend:function () {
                    $('#savebtn').addClass('mscdisbtn').attr('disabled', 'disabled');
                }
            })
        }
    }
</script>
</#if>