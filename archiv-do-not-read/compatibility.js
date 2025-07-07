// Browser Compatibility Polyfills und Fallbacks
(function() {
    'use strict';
    
    // 1. ES5 POLYFILLS
    
    // Object.assign Polyfill für IE
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }
    
    // Array.find Polyfill
    if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = parseInt(list.length) || 0;
            var thisArg = arguments[1];
            for (var i = 0; i < length; i++) {
                var element = list[i];
                if (predicate.call(thisArg, element, i, list)) {
                    return element;
                }
            }
            return undefined;
        };
    }
    
    // Array.filter Polyfill
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            if (this == null) {
                throw new TypeError('Array.prototype.filter called on null or undefined');
            }
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            var list = Object(this);
            var length = parseInt(list.length) || 0;
            var result = [];
            for (var i = 0; i < length; i++) {
                if (i in list) {
                    var element = list[i];
                    if (callback.call(thisArg, element, i, list)) {
                        result.push(element);
                    }
                }
            }
            return result;
        };
    }
    
    // 2. CANVAS API POLYFILLS
    
    // CanvasRenderingContext2D.roundRect Polyfill
    if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
            if (typeof radius === 'undefined') {
                radius = 5;
            }
            if (typeof radius === 'number') {
                radius = {tl: radius, tr: radius, br: radius, bl: radius};
            } else {
                var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
                for (var side in defaultRadius) {
                    radius[side] = radius[side] || defaultRadius[side];
                }
            }
            
            this.beginPath();
            this.moveTo(x + radius.tl, y);
            this.lineTo(x + width - radius.tr, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
            this.lineTo(x + width, y + height - radius.br);
            this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
            this.lineTo(x + radius.bl, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
            this.lineTo(x, y + radius.tl);
            this.quadraticCurveTo(x, y, x + radius.tl, y);
            this.closePath();
        };
    }
    
    // CanvasRenderingContext2D.ellipse Polyfill
    if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.ellipse) {
        CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            this.save();
            this.translate(x, y);
            this.rotate(rotation);
            this.scale(radiusX, radiusY);
            this.arc(0, 0, 1, startAngle, endAngle, anticlockwise);
            this.restore();
        };
    }
    
    // 3. REQUESTANIMATIONFRAME POLYFILL
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
     
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
     
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());
    
    // 4. WEB AUDIO API COMPATIBILITY
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    
    // 5. GETELEMENTSBYCLASSNAME FALLBACK
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function(className) {
            var allElements = document.getElementsByTagName('*');
            var elements = [];
            for (var i = 0; i < allElements.length; i++) {
                if (allElements[i].className && allElements[i].className.indexOf(className) > -1) {
                    elements.push(allElements[i]);
                }
            }
            return elements;
        };
    }
    
    // 6. CLASSLIST POLYFILL für IE9
    if (!('classList' in document.createElement('_'))) {
        (function(view) {
            var 
                classListProp = "classList",
                protoProp = "prototype",
                elemCtrProto = view.Element[protoProp],
                objCtr = Object,
                strTrim = String[protoProp].trim || function() {
                    return this.replace(/^\s+|\s+$/g, "");
                },
                arrIndexOf = Array[protoProp].indexOf || function(item) {
                    var i = 0, len = this.length;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                };
            
            var DOMTokenList = function(el) {
                this.el = el;
                var classes = el.className.replace(/^\s+|\s+$/g,'').split(/\s+/);
                for (var i = 0; i < classes.length; i++) {
                    this.push(classes[i]);
                }
                this._updateClassName = function() {
                    this.el.className = this.toString();
                };
            };
            
            DOMTokenList[protoProp] = [];
            DOMTokenList[protoProp].item = function(i) {
                return this[i] || null;
            };
            DOMTokenList[protoProp].contains = function(token) {
                token += "";
                return arrIndexOf.call(this, token) !== -1;
            };
            DOMTokenList[protoProp].add = function() {
                var tokens = arguments;
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i] + "";
                    if (arrIndexOf.call(this, token) === -1) {
                        this.push(token);
                    }
                }
                this._updateClassName();
            };
            DOMTokenList[protoProp].remove = function() {
                var tokens = arguments;
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i] + "";
                    var index = arrIndexOf.call(this, token);
                    if (index !== -1) {
                        this.splice(index, 1);
                    }
                }
                this._updateClassName();
            };
            DOMTokenList[protoProp].toggle = function(token, force) {
                token += "";
                var result = this.contains(token),
                    method = result ? force !== true && "remove" : force !== false && "add";
                if (method) {
                    this[method](token);
                }
                return !result;
            };
            DOMTokenList[protoProp].toString = function() {
                return this.join(" ");
            };
            
            if (objCtr.defineProperty) {
                var defineProperty = function(obj, prop, val) {
                    objCtr.defineProperty(obj, prop, { value: val, configurable: true, writable: true });
                };
                defineProperty(elemCtrProto, classListProp, new DOMTokenList(this));
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, function() {
                    return new DOMTokenList(this);
                });
            }
        }(window));
    }
    
    // 7. PERFORMANCE.NOW POLYFILL
    if (!window.performance) {
        window.performance = {};
    }
    if (!window.performance.now) {
        var nowOffset = Date.now();
        window.performance.now = function now() {
            return Date.now() - nowOffset;
        };
    }
    
    // 8. DEVICE PIXEL RATIO FALLBACK
    if (!window.devicePixelRatio) {
        window.devicePixelRatio = 1;
    }
    
    console.log('Compatibility polyfills loaded');
})();