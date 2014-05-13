/*global tbc=true*/
;(function(tbc, $){

    tbc.desktop.Help = function(settings) {
        var defaults = {
            mask: true,
            list: [
                {
                    elem    : '.tbc-desktop-dock',
                    content : '这里把您常用的应用拖到这里',
                    url     : null
                },
                {
                    elem    : '.tbc-task:first',
                    content : '这里把您常用的应用拖到这里',
                    url     : null
                },
                {
                    elem    : '.tbc-task:first',
                    content : '这里把您常用的应用拖到这里',
                    url     : null
                },
                {
                    elem    : '.tbc-task:first',
                    content : '这里把您常用的应用拖到这里',
                    url     : null
                },
                {
                    elem    : '.tbc-task:first',
                    content : '这里把您常用的应用拖到这里',
                    url     : null
                }
            ]
        },
        options = tbc.extent({}, defaults, settings);

        tbc.self(this, arguments)
        .extend({
            init: function() {

            },

            getCookies: function(cookieName) {
                var cookies = (document.cookie||'').split(';'),
                    cks, i, len,
                    obj = {};

                for (i=0,len=cookies.length; i<len; i++) {
                    cks = cookies[i].split('=');
                    if (cks.length>1) {
                        obj[cks[0]] = cks[1];
                    }
                }
                return (typeof cookieName == 'string') ? obj[cookies] : obj;
            },

            setCookies: function(key, value, expires) {
                document.cookie
            }
        });
    }

}(tbc, jQuery));
