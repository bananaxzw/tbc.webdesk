/**
 * 数据缓存器
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.jdc = new function() {
	
	var SELF = tbc.self(this);
	
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	
	SELF.packageName = "tbc";
	
	SELF.db = //window.localStorage || window.sessionStorage || 
	{
		store	: {},
		key 	: function(k) {
			if (!isNaN(parseInt(k))) {
				return this.store[k];
			}
			return null;
		},
		
		getItem : function(key) {
			return this.store[key];
		},
		
		setItem : function(key, value) {
			if (value) {
				this.store[key] = value;
			}
			value.KEY = key;
			return value;
		},
		
		removeItem : function(key) {
			this.store[key] = null;
			delete this.store[key];
		}
	};
	
	var tables = {};
	SELF.db.setItem("tables", tables);
	
	/* 数据表 */
	SELF.getTable = function(tableName) {
		return tables[tableName];
	}
	
	// 创建数据表
	SELF.createTable = function(tableName) {
		if (tableName && !tables[tableName]) {
			tables[tableName] = new tbc.jdc.Table(tableName);
			return tables[tableName];
		}
		return;
	}
	
	// 删除数据表
	SELF.dropTable = function(tableName) {
		if (tables[tableName]) {
			tables[tableName].del("all");
			tables[tableName].DESTROY();
			delete tables[tableName];
		}
	}
	
	// 选择数据
	SELF.select = function(from, key) {
		var t = typeof(from) === "string" ? tables[from] : from;
		
		if (t) {
			var r = t.get(key);
			t=null;
			return r || null;
		}
		return null;
	}
	
	// 插入或更新数据
	SELF.set = function(tableName, key_values, orValue) {
		
		var t = tables[ tableName ];
		
		if (!t) {
			t = SELF.createTable(tableName);
		}
		
		if (t) {
			if (typeof key_values === "object") {
				for(var k in key_values) {
					t.set(k, key_values[k]);
				}
			}else{
				t.set(key_values, orValue);
			}
		}
		t=null;
	}
	
	// 删除数据
	SELF.del = function(fromTable, key) {
		
		var t = tables[ fromTable ];
		t && t.del(key);
		t=null;
	}
}

/* 数据表 */
tbc.jdc.Table = function(tableName) {
	var SELF = tbc.self(this);
	
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	SELF.packageName = "tbc.jdc.Table";
	
	SELF.count = 0;
	SELF.store = {};
	SELF.get = function(key, where) {
		var list = [];
		if (key.toLowerCase() === "all"||key === "*") {
			for(var k in SELF.store) {
				list.push(SELF.store[k]);
			}
			return list;
		}else{
			return SELF.store[key] || null;
		}
	}
	
	SELF.set = function(key, value) {
		
		if (SELF.store[key]) {
			SELF.count++;
		}
		SELF.store[key] = value;
	}
	
	SELF.del = function(key) {
		if (typeof key === "string" && key.toLowerCase() === "all") {
			for (var k in SELF.store) {
				delete SELF.store[k];
			}
		} else if (key) {
			delete SELF.store[key];
		}
	}
}
