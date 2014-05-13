/**
 * @class tbc.Start 开始菜单
 *
 * @copyright 时代光华
 * @author 罗志华 <mail@luozhihua.com>
 *
 */

tbc.Start = function(settings) {

	var defaults = {
		  handle	: ".tbc-startmenu-handle"
		, ui		: ".tbc-startMenu"
		, container	: ".tbc-startMenu-container"
	},
	options = tbc.extend({}, defaults, settings);

	tbc.self(this, arguments)
	.extend({
		/**
		 * 类名
		 * @property packageName
		 * @value tbc.Start
		 * @type {String}
		 */
		packageName : "tbc.Start",

		/**
		 * 开始菜单放置内容的容器
		 * @property container
		 * @type {$Object} HTML容器
		 */
		container   : $(options.container),

		/**
		 * 开始菜单的HTML代码片段
		 * @property ui
		 * @type {$Object}
		 */
		ui 	        : $(options.ui),

		/**
		 * 开始按钮
		 * @property handle
		 * @type {$Object}
		 */
		handle      : $(options.handle),

		/**
		 * 初始化方法
		 * @return {[type]} [description]
		 */
		init		: function() {
			this.initEvent();
			this.loadUser();
			return this;
		},

		/**
		 * 初始化事件
		 * @method initEvent
		 * @private
		 */
		initEvent: function() {

			var self = this;

			this.ui.contextmenu({
				items: [
					{
						text  : i18n('v4.js.hideStartMenu'),
						icon  : "",
						click : function() {self.hide();}
					}
				]
			})
			.bind({
				"click" : function(event) {
					event.stopPropagation();
					return false;
				},
				"contextmenus" : function(event) {
					event.stopPropagation();
					return false;
				}

			});

			/* 触摸屏 */
			if (tbc.touchable) {
				 this.handle.bind({
					"touchstart" : function(event) {
						setTimeout(function() {
							self.toggle();
						}, 10);
						event.originalEvent.stopContextmenu = true;
						return false;
					}
				});

			/* 传统浏览器 */
			}else{
				this.handle.bind({
					"click": function(event) {
						self.toggle(); event.stopPropagation(); return false;
					},
					"mouseenter" : function() {
						clearTimeout(self.hideTimer);
					}
				});
			}
		},

		/**
		 * 显示或隐藏开始菜单
		 * @public
		 * @method toggle
		 */
		toggle : function() {
			this.ui.filter(":visible").size()
			? this.hide()
			: this.show();
		},

		/**
		 * 显示开始菜单
		 * @public
		 * @method show
		 */
		show : function() {
			var self = this;

			this.ui.show();

			// 鼠标离开开始菜单即将其隐藏
			this.ui.bind({
				"mouseleave":function() {
					self.hideTimer = setTimeout(function() {
						self.hide();
					}, 300);
				}
			});

			this.handle.addClass("tbc-startmenu-handle-hold");

			/* 触摸屏 */
			if (tbc.touchable) {
				$(document).bind({
					"touchend.startmenu" : function() {
						// self.hide();
					}
				});
			/* 传统浏览器 */
			} else {
				$(document).bind({
					"click.startmenu": function(event) {
						if (event.button === 0 || event.button === 1) {
							self.hide();
						}
					}
				});
			}

			if (!this.userLoaded) {
				this.getUser();
			}
		},

		/**
		 * 隐藏开始菜单
		 * @public
		 * @method hide
		 */
		hide : function() {
			this.ui.hide();
			this.handle.removeClass("tbc-startmenu-handle-hold");
			this.ui.unbind("mouseleave");
			$(document).unbind(".startmenu");
		},

		hideTaskbar : function() {

		},

		/**
		 * 加载用户信息，已经改名为loadUser方法
		 * @public
		 * @method getUser
		 */
		getUser:function() {
			this.loadUser();
		},

		/**
		 * 加载用户信息
		 * @publich
		 * @method loadUser
		 * @async
		 */
		loadUser : function() {
			var self = this;
			$.ajax({
				url	: URLS["getUserinfo"] || "/uc/html/user/user.getFaceUrlAndName.do",
				type	: "post",
				dataType: "json",
				error	: function() {
					self.ui.find(".tbc-userPortrait img").hide();
					self.ui.find(".tbc-startMenu-userinfo h1").html(USERNAME);
					self.userLoaded = true;
					self = null;
				},
				success	: function(json) {
					/*
					 json = {
						"faceUrl"	: "http://tbc.21tb.com/sf-server/file/getFile/ec9b30510e93565a663f6c4053337e6e-S_1331284919850/508f8107498e87a38c0f5ac8_0100/small",
						"userName"	: "罗志华"
					}
					*/
					if (json.faceUrl) {
						self.ui.find(".tbc-userPortrait img").attr("src", json.faceUrl).show();
					} else {
						self.ui.find(".tbc-userPortrait img").hide();
					}
					self.ui.find(".tbc-startMenu-userinfo h1").html(json.userName);
					self.userLoaded = true;
					self = null;
				}
			});
		}
	})
	.init();
}