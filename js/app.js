(function () {
    function Todo(name) {
        this.storage = new app.Storage(name);
        this.model = new app.Model(this.storage);
        this.template = new app.Template();
        this.view = new app.View(this.template);

        /* 调用 view.bind, 为各个事件传入 callback, 完成绑定 */
        this.controller = new app.Controller(this.model, this.view);
        // log('app init');
    }

    var todo = new Todo('todo-mvc');

    function setView() {
        // 传入当前页面 hash
        // 页面打开时 hash 为空
        todo.controller.setView(document.location.hash);
    }

    $on(window, 'load', setView);
    $on(window, 'hashchange', setView);
})();