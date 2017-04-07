'use strict';
let fixed = function(num, decimalPlaces) {
    decimalPlaces = decimalPlaces || 0;
    return parseFloat(num.toFixed(decimalPlaces));
}

let throttleV2 = function(fn, delay, mustRunDelay){
    let timer = null;
    let t_start;
    return function(){
        let context = this, args = arguments, t_curr = +new Date();
        clearTimeout(timer);
        if(!t_start){
            t_start = t_curr;
        }
        if(t_curr - t_start >= mustRunDelay){
            fn.apply(context, args);
            t_start = t_curr;
        }
        else {
            timer = setTimeout(function(){
                fn.apply(context, args);
            }, delay);
        }
    };
 };