
/**
 * 命名空间 
 * @namespace tbc
 */
;(function(tbc, $){

    "use strict";

    /**
     * @class tbc.Event
     * @for  tbc
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.Event = function() {

        // 私有方法: 根据事件名称删除事件
        function REMOVE(eventType, func) {
            if (typeof func === "function") {

                var store = this.eventStorage[eventType],
                    newEvent = [],
                    i, len;

                if (typeof store === "object" && store.constructor === Array) {
                    for (i=0, len=store.length; i<len; i+=1) {
                        if (store[i].toString() !== func.toString()) {
                            newEvent.push(store[i]);
                        }
                    }
                    this.eventStorage[eventType] = newEvent;
                }
            }else{
                this.eventStorage[eventType]=[];
            }
        }

        // 私有方法: 触发事件
        function TRIGGER(eventType, parameters) {

            var result, res,
                store = this.eventStorage[eventType],
                i;

            if (typeof store === "object" && store.constructor === Array) {
                for (i=store.length-1; i>-1; i-=1) {
                    if (typeof(store[i]) === "function") {
                        try {
                            res = store[i].apply(this, parameters);
                            result = res===false ? false : result;

                            // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                            if (res ===true) {
                                return true;
                            }
                        } catch(e) {

                        }
                    }
                }
            }
            return result===false?false:result;
        }

        tbc.self(this, arguments).extend({

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {
                this.packageName = "tbc.Event";
                return this;
            },

            /**
             * 事件存储器 
             * @private
             * @for tbc.Event
             * @property {Object} eventStorage
             * @type {Object}
             */
            eventStorage : {},

            /**
             * 私有方法: 根据事件名称删除事件，如果传入@func参数，则只删除
             * 指定的事件方法，否则删除事件类的所有方法
             * @private
             * @method REMOVE
             * @param {String} eventType 事件类型
             * @param {Function} [func] 回调方法
             */
            REMOVE : function(eventType, func) {
                if (typeof func === "function") {

                    var store = this.eventStorage[eventType],
                        newEvent = [],
                        i, len;

                    if (typeof store === "object" && store.constructor === Array) {
                        for (i=0, len=store.length; i<len; i+=1) {
                            if (store[i].toString() !== func.toString()) {
                                newEvent.push(store[i]);
                            }
                        }
                        this.eventStorage[eventType] = newEvent;
                    }
                } else {
                    this.eventStorage[eventType]=[];
                }
            },

            /**
             * 私有方法: 触发事件，参数parameters会分发给事件类的
             * 所有方法，以数组形式传递，数组的每一个元素都作；
             * 为事件方法的一个参数；
             * @private
             * @method TRIGGER
             * @param {String} eventType 事件类型
             * @param {Array} [parameters] 此参数分发给事件类的所有方法，
             *                             数组的每一个元素都作为事件方法
             *                             的一个参数，parameters有几个元
             *                             素，那么事件方法就会接收到几个
             *                             参数；
             */
            TRIGGER : function(eventType, parameters) {

                var result, res,
                    store = this.eventStorage[eventType],
                    i;

                if (typeof store === "object" && store.constructor === Array) {
                    for (i=store.length-1; i>-1; i-=1) {
                        if (typeof(store[i]) === "function") {
                            try {
                                res = store[i].apply(this, parameters);
                                result = res===false ? false : result;

                                // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                                if (res ===true) {
                                    return true;
                                }
                            } catch(e) {

                            }
                        }
                    }
                }
                return result===false?false:result;
            },

            /**
             * 添加事件方法
             * @public
             * @method addEvent
             * @param  {String} eventType 事件类型
             * @param  {Function} func    事件方法
             * @chainable
             */
            addEvent : function(eventType, func) {

                var t,
                    store = this.eventStorage,
                    events,
                    existing,
                    i, len;

                if (typeof eventType === "object") {
                    for (t in eventType) {
                        if (eventType.hasOwnProperty(t)) {
                            this.addEvent(t, eventType[t]);
                        }
                    }
                    return this;
                }

                if (typeof func === "function") {
                    if ($.isArray(store[eventType])) {
                        events = store[eventType];
                    } else {
                        events = store[eventType] = [];
                    }

                    existing = false;
                    for(i=0, len=events.length; i<len; i+=1) {
                        if (events[i].toString() === func.toString()) {
                            existing = true;
                        }
                    }

                    if (!existing) {
                        store[eventType].push(func);
                    }
                }
                return this;
            },

            /**
             * 移除事件
             * @public
             * @method removeEvent
             * @param  {EventType} eventType 事件类型
             * @param  {Function}  func      事件方法
             * @chainable
             */
            removeEvent : function(eventType, func) {
                var stores = this.eventStorage,
                    e,
                    eventMatch = new RegExp("(^|\\.)" + eventType.substring(eventType.indexOf(".")+1,eventType.length) + "($|\\.)");

                for (e in stores) {
                    if (stores.hasOwnProperty(e) && (e === eventType || e.match(eventMatch))) {
                        this.REMOVE(e, func);
                    }
                }
                stores = null;
                return this;
            },

            /**
             * 触发事件，此方法接收多个参数，除eventType外的其他参数
             * 都将分发给eventType指定的事件类型的所有方法；
             * @public
             * @method triggerEvent
             * @param  {String} eventType* 事件类型
             * @return {Boolean}           如果事件类型的任一方法返回false
             *                             那么此方法也将返回false, 否则返
             *                             回触发此事件的实例；
             */
            triggerEvent : function(eventType) {
                var parameters = [],
                    result, res,
                    stores = this.eventStorage,
                    i,len,e,
                    eventMatch = new RegExp("(^|\\.)" + eventType.substring(eventType.indexOf(".")+1,eventType.length) + "($|\\.)");

                for (i=1,len=arguments.length; i<len; i+=1) {
                    parameters.push(arguments[i]);
                }

                for (e in stores) {
                    if (stores.hasOwnProperty(e) && (e === eventType || e.match(eventMatch))) {
                        res = this.TRIGGER(e, parameters);
                        result = res===false ? false : result;

                        // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                        if (res ===true ) {
                            return false;
                        }
                    }
                }
                stores = null;

                return result===false ? false : this;
            }
        });
    };
}(tbc, jQuery));
