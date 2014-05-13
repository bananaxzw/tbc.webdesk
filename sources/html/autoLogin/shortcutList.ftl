<ul>
<#list deskItemList as userDeskItem>
    <li
        <#if deskItemId?? && deskItemId !=''>
            <#if deskItemId == userDeskItem.userDeskItemId>
                    class="cur"
            </#if>
        <#else>
            <#if userDeskItem_index ==0>
                    class="cur"
            </#if>
        </#if>
                    sc-id="${userDeskItem.userDeskItemId!}" app-id='${userDeskItem.applicationId!}'><span
            title="${userDeskItem.userDeskItemName!}">${userDeskItem.userDeskItemName!}</span></li>
</#list>
</ul>