(function (window) {
    function Model(storage) {
        this.storage = storage;
    }

    // create a new todo item model
    Model.prototype.create = function (title, callback) {
        // log('title model', title);
        title = title || '';
        callback = callback || function () {};

        var newItem = {
            // 移除 title 首尾空格
            title: title.trim(),
            completed: false
        };

        this.storage.save(newItem, callback);
    };

    Model.prototype.read = function (query, callback) {
        var self = this;
        var queryType = typeof query;
        callback = callback || function () {};

        if (queryType === 'function') {
            // 未传入 query, 返回全部
            callback = query;
            this.storage.findAll(callback);
        } else if (queryType === 'string' || queryType === 'number') {
            // 传入 id
            query = parseInt(query, 10);
            this.storage.find({
                id: query
            }, callback);
        } else {
            // 传入对象
            this.storage.find(query, callback);
        }
    };

    Model.prototype.update = function (id, data, callback) {
        // log('id storage*** ', id);
        // log('data storage*** ', data);
        this.storage.save(data, callback, id);
    };

    Model.prototype.remove = function (id, callback) {
        this.storage.remove(id, callback);
    };

    Model.prototype.removeAll = function (callback) {
        this.storage.drop(callback);
    };

    Model.prototype.getCount = function (callback) {
        var todos = {
            active: 0,
            completed: 0,
            total: 0
        };

        this.storage.findAll(function (todoData) {
            // log('todo data model', todoData);
            todoData.forEach(function (todo) {
                if (todo.completed) {
                    todos.completed++;
                } else {
                    todos.active++;
                }
                todos.total++;
            });
            // log('todos model', todos);
            callback(todos);
        });
    };

    window.app = window.app || {};
    window.app.Model = Model;
})(window);