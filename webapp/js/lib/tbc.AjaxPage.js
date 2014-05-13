;(function(){
    
    tbc.AjaxPage = function(settings) {

        var defaults = {

            event : {
                before     : function(){},
                complete   : function(){},
                beforeItem : function(){},
                afterItem  : function(){}
            }
        }
    }

    tbc.AjaxPage.prototype = {   
        redirect : function( hash, focusAfterLast ){
            this.loader( this.parse(hash), focusAfterLast );
        },
        
        parse : function( hash ) {
            
            if ( typeof hash=="object" ) {
                return hash;
            }
            
            var path = hash.split('|-|'),
                i=0,
                length = path.length,
                pathParse;
            
            for ( i=0; i<length; i++ ) {
                pathParse = path[i].split('|:|');
                
                path[i] = pathParse.length==1
                    ? [ 'page', pathParse[0] ]
                    : pathParse;
            }
            return path;
        },

        loader : function( queue, focusAfterLast ){

            var hash = this;
            if ( queue.length>0 ) {

                var place = $("[data-ajax-place='" + queue[0][0] + "']");

                if (place.attr("data-ajax-url") == queue[0][1]) {
                    queue = queue.slice(1, queue.length );
                    tbc.apps.courseCenter.hash.loader( queue, focusAfterLast );
                } else {

                    var box = $("[data-ajax-place='"+ queue[0][0] +"']");

                    $.ajax({
                        url         : queue[0][1],
                        dataType    : "html",
                        type        : "get",
                        beforeSend  : function() {
                            if (queue[0][0]=="page") {
                                //tbc.apps.courseCenter.lock('body');
                            } else {
                                //tbc.apps.courseCenter.lock(box);
                            }
                        },
                        complete    : function(){
                            if (queue[0][0]=="page") {
                                $("body").add(document.documentElement).animate({ scrollTop:0 });
                                //tbc.apps.courseCenter.unlock('body');
                            } else {
                                //tbc.apps.courseCenter.unlock(box);
                            }
                        },
                        success     : function (html) {

                            var hasFocus = focusAfterLast === false ? false : hash.focusAfterLast; 

                            if (queue[0][0]=="page") {
                                // 隐藏全部分类
                                $(".tbc-els-category-visible").removeClass("tbc-els-category-visible");
                            }

                            if ( queue.length==1 && hasFocus!==false && box.size() ) {
                                $(document.documentElement).add('body').animate({scrollTop: box.offset().top-100 });
                            }

                            box.attr( 'data-ajax-url', queue[0][1] )
                            .html( html );

                            if ( queue.length>1 ) {
                                var _queue = queue.slice(1, queue.length );
                                tbc.apps.courseCenter.hash.loader( _queue, focusAfterLast );
                            } else {
                                var req = {
                                    url : document.location.href,
                                    method:'get',
                                    data:{}
                                };
                                
                                if (window.frameElement && window.frameElement.execute) {
                                    window.frameElement.execute('addHistory', req);
                                }

                            }
                        }
                    });
                }
            }
        },

        toString : function (queue) {
            var i,
                length = queue.length,
                path = [];
            for ( i=0; i<length; i++ ) {
                if (queue[i].length==1) {
                    path.push ('page|:|' + queue[i][0] );
                } else {
                    path.push ( queue[i].join('|:|') );
                }
            }
            return path.join("|-|");
        },
        
        get : function ( formative ){
            var hash = decodeURIComponent( (document.location.hash||"").replace(/^[#!]{0,}/, "") );
            return (formative ? this.parse (hash) : hash);
        },
        
        set : function( hash, focusAfterLast ){
            this.focusAfterLast = focusAfterLast!==false;
            
            document.location.hash = "!"+ encodeURIComponent(hash);
            
            // 不支持hashchange事件的浏览器
            if ( !$.support.hashchange || (version && version<8 ) ) {
                
                var oldHash = tbc.apps.courseCenter.hash.oldHash,
                    hash    = tbc.apps.courseCenter.hash.get();
                if ( oldHash != hash ) {
                    tbc.apps.courseCenter.hash.redirect(hash, focusAfterLast);
                    tbc.apps.courseCenter.hash.oldHash = hash;
                }
            }
        }
    }
}());
