// 初始化所有数据转换器
;(function(){

    "use strict";

    /**
     * 数据转换器
     * @class tbc.webdesk.data.translator
     * @static
     * @type {Object}
     */
    var tbc = window.tbc,
        translator = tbc.namespace('tbc.webdesk.data.translator');

    /**
     * 角色数据转换器
     * @property {tbc.Translator} role
     * @type {tbc.Translator}
     */
    translator.roles = new tbc.Translator({
        "type"          : "type", 
        "roleCode"      : "code",
        "roleId"        : "id",
        "roleName"      : "name",
        "currentRole"   : 'current',
        "comments"      : "comments",
        "corpCode"      : null,
        "overrideType"  : null,
        "overrideId"    : null,
        "showOrder"     : null,
        "createBy"      : null,
        "createTime"    : null,
        "lastModifyBy"  : null,
        "lastModifyTime": null,
        "optTime"       : null,
        "createByCode"  : null
    });

    /**
     * 自动运行列表转换器
     * @property {tbc.Translator} autoruns
     * @type {tbc.Translator}
     */
    translator.autoruns = new tbc.Translator({
        "appRoles"              : 'roles',
        "reminderUrl"           : 'remind',
        "lastAccessTimestamp"   : 'accessTime',
        "openType"              : 'openType',
        "itemType"              : 'type',
        "applicationId"         : 'appId',
        "corpCode"              : 'corpCode',
        "userDeskItemId"        : 'id',
        "userDeskId"            : 'deskId',
        "tooltips"              : 'tooltips',
        "userDeskItemName"      : 'name',
        "applicationName"       : 'appName',
        "windowInitialType"     : 'initialType',
        "autoRun"               : 'autorun',
        "applicationIconUrl"    : 'icon',
        "preferredWidth"        : 'width',
        "preferredHeight"       : 'height',
        "homePageUrl"           : 'url',
        "referType"             : 'referType',
        "userDeskPosition"      : null,
        "position"              : null,
        "folder"                : null,
        "folderItemList"        : null,
        "userDeskItemManager"   : null,
        "shortcutUrl"           : null,
        "shortcutIconUrl"       : null,
        "openShortcutType"      : null,
        "shortcutInitType"      : null,
        "folderId"              : null,
        "userDesk"              : null,
        "applicationMiniIconUrl": null,
        "widgetUrl"             : null,
        "applicationType"       : null,
        "positionInFolder"      : null,
        "application"           : null,
        "userDeskdockItemList"  : null,
        "corpUserDeskItemName"  : null,
        "shortcut"              : null,
        "dto"                   : null,
        "createBy"              : null,
        "createTime"            : null,
        "lastModifyBy"          : null,
        "lastModifyTime"        : null,
        "optTime"               : null,
        "formObject"            : null,
        "selectedInShowSelect"  : null
    });

    /**
     * 桌面图标列表转换器
     * @property {tbc.Translator} shortcuts
     * @type {tbc.Translator}
     */
    translator.shortcuts = new tbc.Translator({
        "appRoles"              : 'roles',
        "reminderUrl"           : 'remind',
        "lastAccessTimestamp"   : 'accessTime',
        "openType"              : 'openType',
        "itemType"              : 'type',
        "applicationId"         : 'appId',
        "userDeskItemId"        : "itemId",
        "tooltips"              : 'tooltips',
        "userDeskItemName"      : 'name',
        "windowInitialType"     : 'initialType',
        "autoRun"               : 'autorun',
        "applicationIconUrl"    : 'icon',
        "preferredWidth"        : 'width',
        "preferredHeight"       : 'height',
        "homePageUrl"           : 'url',
        "referType"             : 'referType',
        "applicationType"       : 'appType',
        "folderId"              : 'folderId',
        "autologin"             : 'autologin',
        "dto"                   : null,
        "userDeskPosition"      : null,
        "position"              : null,
        "corpCode"              : null,
        "userDeskId"            : null,
        "folder"                : null,
        "applicationName"       : null,
        "folderItemList"        : null,
        "userDeskItemManager"   : null,
        "shortcutUrl"           : null,
        "shortcutIconUrl"       : null,
        "openShortcutType"      : null,
        "shortcutInitType"      : null,
        "userDesk"              : null,
        "applicationMiniIconUrl": null,
        "widgetUrl"             : null,
        "positionInFolder"      : null,
        "application"           : null,
        "userDeskdockItemList"  : null,
        "corpUserDeskItemName"  : null,
        "shortcut"              : null,
        "createBy"              : null,
        "createTime"            : null,
        "lastModifyBy"          : null,
        "lastModifyTime"        : null,
        "optTime"               : null,
        "formObject"            : null,
        "selectedInShowSelect"  : null
    });

    /**
     * 应用列表转换器
     * @property {tbc.Translator} apps
     * @type {tbc.Translator}
     */
    translator.apps = new tbc.Translator({
        "description"             : 'des',
        "openType"                : "openType",
        "itemType"                : "itemType",
        "applicationId"           : "appId",
        "applicationName"         : 'name',
        "windowInitialType"       : 'initialType',
        "targetUserDeskType"      : 'targetDeskType',
        "appCode"                 : 'appCode',
        "autoRun"                 : 'autoRun',
        "autoRunOnce"             : 'autorunOnce',
        "applicationIconUrl"      : 'icon',
        "preferredWidth"          : 'width',
        "preferredHeight"         : 'height',
        "homePageUrl"             : 'url',
        "applicationType"         : 'appType',
        "needInit"                : 'isAutoLogin',
        "applicationCategoryId"   : 'categoryId',
        "maximizable"             : 'max',
        "minimizable"             : 'min',
        "templateBasePath"        : 'basePath',
        "applicationCategoryName" : 'categoryName',
        "autologin"               : 'autologin',
        "reminderUrl"             : null,
        "corpCode"                : null,
        "applicationMiniIconUrl"  : null,
        "tooltipsSuffix"          : null,
        "projectId"               : null,
        "sinceProjectVersion"     : null,
        "appStatus"               : null,
        "resourceAccessUrl"       : null,
        "projectName"             : null,
        "initCorpDataUrl"         : null,
        "useWF"                   : null,
        "useIM"                   : null,
        "useJM"                   : null,
        "useIS"                   : null,
        "resourceAccessApp"       : null,
        "createBy"                : null,
        "createTime"              : null,
        "lastModifyBy"            : null,
        "lastModifyTime"          : null,
        "optTime"                 : null,
        "createByCode"            : null
    });

    translator.tools = translator.shortcuts;

    tbc.webdesk.data.settings = {};
    tbc.webdesk.data.shortcuts = [];
    tbc.webdesk.data.autoruns = [];
    tbc.webdesk.data.tools = [];
    tbc.webdesk.data.trays = [];
    tbc.webdesk.data.apps = {};

    /**
     * 转换应用数据的子属性
     * @property {Function} apps.valueTranslator
     * @param {String} key 子属性名称
     * @param {Any} value 子属性值
     * @param {String} which 转换成那种数据格式："fresh" | "antique";
     */
    translator.apps.valueTranslator = 

    /**
     * 转换应用数据的子属性
     * @property {Function} autoruns.valueTranslator
     * @param {String} key 子属性名称
     * @param {Any} value 子属性值
     * @param {String} which 转换成那种数据格式："fresh" | "antique";
     */
    translator.autoruns.valueTranslator = 

    /**
     * 转换应用数据的子属性
     * @property {Function} shortcuts.valueTranslator
     * @param {String} key 子属性名称
     * @param {Any} value 子属性值
     * @param {String} which 转换成那种数据格式："fresh" | "antique";
     */
    translator.shortcuts.valueTranslator = function(key, value, which) {
        switch (key) {
            case 'appRoles':
            case 'roles':
                return translator.roles.transformList(value, which);

            // no default
        }
        return value;
    };

}) ();
