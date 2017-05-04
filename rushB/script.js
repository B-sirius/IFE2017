'use strict';

var btnState = {
    'enable': function(btn) {
        btn.classList.remove('disable');
    },
    'disable': function(btn) {
        btn.classList.add('disable');
    }
}

var rushHandler = {
    0: function(rush, btn) { // STATE_INITIAL
        btn.innerHTML = '暂停';
        rush.start();
    },
    1: function(rush, btn) { // STATE_START
        btn.innerHTML = '继续';
        rush.pause();
    },
    2: function(rush, btn) { // STATE_STOP
        btn.innerHTML = '暂停';
        rush.play();
    }
}

var $ = function(id) {
    return document.getElementById(id);
}

var initDemo = (function() {
    var demo1 = (function() {
        var block1 = $('block1');
        var btn1 = $('btn1');

        var rush1 = new Rush(block1).add({
            width: 300,
            height: '200px'
        }, 1000, {
            before: function() {
                btnState['disable'](btn1);
            }
        }).add({
            'width': 70,
            'height': 70,
            'margin-left': 200
        }, 700, {
            after: function() {
                btnState['enable'](btn1);
            }
        });

        btn1.onclick = function() {
            block1.style = '';
            rush1.start();
        };
    })();

    var demo2 = (function() {
        var block2 = $('block2');
        var btn2 = $('btn2');

        var rush2 = new Rush(block2).add({
            translateX: 200,
            rotateZ: 360
        }, 1000, {
            before: function() {
                btnState['disable'](btn2);
            }
        }).add({
            translateX: 0,
            rotateZ: '0deg'
        }, 1000, {
            after: function() {
                btnState['enable'](btn2);
            }
        });

        btn2.onclick = function() {
            rush2.start();
        };
    })();

    var demo3 = (function() {
        var block3 = $('block3');
        var btn3 = $('btn3');

        var rush3 = new Rush(block3).add({
            'background-color': '#C54CFF'
        }, 1000, {
            before: function() {
                btnState['disable'](btn3);
            }
        }).add({
            'background-color': 'rgba(79, 249, 255, 0.8)'
        }, 1000, {
            after: function() {
                btnState['enable'](btn3);
            }
        });

        btn3.onclick = function() {
            block3.style = '';
            rush3.start();
        };
    })();

    var demo4 = (function() {
        var block4 = $('block4');
        var btn4 = $('btn4');

        var rush4 = new Rush(block4).add('slideUp', 1000, {
            before: function() {
                btnState['disable'](btn4);
            }
        }).add('slideDown', 1000, {
            after: function() {
                btnState['enable'](btn4);
                alert('p90 rush b, dont stop!');
            },
            delay: 600,
        });

        btn4.onclick = function() {
            rush4.start();
        };
    })();

    var demo5 = (function() {
        var block5 = $('block5');
        var btn5_1 = $('btn5-1');
        var btn5_2 = $('btn5-2');

        var rush5 = new Rush(block5);
        rush5.add({
            translateX: 300,
            rotateZ: 360
        }, 800);
        rush5.add({
            translateX: 0,
            rotateZ: 0
        },1200, {
            after: function() {
                btn5_1.innerHTML = '开始';
                console.log('wow');
            },
            before: function() {
                console.log('233');
            }
        });

        rush5.setLoop(3);

        btn5_1.onclick = function() {
            rushHandler[rush5.state](rush5, btn5_1);
        };

        btn5_2.onclick = function() {
            rush5.finish();
        }
    })();
})();


