(function($){

    /*
     * 批量方法
     */
    $.batch = function ( queue, size, current, timeout, method, callback, _nextPort ){

        if ( !$.isArray(queue) ) {
            return false;
        }

        current = current || 0;
        size    = size || 1000; // 设置每批执行的数量,
        timeout = timeout || 20;

        var start   = current * size,
            length  = queue.length,
            end     = Math.min( (current+1)*size, length),
            portion = queue.slice(start, end);

        // 首批任务
        $.isFunction(method)
        ? method( portion, end==length )
        : (window.console&&console.log("Error: tbc.Tree().batch(...). arguments[4] must be a function or a method of tbc.Tree();"));

        // 排队任务
        setTimeout(function(){
            current+=1;
            if( size*(current)<length ){
                $.batch( queue, size, current, timeout, method, callback  );
            }
        }, timeout );

        if ( end==length && $.isFunction(callback) ) {
            callback.call( this );
        }
    }

    /*
     * 综合选择组件
     */
    $.fn.blendSelector = function( settings ) {

        var defaults = {
              max           : 0 // 最多选择多少个,0:不限制
            , verifyButton  : true // 是否显示确认按钮
            , cancelButton  : true // 是否显示取消按钮
            , removeAll     : true  // 是否显示移除全部按钮,默认true
            , verifyText    : "确认"
            , cancelText    : "取消"
            , ucUrl         : "/uc/html/component/userSearch.init.do"
            , autoSave      : true
            , selectedData  : ""
            , post          : {}
            , event : {
                verify      : function( selected_Array ) {

                    // 分批处理
                    $.batch( selected_Array, 1000, 0, 1, function( list ){

                        // 在这里处理返回的已选项:list是已经分批后的单批次;
                        for ( var i=0,len=list.length; i<len; i++ ) {

                        }

                    }, function(){} );
                },
                cancel      : function() {}
            }
        },
        options = $.extend( {}, defaults, settings );

        var id  = "blendSelectorIframe_" + new Date().getTime(),
            html = $('<div id="' + id + '"/>').css({ width:options.width||780, height:options.height||480 }),
            iframe = $('<iframe id="' + id + '_iframe" name="' + id + '_iframe" src="about:blank" frameborder="0" hidefocus="true" scrolling="no" style=" width:100%; height:100%; " allowTransparency="true"></iframe>').appendTo(html),
            height = Math.max(
                    document.documentElement.scrollHeight, document.body.scrollHeight,
                    document.documentElement.offsetHeight, document.body.offsetHeight,
                    document.documentElement.clientHeight, document.body.clientHeight
                    ),
            mask    = $('<div id="'+ id +'_mask"/>').css({height: height, width: "100%", background:'url("/webdesk/css/default/images/loading-1.gif") no-repeat scroll center center #333', opacity:0.4, position:"absolute", left:0, top:0}),
            zIndex  = 0;

        $('*').each(function() {
            var z = parseInt($(this).css('zIndex')) || 0;
            z = isNaN(z) ? 0 : z;
            zIndex = Math.max(z, zIndex);
        });

        // 选人组件方法
        var methods = {
            resize : function( width, height ){
                html.css ({
                    width      : width,
                    height     : height,
                    marginLeft : 0-width+"px",
                    marginTop  : 0-height+"px"
                });
            },

            close : function () {
                mask && mask.fadeOut();
                html.hide();
                setTimeout(function(){
                    iframe[0].callback = null;
                    iframe[0].options=null;
                    iframe[0].trigger=null;
                    iframe[0].src = null;
                    html.remove();

                    mask && mask.remove();

                    mask=html=iframe=null;
                }, 5000);
            }
        }

        // 回掉方法
        iframe[0].callback = function( methodName ){
            var arg = [];
            for ( var i=1,len=arguments.length; i<len; i++ ) {
                arg.push(arguments[i]);
            }

            if ( methods[methodName] ) {
                try { return methods[methodName].apply( this, arg ); } finally { arg=null; }
            }
        }

        // 触发事件
        iframe[0].trigger = function( eventName ){
            var arg = [];
            for ( var i=1,len=arguments.length; i<len; i++ ) {
                arg.push(arguments[i]);
            }

            if ( options.event && options.event[eventName] ) {
                try { return options.event[eventName].apply( this, arg ); } finally { arg=null; }
            }
        }

        //
        iframe[0].options = options;

        if ( this.length!=0 ) {
            mask.remove();
            mask = null;
            html.appendTo(this).show();
        } else {

            mask.css({zIndex: zIndex}).appendTo("body");

            html.css({
                position : "absolute",
                zIndex: zIndex + 1,
                left:"50%",
                top:"50%",
                marginLeft : 0-((options.width||740)/2),
                marginTop : 0-((options.height||480)/2)
            })
            .appendTo("body").show()
            .addClass("PIE");
        }

        var arg = [],
            url = options.ucUrl + (options.ucUrl.indexOf("?")==-1 ? "?" : "&");

        options.post = options.post || {};
        options.post["autoSave"] = options.autoSave===false ? false : options.autoSave||true;

        for( var k in options.post ) {
            if ( typeof(options.post[k])!="undefined" ) {
                arg.push( k+"="+options.post[k] );
            }
        }
        url += arg.join("&");

        //iframe.attr( "src", url );

        /**/
        var form = $('<form action="'+ options.ucUrl +'" method="post" enctype="application/x-www-form-urlencoded" target="' + id + '_iframe"></form>').appendTo("body");

        for ( var k in options.post ) {
            form.append('<input name="'+ k +'" value="'+ options.post[k] +'" type="hidden" />');
        }
        form.append('<input name="submit_111" value="submit" type="submit" />');
        form[0].submit();
        form.remove();
        /**/
    }
})(jQuery);