/**
 * 任务管理器
 * @class tbc.TaskManager
 * @constructor
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.TaskManager = new function() {
	var SELF = tbc.self(this, arguments);
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);

	SELF.packageName = "tbc.TaskManager";

	// 任务存储器
	SELF.taskStore = {}

	//
	SELF.set = function(type, id, task) {
		if (!type || !id || !task) {return "参数Type/id/task是必须的;"}

		SELF.taskStore[type] = SELF.taskStore[type]||{length:0};

		if (!SELF.taskStore[type][id]) SELF.taskStore[type].length++;

		SELF.taskStore[type][id] = task;

		return SELF;
	}

	//
	SELF.get = function(type, id) {

		// 获取所有类型的任务
		if (type === "all") {
			var tm = [];
			for(var t in SELF.taskStore) {
				for(var _t in SELF.taskStore[t]) {
					if (_t !== "length")tm.push(SELF.taskStore[t][_t]);
				}
			}
			return tm;
		}

		// 获取某类型下的所有任务
		if (id === "all") {
			var tm = [];
			for(var t in SELF.taskStore[type]) { if (t !== "length")tm.push(SELF.taskStore[type][t]); }
			return tm;
		}

		// 获取单个任务
		if (SELF.taskStore[type]) {
			return SELF.taskStore[type][id];
		}
		return null;

	}

	//
	SELF.doWith = function(func, type, id) {

		// 获取所有类型的任务
		if (type === "all") {
			var tm = [];
			for(var t in SELF.taskStore) {
				for(var _t in SELF.taskStore[t]) {
					if (_t !== "length") func(SELF.taskStore[t][_t]);
				}
			}
		}

		// 获取某类型下的所有任务
		else if (type && (id === "all")||!id) {
			for(var t in SELF.taskStore[type]) {
				if (t !== "length") func(SELF.taskStore[type][t]);
			}
		}

		// 获取单个任务
		else if (type && id && SELF.taskStore[type]) {
			func(SELF.taskStore[type][id]);
		}
		return null;

	}

	// 删除
	SELF.exit = function(type,id) {
		if (SELF.taskStore[type]) {
			delete SELF.taskStore[type][id];
			SELF.taskStore[type].length--;
		}
		return SELF;
	}
}
