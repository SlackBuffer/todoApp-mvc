(function (window) {
    function Controller(model, view) {
        var self = this;
        self.model = model;
        self.view = view;

        self.view.bind('newTodo', function (title) {
            self.addItem(title);
        });

        self.view.bind('itemEdit', function (item) {
            self.editItem(item.id);
        });

        self.view.bind('itemEditDone', function (item) {
            self.editItemSave(item.id, item.title);
        });

        self.view.bind('itemEditCancel', function (item) {
            self.editItemCancel(item.id);
        });

        self.view.bind('itemRemove', function (item) {
            self.removeItem(item.id);
        });

        self.view.bind('itemToggle', function (item) {
            self.toggleComplete(item.id, item.completed);
        });

        self.view.bind('removeCompleted', function () {
            self.removeCompletedItems();
        });

        self.view.bind('toggleAll', function (status) {
            self.toggleAll(status.completed);
        });

        /* 
         * this._activeRoute;
         * this._lastActiveRoute;
         */
    }

    Controller.prototype.setView = function (locationHash) {
        var route = locationHash.split('/')[1];
        // log('route', route);
        var page = route || '';
        // log('page', page);
        this._updateFilterState(page);
    };

    Controller.prototype.showAll = function () {
        var self = this;
        self.model.read(function (data) {
            self.view.render('showEntries', data);
        });
    };

    Controller.prototype.showActive = function () {
        var self = this;
        self.model.read({
            completed: false
        }, function (data) {
            self.view.render('showEntries', data);
        });
    };

    Controller.prototype.showCompleted = function () {
        var self = this;
        self.model.read({
            completed: true
        }, function (data) {
            self.view.render('showEntries', data);
        });
    };

    Controller.prototype.addItem = function (title) {
        var self = this;
        // log('title controller', title);

        if (title.trim() === '') {
            return;
        }

        self.model.create(title, function () {
            // log('this\n', this);
            self.view.render('clearNewTodo');

            // 强制刷新
            self._filter(true);
            // log('self\n', self);
        });
    };

    Controller.prototype.editItem = function (id) {
        var self = this;
        self.model.read(id, function (data) {
            log('id of item being edited: ', id);
            self.view.render('editItem', {
                id: id,
                title: data[0].title
            });
        });
    };

    Controller.prototype.editItemSave = function (id, title) {
        var self = this;
        title = title.trim();

        if (title.length !== 0) {
            self.model.update(id, {
                title: title
            }, function () {
                self.view.render('editItemDone', {
                    id: id,
                    title: title
                });
            });
        } else {
            self.removeItem(id);
        }
    };

    Controller.prototype.editItemCancel = function (id) {
        var self = this;
        self.model.read(id, function (data) {
            self.view.render('editItemDone', {
                id: id,
                title: data[0].title
            });
        });
    };

    Controller.prototype.removeItem = function (id) {
        var self = this;
        self.model.remove(id, function () {
            self.view.render('removeItem', id);
        });
        self._filter();
    };

    Controller.prototype.removeCompletedItems = function () {
        var self = this;
        self.model.read({
            completed: true
        }, function (data) {
            data.forEach(function (item) {
                self.removeItem(item.id);
            });
        });
        self._filter();
    };

    Controller.prototype.toggleComplete = function (id, completed, silent) {
        // log('id*** ', id);
        // log('completed*** ', completed);
        var self = this;
        self.model.update(id, {
            completed: completed
        }, function () {
            self.view.render('elementComplete', {
                id: id,
                completed: completed
            });
        });
        if (!silent) {
            self._filter();
        }
    };

    Controller.prototype.toggleAll = function (completed) {
        var self = this;
        self.model.read({
            completed: !completed
        }, function (data) {
            data.forEach(function (item) {
                self.toggleComplete(item.id, completed, true);
            });
        });
        self._filter();
    };

    // 调用 view 里的 4 个渲染方法
    Controller.prototype._updateCount = function () {
        var self = this;
        self.model.getCount(function (todos) {
            // log('todos controller', todos);
            // log('total todos\n', todos.total);
            self.view.render('updateElementCount', todos.active);
            self.view.render('clearCompletedButton', {
                completed: todos.completed,
                visible: todos.completed > 0
            });
            self.view.render('toggleAll', {
                checked: todos.completed === todos.total
            });
            self.view.render('contentBlockVisibility', {
                visible: todos.total > 0
            });
        });
    };

    // 记录当前激活页面和上一个激活页面
    Controller.prototype._filter = function (force) {
        var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

        // log('active route', activeRoute);
        this._updateCount();

        if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {

            // log('show' + activeRoute);
            this['show' + activeRoute]();
        }

        this._lastActiveRoute = activeRoute;
    };

    // 根据 filter 调用渲染页面的函数
    Controller.prototype._updateFilterState = function (currentPage) {
        this._activeRoute = currentPage;
        // 传入空字符串即设为 All
        if (currentPage === '') {
            this._activeRoute = 'All';
        }

        // 
        this._filter();

        // 改样式
        this.view.render('setFilter', currentPage);
    };

    window.app = window.app || {};
    window.app.Controller = Controller;
})(window);