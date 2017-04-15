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
        options: options || {},
        rushId: null, // 记录requestAnimationFrame
        timeoutId: null // 记录setTimeout
    }
    this.taskQuque.push(task);

    return this; // 链式调用
}

/**
 * 开始执行动画队列
 */
Rush.prototype.start = function() {
    console.log('start!');
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
 * 设置执行动画队列次数
 * @param {number} n 重复执行的次数，如果不传入则不断重复
 */
Rush.prototype.setLoop = function(n) {
    // 传入参数
    if (n) {
        if ((n | 0) === n && n > 0) {
            this.loop = n;
        } else {
            throw new Error('循环次数必须是大于等于0的整数!');
        }
    // 不传入参数
    } else {
        this.loop = -1;
    }


    return this;
}

/**
 * 设置无限循环动画队列，一个更友好的接口
 */
Rush.prototype.setLoopForever = function(n) {
    this.setLoop();
    return this;
}

/**
 * 暂停动画
 */
Rush.prototype.pause = function() {
    if (this.state !== STATE_START) {
        return;
    }
    this.state = STATE_STOP;
    let task = this.taskQuque[this.index];

    if (task.rushId !== null) {
        cancelAnimationFrame(task.rushId);
        task.rushId = null;
    }
    if (task.timeoutId !== null) {
        clearTimeout(task.timeoutId);
        task.timeoutId = null;
    }

    return this;
}

/**
 * 继续动画
 */
Rush.prototype.play = function() {
    if (this.state !== STATE_STOP) {
        return;
    }
    this.state = STATE_START;
    let task = this.taskQuque[this.index];

    if (task.rushId === null) {
        this._renderFrame(task);
    }
    return this;
}

/**
 * 执行单个动画任务
 */
Rush.prototype._runTask = function() {
    let task = this.taskQuque[this.index];

    // 无任务，则动画执行完毕
    if (task === undefined) {
        this._done();
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

    task.newProps = newProps;

    let self = this;
    // 是否需要延迟
    task.options.delay ? task.timeoutId = setTimeout(function() {
        // 有before回调函数则执行
        if (task.options.before) {
            task.options.before();
        }
        self._renderFrame(task);
    }, task.options.delay) : (() => {
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

    task.rushId = function() {
        if (self.state !== STATE_START) {
            return;
        }
        let currTime = task.currTime; // 记录当前运行时间
        let easing = task.options.easing ? task.options.easing : EASING_INITIAL; // 设置缓动函数

        for (let key in task.newProps) {
            let beginValue = task.newProps[key].beginValue, // 初始位置
                changeValue = task.newProps[key].toValue - task.newProps[key].beginValue; // 位置改变量

            let newValue = easing(currTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置
            self.el.style[key] = newValue + 'px';
        }

        task.currTime += 17; // 一帧完成，改变动画进行时间

        if (task.currTime >= task.duration) {
            // 直接定位到末状态
            for (let key in task.newProps) {
                self.el.style[key] = task.newProps[key].toValue + 'px';
            }

            // 有after回调函数则执行
            if (task.options.after) {
                task.options.after();
            }

            // 执行下一个任务
            self._next();
        } else {
            requestAnimationFrame(task.rushId);
        }
    };

    requestAnimationFrame(task.rushId);
}

/**
 * 切换到下一个任务
 */
Rush.prototype._next = function() {
    ++this.index;
    this._runTask();
}

/**
 * 对动画队列进行复位，还原到用add方法添加完任务但还没有用start执行的状态
 */
Rush.prototype._reset = function() {
    this.state = STATE_INITIAL;
    this.index = 0;

    for (let i = 0, task; task = this.taskQuque[i++];) {
        task.currTime = 0;
        task.rushId = null;
        task.timeoutId = null;
    }
}

/**
 * 动画队列结束
 */
Rush.prototype._done = function() {
    this._reset();

    while (this.loop === -1) {
        this.start();
        return this;
    }

    if (this.loop && --this.loop) {
        this.start();
    }

    return this;
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
    'left': 450,
}, 1000, {
    before: function() {
        console.log('rush!');
    },
    after: function() {
        console.log('die!');
    }
}).add({
    'left': 250,
    'top': 149
}, 1200, {
    before: function() {
        console.log('123');
    }
}).add({
    'left': 0,
    'top': 0
}, 1200, {
    before: function() {
        console.log('123');
    }
});

rushBlock1.setLoopForever();

rushBlock1.start();

let stopBtn = document.getElementById('stop');

stopBtn.onclick = function() {
    rushBlock1.pause();
}

let moveBtn = document.getElementById('move');

moveBtn.onclick = function() {
    rushBlock1.play();
}
