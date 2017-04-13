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

    // return this; // 链式调用
}

/**
 * 添加动画任务
 * @param  {object} props     css属性键值对对象，不需要单位，只支持px，且不支持 margin: 10px 20px 30px 40px 这样的属性缩写，是的就是这么辣鸡
 * @param  {number} duration  动画持续时间，单位ms
 * @param  {function} easing  缓动函数
 */
Rush.prototype.add = function(props, duration, easing) {
    let task = {
        props: props,
        duration: duration || DURATION_INITIAL,
        easing: easing || EASING_INITIAL,
        currTime: 0, // 动画当前进行到的时间
        rush: null
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

    for (let key in props) {
        let beginStyle = getComputedStyle(el).getPropertyValue(key);

        let beginValue = parseFloat(beginStyle.split('px')[0]);
        let toValue = parseFloat(props[key]);

        if (isNaN(beginValue) || isNaN(toValue)) {
            throw new Error("不支持px以外的属性值设置");
        }

        props[key] = {
            beginValue,
            toValue
        }
    }

    task.props = props;
    this._renderFrame(task);
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

        for (let key in task.props) {
            let beginValue = task.props[key].beginValue, // 初始位置
                changeValue = task.props[key].toValue - task.props[key].beginValue; // 位置改变量

            let newValue = task.easing(currTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置
            self.el.style[key] = newValue + 'px';
        }

        task.currTime += 17; // 一帧完成，改变动画进行时间

        if (task.currTime >= task.duration) {
            // 直接定位到末状态
            for (let key in task.props) {
                self.el.style[key] = task.props[key].toValue + 'px';
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

//======================测试========================
let block1 = document.getElementById('test1');

let rushBlock1 = new Rush(block1);
rushBlock1.add({
    width: 300,
    height: 100
}).add({
    margin: 50
}, 400);

rushBlock1.start();
