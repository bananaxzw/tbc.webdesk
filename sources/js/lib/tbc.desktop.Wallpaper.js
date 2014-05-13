;(function(tbc, $){

    "use strict";

    tbc.ns("tbc.desktop");
    tbc.desktop.Wallpaper = function(settings) {

        var SELF = tbc.self(this, arguments);

        SELF.extend ({

            // 设置上传按钮
            setUploadButton : function() {
                $("#bgUploadSelector").uploadify({
                    'formData'      : {},
                    'buttonText'    : $('#bgUpload').attr("data-text") || i18n('v4.js.uploadimg'), //"上传图片",
                    'buttonClass'   : "tbc-button-blue",
                    'width'         : 80,
                    'fileTypeExts'  : "*.png;*.jpg;*.jpeg;",
                    'fileTypeDesc'  : i18n('v4.js.img'),//"图片",
                    'swf'           : '/webdesk/js/jQuery/plugins/uploadify/uploadify.swf',
                    'uploader'      : '/webdesk/js/jQuery/plugins/uploadify/uploadify.php', // 上传地址 (需修改为对应的地址)
                    'onUploadError' : function() {
                        // debugger;
                    },
                    'onUploadSuccess' : function (file, data, response) {
                        // data = '{"id": "jasd2qnieuyfiwebbuwe834", "url":"asdasdas.jpg"}';
                        data = $.parseJSON(data);
                        var id  = data.id,
                            url = data.filepath;
                        tbc.desktop.wallpaper.addImageToList(id, url);
                    }
                });
            },

            // 插入图片
            addImageToList : function(id, url) {
                var img = $('<figure data-id="'+ new Date().getTime() +'"></figure>');
                    img.html('<i><img src="/webdesk'+ url +'" /></i> <a class="bg-image-delete" href="javascript:void(0);">&times;</a>');
                $(".bg-image-list").prepend(img);
            },

            // 删除图片
            deleteImage : function(data, callback, url) {

                if (typeof(data) === 'string') {
                    data = {corpImageId:data, corpCode:window.corpCode};
                }

                $.ajax({
                    url        : url || "/webdesk/html/wallpaper/ajax/delete.json",
                    type    : "post",
                    dataType: "json",
                    data    : data,
                    success : function(json) {
                        if (json.success) {
                            $("figure[data-id='"+ data.corpImageId +"']").remove();
                        }

                        // 回调方法
                        if ($.isFunction(callback) ) {
                            callback(json);
                        }
                    }
                });
            },

            // 设为背景
            applyImage : function(data, callback, url) {

                if (typeof(data) === 'string') {
                    data = {corpImageId:data, corpCode:window.corpCode};
                }

                $.ajax({
                    url        : url || "/webdesk/html/wallpaper/ajax/apply.json",
                    type    : "post",
                    dataType: "json",
                    data    : data,
                    success : function(json) {
                        if (json.success) {
                            var imgBox = $("figure[data-id='"+ data.corpImageId +"']").addClass("current"),
                                imgUrl = imgBox.find("img").attr("data-src")+"#";

                            imgBox.siblings().removeClass("current");

                            window.desktop.setBackground(imgUrl);
                        }

                        // 回调方法
                        if ($.isFunction(callback)) {
                            callback(json);
                        }
                    }
                });
            },

            /*
             * 更改背景显示方式
             * @param    : mode[string]; 取值范围:{"cover":填充, "contain":适应屏幕 }
             */

            changeMode : function(mode, callback, url) {
                $.ajax({
                    url     : url || "/webdesk/html/wallpaper/ajax/change-mode.json",
                    type    : "post",
                    dataType: "json",
                    data    : { mode:mode, corpCode:window.corpCode },
                    success : function(json) {
                        if (json.success) {
                            window.desktop.setBackgroundMode(mode);
                        }

                        // 回调方法
                        if ($.isFunction(callback)) {
                            callback(json);
                        }
                    }
                });
            }
        });
    };
}(tbc, jQuery));
