// 在线人数更新

tbc.namespace("tbc.tree");
tbc.tree.Online = function (settings) {
    var defaults = { },
        options = $.extend({}, defaults, settings),
        ajaxTimeout,
        SELF;

    SELF = tbc.self(this, arguments)
    .extend([tbc.Tree, settings], {

        packageName : "tbc.tree.Online",

        /*
         * 更新部门的在线人数
         * @param   : curr[number]; 第几批
         * @length  : 部门总数
         */
        renderOnlineNumber : function () {
            this.batch (
                this._cacheIndex, 1000, 0, 10,
                function (portion, completed) {
                    var id;
                    for (var i=0,len=portion.length; i<len; i++) {
                        id = portion[i];
                        this.render2Html(id, this.cache(id,"amount"));
                    }
                    portion = id = null;

                    /* 如果是最后一个部门 */
                    if (completed) {
                        var _this = this;
                        ajaxTimeout = setTimeout(function() {
                            _this.request();
                            _this = null;
                        }, this.interval||(3*60*1000));
                    }
                }
            );
        },

        /*
         * 更新某一个部门的在线学员总数
         * @param   : id[string]; 部门ID
         */
        singleRender : function (id) {

            var i, len, _id;

            id = $.isArray(id) ? id : [id];

            for (i=0, len=id.length; i<len; i++) {
                _id=id[i];
                this.render2Html(_id, this.cache(_id, "amount"));
            }
        },

        /*
         * 在界面上显示部门的在线人数
         * @param   : id[string]; 部门ID
         * @param   : total[number]; 此部门在线学员的总数
         */
        render2Html : function (id, total) {

            total = (!total||isNaN(total)?0:total);

            var itm = $(this.cache(id,"html")),
                num = itm.find(".stree-count");
            if (itm.size()) {
                num.size()
                ? num.html("&nbsp;["+ total +"]")
                : itm.append('<i class="stree-count">&nbsp;['+ total +']</i>');
            }

        },

        /*
         * 统计每个部门的在线学员总数(包括所有子部门的人数)
         * 从服务器端返回的人数是不包括子部门人数的;
         */
        countOnlineNumber : function (json, parents) {
            parents = parents||[];
            var id, n, c, js, len;
            for (var k=0,l=json.length; k<l; k++) {
                js  = json[k];
                id  = js.id;
                n   = js.n;
                c   = js.sn||js.c;

                this.cache(id, "amount", n);

                if (c&&c.length>0) {
                    this.countOnlineNumber(c, parents.concat([id]));
                }

                this.updateParents (parents, n)
            }
            id = n = c = js = len = null;
        },

        /*
         * 给所有上级部门增加人数
         * @param   : parents[array]; 所有上级部门
         * @param   : amount[number]; 需要增加的人数
         */
        updateParents : function (parents, amount) {
            for (var i=0,l=parents.length; i<l; i++) {
                var _amount = this.cache(parents[i], "amount");
                this.cache(parents[i], "amount", amount+_amount);
            }
        },


        // 加载各部门在线人数总数
        request : function() {
            var self = SELF;
            $.ajax({
                url     : options.onlineUrl,
                type    : "get",
                dataType: "json",
                success : function (json) {
                    self.countOnlineNumber(json);
                    self.renderOnlineNumber();
                    self = null;
                }
            });
        },

        start : function() {
            this.request();
        },

        stop : function() {
            clearTimeout(ajaxTimeout);
        }
    });

    SELF.addEvent({
        "itemRender" : function(c) {
            try{
            for (var i=0,l=c.length,d=[]; i<l; i++) {
                d.push(c[i].id);
            }
            this.singleRender(d);
            }catch(e) {
                alert(e.line);
            }
        }
    });
}