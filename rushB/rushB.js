'use strict';

const DURATION_INITIAL = 1000, // 默认动画执行时间
      EASING_INITIAL = Math.tween.Quad.easeInOut, // 默认缓动效果
      FrameTime = 17, // 每一帧的时间，单位ms
      STATE_INITIAL = 0,
      STATE_START = 1,
      STATE_STOP = 2;

/**
 * 动画类
 * @param  {dom} el       进行动画的dom对象
 */
let Rush = function(el) {
    this.el = el;
    this.state = STATE_INITIAL; // 动画状态
    this.taskQuque = []; // 任务队列
    this.index = 0; // 任务标识
}

/**
 * 添加动画任务
 * @param  {object} props     css属性键值对对象，不需要单位，只支持px，且不支持 margin: 10px 20px 30px 40px 这样的属性缩写，是的就是这么辣鸡
 * @param  {number} duration  动画持续时间，单位ms
 * @param {object} options 定制选项，支持的参数：
 * {
 *     before: function() {} // 此动画任务开始前触发的函数（如果有delay，在delay结束后才触发）
 *     after: function() {} // 此动画任务结束后立即触发的函数
 *     delay: 200 // 此动画任务开始前的延时
 *     easing: Math.tween.Quad.easeInOut 缓动函数
 * }
 */
Rush.prototype.add = function(props, duration, options) {
    let task = {
        props: props,
        duration: duration,
        currTime: 0, // 动画当前进行到的时间
        rush: null,
        options: options || {}
    }
    this.taskQuque.push(task);

    return this; // 链式调用
}

/**
 * 开始执行动画队列
 */
Rush.prototype.start = function() {
    if (this.state === STATE_START) {
        return;
    }
    if (!this.taskQuque.length) {
        return;
    }
    this.state = STATE_START;

    this._runTask();
}

/**
 * 执行单个动画任务
 */
Rush.prototype._runTask = function() {
    let task = this.taskQuque[this.index];

    // 无任务，则动画执行完毕
    if (task === undefined) {
        this.done();
        return;
    }

    let el = this.el;

    let props = task.props;

    let newProps = {};

    for (let key in props) {
        let beginStyle = getComputedStyle(el).getPropertyValue(key);

        let beginValue = parseFloat(beginStyle.split('px')[0]);
        let toValue = parseFloat(props[key]);

        if (isNaN(beginValue) || isNaN(toValue)) {
            throw new Error("不支持px以外的属性值设置");
        }

        key = transferStyleName(key); // 将连字符格式转换为驼峰式

        newProps[key] = {
            beginValue,
            toValue
        }
    }

    task.props = newProps;

    let self = this;
    // 是否需要延迟
    task.options.delay
    ? setTimeout(function() {
        // 有before回调函数则执行
        if (task.options.before) {
            task.options.before();
        }
        self._renderFrame(task);
    }, task.options.delay)
    : (() => {
        if (task.options.before) {
            task.options.before();
        }
        this._renderFrame(task);
    })();
}

/**
 * 具体渲染过程
 * @param  {object} task 任务对象
 */
Rush.prototype._renderFrame = function(task) {
    let self = this;

    let duration = task.duration;

    task.animation = function() {
        let currTime = task.currTime; // 记录当前运行时间
        let easing = task.options.easing ? task.options.easing : EASING_INITIAL; // 设置缓动函数

        for (let key in task.props) {
            let beginValue = task.props[key].beginValue, // 初始位置
                changeValue = task.props[key].toValue - task.props[key].beginValue; // 位置改变量

            let newValue = easing(currTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置
            self.el.style[key] = newValue + 'px';
        }

        task.currTime += 17; // 一帧完成，改变动画进行时间

        if (task.currTime >= task.duration) {
            // 直接定位到末状态
            for (let key in task.props) {
                self.el.style[key] = task.props[key].toValue + 'px';
            }

            // 有after回调函数则执行
            if (task.options.after) {
                task.options.after();
            }

            // 执行下一个任务
            self._next();
        } else {
            requestAnimationFrame(task.animation); 
        }
    };

    requestAnimationFrame(task.animation);
}

/**
 * 切换到下一个任务
 */
Rush.prototype._next = function() {
    ++this.index;
    this._runTask();
}

Rush.prototype.done = function() {
    if (this.state !== STATE_INITIAL) {
        this.state = STATE_INITIAL;
    }
    return;
}

/**
 * 将连字符的style名转换为驼峰格式
 * @param {string} style 连字符形式的属性名
 */
let transferStyleName = function(style) {
    if (typeof style !== 'string') {
        throw new Error(`属性${style}不是字符串`);
    }

    let arr = style.split('-');
    if (arr.length > 1) {
        let newStyle = arr[0];
        for (let i = 1, name = arr[i]; arr[i++];) {
            name = name.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()); // 首字母大写
            newStyle += name;
        }

        return newStyle;
    } else {
        return style;
    }
}

//======================测试========================
let block1 = document.getElementById('test1');

let rushBlock1 = new Rush(block1).add({
    width: 300,
    height: 100
}, 600, {
    before: function() {
        console.log('rush!');
    },
    after: function() {
        console.log('die!');
    }
}).add({
    'margin-left': 50
}, 400, {
    delay: 1000,
    before: function() {
        console.log('123');
    }
});

rushBlock1.start();
