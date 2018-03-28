(function (window) {
    function Storage(name, callback) {
        this._dbName = name;

        callback = callback || function () {};

        if (!localStorage[name]) {
            var data = {
                todos: []
            };
            localStorage[name] = JSON.stringify(data);
        }

        callback.call(this, JSON.parse(localStorage[name]));
    }

    /**
     * @param {object} query (i.e. {foo: 'bar'})
     */
    Storage.prototype.find = function (query, callback) {
        if (!callback) {
            return;
        }

        var todos = JSON.parse(localStorage[this._dbName]).todos;

        callback.call(this, todos.filter(function (todo) {
            for (var key in query) {
                if (query[key] !== todo[key]) {
                    return false;
                }
            }
            return true;
        }));
    };

    Storage.prototype.findAll = function (callback) {
        callback = callback || function () {};
        // 此回调函数为各个类别的 todo 计数
        callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
    };

    Storage.prototype.save = function (updateData, callback, id) {
        var data = JSON.parse(localStorage[this._dbName]);
        // 引用类型, todos 的改变会同步到 data.todos
        var todos = data.todos;

        callback = callback || function () {};

        if (id) {
            // 若传入 id, 则更新指定 id 的 todo item
            // log('existed id***');
            for (var i = 0, len = todos.length; i < len; i++) {
                var todo = todos[i];
                if (todo.id === id) {
                    for (var key in updateData) {
                        todo[key] = updateData[key];
                    }
                    // log('updated todo*** ', todo);
                    break;
                }
            }

            localStorage[this._dbName] = JSON.stringify(data);
            callback.call(this, todos);
        } else {
            // 未传入 id 表明是新增的 todo, 新建 id 并将条目写入 db
            updateData.id = new Date().getTime();

            todos.push(updateData);
            localStorage[this._dbName] = JSON.stringify(data);
            // log('[updateData]', [updateData]);   // 对象数组
            // later
            // log('callback storage', callback);
            // 为用到 this 和 [updateData]
            callback.call(this, [updateData]);
        }
    };

    Storage.prototype.remove = function (id, callback) {
        var data = JSON.parse(localStorage[this._dbName]);
        var todos = data.todos;

        for (var i = 0, len = todos.length; i < len; i++) {
            if (todos[i].id == id) {
                todos.splice(i, 1);
                break;
            }
        }

        localStorage[this._dbName] = JSON.stringify(data);
        callback.call(this, todos);
    };

    Storage.prototype.drop = function (callback) {
        var data = {
            todos: []
        };
        localStorage[this._dbName] = JSON.stringify(data);
        callback.call(this, data.todos);
    };

    window.app = window.app || {};
    window.app.Storage = Storage;
})(window);