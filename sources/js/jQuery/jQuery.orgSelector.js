(function($){
    /*
     * 综合选择组件
     */
    $.fn.orgSelector = function( settings ) {

        /*
            url:'',
            val:{},
            needAdv:true,
            advText:'高级',
            bgImgPath:'/webos/images/',
            onAdv:function(){},
            onLoad:function(){}
         */

        if ( typeof settings=="string" ) {
            var ret = this.tbcsch.apply(this, arguments);
            if ( ret ) ret.id = ret.id || "";
            return ret||{id:"",name:""};
        }

        var defaults = {
              title     : "部门"
            , width     : 320
            , height    : 404
            , needAdv   : true
            , currentAppId : null
            , inputName : null
            , posts     : {

            }
            , url       : "/uc/html/organize/organize.findOrgNodeByName.do" // 不公开
            , ucUrl     : "/uc/html/component/orgSearch.onlyOrg.do" // iframe
        },
        options = $.extend( {}, defaults, settings );

        options.events = options.events || options.event || {};

        options.url += options.url.indexOf("?")==-1 ? "?" : "&";
        options.url += ["current_app_id="+(options.currentAppId||""), "type="+(options.type||"") ].join("&");

        options.ucUrl += options.ucUrl.indexOf("?")==-1 ? "?" : "&";
        options.ucUrl += ( "current_app_id="+(options.currentAppId||"") );

        var nodeTypeText = {
            "ORGANIZATION"      : "部门",
            "POSITION_CATEGORY" : "岗位类别",
            "POSITION"          : "岗位",
            "GROUP_CATEGORY"    : "群组类别",
            "GROUP"             : "群组"
        }

        var schparam    = [],
            schurl      = options.url + ( options.url.indexOf("?")==-1 ? "?" : "&" );
        for ( var k in options.posts ) {
            if ( options.posts[k]!==null ) {
                schparam.push( [k, options.posts[k]].join("=") );
            }
        }
        schurl += schparam.join("&");

        return this.each(function() {

            var _this = $(this);

            // jQuery.tbcsch插件
            _this.tbcsch({
                url     : schurl,
                val     : options.val || { id:"", text:"" },
                needAdv : options.needAdv,
                inpName : options.inpName||options.inputName,
                tbcschId : options.tbcschId,
                advText : '高级',
                bgImgPath : '/webos/images/',
                onSelect    : function ( val ) {
                    if ( $.isFunction(options.events.verify) ) {
                        options.events.verify(val);
                    }
                },
                onLoad  : function(){},
                onAdv   : function(){

                    if ( _this.data("existFinder") ) {
                        _this.data("existFinder").remove();
                        _this.removeData("existFinder");
                        return false;
                    }

                    var methods, html, iframe;

                    var bodyWid = document.body.clientWidth,
                        bodyHei = document.body.clientHeight,
                        bodyScrTop  = document.body.scrollTop,
                        bodyScrLeft = document.body.scrollLeft,
                        width   = options.width,
                        height  = options.height,
                        offset  = _this.offset(),
                        left    = offset.left,
                        top     = offset.top + _this.height();

                    if (height >= bodyHei) {
                        top = 0;
                    } else {
                        top -= Math.max(0, (top+height+14) - (bodyScrTop + bodyHei));
                    }

                    if (width >= bodyWid) {
                        left = 0;
                    } else {
                        left -= Math.max(0, (left+width+14) - (bodyScrLeft + bodyWid));
                    }

                    width = Math.min(width, bodyWid-14);
                    height = Math.min(height, bodyHei-14);

                    html = $('<div/>').css ({
                            width   : width,
                            height  : height,
                            position: "absolute", zIndex:9000000000000, left:left, top:top,
                            border  : "2px solid #aaa", padding:5, background:"#eee", borderRadius:"5px"
                    });

                    iframe = $('<iframe name="orgSelectorIframe" src="about:blank" frameborder="0" hidefocus="true" scrolling="auto" style=" width:100%; height:100%; " allowTransparency="true"></iframe>').appendTo(html);

                    _this.data( "existFinder", html );

                    // 选人组件方法
                    methods = {
                        setValues   : function( id, text, namePath ){
                            _this.tbcsch ( "setValues", { id:id, text:text, np:namePath });
                        },

                        checkNodeType : function( department ) {
                            var nodeType = department.tp||department.nodeType;
                            if ( options.type && nodeType && options.type!=nodeType ) {
                                alert( "只能选择 " + nodeTypeText[options.type] );
                                return false;
                            }
                        },

                        close : function () {
                            html.hide();
                            $("body").add(document.documentElement)
                                .unbind(".orgAdvSelector");
                            $(document).unbind(".orgAdvSelector");

                            _this.removeData("existFinder");
                            setTimeout ( function(){
                                iframe[0].callback = null;
                                iframe[0].options=null;
                                iframe[0].trigger=null;
                                iframe[0].src = null;
                                html.remove();
                                html=iframe=null;
                            }, 5000);
                        }
                    }

                    // 页面滚动时，使选择器跟随按钮位置
                    $("body").add(document.documentElement).bind({
                        "scroll.orgAdvSelector": function(){
                            var offset = _this.offset(),
                                left   = offset.left,
                                top    = offset.top + _this.height();
                            tbc.log([left,top]);
                            html.css({left: left, top:top});
                        }
                    });

                    setTimeout(function(){
                        $(document).bind({
                            "click.orgAdvSelector":function(){
                                methods.close();
                            }
                        });
                    }, 0);

                    // 回掉方法
                    iframe[0].callback = function( methodName ) {
                        var arg = [];
                        for ( var i=1,len=arguments.length; i<len; i++ ) {
                            arg.push(arguments[i]);
                        }

                        if ( methods[methodName] ) {
                            try { return methods[methodName].apply( this, arg ); } finally { arg=null; }
                        }
                    }

                    // 触发事件
                    iframe[0].trigger = function( eventName ) {
                        var arg = [];
                        for ( var i=1,len=arguments.length; i<len; i++ ) {
                            arg.push(arguments[i]);
                        }

                        if ( options.events && options.events[eventName] ) {
                            try { return options.events[eventName].apply( this, arg ); } finally { arg=null; }
                        }
                    }

                    iframe[0].options = options;

                    var param   = [],
                        url     = options.ucUrl + ( options.ucUrl.indexOf("?")==-1 ? "?" : "&" );
                    for ( var k in options.posts ) {
                        if ( options.posts[k]!==null ) {
                            param.push( [k, options.posts[k]].join("=") );
                        }
                    }
                    url += param.join("&");

                    iframe.attr( "src", url );
                    html.appendTo('body').show();

                }
            });


            if ( options.val&&!options.val.text ) {
                options.val.text = "";
                $.ajax ({
                    url     : "/uc/html/organize/organize.getOrgNodeById.do",
                    data    : { current_app_id:options.currentAppId, id:options.val.id, type:options.type },
                    dataType    : "json",
                    error   : function (  ) {
                        var val = _this.tbcsch("getValues");
                            val.text = "";
                        _this.tbcsch("setValues", val);
                    },
                    success : function( val ){
                        _this.tbcsch("setValues", val);
                    }
                });
            }

        });
    }
})(jQuery);
