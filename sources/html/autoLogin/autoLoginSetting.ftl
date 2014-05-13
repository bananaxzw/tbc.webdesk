<#list otherSettingList as otherSetting>
<tr>
    <td width="80" align="right" valign="top" style="color:#ABABAB"><#if otherSetting.notNull>
        <i>*</i></#if>${otherSetting.paramLabel!}：
    </td>
    <td>
        <div class="scform_cell">
            <input type="hidden" name="appOtherSettingId" value="${otherSetting.appOtherSettingId!}"
                   class="${otherSetting.appOtherSettingId!}">
        <#--valueId 第二轮load时填入，可能为空-->
            <input type="hidden" name="valueId" class="${otherSetting.appOtherSettingId!}">
            <#if (otherSetting.optionList?? &&otherSetting.optionList?size>0)>
                <select name="paramNameValue" class="${otherSetting.appOtherSettingId!}">
                    <#list otherSetting.optionList as option>
                        <option value="${option.value!}">${option.text!}</option>
                    </#list>
                </select>
            <#else>
                <input <#if otherSetting.notNull>required</#if> name="paramNameValue"
                       class="${otherSetting.appOtherSettingId!}" label="${otherSetting.paramLabel!}"
                    <#if otherSetting.paramType =='password'>
                       type="password"
                    <#else >
                       type="text"
                    </#if>
                        />
            </#if>
            <em class="sctip_right hide"></em>
        </div>
        <div class="scform_cell"><span class="sctip_normal hide"></span></div>
    </td>
</tr>
</#list>
