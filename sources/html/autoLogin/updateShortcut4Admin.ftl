<#assign comppath="/webos/" />
<script type="text/javascript" src="${ctx!}/js/tbc_common.js"></script>
<div class="mscmain">
    <div class="sctit_tips mstit_cell">
        <div class="mstit_cell_left"><b>基本设置</b></div>
        <div class="mstit_cell_right"><span class="sctip_normal">快捷方式的图标建议为48*48像素的透明PNG图片。</span></div>
    </div>
    <form id="updateShortcutForm">
        <input type="hidden" name="appId" value="${appId!}">
        <input type="hidden" name="settingId" value="${settingId!}">
        <input type="hidden" name="deskItemId" value="${deskItemId!}">

        <div class="scdialog_panel">
            <div class="scdialog_main">
                <table class="scform" style="font-size:12px">
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>应用名称：</td>
                        <td>
                            <div class="scform_cell"><input required length="10" type="text" name="appName"
                                                            pattern="appName"
                                                            value="${appName!}"
                                                            label="应用名称"/><em
                                    class="sctip_right hide"></em></div>
                            <div class="scform_cell"><span class="sctip_normal">应用名称长度请控制在10字以内</span></div>
                        </td>
                    </tr>

                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>首页地址：</td>
                        <td>
                            <div class="scform_cell"><input required pattern="url" label="首页地址" name="defaultUrl"
                                                            value="${defaultUrl!}"
                                                            type="text"/><em
                                    class="sctip_right hide"></em></div>
                            <div class="scform_cell"><span class="sctip_normal">请输入对应的首页URL地址</span></div>
                        </td>
                    </tr>
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i id="accessUrlItem" <#if needSet?? && !needSet>style="display: none;"</#if> >*</i>登录地址：</td>
                        <td>
                            <div class="scform_cell"><input<#if needSet?? && needSet> required</#if> pattern="url"
                                                                                      label="登录地址" name="accessUrl"
                                                                                      value="${accessUrl!}"
                                                                                      type="text"/><em
                                    class="sctip_right hide"></em></div>
                            <div class="scform_cell"><span class="sctip_normal">请输入登录提交的URL地址</span></div>
                        </td>
                    </tr>
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB">显示设置：</td>
                        <td>
                            <div class="scform_cell"><label><input type="checkbox" name="showInUserDesk"
                                                                   value="true"
                            <#if showInUserDesk?? && showInUserDesk>
                                                                   checked="checked" </#if>/><b>是否显示到学员桌面</b></label><span
                                    style="color:#999">(勾选后，学员桌面将出现该快捷方式)</span></div>
                        </td>
                    </tr>
                    <tr id="appCodeRow">
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>应用编号：</td>
                        <td>
                            <div class="scform_cell">
                                <input name="appCode" type="hidden" value="${appCode!}">
                            ${appCode!}
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="scdialog_side">
                <div class="scicon_panel"><img alt="快捷方式图标" id="iconimg"
                                               src="${iconUrl!}"/>
                </div>
                <button type="button" class="editsc_btn">修改图标</button>
            </div>
            <div class="scupload_panel" style="display:none;">
                <p style="text-align:right"><a href="javascript:void(0)">取消</a></p>

                <div class="scuploader">
                    调用上传组件，宽度设置为590，上传成功后，回调函数最后执行：
                    <code style="display:block">$('.scicon_panel img').attr('src',新图片的访问地址);<br/>$('.mscsavebtn').removeClass('mscdisbtn');<br/>$('.scupload_panel').remove();</code>
                </div>
            </div>
        </div>
        <input type="hidden" name="needSet" value="${(needSet?string)!}">

        <div class="sctit_tips mstit_cell" style="padding:5px 8px;">
            <div class="mstit_cell_left" style="line-height:21px;"><b>自动登录</b></div>
            <div class="mstit_cell_right" id="msLgSwitch"><span
                    class="msSwitch <#if needSet?? && needSet>msSwitchCur</#if>">启用</span><span
                    class="msSwitch <#if needSet?? && !needSet>msSwitchCur</#if>">禁用</span></div>
        </div>
        <div style="padding:10px 0" id="msMainLoader"></div>

    </form>
</div>


