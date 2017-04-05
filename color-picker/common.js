'use strict';
let fixed = function(num, decimalPlaces) {
    decimalPlaces = decimalPlaces || 0;
    return parseFloat(num.toFixed(decimalPlaces));
}