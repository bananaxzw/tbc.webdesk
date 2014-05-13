
(function($){
    $.fn.selectArea = function( settings ){
        var defaults = {
              item : this.children()
            , exclude   : null
            , classSelected : "selected"
            , event : {
                select : function(){},
                unselect : function(){}
            }
        }

        var options = $.extend({}, defaults, settings);

        return this.each(function(){
            $(this).bind({
                "mousedown.selector" : function( event ){

                    if ( (tbc.msie&&tbc.browserVersion<9 && event.button!=1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button!=0) ){
                        return;
                    }

                    if ( event.disableSelectArea || event.target!=this ){
                        return;
                    } else {
                        event.stopPropagation();
                    }

                    var _this = $(this),
                        _x  = event.pageX,
                        _y  = event.pageY,
                        a,
                        timeout = null,
                        startSelect = false;

                    $(document).bind({
                        "mousemove.selector.a" : function( event ){

                            // 临时禁止选中文字;
                            $("body").disableSelect();
                            a = a || $.fn.selectArea.area().appendTo("body")

                            startSelect = true;
                            var offset = $.fn.selectArea.getOffset( event, _x, _y );
                                a.css(offset);

                            if (!tbc.msie || tbc.browserVersion>7){
                                $.fn.selectArea.selectElement.call(_this, options, event, _x, _y);
                            }
                        },
                        "mouseup.selector.a" : function ( event ){
                            if ( startSelect ) {
                                $.fn.selectArea.selectElement.call(_this, options, event, _x, _y);
                                startSelect = false;
                            }

                            // 允许选中文字;
                            $("body").enableSelect();
                            a && a.remove();

                            $(this).unbind(".selector.a");
                        }
                    });
                }
            });
        });
    }

    $.fn.selectArea.selectElement = function ( options, event, _x, _y ){

        var offset = $.fn.selectArea.getOffset(event, _x, _y);
        $(this).children(options.item).not(options.exclude).each(function(){
            if( tbc.isOverlap(offset, this) ){
                $(this).addClass(options.classSelected);
                options.event.select.call(this, event);
            }else{
                $(this).removeClass(options.classSelected);
                options.event.unselect.call(this, event);
            }

        });
    }

    $.fn.selectArea.getOffset = function ( event, _x, _y ){
        var x      = event.pageX,
            y      = event.pageY,
            left   = Math.min(x,_x),
            right  = Math.max(x, _x),
            top    = Math.min(y, _y),
            bottom = Math.max(y, _y),
            width  = Math.abs(left-right),
            height = Math.abs(top-bottom);

        return {left:left, top:top, right:right, bottom:bottom, width:width, height:height};
    }

    $.fn.selectArea.area = function (){
        var a = $('<div><div></div></div>'),
            z = tbc.getMaxZIndex()+1;
        a.css({backgroung:"transparent", border:"1px dotted #09f", position:"absolute",left:0, top:0, width:0, height:0, zIndex:z});
        a.find("div").css({width:"100%", height:"100%", background:"#0af", opacity:0.1});
        try {
            return a;
        } finally {
            a = z = null;
        }
    }

})(jQuery);