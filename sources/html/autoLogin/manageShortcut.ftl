<div class="mscbody">
    <div class="mscwrap">
        <div class="mscwrap_inner">
            <div class="mscwrap_content">
                <div class="mscside">
                    <div class="mscsearch">
                        <input type="text" value="输入快捷方式名称搜索" id="mscsearcher"/>
                    </div>
                    <div class="msclist"></div>
                </div>
                <div id="manageShortcut">

                </div>

            </div>
            <div class="msCreateBar">
                <button type="button" class="msCreateBtn" onclick="loadCreateShortcut();">创建快捷方式</button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(function () {
        loadShortcutList('');
        $('#mscsearcher').bind({
            blur:function () {
                if ($(this).val() === '') {
                    filterShortcutList($(this.val()));
                    $(this).val('输入快捷方式名称搜索');
                }
            },
            focus:function () {
                if ($(this).val() === '输入快捷方式名称搜索')
                    $(this).val('');
            },
            keyup:function () {
                filterShortcutList($(this).val());
            }
        })
    })

    function loadShortcutList(deskItemId) {
    <#--加载快捷方式列表-->
        $('.msclist').load('elos.listUserDeskShortcut.do?isshortcut=true&dskIndex=${dskIndex!}&deskItemId=' + deskItemId, function () {
            $('.msclist li').live('click', function () {
                $('.msclist li').removeClass('cur');
                $(this).addClass('cur');
                loadUpdateShortcut($(this).attr('sc-id'));
            });
            if ($.trim($('.msclist ul').text()).length > 0) {
                $('.msclist li.cur').trigger('click');
            } else {
                $('#manageShortcut').html('<div class="scnodata"><p>你还没有创建任何快捷方式。<a href="javascript:void(0);" id="_addShortcutLink">立刻创建</a></p></div>');
                $('#_addShortcutLink').click(function(e){
                    e.preventDefault();
                    loadCreateShortcut();
                })

            }
        });
    }


    function loadUpdateShortcut(id) {
    <#--加载快捷方式修改、添加页面-->
        $('#manageShortcut').load('elos.toUpdateShortcut.do?dskIndex=${dskIndex!}&deskItemId=' + id);
    }

    function loadCreateShortcut() {
        $('.msclist li').removeClass('cur');
        $('#manageShortcut').load('elos.toCreateShortcut.do?dskIndex=${dskIndex!}');
    }


</script>