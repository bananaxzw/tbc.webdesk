;
tbc.ns("tbc.folder");
tbc.folder.Pop = function(settings) {
	var SELF = tbc.self (this, arguments);

	SELF.extend (tbc.Event, tbc.CLassManager, [tbc.Pop, settings]);
	SELF.packageName = "tbc.folder.Pop";

	var defaults = {

	},
	options = tbc.extend({}, defaults, settings);

	SELF.ui.addClass("tbc-pop-folder");
	SELF.svid = options.userDeskItemId;

	SELF.render = function(data) {
		SELF.container.empty();
		SELF.layout(data.length);

		$.each(data, function(i, s) {
			var s = new tbc.Shortcut(s).appendTo(SELF);
				s.depend(SELF);
				s.addEvent({
					"open": function() {
						SELF.close();
					}
				});
				s=null;
		});
		return SELF;
	};

	// 排列图标
	SELF.layoutTimeout = null;
	SELF.layout = function(count) {
		clearTimeout(SELF.layoutTimeout);
			var self = SELF,
				c	= count || SELF.container.children(".tbc-shortcut").size(),
				w	= _W (c, 90),
				h	= _H (c, 100),
				xw	= 800,
				xh	= 550,
				mw	= 320,
				mh	= 100,
				W	= Math.max(Math.min(w, xw, document.body.offsetWidth), mw),
				H	= Math.max(Math.min(h, xh, document.body.offsetHeight), mh);

			self.ui.css({ width:W, height:H });
			self.locate();
			self = null;
		SELF.layoutTimeout = setTimeout(function () {
		}, 0);
	};

	function _W(c, v) {
		v+=10;
		return c>=0&&c<=9 ? v*3
			: c>9&&c<=16
				? v*4
					: c>16&&c<=25
						? v*5
							: c>25&c<36
								? v*6
									: v*7

	}

	function _H(c, v) {
		v+=10;
		return c>=0&&c<=3 ? v
			: c>3&&c<=6
				? v*2
					: c>6&&c<=12
						? v*3
							:  c>12&&c<=16
								? v*4
									: c>16&c<=20
										? v*4
											: c>20&&c<=30
												? v*5
													: v*6

	}

	// 设置CSS层级
	SELF.setZIndex = function() {
		var ui = this.ui.parent(),
			zindex = tbc.getMaxZIndex(ui);
		this.ui.css({zIndex: zindex});
	}

	// 保存排序
	SELF.saveOrder = function() {
		var list = [];
		SELF.container.children(".tbc-shortcut").each(function() {
			list.push(this.getAttribute("_shortcutId"));
		});

		$.ajax({
			  url		: URLS["orderFolderShorcuts"]
			, type		: "post"
			, dataType	: "json"
			, data		: {folderid:SELF.svid, items:list.join(",")}
			, complete	: function() {}
			, error		: function() {}
			, success	: function(json) {
				if (json && json.result === "success") {

				}
			}
		});
		SELF.shortcutSequence = list;

		return SELF;
	};

	/* 从缓存获取数据 */
	var tableName	= "shortcuts_tbc.Folder_"+ options.userDeskItemId,
		table 		= tbc.jdc.getTable(tableName) || tbc.jdc.createTable(tableName);
	var data		= table ? tbc.jdc.select(table, "all") : null;

	SELF.setZIndex()

	/* 如果没有缓存的数据,则从服务器端加载 */
	if (!data) {
		tbc.Folder.load (options.folderId || options.userDeskItemId, function(json) {
			data = json||[];
			SELF.render (json);
			SELF.triggerEvent ("folderLoad", json);
			SELF.locate ();

			// 缓存数据
			$.each (data, function () {
				tbc.jdc.set (tableName.join("_"), this.userDeskItemId, this);
			});
		});
	}else{
		SELF.render(data);
	}

	// 点击任意地方隐藏文件夹
	setTimeout (function () {
		var eventName = "click.hideFolder_pop."+ SELF.svid;
		$ (document.body).bind (eventName, function (event) {
			if (!event.ctrlKey && event.target !== SELF.container[0] && $ (event.target).parents().index(SELF.container) === -1) {
				if ($(event.target).hasClass("tbc-pop-container")) {
					return;
				};
				$(document.body).unbind(eventName);
				SELF.close && SELF.close();
			}
		});
	}, 0);

	SELF.ui.contextmenu ({items:[]});

	// 开启划选
	SELF.container.selectArea({
		item			: ".tbc-shortcut",
		//exclude			: ".tbc-folder-shortcut",
		classSelected	: "tbc-shortcut-selected",
		event 			: {
			select	: function() {},
			unselect: function() {}
		}
	});

	// 图标拖动
	desktop.iconsDrager && desktop.iconsDrager.addContainer(SELF.container);
	SELF.addEvent({
		"close" : function() {
			$(document.body).unbind("click.hideFolder_pop."+ this.svid);

			// 关闭图标拖动
			desktop.iconsDrager && desktop.iconsDrager.removeContainer(SELF.container);
		},
		"destroy" : function () {
			SELF = table = data = settings = _w = _H = options = defaults = settings = null;
		}
	});
};