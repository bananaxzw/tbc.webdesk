;(function(tbc, $){

    "use strict";

    /**
     * 实例存储器
     * @protected
     * @property {Object} TASK_DEPOT
     * @for tbc
     * @type {Object}
     */
    tbc.TASK_DEPOT = tbc.TASK_DEPOT || {};

    /**
     * 实例计数器
     * @protected
     * @property {Number} TASK_DEPOT_COUNT
     * @for tbc
     * @type {Number}
     */
    tbc.TASK_DEPOT_COUNT = tbc.TASK_DEPOT_COUNT || 0;

    /**
     * 实例ID递增器，会根据实例的增加而递增, 初始值为0
     * @protected
     * @property {Number} guid
     * @for tbc
     * @type {Number}
     */
    tbc.guid = tbc.guid || 0;

    /**
     * 根据GUID取得一个实例, 或者存储一个实例（如果有task）
     * @protected
     * @method TASKS
     * @for tbc
     * @param  {Number} id   实例GUID
     * @param  {Object} [task] 任意类型的tbc实例
     * @return {Object}      返回实例，如果没有找到则返回null
     */
    tbc.TASKS = function(id, task) {
        if (!id) {
            return null;
        }
        
        if (task && !tbc.TASK_DEPOT[id]) {
            tbc.TASK_DEPOT[id] = task;
            tbc.TASK_DEPOT_COUNT+=1;
        }else{
            return tbc.TASK_DEPOT[id] || null;
        }
    };

    /**
     * 存储实例，同tbc.TASKS(id, task);
     * @protected
     * @method set
     * @for tbc.TASKS
     * @param  {Number} id    实例GUID
     * @param  {Object} task  实例
     */
    tbc.TASKS.set = function(id,task) {
        this(id,task);
    };

    /**
     * 获取实例
     * @protected
     * @method get
     * @for tbc.TASKS
     * @param  {Number} id 实例GUID
     * @return {Object}     返回找到的实例, 否则返回null
     */
    tbc.TASKS.get = function(id) {
        return this(id);
    };

    /**
     * 删除实例
     * @protected
     * @method del
     * @for tbc.TASKS
     * @param  {Number} id      实例GUID
     */
    tbc.TASKS.del=function(id) {
        var t = tbc.TASK_DEPOT[id],
            depend,
            k;
        if (id && t) {
            try {
                if (t.container) {
                    tbc.TASK_DEPOT[id].container.empty().remove();
                }

                if (t.ui) {
                    tbc.TASK_DEPOT[id].ui.empty().remove();
                }
            } catch(e) {

            }
            
            // 删除依赖对象
            depend    = t.DEPENDS || [];
            tbc.TASKS.killAll(depend);
            
            // 删除对象属性
            for (k in t) {
                if (t.hasOwnProperty(k)) {
                    delete tbc.TASK_DEPOT[id][k];
                }
            }

            t=null;
            delete tbc.TASK_DEPOT[id];
        }
    };

    /**
     * 批量销毁对象
     * @protected
     * @method killAll
     * @for tbc.TASKS
     * @param  {Array} depends 要销毁的实例GUID集合
     */
    tbc.TASKS.killAll = function(depends) {
        if (typeof depends === 'array' && depends.length>0) {

            var k, i, len;

            for (k in tbc.TASK_DEPOT) {
                if (tbc.TASK_DEPOT.hasOwnProperty(k) && tbc.TASK_DEPOT[k].DEPENDS) {
                    for (i=0, len=depends.length; i<len; i++) {
                        if (depends[i] === k) {
                            tbc.TASK_DEPOT[k].DESTROY();
                        }
                    }
                }
            }
        }
    };

    /**
     * 根据GUID取得一个实例, 或者存储一个实例（如果有task）
     * @protected
     * @method getTaskByElement
     * @for tbc
     * @param  {Element} elem HTML Element
     * @return {Object}  返回实例，如果没有找到则返回null
     */
    tbc.getTaskByElement = function(elem) {
        var guid = $(elem).attr("tbc");
            guid = guid || $(elem).parents("[tbc]:first").attr("tbc");

        return tbc.TASKS(guid);
    };

    /**
     * TBC实例管理器
     * @class tbc.ClassManager
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.ClassManager = function(o) {

        tbc.self(this, arguments)
        .extend({
        
            /**
             * 依赖此实例的其他实例GUID存储器，在销毁此实例
             * 时, 同时销毁依赖此实例的其他实例;
             * @private
             * @property {Array} DEPENDS
             * @type {Array}
             */
            DEPENDS : [],
            
            /**
             * 使此实例依赖于另外一个对象
             * @public
             * @method depend
             * @param  {Object} obj 被依赖的对象
             * @chainable
             */
            depend : function(obj) {
                if (tbc.isArray(obj.DEPENDS)) {
                    obj.DEPENDS.push(this.guid);
                }
                return this;
            },

            /**
             * 让另外一个对象依赖本实例
             * @public
             * @method dependSelf
             * @param  {Object} obj 要求依赖此实例的对象
             * @chainable
             */
            dependSelf : function(obj) {
                var guid = typeof obj === "object" ? obj.guid : obj;
                this.DEPENDS.push(guid);
                return this;
            },
            
            /**
             * 解除此实例对某一对象的依赖
             * @public
             * @method ubdepend
             * @param  {Object} obj 正在被此实例依赖的对象
             * @chainable
             */
            undepend : function(obj) {
                if (obj && tbc.isArray(obj.DEPENDS)) {
                    obj.DEPENDS = tbc.array.remove(obj.DEPENDS, this.guid);
                }
                return this;
            },
            
            /**
             * 解除某对象对此实例的依赖
             * @public
             * @method undependSelf
             * @param  {Object} obj 正在依赖此实例的对象
             * @chainable
             */
            undependSelf : function(obj) {
                var guid = typeof obj === "object" ? obj.guid : obj;
                this.DEPENDS = tbc.array.remove(this.DEPENDS, guid);
                return this;
            },
            
            /**
             * 初始化
             * @private
             * @method INIT
             * @chainable
             */
            INIT : function() {
                
                var constr = this.constructor;

                this.packageName = "tbc.ClassManager";

                // 正在被初始化的类的构造器的id
                constr.maxid = constr.maxid || 0;
                constr.maxid = constr.maxid + 1;
                this.iid = constr.maxid;
                constr.count = constr.count&&!isNaN(constr.count)?constr.count+1:1;
                
                // 实例存储器
                tbc.guid += 1;
                this.guid = tbc.guid;
                constr.instance = constr.instance || {};
                this.CREATE_TIME = new Date().getTime();

                this.INIT_INSTANCE();

                this.INSTANCE(this.iid, this);
                tbc.TASKS(this.guid, this);

                return this;
            },
            
            /**
             * 销毁当前对象(销毁自己)
             * @public
             * @method DESTROY
             */
            DESTROY : function() {
                var guid = this.guid,
                    iid  = this.iid;

                this.INSTANCE(iid, "del");
                this.triggerEvent("destroy");
                tbc.TASKS.del(guid, false);
                guid = iid = null;
            },
            
            /**
             * 缓存实例到本实例的构造器（不推荐使用）
             * @public
             * @deprecated 不再推荐使用此方法，实例已经缓存到全
             *             局的tbc.TASK_DEPOD实例缓存器, 不推荐
             *             重复缓存，除非要实现特定的功能；
             * @param  {Number} iid       实例的iid，iid通常是此实例的
             *                            构造类的一个递增器，随着其被
             *                            实例化的次数而递增
             * @param  {Object} instance 某一构造类的实例
             * @chainable
             */
            INSTANCE : function(iid, instance) {
                if (!iid) {
                    return null;
                }

                if (instance === "del" && this.constructor.instance[iid]) {
                    delete this.constructor.instance[iid];
                    this.constructor.count = this.constructor.count-1;
                } else if (instance && !this.constructor.instance[iid]) {
                    this.constructor.instance[iid] = instance;
                } else {
                    return this.constructor.instance[iid] || null;
                }
                return this;
            },

            INIT_INSTANCE : function() {

                // 获取实例
                this.INSTANCE.get = function(id) {
                    return this(id);
                };
                
                // 托管实例
                this.INSTANCE.set = function(id, instance) {
                    this(id, instance);
                };
                
                // 删除托管版本
                this.INSTANCE.del = function(id) {
                    this(id, "del");
                };
            }
        })
        .INIT();
    };
}(tbc, jQuery));
