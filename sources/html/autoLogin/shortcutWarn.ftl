<script type="text/javascript" src="${ctx!}/js/tbc_common.js"></script>
<#if deskItemId??>
<form id="autoLoginSetting">
    <div id="scWarnDialogPanel" style="position:relative;zoom:1;height:250px;">
        <input type="hidden" name="deskItemId" value="${deskItemId!}">

        <div style="padding:20px 20px 0;height:192px;overflow:auto;">
            <table class="scform" style="font-size:12px;">

                <tr id="msUserPanel">
                    <td width="60" align="right" valign="top" style="color:#ABABAB">&nbsp;</td>
                    <td>
                        <div class="scform_cell" style="overflow:hidden;zoom:1;">
                            <textarea cols="45" readonly="readonly" rows="3">
                                声    明
    上海时代光华教育发展有限公司尊重用户的选择，由用户自行决定是否开启自动登录。
    用户勾选开启自动登录的，系统会自动记录其用户名和密码，日后登录时可以省去繁琐的登录过程和等待时间，方便快捷。但用户一旦勾选开启自动登录，则这一选择不会因为更换电脑或浏览器而失效，因此需要用户慎重选择。
    用户一旦勾选开启自动登录，将永久有效，若需要更改，则需要进入免登管理（由桌面最后一个应用后面的“+”进入） 进行修改。
    上海时代光华教育发展有限公司将严格保护用户的登录信息不被泄露。但若由于用户个人或其他知情者故意或疏忽而导致用户信息泄露，上海时代光华教育发展有限公司不负任何相关责任。
    本声明内容的最终解释权归上海时代光华教育发展有限公司所有。</textarea>
                        </div>
                        <div class="scform_cell"><label><input id="scLawCheckbox" name="userNeedSet" type="checkbox"
                                                               checked="checked" value="true"/>同意声明并开启自动登录</label>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="scabcenter"
             style="position:absolute;width:100%;left:0;bottom:0;padding-bottom:0;background:#dedede">
            <div class="scabcenter_wrap">
                <div class="scabcenter_inner">
                    <button class="scWarnCfm" id="scWarnCfmLink" type="button" onclick="submitForm()">保存并登录</button>

                    <div class="scWarnskip"><a href="javascript:void(0);" target="_blank" id="scWarnskipLink">不设置自动登录，直接进入
                        &gt;&gt;</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
<script>
    $(function () {
        //跳过提示
        $('#scWarnskipLink').hover(function () {
            $.vfdialog('follow', {
                name:'scSkipTipDialog',
                cls:'scSkipTip',
                targetId:'scWarnskipLink',
                cont:'若需要修改自动登录设置，请点击桌面“+”进行设置。',
                header:false,
                footer:false,
                lockScreen:false,
                dialogBtn:false,
                offsetY:10
            })
        }, function () {
            $.vfdialog('close', 'scSkipTipDialog')
        })

        $('#scWarnskipLink').click(function (e) {
            e.preventDefault();

            $.ajax({
                url:'elos.skipAutoLogin.do?deskItemId=${deskItemId!}',
                type:'post',
                async:false,
                success:function(){
                    setNeedSet(false);
                    openUrlBlank('${defaultUrl!'${accessUrl!}'}')
                    $.vfdialog('close');
                }
            })

        });

        loadAutoLoginParams();
    })

    function loadAutoLoginValues() {
        var _r = new Date().getTime();
        $.ajax({
            url:'elos.loadAutoLoginValues.do?deskItemId=${deskItemId!}&_r='+_r,
            type:'POST',
            async:false,
            dataType:'json',
            success:function (d) {
                if (d && d.length > 0) {
                    setValues(d);
                }
                initValidate('autoLoginSetting');
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

    function loadAutoLoginParams() {
        $.ajax({
            url:'elos.loadAutoLoginSetting.do?appId=${appId!}',
            type:'GET',
            dataType:'html',
            success:function (html) {
                $('#msUserPanel').before(html);
                loadAutoLoginValues();
            }
        })
    }

    function submitForm() {
        if ($('#scLawCheckbox').prop('checked')) {
            if (validateForm('autoLoginSetting')) {
                var data = $('#autoLoginSetting').serializeArray();
                $.ajax({
                    url:'elos.saveShortcutValue.do',
                    type:'POST',
                    data:data,
                    dataType:'json',
                    async:false,
                    success:function (d) {
                        openUrlBlank(d.shortcutUrl);
                        var itemObj = $("li[data-appid='${appId!}']");
                        var appData = itemObj.data('appData');
                        appData.homePageUrl = d.shortcutUrl;
                        itemObj.data('appData', appData);
                        itemObj.find('a').attr('href', d.shortcutUrl);
                        $.vfdialog('close');
                        setNeedSet(false);
                    }
                })
            }
        } else {
            e.preventDefault();
            $.vfdialog('autoClose', {
                name:'scCfmErrorDialog',
                cont:'请先同意声明的条款。'
            })
        }

    }

    function openUrlBlank(url) { //window.open会被浏览器拦截
        window.open(url, '_blank')
    }

</script>
<#else >
<div style="position:relative;zoom:1;height:250px;">
    <div style="padding:20px 20px 0;height:192px;overflow:auto;">
        <p>该快捷方式已被管理员删除，无法继续访问目标网页。</p>
    </div>
</div>
</#if>