/*
 * @Class:  tb.ShortcutManager(快捷方式管理器) ##########################################
 *
 * @Copyright	: 时代光华
 * @Author		: luozhihua (罗志华)
 * @mail 		: mail@luozhihua.com
 * @Blog 		: http://www.luozhihua.com
 */

tbc.ShortcutManager = function() {
	var SELF = tbc.self(this, arguments);
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	SELF.packageName = "tbc.ShortcutManager";
}