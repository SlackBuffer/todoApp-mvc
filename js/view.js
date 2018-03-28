(function (window) {
    function View(template) {
        this.template = template;

        this.ENTER_KEY = 13;
        this.EACAPE_KEY = 27;

        // new todo 输入框
        this.$newTodo = qs('.new-todo');

        this.$main = qs('.main');
        // 全部标记为已完成
        this.$toggleAll = qs('.toggle-all');
        // todo <ul> 容器
        this.$todoList = qs('.todo-list');

        this.$footer = qs('.footer');
        // 未完成 todo 计数器
        this.$todoItemCounter = qs('.todo-count');
        // 清除所有已完成 todo 按钮
        this.$clearCompleted = qs('.clear-completed');

        // this.iscanceled;
    }

    // remove todo item with id
    View.prototype._removeItem = function (id) {
        // css selector [attr=value] 
        var e = qs('[data-id="' + id + '"]');
        if (e) {
            this.$todoList.removeChild(e);
        }
    };

    View.prototype._clearCompletedButton = function (completedCount, visible) {
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? 'block' : 'none';
    };

    View.prototype._setFilter = function (currentPage) {
        qs('.filters .selected').className = '';
        qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
    };

    View.prototype._elementComplete = function (id, completed) {
        // later
        var item = qs('[data-id="' + id + '"]');
        // log('selected item***', item);

        if (!item) {
            return;
        }
        // log('completed***', completed);
        item.className = completed ? 'completed' : '';
        // log('selected item***', item);

        // 由事件触发的“完成”而不是通过点击 checkbox 的情况
        qs('input', item).checked = completed;
    };

    View.prototype._editItem = function (id, title) {
        var item = qs('[data-id="' + id + '"]');

        if (!item) {
            return;
        }

        item.className += ' editing';

        // 给正在编辑的 todo item 加一个输入框
        var input = document.createElement('input');
        input.className = 'edit';

        item.appendChild(input);
        input.focus();
        input.value = title;
    };

    View.prototype._editItemDone = function (id, title) {
        var item = qs('[data-id="' + id + '"]');

        if (!item) {
            return;
        }

        var input = qs('input.edit', item);
        item.removeChild(input);

        item.className = item.className.replace('editing', '');

        // later qsa
        qsa('label', item).forEach(function (label) {
            label.textContent = title;
        });
    };

    View.prototype.render = function (viewCmd, parameter) {
        var self = this;
        var viewCommands = {
            // 显示 todolist 的内容
            showEntries: function () {
                // log('todo data\n', parameter);
                // log('html\n', self.template.show(parameter));
                self.$todoList.innerHTML = self.template.show(parameter);
            },
            removeItem: function () {
                self._removeItem(parameter);
            },
            // todos 计数器的内容
            updateElementCount: function () {
                self.$todoItemCounter.innerHTML = self.template.activeItemCounter(parameter);
            },
            // clear completed 按钮的样式：是否可见，文本内容
            clearCompletedButton: function () {
                self._clearCompletedButton(parameter.completed, parameter.visible);
            },
            // $main 和 $footer 是否可见，todos 长度为 0 不可见
            contentBlockVisibility: function () {
                // log('parameter controller\n', parameter);
                self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
            },
            // toggleAll 按钮的样式：是否被选中
            toggleAll: function () {
                self.$toggleAll.checked = parameter.checked;
            },
            // 给 filter (All, Active, Completed <a>) 设置 selected 属性
            setFilter: function () {
                // log('setFilter parameter (current page)', parameter);
                self._setFilter(parameter);
            },
            // 新条目保存成功后清空输入栏的内容
            clearNewTodo: function () {
                self.$newTodo.value = '';
            },
            elementComplete: function () {
                self._elementComplete(parameter.id, parameter.completed);
            },
            editItem: function () {
                self._editItem(parameter.id, parameter.title);
            },
            editItemDone: function () {
                self._editItemDone(parameter.id, parameter.title);
            }
        };
        viewCommands[viewCmd]();
    };

    View.prototype._itemId = function (element) {
        var li = $parent(element, 'li');
        return parseInt(li.dataset.id, 10);
    };

    View.prototype._bindItemEditDone = function (handler) {
        var self = this;
        // later
        $delegate(self.$todoList, 'li .edit', 'blur', function () {
            if (!this.dataset.iscanceled) {
                handler({
                    id: self._itemId(this),
                    title: this.value
                });
                /* callback: function() {
                    c.editItemSave();
                } */
            }
        });

        $delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
            if (event.keyCode === self.ENTER_KEY) {
                // 按回车后光标从输入框移除
                // 同时触发 blur 事件保存数据
                this.blur();
            }
        });
    };

    View.prototype._bindItemEditCancel = function (handler) {
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
            if (event.keyCode === self.EACAPE_KEY) {
                this.dataset.iscanceled = true;
                this.blur();

                handler({
                    id: self._itemId(this)
                });
            }
        });
    };

    View.prototype.bind = function (event, handler) {
        var self = this;
        switch (event) {
            case 'newTodo':
                $on(self.$newTodo, 'change', function () {
                    handler(self.$newTodo.value);
                });
                /* 
                callback: function(title) {
                    controller.prototype.addItem(title);
                } 
                */
                break;
            case 'removeCompleted':
                $on(self.$clearCompleted, 'click', function () {
                    handler();
                });
                break;
            case 'toggleAll':
                $on(self.$toggleAll, 'click', function () {
                    handler({
                        completed: this.checked
                    });
                });
                break;
            case 'itemEdit':
                $delegate(self.$todoList, 'li label', 'dblclick', function () {
                    handler({
                        id: self._itemId(this)
                    });
                });
                /* callback: function() {
                    c.editItem({ id: self._itemId(this) });
                } */

                $delegate(self.$todoList, '.edit-btn', 'click', function () {
                    handler({
                        id: self._itemId(this)
                    });
                });
                break;
            case 'itemRemove':
                $delegate(self.$todoList, '.destroy', 'click', function () {
                    handler({
                        id: self._itemId(this)
                    });
                });
                break;
            case 'itemToggle':
                $delegate(self.$todoList, '.toggle', 'click', function () {
                    handler({
                        id: self._itemId(this),
                        completed: this.checked
                    });
                });
                break;
            case 'itemEditDone':
                self._bindItemEditDone(handler);
                break;
            case 'itemEditCancel':
                self._bindItemEditCancel(handler);
                break;
        }
    };

    window.app = window.app || {};
    window.app.View = View;
})(window);