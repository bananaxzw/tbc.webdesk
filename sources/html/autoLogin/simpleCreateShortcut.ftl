<#assign comppath="/webos/" />
<script type="text/javascript" src="${ctx!}/js/tbc_common.js"></script>
<div class="padding10">
    <form id="addShortcutForm">
        <div class="sctit_tips"><span class="sctip_normal">快捷方式的图标建议为48*48像素的透明PNG图片。</span></div>
        <div class="scdialog_panel">
            <div class="scdialog_main">
                <table class="scform" style="font-size:12px">
                    <tbody>
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>应用名称：</td>
                        <td>
                            <div class="scform_cell"><input required length="10" type="text" name="appName"
                                                            label="应用名称"/><em class="sctip_right hide"></em>
                            </div>
                            <div class="scform_cell"><span class="sctip_normal">应用名称长度请控制在10字以内</span></div>
                        </td>
                    </tr>
                    <tr>
                        <td width="80" align="right" valign="top" style="color:#ABABAB"><i>*</i>访问地址：</td>
                        <td>
                            <div class="scform_cell"><input required pattern="url" label="访问地址" name="accessUrl"
                                                            type="text"/><em class="sctip_right hide"></em>
                            </div>
                            <div class="scform_cell"><span class="sctip_normal">请输入正确的URL地址</span></div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="scdialog_side">
                <div class="scicon_panel"><img id="iconimg" alt="快捷方式图标" src="${comppath}images/shortcut/default_shortcut.png"></div>
                <button type="button" class="editsc_btn">修改图标</button>
            </div>
            <div class="scupload_panel" style="display:none;">
                <p style="text-align:right"><a href="javascript:void(0)">取消</a></p>

                <div class="scuploader">
                    调用上传组件，宽度设置为440，上传成功后，回调函数最后执行：
                    <code style="display:block">$('.scicon_panel img').attr('src',新图片的访问地址);<br>$('.scupload_panel').remove();</code>
                </div>
            </div>
        </div>
        <div class="scabcenter">
            <div class="scabcenter_wrap">
                <div class="scabcenter_inner">
                    <button type="button" class="scdialog_btn1" onclick="submitForm();">保存</button>
                    <button type="button" class="scdialog_btn2" onclick="closeDialog();">取消</button>
                </div>
            </div>
        </div>
    </form>
</div>

<script type="text/javascript">
    $(function () {
        initValidate('addShortcutForm');
    <#--修改图片-->
        $('.editsc_btn').click(function () {
            $('.scupload_panel').show().find('.scuploader').html('').load('elos.toUpload.do?widthFlash=590');
        });
    <#--取消-->
        $('.scupload_panel').on('click', 'p a', function (e) {
            e.preventDefault();
            $(this).parents('.scupload_panel').hide();//(正式开发时取消这里的注释删除这说明文字).find('.scuploader').remove();
        });

    });


    function submitForm() {
        if (validateForm('addShortcutForm')) {
            var data = $('#addShortcutForm').serializeArray();

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

            $.ajax({
                url:'elos.simpleAddShortcut.do',
                type:'POST',
                data:data,
                dataType:'json',
                async:false,
                success:function (d) {
                    d = $.extend(d, {
                        itemType:'ICON',
                        userDeskItemName:dataObj.appName,
                        openType:"NEW_PAGE",
                        homePageUrl:dataObj.accessUrl,
                        applicationIconUrl:dataObj.iconUrl,
                        windowInitialType:"MAX",
                        userDeskItemId:d.uniqueId,
                        applicationMiniIconUrl:'/webos/images/shortcut/shortcut_min.png'
                    })
                    $('body').desktop('createItem', {data:d});
                    $('#window_shortcutmanage').find('a.window_reload').trigger('click');
                    $.tbcdialog('close');
                }
            })
        }
    }

    function closeDialog() {
        $.tbcdialog('close');
    }
</script>