<div class="mscbtnbar">
    <div class="scabcenter">
        <div class="scabcenter_wrap">
            <div class="scabcenter_inner">
                <button type="button" class="mscsavebtn" id="savebtn" onclick="submitForm()">保存</button>
                <button type="button" class="mscdelbtn" onclick="removeShortcut()">删除</button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(function () {
        initValidate('updateShortcutForm');
    <#--修改图片-->
        $('.editsc_btn').click(function () {
            $('.scupload_panel').show().find('.scuploader').html('').load('elos.toUpload.do?widthFlash=590');
        });
    <#--取消-->
        $('.scupload_panel').on('click', 'p a', function (e) {
            e.preventDefault();
            $(this).parents('.scupload_panel').hide();//(正式开发时取消这里的注释删除这说明文字).find('.scuploader').remove();
        });
    <#--在textarea中键入文字，提示信息会隐藏-->
        $('textarea.optionTextarea').live('keyup', function () {
            var txt = $(this).val();
            $(this).next('div.msSitemTxt').toggleClass('hide', txt.length > 0);

        });

        if ($('input[name=needSet]').val() === 'true') {
            $('#msMainLoader').load('elos.toShortcutSet.do?appId=${appId!}');
        }

        $('#msLgSwitch span').click(function () {
            $('#msLgSwitch span').removeClass('msSwitchCur');
            $(this).addClass('msSwitchCur');
            var idx = $(this).index();
            var accessUrlObj = $('input[name=accessUrl]');
            switch (idx) {
                case 0:
                    if ($('#msMainLoader').html() == '') {
                        $('input[name=needSet]').val('true');
                        $('#msMainLoader').load('elos.toShortcutSet.do?appId=${appId!}');
                        if (accessUrlObj.attr('required') == undefined) {
                            $('#accessUrlItem').show();
                            accessUrlObj.attr('required', 'required');
                        }
                    }
                    break;
                case 1:
                    $('input[name=needSet]').val('false');
                    $('#msMainLoader').html('');
                    if (accessUrlObj.attr('required') != undefined) {
                        accessUrlObj.removeAttr('required');
                        $('#accessUrlItem').hide();
                    }
                    break;
            }
        })
    });

    function removeShortcut() {
        $.tbcmsg({
            msg:'<p class="dialog-msg">删除后，当前快捷方式将从所有用户的桌面消失，确定要删除吗？</p>',
            onOk:function () {
                $.ajax({
                    url:'elos.removeAdminShortcut.do?deskItemId=${deskItemId!}',
                    type:'POST',
                    success:function () {
                        var li = $('body').find(".prgico .app[data-appid='${appId!}']")
                        if (li.size() > 0) {
                            li.remove();
                            $('body').desktop('itemSequence', $('div.desktop').first());
                        }
                        loadShortcutList("");
                    }
                })

            }
        })
    }

    function submitForm() {
        if (validateForm('updateShortcutForm')) {
            var data = $('#updateShortcutForm').serializeArray();

            var userDeskId = $('.desktop .desktop-panel').first().data('userDeskId');
            if (userDeskId) {
                data.push({
                    name:'userDeskId',
                    value:userDeskId
                })
            }
            data.push({
                name:'iconUrl',
                value:$('.scicon_panel img').attr('src')
            })

            var dataObj = formatArrayToObject(data);
            if (dataObj.showInUserDesk == undefined) {//是否显示到学员界面
                data.push({
                    name:'showInUserDesk',
                    value:false
                })
            }
            //修正url格式
            if (dataObj.accessUrl) {
                var scUrl = dataObj.accessUrl;
                if (/^(http|https|ftp):\/\//.test(scUrl) == false) {
                    scUrl = 'http://' + scUrl;
                }
                dataObj.accessUrl = scUrl;
                data.push({
                    name:'fixedAccessUrl',
                    value:scUrl
                })
            }
            //修正url格式
            if (dataObj.defaultUrl) {
                var defaultUrl = dataObj.defaultUrl;
                if (/^(http|https|ftp):\/\//.test(defaultUrl) == false) {
                    defaultUrl = 'http://' + defaultUrl;
                }
                dataObj.accessUrl = defaultUrl;
                data.push({
                    name:'fixedDefaultUrl',
                    value:defaultUrl
                })
            }

            $.ajax({
                url:'elos.saveShortcut4Admin.do',
                type:'POST',
                data:data,
                dataType:'json',
                async:false,
                success:function (d) {
                    var itemObj = $("div.desktop").first().find("li[data-appid='${appId!}']");
                    var appData = $.extend(itemObj.data("appData"), {
                        itemType:'ICON',
                        userDeskItemName:dataObj.appName,
                        openType:"NEW_PAGE",
                        homePageUrl:dataObj.accessUrl,
                        applicationIconUrl:dataObj.iconUrl,
                        windowInitialType:"MAX"
                    })

                    var origNeedSet = '${(needSet?string)!}';
                    if (origNeedSet != dataObj.needSet) {
                        appData.needSet = dataObj.needSet === 'true' ? true : false;
                    }

                    itemObj.data('appData', appData);
                    itemObj.find('a').attr('title', dataObj.appName);
                    if (dataObj.needSet === 'true') {
                        itemObj.find('a').attr('href', dataObj.accessUrl);
                    } else {
                        itemObj.find('a').attr('href', dataObj.defaultUrl);
                    }
                    itemObj.find('a span').text(dataObj.appName);
                    itemObj.find('a img').attr('src', dataObj.iconUrl);
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
                        loadShortcutList(d.userDeskItem.userDeskItemId);
                    }, 2000)
                },
                beforeSend:function () {
                    $('#savebtn').addClass('mscdisbtn').attr('disabled', 'disabled');
                }
            })
        }
    }
</script>
