// 辅助函数

(function (window) {
    // log
    window.log = function () {
        console.log.apply(console, arguments);
    };

    // 选择元素
    window.qs = function (selector, scope) {
        return (scope || document).querySelector(selector);
    };
    window.qsa = function (selector, scope) {
        return (scope || document).querySelectorAll(selector);
    };

    // 添加事件处理器
    window.$on = function (target, type, callback, useCapture) {
        // 不传 useCapture 默认 false, 冒泡阶段捕获
        target.addEventListener(type, callback, !!useCapture);
    };

    // 事件委托
    window.$delegate = function (rootElement, selector, type, handler) {
        function dispatchEvent(event) {
            // 发生事件的真实节点
            var targetElement = event.target;
            // log('target element: ', targetElement);

            // 筛选 rootElement 节点下所有匹配选择器的节点
            var matchSubElements = window.qsa(selector, rootElement);

            // log('event type ', event.type);
            /* if (event.type == 'dblclick') {
                log('matched elements: ', matchSubElements);
            } */

            var hasMatch = Array.prototype.indexOf.call(matchSubElements, targetElement) >= 0;

            // 若 targetElement 是匹配选择器节点的一员，为其绑定事件处理器
            // 通过这种方式，每次点击父节点下的某个子节点，就会该子节点绑定事件处理器
            if (hasMatch) {
                // log('has match: ', hasMatch);
                handler.call(targetElement, event);
            }
        }

        var useCapture = (type === 'blur') || (type === 'focus');
        window.$on(rootElement, type, dispatchEvent, useCapture);
    };

    // 寻找最近的 tagName 父节点 （不包括自身）
    // Element.closest() （包括自身）
    window.$parent = function (element, tagName) {
        if (!element.parentNode) {
            // 不存在符合要求的父节点，返回 undefined
            return;
        }
        if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
            return element.parentNode;
        }
        // 递归
        return window.$parent(element.parentNode, tagName);
    };

    NodeList.prototype.forEach = Array.prototype.forEach;
})(window);