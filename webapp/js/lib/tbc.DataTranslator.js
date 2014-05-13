/**
 * 数据转换器，实现新旧数据转换,保证数据兼容性，为减小数据传输量，简化
 * 后的JSON数据，绝大部分的属性名缩短了2/3，此类构造类实现将简化后的数
 * 据格式转成以前的格式，以保存原来JS代码的兼容性。
 * @class tbc.Translator
 * @constructor
 * @copyright 时代光华（2013）
 * @author mail@luozhihua.com
 *
 * @param {Object} [tradeRules] 转换规则, 在构造实例时可以省略此参数
 *                              在构造实例后，可以通过实例的setRules
 *                              方法设置转换规则。
 * @param {Boolean} passed 在转换时，是否保留转换规则里面未定义的属性
 *                         默认false(不保留)
 */
tbc.Translator = function(tradeRules, passed) {

    var ruleSet = tradeRules instanceof Object ? tradeRules : {};

    this.result = [];
    this.cache = {};

    /**
     * 获得全部转换规则
     * @public
     * @method getRules
     * @description 获得全部转换规则
     * @return {Object} 转换规则
     */
    this.getRules = function() {
        return ruleSet;
    }

    /**
     * 获取转换后的KEY
     * @public
     * @method getKey
     * @param {String} key 要转换的key
     * @param {String} [which='antique'] 转换成新的(fresh)，还是旧的(antique)
     * @return {String} 返回转换后新的key名称
     */
    this.getKey = function(key, which) {
        var k,
            newKey;
        switch (which) {

            case 'fresh' :
                return passed===true ? (ruleSet[key] || key) : ruleSet[key];
                break;

            case 'antique' :
            default:

                for (k in ruleSet) {
                    if (ruleSet[k] !== null && ruleSet[k] === key) {
                        newKey = k;
                    }
                }
                return passed===true ? (newKey || key) : newKey;
                break;

        }
        return null;
    }

    /**
     * 设置转换规则
     * @public
     * @method setRules
     * @param {String|Object} keyOrObject 单个的key名称或者一个{key:value}键值对集合
     * @param {AnyType} [value] 如果前面的参数keyOrObject类型是Object, 则此参数可省略
     * @return {Boolean} 是否转换成功
     */
    this.setRules = function(keyOrObject, value) {
        var reuls,
            k;

        if (arguments[0] instanceof Object) {
            reuls = arguments[0];
        } else {
            reuls = {};
            reuls[arguments[0]] = arguments[1];
        }

        ruleSet = ruleSet instanceof Object ? ruleSet : {};

        if (reuls instanceof Object) {
            for (k in reuls) {
                ruleSet[k] = reuls[k];
            }
        }
        return true;
    }

    /**
     * 清空转换器
     * @public
     * @method clear
     */
    this.clear = function() {
        this.result = [];
        ruleSet = null;
    }

    /**
     * 批量转换器
     * @public
     * @method transformList
     * @param {Array} list 要转换的数组
     * @param {String} which 要转成哪一类型，取值范围：'antique'|'fresh';
     * @return {Array} 转换后的结果
     */
    this.transformList = function(list, which) {
        if (!$.isArray(list)) {
            return list;
        } else {
            var i, len, freshRow,
                result = [];

            for (i=0,len=list.length; i<len; i++) {
                freshRow = this.transform(list[i], which);
                result.push(freshRow);
            }

            try {
                return result;
            } finally {
                result = null;
            }
        }
        return list;
    }

    /**
     * 对象转换器
     * @method transform
     * @description 对象转换器
     * @param {Object} obj 要转换的对象
     * @param {String} which 转换成哪一种格式
     * @return {Object} 转换后的结果, 如果传入的不是object类型, 则
     *                           不会进行任何转换, 直接返回源对象
     */
    this.transform = function(obj, which) {
        var k,
            key,
            freshRow;

        if (obj instanceof Object) {
            freshRow = {};
            for (k in obj) {
                key = this.getKey(k, which);

                if (typeof key==='string') {
                    freshRow[key] = typeof this.valueTranslator === 'function'
                    ? this.valueTranslator(key, obj[k], which)
                    : obj[k];
                }
            }

            try {
                return freshRow
            } finally {
                freshRow = null;
            }
        }
        return obj;
    }

    /**
     * 转换成新格式
     * @method toFresh
     * @description 转换成新格式
     * @param {Object | Array} objectOrArray 传入object或者array都可以, 转
     *                  换后会自动返回对应的数据格式
     * @return {Object | Array} 转换后的结果, 参数是什么类型就返回什么类型
     */
    this.toFresh = function(objectOrArray) {
        if (list instanceof Object) {
            return this.transform(objectOrArray, 'fresh');
        } else {
            return this.transformList(objectOrArray, 'fresh');
        }
    }

    /**
     * 转换成旧格式
     * @method toAntique
     * @description 转换成旧格式
     * @param {Object | Array} objectOrArray 传入object或者array都可以,
     *                  转换后会自动返回对应的数据格式
     * @return {Object | Array} 转换后的结果, 参数是什么类型就返回什么类型
     */
    this.toAntique = function(objectOrArray) {
        if (list instanceof Object) {
            return this.transform(objectOrArray, 'antique');
        } else {
            return this.transformList(objectOrArray, 'antique');
        }
    }
}
