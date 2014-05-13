/**
 * @class tbc.AppSelector
 * @copyright ww.21tb.com
 * @author colin - (mail@luozhihua.com)
 */

/*global jshint:true,tbc:true*/

;(function($, tbc) {

    "use strict";

    tbc.AppSelector = function (settings) {

        var defaults = {
                name    : i18n('v4.js.selectApps'), //"选择应用",
                icon    : "icon-zoom_in",
                width   : 500,
                height  : 600,
                loadType: "html",
                multipleSelect : false
            },
            options = $.extend({}, defaults, settings);

        options.buttons = [
            {
                text: i18n('v4.js.select'), //"选择",
                action: function() {
                    if (typeof this.getSelected == 'fonction') {
                        this.returnValue = this.getSelected();

                    // 变态的IE下找不到getSelected方法啊，下面这个是临时工
                    } else {
                        var applist = [];
                        this.ui.find("a.app-icon-selected").each(function() {
                            applist.push(window.applicationMap[ this.getAttribute("data-id") ]);
                        });
                        this.returnValue = applist;
                    }
                    this.close();
                }
            }, {

                text: i18n('v4.js.cancel'), //"取消",
                action: function() {
                    this.close();
                }
            }
        ];

        tbc.self(this, arguments)
        .extend([tbc.dialog, options], {
            layout : function() {
                var win = this,
                    list = ['<div style="padding:1em;">'];

                $.each(window.applicationMap, function() {
                    list.push(
                        '<a class="app-icon-item" href="javascript:void(null);" onclick="return false;" data-id="'+ this.applicationId +'">' +
                        '   <img class="app-icon-img" title="'+ this.applicationName +'" src="'+ this.applicationIconUrl +'" />' +
                        '   <i class="app-icon-text">'+ this.applicationName +'</i>' +
                        '</a>'
                   );
                });
                list.push("</div>");
                this.append(list.join(""));

                this.ui.on("click", "a.app-icon-item", function(event) {
                    event.preventDefault();

                    $(this).addClass("app-icon-selected");

                    if (!event.ctrlKey || !win.options.multipleSelect) {
                        $(this).siblings("a.app-icon-item")
                        .removeClass("app-icon-selected");
                    }
                })
                .on("dblclick", "a.app-icon-item", function() {
                    win.returnValue = win.getSelected();
                    win.close();
                });
            },

            getSelected : function() {
                var applist = [];
                this.ui.find("a.app-icon-selected").each(function() {
                    applist.push(window.applicationMap[ this.getAttribute("data-id") ]);
                });
                return applist;
            }
        })
        .addEvent({
            "show" : function() {
                this.layout();
            }
        });
    };

}(jQuery, tbc));
