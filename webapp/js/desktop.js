
jQuery.ajaxSetup({
    data : {"_ajax_toKen":"elos"}
});

jQuery(function($){

    "use strict";

    var v,p,c,w,
        tbc = window.tbc,
        desktop;

        // AJAX默认设置
        $.ajaxSetup({
           data  : {'_ajax_toKen':'os'  },
           cache : false,
           error : function( jqXHR, textStatus, errorThrown ){
              //$.loading('close');

            /**
            var rl = new tbc.Panel({
                    name : "登录超时或者在其他地点登录",
                    width: 400,
                    height: 240
                }).show().appendTo("body"),

                dl = new tbc.Button({ text:"重新登录", icon:"", click:function(){ tbc.system.logout(); }}).depend(rl).appendTo(rl)
                    .ui.css({margin:"1em"});
              */

              if (jqXHR.status === 403) {
                  try {
                      window.tbc.system.logout();
                  } catch(e) {

                  }
                  //sendRedirect(true);
              }

              /*
              if (jqXHR.status === 404) {

                 // $.msgN('您无法访问该页面');
              }

              if (jqXHR.status === 410) {
                  //$.cookie("eln_session_id",null,{domain:'${cookie_domain!}',path:"/"});
                 // $.msgN('您无权访问该页面');
              }
              */

              if (jqXHR.status === 411) {
                  window.onbeforeunload=function(){};
                  try {
                      window.tbc.system.logout();
                  } catch(err) {

                  }
                  return;
              }
           }
      });

    /* 每3分钟发起AJAX请求: 使页面始终处于活动状态 */
    var keep_login_timeout_base = 1000*60*3,
        keep_login_timeout = keep_login_timeout_base,
        error_count = 0;

    function keepLogin() {
        $.ajax({
            //url      : '/uc/html/loginLog.updateLogout.do',
            url   : '/uc/html/loginLog.heartbeat.do',
            type  : 'post',
            error : function() {
                if (error_count<5) {
                    error_count += 1;
                    keep_login_timeout += keep_login_timeout_base;
                    setTimeout(keepLogin, keep_login_timeout);
                } else {
                    tbc.alert(tbc.i18n('v4.js.serverDisconnect'), function() {
                        tbc.system.logout();
                    });
                }
            },
            success  : function() {
                error_count = 0;
                keep_login_timeout = keep_login_timeout_base;
                setTimeout(keepLogin, keep_login_timeout);
            }
        });
    }

    window.taskbar = new tbc.Taskbar({
        container    : ".tbc-task-container",
        toPrev        : ".tbc-scroll-arrow-toPrev",
        toNext        : ".tbc-scroll-arrow-toNext"
    });

    window.quickLaunch = new tbc.QuickLaunch({});
    window.apptray = new tbc.AppTray();

    // 创建桌面实例
    desktop = window.desktop = new tbc.Desktop({
          container : ".tbc-tabset"
        , header    : ".tbc-desktop-nav-list"
        , effects   : "slide-x"      // [fade, slide-x, slide-y]
        , easing    : "swing"
        , speed     : 300
        , prevHandle : ".tbc-tabset-prev"
        , nextHandle : ".tbc-tabset-next"
    });

    // 创建开始菜单实例
    // window.desktop.loadScene();
    window.startmenu = new tbc.Start();

    function appendHomeButton() {
        // 显示桌面
        window.quickLaunch.append({
            guid  : "showdesktop",
            icon  : "icon-view_thumbnail",
            title : tbc.i18n("v4.js.showDesktop"),
            click : function(){
                window.desktop.minAll();
            }
        });
    }

    /** 浏览器判断 **/
    function checkBrowserToDo(){

        var Sys = {},
            browserType;

        // 判断浏览器
        (function testBrowser() {

            var ua = navigator.userAgent.toLowerCase(),
                regexps = {
                    ie      : /(ie |rv:)([\d\.]+)/,
                    firefox : /firefox\/([\d\.]+)/,
                    chrome  : /chrome\/([\d\.]+)/,
                    opera   : /opera\/([\d\.]+)/,
                    safari  : /version\/([\d\.]+) *safari/
                },
                version, b;

            for (b in regexps) {
                if (regexps.hasOwnProperty(b)) {
                    version = ua.match(regexps[b]);
                    Sys[b] = version ? parseFloat(version[version.length-1]) : 0;
                }
            }
        }());

        /*
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
        (s = ua.match(/version\/([\d.]+)\.*safari/)) ? Sys.safari = s[1] : 0;
        */

        if (Sys.ie) {browserType='IE ' + Sys.ie;}
        else if (Sys.firefox) {browserType='Firefox ' + Sys.firefox;}
        else if (Sys.chrome) {browserType='Chrome ' + Sys.chrome;}
        else if (Sys.opera) {browserType='Opera ' + Sys.opera;}
        else if (Sys.safari) {browserType='Safari ' + Sys.safari;}
        else {browserType = tbc.i18n('v4.js.unknownBrowser');}

        if (Sys.firefox>=8 || Sys.ie>=7 || Sys.chrome>=12 || Sys.opera>=8 || Sys.safari>=3) {
            window.onbeforeunload = function(e) {
                e = e || window.event;
                var msg = e.returnValue = tbc.i18n('!v4.js.logoutTips');
                return msg;
            };
            initDesktop();
        } else {
            /** 这是新的提示框(未测试,暂不启用)
            tbc.dialog(
                '<div class="dialog-msg" style="padding:2em;">您现在使用的浏览器是<b class="truered">'+browserType+'</b>,可能会造成部分功能体验不好,是否继续访问?<br /><b style="color:#06f">(建议使用IE7.0以上、Firefox8.0以上、Chrome12.0以上、Safari3.0以上版本的浏览器)</b></div>',
                {
                    name : "您的浏览器版本不满足要求",
                    width : 500,
                    height : 240,
                    buttons : {
                        "继续访问" : function(){
                            window.onbeforeunload=function( e ){
                                return (e || window.event).returnValue = '退出后,您正在观看的课程进度将不会被记录,确定要退出吗?';
                            }
                            this.close();
                        },
                        "退出登录" : function(){
                            tbc.system.logout();
                            this.close();
                        }
                    }
                }
            )
            .addEvent({
                "close": function(){ window.desktop.loadScene(); }
            });
            */

            p = new tbc.Panel({
                name    : tbc.i18n('v4.js.lowerBrowser'),
                width    : 500,
                height    : 240
            })
            .addEvent({ "close": function(){ initDesktop(); } })
            .show().icon("icon-warning_triangle").appendTo("body");

            p.html('<div class="dialog-msg" style="padding:2em;">您现在使用的浏览器是<b class="truered">'+browserType+'</b>,可能会造成部分功能体验不好,是否继续访问?<br /><b style="color:#06f">(建议使用IE7.0以上、Firefox8.0以上、Chrome12.0以上、Safari3.0、Opera3.0以上版本的浏览器)</b></div>');

            v = new tbc.Button({text:tbc.i18n("!v4.js.continueAccess"), icon:"icon-arrow_medium_right", click:function(){

                        window.onbeforeunload = function(e) {
                            e = e || window.event;
                            var msg = e.returnValue = tbc.i18n('!v4.js.logoutTips');
                            return msg;
                        };

                         p.close();
                    }});
            c = new tbc.Button({text: tbc.i18n("v4.js.logout"), icon:"icon-warning_triangle_small", click:function(){ tbc.system.logout(); }});
            w = $("<div></div>").css({textAlign:"center", margin:"12px auto"});

            v.appendTo(w).ui.css({marginRight:"10px"});
            c.appendTo(w);
            w.appendTo(p.container);
        }
    };
    /* 结束:浏览器判断 */

    // 初始化桌面
    function initDesktop() {
        window.desktop.loadScene();
        appendHomeButton();
        initPage();
        setTimeout(keepLogin, keep_login_timeout);
    }

    // 初始化页面
    function initPage() {
        // 拖动顶部分屏按钮
        $(".tbc-desktop-nav")
        .drag({
            shandle : ".tbc-desktop-nav-handle",
            area    : {top:0, left:0, right:"95%", bottom:38},
            areaMargin : {top:0, left:0, right:"0", bottom:0},
            timeout : 100,
            event   : {
                dragStart : function(){
                    tbc.lock("body", {backgroundColor:"#fff", opacity:0.001,  zIndex:9999999999, cursor:"move"});
                },
                dragEnd : function() {
                    tbc.unlock("body");
                }
            }
        })
        .on('click', '.s_add-scene', function() {
            desktop.manager.addDesktop();
        })
        .on('click', '.s_change_lang', function() {
            desktop.manager.selectLang();
        })
        .contextmenu({
            items : [
                {
                    text : tbc.i18n("v4.js.addDesktop"),
                    icon : "icon-add_small",
                    disabled : 0,
                    inheritable : true,
                    click : function() {
                    desktop.manager.addDesktop();
                }}
            ]
        });

        // 触摸屏
        if (tbc.touchable) {
            document.body.addEventListener( "touchmove", function(event) {
                event.preventDefault();
                return false;
            } );
        }

        $(".tbc-taskbar").appendTo("body");

        $("body").contextmenu({items:[
              {
                  text  : tbc.i18n("v4.js.showDesktop"),
                  icon  : "icon-view_thumbnail",
                  click : function(){ window.desktop.minAll(); },
                  inheritable:true
              },
              {
                  text  : tbc.i18n("v4.js.logout"),
                  icon  : "icon-gem_remove",
                  click : function() {
                        tbc.system.logout( true );
                    },
                  inheritable:true
              }
        ]});
    }

    // 加载i18n数据
    function loadI18nData() {
        var url = URLS['loadI18nData'];
        if (!url) {
            checkBrowserToDo();
        } else {
            $.ajax({
                url: url,
                dataType: 'json',
                success: function(data) {
                    if ($.isPlainObject(data)) {
                        tbc.i18nData = data;
                    }
                    checkBrowserToDo();
                },
                error: function(err) {
                    loadI18nData.times = (loadI18nData.times||0) + 1;

                    if (loadI18nData.times < 4) {
                        loadI18nData();
                    } else {
                        tbc.alert('Language data loaded fail.').addEvent('close', function() {
                            document.location.reload();
                        });
                    }
                }
            });
        }
    }

    loadI18nData();

    /* Start 背景音乐 *****************************************************
    //<bs>


        soundManager.setup({
              useFlashBlock    : true,
              url            : '/sound/swf/', // path to SoundManager2 SWF files (note trailing slash)
              debugMode        : true,
              consoleOnly    : false
        });

        soundManager.onready(function(oStatus) {
            if (!oStatus.success) {
                return false;
            }
            // soundManager is initialised, ready to use. Create a sound for this demo page.

            tbc.bgsound = soundManager.createSound({
                id  : 'backgroundSound',
                url : '/sound/mp3/anxiang.mp3'
            });

            function loop( num ){
                tbc.bgsound.play({
                    onfinish:function(){
                        num = num===0?0:(num>1?num-=1:1);
                        if(num==0 || num>1){
                            loop( num );
                        }else{
                            tbc.bgsound.play({
                                onfinish:function(){ tbc.bgsound.isPlaying = false; tbc.bgsound.isStoped = true; }
                            });
                        }
                    }
                });
            }
            loop(1);
            tbc.bgsound.isPlaying = true;

            // 右键菜单 **
            $("body").contextmenu({
                before    : true,
                items : [
                    {
                          text: function(){return tbc.bgsound.isPlaying ? "停止背景音乐" : "播放背景音乐"; }
                        , icon:function(){ return tbc.bgsound.isPlaying ? "icon-media_controls_dark_pause" : "icon-media_controls_dark_play"; }
                        , inheritable : true
                        , click:function(){
                            if(tbc.bgsound.isPlaying){
                                tbc.bgsound.pause();
                                tbc.bgsound.isPlaying = false;
                            }else{
                                if(tbc.bgsound.isStoped==true){
                                    loop(0);
                                    tbc.bgsound.isStoped = false;
                                }else{
                                    tbc.bgsound.resume();
                                    tbc.bgsound.isPlaying = true;
                                }
                            }
                        }
                    }
                ]
            });

        });

        var t = null;

    //</bs>


    // End 背景音乐 ********************************************************/


    window.ICONS = function() {
        window.aaabbb = new tbc.Window({name:"小图标和按钮",minimizable:true,  maximizable:true,width:500,height:320,left:"auto", top:"auto",loadType:"html"})
        .append($('.icons-demo').css({display:"block",width:"100%",height:"100%",overflow:"auto"})).appendTo($('body')).show()
        .addEvent("close", function(){
            this.fling().lock("lock","被锁定,不能关闭!");
            var t = this;
            setTimeout(function(){ t.unlock("lock"); t=null; },2000);
            //return false;
        });
    };

});