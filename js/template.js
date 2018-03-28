(function (window) {
    var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#x27;',
        '`': '&#x60;'
    };

    var escapeHtmlChar = function (chr) {
        return htmlEscapes[chr];
    };

    var reUnescapedHtml = /[&<>"'`]/g;
    // 带 g 结果会随 lastIndex 改变而变化
    var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source); // /[&<>"'`]/

    var escape = function (string) {
        // string 里每一个匹配 reHasUnescapedHtml 的字符都会传入 eacapeHtmlChar,
        // 调用得到用来替换的字符 (因为有 g flag)
        return (string && reHasUnescapedHtml.test(string)) ?
            string.replace(reUnescapedHtml, escapeHtmlChar) :
            string;
    };

    function Template() {}

    /** 
     * render array of todo objects
     * 
     * @example
     * t.show({
     *  id: 1,
     *	title: "Hello World",
     *	completed: 0
     * });
     */
    // [{id:1, title: "hello world",completed: 0}, {id:2, title: "hello",completed: 1},{id:3, title: "world",completed: 0}];
    Template.prototype.show = function (items) {
        return items.reduce(function (accumulator, item) {
            return accumulator + `
        <li data-id="${item.id}"${item.completed ? ' class="completed"' : ''}>
            <div class="view">
                <input class="toggle" type="checkbox"${item.completed ? ' checked' : ''}>
                <label>${escape(item.title)}</label>
                <button class="edit-btn"></button>
                <button class="destroy"></button>
            </div>
        </li>`;
        }, '');
    };

    Template.prototype.activeItemCounter = function (numOfActiveTodos) {
        var plural = (numOfActiveTodos <= 1) ? '' : 's';
        return `<strong>${numOfActiveTodos}</strong> item${plural} left`;
    };

    Template.prototype.clearCompletedButton = function (numOfCompletedTodos) {
        return numOfCompletedTodos > 0 ? 'Clear completed' : '';
    };

    // Export to window
    window.app = window.app || {};
    // 构造器
    window.app.Template = Template;
})(window);