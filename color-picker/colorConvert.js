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

let hsl2rgb = function(h, s, l) {
    h /= 360;

    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [fixed(r * 255), fixed(g * 255), fixed(b * 255)];
}

let rgb2hsl = function(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

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

    return [fixed(h), fixed(s, 2), fixed(l, 2)];
}

let hsv2hsl = function(h, s, v) {
    let rgbArr = hsv2rgb(h, s, v);
    return rgb2hsl(rgbArr[0], rgbArr[1], rgbArr[2]);
}

let hsl2hsv = function(h, s, l) {
    let rgbArr = hsl2rgb(h, s, l);
    return rgb2hsv(rgbArr[0], rgbArr[1], rgbArr[2]);
}