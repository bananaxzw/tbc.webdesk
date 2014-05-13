/*
 * Class:  tb.Folder (文件夹) ##########################################
 *
 * @Copyright    : 时代光华
 * @Author        : 罗志华
 * @mail         : mail@luozhihua.com
 *
 */

tbc.Folder = function(settings) {

    "use strict";

    var SELF = tbc.self(this, arguments);

        if (settings) {
            settings.icon = "icon-folder_classic_opened";
            settings.minimizable = true; // 可最小化
            settings.refreshable = true; // 可刷新
            settings.helpable = true;    // 有帮助内容
            settings.minWidth =  520;
            settings.minHeight = 380;
        }

        settings.loadType="html";
        SELF.extend([tbc.Window,settings]);
        SELF.packageName = "tbc.Folder";

    var defaults = {
          orderBy     : "name"
        , name        : ""
        , id        : ""
        , viewState : "list" // [list, icon, content]

    },
    options = tbc.extend({}, defaults, settings)
    ;

    var folderViewer = $(
        '<div class="tbc-folder-viewer">' +
        '    <div class="tbc-folder-directory" _title="目录结构"></div>' +
        '    <div class="tbc-folder-container" _title="文件夹内容"></div>' +
        '    <div class="tbc-folder-previewer" _title="文件预览"></div>' +
        '</div>'),
        directory = $(".tbc-folder-directory", folderViewer),
        container = $(".tbc-folder-container", folderViewer),
        previewer = $(".tbc-folder-previewer", folderViewer);

    SELF.append(folderViewer);

    SELF.classType    = "folder";

    SELF.svid      = options.userDeskItemId;
    SELF.data      = options.data; // 文件夹数据
    SELF.container = container;

    /* 从缓存获取数据 */
    var tableName = ["shortcuts", SELF.packageName, SELF.svid].join("_"),
        table     = tbc.jdc.getTable(tableName) || tbc.jdc.createTable(tableName);

    var data        = table ? tbc.jdc.select(table, "all") : null;

    SELF.saveData = function(_data) {
        data = data || [];
        _data = tbc.isArray(_data) ? _data : [_data];
        var a = data;
        $.each(_data, function(i, d) {
            var isExist;
            $.each(a, function() {
                if (this.userDeskItemId === d.userDeskItemId) {
                    isExist = true;
                }
            });
            isExist && data.push(d);
        });

        tbc.jdc.set(tableName, options.userDeskItemId, data);
    };

    // 接受图标拖动
    SELF.addEvent({
        "open": function() {
            desktop.iconsDrager && desktop.iconsDrager.addContainer(container);
        },
        "afterClose" : function() {
            desktop.iconsDrager && desktop.iconsDrager.removeContainer(container);
        }
    });

    // 重命名
    SELF.rename = function(newName) {

        var ui = SELF.openModalDialog({
                    width:350,
                    height:200,
                    name: i18n('v4.js.rename'), //"重命名",
                    loadType:"html"
                }, tbc.Window).show(),
            wrap    = $('<div style="padding:32px;"></div>'),
            name    = SELF.name(),
            input   = $('<input class="tbc-inputer" type="text" value="'+ name +'" style="width:130px;"/>')
                .focus(function() {
                    this.select();
                    tips.html(tips.attr("title")).css({color:"#888"});
                })
                .keyup(function(event) {
                    if (event.keyCode === 13) {
                        save();
                        return false;
                    }
                }),
            tips    = $('<div title="'+ i18n('v4.js.chars_ZH_EN_limit', 5, 10) +'" style="clear:both; margin-bottom:1em; color:#888;">'+ i18n('v4.js.chars_ZH_EN_limit', 5, 10) +'</div>'),
            submit    = new tbc.Button({ border:true, text: i18n('v4.js.save'), icon:"icon-check", click:function() {save();} }),
            cancel    = new tbc.Button({ border:true, text:i18n('v4.js.cancel'), icon:"icon-close", click:function() {ui.close();} }),
            save     = function() {
                var folderName1 = $.trim(input.val()),
                    folderName    = tbc.substr(folderName1, 10),
                    niceName    = folderName + "(" + folderName1.replace(folderName,"")+")",
                    folderId  = options.folderId||options.userDeskItemId,
                    desktopId = desktop.current().ui.attr("svid");

                if (folderName1.length>folderName.length) {
                    tips.shake().html(i18n('v4.js.folderNameLengthOut') + i18n('v4.js.chars_ZH_EN_limit', 5, 10)).css({color:"red"});
                } else {
                    $.ajax ({
                          url  : URLS["renameFolder"]
                        , type : "post"
                        , data : {"_ajax_toKen":"elos", folderName:folderName, userDeskId:desktopId, userDeskItemId:folderId }
                        , dataType   : "JSON"
                        , beforeSend : function() { ui.lock("loading", i18n('v4.js.saving')); }
                        , complete : function() { ui.unlock("loading"); }
                        , error    : function() {}
                        , success  : function(json) {
                            if ((json && json.success) || (typeof json==="string" && $.trim(json).toLowerCase() === "true")) {
                                SELF.name(folderName);
                                ui.close();
                            }
                        }
                    });
                }
            };

            submit.ui.css({marginRight:"10px"});
            submit.depend(ui);
            cancel.depend(ui);

            ui.addEvent({
                "afterClose": function() {
                    wrap.remove();
                    input.remove();
                    tips.remove();
                    submit.DESTROY();
                    ui = name = input = wrap = submit = save = null;
                },
                focus:function() {
                    input.focus();
                }
            });

            wrap.appendTo(ui.container).append(input).append(tips).append(submit.ui).append(cancel.ui);
            ui.blur();
            input.focus();
    };

    SELF.viewAs = function(state) {
        switch(state) {
            case "list":
                SELF.viewAsList();
                break;
            case "icon":
                SELF.viewAsIcon();
                break;
        }
    };

    SELF.viewAsList = function() {

    };

    SELF.viewAsIcon = function(depend) {
        container.empty();
        $.each(data, function(i, s) {
            var s = new tbc.Shortcut(s).appendTo(SELF);
                s.depend(SELF);
                s=null;
        });
        return SELF;
    };

    SELF.viewAsContent = function() {

    };

    // 保存排序
    SELF.saveOrder = function() {
        var list = [];
        SELF.container.children(".tbc-shortcut").each(function() {
            list.push(this.getAttribute("_shortcutId"));
        });

        $.ajax({
              url        : URLS["orderFolderShorcuts"]
            , type        : "post"
            , dataType    : "json"
            , data        : {folderid:SELF.svid, items:list.join(",")}
            , complete    : function() {}
            , error        : function() {}
            , success    : function(json) {
                if (json && json.result === "success") {

                }
            }
        });
        SELF.shortcutSequence = list;

        return SELF;
    };

    // 删除
    SELF.del = function() {
        tbc.Folder.del(SELF.svid, function(r) {
            if (r.result) {
                SELF.close();
            }
        });
    };

    // 刷新
    SELF.refresh = function () {

    };

    // 加载数据
    SELF.load = function () {

    };

    // 文件夹图标
    SELF.name(options.folderName||options.userDeskItemName||"");


    // 开启划选
    SELF.container.selectArea({
        item            : ".tbc-shortcut",
        //exclude            : ".tbc-folder-shortcut",
        classSelected    : "tbc-shortcut-selected",
        event             : {
            select    : function() {},
            unselect: function() {}
        }
    });


    /* 如果没有缓存的数据,则从服务器端加载 */
    if (!data) {
        tbc.Folder.load(options.folderId || options.userDeskItemId, function(json) {
            data = json||{};
            SELF.viewAsIcon(true);
            SELF.triggerEvent("folderLoad", json);

            $.each(data, function() {
                tbc.jdc.set(tableName, this.userDeskItemId, this);
            });
        });
    }else{
        SELF.viewAsIcon(true);
    }

    var rename = new tbc.Button({
            icon   : "icon-tag_edit",
            text   : i18n('v4.js.rename'), //"重命名",
            border : false,
            click  : function() { SELF.rename(); }
        });
        rename.depend(SELF);
    SELF.tools.add("rename",rename);

    SELF.addEvent ({
        "destroy" : function() {
            SELF = folderViewer = directory = container = previewer = data = table = tableName = rename = null;
        }
    });
};

/* 静态方法: 加载数据 */
tbc.Folder.load = function(id, cb) {
    if (tbc.isFunction(cb)) {

        $.ajax({
            url : tbc.formatString(URLS["loadFolderContent"], id),
            dataType    : "json",
            data        : {"userDeskItemId": id},
            type        : "post",
            complete    : function() {},
            error        : function() {},
            success        : function(json) {
                cb(json);
            }
        });
    }
};

/* 静态方法:删除文件夹 */
tbc.Folder.del = function(id, cb) {
    cb && $.ajax({
        url : tbc.formatString(URLS["deleteFolder"], id),
        dataType    : "json",
        type        : "post",
        data        : {userDeskItemId:id},
        complete    : function() {},
        error        : function() {},
        success        : function(json) {
            cb(json);
        }
    });
}
