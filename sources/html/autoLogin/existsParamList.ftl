<#list otherSettingList as otherSetting>
<div class="msSetItemPanel">
    <div class="msSetTit"><b>参数</b></div>
    <input type="hidden" name="paramId" value="${otherSetting.appOtherSettingId!}">

    <div class="msSetCont">
        <table class="scform" style="font-size:12px;">
            <tr>
                <td width="120" align="right" valign="top" style="color:#ABABAB"><i>*</i>标题：</td>
                <td>
                    <div class="scform_cell"><input required type="text" name="paramLabel"
                                                    value="${otherSetting.paramLabel!}"/> <em
                            class="sctip_right hide"></em>&nbsp;&nbsp;<span
                            class="sctip_normal">目标网站中参数的称呼</span></div>
                </td>
            </tr>
            <tr>
                <td width="120" align="right" valign="top" style="color:#ABABAB"><i>*</i>属性：</td>
                <td>
                    <div class="scform_cell"><input type="text" required name="paramName"
                                                    value="${otherSetting.paramName!}"/> <em
                            class="sctip_right hide"></em>&nbsp;&nbsp;<span
                            class="sctip_normal">目标网站中参数的变量名</span></div>
                </td>
            </tr>
            <tr>
                <td width="120" align="right" valign="top" style="color:#ABABAB">选择项定义：</td>
                <td>
                    <div class="scform_cell"><textarea cols="60" rows="3" name="selectOption"
                                                       class="optionTextarea">${otherSetting.selectOption!}</textarea>

                        <div class="msSitemTxt <#if otherSetting.selectOption?? && otherSetting.selectOption!=''>hide</#if>"
                             onclick="focusTextarea(this);">
                            如不输入，前端将以输入框出现；若输入内容，前端将以下拉形式出现，请按照key1:value1,key2:value2格式来输入内容
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td width="120" align="right" valign="top" style="color:#ABABAB">是否必填：</td>
                <td>
                    <div class="scform_cell">
                        <label><input type="radio" <#if otherSetting.notNull?? && otherSetting.notNull> checked </#if>
                                      value="true"/>是</label>
                        <label><input type="radio" <#if otherSetting.notNull?? && !otherSetting.notNull> checked </#if>
                                      value="false"/>否</label></div>
                </td>
            </tr>
        </table>
    </div>
    <span class="option" onclick="removeParamForm(this);">×删除</span>
</div>
</#list>