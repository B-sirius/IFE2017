'use strict';

const DURATION_INITIAL = 1000,
      EASING_INITIAL = Math.tween.Quad.easeInOut,
      STATE_INITIAL = 0;
      STATE_START = 1;
      STATE_STOP = 2;

/**
 * 动画类
 * @param  {dom} el       进行动画的dom对象
 * @param  {obj} props    css属性键值对对象
 * @param  {number} duration 动画持续时间，单位ms
 * @param  {function} easing   缓动函数
 * @return {[type]}          [description]
 */
let Animation = function(el, props, duration, easing) {
    this.el = el;
    this.props = props;
    this.duration = duration || DURATION_INITIAL;
    this.easing = easing || EASING_INITIAL;
    this.state = STATE_INITIAL; // 动画状态
    this.animation = null;
    // this.taskQuque = []; // 任务队列
    // this.index = 0; // 任务标识
}

Animation.prototype.start = function() {
    if (this.state = STATE_START) {
        return;
    }
    // if (!this.taskQuque.length) {
    //     return;
    // }
    this.state = STATE_START;

    this._runTask();
}

Animation.prototype._runTask = function() {
    let el = this.el;
    let props = this.props;

    for (key in props) {
        let fromValue = el.style[key];
        let toValue = props[key];

        key = {
            fromValue,
            toValue
        }
    }

    this.props = props;
}

let renderFrame = (function() {
    const perFrameTime = 17; // 帧间隔，按每秒60帧，1帧约17ms

    return function(obj) {
        obj.animationId = requestAnimationFrame(function() {
            //////////////////////////////////////////////////////////////mark
        });
    }
})();
