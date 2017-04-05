'use strict';
let hsv2rgb = function(h, s, v) {
    let r, g, b;

    let i = Math.floor(h / 60);
    let f = h / 60 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }

    return [fixed(r * 255), fixed(g * 255), fixed(b * 255)];
}

let rgb2hsv = function(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, v;
    v = max;

    let d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = 60 * ((g - b) / d + (g < b ? 6 : 0));
                break;
            case g:
                h = 60 * ((b - r) / d + 2);
                break;
            case b:
                h = 60 * ((r - g) / d + 4);
                break;
        }
    }

    return [fixed(h), fixed(s, 2), fixed(v, 2)];
}
