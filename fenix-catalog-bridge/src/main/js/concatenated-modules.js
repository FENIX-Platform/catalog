/*! NProgress (c) 2013, Rico Sta. Cruz
 *  http://ricostacruz.com/nprogress */

;
(function (factory) {

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define('nprogress',factory);
    } else {
        this.NProgress = factory();
    }

})(function () {
    var NProgress = {};

    NProgress.version = '0.1.3';

    var Settings = NProgress.settings = {
        minimum: 0.08,
        easing: 'ease',
        positionUsing: '',
        speed: 200,
        trickle: true,
        trickleRate: 0.02,
        trickleSpeed: 800,
        showSpinner: true,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
    };

    /**
     * Updates configuration.
     *
     *     NProgress.configure({
   *       minimum: 0.1
   *     });
     */
    NProgress.configure = function (options) {
        var key, value;
        for (key in options) {
            value = options[key];
            if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
        }

        return this;
    };

    /**
     * Last number.
     */

    NProgress.status = null;

    /**
     * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
     *
     *     NProgress.set(0.4);
     *     NProgress.set(1.0);
     */

    NProgress.set = function (n) {
        var started = NProgress.isStarted();

        n = clamp(n, Settings.minimum, 1);
        NProgress.status = (n === 1 ? null : n);

        var progress = NProgress.render(!started),
            bar = progress.querySelector(Settings.barSelector),
            speed = Settings.speed,
            ease = Settings.easing;

        progress.offsetWidth;
        /* Repaint */

        queue(function (next) {
            // Set positionUsing if it hasn't already been set
            if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

            // Add transition
            css(bar, barPositionCSS(n, speed, ease));

            if (n === 1) {
                // Fade out
                css(progress, {
                    transition: 'none',
                    opacity: 1
                });
                progress.offsetWidth;
                /* Repaint */

                setTimeout(function () {
                    css(progress, {
                        transition: 'all ' + speed + 'ms linear',
                        opacity: 0
                    });
                    setTimeout(function () {
                        NProgress.remove();
                        next();
                    }, speed);
                }, speed);
            } else {
                setTimeout(next, speed);
            }
        });

        return this;
    };

    NProgress.isStarted = function () {
        return typeof NProgress.status === 'number';
    };

    /**
     * Shows the progress bar.
     * This is the same as setting the status to 0%, except that it doesn't go backwards.
     *
     *     NProgress.start();
     *
     */
    NProgress.start = function () {
        if (!NProgress.status) NProgress.set(0);

        var work = function () {
            setTimeout(function () {
                if (!NProgress.status) return;
                NProgress.trickle();
                work();
            }, Settings.trickleSpeed);
        };

        if (Settings.trickle) work();

        return this;
    };

    /**
     * Hides the progress bar.
     * This is the *sort of* the same as setting the status to 100%, with the
     * difference being `done()` makes some placebo effect of some realistic motion.
     *
     *     NProgress.done();
     *
     * If `true` is passed, it will show the progress bar even if its hidden.
     *
     *     NProgress.done(true);
     */

    NProgress.done = function (force) {
        if (!force && !NProgress.status) return this;

        return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
    };

    /**
     * Increments by a random amount.
     */

    NProgress.inc = function (amount) {
        var n = NProgress.status;

        if (!n) {
            return NProgress.start();
        } else {
            if (typeof amount !== 'number') {
                amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
            }

            n = clamp(n + amount, 0, 0.994);
            return NProgress.set(n);
        }
    };

    NProgress.trickle = function () {
        return NProgress.inc(Math.random() * Settings.trickleRate);
    };

    /**
     * Waits for all supplied jQuery promises and
     * increases the progress as the promises resolve.
     *
     * @param $promise jQUery Promise
     */
    (function () {
        var initial = 0, current = 0;

        NProgress.promise = function ($promise) {
            if (!$promise || $promise.state() == "resolved") {
                return this;
            }

            if (current == 0) {
                NProgress.start();
            }

            initial++;
            current++;

            $promise.always(function () {
                current--;
                if (current == 0) {
                    initial = 0;
                    NProgress.done();
                } else {
                    NProgress.set((initial - current) / initial);
                }
            });

            return this;
        };

    })();

    /**
     * (Internal) renders the progress bar markup based on the `template`
     * setting.
     */

    NProgress.render = function (fromStart) {
        if (NProgress.isRendered()) return document.getElementById('nprogress');

        addClass(document.documentElement, 'nprogress-busy');

        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = Settings.template;

        var bar = progress.querySelector(Settings.barSelector),
            perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
            spinner;

        css(bar, {
            transition: 'all 0 linear',
            transform: 'translate3d(' + perc + '%,0,0)'
        });

        if (!Settings.showSpinner) {
            spinner = progress.querySelector(Settings.spinnerSelector);
            spinner && removeElement(spinner);
        }

        document.body.appendChild(progress);
        return progress;
    };

    /**
     * Removes the element. Opposite of render().
     */

    NProgress.remove = function () {
        removeClass(document.documentElement, 'nprogress-busy');
        var progress = document.getElementById('nprogress');
        progress && removeElement(progress);
    };

    /**
     * Checks if the progress bar is rendered.
     */

    NProgress.isRendered = function () {
        return !!document.getElementById('nprogress');
    };

    /**
     * Determine which positioning CSS rule to use.
     */

    NProgress.getPositioningCSS = function () {
        // Sniff on document.body.style
        var bodyStyle = document.body.style;

        // Sniff prefixes
        var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
            ('MozTransform' in bodyStyle) ? 'Moz' :
                ('msTransform' in bodyStyle) ? 'ms' :
                    ('OTransform' in bodyStyle) ? 'O' : '';

        if (vendorPrefix + 'Perspective' in bodyStyle) {
            // Modern browsers with 3D support, e.g. Webkit, IE10
            return 'translate3d';
        } else if (vendorPrefix + 'Transform' in bodyStyle) {
            // Browsers without 3D support, e.g. IE9
            return 'translate';
        } else {
            // Browsers without translate() support, e.g. IE7-8
            return 'margin';
        }
    };

    /**
     * Helpers
     */

    function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }

    /**
     * (Internal) converts a percentage (`0..1`) to a bar translateX
     * percentage (`-100%..0%`).
     */

    function toBarPerc(n) {
        return (-1 + n) * 100;
    }


    /**
     * (Internal) returns the correct CSS for changing the bar's
     * position given an n percentage, and speed and ease from Settings
     */

    function barPositionCSS(n, speed, ease) {
        var barCSS;

        if (Settings.positionUsing === 'translate3d') {
            barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
        } else if (Settings.positionUsing === 'translate') {
            barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
        } else {
            barCSS = { 'margin-left': toBarPerc(n) + '%' };
        }

        barCSS.transition = 'all ' + speed + 'ms ' + ease;

        return barCSS;
    }

    /**
     * (Internal) Queues a function to be executed.
     */

    var queue = (function () {
        var pending = [];

        function next() {
            var fn = pending.shift();
            if (fn) {
                fn(next);
            }
        }

        return function (fn) {
            pending.push(fn);
            if (pending.length == 1) next();
        };
    })();

    /**
     * (Internal) Applies css properties to an element, similar to the jQuery
     * css method.
     *
     * While this helper does assist with vendor prefixed property names, it
     * does not perform any manipulation of values prior to setting styles.
     */

    var css = (function () {
        var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
            cssProps = {};

        function camelCase(string) {
            return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
                return letter.toUpperCase();
            });
        }

        function getVendorProp(name) {
            var style = document.body.style;
            if (name in style) return name;

            var i = cssPrefixes.length,
                capName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName;
            while (i--) {
                vendorName = cssPrefixes[i] + capName;
                if (vendorName in style) return vendorName;
            }

            return name;
        }

        function getStyleProp(name) {
            name = camelCase(name);
            return cssProps[name] || (cssProps[name] = getVendorProp(name));
        }

        function applyCss(element, prop, value) {
            prop = getStyleProp(prop);
            element.style[prop] = value;
        }

        return function (element, properties) {
            var args = arguments,
                prop,
                value;

            if (args.length == 2) {
                for (prop in properties) {
                    value = properties[prop];
                    if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
                }
            } else {
                applyCss(element, args[1], args[2]);
            }
        }
    })();

    /**
     * (Internal) Determines if an element or space separated list of class names contains a class name.
     */

    function hasClass(element, name) {
        var list = typeof element == 'string' ? element : classList(element);
        return list.indexOf(' ' + name + ' ') >= 0;
    }

    /**
     * (Internal) Adds a class to an element.
     */

    function addClass(element, name) {
        var oldList = classList(element),
            newList = oldList + name;

        if (hasClass(oldList, name)) return;

        // Trim the opening space.
        element.className = newList.substring(1);
    }

    /**
     * (Internal) Removes a class from an element.
     */

    function removeClass(element, name) {
        var oldList = classList(element),
            newList;

        if (!hasClass(element, name)) return;

        // Replace the class name.
        newList = oldList.replace(' ' + name + ' ', ' ');

        // Trim the opening and closing spaces.
        element.className = newList.substring(1, newList.length - 1);
    }

    /**
     * (Internal) Gets a space separated list of the class names on the element.
     * The list is wrapped with a single space on each end to facilitate finding
     * matches within the list.
     */

    function classList(element) {
        return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
    }

    /**
     * (Internal) Removes an element from the DOM.
     */

    function removeElement(element) {
        element && element.parentNode && element.parentNode.removeChild(element);
    }

    return NProgress;
});


/*! jQuery v2.1.0 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function (a, b) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function (a) {
        if (!a.document)throw new Error("jQuery requires a window with a document");
        return b(a)
    } : b(a)
}("undefined" != typeof window ? window : this, function (a, b) {
    var c = [], d = c.slice, e = c.concat, f = c.push, g = c.indexOf, h = {}, i = h.toString, j = h.hasOwnProperty, k = "".trim, l = {}, m = a.document, n = "2.1.0", o = function (a, b) {
        return new o.fn.init(a, b)
    }, p = /^-ms-/, q = /-([\da-z])/gi, r = function (a, b) {
        return b.toUpperCase()
    };
    o.fn = o.prototype = {jquery: n, constructor: o, selector: "", length: 0, toArray: function () {
        return d.call(this)
    }, get: function (a) {
        return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this)
    }, pushStack: function (a) {
        var b = o.merge(this.constructor(), a);
        return b.prevObject = this, b.context = this.context, b
    }, each: function (a, b) {
        return o.each(this, a, b)
    }, map: function (a) {
        return this.pushStack(o.map(this, function (b, c) {
            return a.call(b, c, b)
        }))
    }, slice: function () {
        return this.pushStack(d.apply(this, arguments))
    }, first: function () {
        return this.eq(0)
    }, last: function () {
        return this.eq(-1)
    }, eq: function (a) {
        var b = this.length, c = +a + (0 > a ? b : 0);
        return this.pushStack(c >= 0 && b > c ? [this[c]] : [])
    }, end: function () {
        return this.prevObject || this.constructor(null)
    }, push: f, sort: c.sort, splice: c.splice}, o.extend = o.fn.extend = function () {
        var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1;
        for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || o.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)if (null != (a = arguments[h]))for (b in a)c = g[b], d = a[b], g !== d && (j && d && (o.isPlainObject(d) || (e = o.isArray(d))) ? (e ? (e = !1, f = c && o.isArray(c) ? c : []) : f = c && o.isPlainObject(c) ? c : {}, g[b] = o.extend(j, f, d)) : void 0 !== d && (g[b] = d));
        return g
    }, o.extend({expando: "jQuery" + (n + Math.random()).replace(/\D/g, ""), isReady: !0, error: function (a) {
        throw new Error(a)
    }, noop: function () {
    }, isFunction: function (a) {
        return"function" === o.type(a)
    }, isArray: Array.isArray, isWindow: function (a) {
        return null != a && a === a.window
    }, isNumeric: function (a) {
        return a - parseFloat(a) >= 0
    }, isPlainObject: function (a) {
        if ("object" !== o.type(a) || a.nodeType || o.isWindow(a))return!1;
        try {
            if (a.constructor && !j.call(a.constructor.prototype, "isPrototypeOf"))return!1
        } catch (b) {
            return!1
        }
        return!0
    }, isEmptyObject: function (a) {
        var b;
        for (b in a)return!1;
        return!0
    }, type: function (a) {
        return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a
    }, globalEval: function (a) {
        var b, c = eval;
        a = o.trim(a), a && (1 === a.indexOf("use strict") ? (b = m.createElement("script"), b.text = a, m.head.appendChild(b).parentNode.removeChild(b)) : c(a))
    }, camelCase: function (a) {
        return a.replace(p, "ms-").replace(q, r)
    }, nodeName: function (a, b) {
        return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase()
    }, each: function (a, b, c) {
        var d, e = 0, f = a.length, g = s(a);
        if (c) {
            if (g) {
                for (; f > e; e++)if (d = b.apply(a[e], c), d === !1)break
            } else for (e in a)if (d = b.apply(a[e], c), d === !1)break
        } else if (g) {
            for (; f > e; e++)if (d = b.call(a[e], e, a[e]), d === !1)break
        } else for (e in a)if (d = b.call(a[e], e, a[e]), d === !1)break;
        return a
    }, trim: function (a) {
        return null == a ? "" : k.call(a)
    }, makeArray: function (a, b) {
        var c = b || [];
        return null != a && (s(Object(a)) ? o.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c
    }, inArray: function (a, b, c) {
        return null == b ? -1 : g.call(b, a, c)
    }, merge: function (a, b) {
        for (var c = +b.length, d = 0, e = a.length; c > d; d++)a[e++] = b[d];
        return a.length = e, a
    }, grep: function (a, b, c) {
        for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++)d = !b(a[f], f), d !== h && e.push(a[f]);
        return e
    }, map: function (a, b, c) {
        var d, f = 0, g = a.length, h = s(a), i = [];
        if (h)for (; g > f; f++)d = b(a[f], f, c), null != d && i.push(d); else for (f in a)d = b(a[f], f, c), null != d && i.push(d);
        return e.apply([], i)
    }, guid: 1, proxy: function (a, b) {
        var c, e, f;
        return"string" == typeof b && (c = a[b], b = a, a = c), o.isFunction(a) ? (e = d.call(arguments, 2), f = function () {
            return a.apply(b || this, e.concat(d.call(arguments)))
        }, f.guid = a.guid = a.guid || o.guid++, f) : void 0
    }, now: Date.now, support: l}), o.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (a, b) {
        h["[object " + b + "]"] = b.toLowerCase()
    });
    function s(a) {
        var b = a.length, c = o.type(a);
        return"function" === c || o.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
    }

    var t = function (a) {
        var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s = "sizzle" + -new Date, t = a.document, u = 0, v = 0, w = eb(), x = eb(), y = eb(), z = function (a, b) {
            return a === b && (j = !0), 0
        }, A = "undefined", B = 1 << 31, C = {}.hasOwnProperty, D = [], E = D.pop, F = D.push, G = D.push, H = D.slice, I = D.indexOf || function (a) {
            for (var b = 0, c = this.length; c > b; b++)if (this[b] === a)return b;
            return-1
        }, J = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", K = "[\\x20\\t\\r\\n\\f]", L = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", M = L.replace("w", "w#"), N = "\\[" + K + "*(" + L + ")" + K + "*(?:([*^$|!~]?=)" + K + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + M + ")|)|)" + K + "*\\]", O = ":(" + L + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + N.replace(3, 8) + ")*)|.*)\\)|)", P = new RegExp("^" + K + "+|((?:^|[^\\\\])(?:\\\\.)*)" + K + "+$", "g"), Q = new RegExp("^" + K + "*," + K + "*"), R = new RegExp("^" + K + "*([>+~]|" + K + ")" + K + "*"), S = new RegExp("=" + K + "*([^\\]'\"]*?)" + K + "*\\]", "g"), T = new RegExp(O), U = new RegExp("^" + M + "$"), V = {ID: new RegExp("^#(" + L + ")"), CLASS: new RegExp("^\\.(" + L + ")"), TAG: new RegExp("^(" + L.replace("w", "w*") + ")"), ATTR: new RegExp("^" + N), PSEUDO: new RegExp("^" + O), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + K + "*(even|odd|(([+-]|)(\\d*)n|)" + K + "*(?:([+-]|)" + K + "*(\\d+)|))" + K + "*\\)|)", "i"), bool: new RegExp("^(?:" + J + ")$", "i"), needsContext: new RegExp("^" + K + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + K + "*((?:-\\d)?\\d*)" + K + "*\\)|)(?=[^-]|$)", "i")}, W = /^(?:input|select|textarea|button)$/i, X = /^h\d$/i, Y = /^[^{]+\{\s*\[native \w/, Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, $ = /[+~]/, _ = /'|\\/g, ab = new RegExp("\\\\([\\da-f]{1,6}" + K + "?|(" + K + ")|.)", "ig"), bb = function (a, b, c) {
            var d = "0x" + b - 65536;
            return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320)
        };
        try {
            G.apply(D = H.call(t.childNodes), t.childNodes), D[t.childNodes.length].nodeType
        } catch (cb) {
            G = {apply: D.length ? function (a, b) {
                F.apply(a, H.call(b))
            } : function (a, b) {
                var c = a.length, d = 0;
                while (a[c++] = b[d++]);
                a.length = c - 1
            }}
        }
        function db(a, b, d, e) {
            var f, g, h, i, j, m, p, q, u, v;
            if ((b ? b.ownerDocument || b : t) !== l && k(b), b = b || l, d = d || [], !a || "string" != typeof a)return d;
            if (1 !== (i = b.nodeType) && 9 !== i)return[];
            if (n && !e) {
                if (f = Z.exec(a))if (h = f[1]) {
                    if (9 === i) {
                        if (g = b.getElementById(h), !g || !g.parentNode)return d;
                        if (g.id === h)return d.push(g), d
                    } else if (b.ownerDocument && (g = b.ownerDocument.getElementById(h)) && r(b, g) && g.id === h)return d.push(g), d
                } else {
                    if (f[2])return G.apply(d, b.getElementsByTagName(a)), d;
                    if ((h = f[3]) && c.getElementsByClassName && b.getElementsByClassName)return G.apply(d, b.getElementsByClassName(h)), d
                }
                if (c.qsa && (!o || !o.test(a))) {
                    if (q = p = s, u = b, v = 9 === i && a, 1 === i && "object" !== b.nodeName.toLowerCase()) {
                        m = ob(a), (p = b.getAttribute("id")) ? q = p.replace(_, "\\$&") : b.setAttribute("id", q), q = "[id='" + q + "'] ", j = m.length;
                        while (j--)m[j] = q + pb(m[j]);
                        u = $.test(a) && mb(b.parentNode) || b, v = m.join(",")
                    }
                    if (v)try {
                        return G.apply(d, u.querySelectorAll(v)), d
                    } catch (w) {
                    } finally {
                        p || b.removeAttribute("id")
                    }
                }
            }
            return xb(a.replace(P, "$1"), b, d, e)
        }

        function eb() {
            var a = [];

            function b(c, e) {
                return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e
            }

            return b
        }

        function fb(a) {
            return a[s] = !0, a
        }

        function gb(a) {
            var b = l.createElement("div");
            try {
                return!!a(b)
            } catch (c) {
                return!1
            } finally {
                b.parentNode && b.parentNode.removeChild(b), b = null
            }
        }

        function hb(a, b) {
            var c = a.split("|"), e = a.length;
            while (e--)d.attrHandle[c[e]] = b
        }

        function ib(a, b) {
            var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || B) - (~a.sourceIndex || B);
            if (d)return d;
            if (c)while (c = c.nextSibling)if (c === b)return-1;
            return a ? 1 : -1
        }

        function jb(a) {
            return function (b) {
                var c = b.nodeName.toLowerCase();
                return"input" === c && b.type === a
            }
        }

        function kb(a) {
            return function (b) {
                var c = b.nodeName.toLowerCase();
                return("input" === c || "button" === c) && b.type === a
            }
        }

        function lb(a) {
            return fb(function (b) {
                return b = +b, fb(function (c, d) {
                    var e, f = a([], c.length, b), g = f.length;
                    while (g--)c[e = f[g]] && (c[e] = !(d[e] = c[e]))
                })
            })
        }

        function mb(a) {
            return a && typeof a.getElementsByTagName !== A && a
        }

        c = db.support = {}, f = db.isXML = function (a) {
            var b = a && (a.ownerDocument || a).documentElement;
            return b ? "HTML" !== b.nodeName : !1
        }, k = db.setDocument = function (a) {
            var b, e = a ? a.ownerDocument || a : t, g = e.defaultView;
            return e !== l && 9 === e.nodeType && e.documentElement ? (l = e, m = e.documentElement, n = !f(e), g && g !== g.top && (g.addEventListener ? g.addEventListener("unload", function () {
                k()
            }, !1) : g.attachEvent && g.attachEvent("onunload", function () {
                k()
            })), c.attributes = gb(function (a) {
                return a.className = "i", !a.getAttribute("className")
            }), c.getElementsByTagName = gb(function (a) {
                return a.appendChild(e.createComment("")), !a.getElementsByTagName("*").length
            }), c.getElementsByClassName = Y.test(e.getElementsByClassName) && gb(function (a) {
                return a.innerHTML = "<div class='a'></div><div class='a i'></div>", a.firstChild.className = "i", 2 === a.getElementsByClassName("i").length
            }), c.getById = gb(function (a) {
                return m.appendChild(a).id = s, !e.getElementsByName || !e.getElementsByName(s).length
            }), c.getById ? (d.find.ID = function (a, b) {
                if (typeof b.getElementById !== A && n) {
                    var c = b.getElementById(a);
                    return c && c.parentNode ? [c] : []
                }
            }, d.filter.ID = function (a) {
                var b = a.replace(ab, bb);
                return function (a) {
                    return a.getAttribute("id") === b
                }
            }) : (delete d.find.ID, d.filter.ID = function (a) {
                var b = a.replace(ab, bb);
                return function (a) {
                    var c = typeof a.getAttributeNode !== A && a.getAttributeNode("id");
                    return c && c.value === b
                }
            }), d.find.TAG = c.getElementsByTagName ? function (a, b) {
                return typeof b.getElementsByTagName !== A ? b.getElementsByTagName(a) : void 0
            } : function (a, b) {
                var c, d = [], e = 0, f = b.getElementsByTagName(a);
                if ("*" === a) {
                    while (c = f[e++])1 === c.nodeType && d.push(c);
                    return d
                }
                return f
            }, d.find.CLASS = c.getElementsByClassName && function (a, b) {
                return typeof b.getElementsByClassName !== A && n ? b.getElementsByClassName(a) : void 0
            }, p = [], o = [], (c.qsa = Y.test(e.querySelectorAll)) && (gb(function (a) {
                a.innerHTML = "<select t=''><option selected=''></option></select>", a.querySelectorAll("[t^='']").length && o.push("[*^$]=" + K + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || o.push("\\[" + K + "*(?:value|" + J + ")"), a.querySelectorAll(":checked").length || o.push(":checked")
            }), gb(function (a) {
                var b = e.createElement("input");
                b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && o.push("name" + K + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || o.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), o.push(",.*:")
            })), (c.matchesSelector = Y.test(q = m.webkitMatchesSelector || m.mozMatchesSelector || m.oMatchesSelector || m.msMatchesSelector)) && gb(function (a) {
                c.disconnectedMatch = q.call(a, "div"), q.call(a, "[s!='']:x"), p.push("!=", O)
            }), o = o.length && new RegExp(o.join("|")), p = p.length && new RegExp(p.join("|")), b = Y.test(m.compareDocumentPosition), r = b || Y.test(m.contains) ? function (a, b) {
                var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode;
                return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
            } : function (a, b) {
                if (b)while (b = b.parentNode)if (b === a)return!0;
                return!1
            }, z = b ? function (a, b) {
                if (a === b)return j = !0, 0;
                var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
                return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === e || a.ownerDocument === t && r(t, a) ? -1 : b === e || b.ownerDocument === t && r(t, b) ? 1 : i ? I.call(i, a) - I.call(i, b) : 0 : 4 & d ? -1 : 1)
            } : function (a, b) {
                if (a === b)return j = !0, 0;
                var c, d = 0, f = a.parentNode, g = b.parentNode, h = [a], k = [b];
                if (!f || !g)return a === e ? -1 : b === e ? 1 : f ? -1 : g ? 1 : i ? I.call(i, a) - I.call(i, b) : 0;
                if (f === g)return ib(a, b);
                c = a;
                while (c = c.parentNode)h.unshift(c);
                c = b;
                while (c = c.parentNode)k.unshift(c);
                while (h[d] === k[d])d++;
                return d ? ib(h[d], k[d]) : h[d] === t ? -1 : k[d] === t ? 1 : 0
            }, e) : l
        }, db.matches = function (a, b) {
            return db(a, null, null, b)
        }, db.matchesSelector = function (a, b) {
            if ((a.ownerDocument || a) !== l && k(a), b = b.replace(S, "='$1']"), !(!c.matchesSelector || !n || p && p.test(b) || o && o.test(b)))try {
                var d = q.call(a, b);
                if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType)return d
            } catch (e) {
            }
            return db(b, l, null, [a]).length > 0
        }, db.contains = function (a, b) {
            return(a.ownerDocument || a) !== l && k(a), r(a, b)
        }, db.attr = function (a, b) {
            (a.ownerDocument || a) !== l && k(a);
            var e = d.attrHandle[b.toLowerCase()], f = e && C.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !n) : void 0;
            return void 0 !== f ? f : c.attributes || !n ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null
        }, db.error = function (a) {
            throw new Error("Syntax error, unrecognized expression: " + a)
        }, db.uniqueSort = function (a) {
            var b, d = [], e = 0, f = 0;
            if (j = !c.detectDuplicates, i = !c.sortStable && a.slice(0), a.sort(z), j) {
                while (b = a[f++])b === a[f] && (e = d.push(f));
                while (e--)a.splice(d[e], 1)
            }
            return i = null, a
        }, e = db.getText = function (a) {
            var b, c = "", d = 0, f = a.nodeType;
            if (f) {
                if (1 === f || 9 === f || 11 === f) {
                    if ("string" == typeof a.textContent)return a.textContent;
                    for (a = a.firstChild; a; a = a.nextSibling)c += e(a)
                } else if (3 === f || 4 === f)return a.nodeValue
            } else while (b = a[d++])c += e(b);
            return c
        }, d = db.selectors = {cacheLength: 50, createPseudo: fb, match: V, attrHandle: {}, find: {}, relative: {">": {dir: "parentNode", first: !0}, " ": {dir: "parentNode"}, "+": {dir: "previousSibling", first: !0}, "~": {dir: "previousSibling"}}, preFilter: {ATTR: function (a) {
            return a[1] = a[1].replace(ab, bb), a[3] = (a[4] || a[5] || "").replace(ab, bb), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4)
        }, CHILD: function (a) {
            return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || db.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && db.error(a[0]), a
        }, PSEUDO: function (a) {
            var b, c = !a[5] && a[2];
            return V.CHILD.test(a[0]) ? null : (a[3] && void 0 !== a[4] ? a[2] = a[4] : c && T.test(c) && (b = ob(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3))
        }}, filter: {TAG: function (a) {
            var b = a.replace(ab, bb).toLowerCase();
            return"*" === a ? function () {
                return!0
            } : function (a) {
                return a.nodeName && a.nodeName.toLowerCase() === b
            }
        }, CLASS: function (a) {
            var b = w[a + " "];
            return b || (b = new RegExp("(^|" + K + ")" + a + "(" + K + "|$)")) && w(a, function (a) {
                return b.test("string" == typeof a.className && a.className || typeof a.getAttribute !== A && a.getAttribute("class") || "")
            })
        }, ATTR: function (a, b, c) {
            return function (d) {
                var e = db.attr(d, a);
                return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0
            }
        }, CHILD: function (a, b, c, d, e) {
            var f = "nth" !== a.slice(0, 3), g = "last" !== a.slice(-4), h = "of-type" === b;
            return 1 === d && 0 === e ? function (a) {
                return!!a.parentNode
            } : function (b, c, i) {
                var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), t = !i && !h;
                if (q) {
                    if (f) {
                        while (p) {
                            l = b;
                            while (l = l[p])if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType)return!1;
                            o = p = "only" === a && !o && "nextSibling"
                        }
                        return!0
                    }
                    if (o = [g ? q.firstChild : q.lastChild], g && t) {
                        k = q[s] || (q[s] = {}), j = k[a] || [], n = j[0] === u && j[1], m = j[0] === u && j[2], l = n && q.childNodes[n];
                        while (l = ++n && l && l[p] || (m = n = 0) || o.pop())if (1 === l.nodeType && ++m && l === b) {
                            k[a] = [u, n, m];
                            break
                        }
                    } else if (t && (j = (b[s] || (b[s] = {}))[a]) && j[0] === u)m = j[1]; else while (l = ++n && l && l[p] || (m = n = 0) || o.pop())if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (t && ((l[s] || (l[s] = {}))[a] = [u, m]), l === b))break;
                    return m -= e, m === d || m % d === 0 && m / d >= 0
                }
            }
        }, PSEUDO: function (a, b) {
            var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || db.error("unsupported pseudo: " + a);
            return e[s] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? fb(function (a, c) {
                var d, f = e(a, b), g = f.length;
                while (g--)d = I.call(a, f[g]), a[d] = !(c[d] = f[g])
            }) : function (a) {
                return e(a, 0, c)
            }) : e
        }}, pseudos: {not: fb(function (a) {
            var b = [], c = [], d = g(a.replace(P, "$1"));
            return d[s] ? fb(function (a, b, c, e) {
                var f, g = d(a, null, e, []), h = a.length;
                while (h--)(f = g[h]) && (a[h] = !(b[h] = f))
            }) : function (a, e, f) {
                return b[0] = a, d(b, null, f, c), !c.pop()
            }
        }), has: fb(function (a) {
            return function (b) {
                return db(a, b).length > 0
            }
        }), contains: fb(function (a) {
            return function (b) {
                return(b.textContent || b.innerText || e(b)).indexOf(a) > -1
            }
        }), lang: fb(function (a) {
            return U.test(a || "") || db.error("unsupported lang: " + a), a = a.replace(ab, bb).toLowerCase(), function (b) {
                var c;
                do if (c = n ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang"))return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
                return!1
            }
        }), target: function (b) {
            var c = a.location && a.location.hash;
            return c && c.slice(1) === b.id
        }, root: function (a) {
            return a === m
        }, focus: function (a) {
            return a === l.activeElement && (!l.hasFocus || l.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
        }, enabled: function (a) {
            return a.disabled === !1
        }, disabled: function (a) {
            return a.disabled === !0
        }, checked: function (a) {
            var b = a.nodeName.toLowerCase();
            return"input" === b && !!a.checked || "option" === b && !!a.selected
        }, selected: function (a) {
            return a.parentNode && a.parentNode.selectedIndex, a.selected === !0
        }, empty: function (a) {
            for (a = a.firstChild; a; a = a.nextSibling)if (a.nodeType < 6)return!1;
            return!0
        }, parent: function (a) {
            return!d.pseudos.empty(a)
        }, header: function (a) {
            return X.test(a.nodeName)
        }, input: function (a) {
            return W.test(a.nodeName)
        }, button: function (a) {
            var b = a.nodeName.toLowerCase();
            return"input" === b && "button" === a.type || "button" === b
        }, text: function (a) {
            var b;
            return"input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase())
        }, first: lb(function () {
            return[0]
        }), last: lb(function (a, b) {
            return[b - 1]
        }), eq: lb(function (a, b, c) {
            return[0 > c ? c + b : c]
        }), even: lb(function (a, b) {
            for (var c = 0; b > c; c += 2)a.push(c);
            return a
        }), odd: lb(function (a, b) {
            for (var c = 1; b > c; c += 2)a.push(c);
            return a
        }), lt: lb(function (a, b, c) {
            for (var d = 0 > c ? c + b : c; --d >= 0;)a.push(d);
            return a
        }), gt: lb(function (a, b, c) {
            for (var d = 0 > c ? c + b : c; ++d < b;)a.push(d);
            return a
        })}}, d.pseudos.nth = d.pseudos.eq;
        for (b in{radio: !0, checkbox: !0, file: !0, password: !0, image: !0})d.pseudos[b] = jb(b);
        for (b in{submit: !0, reset: !0})d.pseudos[b] = kb(b);
        function nb() {
        }

        nb.prototype = d.filters = d.pseudos, d.setFilters = new nb;
        function ob(a, b) {
            var c, e, f, g, h, i, j, k = x[a + " "];
            if (k)return b ? 0 : k.slice(0);
            h = a, i = [], j = d.preFilter;
            while (h) {
                (!c || (e = Q.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = R.exec(h)) && (c = e.shift(), f.push({value: c, type: e[0].replace(P, " ")}), h = h.slice(c.length));
                for (g in d.filter)!(e = V[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({value: c, type: g, matches: e}), h = h.slice(c.length));
                if (!c)break
            }
            return b ? h.length : h ? db.error(a) : x(a, i).slice(0)
        }

        function pb(a) {
            for (var b = 0, c = a.length, d = ""; c > b; b++)d += a[b].value;
            return d
        }

        function qb(a, b, c) {
            var d = b.dir, e = c && "parentNode" === d, f = v++;
            return b.first ? function (b, c, f) {
                while (b = b[d])if (1 === b.nodeType || e)return a(b, c, f)
            } : function (b, c, g) {
                var h, i, j = [u, f];
                if (g) {
                    while (b = b[d])if ((1 === b.nodeType || e) && a(b, c, g))return!0
                } else while (b = b[d])if (1 === b.nodeType || e) {
                    if (i = b[s] || (b[s] = {}), (h = i[d]) && h[0] === u && h[1] === f)return j[2] = h[2];
                    if (i[d] = j, j[2] = a(b, c, g))return!0
                }
            }
        }

        function rb(a) {
            return a.length > 1 ? function (b, c, d) {
                var e = a.length;
                while (e--)if (!a[e](b, c, d))return!1;
                return!0
            } : a[0]
        }

        function sb(a, b, c, d, e) {
            for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));
            return g
        }

        function tb(a, b, c, d, e, f) {
            return d && !d[s] && (d = tb(d)), e && !e[s] && (e = tb(e, f)), fb(function (f, g, h, i) {
                var j, k, l, m = [], n = [], o = g.length, p = f || wb(b || "*", h.nodeType ? [h] : h, []), q = !a || !f && b ? p : sb(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q;
                if (c && c(q, r, h, i), d) {
                    j = sb(r, n), d(j, [], h, i), k = j.length;
                    while (k--)(l = j[k]) && (r[n[k]] = !(q[n[k]] = l))
                }
                if (f) {
                    if (e || a) {
                        if (e) {
                            j = [], k = r.length;
                            while (k--)(l = r[k]) && j.push(q[k] = l);
                            e(null, r = [], j, i)
                        }
                        k = r.length;
                        while (k--)(l = r[k]) && (j = e ? I.call(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l))
                    }
                } else r = sb(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : G.apply(g, r)
            })
        }

        function ub(a) {
            for (var b, c, e, f = a.length, g = d.relative[a[0].type], i = g || d.relative[" "], j = g ? 1 : 0, k = qb(function (a) {
                return a === b
            }, i, !0), l = qb(function (a) {
                return I.call(b, a) > -1
            }, i, !0), m = [function (a, c, d) {
                return!g && (d || c !== h) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d))
            }]; f > j; j++)if (c = d.relative[a[j].type])m = [qb(rb(m), c)]; else {
                if (c = d.filter[a[j].type].apply(null, a[j].matches), c[s]) {
                    for (e = ++j; f > e; e++)if (d.relative[a[e].type])break;
                    return tb(j > 1 && rb(m), j > 1 && pb(a.slice(0, j - 1).concat({value: " " === a[j - 2].type ? "*" : ""})).replace(P, "$1"), c, e > j && ub(a.slice(j, e)), f > e && ub(a = a.slice(e)), f > e && pb(a))
                }
                m.push(c)
            }
            return rb(m)
        }

        function vb(a, b) {
            var c = b.length > 0, e = a.length > 0, f = function (f, g, i, j, k) {
                var m, n, o, p = 0, q = "0", r = f && [], s = [], t = h, v = f || e && d.find.TAG("*", k), w = u += null == t ? 1 : Math.random() || .1, x = v.length;
                for (k && (h = g !== l && g); q !== x && null != (m = v[q]); q++) {
                    if (e && m) {
                        n = 0;
                        while (o = a[n++])if (o(m, g, i)) {
                            j.push(m);
                            break
                        }
                        k && (u = w)
                    }
                    c && ((m = !o && m) && p--, f && r.push(m))
                }
                if (p += q, c && q !== p) {
                    n = 0;
                    while (o = b[n++])o(r, s, g, i);
                    if (f) {
                        if (p > 0)while (q--)r[q] || s[q] || (s[q] = E.call(j));
                        s = sb(s)
                    }
                    G.apply(j, s), k && !f && s.length > 0 && p + b.length > 1 && db.uniqueSort(j)
                }
                return k && (u = w, h = t), r
            };
            return c ? fb(f) : f
        }

        g = db.compile = function (a, b) {
            var c, d = [], e = [], f = y[a + " "];
            if (!f) {
                b || (b = ob(a)), c = b.length;
                while (c--)f = ub(b[c]), f[s] ? d.push(f) : e.push(f);
                f = y(a, vb(e, d))
            }
            return f
        };
        function wb(a, b, c) {
            for (var d = 0, e = b.length; e > d; d++)db(a, b[d], c);
            return c
        }

        function xb(a, b, e, f) {
            var h, i, j, k, l, m = ob(a);
            if (!f && 1 === m.length) {
                if (i = m[0] = m[0].slice(0), i.length > 2 && "ID" === (j = i[0]).type && c.getById && 9 === b.nodeType && n && d.relative[i[1].type]) {
                    if (b = (d.find.ID(j.matches[0].replace(ab, bb), b) || [])[0], !b)return e;
                    a = a.slice(i.shift().value.length)
                }
                h = V.needsContext.test(a) ? 0 : i.length;
                while (h--) {
                    if (j = i[h], d.relative[k = j.type])break;
                    if ((l = d.find[k]) && (f = l(j.matches[0].replace(ab, bb), $.test(i[0].type) && mb(b.parentNode) || b))) {
                        if (i.splice(h, 1), a = f.length && pb(i), !a)return G.apply(e, f), e;
                        break
                    }
                }
            }
            return g(a, m)(f, b, !n, e, $.test(a) && mb(b.parentNode) || b), e
        }

        return c.sortStable = s.split("").sort(z).join("") === s, c.detectDuplicates = !!j, k(), c.sortDetached = gb(function (a) {
            return 1 & a.compareDocumentPosition(l.createElement("div"))
        }), gb(function (a) {
            return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href")
        }) || hb("type|href|height|width", function (a, b, c) {
            return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2)
        }), c.attributes && gb(function (a) {
            return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value")
        }) || hb("value", function (a, b, c) {
            return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue
        }), gb(function (a) {
            return null == a.getAttribute("disabled")
        }) || hb(J, function (a, b, c) {
            var d;
            return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null
        }), db
    }(a);
    o.find = t, o.expr = t.selectors, o.expr[":"] = o.expr.pseudos, o.unique = t.uniqueSort, o.text = t.getText, o.isXMLDoc = t.isXML, o.contains = t.contains;
    var u = o.expr.match.needsContext, v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, w = /^.[^:#\[\.,]*$/;

    function x(a, b, c) {
        if (o.isFunction(b))return o.grep(a, function (a, d) {
            return!!b.call(a, d, a) !== c
        });
        if (b.nodeType)return o.grep(a, function (a) {
            return a === b !== c
        });
        if ("string" == typeof b) {
            if (w.test(b))return o.filter(b, a, c);
            b = o.filter(b, a)
        }
        return o.grep(a, function (a) {
            return g.call(b, a) >= 0 !== c
        })
    }

    o.filter = function (a, b, c) {
        var d = b[0];
        return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? o.find.matchesSelector(d, a) ? [d] : [] : o.find.matches(a, o.grep(b, function (a) {
            return 1 === a.nodeType
        }))
    }, o.fn.extend({find: function (a) {
        var b, c = this.length, d = [], e = this;
        if ("string" != typeof a)return this.pushStack(o(a).filter(function () {
            for (b = 0; c > b; b++)if (o.contains(e[b], this))return!0
        }));
        for (b = 0; c > b; b++)o.find(a, e[b], d);
        return d = this.pushStack(c > 1 ? o.unique(d) : d), d.selector = this.selector ? this.selector + " " + a : a, d
    }, filter: function (a) {
        return this.pushStack(x(this, a || [], !1))
    }, not: function (a) {
        return this.pushStack(x(this, a || [], !0))
    }, is: function (a) {
        return!!x(this, "string" == typeof a && u.test(a) ? o(a) : a || [], !1).length
    }});
    var y, z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, A = o.fn.init = function (a, b) {
        var c, d;
        if (!a)return this;
        if ("string" == typeof a) {
            if (c = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : z.exec(a), !c || !c[1] && b)return!b || b.jquery ? (b || y).find(a) : this.constructor(b).find(a);
            if (c[1]) {
                if (b = b instanceof o ? b[0] : b, o.merge(this, o.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : m, !0)), v.test(c[1]) && o.isPlainObject(b))for (c in b)o.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
                return this
            }
            return d = m.getElementById(c[2]), d && d.parentNode && (this.length = 1, this[0] = d), this.context = m, this.selector = a, this
        }
        return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : o.isFunction(a) ? "undefined" != typeof y.ready ? y.ready(a) : a(o) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), o.makeArray(a, this))
    };
    A.prototype = o.fn, y = o(m);
    var B = /^(?:parents|prev(?:Until|All))/, C = {children: !0, contents: !0, next: !0, prev: !0};
    o.extend({dir: function (a, b, c) {
        var d = [], e = void 0 !== c;
        while ((a = a[b]) && 9 !== a.nodeType)if (1 === a.nodeType) {
            if (e && o(a).is(c))break;
            d.push(a)
        }
        return d
    }, sibling: function (a, b) {
        for (var c = []; a; a = a.nextSibling)1 === a.nodeType && a !== b && c.push(a);
        return c
    }}), o.fn.extend({has: function (a) {
        var b = o(a, this), c = b.length;
        return this.filter(function () {
            for (var a = 0; c > a; a++)if (o.contains(this, b[a]))return!0
        })
    }, closest: function (a, b) {
        for (var c, d = 0, e = this.length, f = [], g = u.test(a) || "string" != typeof a ? o(a, b || this.context) : 0; e > d; d++)for (c = this[d]; c && c !== b; c = c.parentNode)if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && o.find.matchesSelector(c, a))) {
            f.push(c);
            break
        }
        return this.pushStack(f.length > 1 ? o.unique(f) : f)
    }, index: function (a) {
        return a ? "string" == typeof a ? g.call(o(a), this[0]) : g.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
    }, add: function (a, b) {
        return this.pushStack(o.unique(o.merge(this.get(), o(a, b))))
    }, addBack: function (a) {
        return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
    }});
    function D(a, b) {
        while ((a = a[b]) && 1 !== a.nodeType);
        return a
    }

    o.each({parent: function (a) {
        var b = a.parentNode;
        return b && 11 !== b.nodeType ? b : null
    }, parents: function (a) {
        return o.dir(a, "parentNode")
    }, parentsUntil: function (a, b, c) {
        return o.dir(a, "parentNode", c)
    }, next: function (a) {
        return D(a, "nextSibling")
    }, prev: function (a) {
        return D(a, "previousSibling")
    }, nextAll: function (a) {
        return o.dir(a, "nextSibling")
    }, prevAll: function (a) {
        return o.dir(a, "previousSibling")
    }, nextUntil: function (a, b, c) {
        return o.dir(a, "nextSibling", c)
    }, prevUntil: function (a, b, c) {
        return o.dir(a, "previousSibling", c)
    }, siblings: function (a) {
        return o.sibling((a.parentNode || {}).firstChild, a)
    }, children: function (a) {
        return o.sibling(a.firstChild)
    }, contents: function (a) {
        return a.contentDocument || o.merge([], a.childNodes)
    }}, function (a, b) {
        o.fn[a] = function (c, d) {
            var e = o.map(this, b, c);
            return"Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = o.filter(d, e)), this.length > 1 && (C[a] || o.unique(e), B.test(a) && e.reverse()), this.pushStack(e)
        }
    });
    var E = /\S+/g, F = {};

    function G(a) {
        var b = F[a] = {};
        return o.each(a.match(E) || [], function (a, c) {
            b[c] = !0
        }), b
    }

    o.Callbacks = function (a) {
        a = "string" == typeof a ? F[a] || G(a) : o.extend({}, a);
        var b, c, d, e, f, g, h = [], i = !a.once && [], j = function (l) {
            for (b = a.memory && l, c = !0, g = e || 0, e = 0, f = h.length, d = !0; h && f > g; g++)if (h[g].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
                b = !1;
                break
            }
            d = !1, h && (i ? i.length && j(i.shift()) : b ? h = [] : k.disable())
        }, k = {add: function () {
            if (h) {
                var c = h.length;
                !function g(b) {
                    o.each(b, function (b, c) {
                        var d = o.type(c);
                        "function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && g(c)
                    })
                }(arguments), d ? f = h.length : b && (e = c, j(b))
            }
            return this
        }, remove: function () {
            return h && o.each(arguments, function (a, b) {
                var c;
                while ((c = o.inArray(b, h, c)) > -1)h.splice(c, 1), d && (f >= c && f--, g >= c && g--)
            }), this
        }, has: function (a) {
            return a ? o.inArray(a, h) > -1 : !(!h || !h.length)
        }, empty: function () {
            return h = [], f = 0, this
        }, disable: function () {
            return h = i = b = void 0, this
        }, disabled: function () {
            return!h
        }, lock: function () {
            return i = void 0, b || k.disable(), this
        }, locked: function () {
            return!i
        }, fireWith: function (a, b) {
            return!h || c && !i || (b = b || [], b = [a, b.slice ? b.slice() : b], d ? i.push(b) : j(b)), this
        }, fire: function () {
            return k.fireWith(this, arguments), this
        }, fired: function () {
            return!!c
        }};
        return k
    }, o.extend({Deferred: function (a) {
        var b = [
            ["resolve", "done", o.Callbacks("once memory"), "resolved"],
            ["reject", "fail", o.Callbacks("once memory"), "rejected"],
            ["notify", "progress", o.Callbacks("memory")]
        ], c = "pending", d = {state: function () {
            return c
        }, always: function () {
            return e.done(arguments).fail(arguments), this
        }, then: function () {
            var a = arguments;
            return o.Deferred(function (c) {
                o.each(b, function (b, f) {
                    var g = o.isFunction(a[b]) && a[b];
                    e[f[1]](function () {
                        var a = g && g.apply(this, arguments);
                        a && o.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments)
                    })
                }), a = null
            }).promise()
        }, promise: function (a) {
            return null != a ? o.extend(a, d) : d
        }}, e = {};
        return d.pipe = d.then, o.each(b, function (a, f) {
            var g = f[2], h = f[3];
            d[f[1]] = g.add, h && g.add(function () {
                c = h
            }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () {
                return e[f[0] + "With"](this === e ? d : this, arguments), this
            }, e[f[0] + "With"] = g.fireWith
        }), d.promise(e), a && a.call(e, e), e
    }, when: function (a) {
        var b = 0, c = d.call(arguments), e = c.length, f = 1 !== e || a && o.isFunction(a.promise) ? e : 0, g = 1 === f ? a : o.Deferred(), h = function (a, b, c) {
            return function (e) {
                b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c)
            }
        }, i, j, k;
        if (e > 1)for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++)c[b] && o.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;
        return f || g.resolveWith(k, c), g.promise()
    }});
    var H;
    o.fn.ready = function (a) {
        return o.ready.promise().done(a), this
    }, o.extend({isReady: !1, readyWait: 1, holdReady: function (a) {
        a ? o.readyWait++ : o.ready(!0)
    }, ready: function (a) {
        (a === !0 ? --o.readyWait : o.isReady) || (o.isReady = !0, a !== !0 && --o.readyWait > 0 || (H.resolveWith(m, [o]), o.fn.trigger && o(m).trigger("ready").off("ready")))
    }});
    function I() {
        m.removeEventListener("DOMContentLoaded", I, !1), a.removeEventListener("load", I, !1), o.ready()
    }

    o.ready.promise = function (b) {
        return H || (H = o.Deferred(), "complete" === m.readyState ? setTimeout(o.ready) : (m.addEventListener("DOMContentLoaded", I, !1), a.addEventListener("load", I, !1))), H.promise(b)
    }, o.ready.promise();
    var J = o.access = function (a, b, c, d, e, f, g) {
        var h = 0, i = a.length, j = null == c;
        if ("object" === o.type(c)) {
            e = !0;
            for (h in c)o.access(a, b, h, c[h], !0, f, g)
        } else if (void 0 !== d && (e = !0, o.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function (a, b, c) {
            return j.call(o(a), c)
        })), b))for (; i > h; h++)b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
        return e ? a : j ? b.call(a) : i ? b(a[0], c) : f
    };
    o.acceptData = function (a) {
        return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType
    };
    function K() {
        Object.defineProperty(this.cache = {}, 0, {get: function () {
            return{}
        }}), this.expando = o.expando + Math.random()
    }

    K.uid = 1, K.accepts = o.acceptData, K.prototype = {key: function (a) {
        if (!K.accepts(a))return 0;
        var b = {}, c = a[this.expando];
        if (!c) {
            c = K.uid++;
            try {
                b[this.expando] = {value: c}, Object.defineProperties(a, b)
            } catch (d) {
                b[this.expando] = c, o.extend(a, b)
            }
        }
        return this.cache[c] || (this.cache[c] = {}), c
    }, set: function (a, b, c) {
        var d, e = this.key(a), f = this.cache[e];
        if ("string" == typeof b)f[b] = c; else if (o.isEmptyObject(f))o.extend(this.cache[e], b); else for (d in b)f[d] = b[d];
        return f
    }, get: function (a, b) {
        var c = this.cache[this.key(a)];
        return void 0 === b ? c : c[b]
    }, access: function (a, b, c) {
        var d;
        return void 0 === b || b && "string" == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, o.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b)
    }, remove: function (a, b) {
        var c, d, e, f = this.key(a), g = this.cache[f];
        if (void 0 === b)this.cache[f] = {}; else {
            o.isArray(b) ? d = b.concat(b.map(o.camelCase)) : (e = o.camelCase(b), b in g ? d = [b, e] : (d = e, d = d in g ? [d] : d.match(E) || [])), c = d.length;
            while (c--)delete g[d[c]]
        }
    }, hasData: function (a) {
        return!o.isEmptyObject(this.cache[a[this.expando]] || {})
    }, discard: function (a) {
        a[this.expando] && delete this.cache[a[this.expando]]
    }};
    var L = new K, M = new K, N = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, O = /([A-Z])/g;

    function P(a, b, c) {
        var d;
        if (void 0 === c && 1 === a.nodeType)if (d = "data-" + b.replace(O, "-$1").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) {
            try {
                c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : N.test(c) ? o.parseJSON(c) : c
            } catch (e) {
            }
            M.set(a, b, c)
        } else c = void 0;
        return c
    }

    o.extend({hasData: function (a) {
        return M.hasData(a) || L.hasData(a)
    }, data: function (a, b, c) {
        return M.access(a, b, c)
    }, removeData: function (a, b) {
        M.remove(a, b)
    }, _data: function (a, b, c) {
        return L.access(a, b, c)
    }, _removeData: function (a, b) {
        L.remove(a, b)
    }}), o.fn.extend({data: function (a, b) {
        var c, d, e, f = this[0], g = f && f.attributes;
        if (void 0 === a) {
            if (this.length && (e = M.get(f), 1 === f.nodeType && !L.get(f, "hasDataAttrs"))) {
                c = g.length;
                while (c--)d = g[c].name, 0 === d.indexOf("data-") && (d = o.camelCase(d.slice(5)), P(f, d, e[d]));
                L.set(f, "hasDataAttrs", !0)
            }
            return e
        }
        return"object" == typeof a ? this.each(function () {
            M.set(this, a)
        }) : J(this, function (b) {
            var c, d = o.camelCase(a);
            if (f && void 0 === b) {
                if (c = M.get(f, a), void 0 !== c)return c;
                if (c = M.get(f, d), void 0 !== c)return c;
                if (c = P(f, d, void 0), void 0 !== c)return c
            } else this.each(function () {
                var c = M.get(this, d);
                M.set(this, d, b), -1 !== a.indexOf("-") && void 0 !== c && M.set(this, a, b)
            })
        }, null, b, arguments.length > 1, null, !0)
    }, removeData: function (a) {
        return this.each(function () {
            M.remove(this, a)
        })
    }}), o.extend({queue: function (a, b, c) {
        var d;
        return a ? (b = (b || "fx") + "queue", d = L.get(a, b), c && (!d || o.isArray(c) ? d = L.access(a, b, o.makeArray(c)) : d.push(c)), d || []) : void 0
    }, dequeue: function (a, b) {
        b = b || "fx";
        var c = o.queue(a, b), d = c.length, e = c.shift(), f = o._queueHooks(a, b), g = function () {
            o.dequeue(a, b)
        };
        "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire()
    }, _queueHooks: function (a, b) {
        var c = b + "queueHooks";
        return L.get(a, c) || L.access(a, c, {empty: o.Callbacks("once memory").add(function () {
            L.remove(a, [b + "queue", c])
        })})
    }}), o.fn.extend({queue: function (a, b) {
        var c = 2;
        return"string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? o.queue(this[0], a) : void 0 === b ? this : this.each(function () {
            var c = o.queue(this, a, b);
            o._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && o.dequeue(this, a)
        })
    }, dequeue: function (a) {
        return this.each(function () {
            o.dequeue(this, a)
        })
    }, clearQueue: function (a) {
        return this.queue(a || "fx", [])
    }, promise: function (a, b) {
        var c, d = 1, e = o.Deferred(), f = this, g = this.length, h = function () {
            --d || e.resolveWith(f, [f])
        };
        "string" != typeof a && (b = a, a = void 0), a = a || "fx";
        while (g--)c = L.get(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h));
        return h(), e.promise(b)
    }});
    var Q = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, R = ["Top", "Right", "Bottom", "Left"], S = function (a, b) {
        return a = b || a, "none" === o.css(a, "display") || !o.contains(a.ownerDocument, a)
    }, T = /^(?:checkbox|radio)$/i;
    !function () {
        var a = m.createDocumentFragment(), b = a.appendChild(m.createElement("div"));
        b.innerHTML = "<input type='radio' checked='checked' name='t'/>", l.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", l.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue
    }();
    var U = "undefined";
    l.focusinBubbles = "onfocusin"in a;
    var V = /^key/, W = /^(?:mouse|contextmenu)|click/, X = /^(?:focusinfocus|focusoutblur)$/, Y = /^([^.]*)(?:\.(.+)|)$/;

    function Z() {
        return!0
    }

    function $() {
        return!1
    }

    function _() {
        try {
            return m.activeElement
        } catch (a) {
        }
    }

    o.event = {global: {}, add: function (a, b, c, d, e) {
        var f, g, h, i, j, k, l, m, n, p, q, r = L.get(a);
        if (r) {
            c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = o.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function (b) {
                return typeof o !== U && o.event.triggered !== b.type ? o.event.dispatch.apply(a, arguments) : void 0
            }), b = (b || "").match(E) || [""], j = b.length;
            while (j--)h = Y.exec(b[j]) || [], n = q = h[1], p = (h[2] || "").split(".").sort(), n && (l = o.event.special[n] || {}, n = (e ? l.delegateType : l.bindType) || n, l = o.event.special[n] || {}, k = o.extend({type: n, origType: q, data: d, handler: c, guid: c.guid, selector: e, needsContext: e && o.expr.match.needsContext.test(e), namespace: p.join(".")}, f), (m = i[n]) || (m = i[n] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(n, g, !1)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), o.event.global[n] = !0)
        }
    }, remove: function (a, b, c, d, e) {
        var f, g, h, i, j, k, l, m, n, p, q, r = L.hasData(a) && L.get(a);
        if (r && (i = r.events)) {
            b = (b || "").match(E) || [""], j = b.length;
            while (j--)if (h = Y.exec(b[j]) || [], n = q = h[1], p = (h[2] || "").split(".").sort(), n) {
                l = o.event.special[n] || {}, n = (d ? l.delegateType : l.bindType) || n, m = i[n] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length;
                while (f--)k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k));
                g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || o.removeEvent(a, n, r.handle), delete i[n])
            } else for (n in i)o.event.remove(a, n + b[j], c, d, !0);
            o.isEmptyObject(i) && (delete r.handle, L.remove(a, "events"))
        }
    }, trigger: function (b, c, d, e) {
        var f, g, h, i, k, l, n, p = [d || m], q = j.call(b, "type") ? b.type : b, r = j.call(b, "namespace") ? b.namespace.split(".") : [];
        if (g = h = d = d || m, 3 !== d.nodeType && 8 !== d.nodeType && !X.test(q + o.event.triggered) && (q.indexOf(".") >= 0 && (r = q.split("."), q = r.shift(), r.sort()), k = q.indexOf(":") < 0 && "on" + q, b = b[o.expando] ? b : new o.Event(q, "object" == typeof b && b), b.isTrigger = e ? 2 : 3, b.namespace = r.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + r.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : o.makeArray(c, [b]), n = o.event.special[q] || {}, e || !n.trigger || n.trigger.apply(d, c) !== !1)) {
            if (!e && !n.noBubble && !o.isWindow(d)) {
                for (i = n.delegateType || q, X.test(i + q) || (g = g.parentNode); g; g = g.parentNode)p.push(g), h = g;
                h === (d.ownerDocument || m) && p.push(h.defaultView || h.parentWindow || a)
            }
            f = 0;
            while ((g = p[f++]) && !b.isPropagationStopped())b.type = f > 1 ? i : n.bindType || q, l = (L.get(g, "events") || {})[b.type] && L.get(g, "handle"), l && l.apply(g, c), l = k && g[k], l && l.apply && o.acceptData(g) && (b.result = l.apply(g, c), b.result === !1 && b.preventDefault());
            return b.type = q, e || b.isDefaultPrevented() || n._default && n._default.apply(p.pop(), c) !== !1 || !o.acceptData(d) || k && o.isFunction(d[q]) && !o.isWindow(d) && (h = d[k], h && (d[k] = null), o.event.triggered = q, d[q](), o.event.triggered = void 0, h && (d[k] = h)), b.result
        }
    }, dispatch: function (a) {
        a = o.event.fix(a);
        var b, c, e, f, g, h = [], i = d.call(arguments), j = (L.get(this, "events") || {})[a.type] || [], k = o.event.special[a.type] || {};
        if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
            h = o.event.handlers.call(this, a, j), b = 0;
            while ((f = h[b++]) && !a.isPropagationStopped()) {
                a.currentTarget = f.elem, c = 0;
                while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped())(!a.namespace_re || a.namespace_re.test(g.namespace)) && (a.handleObj = g, a.data = g.data, e = ((o.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== e && (a.result = e) === !1 && (a.preventDefault(), a.stopPropagation()))
            }
            return k.postDispatch && k.postDispatch.call(this, a), a.result
        }
    }, handlers: function (a, b) {
        var c, d, e, f, g = [], h = b.delegateCount, i = a.target;
        if (h && i.nodeType && (!a.button || "click" !== a.type))for (; i !== this; i = i.parentNode || this)if (i.disabled !== !0 || "click" !== a.type) {
            for (d = [], c = 0; h > c; c++)f = b[c], e = f.selector + " ", void 0 === d[e] && (d[e] = f.needsContext ? o(e, this).index(i) >= 0 : o.find(e, this, null, [i]).length), d[e] && d.push(f);
            d.length && g.push({elem: i, handlers: d})
        }
        return h < b.length && g.push({elem: this, handlers: b.slice(h)}), g
    }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: {props: "char charCode key keyCode".split(" "), filter: function (a, b) {
        return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a
    }}, mouseHooks: {props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function (a, b) {
        var c, d, e, f = b.button;
        return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || m, d = c.documentElement, e = c.body, a.pageX = b.clientX + (d && d.scrollLeft || e && e.scrollLeft || 0) - (d && d.clientLeft || e && e.clientLeft || 0), a.pageY = b.clientY + (d && d.scrollTop || e && e.scrollTop || 0) - (d && d.clientTop || e && e.clientTop || 0)), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a
    }}, fix: function (a) {
        if (a[o.expando])return a;
        var b, c, d, e = a.type, f = a, g = this.fixHooks[e];
        g || (this.fixHooks[e] = g = W.test(e) ? this.mouseHooks : V.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new o.Event(f), b = d.length;
        while (b--)c = d[b], a[c] = f[c];
        return a.target || (a.target = m), 3 === a.target.nodeType && (a.target = a.target.parentNode), g.filter ? g.filter(a, f) : a
    }, special: {load: {noBubble: !0}, focus: {trigger: function () {
        return this !== _() && this.focus ? (this.focus(), !1) : void 0
    }, delegateType: "focusin"}, blur: {trigger: function () {
        return this === _() && this.blur ? (this.blur(), !1) : void 0
    }, delegateType: "focusout"}, click: {trigger: function () {
        return"checkbox" === this.type && this.click && o.nodeName(this, "input") ? (this.click(), !1) : void 0
    }, _default: function (a) {
        return o.nodeName(a.target, "a")
    }}, beforeunload: {postDispatch: function (a) {
        void 0 !== a.result && (a.originalEvent.returnValue = a.result)
    }}}, simulate: function (a, b, c, d) {
        var e = o.extend(new o.Event, c, {type: a, isSimulated: !0, originalEvent: {}});
        d ? o.event.trigger(e, null, b) : o.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault()
    }}, o.removeEvent = function (a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c, !1)
    }, o.Event = function (a, b) {
        return this instanceof o.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.getPreventDefault && a.getPreventDefault() ? Z : $) : this.type = a, b && o.extend(this, b), this.timeStamp = a && a.timeStamp || o.now(), void(this[o.expando] = !0)) : new o.Event(a, b)
    }, o.Event.prototype = {isDefaultPrevented: $, isPropagationStopped: $, isImmediatePropagationStopped: $, preventDefault: function () {
        var a = this.originalEvent;
        this.isDefaultPrevented = Z, a && a.preventDefault && a.preventDefault()
    }, stopPropagation: function () {
        var a = this.originalEvent;
        this.isPropagationStopped = Z, a && a.stopPropagation && a.stopPropagation()
    }, stopImmediatePropagation: function () {
        this.isImmediatePropagationStopped = Z, this.stopPropagation()
    }}, o.each({mouseenter: "mouseover", mouseleave: "mouseout"}, function (a, b) {
        o.event.special[a] = {delegateType: b, bindType: b, handle: function (a) {
            var c, d = this, e = a.relatedTarget, f = a.handleObj;
            return(!e || e !== d && !o.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c
        }}
    }), l.focusinBubbles || o.each({focus: "focusin", blur: "focusout"}, function (a, b) {
        var c = function (a) {
            o.event.simulate(b, a.target, o.event.fix(a), !0)
        };
        o.event.special[b] = {setup: function () {
            var d = this.ownerDocument || this, e = L.access(d, b);
            e || d.addEventListener(a, c, !0), L.access(d, b, (e || 0) + 1)
        }, teardown: function () {
            var d = this.ownerDocument || this, e = L.access(d, b) - 1;
            e ? L.access(d, b, e) : (d.removeEventListener(a, c, !0), L.remove(d, b))
        }}
    }), o.fn.extend({on: function (a, b, c, d, e) {
        var f, g;
        if ("object" == typeof a) {
            "string" != typeof b && (c = c || b, b = void 0);
            for (g in a)this.on(g, b, c, a[g], e);
            return this
        }
        if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1)d = $; else if (!d)return this;
        return 1 === e && (f = d, d = function (a) {
            return o().off(a), f.apply(this, arguments)
        }, d.guid = f.guid || (f.guid = o.guid++)), this.each(function () {
            o.event.add(this, a, d, c, b)
        })
    }, one: function (a, b, c, d) {
        return this.on(a, b, c, d, 1)
    }, off: function (a, b, c) {
        var d, e;
        if (a && a.preventDefault && a.handleObj)return d = a.handleObj, o(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this;
        if ("object" == typeof a) {
            for (e in a)this.off(e, b, a[e]);
            return this
        }
        return(b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = $), this.each(function () {
            o.event.remove(this, a, c, b)
        })
    }, trigger: function (a, b) {
        return this.each(function () {
            o.event.trigger(a, b, this)
        })
    }, triggerHandler: function (a, b) {
        var c = this[0];
        return c ? o.event.trigger(a, b, c, !0) : void 0
    }});
    var ab = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, bb = /<([\w:]+)/, cb = /<|&#?\w+;/, db = /<(?:script|style|link)/i, eb = /checked\s*(?:[^=]|=\s*.checked.)/i, fb = /^$|\/(?:java|ecma)script/i, gb = /^true\/(.*)/, hb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, ib = {option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""]};
    ib.optgroup = ib.option, ib.tbody = ib.tfoot = ib.colgroup = ib.caption = ib.thead, ib.th = ib.td;
    function jb(a, b) {
        return o.nodeName(a, "table") && o.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a
    }

    function kb(a) {
        return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a
    }

    function lb(a) {
        var b = gb.exec(a.type);
        return b ? a.type = b[1] : a.removeAttribute("type"), a
    }

    function mb(a, b) {
        for (var c = 0, d = a.length; d > c; c++)L.set(a[c], "globalEval", !b || L.get(b[c], "globalEval"))
    }

    function nb(a, b) {
        var c, d, e, f, g, h, i, j;
        if (1 === b.nodeType) {
            if (L.hasData(a) && (f = L.access(a), g = L.set(b, f), j = f.events)) {
                delete g.handle, g.events = {};
                for (e in j)for (c = 0, d = j[e].length; d > c; c++)o.event.add(b, e, j[e][c])
            }
            M.hasData(a) && (h = M.access(a), i = o.extend({}, h), M.set(b, i))
        }
    }

    function ob(a, b) {
        var c = a.getElementsByTagName ? a.getElementsByTagName(b || "*") : a.querySelectorAll ? a.querySelectorAll(b || "*") : [];
        return void 0 === b || b && o.nodeName(a, b) ? o.merge([a], c) : c
    }

    function pb(a, b) {
        var c = b.nodeName.toLowerCase();
        "input" === c && T.test(a.type) ? b.checked = a.checked : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue)
    }

    o.extend({clone: function (a, b, c) {
        var d, e, f, g, h = a.cloneNode(!0), i = o.contains(a.ownerDocument, a);
        if (!(l.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || o.isXMLDoc(a)))for (g = ob(h), f = ob(a), d = 0, e = f.length; e > d; d++)pb(f[d], g[d]);
        if (b)if (c)for (f = f || ob(a), g = g || ob(h), d = 0, e = f.length; e > d; d++)nb(f[d], g[d]); else nb(a, h);
        return g = ob(h, "script"), g.length > 0 && mb(g, !i && ob(a, "script")), h
    }, buildFragment: function (a, b, c, d) {
        for (var e, f, g, h, i, j, k = b.createDocumentFragment(), l = [], m = 0, n = a.length; n > m; m++)if (e = a[m], e || 0 === e)if ("object" === o.type(e))o.merge(l, e.nodeType ? [e] : e); else if (cb.test(e)) {
            f = f || k.appendChild(b.createElement("div")), g = (bb.exec(e) || ["", ""])[1].toLowerCase(), h = ib[g] || ib._default, f.innerHTML = h[1] + e.replace(ab, "<$1></$2>") + h[2], j = h[0];
            while (j--)f = f.lastChild;
            o.merge(l, f.childNodes), f = k.firstChild, f.textContent = ""
        } else l.push(b.createTextNode(e));
        k.textContent = "", m = 0;
        while (e = l[m++])if ((!d || -1 === o.inArray(e, d)) && (i = o.contains(e.ownerDocument, e), f = ob(k.appendChild(e), "script"), i && mb(f), c)) {
            j = 0;
            while (e = f[j++])fb.test(e.type || "") && c.push(e)
        }
        return k
    }, cleanData: function (a) {
        for (var b, c, d, e, f, g, h = o.event.special, i = 0; void 0 !== (c = a[i]); i++) {
            if (o.acceptData(c) && (f = c[L.expando], f && (b = L.cache[f]))) {
                if (d = Object.keys(b.events || {}), d.length)for (g = 0; void 0 !== (e = d[g]); g++)h[e] ? o.event.remove(c, e) : o.removeEvent(c, e, b.handle);
                L.cache[f] && delete L.cache[f]
            }
            delete M.cache[c[M.expando]]
        }
    }}), o.fn.extend({text: function (a) {
        return J(this, function (a) {
            return void 0 === a ? o.text(this) : this.empty().each(function () {
                (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = a)
            })
        }, null, a, arguments.length)
    }, append: function () {
        return this.domManip(arguments, function (a) {
            if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                var b = jb(this, a);
                b.appendChild(a)
            }
        })
    }, prepend: function () {
        return this.domManip(arguments, function (a) {
            if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                var b = jb(this, a);
                b.insertBefore(a, b.firstChild)
            }
        })
    }, before: function () {
        return this.domManip(arguments, function (a) {
            this.parentNode && this.parentNode.insertBefore(a, this)
        })
    }, after: function () {
        return this.domManip(arguments, function (a) {
            this.parentNode && this.parentNode.insertBefore(a, this.nextSibling)
        })
    }, remove: function (a, b) {
        for (var c, d = a ? o.filter(a, this) : this, e = 0; null != (c = d[e]); e++)b || 1 !== c.nodeType || o.cleanData(ob(c)), c.parentNode && (b && o.contains(c.ownerDocument, c) && mb(ob(c, "script")), c.parentNode.removeChild(c));
        return this
    }, empty: function () {
        for (var a, b = 0; null != (a = this[b]); b++)1 === a.nodeType && (o.cleanData(ob(a, !1)), a.textContent = "");
        return this
    }, clone: function (a, b) {
        return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () {
            return o.clone(this, a, b)
        })
    }, html: function (a) {
        return J(this, function (a) {
            var b = this[0] || {}, c = 0, d = this.length;
            if (void 0 === a && 1 === b.nodeType)return b.innerHTML;
            if ("string" == typeof a && !db.test(a) && !ib[(bb.exec(a) || ["", ""])[1].toLowerCase()]) {
                a = a.replace(ab, "<$1></$2>");
                try {
                    for (; d > c; c++)b = this[c] || {}, 1 === b.nodeType && (o.cleanData(ob(b, !1)), b.innerHTML = a);
                    b = 0
                } catch (e) {
                }
            }
            b && this.empty().append(a)
        }, null, a, arguments.length)
    }, replaceWith: function () {
        var a = arguments[0];
        return this.domManip(arguments, function (b) {
            a = this.parentNode, o.cleanData(ob(this)), a && a.replaceChild(b, this)
        }), a && (a.length || a.nodeType) ? this : this.remove()
    }, detach: function (a) {
        return this.remove(a, !0)
    }, domManip: function (a, b) {
        a = e.apply([], a);
        var c, d, f, g, h, i, j = 0, k = this.length, m = this, n = k - 1, p = a[0], q = o.isFunction(p);
        if (q || k > 1 && "string" == typeof p && !l.checkClone && eb.test(p))return this.each(function (c) {
            var d = m.eq(c);
            q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b)
        });
        if (k && (c = o.buildFragment(a, this[0].ownerDocument, !1, this), d = c.firstChild, 1 === c.childNodes.length && (c = d), d)) {
            for (f = o.map(ob(c, "script"), kb), g = f.length; k > j; j++)h = c, j !== n && (h = o.clone(h, !0, !0), g && o.merge(f, ob(h, "script"))), b.call(this[j], h, j);
            if (g)for (i = f[f.length - 1].ownerDocument, o.map(f, lb), j = 0; g > j; j++)h = f[j], fb.test(h.type || "") && !L.access(h, "globalEval") && o.contains(i, h) && (h.src ? o._evalUrl && o._evalUrl(h.src) : o.globalEval(h.textContent.replace(hb, "")))
        }
        return this
    }}), o.each({appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith"}, function (a, b) {
        o.fn[a] = function (a) {
            for (var c, d = [], e = o(a), g = e.length - 1, h = 0; g >= h; h++)c = h === g ? this : this.clone(!0), o(e[h])[b](c), f.apply(d, c.get());
            return this.pushStack(d)
        }
    });
    var qb, rb = {};

    function sb(b, c) {
        var d = o(c.createElement(b)).appendTo(c.body), e = a.getDefaultComputedStyle ? a.getDefaultComputedStyle(d[0]).display : o.css(d[0], "display");
        return d.detach(), e
    }

    function tb(a) {
        var b = m, c = rb[a];
        return c || (c = sb(a, b), "none" !== c && c || (qb = (qb || o("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = qb[0].contentDocument, b.write(), b.close(), c = sb(a, b), qb.detach()), rb[a] = c), c
    }

    var ub = /^margin/, vb = new RegExp("^(" + Q + ")(?!px)[a-z%]+$", "i"), wb = function (a) {
        return a.ownerDocument.defaultView.getComputedStyle(a, null)
    };

    function xb(a, b, c) {
        var d, e, f, g, h = a.style;
        return c = c || wb(a), c && (g = c.getPropertyValue(b) || c[b]), c && ("" !== g || o.contains(a.ownerDocument, a) || (g = o.style(a, b)), vb.test(g) && ub.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 !== g ? g + "" : g
    }

    function yb(a, b) {
        return{get: function () {
            return a() ? void delete this.get : (this.get = b).apply(this, arguments)
        }}
    }

    !function () {
        var b, c, d = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box", e = m.documentElement, f = m.createElement("div"), g = m.createElement("div");
        g.style.backgroundClip = "content-box", g.cloneNode(!0).style.backgroundClip = "", l.clearCloneStyle = "content-box" === g.style.backgroundClip, f.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", f.appendChild(g);
        function h() {
            g.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%", e.appendChild(f);
            var d = a.getComputedStyle(g, null);
            b = "1%" !== d.top, c = "4px" === d.width, e.removeChild(f)
        }

        a.getComputedStyle && o.extend(l, {pixelPosition: function () {
            return h(), b
        }, boxSizingReliable: function () {
            return null == c && h(), c
        }, reliableMarginRight: function () {
            var b, c = g.appendChild(m.createElement("div"));
            return c.style.cssText = g.style.cssText = d, c.style.marginRight = c.style.width = "0", g.style.width = "1px", e.appendChild(f), b = !parseFloat(a.getComputedStyle(c, null).marginRight), e.removeChild(f), g.innerHTML = "", b
        }})
    }(), o.swap = function (a, b, c, d) {
        var e, f, g = {};
        for (f in b)g[f] = a.style[f], a.style[f] = b[f];
        e = c.apply(a, d || []);
        for (f in b)a.style[f] = g[f];
        return e
    };
    var zb = /^(none|table(?!-c[ea]).+)/, Ab = new RegExp("^(" + Q + ")(.*)$", "i"), Bb = new RegExp("^([+-])=(" + Q + ")", "i"), Cb = {position: "absolute", visibility: "hidden", display: "block"}, Db = {letterSpacing: 0, fontWeight: 400}, Eb = ["Webkit", "O", "Moz", "ms"];

    function Fb(a, b) {
        if (b in a)return b;
        var c = b[0].toUpperCase() + b.slice(1), d = b, e = Eb.length;
        while (e--)if (b = Eb[e] + c, b in a)return b;
        return d
    }

    function Gb(a, b, c) {
        var d = Ab.exec(b);
        return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b
    }

    function Hb(a, b, c, d, e) {
        for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2)"margin" === c && (g += o.css(a, c + R[f], !0, e)), d ? ("content" === c && (g -= o.css(a, "padding" + R[f], !0, e)), "margin" !== c && (g -= o.css(a, "border" + R[f] + "Width", !0, e))) : (g += o.css(a, "padding" + R[f], !0, e), "padding" !== c && (g += o.css(a, "border" + R[f] + "Width", !0, e)));
        return g
    }

    function Ib(a, b, c) {
        var d = !0, e = "width" === b ? a.offsetWidth : a.offsetHeight, f = wb(a), g = "border-box" === o.css(a, "boxSizing", !1, f);
        if (0 >= e || null == e) {
            if (e = xb(a, b, f), (0 > e || null == e) && (e = a.style[b]), vb.test(e))return e;
            d = g && (l.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0
        }
        return e + Hb(a, b, c || (g ? "border" : "content"), d, f) + "px"
    }

    function Jb(a, b) {
        for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++)d = a[g], d.style && (f[g] = L.get(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && S(d) && (f[g] = L.access(d, "olddisplay", tb(d.nodeName)))) : f[g] || (e = S(d), (c && "none" !== c || !e) && L.set(d, "olddisplay", e ? c : o.css(d, "display"))));
        for (g = 0; h > g; g++)d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
        return a
    }

    o.extend({cssHooks: {opacity: {get: function (a, b) {
        if (b) {
            var c = xb(a, "opacity");
            return"" === c ? "1" : c
        }
    }}}, cssNumber: {columnCount: !0, fillOpacity: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0}, cssProps: {"float": "cssFloat"}, style: function (a, b, c, d) {
        if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
            var e, f, g, h = o.camelCase(b), i = a.style;
            return b = o.cssProps[h] || (o.cssProps[h] = Fb(i, h)), g = o.cssHooks[b] || o.cssHooks[h], void 0 === c ? g && "get"in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, "string" === f && (e = Bb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(o.css(a, b)), f = "number"), null != c && c === c && ("number" !== f || o.cssNumber[h] || (c += "px"), l.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), g && "set"in g && void 0 === (c = g.set(a, c, d)) || (i[b] = "", i[b] = c)), void 0)
        }
    }, css: function (a, b, c, d) {
        var e, f, g, h = o.camelCase(b);
        return b = o.cssProps[h] || (o.cssProps[h] = Fb(a.style, h)), g = o.cssHooks[b] || o.cssHooks[h], g && "get"in g && (e = g.get(a, !0, c)), void 0 === e && (e = xb(a, b, d)), "normal" === e && b in Db && (e = Db[b]), "" === c || c ? (f = parseFloat(e), c === !0 || o.isNumeric(f) ? f || 0 : e) : e
    }}), o.each(["height", "width"], function (a, b) {
        o.cssHooks[b] = {get: function (a, c, d) {
            return c ? 0 === a.offsetWidth && zb.test(o.css(a, "display")) ? o.swap(a, Cb, function () {
                return Ib(a, b, d)
            }) : Ib(a, b, d) : void 0
        }, set: function (a, c, d) {
            var e = d && wb(a);
            return Gb(a, c, d ? Hb(a, b, d, "border-box" === o.css(a, "boxSizing", !1, e), e) : 0)
        }}
    }), o.cssHooks.marginRight = yb(l.reliableMarginRight, function (a, b) {
        return b ? o.swap(a, {display: "inline-block"}, xb, [a, "marginRight"]) : void 0
    }), o.each({margin: "", padding: "", border: "Width"}, function (a, b) {
        o.cssHooks[a + b] = {expand: function (c) {
            for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++)e[a + R[d] + b] = f[d] || f[d - 2] || f[0];
            return e
        }}, ub.test(a) || (o.cssHooks[a + b].set = Gb)
    }), o.fn.extend({css: function (a, b) {
        return J(this, function (a, b, c) {
            var d, e, f = {}, g = 0;
            if (o.isArray(b)) {
                for (d = wb(a), e = b.length; e > g; g++)f[b[g]] = o.css(a, b[g], !1, d);
                return f
            }
            return void 0 !== c ? o.style(a, b, c) : o.css(a, b)
        }, a, b, arguments.length > 1)
    }, show: function () {
        return Jb(this, !0)
    }, hide: function () {
        return Jb(this)
    }, toggle: function (a) {
        return"boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function () {
            S(this) ? o(this).show() : o(this).hide()
        })
    }});
    function Kb(a, b, c, d, e) {
        return new Kb.prototype.init(a, b, c, d, e)
    }

    o.Tween = Kb, Kb.prototype = {constructor: Kb, init: function (a, b, c, d, e, f) {
        this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (o.cssNumber[c] ? "" : "px")
    }, cur: function () {
        var a = Kb.propHooks[this.prop];
        return a && a.get ? a.get(this) : Kb.propHooks._default.get(this)
    }, run: function (a) {
        var b, c = Kb.propHooks[this.prop];
        return this.pos = b = this.options.duration ? o.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Kb.propHooks._default.set(this), this
    }}, Kb.prototype.init.prototype = Kb.prototype, Kb.propHooks = {_default: {get: function (a) {
        var b;
        return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = o.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop]
    }, set: function (a) {
        o.fx.step[a.prop] ? o.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[o.cssProps[a.prop]] || o.cssHooks[a.prop]) ? o.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now
    }}}, Kb.propHooks.scrollTop = Kb.propHooks.scrollLeft = {set: function (a) {
        a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now)
    }}, o.easing = {linear: function (a) {
        return a
    }, swing: function (a) {
        return.5 - Math.cos(a * Math.PI) / 2
    }}, o.fx = Kb.prototype.init, o.fx.step = {};
    var Lb, Mb, Nb = /^(?:toggle|show|hide)$/, Ob = new RegExp("^(?:([+-])=|)(" + Q + ")([a-z%]*)$", "i"), Pb = /queueHooks$/, Qb = [Vb], Rb = {"*": [function (a, b) {
        var c = this.createTween(a, b), d = c.cur(), e = Ob.exec(b), f = e && e[3] || (o.cssNumber[a] ? "" : "px"), g = (o.cssNumber[a] || "px" !== f && +d) && Ob.exec(o.css(c.elem, a)), h = 1, i = 20;
        if (g && g[3] !== f) {
            f = f || g[3], e = e || [], g = +d || 1;
            do h = h || ".5", g /= h, o.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i)
        }
        return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c
    }]};

    function Sb() {
        return setTimeout(function () {
            Lb = void 0
        }), Lb = o.now()
    }

    function Tb(a, b) {
        var c, d = 0, e = {height: a};
        for (b = b ? 1 : 0; 4 > d; d += 2 - b)c = R[d], e["margin" + c] = e["padding" + c] = a;
        return b && (e.opacity = e.width = a), e
    }

    function Ub(a, b, c) {
        for (var d, e = (Rb[b] || []).concat(Rb["*"]), f = 0, g = e.length; g > f; f++)if (d = e[f].call(c, b, a))return d
    }

    function Vb(a, b, c) {
        var d, e, f, g, h, i, j, k = this, l = {}, m = a.style, n = a.nodeType && S(a), p = L.get(a, "fxshow");
        c.queue || (h = o._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () {
            h.unqueued || i()
        }), h.unqueued++, k.always(function () {
            k.always(function () {
                h.unqueued--, o.queue(a, "fx").length || h.empty.fire()
            })
        })), 1 === a.nodeType && ("height"in b || "width"in b) && (c.overflow = [m.overflow, m.overflowX, m.overflowY], j = o.css(a, "display"), "none" === j && (j = tb(a.nodeName)), "inline" === j && "none" === o.css(a, "float") && (m.display = "inline-block")), c.overflow && (m.overflow = "hidden", k.always(function () {
            m.overflow = c.overflow[0], m.overflowX = c.overflow[1], m.overflowY = c.overflow[2]
        }));
        for (d in b)if (e = b[d], Nb.exec(e)) {
            if (delete b[d], f = f || "toggle" === e, e === (n ? "hide" : "show")) {
                if ("show" !== e || !p || void 0 === p[d])continue;
                n = !0
            }
            l[d] = p && p[d] || o.style(a, d)
        }
        if (!o.isEmptyObject(l)) {
            p ? "hidden"in p && (n = p.hidden) : p = L.access(a, "fxshow", {}), f && (p.hidden = !n), n ? o(a).show() : k.done(function () {
                o(a).hide()
            }), k.done(function () {
                var b;
                L.remove(a, "fxshow");
                for (b in l)o.style(a, b, l[b])
            });
            for (d in l)g = Ub(n ? p[d] : 0, d, k), d in p || (p[d] = g.start, n && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0))
        }
    }

    function Wb(a, b) {
        var c, d, e, f, g;
        for (c in a)if (d = o.camelCase(c), e = b[d], f = a[c], o.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = o.cssHooks[d], g && "expand"in g) {
            f = g.expand(f), delete a[d];
            for (c in f)c in a || (a[c] = f[c], b[c] = e)
        } else b[d] = e
    }

    function Xb(a, b, c) {
        var d, e, f = 0, g = Qb.length, h = o.Deferred().always(function () {
            delete i.elem
        }), i = function () {
            if (e)return!1;
            for (var b = Lb || Sb(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++)j.tweens[g].run(f);
            return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1)
        }, j = h.promise({elem: a, props: o.extend({}, b), opts: o.extend(!0, {specialEasing: {}}, c), originalProperties: b, originalOptions: c, startTime: Lb || Sb(), duration: c.duration, tweens: [], createTween: function (b, c) {
            var d = o.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
            return j.tweens.push(d), d
        }, stop: function (b) {
            var c = 0, d = b ? j.tweens.length : 0;
            if (e)return this;
            for (e = !0; d > c; c++)j.tweens[c].run(1);
            return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this
        }}), k = j.props;
        for (Wb(k, j.opts.specialEasing); g > f; f++)if (d = Qb[f].call(j, a, k, j.opts))return d;
        return o.map(k, Ub, j), o.isFunction(j.opts.start) && j.opts.start.call(a, j), o.fx.timer(o.extend(i, {elem: a, anim: j, queue: j.opts.queue})), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always)
    }

    o.Animation = o.extend(Xb, {tweener: function (a, b) {
        o.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" ");
        for (var c, d = 0, e = a.length; e > d; d++)c = a[d], Rb[c] = Rb[c] || [], Rb[c].unshift(b)
    }, prefilter: function (a, b) {
        b ? Qb.unshift(a) : Qb.push(a)
    }}), o.speed = function (a, b, c) {
        var d = a && "object" == typeof a ? o.extend({}, a) : {complete: c || !c && b || o.isFunction(a) && a, duration: a, easing: c && b || b && !o.isFunction(b) && b};
        return d.duration = o.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in o.fx.speeds ? o.fx.speeds[d.duration] : o.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function () {
            o.isFunction(d.old) && d.old.call(this), d.queue && o.dequeue(this, d.queue)
        }, d
    }, o.fn.extend({fadeTo: function (a, b, c, d) {
        return this.filter(S).css("opacity", 0).show().end().animate({opacity: b}, a, c, d)
    }, animate: function (a, b, c, d) {
        var e = o.isEmptyObject(a), f = o.speed(b, c, d), g = function () {
            var b = Xb(this, o.extend({}, a), f);
            (e || L.get(this, "finish")) && b.stop(!0)
        };
        return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g)
    }, stop: function (a, b, c) {
        var d = function (a) {
            var b = a.stop;
            delete a.stop, b(c)
        };
        return"string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function () {
            var b = !0, e = null != a && a + "queueHooks", f = o.timers, g = L.get(this);
            if (e)g[e] && g[e].stop && d(g[e]); else for (e in g)g[e] && g[e].stop && Pb.test(e) && d(g[e]);
            for (e = f.length; e--;)f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));
            (b || !c) && o.dequeue(this, a)
        })
    }, finish: function (a) {
        return a !== !1 && (a = a || "fx"), this.each(function () {
            var b, c = L.get(this), d = c[a + "queue"], e = c[a + "queueHooks"], f = o.timers, g = d ? d.length : 0;
            for (c.finish = !0, o.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;)f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));
            for (b = 0; g > b; b++)d[b] && d[b].finish && d[b].finish.call(this);
            delete c.finish
        })
    }}), o.each(["toggle", "show", "hide"], function (a, b) {
        var c = o.fn[b];
        o.fn[b] = function (a, d, e) {
            return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(Tb(b, !0), a, d, e)
        }
    }), o.each({slideDown: Tb("show"), slideUp: Tb("hide"), slideToggle: Tb("toggle"), fadeIn: {opacity: "show"}, fadeOut: {opacity: "hide"}, fadeToggle: {opacity: "toggle"}}, function (a, b) {
        o.fn[a] = function (a, c, d) {
            return this.animate(b, a, c, d)
        }
    }), o.timers = [], o.fx.tick = function () {
        var a, b = 0, c = o.timers;
        for (Lb = o.now(); b < c.length; b++)a = c[b], a() || c[b] !== a || c.splice(b--, 1);
        c.length || o.fx.stop(), Lb = void 0
    }, o.fx.timer = function (a) {
        o.timers.push(a), a() ? o.fx.start() : o.timers.pop()
    }, o.fx.interval = 13, o.fx.start = function () {
        Mb || (Mb = setInterval(o.fx.tick, o.fx.interval))
    }, o.fx.stop = function () {
        clearInterval(Mb), Mb = null
    }, o.fx.speeds = {slow: 600, fast: 200, _default: 400}, o.fn.delay = function (a, b) {
        return a = o.fx ? o.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function (b, c) {
            var d = setTimeout(b, a);
            c.stop = function () {
                clearTimeout(d)
            }
        })
    }, function () {
        var a = m.createElement("input"), b = m.createElement("select"), c = b.appendChild(m.createElement("option"));
        a.type = "checkbox", l.checkOn = "" !== a.value, l.optSelected = c.selected, b.disabled = !0, l.optDisabled = !c.disabled, a = m.createElement("input"), a.value = "t", a.type = "radio", l.radioValue = "t" === a.value
    }();
    var Yb, Zb, $b = o.expr.attrHandle;
    o.fn.extend({attr: function (a, b) {
        return J(this, o.attr, a, b, arguments.length > 1)
    }, removeAttr: function (a) {
        return this.each(function () {
            o.removeAttr(this, a)
        })
    }}), o.extend({attr: function (a, b, c) {
        var d, e, f = a.nodeType;
        if (a && 3 !== f && 8 !== f && 2 !== f)return typeof a.getAttribute === U ? o.prop(a, b, c) : (1 === f && o.isXMLDoc(a) || (b = b.toLowerCase(), d = o.attrHooks[b] || (o.expr.match.bool.test(b) ? Zb : Yb)), void 0 === c ? d && "get"in d && null !== (e = d.get(a, b)) ? e : (e = o.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && "set"in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), c) : void o.removeAttr(a, b))
    }, removeAttr: function (a, b) {
        var c, d, e = 0, f = b && b.match(E);
        if (f && 1 === a.nodeType)while (c = f[e++])d = o.propFix[c] || c, o.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c)
    }, attrHooks: {type: {set: function (a, b) {
        if (!l.radioValue && "radio" === b && o.nodeName(a, "input")) {
            var c = a.value;
            return a.setAttribute("type", b), c && (a.value = c), b
        }
    }}}}), Zb = {set: function (a, b, c) {
        return b === !1 ? o.removeAttr(a, c) : a.setAttribute(c, c), c
    }}, o.each(o.expr.match.bool.source.match(/\w+/g), function (a, b) {
        var c = $b[b] || o.find.attr;
        $b[b] = function (a, b, d) {
            var e, f;
            return d || (f = $b[b], $b[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, $b[b] = f), e
        }
    });
    var _b = /^(?:input|select|textarea|button)$/i;
    o.fn.extend({prop: function (a, b) {
        return J(this, o.prop, a, b, arguments.length > 1)
    }, removeProp: function (a) {
        return this.each(function () {
            delete this[o.propFix[a] || a]
        })
    }}), o.extend({propFix: {"for": "htmlFor", "class": "className"}, prop: function (a, b, c) {
        var d, e, f, g = a.nodeType;
        if (a && 3 !== g && 8 !== g && 2 !== g)return f = 1 !== g || !o.isXMLDoc(a), f && (b = o.propFix[b] || b, e = o.propHooks[b]), void 0 !== c ? e && "set"in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get"in e && null !== (d = e.get(a, b)) ? d : a[b]
    }, propHooks: {tabIndex: {get: function (a) {
        return a.hasAttribute("tabindex") || _b.test(a.nodeName) || a.href ? a.tabIndex : -1
    }}}}), l.optSelected || (o.propHooks.selected = {get: function (a) {
        var b = a.parentNode;
        return b && b.parentNode && b.parentNode.selectedIndex, null
    }}), o.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
        o.propFix[this.toLowerCase()] = this
    });
    var ac = /[\t\r\n\f]/g;
    o.fn.extend({addClass: function (a) {
        var b, c, d, e, f, g, h = "string" == typeof a && a, i = 0, j = this.length;
        if (o.isFunction(a))return this.each(function (b) {
            o(this).addClass(a.call(this, b, this.className))
        });
        if (h)for (b = (a || "").match(E) || []; j > i; i++)if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ac, " ") : " ")) {
            f = 0;
            while (e = b[f++])d.indexOf(" " + e + " ") < 0 && (d += e + " ");
            g = o.trim(d), c.className !== g && (c.className = g)
        }
        return this
    }, removeClass: function (a) {
        var b, c, d, e, f, g, h = 0 === arguments.length || "string" == typeof a && a, i = 0, j = this.length;
        if (o.isFunction(a))return this.each(function (b) {
            o(this).removeClass(a.call(this, b, this.className))
        });
        if (h)for (b = (a || "").match(E) || []; j > i; i++)if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ac, " ") : "")) {
            f = 0;
            while (e = b[f++])while (d.indexOf(" " + e + " ") >= 0)d = d.replace(" " + e + " ", " ");
            g = a ? o.trim(d) : "", c.className !== g && (c.className = g)
        }
        return this
    }, toggleClass: function (a, b) {
        var c = typeof a;
        return"boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(o.isFunction(a) ? function (c) {
            o(this).toggleClass(a.call(this, c, this.className, b), b)
        } : function () {
            if ("string" === c) {
                var b, d = 0, e = o(this), f = a.match(E) || [];
                while (b = f[d++])e.hasClass(b) ? e.removeClass(b) : e.addClass(b)
            } else(c === U || "boolean" === c) && (this.className && L.set(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : L.get(this, "__className__") || "")
        })
    }, hasClass: function (a) {
        for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++)if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(ac, " ").indexOf(b) >= 0)return!0;
        return!1
    }});
    var bc = /\r/g;
    o.fn.extend({val: function (a) {
        var b, c, d, e = this[0];
        {
            if (arguments.length)return d = o.isFunction(a), this.each(function (c) {
                var e;
                1 === this.nodeType && (e = d ? a.call(this, c, o(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : o.isArray(e) && (e = o.map(e, function (a) {
                    return null == a ? "" : a + ""
                })), b = o.valHooks[this.type] || o.valHooks[this.nodeName.toLowerCase()], b && "set"in b && void 0 !== b.set(this, e, "value") || (this.value = e))
            });
            if (e)return b = o.valHooks[e.type] || o.valHooks[e.nodeName.toLowerCase()], b && "get"in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(bc, "") : null == c ? "" : c)
        }
    }}), o.extend({valHooks: {select: {get: function (a) {
        for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)if (c = d[i], !(!c.selected && i !== e || (l.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && o.nodeName(c.parentNode, "optgroup"))) {
            if (b = o(c).val(), f)return b;
            g.push(b)
        }
        return g
    }, set: function (a, b) {
        var c, d, e = a.options, f = o.makeArray(b), g = e.length;
        while (g--)d = e[g], (d.selected = o.inArray(o(d).val(), f) >= 0) && (c = !0);
        return c || (a.selectedIndex = -1), f
    }}}}), o.each(["radio", "checkbox"], function () {
        o.valHooks[this] = {set: function (a, b) {
            return o.isArray(b) ? a.checked = o.inArray(o(a).val(), b) >= 0 : void 0
        }}, l.checkOn || (o.valHooks[this].get = function (a) {
            return null === a.getAttribute("value") ? "on" : a.value
        })
    }), o.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (a, b) {
        o.fn[b] = function (a, c) {
            return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b)
        }
    }), o.fn.extend({hover: function (a, b) {
        return this.mouseenter(a).mouseleave(b || a)
    }, bind: function (a, b, c) {
        return this.on(a, null, b, c)
    }, unbind: function (a, b) {
        return this.off(a, null, b)
    }, delegate: function (a, b, c, d) {
        return this.on(b, a, c, d)
    }, undelegate: function (a, b, c) {
        return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c)
    }});
    var cc = o.now(), dc = /\?/;
    o.parseJSON = function (a) {
        return JSON.parse(a + "")
    }, o.parseXML = function (a) {
        var b, c;
        if (!a || "string" != typeof a)return null;
        try {
            c = new DOMParser, b = c.parseFromString(a, "text/xml")
        } catch (d) {
            b = void 0
        }
        return(!b || b.getElementsByTagName("parsererror").length) && o.error("Invalid XML: " + a), b
    };
    var ec, fc, gc = /#.*$/, hc = /([?&])_=[^&]*/, ic = /^(.*?):[ \t]*([^\r\n]*)$/gm, jc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, kc = /^(?:GET|HEAD)$/, lc = /^\/\//, mc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, nc = {}, oc = {}, pc = "*/".concat("*");
    try {
        fc = location.href
    } catch (qc) {
        fc = m.createElement("a"), fc.href = "", fc = fc.href
    }
    ec = mc.exec(fc.toLowerCase()) || [];
    function rc(a) {
        return function (b, c) {
            "string" != typeof b && (c = b, b = "*");
            var d, e = 0, f = b.toLowerCase().match(E) || [];
            if (o.isFunction(c))while (d = f[e++])"+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c)
        }
    }

    function sc(a, b, c, d) {
        var e = {}, f = a === oc;

        function g(h) {
            var i;
            return e[h] = !0, o.each(a[h] || [], function (a, h) {
                var j = h(b, c, d);
                return"string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1)
            }), i
        }

        return g(b.dataTypes[0]) || !e["*"] && g("*")
    }

    function tc(a, b) {
        var c, d, e = o.ajaxSettings.flatOptions || {};
        for (c in b)void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]);
        return d && o.extend(!0, a, d), a
    }

    function uc(a, b, c) {
        var d, e, f, g, h = a.contents, i = a.dataTypes;
        while ("*" === i[0])i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type"));
        if (d)for (e in h)if (h[e] && h[e].test(d)) {
            i.unshift(e);
            break
        }
        if (i[0]in c)f = i[0]; else {
            for (e in c) {
                if (!i[0] || a.converters[e + " " + i[0]]) {
                    f = e;
                    break
                }
                g || (g = e)
            }
            f = f || g
        }
        return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0
    }

    function vc(a, b, c, d) {
        var e, f, g, h, i, j = {}, k = a.dataTypes.slice();
        if (k[1])for (g in a.converters)j[g.toLowerCase()] = a.converters[g];
        f = k.shift();
        while (f)if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift())if ("*" === f)f = i; else if ("*" !== i && i !== f) {
            if (g = j[i + " " + f] || j["* " + f], !g)for (e in j)if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
                g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                break
            }
            if (g !== !0)if (g && a["throws"])b = g(b); else try {
                b = g(b)
            } catch (l) {
                return{state: "parsererror", error: g ? l : "No conversion from " + i + " to " + f}
            }
        }
        return{state: "success", data: b}
    }

    o.extend({active: 0, lastModified: {}, etag: {}, ajaxSettings: {url: fc, type: "GET", isLocal: jc.test(ec[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: {"*": pc, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript"}, contents: {xml: /xml/, html: /html/, json: /json/}, responseFields: {xml: "responseXML", text: "responseText", json: "responseJSON"}, converters: {"* text": String, "text html": !0, "text json": o.parseJSON, "text xml": o.parseXML}, flatOptions: {url: !0, context: !0}}, ajaxSetup: function (a, b) {
        return b ? tc(tc(a, o.ajaxSettings), b) : tc(o.ajaxSettings, a)
    }, ajaxPrefilter: rc(nc), ajaxTransport: rc(oc), ajax: function (a, b) {
        "object" == typeof a && (b = a, a = void 0), b = b || {};
        var c, d, e, f, g, h, i, j, k = o.ajaxSetup({}, b), l = k.context || k, m = k.context && (l.nodeType || l.jquery) ? o(l) : o.event, n = o.Deferred(), p = o.Callbacks("once memory"), q = k.statusCode || {}, r = {}, s = {}, t = 0, u = "canceled", v = {readyState: 0, getResponseHeader: function (a) {
            var b;
            if (2 === t) {
                if (!f) {
                    f = {};
                    while (b = ic.exec(e))f[b[1].toLowerCase()] = b[2]
                }
                b = f[a.toLowerCase()]
            }
            return null == b ? null : b
        }, getAllResponseHeaders: function () {
            return 2 === t ? e : null
        }, setRequestHeader: function (a, b) {
            var c = a.toLowerCase();
            return t || (a = s[c] = s[c] || a, r[a] = b), this
        }, overrideMimeType: function (a) {
            return t || (k.mimeType = a), this
        }, statusCode: function (a) {
            var b;
            if (a)if (2 > t)for (b in a)q[b] = [q[b], a[b]]; else v.always(a[v.status]);
            return this
        }, abort: function (a) {
            var b = a || u;
            return c && c.abort(b), x(0, b), this
        }};
        if (n.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || fc) + "").replace(gc, "").replace(lc, ec[1] + "//"), k.type = b.method || b.type || k.method || k.type, k.dataTypes = o.trim(k.dataType || "*").toLowerCase().match(E) || [""], null == k.crossDomain && (h = mc.exec(k.url.toLowerCase()), k.crossDomain = !(!h || h[1] === ec[1] && h[2] === ec[2] && (h[3] || ("http:" === h[1] ? "80" : "443")) === (ec[3] || ("http:" === ec[1] ? "80" : "443")))), k.data && k.processData && "string" != typeof k.data && (k.data = o.param(k.data, k.traditional)), sc(nc, k, b, v), 2 === t)return v;
        i = k.global, i && 0 === o.active++ && o.event.trigger("ajaxStart"), k.type = k.type.toUpperCase(), k.hasContent = !kc.test(k.type), d = k.url, k.hasContent || (k.data && (d = k.url += (dc.test(d) ? "&" : "?") + k.data, delete k.data), k.cache === !1 && (k.url = hc.test(d) ? d.replace(hc, "$1_=" + cc++) : d + (dc.test(d) ? "&" : "?") + "_=" + cc++)), k.ifModified && (o.lastModified[d] && v.setRequestHeader("If-Modified-Since", o.lastModified[d]), o.etag[d] && v.setRequestHeader("If-None-Match", o.etag[d])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + pc + "; q=0.01" : "") : k.accepts["*"]);
        for (j in k.headers)v.setRequestHeader(j, k.headers[j]);
        if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t))return v.abort();
        u = "abort";
        for (j in{success: 1, error: 1, complete: 1})v[j](k[j]);
        if (c = sc(oc, k, b, v)) {
            v.readyState = 1, i && m.trigger("ajaxSend", [v, k]), k.async && k.timeout > 0 && (g = setTimeout(function () {
                v.abort("timeout")
            }, k.timeout));
            try {
                t = 1, c.send(r, x)
            } catch (w) {
                if (!(2 > t))throw w;
                x(-1, w)
            }
        } else x(-1, "No Transport");
        function x(a, b, f, h) {
            var j, r, s, u, w, x = b;
            2 !== t && (t = 2, g && clearTimeout(g), c = void 0, e = h || "", v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, f && (u = uc(k, v, f)), u = vc(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (o.lastModified[d] = w), w = v.getResponseHeader("etag"), w && (o.etag[d] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + "", j ? n.resolveWith(l, [r, x, v]) : n.rejectWith(l, [v, x, s]), v.statusCode(q), q = void 0, i && m.trigger(j ? "ajaxSuccess" : "ajaxError", [v, k, j ? r : s]), p.fireWith(l, [v, x]), i && (m.trigger("ajaxComplete", [v, k]), --o.active || o.event.trigger("ajaxStop")))
        }

        return v
    }, getJSON: function (a, b, c) {
        return o.get(a, b, c, "json")
    }, getScript: function (a, b) {
        return o.get(a, void 0, b, "script")
    }}), o.each(["get", "post"], function (a, b) {
        o[b] = function (a, c, d, e) {
            return o.isFunction(c) && (e = e || d, d = c, c = void 0), o.ajax({url: a, type: b, dataType: e, data: c, success: d})
        }
    }), o.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (a, b) {
        o.fn[b] = function (a) {
            return this.on(b, a)
        }
    }), o._evalUrl = function (a) {
        return o.ajax({url: a, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0})
    }, o.fn.extend({wrapAll: function (a) {
        var b;
        return o.isFunction(a) ? this.each(function (b) {
            o(this).wrapAll(a.call(this, b))
        }) : (this[0] && (b = o(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function () {
            var a = this;
            while (a.firstElementChild)a = a.firstElementChild;
            return a
        }).append(this)), this)
    }, wrapInner: function (a) {
        return this.each(o.isFunction(a) ? function (b) {
            o(this).wrapInner(a.call(this, b))
        } : function () {
            var b = o(this), c = b.contents();
            c.length ? c.wrapAll(a) : b.append(a)
        })
    }, wrap: function (a) {
        var b = o.isFunction(a);
        return this.each(function (c) {
            o(this).wrapAll(b ? a.call(this, c) : a)
        })
    }, unwrap: function () {
        return this.parent().each(function () {
            o.nodeName(this, "body") || o(this).replaceWith(this.childNodes)
        }).end()
    }}), o.expr.filters.hidden = function (a) {
        return a.offsetWidth <= 0 && a.offsetHeight <= 0
    }, o.expr.filters.visible = function (a) {
        return!o.expr.filters.hidden(a)
    };
    var wc = /%20/g, xc = /\[\]$/, yc = /\r?\n/g, zc = /^(?:submit|button|image|reset|file)$/i, Ac = /^(?:input|select|textarea|keygen)/i;

    function Bc(a, b, c, d) {
        var e;
        if (o.isArray(b))o.each(b, function (b, e) {
            c || xc.test(a) ? d(a, e) : Bc(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d)
        }); else if (c || "object" !== o.type(b))d(a, b); else for (e in b)Bc(a + "[" + e + "]", b[e], c, d)
    }

    o.param = function (a, b) {
        var c, d = [], e = function (a, b) {
            b = o.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b)
        };
        if (void 0 === b && (b = o.ajaxSettings && o.ajaxSettings.traditional), o.isArray(a) || a.jquery && !o.isPlainObject(a))o.each(a, function () {
            e(this.name, this.value)
        }); else for (c in a)Bc(c, a[c], b, e);
        return d.join("&").replace(wc, "+")
    }, o.fn.extend({serialize: function () {
        return o.param(this.serializeArray())
    }, serializeArray: function () {
        return this.map(function () {
            var a = o.prop(this, "elements");
            return a ? o.makeArray(a) : this
        }).filter(function () {
            var a = this.type;
            return this.name && !o(this).is(":disabled") && Ac.test(this.nodeName) && !zc.test(a) && (this.checked || !T.test(a))
        }).map(function (a, b) {
            var c = o(this).val();
            return null == c ? null : o.isArray(c) ? o.map(c, function (a) {
                return{name: b.name, value: a.replace(yc, "\r\n")}
            }) : {name: b.name, value: c.replace(yc, "\r\n")}
        }).get()
    }}), o.ajaxSettings.xhr = function () {
        try {
            return new XMLHttpRequest
        } catch (a) {
        }
    };
    var Cc = 0, Dc = {}, Ec = {0: 200, 1223: 204}, Fc = o.ajaxSettings.xhr();
    a.ActiveXObject && o(a).on("unload", function () {
        for (var a in Dc)Dc[a]()
    }), l.cors = !!Fc && "withCredentials"in Fc, l.ajax = Fc = !!Fc, o.ajaxTransport(function (a) {
        var b;
        return l.cors || Fc && !a.crossDomain ? {send: function (c, d) {
            var e, f = a.xhr(), g = ++Cc;
            if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields)for (e in a.xhrFields)f[e] = a.xhrFields[e];
            a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest");
            for (e in c)f.setRequestHeader(e, c[e]);
            b = function (a) {
                return function () {
                    b && (delete Dc[g], b = f.onload = f.onerror = null, "abort" === a ? f.abort() : "error" === a ? d(f.status, f.statusText) : d(Ec[f.status] || f.status, f.statusText, "string" == typeof f.responseText ? {text: f.responseText} : void 0, f.getAllResponseHeaders()))
                }
            }, f.onload = b(), f.onerror = b("error"), b = Dc[g] = b("abort"), f.send(a.hasContent && a.data || null)
        }, abort: function () {
            b && b()
        }} : void 0
    }), o.ajaxSetup({accepts: {script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"}, contents: {script: /(?:java|ecma)script/}, converters: {"text script": function (a) {
        return o.globalEval(a), a
    }}}), o.ajaxPrefilter("script", function (a) {
        void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET")
    }), o.ajaxTransport("script", function (a) {
        if (a.crossDomain) {
            var b, c;
            return{send: function (d, e) {
                b = o("<script>").prop({async: !0, charset: a.scriptCharset, src: a.url}).on("load error", c = function (a) {
                    b.remove(), c = null, a && e("error" === a.type ? 404 : 200, a.type)
                }), m.head.appendChild(b[0])
            }, abort: function () {
                c && c()
            }}
        }
    });
    var Gc = [], Hc = /(=)\?(?=&|$)|\?\?/;
    o.ajaxSetup({jsonp: "callback", jsonpCallback: function () {
        var a = Gc.pop() || o.expando + "_" + cc++;
        return this[a] = !0, a
    }}), o.ajaxPrefilter("json jsonp", function (b, c, d) {
        var e, f, g, h = b.jsonp !== !1 && (Hc.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && Hc.test(b.data) && "data");
        return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = o.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Hc, "$1" + e) : b.jsonp !== !1 && (b.url += (dc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function () {
            return g || o.error(e + " was not called"), g[0]
        }, b.dataTypes[0] = "json", f = a[e], a[e] = function () {
            g = arguments
        }, d.always(function () {
            a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Gc.push(e)), g && o.isFunction(f) && f(g[0]), g = f = void 0
        }), "script") : void 0
    }), o.parseHTML = function (a, b, c) {
        if (!a || "string" != typeof a)return null;
        "boolean" == typeof b && (c = b, b = !1), b = b || m;
        var d = v.exec(a), e = !c && [];
        return d ? [b.createElement(d[1])] : (d = o.buildFragment([a], b, e), e && e.length && o(e).remove(), o.merge([], d.childNodes))
    };
    var Ic = o.fn.load;
    o.fn.load = function (a, b, c) {
        if ("string" != typeof a && Ic)return Ic.apply(this, arguments);
        var d, e, f, g = this, h = a.indexOf(" ");
        return h >= 0 && (d = a.slice(h), a = a.slice(0, h)), o.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && o.ajax({url: a, type: e, dataType: "html", data: b}).done(function (a) {
            f = arguments, g.html(d ? o("<div>").append(o.parseHTML(a)).find(d) : a)
        }).complete(c && function (a, b) {
            g.each(c, f || [a.responseText, b, a])
        }), this
    }, o.expr.filters.animated = function (a) {
        return o.grep(o.timers, function (b) {
            return a === b.elem
        }).length
    };
    var Jc = a.document.documentElement;

    function Kc(a) {
        return o.isWindow(a) ? a : 9 === a.nodeType && a.defaultView
    }

    o.offset = {setOffset: function (a, b, c) {
        var d, e, f, g, h, i, j, k = o.css(a, "position"), l = o(a), m = {};
        "static" === k && (a.style.position = "relative"), h = l.offset(), f = o.css(a, "top"), i = o.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), o.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using"in b ? b.using.call(a, m) : l.css(m)
    }}, o.fn.extend({offset: function (a) {
        if (arguments.length)return void 0 === a ? this : this.each(function (b) {
            o.offset.setOffset(this, a, b)
        });
        var b, c, d = this[0], e = {top: 0, left: 0}, f = d && d.ownerDocument;
        if (f)return b = f.documentElement, o.contains(b, d) ? (typeof d.getBoundingClientRect !== U && (e = d.getBoundingClientRect()), c = Kc(f), {top: e.top + c.pageYOffset - b.clientTop, left: e.left + c.pageXOffset - b.clientLeft}) : e
    }, position: function () {
        if (this[0]) {
            var a, b, c = this[0], d = {top: 0, left: 0};
            return"fixed" === o.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), o.nodeName(a[0], "html") || (d = a.offset()), d.top += o.css(a[0], "borderTopWidth", !0), d.left += o.css(a[0], "borderLeftWidth", !0)), {top: b.top - d.top - o.css(c, "marginTop", !0), left: b.left - d.left - o.css(c, "marginLeft", !0)}
        }
    }, offsetParent: function () {
        return this.map(function () {
            var a = this.offsetParent || Jc;
            while (a && !o.nodeName(a, "html") && "static" === o.css(a, "position"))a = a.offsetParent;
            return a || Jc
        })
    }}), o.each({scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function (b, c) {
        var d = "pageYOffset" === c;
        o.fn[b] = function (e) {
            return J(this, function (b, e, f) {
                var g = Kc(b);
                return void 0 === f ? g ? g[c] : b[e] : void(g ? g.scrollTo(d ? a.pageXOffset : f, d ? f : a.pageYOffset) : b[e] = f)
            }, b, e, arguments.length, null)
        }
    }), o.each(["top", "left"], function (a, b) {
        o.cssHooks[b] = yb(l.pixelPosition, function (a, c) {
            return c ? (c = xb(a, b), vb.test(c) ? o(a).position()[b] + "px" : c) : void 0
        })
    }), o.each({Height: "height", Width: "width"}, function (a, b) {
        o.each({padding: "inner" + a, content: b, "": "outer" + a}, function (c, d) {
            o.fn[d] = function (d, e) {
                var f = arguments.length && (c || "boolean" != typeof d), g = c || (d === !0 || e === !0 ? "margin" : "border");
                return J(this, function (b, c, d) {
                    var e;
                    return o.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? o.css(b, c, g) : o.style(b, c, d, g)
                }, b, f ? d : void 0, f, null)
            }
        })
    }), o.fn.size = function () {
        return this.length
    }, o.fn.andSelf = o.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function () {
        return o
    });
    var Lc = a.jQuery, Mc = a.$;
    return o.noConflict = function (b) {
        return a.$ === o && (a.$ = Mc), b && a.jQuery === o && (a.jQuery = Lc), o
    }, typeof b === U && (a.jQuery = a.$ = o), o
});

/*
 PNotify 2.0.1 sciactive.com/pnotify/
 (C) 2014 Hunter Perrin
 license GPL/LGPL/MPL
 */
/*
 * ====== PNotify ======
 *
 * http://sciactive.com/pnotify/
 *
 * Copyright 2009-2014 Hunter Perrin
 *
 * Triple licensed under the GPL, LGPL, and MPL.
 * 	http://gnu.org/licenses/gpl.html
 * 	http://gnu.org/licenses/lgpl.html
 * 	http://mozilla.org/MPL/MPL-1.1.html
 */

// Uses AMD or browser globals for jQuery.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as a module.
        define('pnotify', ['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($){
    var default_stack = {
        dir1: "down",
        dir2: "left",
        push: "bottom",
        spacing1: 25,
        spacing2: 25,
        context: $("body")
    };
    var timer, // Position all timer.
        body,
        jwindow = $(window);
    // Set global variables.
    var do_when_ready = function(){
        body = $("body");
        PNotify.prototype.options.stack.context = body;
        jwindow = $(window);
        // Reposition the notices when the window resizes.
        jwindow.bind('resize', function(){
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(function(){ PNotify.positionAll(true) }, 10);
        });
    };
    PNotify = function(options){
        this.parseOptions(options);
        this.init();
    };
    $.extend(PNotify.prototype, {
        // The current version of PNotify.
        version: "2.0.1",

        // === Options ===

        // Options defaults.
        options: {
            // The notice's title.
            title: false,
            // Whether to escape the content of the title. (Not allow HTML.)
            title_escape: false,
            // The notice's text.
            text: false,
            // Whether to escape the content of the text. (Not allow HTML.)
            text_escape: false,
            // What styling classes to use. (Can be either jqueryui or bootstrap.)
            styling: "bootstrap3",
            // Additional classes to be added to the notice. (For custom styling.)
            addclass: "",
            // Class to be added to the notice for corner styling.
            cornerclass: "",
            // Display the notice when it is created.
            auto_display: true,
            // Width of the notice.
            width: "300px",
            // Minimum height of the notice. It will expand to fit content.
            min_height: "16px",
            // Type of the notice. "notice", "info", "success", or "error".
            type: "notice",
            // Set icon to true to use the default icon for the selected
            // style/type, false for no icon, or a string for your own icon class.
            icon: true,
            // Opacity of the notice.
            opacity: 1,
            // The animation to use when displaying and hiding the notice. "none",
            // "show", "fade", and "slide" are built in to jQuery. Others require jQuery
            // UI. Use an object with effect_in and effect_out to use different effects.
            animation: "fade",
            // Speed at which the notice animates in and out. "slow", "def" or "normal",
            // "fast" or number of milliseconds.
            animate_speed: "slow",
            // Specify a specific duration of position animation
            position_animate_speed: 500,
            // Display a drop shadow.
            shadow: true,
            // After a delay, remove the notice.
            hide: true,
            // Delay in milliseconds before the notice is removed.
            delay: 8000,
            // Reset the hide timer if the mouse moves over the notice.
            mouse_reset: true,
            // Remove the notice's elements from the DOM after it is removed.
            remove: true,
            // Change new lines to br tags.
            insert_brs: true,
            // Whether to remove notices from the global array.
            destroy: true,
            // The stack on which the notices will be placed. Also controls the
            // direction the notices stack.
            stack: default_stack
        },

        // === Modules ===

        // This object holds all the PNotify modules. They are used to provide
        // additional functionality.
        modules: {},
        // This runs an event on all the modules.
        runModules: function(event, arg){
            var curArg;
            for (var module in this.modules) {
                curArg = ((typeof arg === "object" && module in arg) ? arg[module] : arg);
                if (typeof this.modules[module][event] === 'function')
                    this.modules[module][event](this, typeof this.options[module] === 'object' ? this.options[module] : {}, curArg);
            }
        },

        // === Class Variables ===

        state: "initializing", // The state can be "initializing", "opening", "open", "closing", and "closed".
        timer: null, // Auto close timer.
        styles: null,
        elem: null,
        container: null,
        title_container: null,
        text_container: null,
        animating: false, // Stores what is currently being animated (in or out).
        timerHide: false, // Stores whether the notice was hidden by a timer.

        // === Events ===

        init: function(){
            var that = this;

            // First and foremost, we don't want our module objects all referencing the prototype.
            this.modules = {};
            $.extend(true, this.modules, PNotify.prototype.modules);

            // Get our styling object.
            if (typeof this.options.styling === "object") {
                this.styles = this.options.styling;
            } else {
                this.styles = PNotify.styling[this.options.styling];
            }

            // Create our widget.
            // Stop animation, reset the removal timer when the user mouses over.
            this.elem = $("<div />", {
                "class": "ui-pnotify "+this.options.addclass,
                "css": {"display": "none"},
                "mouseenter": function(e){
                    if (that.options.mouse_reset && that.animating === "out") {
                        if (!that.timerHide)
                            return;
                        that.cancelRemove();
                    }
                    // Stop the close timer.
                    if (that.options.hide && that.options.mouse_reset) that.cancelRemove();
                },
                "mouseleave": function(e){
                    // Start the close timer.
                    if (that.options.hide && that.options.mouse_reset) that.queueRemove();
                    PNotify.positionAll();
                }
            });
            // Create a container for the notice contents.
            this.container = $("<div />", {"class": this.styles.container+" ui-pnotify-container "+(this.options.type === "error" ? this.styles.error : (this.options.type === "info" ? this.styles.info : (this.options.type === "success" ? this.styles.success : this.styles.notice)))})
                .appendTo(this.elem);
            if (this.options.cornerclass !== "")
                this.container.removeClass("ui-corner-all").addClass(this.options.cornerclass);
            // Create a drop shadow.
            if (this.options.shadow)
                this.container.addClass("ui-pnotify-shadow");


            // Add the appropriate icon.
            if (this.options.icon !== false) {
                $("<div />", {"class": "ui-pnotify-icon"})
                    .append($("<span />", {"class": this.options.icon === true ? (this.options.type === "error" ? this.styles.error_icon : (this.options.type === "info" ? this.styles.info_icon : (this.options.type === "success" ? this.styles.success_icon : this.styles.notice_icon))) : this.options.icon}))
                    .prependTo(this.container);
            }

            // Add a title.
            this.title_container = $("<h4 />", {
                "class": "ui-pnotify-title"
            })
                .appendTo(this.container);
            if (this.options.title === false)
                this.title_container.hide();
            else if (this.options.title_escape)
                this.title_container.text(this.options.title);
            else
                this.title_container.html(this.options.title);

            // Add text.
            this.text_container = $("<div />", {
                "class": "ui-pnotify-text"
            })
                .appendTo(this.container);
            if (this.options.text === false)
                this.text_container.hide();
            else if (this.options.text_escape)
                this.text_container.text(this.options.text);
            else
                this.text_container.html(this.options.insert_brs ? String(this.options.text).replace(/\n/g, "<br />") : this.options.text);

            // Set width and min height.
            if (typeof this.options.width === "string")
                this.elem.css("width", this.options.width);
            if (typeof this.options.min_height === "string")
                this.container.css("min-height", this.options.min_height);


            // Add the notice to the notice array.
            if (this.options.stack.push === "top")
                PNotify.notices = $.merge([this], PNotify.notices);
            else
                PNotify.notices = $.merge(PNotify.notices, [this]);
            // Now position all the notices if they are to push to the top.
            if (this.options.stack.push === "top")
                this.queuePosition(false, 1);




            // Mark the stack so it won't animate the new notice.
            this.options.stack.animation = false;

            // Run the modules.
            this.runModules('init');

            // Display the notice.
            if (this.options.auto_display)
                this.open();
            return this;
        },

        // This function is for updating the notice.
        update: function(options){
            // Save old options.
            var oldOpts = this.options;
            // Then update to the new options.
            this.parseOptions(oldOpts, options);
            // Update the corner class.
            if (this.options.cornerclass !== oldOpts.cornerclass)
                this.container.removeClass("ui-corner-all "+oldOpts.cornerclass).addClass(this.options.cornerclass);
            // Update the shadow.
            if (this.options.shadow !== oldOpts.shadow) {
                if (this.options.shadow)
                    this.container.addClass("ui-pnotify-shadow");
                else
                    this.container.removeClass("ui-pnotify-shadow");
            }
            // Update the additional classes.
            if (this.options.addclass === false)
                this.elem.removeClass(oldOpts.addclass);
            else if (this.options.addclass !== oldOpts.addclass)
                this.elem.removeClass(oldOpts.addclass).addClass(this.options.addclass);
            // Update the title.
            if (this.options.title === false)
                this.title_container.slideUp("fast");
            else if (this.options.title !== oldOpts.title) {
                if (this.options.title_escape)
                    this.title_container.text(this.options.title);
                else
                    this.title_container.html(this.options.title);
                if (oldOpts.title === false)
                    this.title_container.slideDown(200)
            }
            // Update the text.
            if (this.options.text === false) {
                this.text_container.slideUp("fast");
            } else if (this.options.text !== oldOpts.text) {
                if (this.options.text_escape)
                    this.text_container.text(this.options.text);
                else
                    this.text_container.html(this.options.insert_brs ? String(this.options.text).replace(/\n/g, "<br />") : this.options.text);
                if (oldOpts.text === false)
                    this.text_container.slideDown(200)
            }
            // Change the notice type.
            if (this.options.type !== oldOpts.type)
                this.container.removeClass(
                        this.styles.error+" "+this.styles.notice+" "+this.styles.success+" "+this.styles.info
                ).addClass(this.options.type === "error" ?
                        this.styles.error :
                        (this.options.type === "info" ?
                            this.styles.info :
                            (this.options.type === "success" ?
                                this.styles.success :
                                this.styles.notice
                                )
                            )
                );
            if (this.options.icon !== oldOpts.icon || (this.options.icon === true && this.options.type !== oldOpts.type)) {
                // Remove any old icon.
                this.container.find("div.ui-pnotify-icon").remove();
                if (this.options.icon !== false) {
                    // Build the new icon.
                    $("<div />", {"class": "ui-pnotify-icon"})
                        .append($("<span />", {"class": this.options.icon === true ? (this.options.type === "error" ? this.styles.error_icon : (this.options.type === "info" ? this.styles.info_icon : (this.options.type === "success" ? this.styles.success_icon : this.styles.notice_icon))) : this.options.icon}))
                        .prependTo(this.container);
                }
            }
            // Update the width.
            if (this.options.width !== oldOpts.width)
                this.elem.animate({width: this.options.width});
            // Update the minimum height.
            if (this.options.min_height !== oldOpts.min_height)
                this.container.animate({minHeight: this.options.min_height});
            // Update the opacity.
            if (this.options.opacity !== oldOpts.opacity)
                this.elem.fadeTo(this.options.animate_speed, this.options.opacity);
            // Update the timed hiding.
            if (!this.options.hide)
                this.cancelRemove();
            else if (!oldOpts.hide)
                this.queueRemove();
            this.queuePosition(true);

            // Run the modules.
            this.runModules('update', oldOpts);
            return this;
        },

        // Display the notice.
        open: function(){
            this.state = "opening";
            // Run the modules.
            this.runModules('beforeOpen');

            var that = this;
            // If the notice is not in the DOM, append it.
            if (!this.elem.parent().length)
                this.elem.appendTo(this.options.stack.context ? this.options.stack.context : body);
            // Try to put it in the right position.
            if (this.options.stack.push !== "top")
                this.position(true);
            // First show it, then set its opacity, then hide it.
            if (this.options.animation === "fade" || this.options.animation.effect_in === "fade") {
                // If it's fading in, it should start at 0.
                this.elem.show().fadeTo(0, 0).hide();
            } else {
                // Or else it should be set to the opacity.
                if (this.options.opacity !== 1)
                    this.elem.show().fadeTo(0, this.options.opacity).hide();
            }
            this.animateIn(function(){
                that.queuePosition(true);

                // Now set it to hide.
                if (that.options.hide)
                    that.queueRemove();

                that.state = "open";

                // Run the modules.
                that.runModules('afterOpen');
            });

            return this;
        },

        // Remove the notice.
        remove: function(timer_hide) {
            this.state = "closing";
            this.timerHide = !!timer_hide; // Make sure it's a boolean.
            // Run the modules.
            this.runModules('beforeClose');

            var that = this;
            if (this.timer) {
                window.clearTimeout(this.timer);
                this.timer = null;
            }
            this.animateOut(function(){
                that.state = "closed";
                // Run the modules.
                that.runModules('afterClose');
                that.queuePosition(true);
                // If we're supposed to remove the notice from the DOM, do it.
                if (that.options.remove)
                    that.elem.detach();
                // Run the modules.
                that.runModules('beforeDestroy');
                // Remove object from PNotify.notices to prevent memory leak (issue #49)
                // unless destroy is off
                if (that.options.destroy) {
                    if (PNotify.notices !== null) {
                        var idx = $.inArray(that,PNotify.notices);
                        if (idx !== -1) {
                            PNotify.notices.splice(idx,1);
                        }
                    }
                }
                // Run the modules.
                that.runModules('afterDestroy');
            });

            return this;
        },

        // === Class Methods ===

        // Get the DOM element.
        get: function(){ return this.elem; },

        // Put all the options in the right places.
        parseOptions: function(options, moreOptions){
            this.options = $.extend(true, {}, PNotify.prototype.options);
            // This is the only thing that *should* be copied by reference.
            this.options.stack = PNotify.prototype.options.stack;
            var optArray = [options, moreOptions], curOpts;
            for (var curIndex in optArray) {
                curOpts = optArray[curIndex];
                if (typeof curOpts == "undefined")
                    break;
                if (typeof curOpts !== 'object') {
                    this.options.text = curOpts;
                } else {
                    for (var option in curOpts) {
                        if (this.modules[option]) {
                            // Avoid overwriting module defaults.
                            $.extend(true, this.options[option], curOpts[option]);
                        } else {
                            this.options[option] = curOpts[option];
                        }
                    }
                }
            }
        },

        // Animate the notice in.
        animateIn: function(callback){
            // Declare that the notice is animating in. (Or has completed animating in.)
            this.animating = "in";
            var animation;
            if (typeof this.options.animation.effect_in !== "undefined")
                animation = this.options.animation.effect_in;
            else
                animation = this.options.animation;
            if (animation === "none") {
                this.elem.show();
                callback();
            } else if (animation === "show")
                this.elem.show(this.options.animate_speed, callback);
            else if (animation === "fade")
                this.elem.show().fadeTo(this.options.animate_speed, this.options.opacity, callback);
            else if (animation === "slide")
                this.elem.slideDown(this.options.animate_speed, callback);
            else if (typeof animation === "function")
                animation("in", callback, this.elem);
            else
                this.elem.show(animation, (typeof this.options.animation.options_in === "object" ? this.options.animation.options_in : {}), this.options.animate_speed, callback);
            if (this.elem.parent().hasClass('ui-effects-wrapper'))
                this.elem.parent().css({"position": "fixed", "overflow": "visible"});
            if (animation !== "slide")
                this.elem.css("overflow", "visible");
            this.container.css("overflow", "hidden");
        },

        // Animate the notice out.
        animateOut: function(callback){
            // Declare that the notice is animating out. (Or has completed animating out.)
            this.animating = "out";
            var animation;
            if (typeof this.options.animation.effect_out !== "undefined")
                animation = this.options.animation.effect_out;
            else
                animation = this.options.animation;
            if (animation === "none") {
                this.elem.hide();
                callback();
            } else if (animation === "show")
                this.elem.hide(this.options.animate_speed, callback);
            else if (animation === "fade")
                this.elem.fadeOut(this.options.animate_speed, callback);
            else if (animation === "slide")
                this.elem.slideUp(this.options.animate_speed, callback);
            else if (typeof animation === "function")
                animation("out", callback, this.elem);
            else
                this.elem.hide(animation, (typeof this.options.animation.options_out === "object" ? this.options.animation.options_out : {}), this.options.animate_speed, callback);
            if (this.elem.parent().hasClass('ui-effects-wrapper'))
                this.elem.parent().css({"position": "fixed", "overflow": "visible"});
            if (animation !== "slide")
                this.elem.css("overflow", "visible");
            this.container.css("overflow", "hidden");
        },

        // Position the notice. dont_skip_hidden causes the notice to
        // position even if it's not visible.
        position: function(dontSkipHidden){
            // Get the notice's stack.
            var s = this.options.stack,
                e = this.elem;
            if (e.parent().hasClass('ui-effects-wrapper'))
                e = this.elem.css({"left": "0", "top": "0", "right": "0", "bottom": "0"}).parent();
            if (typeof s.context === "undefined")
                s.context = body;
            if (!s) return;
            if (typeof s.nextpos1 !== "number")
                s.nextpos1 = s.firstpos1;
            if (typeof s.nextpos2 !== "number")
                s.nextpos2 = s.firstpos2;
            if (typeof s.addpos2 !== "number")
                s.addpos2 = 0;
            var hidden = e.css("display") === "none";
            // Skip this notice if it's not shown.
            if (!hidden || dontSkipHidden) {
                var curpos1, curpos2;
                // Store what will need to be animated.
                var animate = {};
                // Calculate the current pos1 value.
                var csspos1;
                switch (s.dir1) {
                    case "down":
                        csspos1 = "top";
                        break;
                    case "up":
                        csspos1 = "bottom";
                        break;
                    case "left":
                        csspos1 = "right";
                        break;
                    case "right":
                        csspos1 = "left";
                        break;
                }
                curpos1 = parseInt(e.css(csspos1).replace(/(?:\..*|[^0-9.])/g, ''));
                if (isNaN(curpos1))
                    curpos1 = 0;
                // Remember the first pos1, so the first visible notice goes there.
                if (typeof s.firstpos1 === "undefined" && !hidden) {
                    s.firstpos1 = curpos1;
                    s.nextpos1 = s.firstpos1;
                }
                // Calculate the current pos2 value.
                var csspos2;
                switch (s.dir2) {
                    case "down":
                        csspos2 = "top";
                        break;
                    case "up":
                        csspos2 = "bottom";
                        break;
                    case "left":
                        csspos2 = "right";
                        break;
                    case "right":
                        csspos2 = "left";
                        break;
                }
                curpos2 = parseInt(e.css(csspos2).replace(/(?:\..*|[^0-9.])/g, ''));
                if (isNaN(curpos2))
                    curpos2 = 0;
                // Remember the first pos2, so the first visible notice goes there.
                if (typeof s.firstpos2 === "undefined" && !hidden) {
                    s.firstpos2 = curpos2;
                    s.nextpos2 = s.firstpos2;
                }
                // Check that it's not beyond the viewport edge.
                if ((s.dir1 === "down" && s.nextpos1 + e.height() > (s.context.is(body) ? jwindow.height() : s.context.prop('scrollHeight')) ) ||
                    (s.dir1 === "up" && s.nextpos1 + e.height() > (s.context.is(body) ? jwindow.height() : s.context.prop('scrollHeight')) ) ||
                    (s.dir1 === "left" && s.nextpos1 + e.width() > (s.context.is(body) ? jwindow.width() : s.context.prop('scrollWidth')) ) ||
                    (s.dir1 === "right" && s.nextpos1 + e.width() > (s.context.is(body) ? jwindow.width() : s.context.prop('scrollWidth')) ) ) {
                    // If it is, it needs to go back to the first pos1, and over on pos2.
                    s.nextpos1 = s.firstpos1;
                    s.nextpos2 += s.addpos2 + (typeof s.spacing2 === "undefined" ? 25 : s.spacing2);
                    s.addpos2 = 0;
                }
                // Animate if we're moving on dir2.
                if (s.animation && s.nextpos2 < curpos2) {
                    switch (s.dir2) {
                        case "down":
                            animate.top = s.nextpos2+"px";
                            break;
                        case "up":
                            animate.bottom = s.nextpos2+"px";
                            break;
                        case "left":
                            animate.right = s.nextpos2+"px";
                            break;
                        case "right":
                            animate.left = s.nextpos2+"px";
                            break;
                    }
                } else {
                    if(typeof s.nextpos2 === "number")
                        e.css(csspos2, s.nextpos2+"px");
                }
                // Keep track of the widest/tallest notice in the column/row, so we can push the next column/row.
                switch (s.dir2) {
                    case "down":
                    case "up":
                        if (e.outerHeight(true) > s.addpos2)
                            s.addpos2 = e.height();
                        break;
                    case "left":
                    case "right":
                        if (e.outerWidth(true) > s.addpos2)
                            s.addpos2 = e.width();
                        break;
                }
                // Move the notice on dir1.
                if (typeof s.nextpos1 === "number") {
                    // Animate if we're moving toward the first pos.
                    if (s.animation && (curpos1 > s.nextpos1 || animate.top || animate.bottom || animate.right || animate.left)) {
                        switch (s.dir1) {
                            case "down":
                                animate.top = s.nextpos1+"px";
                                break;
                            case "up":
                                animate.bottom = s.nextpos1+"px";
                                break;
                            case "left":
                                animate.right = s.nextpos1+"px";
                                break;
                            case "right":
                                animate.left = s.nextpos1+"px";
                                break;
                        }
                    } else
                        e.css(csspos1, s.nextpos1+"px");
                }
                // Run the animation.
                if (animate.top || animate.bottom || animate.right || animate.left)
                    e.animate(animate, {duration: this.options.position_animate_speed, queue: false});
                // Calculate the next dir1 position.
                switch (s.dir1) {
                    case "down":
                    case "up":
                        s.nextpos1 += e.height() + (typeof s.spacing1 === "undefined" ? 25 : s.spacing1);
                        break;
                    case "left":
                    case "right":
                        s.nextpos1 += e.width() + (typeof s.spacing1 === "undefined" ? 25 : s.spacing1);
                        break;
                }
            }
            return this;
        },
        // Queue the position all function so it doesn't run repeatedly and
        // use up resources.
        queuePosition: function(animate, milliseconds){
            if (timer)
                clearTimeout(timer);
            if (!milliseconds)
                milliseconds = 10;
            timer = setTimeout(function(){ PNotify.positionAll(animate) }, milliseconds);
            return this;
        },


        // Cancel any pending removal timer.
        cancelRemove: function(){
            if (this.timer)
                window.clearTimeout(this.timer);
            if (this.state === "closing") {
                // If it's animating out, animate back in really quickly.
                this.elem.stop(true);
                this.state = "open";
                this.animating = "in";
                this.elem.css("height", "auto").animate({"width": this.options.width, "opacity": this.options.opacity}, "fast");
            }
            return this;
        },
        // Queue a removal timer.
        queueRemove: function(){
            var that = this;
            // Cancel any current removal timer.
            this.cancelRemove();
            this.timer = window.setTimeout(function(){
                that.remove(true);
            }, (isNaN(this.options.delay) ? 0 : this.options.delay));
            return this;
        }
    });
    // These functions affect all notices.
    $.extend(PNotify, {
        // This holds all the notices.
        notices: [],
        removeAll: function () {
            $.each(PNotify.notices, function(){
                if (this.remove)
                    this.remove();
            });
        },
        positionAll: function (animate) {
            // This timer is used for queueing this function so it doesn't run
            // repeatedly.
            if (timer)
                clearTimeout(timer);
            timer = null;
            // Reset the next position data.
            $.each(PNotify.notices, function(){
                var s = this.options.stack;
                if (!s) return;
                s.nextpos1 = s.firstpos1;
                s.nextpos2 = s.firstpos2;
                s.addpos2 = 0;
                s.animation = animate;
            });
            $.each(PNotify.notices, function(){
                this.position();
            });
        },
        styling: {
            jqueryui: {
                container: "ui-widget ui-widget-content ui-corner-all",
                notice: "ui-state-highlight",
                // (The actual jQUI notice icon looks terrible.)
                notice_icon: "ui-icon ui-icon-info",
                info: "",
                info_icon: "ui-icon ui-icon-info",
                success: "ui-state-default",
                success_icon: "ui-icon ui-icon-circle-check",
                error: "ui-state-error",
                error_icon: "ui-icon ui-icon-alert"
            },
            bootstrap2: {
                container: "alert",
                notice: "",
                notice_icon: "icon-exclamation-sign",
                info: "alert-info",
                info_icon: "icon-info-sign",
                success: "alert-success",
                success_icon: "icon-ok-sign",
                error: "alert-error",
                error_icon: "icon-warning-sign"
            },
            bootstrap3: {
                container: "alert",
                notice: "alert-warning",
                notice_icon: "glyphicon glyphicon-exclamation-sign",
                info: "alert-info",
                info_icon: "glyphicon glyphicon-info-sign",
                success: "alert-success",
                success_icon: "glyphicon glyphicon-ok-sign",
                error: "alert-danger",
                error_icon: "glyphicon glyphicon-warning-sign"
            }
        }
    });
    /*
     * uses icons from http://fontawesome.io/
     * version 4.0.3
     */
    PNotify.styling.fontawesome = $.extend({}, PNotify.styling.bootstrap3);
    $.extend(PNotify.styling.fontawesome, {
        notice_icon: "fa fa-exclamation-circle",
        info_icon: "fa fa-info",
        success_icon: "fa fa-check",
        error_icon: "fa fa-warning"
    });

    if (document.body)
        do_when_ready();
    else
        $(do_when_ready);
    return PNotify;
}));

// Nonblock
// Uses AMD or browser globals for jQuery.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as a module.
        define('pnotify.nonblock', ['jquery', 'pnotify'], factory);
    } else {
        // Browser globals
        factory(jQuery, PNotify);
    }
}(function($, PNotify){
    // Some useful regexes.
    var re_on = /^on/,
        re_mouse_events = /^(dbl)?click$|^mouse(move|down|up|over|out|enter|leave)$|^contextmenu$/,
        re_ui_events = /^(focus|blur|select|change|reset)$|^key(press|down|up)$/,
        re_html_events = /^(scroll|resize|(un)?load|abort|error)$/;
    // Fire a DOM event.
    var dom_event = function(e, orig_e){
        var event_object;
        e = e.toLowerCase();
        if (document.createEvent && this.dispatchEvent) {
            // FireFox, Opera, Safari, Chrome
            e = e.replace(re_on, '');
            if (e.match(re_mouse_events)) {
                // This allows the click event to fire on the notice. There is
                // probably a much better way to do it.
                $(this).offset();
                event_object = document.createEvent("MouseEvents");
                event_object.initMouseEvent(
                    e, orig_e.bubbles, orig_e.cancelable, orig_e.view, orig_e.detail,
                    orig_e.screenX, orig_e.screenY, orig_e.clientX, orig_e.clientY,
                    orig_e.ctrlKey, orig_e.altKey, orig_e.shiftKey, orig_e.metaKey, orig_e.button, orig_e.relatedTarget
                );
            } else if (e.match(re_ui_events)) {
                event_object = document.createEvent("UIEvents");
                event_object.initUIEvent(e, orig_e.bubbles, orig_e.cancelable, orig_e.view, orig_e.detail);
            } else if (e.match(re_html_events)) {
                event_object = document.createEvent("HTMLEvents");
                event_object.initEvent(e, orig_e.bubbles, orig_e.cancelable);
            }
            if (!event_object) return;
            this.dispatchEvent(event_object);
        } else {
            // Internet Explorer
            if (!e.match(re_on)) e = "on"+e;
            event_object = document.createEventObject(orig_e);
            this.fireEvent(e, event_object);
        }
    };


    // This keeps track of the last element the mouse was over, so
    // mouseleave, mouseenter, etc can be called.
    var nonblock_last_elem;
    // This is used to pass events through the notice if it is non-blocking.
    var nonblock_pass = function(notice, e, e_name){
        notice.elem.css("display", "none");
        var element_below = document.elementFromPoint(e.clientX, e.clientY);
        notice.elem.css("display", "block");
        var jelement_below = $(element_below);
        var cursor_style = jelement_below.css("cursor");
        notice.elem.css("cursor", cursor_style !== "auto" ? cursor_style : "default");
        // If the element changed, call mouseenter, mouseleave, etc.
        if (!nonblock_last_elem || nonblock_last_elem.get(0) != element_below) {
            if (nonblock_last_elem) {
                dom_event.call(nonblock_last_elem.get(0), "mouseleave", e.originalEvent);
                dom_event.call(nonblock_last_elem.get(0), "mouseout", e.originalEvent);
            }
            dom_event.call(element_below, "mouseenter", e.originalEvent);
            dom_event.call(element_below, "mouseover", e.originalEvent);
        }
        dom_event.call(element_below, e_name, e.originalEvent);
        // Remember the latest element the mouse was over.
        nonblock_last_elem = jelement_below;
    };


    PNotify.prototype.options.nonblock = {
        // Create a non-blocking notice. It lets the user click elements underneath it.
        nonblock: false,
        // The opacity of the notice (if it's non-blocking) when the mouse is over it.
        nonblock_opacity: .2
    };
    PNotify.prototype.modules.nonblock = {
        // This lets us update the options available in the closures.
        myOptions: null,

        init: function(notice, options){
            var that = this;
            this.myOptions = options;
            notice.elem.on({
                "mouseenter": function(e){
                    if (that.myOptions.nonblock) e.stopPropagation();
                    if (that.myOptions.nonblock) {
                        // If it's non-blocking, animate to the other opacity.
                        notice.elem.stop().animate({"opacity": that.myOptions.nonblock_opacity}, "fast");
                    }
                },
                "mouseleave": function(e){
                    if (that.myOptions.nonblock) e.stopPropagation();
                    nonblock_last_elem = null;
                    notice.elem.css("cursor", "auto");
                    // Animate back to the normal opacity.
                    if (that.myOptions.nonblock && notice.animating !== "out")
                        notice.elem.stop().animate({"opacity": notice.options.opacity}, "fast");
                },
                "mouseover": function(e){
                    if (that.myOptions.nonblock) e.stopPropagation();
                },
                "mouseout": function(e){
                    if (that.myOptions.nonblock) e.stopPropagation();
                },
                "mousemove": function(e){
                    if (that.myOptions.nonblock) {
                        e.stopPropagation();
                        nonblock_pass(notice, e, "onmousemove");
                    }
                },
                "mousedown": function(e){
                    if (that.myOptions.nonblock) {
                        e.stopPropagation();
                        e.preventDefault();
                        nonblock_pass(notice, e, "onmousedown");
                    }
                },
                "mouseup": function(e){
                    if (that.myOptions.nonblock) {
                        e.stopPropagation();
                        e.preventDefault();
                        nonblock_pass(notice, e, "onmouseup");
                    }
                },
                "click": function(e){
                    if (that.myOptions.nonblock) {
                        e.stopPropagation();
                        nonblock_pass(notice, e, "onclick");
                    }
                },
                "dblclick": function(e){
                    if (that.myOptions.nonblock) {
                        e.stopPropagation();
                        nonblock_pass(notice, e, "ondblclick");
                    }
                }
            });
        },
        update: function(notice, options){
            this.myOptions = options;
        }
    };
}));

/*global define */

define('catalog/controller/Fx-catalog-page',['nprogress', 'pnotify', 'pnotify.nonblock'], function (NProgress, PNotify) {

    function PageController() {
    }

    //(injected)
    PageController.prototype.filter = undefined;

    //(injected)
    PageController.prototype.bridge = undefined;

    //(injected)
    PageController.prototype.results = undefined;

    PageController.prototype.renderComponents = function () {
        var self = this;

        self.filter.render();
        self.results.render();
    };

    PageController.prototype.initEventListeners = function () {

        var self = this;

        document.body.addEventListener("submit.catalog.fx", function () {
            NProgress.start();
            self.bridge.query(self.filter, self.results.addItems, self.results);
            //self.filter.collapseFilter();
        }, false);

        document.body.addEventListener("end.query.catalog.fx", function () {
            NProgress.done();
        }, false);


        document.body.addEventListener("empty_response.query.catalog.fx", function () {

            self.results.clear();

            new PNotify({
                title: 'No Result Notice',
                text: 'The request has no results',
                type: 'error',
                nonblock: {
                    nonblock: true
                }
            });
        }, false);

        //$(".fx-catalog-header-btn-close").on('click', self.filter.openFilter)

    };

    PageController.prototype.preValidation = function () {
        var self = this;

        if (!self.filter) {
            throw new Error("PAGE CONTROLLER: INVALID FILTER ITEM.")
        }
    };

    PageController.prototype.render = function () {
        var self = this;

        self.preValidation();
        self.initEventListeners();

        self.renderComponents();
    };

    return PageController;

});

/**
 * @license RequireJS text 2.0.10 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
 define, window, process, Packages,
 java, location, Components, FileUtils */

define('text',['module'], function (module) {
    

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.10',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {
                    }

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                    name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                    text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                        parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                        "define(function () { return '" +
                        content +
                        "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
            //Use a '.js' file name so that it indicates it is a
            //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
        typeof process !== "undefined" &&
        process.versions && !!process.versions.node && !process.versions['node-webkit'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                errback(e);
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
        text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
        typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
        typeof Components !== 'undefined' && Components.classes &&
        Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes,
            Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                    .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                    .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                    Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!json/fx-catalog-filter-mapping.json',[],function () { return '{\n    "resourceType": {\n        "path" : "filter.types"\n    },\n    "uid": {\n        "path" : "filter.metadata.uid"\n    },\n    "region": {\n        "path" : "filter.metadata.region"\n    },\n    "referencePeriod": {\n        "path" : "filter.metadata.referencePeriod",\n        "conversion" : {\n            "min" : "from",\n            "max" : "to"\n        }\n    },\n    "basePeriod": {\n        "path" : "filter.metadata.basePeriod" ,\n        "conversion" : {\n            "min" : "from",\n            "max" : "to"\n        }\n    },\n    "unitOfMeasure": {\n        "path" : "filter.metadata.unitOfMeasure"\n    },\n    "indicator": {\n        "path" : "filter.data.INDICATOR"\n    },\n    "item": {\n        "path" : "filter.data.ITEM"\n    },\n    "updatePeriodicity": {\n        "path" : "filter.metadata.updatePeriodicity"\n    },\n    "source": {\n        "path" : "filter.metadata.source"\n    },\n    "owner": {\n        "path" : "filter.metadata.owner"\n    },\n    "provider": {\n        "path" : "filter.metadata.provider"\n    }\n}';});


define('text!json/fx-catalog-blank-filter.json',[],function () { return '{ "filter": {\n    "types": [],\n    "metadata": { },\n    "data": { }\n},\n    "business": []\n}';});

define('plugins/Fx-catalog-brigde-filter-plugin',[
    "jquery",
    "text!json/fx-catalog-filter-mapping.json",
    "text!json/fx-catalog-blank-filter.json"
], function ($, map, blank) {

    var o = { };

    function FilterPlugin(options) {
        $.extend(o, options);

    }

    FilterPlugin.prototype.preValidation = function () {

        if (!o.component) {
            throw new Error("FILTER PLUGIN: no valid filter component during inti()");
        }

    };

    FilterPlugin.prototype.init = function (options) {
        var self = this;
        //Merge options
        $.extend(o, options);

        self.preValidation();

    };

    FilterPlugin.prototype.getFilter = function () {

        var self = this;

        try {
            return self.createJsonFilter(o.component.getValues(true))
        }
        catch (e) {
            throw new Error(e);
        }

    };

    FilterPlugin.prototype.createJsonFilter = function (values) {

        var request = JSON.parse(blank),
            keys = Object.keys(values),
            mapping = JSON.parse(map),
            position = request;

        for (var i = 0; i < keys.length; i++) {
            if (values.hasOwnProperty(keys[i])) {
                if (mapping.hasOwnProperty(keys[i])){

                    if (mapping[keys[i]].conversion) { values[keys[i]] = this.convertValue(values[keys[i]], mapping[keys[i]].conversion); };

                    var path = mapping[keys[i]].path.split(".");

                    for (var j = 0; j < path.length - 1; j++) { position = position[path[j]]; }

                    position[path[ path.length - 1 ]] = values[keys[i]];
                    position = request;
                }
            }
        }

        return request;
    };

    FilterPlugin.prototype.convertValue = function(values, rules ){

        var rulesKeys = Object.keys(rules);

        for (var j=0; j < values.length; j ++){

            for (var i = 0; i < rulesKeys.length; i++){
                if (rules.hasOwnProperty(rulesKeys[i])){
                    if (values[j].hasOwnProperty(rulesKeys[i])){
                        values[j][rules[rulesKeys[i]]] =  values[j][rulesKeys[i]];
                        delete values[j][rulesKeys[i]];
                    }
                }
            }
        }

        return values;

    };

    return FilterPlugin;

});

/*global define */

define('widgets/Fx-widgets-commons',[], function () {

    var o = {
        sessionStorage: {
            interface: {
                lang: "fenix.interface.lang"
            }
        }
    }

    function Fx_Commons() {
    }

    //Dispatch an event for Chrome, Firefox e IE
    Fx_Commons.prototype.raiseCustomEvent = function (item, type, data) {

        var self = this;

        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(type, true, true, data);
        if (self.isNode(item)) {
            item.dispatchEvent(evt);
        }

    };

    //Returns true if it is a DOM node
    Fx_Commons.prototype.isNode = function (o) {
        return ( typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string" );
    };

    //Returns true if it is a DOM element
    Fx_Commons.prototype.isElement = function (o) {
        return ( typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string" );
    };

    //Raise an error
    Fx_Commons.prototype.handleError = function (c, err) {

        if (err.hasOwnProperty(c)) {
            throw new Error({ code: c, error: err[c] });
        }

    };

    //Getter and Setter for session cache
    Fx_Commons.prototype.getCacheItem = function (key) {

        return sessionStorage.getItem(key);
        ;

    };

    Fx_Commons.prototype.setCacheItem = function (key, value) {

        var self = this;
        sessionStorage.setItem(key, value);
        return self.getLang();

    };

    //Getter and Setter for lang setting within interface
    Fx_Commons.prototype.getLang = function () {

        var self = this;

        return self.getCacheItem(o.sessionStorage.interface.lang) ?
            self.getCacheItem(o.sessionStorage.interface.lang).toUpperCase() : null;

    };

    Fx_Commons.prototype.setLang = function (lang) {

        var self = this;
        self.setCacheItem(o.sessionStorage.interface.lang, lang.toUpperCase());
        return self.getLang();

    };

    //Load a CSS file dynamically
    Fx_Commons.prototype.loadCss = function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    Fx_Commons.prototype.getFenixUniqueId = function () {
        window.fx_dynamic_id_counter > -1 ? window.fx_dynamic_id_counter++ : window.fx_dynamic_id_counter = 0;
        return window.fx_dynamic_id_counter;
    }

    return Fx_Commons;

});

/*global define */

define('controller/Fx-catalog-filter',[
    "plugins/Fx-catalog-brigde-filter-plugin",
    "widgets/Fx-widgets-commons"
], function (Plugin, W_Commons) {

    var w_Commons,
        o = {
            name : 'fx-catalog-filter',
            events: {
                SELECT : "fx.catalog.module.select",
                REMOVE: "fx.catalog.module.remove"
            }
        };

    function FilterController() {

        this.publishFxCatalogBridgePlugin();

        w_Commons = new W_Commons();

    }

    //(injected)
    FilterController.prototype.menu = undefined;

    //(injected)
    FilterController.prototype.form = undefined;

    //(injected)
    FilterController.prototype.resume = undefined;

    //(injected)
    FilterController.prototype.submit = undefined;

    FilterController.prototype.initSubmit = function () {
        var self = this;

        $(this.submit).on("click", function () {
            w_Commons.raiseCustomEvent(self.submit, "submit.catalog.fx", {});
        });
    };

    FilterController.prototype.renderComponents = function () {

        this.menu.render();
        this.form.render();
        this.resume.render();
    };

    FilterController.prototype.initEventListeners = function () {

        var self = this;

        document.body.addEventListener(o.events.SELECT, function (e) {
            self.form.addItem(e.detail);
        }, false);

        document.body.addEventListener(o.events.REMOVE, function (e) {
            self.menu.activate(e.detail.type);
            self.form.removeItem(e.detail.module);
        }, false);
    };

    FilterController.prototype.preValidation = function () {
        var self = this;

        if (!self.menu) {
            throw new Error("FilterController: INVALID MENU ITEM.")
        }
        if (!self.form) {
            throw new Error("FilterController: INVALID FORM ITEM.")
        }
        if (!self.submit) {
            throw new Error("FilterController: INVALID SUBMIT ITEM.")
        }
        if (!w_Commons.isNode(self.submit)) {
            throw new Error("FilterController: SUBMIT NOT DOM NODE.")
        }

    };

    FilterController.prototype.render = function () {

        this.preValidation();
        this.initEventListeners();
        this.initSubmit();

        this.renderComponents();

    };

    FilterController.prototype.publishFxCatalogBridgePlugin = function () {

        //FENIX Catalog Plugin Registration
        if (!window.Fx_catalog_bridge_plugins) {
            window.Fx_catalog_bridge_plugins = {};
        }
        window.Fx_catalog_bridge_plugins[o.name] = new Plugin();

    };

    FilterController.prototype.getValues = function (boolean) {
        return this.form.getValues(boolean);
    };

    FilterController.prototype.getName = function () {
        return o.name;
    };

    FilterController.prototype.collapseFilter = function () {

        console.log( $(".fx-catalog-modular-filter-container").height());

        $(".fx-catalog-modular-filter-container").animate( {
            height :  0
        }, 500);
    };

    FilterController.prototype.openFilter = function () {

        $(".fx-catalog-modular-filter-container").slideToggle("slow");
    };

    return FilterController;

});

/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if ("undefined" == typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");
+function (a) {
    
    function b() {
        var a = document.createElement("bootstrap"), b = {WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd otransitionend", transition: "transitionend"};
        for (var c in b)if (void 0 !== a.style[c])return{end: b[c]};
        return!1
    }

    a.fn.emulateTransitionEnd = function (b) {
        var c = !1, d = this;
        a(this).one(a.support.transition.end, function () {
            c = !0
        });
        var e = function () {
            c || a(d).trigger(a.support.transition.end)
        };
        return setTimeout(e, b), this
    }, a(function () {
        a.support.transition = b()
    })
}(jQuery), +function (a) {
    
    var b = '[data-dismiss="alert"]', c = function (c) {
        a(c).on("click", b, this.close)
    };
    c.prototype.close = function (b) {
        function c() {
            f.trigger("closed.bs.alert").remove()
        }

        var d = a(this), e = d.attr("data-target");
        e || (e = d.attr("href"), e = e && e.replace(/.*(?=#[^\s]*$)/, ""));
        var f = a(e);
        b && b.preventDefault(), f.length || (f = d.hasClass("alert") ? d : d.parent()), f.trigger(b = a.Event("close.bs.alert")), b.isDefaultPrevented() || (f.removeClass("in"), a.support.transition && f.hasClass("fade") ? f.one(a.support.transition.end, c).emulateTransitionEnd(150) : c())
    };
    var d = a.fn.alert;
    a.fn.alert = function (b) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.alert");
            e || d.data("bs.alert", e = new c(this)), "string" == typeof b && e[b].call(d)
        })
    }, a.fn.alert.Constructor = c, a.fn.alert.noConflict = function () {
        return a.fn.alert = d, this
    }, a(document).on("click.bs.alert.data-api", b, c.prototype.close)
}(jQuery), +function (a) {
    
    var b = function (c, d) {
        this.$element = a(c), this.options = a.extend({}, b.DEFAULTS, d), this.isLoading = !1
    };
    b.DEFAULTS = {loadingText: "loading..."}, b.prototype.setState = function (b) {
        var c = "disabled", d = this.$element, e = d.is("input") ? "val" : "html", f = d.data();
        b += "Text", f.resetText || d.data("resetText", d[e]()), d[e](f[b] || this.options[b]), setTimeout(a.proxy(function () {
            "loadingText" == b ? (this.isLoading = !0, d.addClass(c).attr(c, c)) : this.isLoading && (this.isLoading = !1, d.removeClass(c).removeAttr(c))
        }, this), 0)
    }, b.prototype.toggle = function () {
        var a = !0, b = this.$element.closest('[data-toggle="buttons"]');
        if (b.length) {
            var c = this.$element.find("input");
            "radio" == c.prop("type") && (c.prop("checked") && this.$element.hasClass("active") ? a = !1 : b.find(".active").removeClass("active")), a && c.prop("checked", !this.$element.hasClass("active")).trigger("change")
        }
        a && this.$element.toggleClass("active")
    };
    var c = a.fn.button;
    a.fn.button = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.button"), f = "object" == typeof c && c;
            e || d.data("bs.button", e = new b(this, f)), "toggle" == c ? e.toggle() : c && e.setState(c)
        })
    }, a.fn.button.Constructor = b, a.fn.button.noConflict = function () {
        return a.fn.button = c, this
    }, a(document).on("click.bs.button.data-api", "[data-toggle^=button]", function (b) {
        var c = a(b.target);
        c.hasClass("btn") || (c = c.closest(".btn")), c.button("toggle"), b.preventDefault()
    })
}(jQuery), +function (a) {
    
    var b = function (b, c) {
        this.$element = a(b), this.$indicators = this.$element.find(".carousel-indicators"), this.options = c, this.paused = this.sliding = this.interval = this.$active = this.$items = null, "hover" == this.options.pause && this.$element.on("mouseenter", a.proxy(this.pause, this)).on("mouseleave", a.proxy(this.cycle, this))
    };
    b.DEFAULTS = {interval: 5e3, pause: "hover", wrap: !0}, b.prototype.cycle = function (b) {
        return b || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(a.proxy(this.next, this), this.options.interval)), this
    }, b.prototype.getActiveIndex = function () {
        return this.$active = this.$element.find(".item.active"), this.$items = this.$active.parent().children(), this.$items.index(this.$active)
    }, b.prototype.to = function (b) {
        var c = this, d = this.getActiveIndex();
        return b > this.$items.length - 1 || 0 > b ? void 0 : this.sliding ? this.$element.one("slid.bs.carousel", function () {
            c.to(b)
        }) : d == b ? this.pause().cycle() : this.slide(b > d ? "next" : "prev", a(this.$items[b]))
    }, b.prototype.pause = function (b) {
        return b || (this.paused = !0), this.$element.find(".next, .prev").length && a.support.transition && (this.$element.trigger(a.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this
    }, b.prototype.next = function () {
        return this.sliding ? void 0 : this.slide("next")
    }, b.prototype.prev = function () {
        return this.sliding ? void 0 : this.slide("prev")
    }, b.prototype.slide = function (b, c) {
        var d = this.$element.find(".item.active"), e = c || d[b](), f = this.interval, g = "next" == b ? "left" : "right", h = "next" == b ? "first" : "last", i = this;
        if (!e.length) {
            if (!this.options.wrap)return;
            e = this.$element.find(".item")[h]()
        }
        if (e.hasClass("active"))return this.sliding = !1;
        var j = a.Event("slide.bs.carousel", {relatedTarget: e[0], direction: g});
        return this.$element.trigger(j), j.isDefaultPrevented() ? void 0 : (this.sliding = !0, f && this.pause(), this.$indicators.length && (this.$indicators.find(".active").removeClass("active"), this.$element.one("slid.bs.carousel", function () {
            var b = a(i.$indicators.children()[i.getActiveIndex()]);
            b && b.addClass("active")
        })), a.support.transition && this.$element.hasClass("slide") ? (e.addClass(b), e[0].offsetWidth, d.addClass(g), e.addClass(g), d.one(a.support.transition.end, function () {
            e.removeClass([b, g].join(" ")).addClass("active"), d.removeClass(["active", g].join(" ")), i.sliding = !1, setTimeout(function () {
                i.$element.trigger("slid.bs.carousel")
            }, 0)
        }).emulateTransitionEnd(1e3 * d.css("transition-duration").slice(0, -1))) : (d.removeClass("active"), e.addClass("active"), this.sliding = !1, this.$element.trigger("slid.bs.carousel")), f && this.cycle(), this)
    };
    var c = a.fn.carousel;
    a.fn.carousel = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.carousel"), f = a.extend({}, b.DEFAULTS, d.data(), "object" == typeof c && c), g = "string" == typeof c ? c : f.slide;
            e || d.data("bs.carousel", e = new b(this, f)), "number" == typeof c ? e.to(c) : g ? e[g]() : f.interval && e.pause().cycle()
        })
    }, a.fn.carousel.Constructor = b, a.fn.carousel.noConflict = function () {
        return a.fn.carousel = c, this
    }, a(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function (b) {
        var c, d = a(this), e = a(d.attr("data-target") || (c = d.attr("href")) && c.replace(/.*(?=#[^\s]+$)/, "")), f = a.extend({}, e.data(), d.data()), g = d.attr("data-slide-to");
        g && (f.interval = !1), e.carousel(f), (g = d.attr("data-slide-to")) && e.data("bs.carousel").to(g), b.preventDefault()
    }), a(window).on("load", function () {
        a('[data-ride="carousel"]').each(function () {
            var b = a(this);
            b.carousel(b.data())
        })
    })
}(jQuery), +function (a) {
    
    var b = function (c, d) {
        this.$element = a(c), this.options = a.extend({}, b.DEFAULTS, d), this.transitioning = null, this.options.parent && (this.$parent = a(this.options.parent)), this.options.toggle && this.toggle()
    };
    b.DEFAULTS = {toggle: !0}, b.prototype.dimension = function () {
        var a = this.$element.hasClass("width");
        return a ? "width" : "height"
    }, b.prototype.show = function () {
        if (!this.transitioning && !this.$element.hasClass("in")) {
            var b = a.Event("show.bs.collapse");
            if (this.$element.trigger(b), !b.isDefaultPrevented()) {
                var c = this.$parent && this.$parent.find("> .panel > .in");
                if (c && c.length) {
                    var d = c.data("bs.collapse");
                    if (d && d.transitioning)return;
                    c.collapse("hide"), d || c.data("bs.collapse", null)
                }
                var e = this.dimension();
                this.$element.removeClass("collapse").addClass("collapsing")[e](0), this.transitioning = 1;
                var f = function () {
                    this.$element.removeClass("collapsing").addClass("collapse in")[e]("auto"), this.transitioning = 0, this.$element.trigger("shown.bs.collapse")
                };
                if (!a.support.transition)return f.call(this);
                var g = a.camelCase(["scroll", e].join("-"));
                this.$element.one(a.support.transition.end, a.proxy(f, this)).emulateTransitionEnd(350)[e](this.$element[0][g])
            }
        }
    }, b.prototype.hide = function () {
        if (!this.transitioning && this.$element.hasClass("in")) {
            var b = a.Event("hide.bs.collapse");
            if (this.$element.trigger(b), !b.isDefaultPrevented()) {
                var c = this.dimension();
                this.$element[c](this.$element[c]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"), this.transitioning = 1;
                var d = function () {
                    this.transitioning = 0, this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")
                };
                return a.support.transition ? void this.$element[c](0).one(a.support.transition.end, a.proxy(d, this)).emulateTransitionEnd(350) : d.call(this)
            }
        }
    }, b.prototype.toggle = function () {
        this[this.$element.hasClass("in") ? "hide" : "show"]()
    };
    var c = a.fn.collapse;
    a.fn.collapse = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.collapse"), f = a.extend({}, b.DEFAULTS, d.data(), "object" == typeof c && c);
            !e && f.toggle && "show" == c && (c = !c), e || d.data("bs.collapse", e = new b(this, f)), "string" == typeof c && e[c]()
        })
    }, a.fn.collapse.Constructor = b, a.fn.collapse.noConflict = function () {
        return a.fn.collapse = c, this
    }, a(document).on("click.bs.collapse.data-api", "[data-toggle=collapse]", function (b) {
        var c, d = a(this), e = d.attr("data-target") || b.preventDefault() || (c = d.attr("href")) && c.replace(/.*(?=#[^\s]+$)/, ""), f = a(e), g = f.data("bs.collapse"), h = g ? "toggle" : d.data(), i = d.attr("data-parent"), j = i && a(i);
        g && g.transitioning || (j && j.find('[data-toggle=collapse][data-parent="' + i + '"]').not(d).addClass("collapsed"), d[f.hasClass("in") ? "addClass" : "removeClass"]("collapsed")), f.collapse(h)
    })
}(jQuery), +function (a) {
    
    function b(b) {
        a(d).remove(), a(e).each(function () {
            var d = c(a(this)), e = {relatedTarget: this};
            d.hasClass("open") && (d.trigger(b = a.Event("hide.bs.dropdown", e)), b.isDefaultPrevented() || d.removeClass("open").trigger("hidden.bs.dropdown", e))
        })
    }

    function c(b) {
        var c = b.attr("data-target");
        c || (c = b.attr("href"), c = c && /#[A-Za-z]/.test(c) && c.replace(/.*(?=#[^\s]*$)/, ""));
        var d = c && a(c);
        return d && d.length ? d : b.parent()
    }

    var d = ".dropdown-backdrop", e = "[data-toggle=dropdown]", f = function (b) {
        a(b).on("click.bs.dropdown", this.toggle)
    };
    f.prototype.toggle = function (d) {
        var e = a(this);
        if (!e.is(".disabled, :disabled")) {
            var f = c(e), g = f.hasClass("open");
            if (b(), !g) {
                "ontouchstart"in document.documentElement && !f.closest(".navbar-nav").length && a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click", b);
                var h = {relatedTarget: this};
                if (f.trigger(d = a.Event("show.bs.dropdown", h)), d.isDefaultPrevented())return;
                f.toggleClass("open").trigger("shown.bs.dropdown", h), e.focus()
            }
            return!1
        }
    }, f.prototype.keydown = function (b) {
        if (/(38|40|27)/.test(b.keyCode)) {
            var d = a(this);
            if (b.preventDefault(), b.stopPropagation(), !d.is(".disabled, :disabled")) {
                var f = c(d), g = f.hasClass("open");
                if (!g || g && 27 == b.keyCode)return 27 == b.which && f.find(e).focus(), d.click();
                var h = " li:not(.divider):visible a", i = f.find("[role=menu]" + h + ", [role=listbox]" + h);
                if (i.length) {
                    var j = i.index(i.filter(":focus"));
                    38 == b.keyCode && j > 0 && j--, 40 == b.keyCode && j < i.length - 1 && j++, ~j || (j = 0), i.eq(j).focus()
                }
            }
        }
    };
    var g = a.fn.dropdown;
    a.fn.dropdown = function (b) {
        return this.each(function () {
            var c = a(this), d = c.data("bs.dropdown");
            d || c.data("bs.dropdown", d = new f(this)), "string" == typeof b && d[b].call(c)
        })
    }, a.fn.dropdown.Constructor = f, a.fn.dropdown.noConflict = function () {
        return a.fn.dropdown = g, this
    }, a(document).on("click.bs.dropdown.data-api", b).on("click.bs.dropdown.data-api", ".dropdown form", function (a) {
        a.stopPropagation()
    }).on("click.bs.dropdown.data-api", e, f.prototype.toggle).on("keydown.bs.dropdown.data-api", e + ", [role=menu], [role=listbox]", f.prototype.keydown)
}(jQuery), +function (a) {
    
    var b = function (b, c) {
        this.options = c, this.$element = a(b), this.$backdrop = this.isShown = null, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, a.proxy(function () {
            this.$element.trigger("loaded.bs.modal")
        }, this))
    };
    b.DEFAULTS = {backdrop: !0, keyboard: !0, show: !0}, b.prototype.toggle = function (a) {
        return this[this.isShown ? "hide" : "show"](a)
    }, b.prototype.show = function (b) {
        var c = this, d = a.Event("show.bs.modal", {relatedTarget: b});
        this.$element.trigger(d), this.isShown || d.isDefaultPrevented() || (this.isShown = !0, this.escape(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', a.proxy(this.hide, this)), this.backdrop(function () {
            var d = a.support.transition && c.$element.hasClass("fade");
            c.$element.parent().length || c.$element.appendTo(document.body), c.$element.show().scrollTop(0), d && c.$element[0].offsetWidth, c.$element.addClass("in").attr("aria-hidden", !1), c.enforceFocus();
            var e = a.Event("shown.bs.modal", {relatedTarget: b});
            d ? c.$element.find(".modal-dialog").one(a.support.transition.end, function () {
                c.$element.focus().trigger(e)
            }).emulateTransitionEnd(300) : c.$element.focus().trigger(e)
        }))
    }, b.prototype.hide = function (b) {
        b && b.preventDefault(), b = a.Event("hide.bs.modal"), this.$element.trigger(b), this.isShown && !b.isDefaultPrevented() && (this.isShown = !1, this.escape(), a(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), a.support.transition && this.$element.hasClass("fade") ? this.$element.one(a.support.transition.end, a.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal())
    }, b.prototype.enforceFocus = function () {
        a(document).off("focusin.bs.modal").on("focusin.bs.modal", a.proxy(function (a) {
            this.$element[0] === a.target || this.$element.has(a.target).length || this.$element.focus()
        }, this))
    }, b.prototype.escape = function () {
        this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.bs.modal", a.proxy(function (a) {
            27 == a.which && this.hide()
        }, this)) : this.isShown || this.$element.off("keyup.dismiss.bs.modal")
    }, b.prototype.hideModal = function () {
        var a = this;
        this.$element.hide(), this.backdrop(function () {
            a.removeBackdrop(), a.$element.trigger("hidden.bs.modal")
        })
    }, b.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
    }, b.prototype.backdrop = function (b) {
        var c = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var d = a.support.transition && c;
            if (this.$backdrop = a('<div class="modal-backdrop ' + c + '" />').appendTo(document.body), this.$element.on("click.dismiss.bs.modal", a.proxy(function (a) {
                a.target === a.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this))
            }, this)), d && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !b)return;
            d ? this.$backdrop.one(a.support.transition.end, b).emulateTransitionEnd(150) : b()
        } else!this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(a.support.transition.end, b).emulateTransitionEnd(150) : b()) : b && b()
    };
    var c = a.fn.modal;
    a.fn.modal = function (c, d) {
        return this.each(function () {
            var e = a(this), f = e.data("bs.modal"), g = a.extend({}, b.DEFAULTS, e.data(), "object" == typeof c && c);
            f || e.data("bs.modal", f = new b(this, g)), "string" == typeof c ? f[c](d) : g.show && f.show(d)
        })
    }, a.fn.modal.Constructor = b, a.fn.modal.noConflict = function () {
        return a.fn.modal = c, this
    }, a(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (b) {
        var c = a(this), d = c.attr("href"), e = a(c.attr("data-target") || d && d.replace(/.*(?=#[^\s]+$)/, "")), f = e.data("bs.modal") ? "toggle" : a.extend({remote: !/#/.test(d) && d}, e.data(), c.data());
        c.is("a") && b.preventDefault(), e.modal(f, this).one("hide", function () {
            c.is(":visible") && c.focus()
        })
    }), a(document).on("show.bs.modal", ".modal", function () {
        a(document.body).addClass("modal-open")
    }).on("hidden.bs.modal", ".modal", function () {
        a(document.body).removeClass("modal-open")
    })
}(jQuery), +function (a) {
    
    var b = function (a, b) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null, this.init("tooltip", a, b)
    };
    b.DEFAULTS = {animation: !0, placement: "top", selector: !1, template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>', trigger: "hover focus", title: "", delay: 0, html: !1, container: !1}, b.prototype.init = function (b, c, d) {
        this.enabled = !0, this.type = b, this.$element = a(c), this.options = this.getOptions(d);
        for (var e = this.options.trigger.split(" "), f = e.length; f--;) {
            var g = e[f];
            if ("click" == g)this.$element.on("click." + this.type, this.options.selector, a.proxy(this.toggle, this)); else if ("manual" != g) {
                var h = "hover" == g ? "mouseenter" : "focusin", i = "hover" == g ? "mouseleave" : "focusout";
                this.$element.on(h + "." + this.type, this.options.selector, a.proxy(this.enter, this)), this.$element.on(i + "." + this.type, this.options.selector, a.proxy(this.leave, this))
            }
        }
        this.options.selector ? this._options = a.extend({}, this.options, {trigger: "manual", selector: ""}) : this.fixTitle()
    }, b.prototype.getDefaults = function () {
        return b.DEFAULTS
    }, b.prototype.getOptions = function (b) {
        return b = a.extend({}, this.getDefaults(), this.$element.data(), b), b.delay && "number" == typeof b.delay && (b.delay = {show: b.delay, hide: b.delay}), b
    }, b.prototype.getDelegateOptions = function () {
        var b = {}, c = this.getDefaults();
        return this._options && a.each(this._options, function (a, d) {
            c[a] != d && (b[a] = d)
        }), b
    }, b.prototype.enter = function (b) {
        var c = b instanceof this.constructor ? b : a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        return clearTimeout(c.timeout), c.hoverState = "in", c.options.delay && c.options.delay.show ? void(c.timeout = setTimeout(function () {
            "in" == c.hoverState && c.show()
        }, c.options.delay.show)) : c.show()
    }, b.prototype.leave = function (b) {
        var c = b instanceof this.constructor ? b : a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        return clearTimeout(c.timeout), c.hoverState = "out", c.options.delay && c.options.delay.hide ? void(c.timeout = setTimeout(function () {
            "out" == c.hoverState && c.hide()
        }, c.options.delay.hide)) : c.hide()
    }, b.prototype.show = function () {
        var b = a.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            if (this.$element.trigger(b), b.isDefaultPrevented())return;
            var c = this, d = this.tip();
            this.setContent(), this.options.animation && d.addClass("fade");
            var e = "function" == typeof this.options.placement ? this.options.placement.call(this, d[0], this.$element[0]) : this.options.placement, f = /\s?auto?\s?/i, g = f.test(e);
            g && (e = e.replace(f, "") || "top"), d.detach().css({top: 0, left: 0, display: "block"}).addClass(e), this.options.container ? d.appendTo(this.options.container) : d.insertAfter(this.$element);
            var h = this.getPosition(), i = d[0].offsetWidth, j = d[0].offsetHeight;
            if (g) {
                var k = this.$element.parent(), l = e, m = document.documentElement.scrollTop || document.body.scrollTop, n = "body" == this.options.container ? window.innerWidth : k.outerWidth(), o = "body" == this.options.container ? window.innerHeight : k.outerHeight(), p = "body" == this.options.container ? 0 : k.offset().left;
                e = "bottom" == e && h.top + h.height + j - m > o ? "top" : "top" == e && h.top - m - j < 0 ? "bottom" : "right" == e && h.right + i > n ? "left" : "left" == e && h.left - i < p ? "right" : e, d.removeClass(l).addClass(e)
            }
            var q = this.getCalculatedOffset(e, h, i, j);
            this.applyPlacement(q, e), this.hoverState = null;
            var r = function () {
                c.$element.trigger("shown.bs." + c.type)
            };
            a.support.transition && this.$tip.hasClass("fade") ? d.one(a.support.transition.end, r).emulateTransitionEnd(150) : r()
        }
    }, b.prototype.applyPlacement = function (b, c) {
        var d, e = this.tip(), f = e[0].offsetWidth, g = e[0].offsetHeight, h = parseInt(e.css("margin-top"), 10), i = parseInt(e.css("margin-left"), 10);
        isNaN(h) && (h = 0), isNaN(i) && (i = 0), b.top = b.top + h, b.left = b.left + i, a.offset.setOffset(e[0], a.extend({using: function (a) {
            e.css({top: Math.round(a.top), left: Math.round(a.left)})
        }}, b), 0), e.addClass("in");
        var j = e[0].offsetWidth, k = e[0].offsetHeight;
        if ("top" == c && k != g && (d = !0, b.top = b.top + g - k), /bottom|top/.test(c)) {
            var l = 0;
            b.left < 0 && (l = -2 * b.left, b.left = 0, e.offset(b), j = e[0].offsetWidth, k = e[0].offsetHeight), this.replaceArrow(l - f + j, j, "left")
        } else this.replaceArrow(k - g, k, "top");
        d && e.offset(b)
    }, b.prototype.replaceArrow = function (a, b, c) {
        this.arrow().css(c, a ? 50 * (1 - a / b) + "%" : "")
    }, b.prototype.setContent = function () {
        var a = this.tip(), b = this.getTitle();
        a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b), a.removeClass("fade in top bottom left right")
    }, b.prototype.hide = function () {
        function b() {
            "in" != c.hoverState && d.detach(), c.$element.trigger("hidden.bs." + c.type)
        }

        var c = this, d = this.tip(), e = a.Event("hide.bs." + this.type);
        return this.$element.trigger(e), e.isDefaultPrevented() ? void 0 : (d.removeClass("in"), a.support.transition && this.$tip.hasClass("fade") ? d.one(a.support.transition.end, b).emulateTransitionEnd(150) : b(), this.hoverState = null, this)
    }, b.prototype.fixTitle = function () {
        var a = this.$element;
        (a.attr("title") || "string" != typeof a.attr("data-original-title")) && a.attr("data-original-title", a.attr("title") || "").attr("title", "")
    }, b.prototype.hasContent = function () {
        return this.getTitle()
    }, b.prototype.getPosition = function () {
        var b = this.$element[0];
        return a.extend({}, "function" == typeof b.getBoundingClientRect ? b.getBoundingClientRect() : {width: b.offsetWidth, height: b.offsetHeight}, this.$element.offset())
    }, b.prototype.getCalculatedOffset = function (a, b, c, d) {
        return"bottom" == a ? {top: b.top + b.height, left: b.left + b.width / 2 - c / 2} : "top" == a ? {top: b.top - d, left: b.left + b.width / 2 - c / 2} : "left" == a ? {top: b.top + b.height / 2 - d / 2, left: b.left - c} : {top: b.top + b.height / 2 - d / 2, left: b.left + b.width}
    }, b.prototype.getTitle = function () {
        var a, b = this.$element, c = this.options;
        return a = b.attr("data-original-title") || ("function" == typeof c.title ? c.title.call(b[0]) : c.title)
    }, b.prototype.tip = function () {
        return this.$tip = this.$tip || a(this.options.template)
    }, b.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }, b.prototype.validate = function () {
        this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null)
    }, b.prototype.enable = function () {
        this.enabled = !0
    }, b.prototype.disable = function () {
        this.enabled = !1
    }, b.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    }, b.prototype.toggle = function (b) {
        var c = b ? a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
        c.tip().hasClass("in") ? c.leave(c) : c.enter(c)
    }, b.prototype.destroy = function () {
        clearTimeout(this.timeout), this.hide().$element.off("." + this.type).removeData("bs." + this.type)
    };
    var c = a.fn.tooltip;
    a.fn.tooltip = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.tooltip"), f = "object" == typeof c && c;
            (e || "destroy" != c) && (e || d.data("bs.tooltip", e = new b(this, f)), "string" == typeof c && e[c]())
        })
    }, a.fn.tooltip.Constructor = b, a.fn.tooltip.noConflict = function () {
        return a.fn.tooltip = c, this
    }
}(jQuery), +function (a) {
    
    var b = function (a, b) {
        this.init("popover", a, b)
    };
    if (!a.fn.tooltip)throw new Error("Popover requires tooltip.js");
    b.DEFAULTS = a.extend({}, a.fn.tooltip.Constructor.DEFAULTS, {placement: "right", trigger: "click", content: "", template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}), b.prototype = a.extend({}, a.fn.tooltip.Constructor.prototype), b.prototype.constructor = b, b.prototype.getDefaults = function () {
        return b.DEFAULTS
    }, b.prototype.setContent = function () {
        var a = this.tip(), b = this.getTitle(), c = this.getContent();
        a.find(".popover-title")[this.options.html ? "html" : "text"](b), a.find(".popover-content")[this.options.html ? "string" == typeof c ? "html" : "append" : "text"](c), a.removeClass("fade top bottom left right in"), a.find(".popover-title").html() || a.find(".popover-title").hide()
    }, b.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }, b.prototype.getContent = function () {
        var a = this.$element, b = this.options;
        return a.attr("data-content") || ("function" == typeof b.content ? b.content.call(a[0]) : b.content)
    }, b.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find(".arrow")
    }, b.prototype.tip = function () {
        return this.$tip || (this.$tip = a(this.options.template)), this.$tip
    };
    var c = a.fn.popover;
    a.fn.popover = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.popover"), f = "object" == typeof c && c;
            (e || "destroy" != c) && (e || d.data("bs.popover", e = new b(this, f)), "string" == typeof c && e[c]())
        })
    }, a.fn.popover.Constructor = b, a.fn.popover.noConflict = function () {
        return a.fn.popover = c, this
    }
}(jQuery), +function (a) {
    
    function b(c, d) {
        var e, f = a.proxy(this.process, this);
        this.$element = a(a(c).is("body") ? window : c), this.$body = a("body"), this.$scrollElement = this.$element.on("scroll.bs.scroll-spy.data-api", f), this.options = a.extend({}, b.DEFAULTS, d), this.selector = (this.options.target || (e = a(c).attr("href")) && e.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a", this.offsets = a([]), this.targets = a([]), this.activeTarget = null, this.refresh(), this.process()
    }

    b.DEFAULTS = {offset: 10}, b.prototype.refresh = function () {
        var b = this.$element[0] == window ? "offset" : "position";
        this.offsets = a([]), this.targets = a([]);
        {
            var c = this;
            this.$body.find(this.selector).map(function () {
                var d = a(this), e = d.data("target") || d.attr("href"), f = /^#./.test(e) && a(e);
                return f && f.length && f.is(":visible") && [
                    [f[b]().top + (!a.isWindow(c.$scrollElement.get(0)) && c.$scrollElement.scrollTop()), e]
                ] || null
            }).sort(function (a, b) {
                return a[0] - b[0]
            }).each(function () {
                c.offsets.push(this[0]), c.targets.push(this[1])
            })
        }
    }, b.prototype.process = function () {
        var a, b = this.$scrollElement.scrollTop() + this.options.offset, c = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, d = c - this.$scrollElement.height(), e = this.offsets, f = this.targets, g = this.activeTarget;
        if (b >= d)return g != (a = f.last()[0]) && this.activate(a);
        if (g && b <= e[0])return g != (a = f[0]) && this.activate(a);
        for (a = e.length; a--;)g != f[a] && b >= e[a] && (!e[a + 1] || b <= e[a + 1]) && this.activate(f[a])
    }, b.prototype.activate = function (b) {
        this.activeTarget = b, a(this.selector).parentsUntil(this.options.target, ".active").removeClass("active");
        var c = this.selector + '[data-target="' + b + '"],' + this.selector + '[href="' + b + '"]', d = a(c).parents("li").addClass("active");
        d.parent(".dropdown-menu").length && (d = d.closest("li.dropdown").addClass("active")), d.trigger("activate.bs.scrollspy")
    };
    var c = a.fn.scrollspy;
    a.fn.scrollspy = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.scrollspy"), f = "object" == typeof c && c;
            e || d.data("bs.scrollspy", e = new b(this, f)), "string" == typeof c && e[c]()
        })
    }, a.fn.scrollspy.Constructor = b, a.fn.scrollspy.noConflict = function () {
        return a.fn.scrollspy = c, this
    }, a(window).on("load", function () {
        a('[data-spy="scroll"]').each(function () {
            var b = a(this);
            b.scrollspy(b.data())
        })
    })
}(jQuery), +function (a) {
    
    var b = function (b) {
        this.element = a(b)
    };
    b.prototype.show = function () {
        var b = this.element, c = b.closest("ul:not(.dropdown-menu)"), d = b.data("target");
        if (d || (d = b.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, "")), !b.parent("li").hasClass("active")) {
            var e = c.find(".active:last a")[0], f = a.Event("show.bs.tab", {relatedTarget: e});
            if (b.trigger(f), !f.isDefaultPrevented()) {
                var g = a(d);
                this.activate(b.parent("li"), c), this.activate(g, g.parent(), function () {
                    b.trigger({type: "shown.bs.tab", relatedTarget: e})
                })
            }
        }
    }, b.prototype.activate = function (b, c, d) {
        function e() {
            f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), b.addClass("active"), g ? (b[0].offsetWidth, b.addClass("in")) : b.removeClass("fade"), b.parent(".dropdown-menu") && b.closest("li.dropdown").addClass("active"), d && d()
        }

        var f = c.find("> .active"), g = d && a.support.transition && f.hasClass("fade");
        g ? f.one(a.support.transition.end, e).emulateTransitionEnd(150) : e(), f.removeClass("in")
    };
    var c = a.fn.tab;
    a.fn.tab = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.tab");
            e || d.data("bs.tab", e = new b(this)), "string" == typeof c && e[c]()
        })
    }, a.fn.tab.Constructor = b, a.fn.tab.noConflict = function () {
        return a.fn.tab = c, this
    }, a(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function (b) {
        b.preventDefault(), a(this).tab("show")
    })
}(jQuery), +function (a) {
    
    var b = function (c, d) {
        this.options = a.extend({}, b.DEFAULTS, d), this.$window = a(window).on("scroll.bs.affix.data-api", a.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", a.proxy(this.checkPositionWithEventLoop, this)), this.$element = a(c), this.affixed = this.unpin = this.pinnedOffset = null, this.checkPosition()
    };
    b.RESET = "affix affix-top affix-bottom", b.DEFAULTS = {offset: 0}, b.prototype.getPinnedOffset = function () {
        if (this.pinnedOffset)return this.pinnedOffset;
        this.$element.removeClass(b.RESET).addClass("affix");
        var a = this.$window.scrollTop(), c = this.$element.offset();
        return this.pinnedOffset = c.top - a
    }, b.prototype.checkPositionWithEventLoop = function () {
        setTimeout(a.proxy(this.checkPosition, this), 1)
    }, b.prototype.checkPosition = function () {
        if (this.$element.is(":visible")) {
            var c = a(document).height(), d = this.$window.scrollTop(), e = this.$element.offset(), f = this.options.offset, g = f.top, h = f.bottom;
            "top" == this.affixed && (e.top += d), "object" != typeof f && (h = g = f), "function" == typeof g && (g = f.top(this.$element)), "function" == typeof h && (h = f.bottom(this.$element));
            var i = null != this.unpin && d + this.unpin <= e.top ? !1 : null != h && e.top + this.$element.height() >= c - h ? "bottom" : null != g && g >= d ? "top" : !1;
            if (this.affixed !== i) {
                this.unpin && this.$element.css("top", "");
                var j = "affix" + (i ? "-" + i : ""), k = a.Event(j + ".bs.affix");
                this.$element.trigger(k), k.isDefaultPrevented() || (this.affixed = i, this.unpin = "bottom" == i ? this.getPinnedOffset() : null, this.$element.removeClass(b.RESET).addClass(j).trigger(a.Event(j.replace("affix", "affixed"))), "bottom" == i && this.$element.offset({top: c - h - this.$element.height()}))
            }
        }
    };
    var c = a.fn.affix;
    a.fn.affix = function (c) {
        return this.each(function () {
            var d = a(this), e = d.data("bs.affix"), f = "object" == typeof c && c;
            e || d.data("bs.affix", e = new b(this, f)), "string" == typeof c && e[c]()
        })
    }, a.fn.affix.Constructor = b, a.fn.affix.noConflict = function () {
        return a.fn.affix = c, this
    }, a(window).on("load", function () {
        a('[data-spy="affix"]').each(function () {
            var b = a(this), c = b.data();
            c.offset = c.offset || {}, c.offsetBottom && (c.offset.bottom = c.offsetBottom), c.offsetTop && (c.offset.top = c.offsetTop), b.affix(c)
        })
    })
}(jQuery);

define("bootstrap", ["jquery"], function(){});

define('widgets/filter/Fx-catalog-collapsible-menu',[
    "jquery",
    "widgets/Fx-widgets-commons",
    "bootstrap"
], function ($, W_Commons) {

    var o = { },
        defaultOptions = {
            widget: {
                lang: 'EN'
            },
            events: {
                SELECT: 'fx.catalog.module.select'
            }
        };

    var cache = {},
        w_Commons, $collapse;

    function Fx_Catalog_Collapsible_Menu() {
        w_Commons = new W_Commons();
    }

    Fx_Catalog_Collapsible_Menu.prototype.init = function (options) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    Fx_Catalog_Collapsible_Menu.prototype.render = function (options) {
        var self = this;
        $.extend(o, options);

        if (!cache.json) {

            if (o.hasOwnProperty("config")) {

                $.getJSON(o.config, function (data) {
                    cache.json = data;
                    self.initStructure();
                    self.renderMenu(data);
                }).error(function () {
                    throw new Error("Fx_Catalog_Collapsible_Menu: impossible to load config JSON.");
                });
            }
        } else {
            self.initStructure();
            self.renderMenu(cache.json);
        }
    };

    Fx_Catalog_Collapsible_Menu.prototype.initStructure = function () {

        o.collapseId = "fx-collapse-" + w_Commons.getFenixUniqueId();

        $collapse = $('<div class="panel-group" id="accordion"></div>');
        $collapse.attr("id", o.collapseId);

        $(o.container).append($collapse);

    };

    Fx_Catalog_Collapsible_Menu.prototype.renderMenu = function (json) {

        var self = this;

        if (json.hasOwnProperty("panels")) {

            var panels = json.panels;

            for (var i = 0; i < panels.length; i++) {

                $collapse.append(self.buildPanel(panels[i]))

            }

            $(o.container).append($collapse)

        } else {
            throw new Error("Fx_Catalog_Collapsible_Menu: no 'panels' attribute in config JSON.")
        }
    };

    Fx_Catalog_Collapsible_Menu.prototype.buildPanel = function (panel) {
        var self = this,
            id = "fx-collapse-panel-" + w_Commons.getFenixUniqueId();

        var $p = $(document.createElement("DIV"));
        $p.addClass("panel");
        $p.addClass("panel-default");

        $p.append(self.buildPanelHeader(panel, id));
        $p.append(self.buildPanelBody(panel, id));

        return $p;
    };

    Fx_Catalog_Collapsible_Menu.prototype.buildPanelHeader = function (panel, id) {

        //Init header
        var $header = $('<div class="panel-heading"></div>'),
            $title = $('<h4 class="panel-title fx-menu-category-title"></h4>'),
            $a = $('<a data-toggle="collapse"></a>'),
            $info = $('<div class="fx-catalog-modular-menu-category-info"></div>'),
            $plus = $('<div class="fx-catalog-modular-menu-category-plus"></div>');

        $a.attr("data-parent", "#" + o.collapseId);
        $a.attr("href", "#" + id);

        if (panel.hasOwnProperty("title")) {
            $a.html(panel["title"][o.widget.lang]);
        }

        return $header.append($title.append($a.append($plus)).append($info));

    };

    Fx_Catalog_Collapsible_Menu.prototype.buildPanelBody = function (panel, id) {

        //Init panel body
        var $bodyContainer = $("<div class='panel-collapse collapse'></div>");
        $bodyContainer.attr("id", id);

        var $body = $('<div class="panel-body"></div>');

        if (panel.hasOwnProperty("modules")) {
            var modules = panel["modules"];

            for (var j = 0; j < modules.length; j++) {

                var $module = $("<div></div>"),
                    $btn = $('<button type="button" class="btn btn-default btn-block"></button>');

                $btn.on('click', {module: modules[j] }, function (e) {
                    var $btn = $(this);

                    if ($btn.is(':disabled') === false) {
                        $btn.attr("disabled", "disabled");
                        w_Commons.raiseCustomEvent(o.container, o.events.SELECT, e.data.module)
                    }

                });

                if (modules[j].hasOwnProperty("id")) {
                    $btn.attr("id", modules[j].id);
                }

                if (modules[j].hasOwnProperty("module")) {
                    $btn.attr("data-module", modules[j].module);
                }

                //Keep it before the label to have the icon in its the left side
                if (modules[j].hasOwnProperty("icon")) {
                    $btn.append($('<span class="' + modules[j].icon + '"></span>'));
                }

                if (modules[j].hasOwnProperty("label")) {

                    $btn.append(modules[j].label[o.widget.lang]);
                }

                if (modules[j].hasOwnProperty("popover")) {

                    /*                    console.log(modules[j]["popover"])
                     var keys = Object.keys(modules[j]["popover"]);

                     for (var k = 0; k < keys.length; k++ ){

                     $btn.attr(keys[k], modules[j]["popover"][keys[k]])
                     }*/

                }

                $module.append($btn);
                $body.append($module)
            }
        }

        return $bodyContainer.append($body);
    };

    Fx_Catalog_Collapsible_Menu.prototype.disable = function (module) {
        $(o.container).find("[data-module='" + module + "']").attr("disabled", "disabled");
    };

    Fx_Catalog_Collapsible_Menu.prototype.activate = function (module) {

        $(o.container).find("[data-module='" + module + "']").removeAttr("disabled");

    };

    return Fx_Catalog_Collapsible_Menu;

});

/*
 * TODO:
 * Set lang dynamically
 *
 * Review the validation method. Every ComponentType should have an array of validation fns in order
 * to do not duplicate the same validation fns
 * */

define('fenix-ui-creator',["require", "jquery"], function (require, $) {

    var errors = {
            UNKNOWN_TYPE: {EN: "FENIX UI Creator: Unknown widget type"},
            CONTAINER_NOT_FOUND: { EN: "FENIX UI Creator: Impossible to find container"},
            ELEMENTS_NOT_JSON: { EN: "FENIX UI Creator: Elements JSON file not valid"},
            ELEMENTS_NOT_ARRAY: { EN: "FENIX UI Creator: Elements JSON file not an array"},
            ELEM_NOT_ID: { EN: "FENIX UI Creator: Specify Id for each UI element"},
            ELEM_NOT_COMP: { EN: "FENIX UI Creator: Specify Component for each UI element"},
            ELEM_COMP_TYPE: { EN: "FENIX UI Creator: Component Type not valid"},
            ELEM_NOT_SOURCE: { EN: "FENIX UI Creator: Specify source for each Component"},
            ELEM_NOT_DATAFIELDS: { EN: "FENIX UI Creator: Specify Datafields for each Component"},
            VALUES_NOT_READY: { EN: "FENIX UI Creator: Values Not Ready"},
            VALIDATORS_NOT_VALID: { EN: "FENIX UI Creator: Validators not valid"},
            DATE_FORMAT_ERROR: { EN: "FENIX UI Creator: Date format not valid"},
            CONNECTION_FAIL: { EN: "FENIX UI Creator: Connection problems"}
        },
        lang = 'EN',
        valid;
    /*
     langs: allowed languages for rendering
     o: component internal options
     v: used to get validation result
     */
    var langs = ["EN", "FR", "ES"], o = {}, elems, v;

    //helper functions
    function handleError(e) {
        throw new Error(errors[e][lang]);
        valid = false;
    }

    //Validation fns
    function inputValidation() {

        //Existing container
        if (!document.querySelector(o.container)) {
            handleError("CONTAINER_NOT_FOUND");
        }

        //valid JSON Source
        try {
            JSON.parse(o.elements);
        } catch (e) {
            handleError("ELEMENTS_NOT_JSON");
        }

        //Source as Array
        if (JSON.parse(o.elements).length === undefined) {
            handleError("ELEMENTS_NOT_ARRAY");
        }

        //UI valid lang
        if (o.lang && langs.indexOf(o.lang.toUpperCase()) > 0) {
            lang = o.lang.toUpperCase();
        }

        return valid;
    }

    function validateElement(e, widget) {

        //Valid component
        if (!e.hasOwnProperty("id")) {
            handleError("ELEM_NOT_ID");
        }

        //Valid component
        if (!e.hasOwnProperty("component")) {
            handleError("ELEM_NOT_COMP");
        }
        //Component Type
        if (widget.validate) {
            valid = widget.validate(e.component);
        }

        return valid;
    }

    //Rendering fns
    function createElement(e, container, widget) {

        var div, label, c;

        c = document.getElementById(e.container);

        if (!c) {

            c = document.createElement("DIV");
            c.setAttribute("id", e.container);
            if (e.cssclass) {
                c.setAttribute("class", e.cssclass);
            }

        }

        if (e.label[lang] && o.labels) {

            label = document.createElement("label");
            label.setAttribute("for", e.id);
            label.innerHTML = e.label[lang];
            c.appendChild(label);

            div = document.createElement("DIV");
            div.setAttribute("id", e.id);
            c.appendChild(div);

            document.querySelector(container).appendChild(c);

        } else {

            div = document.createElement("DIV");
            if (e.cssclass) {

                div.setAttribute("id", e.id);
                div.setAttribute("class", e.cssclass);
            }

            document.querySelector(container).appendChild(div);
        }

        widget.render(e, div);

    };

    //Public Component
    function Fenix_ui_creator() {
    }

    Fenix_ui_creator.prototype.getValidation = function (values) {

        var result = {}, propertyErrors, property, validatorName, e;

        if (o.validators) {
            if (typeof o.validators !== "object") {
                handleError("VALIDATORS_NOT_VALID");
            }
            else {

                //Loop over validations
                for (property in o.validators) {

                    propertyErrors = { errors: {} };

                    if (o.validators.hasOwnProperty(property)) {

                        for (validatorName in o.validators[property]) {

                            if (o.validators[property].hasOwnProperty(validatorName)) {

                                e = o.validators[property][validatorName](values[property]);

                                if (e !== true) {
                                    propertyErrors.errors[validatorName] = e;
                                }

                            }
                        }
                    }

                    if (Object.keys(propertyErrors.errors).length > 0) {

                        propertyErrors.value = values[property];
                        result[property] = propertyErrors;

                    }
                }
            }
        }

        return Object.keys(result).length === 0 ? null : result;
    };

    //Get Values
    Fenix_ui_creator.prototype.getValues = function (validate, externalElements) {

        var result = {}, i, self = this;

        if (externalElements) {

            $(externalElements).each(function (index, element) {

                //Synch call of require
                try {
                    var module = require("fx-ui-w/Fx-ui-w-" + element.type),
                        widget = new module();
                    result[element.type] = widget.getValue(element);

                } catch (e) {
                    console.log(e)
                }


            });

        } else {
            //Looping on initial elements
            if (elems === undefined) {
                handleError("VALUES_NOT_READY");
            }


            $(elems).each(function (index, element) {

                //Synch call of require
                try {
                    var module = require("fx-ui-w/Fx-ui-w-" + element.type),
                        widget = new module();
                    result[element.id] = widget.getValue(element);
                } catch (e) {
                    console.log(e)
                }

            });
        }

        v = validate === undefined || validate === false ? null : self.getValidation(result);
        if (v) {
            throw new Error(v);
        }

        return result;
    };

    Fenix_ui_creator.prototype.validate = function () {
        return this.getValidation(this.getValues());
    };

    Fenix_ui_creator.prototype.render = function (options) {

        var i;

        $.extend(o, options);
        valid = true;

        if (inputValidation()) {

            elems = JSON.parse(o.elements);

            $(elems).each(function (index, element) {

                var widgetCreator = "fx-ui-w/Fx-ui-w-" + element.type;

                require([widgetCreator], function (Widget) {
                    valid = true;
                    var widget = new Widget();

                    if (validateElement(element, widget)) {
                        createElement(element, o.container, widget);
                    }

                }, function (err) {
                    handleError("UNKNOWN_TYPE");
                });

            });

        }
    };

    Fenix_ui_creator.prototype.init = function () { };

    //Public API
    return Fenix_ui_creator;

});

define('widgets/filter/Fx-catalog-modular-form',[
    "jquery",
    "fenix-ui-creator",
    "widgets/Fx-widgets-commons"
], function ($, UiCreator, W_Commons) {

    var o = { },
        defaultOptions = {
            widget: {
                lang: 'EN'
            },
            css_classes: {
                HEADER: "fx-catalog-modular-form-header",
                HANDLER: "fx-catalog-modular-form-handler",
                CONTENT: "fx-catalog-modular-form-content",
                CLOSE_BTN: "fx-catalog-modular-form-close-btn",
                MODULE: 'fx-catalog-form-module',
                RESIZE: "fx-catalog-modular-form-resize-btn",
                LABEL: "fx-catalog-modular-form-label"
            },
            events: {
                REMOVE_MODULE: "fx.catalog.module.remove"
            }
        }, uiCreator, w_Commons, cache = {}, modules = [];

    function Fx_catalog_modular_form() {

        uiCreator = new UiCreator();
        uiCreator.init();
        w_Commons = new W_Commons();

    }

    //(injected)
    Fx_catalog_modular_form.prototype.grid = undefined;

    Fx_catalog_modular_form.prototype.removeItem = function (item) {
        this.grid.removeItem(item)
    };

    Fx_catalog_modular_form.prototype.addItem = function (module) {

        var blank = this.getBlankModule(module);

        this.grid.addItem(blank.get(0));
        this.renderModule(blank, module);

    };

    Fx_catalog_modular_form.prototype.renderModule = function ($blank, module) {

        var c = $blank.find("." + o.css_classes.CONTENT);

        var id = "fx-catalog-module-" + w_Commons.getFenixUniqueId(),
            m = {id: cache.json[module.module].id, type: module.module};
        c.attr("id", id);

        if (cache.json[module.module].hasOwnProperty("details")){ m.details = cache.json[module.module].details; }

        modules.push(m);

        uiCreator.render({
            cssClass: "form-elements",
            container: "#" + id,
            elements: JSON.stringify([cache.json[module.module]])
        });

    };

    Fx_catalog_modular_form.prototype.getBlankModule = function (module) {

        var self = this;

        var $module = $("<div class='" + o.css_classes.MODULE + "'></div>"),
            $header = $("<div class='" + o.css_classes.HEADER + "'></div>");

        $module.attr("data-module", module.module);
        $module.attr("data-size", "half");
        $header.append("<div class='" + o.css_classes.HANDLER + "'></div>");
        $header.append("<div class='" + o.css_classes.LABEL + "'>" + cache.json[module.module]["label"][o.widget.lang] + "</div>");

        var $resize = $("<div class='" + o.css_classes.RESIZE + "'></div>");
        $resize.on("click", { module: $module.get(0), btn: $resize}, function (e) {

            if ($(e.data.module).attr("data-size") === 'half') {
                $(e.data.module).attr("data-size", "full");
                $(e.data.btn).css({
                    "background-position": "-30px -15px"
                });

            } else {
                $(e.data.module).attr("data-size", "half");
                $(e.data.btn).css({
                    "background-position": "-30px 0"
                });
            }

            self.grid.resize(e.data.module);
        });
        $header.append($resize);

        var $close_btn = $("<div class='" + o.css_classes.CLOSE_BTN + "'></div>")
            .on("click", { o: o }, function () {
                w_Commons.raiseCustomEvent(document.body, o.events.REMOVE_MODULE, { type: module.module, module: $module.get(0)});

                for (var i = 0; i < modules.length; i++) {

                    if (modules[i]["type"] === module.module) {
                        modules.splice(i, 1);
                    }
                }

            });

        $header.append($close_btn);
        $module.append($header);
        $module.append("<div class='" + o.css_classes.CONTENT + "'></div>");

        $(o.container).append($module);

        return $module;
    };

    Fx_catalog_modular_form.prototype.getValues = function (boolean) {

        return uiCreator.getValues(boolean, modules);
    };

    Fx_catalog_modular_form.prototype.initStructure = function () {

        var self = this;

        self.grid.init({
            container: o.container,
            config: o.grid.config,
            drag: o.grid.drag
        });
        self.grid.render();

    };

    Fx_catalog_modular_form.prototype.render = function (options) {
        var self = this;

        $.extend(o, options);

        if (!cache.json) {

            if (o.hasOwnProperty("config")) {
                $.getJSON(o.config, function (json) {
                    cache.json = json;
                    self.initStructure();
                }).error(function () {
                    throw new Error("fx-modular-form: impossible to load config JSON.");
                });
            }
        } else {
            this.initStructure();
        }
    };

    Fx_catalog_modular_form.prototype.init = function (options) {

        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    return Fx_catalog_modular_form;

});

define('widgets/filter/Fx-catalog-resume-bar',[
    "jquery",
    "widgets/Fx-widgets-commons",
    "bootstrap"
], function ($, W_Commons) {

    var o = { },
        defaultOptions = {
            widget: {
                lang: 'EN'
            },
            events: {
                READY: 'fx.catalog.module.ready',
                REMOVE: 'fx.catalog.module.remove'
            }
        };

    var cache = {},
        w_Commons, $collapse;

    function Fx_Catalog_Resume_Bar() {
        w_Commons = new W_Commons();
    }

    Fx_Catalog_Resume_Bar.prototype.init = function (options) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    Fx_Catalog_Resume_Bar.prototype.render = function (options) {

        this.initEventListeners();
        this.initStructure();

    };

    Fx_Catalog_Resume_Bar.prototype.initStructure = function () {

    };

    Fx_Catalog_Resume_Bar.prototype.removeItem = function (item) {
        this.findResumeItem(item).remove();
    };

    Fx_Catalog_Resume_Bar.prototype.addItem = function (item) {

        var module = this.findResumeItem(item.module);

        if (module.length !== 0) {
            var i = module.find("i"),
                text = $("<span>"+item.value+"</span>");
            module.empty().append(i).append(text);
        } else {  $(o.container).append(this.createResumeItem(item)); }

    };

    Fx_Catalog_Resume_Bar.prototype.initEventListeners = function () {

        var that = this;

        document.body.addEventListener(o.events.READY, function (e) {
            that.addItem(e.detail)
        }, false);

        document.body.addEventListener(o.events.REMOVE, function (e) {
            that.removeItem(e.detail.type)
        }, false);

    };

    Fx_Catalog_Resume_Bar.prototype.findResumeItem = function (module) {
        return  $(o.container).find('[data-module="' + module + '" ]');
    };

    Fx_Catalog_Resume_Bar.prototype.createResumeItem = function ( item ) {
        var icon;

        switch (item.module){
            case "resourceType" : icon="fa fa-database fa-fw"; break;
            case "uid" : icon="fa fa-slack fa-fw"; break;
            case "unitOfMeasure" : icon="fa fa-arrows-h fa-fw"; break;
            case "indicator" : icon="fa fa-archive fa-fw"; break;
            case "item" : icon="fa fa-dot-circle-o fa-fw"; break;
            case "coverageSector" : icon="fa fa-book fa-fw"; break;
            case "referencePeriod" : icon="fa fa-clock-o fa-fw"; break;
            case "basePeriod" : icon="fa fa-clock-o fa-fw"; break;
            case "updatePeriodicity" : icon="fa fa-calendar fa-fw"; break;
            case "region" : icon="fa fa-globe fa-fw"; break;
            case "source" : icon="fa fa-user fa-fw"; break;
            case "owner" : icon="fa fa-user fa-fw"; break;
            case "provider" : icon="fa fa-user fa-fw"; break;
        }

        return  $('<div class="fx-resume-item-selected" data-module="' + item.module + '"><i class=" ' + icon + '"></i>' + item.value + '</div>');
    };

    return Fx_Catalog_Resume_Bar;

});

/*!
 * Packery PACKAGED v1.2.2
 * bin-packing layout library
 * http://packery.metafizzy.co
 *
 * Commercial use requires one-time purchase of a commercial license
 * http://packery.metafizzy.co/license.html
 *
 * Non-commercial use is licensed under the GPL v3 License
 *
 * Copyright 2013 Metafizzy
 */

(function (t) {
    function e() {
    }

    function i(t) {
        function i(e) {
            e.prototype.option || (e.prototype.option = function (e) {
                t.isPlainObject(e) && (this.options = t.extend(!0, this.options, e))
            })
        }

        function o(e, i) {
            t.fn[e] = function (o) {
                if ("string" == typeof o) {
                    for (var s = n.call(arguments, 1), a = 0, h = this.length; h > a; a++) {
                        var p = this[a], u = t.data(p, e);
                        if (u)if (t.isFunction(u[o]) && "_" !== o.charAt(0)) {
                            var c = u[o].apply(u, s);
                            if (void 0 !== c)return c
                        } else r("no such method '" + o + "' for " + e + " instance"); else r("cannot call methods on " + e + " prior to initialization; " + "attempted to call '" + o + "'")
                    }
                    return this
                }
                return this.each(function () {
                    var n = t.data(this, e);
                    n ? (n.option(o), n._init()) : (n = new i(this, o), t.data(this, e, n))
                })
            }
        }

        if (t) {
            var r = "undefined" == typeof console ? e : function (t) {
                console.error(t)
            };
            return t.bridget = function (t, e) {
                i(e), o(t, e)
            }, t.bridget
        }
    }

    var n = Array.prototype.slice;
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], i) : i(t.jQuery)
})(window), function (t) {
    function e(t) {
        return RegExp("(^|\\s+)" + t + "(\\s+|$)")
    }

    function i(t, e) {
        var i = n(t, e) ? r : o;
        i(t, e)
    }

    var n, o, r;
    "classList"in document.documentElement ? (n = function (t, e) {
        return t.classList.contains(e)
    }, o = function (t, e) {
        t.classList.add(e)
    }, r = function (t, e) {
        t.classList.remove(e)
    }) : (n = function (t, i) {
        return e(i).test(t.className)
    }, o = function (t, e) {
        n(t, e) || (t.className = t.className + " " + e)
    }, r = function (t, i) {
        t.className = t.className.replace(e(i), " ")
    });
    var s = {hasClass: n, addClass: o, removeClass: r, toggleClass: i, has: n, add: o, remove: r, toggle: i};
    "function" == typeof define && define.amd ? define("classie/classie", s) : t.classie = s
}(window), function (t) {
    function e(t) {
        if (t) {
            if ("string" == typeof n[t])return t;
            t = t.charAt(0).toUpperCase() + t.slice(1);
            for (var e, o = 0, r = i.length; r > o; o++)if (e = i[o] + t, "string" == typeof n[e])return e
        }
    }

    var i = "Webkit Moz ms Ms O".split(" "), n = document.documentElement.style;
    "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function () {
        return e
    }) : "object" == typeof exports ? module.exports = e : t.getStyleProperty = e
}(window), function (t) {
    function e(t) {
        var e = parseFloat(t), i = -1 === t.indexOf("%") && !isNaN(e);
        return i && e
    }

    function i() {
        for (var t = {width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0}, e = 0, i = s.length; i > e; e++) {
            var n = s[e];
            t[n] = 0
        }
        return t
    }

    function n(t) {
        function n(t) {
            if ("string" == typeof t && (t = document.querySelector(t)), t && "object" == typeof t && t.nodeType) {
                var n = r(t);
                if ("none" === n.display)return i();
                var o = {};
                o.width = t.offsetWidth, o.height = t.offsetHeight;
                for (var u = o.isBorderBox = !(!p || !n[p] || "border-box" !== n[p]), c = 0, f = s.length; f > c; c++) {
                    var d = s[c], l = n[d];
                    l = a(t, l);
                    var y = parseFloat(l);
                    o[d] = isNaN(y) ? 0 : y
                }
                var g = o.paddingLeft + o.paddingRight, m = o.paddingTop + o.paddingBottom, v = o.marginLeft + o.marginRight, x = o.marginTop + o.marginBottom, b = o.borderLeftWidth + o.borderRightWidth, w = o.borderTopWidth + o.borderBottomWidth, _ = u && h, E = e(n.width);
                E !== !1 && (o.width = E + (_ ? 0 : g + b));
                var L = e(n.height);
                return L !== !1 && (o.height = L + (_ ? 0 : m + w)), o.innerWidth = o.width - (g + b), o.innerHeight = o.height - (m + w), o.outerWidth = o.width + v, o.outerHeight = o.height + x, o
            }
        }

        function a(t, e) {
            if (o || -1 === e.indexOf("%"))return e;
            var i = t.style, n = i.left, r = t.runtimeStyle, s = r && r.left;
            return s && (r.left = t.currentStyle.left), i.left = e, e = i.pixelLeft, i.left = n, s && (r.left = s), e
        }

        var h, p = t("boxSizing");
        return function () {
            if (p) {
                var t = document.createElement("div");
                t.style.width = "200px", t.style.padding = "1px 2px 3px 4px", t.style.borderStyle = "solid", t.style.borderWidth = "1px 2px 3px 4px", t.style[p] = "border-box";
                var i = document.body || document.documentElement;
                i.appendChild(t);
                var n = r(t);
                h = 200 === e(n.width), i.removeChild(t)
            }
        }(), n
    }

    var o = t.getComputedStyle, r = o ? function (t) {
        return o(t, null)
    } : function (t) {
        return t.currentStyle
    }, s = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
    "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], n) : "object" == typeof exports ? module.exports = n(require("get-style-property")) : t.getSize = n(t.getStyleProperty)
}(window), function (t) {
    function e(e) {
        var i = t.event;
        return i.target = i.target || i.srcElement || e, i
    }

    var i = document.documentElement, n = function () {
    };
    i.addEventListener ? n = function (t, e, i) {
        t.addEventListener(e, i, !1)
    } : i.attachEvent && (n = function (t, i, n) {
        t[i + n] = n.handleEvent ? function () {
            var i = e(t);
            n.handleEvent.call(n, i)
        } : function () {
            var i = e(t);
            n.call(t, i)
        }, t.attachEvent("on" + i, t[i + n])
    });
    var o = function () {
    };
    i.removeEventListener ? o = function (t, e, i) {
        t.removeEventListener(e, i, !1)
    } : i.detachEvent && (o = function (t, e, i) {
        t.detachEvent("on" + e, t[e + i]);
        try {
            delete t[e + i]
        } catch (n) {
            t[e + i] = void 0
        }
    });
    var r = {bind: n, unbind: o};
    "function" == typeof define && define.amd ? define("eventie/eventie", r) : "object" == typeof exports ? module.exports = r : t.eventie = r
}(this), function (t) {
    function e(t) {
        "function" == typeof t && (e.isReady ? t() : r.push(t))
    }

    function i(t) {
        var i = "readystatechange" === t.type && "complete" !== o.readyState;
        if (!e.isReady && !i) {
            e.isReady = !0;
            for (var n = 0, s = r.length; s > n; n++) {
                var a = r[n];
                a()
            }
        }
    }

    function n(n) {
        return n.bind(o, "DOMContentLoaded", i), n.bind(o, "readystatechange", i), n.bind(t, "load", i), e
    }

    var o = t.document, r = [];
    e.isReady = !1, "function" == typeof define && define.amd ? (e.isReady = "function" == typeof requirejs, define("doc-ready/doc-ready", ["eventie/eventie"], n)) : t.docReady = n(t.eventie)
}(this), function () {
    function t() {
    }

    function e(t, e) {
        for (var i = t.length; i--;)if (t[i].listener === e)return i;
        return-1
    }

    function i(t) {
        return function () {
            return this[t].apply(this, arguments)
        }
    }

    var n = t.prototype, o = this, r = o.EventEmitter;
    n.getListeners = function (t) {
        var e, i, n = this._getEvents();
        if (t instanceof RegExp) {
            e = {};
            for (i in n)n.hasOwnProperty(i) && t.test(i) && (e[i] = n[i])
        } else e = n[t] || (n[t] = []);
        return e
    }, n.flattenListeners = function (t) {
        var e, i = [];
        for (e = 0; t.length > e; e += 1)i.push(t[e].listener);
        return i
    }, n.getListenersAsObject = function (t) {
        var e, i = this.getListeners(t);
        return i instanceof Array && (e = {}, e[t] = i), e || i
    }, n.addListener = function (t, i) {
        var n, o = this.getListenersAsObject(t), r = "object" == typeof i;
        for (n in o)o.hasOwnProperty(n) && -1 === e(o[n], i) && o[n].push(r ? i : {listener: i, once: !1});
        return this
    }, n.on = i("addListener"), n.addOnceListener = function (t, e) {
        return this.addListener(t, {listener: e, once: !0})
    }, n.once = i("addOnceListener"), n.defineEvent = function (t) {
        return this.getListeners(t), this
    }, n.defineEvents = function (t) {
        for (var e = 0; t.length > e; e += 1)this.defineEvent(t[e]);
        return this
    }, n.removeListener = function (t, i) {
        var n, o, r = this.getListenersAsObject(t);
        for (o in r)r.hasOwnProperty(o) && (n = e(r[o], i), -1 !== n && r[o].splice(n, 1));
        return this
    }, n.off = i("removeListener"), n.addListeners = function (t, e) {
        return this.manipulateListeners(!1, t, e)
    }, n.removeListeners = function (t, e) {
        return this.manipulateListeners(!0, t, e)
    }, n.manipulateListeners = function (t, e, i) {
        var n, o, r = t ? this.removeListener : this.addListener, s = t ? this.removeListeners : this.addListeners;
        if ("object" != typeof e || e instanceof RegExp)for (n = i.length; n--;)r.call(this, e, i[n]); else for (n in e)e.hasOwnProperty(n) && (o = e[n]) && ("function" == typeof o ? r.call(this, n, o) : s.call(this, n, o));
        return this
    }, n.removeEvent = function (t) {
        var e, i = typeof t, n = this._getEvents();
        if ("string" === i)delete n[t]; else if (t instanceof RegExp)for (e in n)n.hasOwnProperty(e) && t.test(e) && delete n[e]; else delete this._events;
        return this
    }, n.removeAllListeners = i("removeEvent"), n.emitEvent = function (t, e) {
        var i, n, o, r, s = this.getListenersAsObject(t);
        for (o in s)if (s.hasOwnProperty(o))for (n = s[o].length; n--;)i = s[o][n], i.once === !0 && this.removeListener(t, i.listener), r = i.listener.apply(this, e || []), r === this._getOnceReturnValue() && this.removeListener(t, i.listener);
        return this
    }, n.trigger = i("emitEvent"), n.emit = function (t) {
        var e = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(t, e)
    }, n.setOnceReturnValue = function (t) {
        return this._onceReturnValue = t, this
    }, n._getOnceReturnValue = function () {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, n._getEvents = function () {
        return this._events || (this._events = {})
    }, t.noConflict = function () {
        return o.EventEmitter = r, t
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
        return t
    }) : "object" == typeof module && module.exports ? module.exports = t : this.EventEmitter = t
}.call(this), function (t, e) {
    function i(t, e) {
        return t[a](e)
    }

    function n(t) {
        if (!t.parentNode) {
            var e = document.createDocumentFragment();
            e.appendChild(t)
        }
    }

    function o(t, e) {
        n(t);
        for (var i = t.parentNode.querySelectorAll(e), o = 0, r = i.length; r > o; o++)if (i[o] === t)return!0;
        return!1
    }

    function r(t, e) {
        return n(t), i(t, e)
    }

    var s, a = function () {
        if (e.matchesSelector)return"matchesSelector";
        for (var t = ["webkit", "moz", "ms", "o"], i = 0, n = t.length; n > i; i++) {
            var o = t[i], r = o + "MatchesSelector";
            if (e[r])return r
        }
    }();
    if (a) {
        var h = document.createElement("div"), p = i(h, "div");
        s = p ? i : r
    } else s = o;
    "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function () {
        return s
    }) : window.matchesSelector = s
}(this, Element.prototype), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        for (var e in t)return!1;
        return e = null, !0
    }

    function n(t) {
        return t.replace(/([A-Z])/g, function (t) {
            return"-" + t.toLowerCase()
        })
    }

    function o(t, o, r) {
        function a(t, e) {
            t && (this.element = t, this.layout = e, this.position = {x: 0, y: 0}, this._create())
        }

        var h = r("transition"), p = r("transform"), u = h && p, c = !!r("perspective"), f = {WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "otransitionend", transition: "transitionend"}[h], d = ["transform", "transition", "transitionDuration", "transitionProperty"], l = function () {
            for (var t = {}, e = 0, i = d.length; i > e; e++) {
                var n = d[e], o = r(n);
                o && o !== n && (t[n] = o)
            }
            return t
        }();
        e(a.prototype, t.prototype), a.prototype._create = function () {
            this._transn = {ingProperties: {}, clean: {}, onEnd: {}}, this.css({position: "absolute"})
        }, a.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, a.prototype.getSize = function () {
            this.size = o(this.element)
        }, a.prototype.css = function (t) {
            var e = this.element.style;
            for (var i in t) {
                var n = l[i] || i;
                e[n] = t[i]
            }
        }, a.prototype.getPosition = function () {
            var t = s(this.element), e = this.layout.options, i = e.isOriginLeft, n = e.isOriginTop, o = parseInt(t[i ? "left" : "right"], 10), r = parseInt(t[n ? "top" : "bottom"], 10);
            o = isNaN(o) ? 0 : o, r = isNaN(r) ? 0 : r;
            var a = this.layout.size;
            o -= i ? a.paddingLeft : a.paddingRight, r -= n ? a.paddingTop : a.paddingBottom, this.position.x = o, this.position.y = r
        }, a.prototype.layoutPosition = function () {
            var t = this.layout.size, e = this.layout.options, i = {};
            e.isOriginLeft ? (i.left = this.position.x + t.paddingLeft + "px", i.right = "") : (i.right = this.position.x + t.paddingRight + "px", i.left = ""), e.isOriginTop ? (i.top = this.position.y + t.paddingTop + "px", i.bottom = "") : (i.bottom = this.position.y + t.paddingBottom + "px", i.top = ""), this.css(i), this.emitEvent("layout", [this])
        };
        var y = c ? function (t, e) {
            return"translate3d(" + t + "px, " + e + "px, 0)"
        } : function (t, e) {
            return"translate(" + t + "px, " + e + "px)"
        };
        a.prototype._transitionTo = function (t, e) {
            this.getPosition();
            var i = this.position.x, n = this.position.y, o = parseInt(t, 10), r = parseInt(e, 10), s = o === this.position.x && r === this.position.y;
            if (this.setPosition(t, e), s && !this.isTransitioning)return this.layoutPosition(), void 0;
            var a = t - i, h = e - n, p = {}, u = this.layout.options;
            a = u.isOriginLeft ? a : -a, h = u.isOriginTop ? h : -h, p.transform = y(a, h), this.transition({to: p, onTransitionEnd: {transform: this.layoutPosition}, isCleaning: !0})
        }, a.prototype.goTo = function (t, e) {
            this.setPosition(t, e), this.layoutPosition()
        }, a.prototype.moveTo = u ? a.prototype._transitionTo : a.prototype.goTo, a.prototype.setPosition = function (t, e) {
            this.position.x = parseInt(t, 10), this.position.y = parseInt(e, 10)
        }, a.prototype._nonTransition = function (t) {
            this.css(t.to), t.isCleaning && this._removeStyles(t.to);
            for (var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)
        }, a.prototype._transition = function (t) {
            if (!parseFloat(this.layout.options.transitionDuration))return this._nonTransition(t), void 0;
            var e = this._transn;
            for (var i in t.onTransitionEnd)e.onEnd[i] = t.onTransitionEnd[i];
            for (i in t.to)e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
            if (t.from) {
                this.css(t.from);
                var n = this.element.offsetHeight;
                n = null
            }
            this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
        };
        var g = p && n(p) + ",opacity";
        a.prototype.enableTransition = function () {
            this.isTransitioning || (this.css({transitionProperty: g, transitionDuration: this.layout.options.transitionDuration}), this.element.addEventListener(f, this, !1))
        }, a.prototype.transition = a.prototype[h ? "_transition" : "_nonTransition"], a.prototype.onwebkitTransitionEnd = function (t) {
            this.ontransitionend(t)
        }, a.prototype.onotransitionend = function (t) {
            this.ontransitionend(t)
        };
        var m = {"-webkit-transform": "transform", "-moz-transform": "transform", "-o-transform": "transform"};
        a.prototype.ontransitionend = function (t) {
            if (t.target === this.element) {
                var e = this._transn, n = m[t.propertyName] || t.propertyName;
                if (delete e.ingProperties[n], i(e.ingProperties) && this.disableTransition(), n in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[n]), n in e.onEnd) {
                    var o = e.onEnd[n];
                    o.call(this), delete e.onEnd[n]
                }
                this.emitEvent("transitionEnd", [this])
            }
        }, a.prototype.disableTransition = function () {
            this.removeTransitionStyles(), this.element.removeEventListener(f, this, !1), this.isTransitioning = !1
        }, a.prototype._removeStyles = function (t) {
            var e = {};
            for (var i in t)e[i] = "";
            this.css(e)
        };
        var v = {transitionProperty: "", transitionDuration: ""};
        return a.prototype.removeTransitionStyles = function () {
            this.css(v)
        }, a.prototype.removeElem = function () {
            this.element.parentNode.removeChild(this.element), this.emitEvent("remove", [this])
        }, a.prototype.remove = function () {
            if (!h || !parseFloat(this.layout.options.transitionDuration))return this.removeElem(), void 0;
            var t = this;
            this.on("transitionEnd", function () {
                return t.removeElem(), !0
            }), this.hide()
        }, a.prototype.reveal = function () {
            delete this.isHidden, this.css({display: ""});
            var t = this.layout.options;
            this.transition({from: t.hiddenStyle, to: t.visibleStyle, isCleaning: !0})
        }, a.prototype.hide = function () {
            this.isHidden = !0, this.css({display: ""});
            var t = this.layout.options;
            this.transition({from: t.visibleStyle, to: t.hiddenStyle, isCleaning: !0, onTransitionEnd: {opacity: function () {
                this.isHidden && this.css({display: "none"})
            }}})
        }, a.prototype.destroy = function () {
            this.css({position: "", left: "", right: "", top: "", bottom: "", transition: "", transform: ""})
        }, a
    }

    var r = document.defaultView, s = r && r.getComputedStyle ? function (t) {
        return r.getComputedStyle(t, null)
    } : function (t) {
        return t.currentStyle
    };
    "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property"], o) : (t.Outlayer = {}, t.Outlayer.Item = o(t.EventEmitter, t.getSize, t.getStyleProperty))
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        return"[object Array]" === c.call(t)
    }

    function n(t) {
        var e = [];
        if (i(t))e = t; else if (t && "number" == typeof t.length)for (var n = 0, o = t.length; o > n; n++)e.push(t[n]); else e.push(t);
        return e
    }

    function o(t, e) {
        var i = d(e, t);
        -1 !== i && e.splice(i, 1)
    }

    function r(t) {
        return t.replace(/(.)([A-Z])/g, function (t, e, i) {
            return e + "-" + i
        }).toLowerCase()
    }

    function s(i, s, c, d, l, y) {
        function g(t, i) {
            if ("string" == typeof t && (t = a.querySelector(t)), !t || !f(t))return h && h.error("Bad " + this.constructor.namespace + " element: " + t), void 0;
            this.element = t, this.options = e({}, this.options), this.option(i);
            var n = ++v;
            this.element.outlayerGUID = n, x[n] = this, this._create(), this.options.isInitLayout && this.layout()
        }

        function m(t, i) {
            t.prototype[i] = e({}, g.prototype[i])
        }

        var v = 0, x = {};
        return g.namespace = "outlayer", g.Item = y, g.prototype.options = {containerStyle: {position: "relative"}, isInitLayout: !0, isOriginLeft: !0, isOriginTop: !0, isResizeBound: !0, transitionDuration: "0.4s", hiddenStyle: {opacity: 0, transform: "scale(0.001)"}, visibleStyle: {opacity: 1, transform: "scale(1)"}}, e(g.prototype, c.prototype), g.prototype.option = function (t) {
            e(this.options, t)
        }, g.prototype._create = function () {
            this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), e(this.element.style, this.options.containerStyle), this.options.isResizeBound && this.bindResize()
        }, g.prototype.reloadItems = function () {
            this.items = this._itemize(this.element.children)
        }, g.prototype._itemize = function (t) {
            for (var e = this._filterFindItemElements(t), i = this.constructor.Item, n = [], o = 0, r = e.length; r > o; o++) {
                var s = e[o], a = new i(s, this);
                n.push(a)
            }
            return n
        }, g.prototype._filterFindItemElements = function (t) {
            t = n(t);
            for (var e = this.options.itemSelector, i = [], o = 0, r = t.length; r > o; o++) {
                var s = t[o];
                if (f(s))if (e) {
                    l(s, e) && i.push(s);
                    for (var a = s.querySelectorAll(e), h = 0, p = a.length; p > h; h++)i.push(a[h])
                } else i.push(s)
            }
            return i
        }, g.prototype.getItemElements = function () {
            for (var t = [], e = 0, i = this.items.length; i > e; e++)t.push(this.items[e].element);
            return t
        }, g.prototype.layout = function () {
            this._resetLayout(), this._manageStamps();
            var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
            this.layoutItems(this.items, t), this._isLayoutInited = !0
        }, g.prototype._init = g.prototype.layout, g.prototype._resetLayout = function () {
            this.getSize()
        }, g.prototype.getSize = function () {
            this.size = d(this.element)
        }, g.prototype._getMeasurement = function (t, e) {
            var i, n = this.options[t];
            n ? ("string" == typeof n ? i = this.element.querySelector(n) : f(n) && (i = n), this[t] = i ? d(i)[e] : n) : this[t] = 0
        }, g.prototype.layoutItems = function (t, e) {
            t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
        }, g.prototype._getItemsForLayout = function (t) {
            for (var e = [], i = 0, n = t.length; n > i; i++) {
                var o = t[i];
                o.isIgnored || e.push(o)
            }
            return e
        }, g.prototype._layoutItems = function (t, e) {
            function i() {
                n.emitEvent("layoutComplete", [n, t])
            }

            var n = this;
            if (!t || !t.length)return i(), void 0;
            this._itemsOn(t, "layout", i);
            for (var o = [], r = 0, s = t.length; s > r; r++) {
                var a = t[r], h = this._getItemLayoutPosition(a);
                h.item = a, h.isInstant = e || a.isLayoutInstant, o.push(h)
            }
            this._processLayoutQueue(o)
        }, g.prototype._getItemLayoutPosition = function () {
            return{x: 0, y: 0}
        }, g.prototype._processLayoutQueue = function (t) {
            for (var e = 0, i = t.length; i > e; e++) {
                var n = t[e];
                this._positionItem(n.item, n.x, n.y, n.isInstant)
            }
        }, g.prototype._positionItem = function (t, e, i, n) {
            n ? t.goTo(e, i) : t.moveTo(e, i)
        }, g.prototype._postLayout = function () {
            var t = this._getContainerSize();
            t && (this._setContainerMeasure(t.width, !0), this._setContainerMeasure(t.height, !1))
        }, g.prototype._getContainerSize = u, g.prototype._setContainerMeasure = function (t, e) {
            if (void 0 !== t) {
                var i = this.size;
                i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
            }
        }, g.prototype._itemsOn = function (t, e, i) {
            function n() {
                return o++, o === r && i.call(s), !0
            }

            for (var o = 0, r = t.length, s = this, a = 0, h = t.length; h > a; a++) {
                var p = t[a];
                p.on(e, n)
            }
        }, g.prototype.ignore = function (t) {
            var e = this.getItem(t);
            e && (e.isIgnored = !0)
        }, g.prototype.unignore = function (t) {
            var e = this.getItem(t);
            e && delete e.isIgnored
        }, g.prototype.stamp = function (t) {
            if (t = this._find(t)) {
                this.stamps = this.stamps.concat(t);
                for (var e = 0, i = t.length; i > e; e++) {
                    var n = t[e];
                    this.ignore(n)
                }
            }
        }, g.prototype.unstamp = function (t) {
            if (t = this._find(t))for (var e = 0, i = t.length; i > e; e++) {
                var n = t[e];
                o(n, this.stamps), this.unignore(n)
            }
        }, g.prototype._find = function (t) {
            return t ? ("string" == typeof t && (t = this.element.querySelectorAll(t)), t = n(t)) : void 0
        }, g.prototype._manageStamps = function () {
            if (this.stamps && this.stamps.length) {
                this._getBoundingRect();
                for (var t = 0, e = this.stamps.length; e > t; t++) {
                    var i = this.stamps[t];
                    this._manageStamp(i)
                }
            }
        }, g.prototype._getBoundingRect = function () {
            var t = this.element.getBoundingClientRect(), e = this.size;
            this._boundingRect = {left: t.left + e.paddingLeft + e.borderLeftWidth, top: t.top + e.paddingTop + e.borderTopWidth, right: t.right - (e.paddingRight + e.borderRightWidth), bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)}
        }, g.prototype._manageStamp = u, g.prototype._getElementOffset = function (t) {
            var e = t.getBoundingClientRect(), i = this._boundingRect, n = d(t), o = {left: e.left - i.left - n.marginLeft, top: e.top - i.top - n.marginTop, right: i.right - e.right - n.marginRight, bottom: i.bottom - e.bottom - n.marginBottom};
            return o
        }, g.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, g.prototype.bindResize = function () {
            this.isResizeBound || (i.bind(t, "resize", this), this.isResizeBound = !0)
        }, g.prototype.unbindResize = function () {
            i.unbind(t, "resize", this), this.isResizeBound = !1
        }, g.prototype.onresize = function () {
            function t() {
                e.resize(), delete e.resizeTimeout
            }

            this.resizeTimeout && clearTimeout(this.resizeTimeout);
            var e = this;
            this.resizeTimeout = setTimeout(t, 100)
        }, g.prototype.resize = function () {
            var t = d(this.element), e = this.size && t;
            e && t.innerWidth === this.size.innerWidth || this.layout()
        }, g.prototype.addItems = function (t) {
            var e = this._itemize(t);
            return e.length && (this.items = this.items.concat(e)), e
        }, g.prototype.appended = function (t) {
            var e = this.addItems(t);
            e.length && (this.layoutItems(e, !0), this.reveal(e))
        }, g.prototype.prepended = function (t) {
            var e = this._itemize(t);
            if (e.length) {
                var i = this.items.slice(0);
                this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
            }
        }, g.prototype.reveal = function (t) {
            var e = t && t.length;
            if (e)for (var i = 0; e > i; i++) {
                var n = t[i];
                n.reveal()
            }
        }, g.prototype.hide = function (t) {
            var e = t && t.length;
            if (e)for (var i = 0; e > i; i++) {
                var n = t[i];
                n.hide()
            }
        }, g.prototype.getItem = function (t) {
            for (var e = 0, i = this.items.length; i > e; e++) {
                var n = this.items[e];
                if (n.element === t)return n
            }
        }, g.prototype.getItems = function (t) {
            if (t && t.length) {
                for (var e = [], i = 0, n = t.length; n > i; i++) {
                    var o = t[i], r = this.getItem(o);
                    r && e.push(r)
                }
                return e
            }
        }, g.prototype.remove = function (t) {
            t = n(t);
            var e = this.getItems(t);
            if (e && e.length) {
                this._itemsOn(e, "remove", function () {
                    this.emitEvent("removeComplete", [this, e])
                });
                for (var i = 0, r = e.length; r > i; i++) {
                    var s = e[i];
                    s.remove(), o(s, this.items)
                }
            }
        }, g.prototype.destroy = function () {
            var t = this.element.style;
            t.height = "", t.position = "", t.width = "";
            for (var e = 0, i = this.items.length; i > e; e++) {
                var n = this.items[e];
                n.destroy()
            }
            this.unbindResize(), delete this.element.outlayerGUID, p && p.removeData(this.element, this.constructor.namespace)
        }, g.data = function (t) {
            var e = t && t.outlayerGUID;
            return e && x[e]
        }, g.create = function (t, i) {
            function n() {
                g.apply(this, arguments)
            }

            return Object.create ? n.prototype = Object.create(g.prototype) : e(n.prototype, g.prototype), n.prototype.constructor = n, m(n, "options"), e(n.prototype.options, i), n.namespace = t, n.data = g.data, n.Item = function () {
                y.apply(this, arguments)
            }, n.Item.prototype = new y, s(function () {
                for (var e = r(t), i = a.querySelectorAll(".js-" + e), o = "data-" + e + "-options", s = 0, u = i.length; u > s; s++) {
                    var c, f = i[s], d = f.getAttribute(o);
                    try {
                        c = d && JSON.parse(d)
                    } catch (l) {
                        h && h.error("Error parsing " + o + " on " + f.nodeName.toLowerCase() + (f.id ? "#" + f.id : "") + ": " + l);
                        continue
                    }
                    var y = new n(f, c);
                    p && p.data(f, t, y)
                }
            }), p && p.bridget && p.bridget(t, n), n
        }, g.Item = y, g
    }

    var a = t.document, h = t.console, p = t.jQuery, u = function () {
    }, c = Object.prototype.toString, f = "object" == typeof HTMLElement ? function (t) {
        return t instanceof HTMLElement
    } : function (t) {
        return t && "object" == typeof t && 1 === t.nodeType && "string" == typeof t.nodeName
    }, d = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, n = t.length; n > i; i++)if (t[i] === e)return i;
        return-1
    };
    "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "doc-ready/doc-ready", "eventEmitter/EventEmitter", "get-size/get-size", "matches-selector/matches-selector", "./item"], s) : t.Outlayer = s(t.eventie, t.docReady, t.EventEmitter, t.getSize, t.matchesSelector, t.Outlayer.Item)
}(window), function (t) {
    function e() {
        function t(e) {
            for (var i in t.defaults)this[i] = t.defaults[i];
            for (i in e)this[i] = e[i]
        }

        return i.Rect = t, t.defaults = {x: 0, y: 0, width: 0, height: 0}, t.prototype.contains = function (t) {
            var e = t.width || 0, i = t.height || 0;
            return this.x <= t.x && this.y <= t.y && this.x + this.width >= t.x + e && this.y + this.height >= t.y + i
        }, t.prototype.overlaps = function (t) {
            var e = this.x + this.width, i = this.y + this.height, n = t.x + t.width, o = t.y + t.height;
            return n > this.x && e > t.x && o > this.y && i > t.y
        }, t.prototype.getMaximalFreeRects = function (e) {
            if (!this.overlaps(e))return!1;
            var i, n = [], o = this.x + this.width, r = this.y + this.height, s = e.x + e.width, a = e.y + e.height;
            return this.y < e.y && (i = new t({x: this.x, y: this.y, width: this.width, height: e.y - this.y}), n.push(i)), o > s && (i = new t({x: s, y: this.y, width: o - s, height: this.height}), n.push(i)), r > a && (i = new t({x: this.x, y: a, width: this.width, height: r - a}), n.push(i)), this.x < e.x && (i = new t({x: this.x, y: this.y, width: e.x - this.x, height: this.height}), n.push(i)), n
        }, t.prototype.canFit = function (t) {
            return this.width >= t.width && this.height >= t.height
        }, t
    }

    var i = t.Packery = function () {
    };
    "function" == typeof define && define.amd ? define("packery/js/rect", e) : (t.Packery = t.Packery || {}, t.Packery.Rect = e())
}(window), function (t) {
    function e(t) {
        function e(t, e, i) {
            this.width = t || 0, this.height = e || 0, this.sortDirection = i || "downwardLeftToRight", this.reset()
        }

        e.prototype.reset = function () {
            this.spaces = [], this.newSpaces = [];
            var e = new t({x: 0, y: 0, width: this.width, height: this.height});
            this.spaces.push(e), this.sorter = i[this.sortDirection] || i.downwardLeftToRight
        }, e.prototype.pack = function (t) {
            for (var e = 0, i = this.spaces.length; i > e; e++) {
                var n = this.spaces[e];
                if (n.canFit(t)) {
                    this.placeInSpace(t, n);
                    break
                }
            }
        }, e.prototype.placeInSpace = function (t, e) {
            t.x = e.x, t.y = e.y, this.placed(t)
        }, e.prototype.placed = function (t) {
            for (var i = [], n = 0, o = this.spaces.length; o > n; n++) {
                var r = this.spaces[n], s = r.getMaximalFreeRects(t);
                s ? i.push.apply(i, s) : i.push(r)
            }
            this.spaces = i, e.mergeRects(this.spaces), this.spaces.sort(this.sorter)
        }, e.mergeRects = function (t) {
            for (var e = 0, i = t.length; i > e; e++) {
                var n = t[e];
                if (n) {
                    var o = t.slice(0);
                    o.splice(e, 1);
                    for (var r = 0, s = 0, a = o.length; a > s; s++) {
                        var h = o[s], p = e > s ? 0 : 1;
                        n.contains(h) && (t.splice(s + p - r, 1), r++)
                    }
                }
            }
            return t
        };
        var i = {downwardLeftToRight: function (t, e) {
            return t.y - e.y || t.x - e.x
        }, rightwardTopToBottom: function (t, e) {
            return t.x - e.x || t.y - e.y
        }};
        return e
    }

    if ("function" == typeof define && define.amd)define("packery/js/packer", ["./rect"], e); else {
        var i = t.Packery = t.Packery || {};
        i.Packer = e(i.Rect)
    }
}(window), function (t) {
    function e(t, e, i) {
        var n = t("transform"), o = function () {
            e.Item.apply(this, arguments)
        };
        o.prototype = new e.Item;
        var r = o.prototype._create;
        return o.prototype._create = function () {
            r.call(this), this.rect = new i, this.placeRect = new i
        }, o.prototype.dragStart = function () {
            this.getPosition(), this.removeTransitionStyles(), this.isTransitioning && n && (this.element.style[n] = "none"), this.getSize(), this.isPlacing = !0, this.needsPositioning = !1, this.positionPlaceRect(this.position.x, this.position.y), this.isTransitioning = !1, this.didDrag = !1
        }, o.prototype.dragMove = function (t, e) {
            this.didDrag = !0;
            var i = this.layout.size;
            t -= i.paddingLeft, e -= i.paddingTop, this.positionPlaceRect(t, e)
        }, o.prototype.dragStop = function () {
            this.getPosition();
            var t = this.position.x !== this.placeRect.x, e = this.position.y !== this.placeRect.y;
            this.needsPositioning = t || e, this.didDrag = !1
        }, o.prototype.positionPlaceRect = function (t, e, i) {
            this.placeRect.x = this.getPlaceRectCoord(t, !0), this.placeRect.y = this.getPlaceRectCoord(e, !1, i)
        }, o.prototype.getPlaceRectCoord = function (t, e, i) {
            var n = e ? "Width" : "Height", o = this.size["outer" + n], r = this.layout[e ? "columnWidth" : "rowHeight"], s = this.layout.size["inner" + n];
            e || (s = Math.max(s, this.layout.maxY), this.layout.rowHeight || (s -= this.layout.gutter));
            var a;
            if (r) {
                r += this.layout.gutter, s += e ? this.layout.gutter : 0, t = Math.round(t / r);
                var h;
                h = this.layout.options.isHorizontal ? e ? "ceil" : "floor" : e ? "floor" : "ceil";
                var p = Math[h](s / r);
                p -= Math.ceil(o / r), a = p
            } else a = s - o;
            return t = i ? t : Math.min(t, a), t *= r || 1, Math.max(0, t)
        }, o.prototype.copyPlaceRectPosition = function () {
            this.rect.x = this.placeRect.x, this.rect.y = this.placeRect.y
        }, o
    }

    "function" == typeof define && define.amd ? define("packery/js/item", ["get-style-property/get-style-property", "outlayer/outlayer", "./rect"], e) : t.Packery.Item = e(t.getStyleProperty, t.Outlayer, t.Packery.Rect)
}(window), function (t) {
    function e(t, e, i, n, o, r) {
        function s(t, e) {
            return t.position.y - e.position.y || t.position.x - e.position.x
        }

        function a(t, e) {
            return t.position.x - e.position.x || t.position.y - e.position.y
        }

        var h = i.create("packery");
        return h.Item = r, h.prototype._create = function () {
            i.prototype._create.call(this), this.packer = new o, this.stamp(this.options.stamped);
            var t = this;
            this.handleDraggabilly = {dragStart: function (e) {
                t.itemDragStart(e.element)
            }, dragMove: function (e) {
                t.itemDragMove(e.element, e.position.x, e.position.y)
            }, dragEnd: function (e) {
                t.itemDragEnd(e.element)
            }}, this.handleUIDraggable = {start: function (e) {
                t.itemDragStart(e.currentTarget)
            }, drag: function (e, i) {
                t.itemDragMove(e.currentTarget, i.position.left, i.position.top)
            }, stop: function (e) {
                t.itemDragEnd(e.currentTarget)
            }}
        }, h.prototype._resetLayout = function () {
            this.getSize(), this._getMeasurements();
            var t = this.packer;
            this.options.isHorizontal ? (t.width = Number.POSITIVE_INFINITY, t.height = this.size.innerHeight + this.gutter, t.sortDirection = "rightwardTopToBottom") : (t.width = this.size.innerWidth + this.gutter, t.height = Number.POSITIVE_INFINITY, t.sortDirection = "downwardLeftToRight"), t.reset(), this.maxY = 0, this.maxX = 0
        }, h.prototype._getMeasurements = function () {
            this._getMeasurement("columnWidth", "width"), this._getMeasurement("rowHeight", "height"), this._getMeasurement("gutter", "width")
        }, h.prototype._getItemLayoutPosition = function (t) {
            return this._packItem(t), t.rect
        }, h.prototype._packItem = function (t) {
            this._setRectSize(t.element, t.rect), this.packer.pack(t.rect), this._setMaxXY(t.rect)
        }, h.prototype._setMaxXY = function (t) {
            this.maxX = Math.max(t.x + t.width, this.maxX), this.maxY = Math.max(t.y + t.height, this.maxY)
        }, h.prototype._setRectSize = function (t, i) {
            var n = e(t), o = n.outerWidth, r = n.outerHeight, s = this.columnWidth + this.gutter, a = this.rowHeight + this.gutter;
            o = this.columnWidth ? Math.ceil(o / s) * s : o + this.gutter, r = this.rowHeight ? Math.ceil(r / a) * a : r + this.gutter, i.width = Math.min(o, this.packer.width), i.height = r
        }, h.prototype._getContainerSize = function () {
            return this.options.isHorizontal ? {width: this.maxX - this.gutter} : {height: this.maxY - this.gutter}
        }, h.prototype._manageStamp = function (t) {
            var e, i = this.getItem(t);
            if (i && i.isPlacing)e = i.placeRect; else {
                var o = this._getElementOffset(t);
                e = new n({x: this.options.isOriginLeft ? o.left : o.right, y: this.options.isOriginTop ? o.top : o.bottom})
            }
            this._setRectSize(t, e), this.packer.placed(e), this._setMaxXY(e)
        }, h.prototype.sortItemsByPosition = function () {
            var t = this.options.isHorizontal ? a : s;
            this.items.sort(t)
        }, h.prototype.fit = function (t, e, i) {
            var n = this.getItem(t);
            n && (this._getMeasurements(), this.stamp(n.element), n.getSize(), n.isPlacing = !0, e = void 0 === e ? n.rect.x : e, i = void 0 === i ? n.rect.y : i, n.positionPlaceRect(e, i, !0), this._bindFitEvents(n), n.moveTo(n.placeRect.x, n.placeRect.y), this.layout(), this.unstamp(n.element), this.sortItemsByPosition(), n.isPlacing = !1, n.copyPlaceRectPosition())
        }, h.prototype._bindFitEvents = function (t) {
            function e() {
                n++, 2 === n && i.emitEvent("fitComplete", [i, t])
            }

            var i = this, n = 0;
            t.on("layout", function () {
                return e(), !0
            }), this.on("layoutComplete", function () {
                return e(), !0
            })
        }, h.prototype.resize = function () {
            var t = e(this.element), i = this.size && t, n = this.options.isHorizontal ? "innerHeight" : "innerWidth";
            i && t[n] === this.size[n] || this.layout()
        }, h.prototype.itemDragStart = function (t) {
            this.stamp(t);
            var e = this.getItem(t);
            e && e.dragStart()
        }, h.prototype.itemDragMove = function (t, e, i) {
            function n() {
                r.layout(), delete r.dragTimeout
            }

            var o = this.getItem(t);
            o && o.dragMove(e, i);
            var r = this;
            this.clearDragTimeout(), this.dragTimeout = setTimeout(n, 40)
        }, h.prototype.clearDragTimeout = function () {
            this.dragTimeout && clearTimeout(this.dragTimeout)
        }, h.prototype.itemDragEnd = function (e) {
            var i, n = this.getItem(e);
            if (n && (i = n.didDrag, n.dragStop()), !n || !i && !n.needsPositioning)return this.unstamp(e), void 0;
            t.add(n.element, "is-positioning-post-drag");
            var o = this._getDragEndLayoutComplete(e, n);
            n.needsPositioning ? (n.on("layout", o), n.moveTo(n.placeRect.x, n.placeRect.y)) : n && n.copyPlaceRectPosition(), this.clearDragTimeout(), this.on("layoutComplete", o), this.layout()
        }, h.prototype._getDragEndLayoutComplete = function (e, i) {
            var n = i && i.needsPositioning, o = 0, r = n ? 2 : 1, s = this;
            return function () {
                return o++, o !== r ? !0 : (i && (t.remove(i.element, "is-positioning-post-drag"), i.isPlacing = !1, i.copyPlaceRectPosition()), s.unstamp(e), s.sortItemsByPosition(), n && s.emitEvent("dragItemPositioned", [s, i]), !0)
            }
        }, h.prototype.bindDraggabillyEvents = function (t) {
            t.on("dragStart", this.handleDraggabilly.dragStart), t.on("dragMove", this.handleDraggabilly.dragMove), t.on("dragEnd", this.handleDraggabilly.dragEnd)
        }, h.prototype.bindUIDraggableEvents = function (t) {
            t.on("dragstart", this.handleUIDraggable.start).on("drag", this.handleUIDraggable.drag).on("dragstop", this.handleUIDraggable.stop)
        }, h.Rect = n, h.Packer = o, h
    }

    "function" == typeof define && define.amd ? define('packery',["classie/classie", "get-size/get-size", "outlayer/outlayer", "packery/js/rect", "packery/js/packer", "packery/js/item"], e) : t.Packery = e(t.classie, t.getSize, t.Outlayer, t.Packery.Rect, t.Packery.Packer, t.Packery.Item)
}(window);

/*!
 * Draggabilly PACKAGED v1.1.0
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 * MIT license
 */

(function (t) {
    function e(t) {
        return RegExp("(^|\\s+)" + t + "(\\s+|$)")
    }

    function n(t, e) {
        var n = i(t, e) ? r : o;
        n(t, e)
    }

    var i, o, r;
    "classList"in document.documentElement ? (i = function (t, e) {
        return t.classList.contains(e)
    }, o = function (t, e) {
        t.classList.add(e)
    }, r = function (t, e) {
        t.classList.remove(e)
    }) : (i = function (t, n) {
        return e(n).test(t.className)
    }, o = function (t, e) {
        i(t, e) || (t.className = t.className + " " + e)
    }, r = function (t, n) {
        t.className = t.className.replace(e(n), " ")
    });
    var s = {hasClass: i, addClass: o, removeClass: r, toggleClass: n, has: i, add: o, remove: r, toggle: n};
    "function" == typeof define && define.amd ? define("classie/classie", s) : t.classie = s
})(window), function () {
    function t() {
    }

    function e(t, e) {
        for (var n = t.length; n--;)if (t[n].listener === e)return n;
        return-1
    }

    function n(t) {
        return function () {
            return this[t].apply(this, arguments)
        }
    }

    var i = t.prototype, o = this, r = o.EventEmitter;
    i.getListeners = function (t) {
        var e, n, i = this._getEvents();
        if (t instanceof RegExp) {
            e = {};
            for (n in i)i.hasOwnProperty(n) && t.test(n) && (e[n] = i[n])
        } else e = i[t] || (i[t] = []);
        return e
    }, i.flattenListeners = function (t) {
        var e, n = [];
        for (e = 0; t.length > e; e += 1)n.push(t[e].listener);
        return n
    }, i.getListenersAsObject = function (t) {
        var e, n = this.getListeners(t);
        return n instanceof Array && (e = {}, e[t] = n), e || n
    }, i.addListener = function (t, n) {
        var i, o = this.getListenersAsObject(t), r = "object" == typeof n;
        for (i in o)o.hasOwnProperty(i) && -1 === e(o[i], n) && o[i].push(r ? n : {listener: n, once: !1});
        return this
    }, i.on = n("addListener"), i.addOnceListener = function (t, e) {
        return this.addListener(t, {listener: e, once: !0})
    }, i.once = n("addOnceListener"), i.defineEvent = function (t) {
        return this.getListeners(t), this
    }, i.defineEvents = function (t) {
        for (var e = 0; t.length > e; e += 1)this.defineEvent(t[e]);
        return this
    }, i.removeListener = function (t, n) {
        var i, o, r = this.getListenersAsObject(t);
        for (o in r)r.hasOwnProperty(o) && (i = e(r[o], n), -1 !== i && r[o].splice(i, 1));
        return this
    }, i.off = n("removeListener"), i.addListeners = function (t, e) {
        return this.manipulateListeners(!1, t, e)
    }, i.removeListeners = function (t, e) {
        return this.manipulateListeners(!0, t, e)
    }, i.manipulateListeners = function (t, e, n) {
        var i, o, r = t ? this.removeListener : this.addListener, s = t ? this.removeListeners : this.addListeners;
        if ("object" != typeof e || e instanceof RegExp)for (i = n.length; i--;)r.call(this, e, n[i]); else for (i in e)e.hasOwnProperty(i) && (o = e[i]) && ("function" == typeof o ? r.call(this, i, o) : s.call(this, i, o));
        return this
    }, i.removeEvent = function (t) {
        var e, n = typeof t, i = this._getEvents();
        if ("string" === n)delete i[t]; else if (t instanceof RegExp)for (e in i)i.hasOwnProperty(e) && t.test(e) && delete i[e]; else delete this._events;
        return this
    }, i.removeAllListeners = n("removeEvent"), i.emitEvent = function (t, e) {
        var n, i, o, r, s = this.getListenersAsObject(t);
        for (o in s)if (s.hasOwnProperty(o))for (i = s[o].length; i--;)n = s[o][i], n.once === !0 && this.removeListener(t, n.listener), r = n.listener.apply(this, e || []), r === this._getOnceReturnValue() && this.removeListener(t, n.listener);
        return this
    }, i.trigger = n("emitEvent"), i.emit = function (t) {
        var e = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(t, e)
    }, i.setOnceReturnValue = function (t) {
        return this._onceReturnValue = t, this
    }, i._getOnceReturnValue = function () {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, i._getEvents = function () {
        return this._events || (this._events = {})
    }, t.noConflict = function () {
        return o.EventEmitter = r, t
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
        return t
    }) : "object" == typeof module && module.exports ? module.exports = t : this.EventEmitter = t
}.call(this), function (t) {
    function e(e) {
        var n = t.event;
        return n.target = n.target || n.srcElement || e, n
    }

    var n = document.documentElement, i = function () {
    };
    n.addEventListener ? i = function (t, e, n) {
        t.addEventListener(e, n, !1)
    } : n.attachEvent && (i = function (t, n, i) {
        t[n + i] = i.handleEvent ? function () {
            var n = e(t);
            i.handleEvent.call(i, n)
        } : function () {
            var n = e(t);
            i.call(t, n)
        }, t.attachEvent("on" + n, t[n + i])
    });
    var o = function () {
    };
    n.removeEventListener ? o = function (t, e, n) {
        t.removeEventListener(e, n, !1)
    } : n.detachEvent && (o = function (t, e, n) {
        t.detachEvent("on" + e, t[e + n]);
        try {
            delete t[e + n]
        } catch (i) {
            t[e + n] = void 0
        }
    });
    var r = {bind: i, unbind: o};
    "function" == typeof define && define.amd ? define("eventie/eventie", r) : "object" == typeof exports ? module.exports = r : t.eventie = r
}(this), function (t) {
    function e(t) {
        if (t) {
            if ("string" == typeof i[t])return t;
            t = t.charAt(0).toUpperCase() + t.slice(1);
            for (var e, o = 0, r = n.length; r > o; o++)if (e = n[o] + t, "string" == typeof i[e])return e
        }
    }

    var n = "Webkit Moz ms Ms O".split(" "), i = document.documentElement.style;
    "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function () {
        return e
    }) : "object" == typeof exports ? module.exports = e : t.getStyleProperty = e
}(window), function (t) {
    function e(t) {
        var e = parseFloat(t), n = -1 === t.indexOf("%") && !isNaN(e);
        return n && e
    }

    function n() {
        for (var t = {width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0}, e = 0, n = s.length; n > e; e++) {
            var i = s[e];
            t[i] = 0
        }
        return t
    }

    function i(t) {
        function i(t) {
            if ("string" == typeof t && (t = document.querySelector(t)), t && "object" == typeof t && t.nodeType) {
                var i = r(t);
                if ("none" === i.display)return n();
                var o = {};
                o.width = t.offsetWidth, o.height = t.offsetHeight;
                for (var d = o.isBorderBox = !(!u || !i[u] || "border-box" !== i[u]), p = 0, c = s.length; c > p; p++) {
                    var f = s[p], l = i[f];
                    l = a(t, l);
                    var g = parseFloat(l);
                    o[f] = isNaN(g) ? 0 : g
                }
                var v = o.paddingLeft + o.paddingRight, m = o.paddingTop + o.paddingBottom, y = o.marginLeft + o.marginRight, E = o.marginTop + o.marginBottom, x = o.borderLeftWidth + o.borderRightWidth, b = o.borderTopWidth + o.borderBottomWidth, L = d && h, P = e(i.width);
                P !== !1 && (o.width = P + (L ? 0 : v + x));
                var S = e(i.height);
                return S !== !1 && (o.height = S + (L ? 0 : m + b)), o.innerWidth = o.width - (v + x), o.innerHeight = o.height - (m + b), o.outerWidth = o.width + y, o.outerHeight = o.height + E, o
            }
        }

        function a(t, e) {
            if (o || -1 === e.indexOf("%"))return e;
            var n = t.style, i = n.left, r = t.runtimeStyle, s = r && r.left;
            return s && (r.left = t.currentStyle.left), n.left = e, e = n.pixelLeft, n.left = i, s && (r.left = s), e
        }

        var h, u = t("boxSizing");
        return function () {
            if (u) {
                var t = document.createElement("div");
                t.style.width = "200px", t.style.padding = "1px 2px 3px 4px", t.style.borderStyle = "solid", t.style.borderWidth = "1px 2px 3px 4px", t.style[u] = "border-box";
                var n = document.body || document.documentElement;
                n.appendChild(t);
                var i = r(t);
                h = 200 === e(i.width), n.removeChild(t)
            }
        }(), i
    }

    var o = t.getComputedStyle, r = o ? function (t) {
        return o(t, null)
    } : function (t) {
        return t.currentStyle
    }, s = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
    "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], i) : "object" == typeof exports ? module.exports = i(require("get-style-property")) : t.getSize = i(t.getStyleProperty)
}(window), function (t) {
    function e(t, e) {
        for (var n in e)t[n] = e[n];
        return t
    }

    function n() {
    }

    function i(i, o, s, u, d) {
        function c(t, n) {
            this.element = "string" == typeof t ? r.querySelector(t) : t, this.options = e({}, this.options), e(this.options, n), this._create()
        }

        function f() {
            return!1
        }

        function l(t, e) {
            t.x = void 0 !== e.pageX ? e.pageX : e.clientX, t.y = void 0 !== e.pageY ? e.pageY : e.clientY
        }

        function g(t, e, n) {
            return n = n || "round", e ? Math[n](t / e) * e : t
        }

        var v = u("transform"), m = !!u("perspective");
        e(c.prototype, o.prototype), c.prototype.options = {}, c.prototype._create = function () {
            this.position = {}, this._getPosition(), this.startPoint = {x: 0, y: 0}, this.dragPoint = {x: 0, y: 0}, this.startPosition = e({}, this.position);
            var t = a(this.element);
            "relative" !== t.position && "absolute" !== t.position && (this.element.style.position = "relative"), this.enable(), this.setHandles()
        }, c.prototype.setHandles = function () {
            this.handles = this.options.handle ? this.element.querySelectorAll(this.options.handle) : [this.element];
            for (var e = 0, n = this.handles.length; n > e; e++) {
                var i = this.handles[e];
                t.navigator.pointerEnabled ? (s.bind(i, "pointerdown", this), i.style.touchAction = "none") : t.navigator.msPointerEnabled ? (s.bind(i, "MSPointerDown", this), i.style.msTouchAction = "none") : (s.bind(i, "mousedown", this), s.bind(i, "touchstart", this), E(i))
            }
        };
        var y = "attachEvent"in r.documentElement, E = y ? function (t) {
            "IMG" === t.nodeName && (t.ondragstart = f);
            for (var e = t.querySelectorAll("img"), n = 0, i = e.length; i > n; n++) {
                var o = e[n];
                o.ondragstart = f
            }
        } : n;
        c.prototype._getPosition = function () {
            var t = a(this.element), e = parseInt(t.left, 10), n = parseInt(t.top, 10);
            this.position.x = isNaN(e) ? 0 : e, this.position.y = isNaN(n) ? 0 : n, this._addTransformPosition(t)
        }, c.prototype._addTransformPosition = function (t) {
            if (v) {
                var e = t[v];
                if (0 === e.indexOf("matrix")) {
                    var n = e.split(","), i = 0 === e.indexOf("matrix3d") ? 12 : 4, o = parseInt(n[i], 10), r = parseInt(n[i + 1], 10);
                    this.position.x += o, this.position.y += r
                }
            }
        }, c.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, c.prototype.getTouch = function (t) {
            for (var e = 0, n = t.length; n > e; e++) {
                var i = t[e];
                if (i.identifier === this.pointerIdentifier)return i
            }
        }, c.prototype.onmousedown = function (t) {
            var e = t.button;
            e && 0 !== e && 1 !== e || this.dragStart(t, t)
        }, c.prototype.ontouchstart = function (t) {
            this.isDragging || this.dragStart(t, t.changedTouches[0])
        }, c.prototype.onMSPointerDown = c.prototype.onpointerdown = function (t) {
            this.isDragging || this.dragStart(t, t)
        };
        var x = {mousedown: ["mousemove", "mouseup"], touchstart: ["touchmove", "touchend", "touchcancel"], pointerdown: ["pointermove", "pointerup", "pointercancel"], MSPointerDown: ["MSPointerMove", "MSPointerUp", "MSPointerCancel"]};
        c.prototype.dragStart = function (e, n) {
            this.isEnabled && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, this.pointerIdentifier = void 0 !== n.pointerId ? n.pointerId : n.identifier, this._getPosition(), this.measureContainment(), l(this.startPoint, n), this.startPosition.x = this.position.x, this.startPosition.y = this.position.y, this.setLeftTop(), this.dragPoint.x = 0, this.dragPoint.y = 0, this._bindEvents({events: x[e.type], node: e.preventDefault ? t : r}), i.add(this.element, "is-dragging"), this.isDragging = !0, this.emitEvent("dragStart", [this, e, n]), this.animate())
        }, c.prototype._bindEvents = function (t) {
            for (var e = 0, n = t.events.length; n > e; e++) {
                var i = t.events[e];
                s.bind(t.node, i, this)
            }
            this._boundEvents = t
        }, c.prototype._unbindEvents = function () {
            var t = this._boundEvents;
            if (t && t.events) {
                for (var e = 0, n = t.events.length; n > e; e++) {
                    var i = t.events[e];
                    s.unbind(t.node, i, this)
                }
                delete this._boundEvents
            }
        }, c.prototype.measureContainment = function () {
            var t = this.options.containment;
            if (t) {
                this.size = d(this.element);
                var e = this.element.getBoundingClientRect(), n = h(t) ? t : "string" == typeof t ? r.querySelector(t) : this.element.parentNode;
                this.containerSize = d(n);
                var i = n.getBoundingClientRect();
                this.relativeStartPosition = {x: e.left - i.left, y: e.top - i.top}
            }
        }, c.prototype.onmousemove = function (t) {
            this.dragMove(t, t)
        }, c.prototype.onMSPointerMove = c.prototype.onpointermove = function (t) {
            t.pointerId === this.pointerIdentifier && this.dragMove(t, t)
        }, c.prototype.ontouchmove = function (t) {
            var e = this.getTouch(t.changedTouches);
            e && this.dragMove(t, e)
        }, c.prototype.dragMove = function (t, e) {
            l(this.dragPoint, e);
            var n = this.dragPoint.x - this.startPoint.x, i = this.dragPoint.y - this.startPoint.y, o = this.options.grid, r = o && o[0], s = o && o[1];
            n = g(n, r), i = g(i, s), n = this.containDrag("x", n, r), i = this.containDrag("y", i, s), n = "y" === this.options.axis ? 0 : n, i = "x" === this.options.axis ? 0 : i, this.position.x = this.startPosition.x + n, this.position.y = this.startPosition.y + i, this.dragPoint.x = n, this.dragPoint.y = i, this.emitEvent("dragMove", [this, t, e])
        }, c.prototype.containDrag = function (t, e, n) {
            if (!this.options.containment)return e;
            var i = "x" === t ? "width" : "height", o = this.relativeStartPosition[t], r = g(-o, n, "ceil"), s = this.containerSize[i] - o - this.size[i];
            return s = g(s, n, "floor"), Math.min(s, Math.max(r, e))
        }, c.prototype.onmouseup = function (t) {
            this.dragEnd(t, t)
        }, c.prototype.onMSPointerUp = c.prototype.onpointerup = function (t) {
            t.pointerId === this.pointerIdentifier && this.dragEnd(t, t)
        }, c.prototype.ontouchend = function (t) {
            var e = this.getTouch(t.changedTouches);
            e && this.dragEnd(t, e)
        }, c.prototype.dragEnd = function (t, e) {
            this.isDragging = !1, delete this.pointerIdentifier, v && (this.element.style[v] = "", this.setLeftTop()), this._unbindEvents(), i.remove(this.element, "is-dragging"), this.emitEvent("dragEnd", [this, t, e])
        }, c.prototype.onMSPointerCancel = c.prototype.onpointercancel = function (t) {
            t.pointerId === this.pointerIdentifier && this.dragEnd(t, t)
        }, c.prototype.ontouchcancel = function (t) {
            var e = this.getTouch(t.changedTouches);
            this.dragEnd(t, e)
        }, c.prototype.animate = function () {
            if (this.isDragging) {
                this.positionDrag();
                var t = this;
                p(function () {
                    t.animate()
                })
            }
        };
        var b = m ? function (t, e) {
            return"translate3d( " + t + "px, " + e + "px, 0)"
        } : function (t, e) {
            return"translate( " + t + "px, " + e + "px)"
        };
        return c.prototype.setLeftTop = function () {
            this.element.style.left = this.position.x + "px", this.element.style.top = this.position.y + "px"
        }, c.prototype.positionDrag = v ? function () {
            this.element.style[v] = b(this.dragPoint.x, this.dragPoint.y)
        } : c.prototype.setLeftTop, c.prototype.enable = function () {
            this.isEnabled = !0
        }, c.prototype.disable = function () {
            this.isEnabled = !1, this.isDragging && this.dragEnd()
        }, c
    }

    for (var o, r = t.document, s = r.defaultView, a = s && s.getComputedStyle ? function (t) {
        return s.getComputedStyle(t, null)
    } : function (t) {
        return t.currentStyle
    }, h = "object" == typeof HTMLElement ? function (t) {
        return t instanceof HTMLElement
    } : function (t) {
        return t && "object" == typeof t && 1 === t.nodeType && "string" == typeof t.nodeName
    }, u = 0, d = "webkit moz ms o".split(" "), p = t.requestAnimationFrame, c = t.cancelAnimationFrame, f = 0; d.length > f && (!p || !c); f++)o = d[f], p = p || t[o + "RequestAnimationFrame"], c = c || t[o + "CancelAnimationFrame"] || t[o + "CancelRequestAnimationFrame"];
    p && c || (p = function (e) {
        var n = (new Date).getTime(), i = Math.max(0, 16 - (n - u)), o = t.setTimeout(function () {
            e(n + i)
        }, i);
        return u = n + i, o
    }, c = function (e) {
        t.clearTimeout(e)
    }), "function" == typeof define && define.amd ? define('draggabilly',["classie/classie", "eventEmitter/EventEmitter", "eventie/eventie", "get-style-property/get-style-property", "get-size/get-size"], i) : t.Draggabilly = i(t.classie, t.EventEmitter, t.eventie, t.getStyleProperty, t.getSize)
}(window);

/*global define*/

define('structures/Fx-fluid-grid',[
    'jquery',
    'widgets/Fx-widgets-commons',
    'packery',
    'draggabilly'
], function ($, W_Commons, Packery, Draggabilly) {

    var o = { },
        defaultOptions = {
            css: {
                FIT: "fit"
            }};

    var pckry, w_Commons;

    function Fx_Fluid_Grid() {
        w_Commons = new W_Commons();
    }

    Fx_Fluid_Grid.prototype.resize = function (item) {

        var $item = $(item);

        if ($item.hasClass(o.css.FIT)) {
            $item.removeClass(o.css.FIT);
            pckry.layout();
        } else {
            $item.addClass(o.css.FIT);
            pckry.fit($item.get(0));
        }

        return $item.get(0);

    };

    Fx_Fluid_Grid.prototype.addItem = function (item) {
        var self = this;

        // append elements to container
        o.container.appendChild(item);
        // add and lay out newly appended elements
        pckry.appended(item);

        var draggie = new Draggabilly(item, o.drag);
        // bind Draggabilly events to Packery
        pckry.bindDraggabillyEvents(draggie);

        pckry.layout();

        setTimeout(function () {
            pckry.layout();
        }, 100);

    };

    Fx_Fluid_Grid.prototype.removeItem = function (item) {

        // remove clicked element
        pckry.remove(item);
        // layout remaining item elements
        pckry.layout();
    };

    Fx_Fluid_Grid.prototype.initStructure = function () {

        pckry = new Packery(o.container, o.config);

        var itemElems = pckry.getItemElements();

        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            // make element draggable with Draggabilly
            var draggie = new Draggabilly(elem, o.drag);
            // bind Draggabilly events to Packery
            pckry.bindDraggabillyEvents(draggie);
        }
    };

    Fx_Fluid_Grid.prototype.preValidation = function () {

        if (!w_Commons.isElement(o.container)) {
            throw new Error("Fluid Grid: IVALID_CONTAINER.")
        }

        if (!o.hasOwnProperty("config")) {
            throw new Error("Fluid Grid: NO CONFIG")
        }

        if (!o.drag.hasOwnProperty("handle")) {
            throw new Error("Fluid Grid: NO HANDLER SELECTOR")
        }

    };

    Fx_Fluid_Grid.prototype.render = function (options) {
        var self = this;
        $.extend(o, options);

        self.preValidation();
        self.initStructure();

    };

    Fx_Fluid_Grid.prototype.init = function (options) {
        $.extend(o, defaultOptions);
        $.extend(o, options);

    };

    return Fx_Fluid_Grid;

});

/*global define */

define('widgets/bridge/Fx-catalog-bridge',[
    "jquery",
    "widgets/Fx-widgets-commons"
], function ($, W_Commons) {

    var o = { },
        defaultOptions = {
            error_prefix: "Fx_catalog_bridge ERROR: ",
            url: 'http://hqlprfenixapp2.hq.un.fao.org:4242/catalog/search',
            events: {
                END : "end.query.catalog.fx",
                EMPTY_RESPONSE: "empty_response.query.catalog.fx"
            }
        }, w_commons;

    function Fx_catalog_bridge() {
        w_commons = new W_Commons();
    }

    Fx_catalog_bridge.prototype.init = function (options) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, options);

        return $(this);
    };

    Fx_catalog_bridge.prototype.query = function (src, callback, context) {
        var plugin;

        if (!window.Fx_catalog_bridge_plugins || typeof window.Fx_catalog_bridge_plugins !== "object") {
            throw new Error(o.error_prefix + " Fx_catalog_bridge_plugins plugins repository not valid.");
        } else {
            plugin = window.Fx_catalog_bridge_plugins[src.getName()];
        }

        if (!plugin) {
            throw new Error(o.error_prefix + " plugin not found.")
        }

        if (typeof plugin.init !== "function") {
            throw new Error(o.error_prefix + " plugin for " + src.getName() + " does not have a public init() method.");
        } else {
            plugin.init({component: src});
        }

        if (typeof callback !== "function") {
            throw new Error(o.error_prefix + " callback param is not a function");
        } else {

            //Ask the plugin the filter, make the request and pass data to callback()
            $.ajax({
                url: o.url,
                type: 'post',
                contentType: 'application/json',
                dataType: 'json',
                success: function (response, textStatus, jqXHR ) {

                    if(jqXHR.status !== 204){

                        if (context) {
                            $.proxy(callback, context, response)();
                        } else {
                            callback(response)
                        }

                    } else {
                        w_commons.raiseCustomEvent(
                            document.body,
                            o.events.EMPTY_RESPONSE,
                            { }
                        );
                    }

                },
                data: JSON.stringify(plugin.getFilter()),
                complete: function(){
                    w_commons.raiseCustomEvent(
                        document.body,
                        o.events.END,
                        { }
                    );
                }
            });
        }
    };

    return Fx_catalog_bridge;

});


define('text!html/fx_result_fragments.html',[],function () { return '<div>\n\n    <div class="fenix-result row">\n\n        <div class="fx_result_icon col-lg-1">\n            <img id="fx_result_icon_img" src=\'css/img/database60.png\' class="img-responsive img-rounded"\n                 alt="Result icon">\n        </div>\n\n        <div class="fx_result_description col-lg-9">\n            <div class="fx_result_description_title"> HI I am the title</div>\n            <div class="fx_result_description_source"> CountrySTAT</div>\n            <div class="fx_result_description_geograficalarea"> Guimea-Bissau</div>\n            <div class="fx_result_description_baseperiod"> from 2010 to 2013</div>\n        </div>\n\n        <div class="col-lg-2">\n            <!-- Modal launcher -->\n            <button class="btn btn-default btn-block" data-toggle="modal" data-target="#myModal">\n                Extended Metadata\n            </button>\n            <button class="btn btn-default btn-block btn-to-analyze" >\n                Analyze\n            </button>\n\n\n        </div>\n\n    </div>\n\n</div>';});

define('widgets/results/renderers/Fx-result-renderer-dataset',["jquery", "text!html/fx_result_fragments.html"], function ($, template) {

    var o = { };
    //Default Result options
    var defaultOptions = {
        s_result: ".fenix-result",
        s_desc_title: ".fx_result_description_title",
        s_desc_source: ".fx_result_description_source",
        s_desc_geo: ".fx_result_description_geograficalarea",
        s_desc_period: ".fx_result_description_baseperiod",
        error_prefix: "FENIX Result dataset creation error: "

    };
    var $result;

    function Fx_catalog_result_render_dataset(options) {
        $.extend(o, options);
    }

    Fx_catalog_result_render_dataset.prototype.initText = function () {

        $result.find(o.s_desc_title).html(o.name);
        $result.find(o.s_desc_source).html(o.source);
        $result.find(o.s_desc_geo).html(o.metadata.geographicExtent.title['EN']);
        //$result.find( o.s_desc_period ).html("from " + new Date(o.metadata.basePeriod.from).getFullYear() +" to " + new Date(o.metadata.basePeriod.to).getFullYear());

    };

    Fx_catalog_result_render_dataset.prototype.initModal = function () {

        $result.find("#myModalLabel").html(o.name);

    };

    Fx_catalog_result_render_dataset.prototype.initBtns = function () {

        $result.find(".btn-to-analyze").on('click', function () {
            document.location.href = "http://fenixapps.fao.org/repository/fenix/analysis.html?lang=EN";
        });

    };

    Fx_catalog_result_render_dataset.prototype.getHtml = function () {

        var self = this;

        //Merge options
        $.extend(o, defaultOptions);

        $result = $(template).find(o.s_result);
        if ($result.length === 0) {
            throw new Error(o.error_prefix + "HTML fragment not found");
        }
        $result.addClass("dataset");

        self.initText();
        self.initModal();
        self.initBtns();

        return $result.get(0);

/*        //Check callback is a function
        if (callback && typeof callback === "function") {
            callback($result);
        }
        else { *//*throw new Error( o.error_prefix + "getHtml() #1 param is not a function");*//*
        }*/
    };

    return Fx_catalog_result_render_dataset;

});

define('widgets/results/renderers/Fx-result-renderer-layer',["jquery", "text!html/fx_result_fragments.html"], function ($, template) {

    var o = { };
    //Default Result options
    var defaultOptions = {
        s_result: ".fenix-result",
        s_desc_title: ".fx_result_description_title",
        s_desc_source: ".fx_result_description_source",
        s_desc_geo: ".fx_result_description_geograficalarea",
        s_desc_period: ".fx_result_description_baseperiod",
        s_icon: "#fx_result_icon_img",
        error_prefix: "FENIX Result layer creation error: "
    };
    var $result;

    function Fx_catalog_result_renderer_layer(options) {
        $.extend(o, options);
    }

    Fx_catalog_result_renderer_layer.prototype.initText = function () {

        $result.find(o.s_desc_title).html(o.source.name);
        $result.find(o.s_desc_source).html(o.source.source);

        $result.find(o.s_desc_geo).html(o.source.metadata.geographicExtent.title['EN']);
        $result.find(o.s_desc_period).html("from " + new Date(o.source.metadata.basePeriod.from).getFullYear() + " to " + new Date(o.source.metadata.basePeriod.to).getFullYear());

    };

    Fx_catalog_result_renderer_layer.prototype.initModal = function () {

        $result.find("#myModalLabel").html(o.source.name);

    };

    Fx_catalog_result_renderer_layer.prototype.getHtml = function (callback) {

        //Merge options
        extend(o, defaultOptions);

        $result = $(template).find(o.s_result);
        if ($result.length === 0) {
            throw new Error(o.error_prefix + "HTML fragment not found");
        }

        $result.addClass("layer");
        $result.find(o.s_icon).attr("src", "css/img/mind_map60.png");

        $.initText();
        $.initModal();

        //Check callback is a function
        if (callback && typeof callback === "function") {
            callback($result);
        }
        else {
            throw new Error(o.error_prefix + "getHtml() #1 param is not a function");
        }

    };

    return Fx_catalog_result_renderer_layer;

});

define('widgets/results/Fx-catalog-results-generator',["widgets/results/renderers/Fx-result-renderer-dataset",
    "widgets/results/renderers/Fx-result-renderer-layer"], function (Dataset, Layer) {

    function Fx_catalog_results_generator() {
    }

    Fx_catalog_results_generator.prototype.getInstance = function (options) {

        switch (options.resourceType.toUpperCase()) {
            case "DATASET" :
                return new Dataset(options).getHtml();
                break;
            case "CODELIST" :
                //return new Fenix_catalog_result_codelist( options );
                break;
            case "LAYER" :
                return new Layer(options).getHtml();
                break;
        }
    };

    return Fx_catalog_results_generator;

});

/*global define */

define('controller/Fx-catalog-results',[
    'widgets/results/Fx-catalog-results-generator'
], function (ResultGenerator) {

    function ResultsController() {

        this.resultGenerator = new ResultGenerator();
    }

    //(injected)
    ResultsController.prototype.grid = undefined;

    //(injected)
    ResultsController.prototype.resultsRenderer = undefined;

    ResultsController.prototype.renderComponents = function () {
        this.grid.render();
    };

    ResultsController.prototype.preValidation = function () {
        var self = this;

        if (!self.grid) {
            throw new Error("ResultsController: INVALID GRID ITEM.")
        }
        if (!self.resultsRenderer) {
            throw new Error("ResultsController: INVALID RENDER ITEM.")
        }
    };

    ResultsController.prototype.render = function () {
        var self = this;

        self.preValidation();
        self.renderComponents();
    };

    ResultsController.prototype.addItems = function (response) {

        this.grid.clear();

        if (response) {
            var items = response.resources;

            for (var i = 0; i < items.length; i++) {
                this.grid.addItems(this.resultGenerator.getInstance(items[i]));
            }
        }

    };

    ResultsController.prototype.clear = function () {
        this.grid.clear();
    };

    return ResultsController;

});

/*!
 * Isotope PACKAGED v2.0.0
 * Filter & sort magical layouts
 * http://isotope.metafizzy.co
 */

(function (t) {
    function e() {
    }

    function i(t) {
        function i(e) {
            e.prototype.option || (e.prototype.option = function (e) {
                t.isPlainObject(e) && (this.options = t.extend(!0, this.options, e))
            })
        }

        function n(e, i) {
            t.fn[e] = function (n) {
                if ("string" == typeof n) {
                    for (var s = o.call(arguments, 1), a = 0, u = this.length; u > a; a++) {
                        var p = this[a], h = t.data(p, e);
                        if (h)if (t.isFunction(h[n]) && "_" !== n.charAt(0)) {
                            var f = h[n].apply(h, s);
                            if (void 0 !== f)return f
                        } else r("no such method '" + n + "' for " + e + " instance"); else r("cannot call methods on " + e + " prior to initialization; " + "attempted to call '" + n + "'")
                    }
                    return this
                }
                return this.each(function () {
                    var o = t.data(this, e);
                    o ? (o.option(n), o._init()) : (o = new i(this, n), t.data(this, e, o))
                })
            }
        }

        if (t) {
            var r = "undefined" == typeof console ? e : function (t) {
                console.error(t)
            };
            return t.bridget = function (t, e) {
                i(e), n(t, e)
            }, t.bridget
        }
    }

    var o = Array.prototype.slice;
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], i) : i(t.jQuery)
})(window), function (t) {
    function e(e) {
        var i = t.event;
        return i.target = i.target || i.srcElement || e, i
    }

    var i = document.documentElement, o = function () {
    };
    i.addEventListener ? o = function (t, e, i) {
        t.addEventListener(e, i, !1)
    } : i.attachEvent && (o = function (t, i, o) {
        t[i + o] = o.handleEvent ? function () {
            var i = e(t);
            o.handleEvent.call(o, i)
        } : function () {
            var i = e(t);
            o.call(t, i)
        }, t.attachEvent("on" + i, t[i + o])
    });
    var n = function () {
    };
    i.removeEventListener ? n = function (t, e, i) {
        t.removeEventListener(e, i, !1)
    } : i.detachEvent && (n = function (t, e, i) {
        t.detachEvent("on" + e, t[e + i]);
        try {
            delete t[e + i]
        } catch (o) {
            t[e + i] = void 0
        }
    });
    var r = {bind: o, unbind: n};
    "function" == typeof define && define.amd ? define("eventie/eventie", r) : "object" == typeof exports ? module.exports = r : t.eventie = r
}(this), function (t) {
    function e(t) {
        "function" == typeof t && (e.isReady ? t() : r.push(t))
    }

    function i(t) {
        var i = "readystatechange" === t.type && "complete" !== n.readyState;
        if (!e.isReady && !i) {
            e.isReady = !0;
            for (var o = 0, s = r.length; s > o; o++) {
                var a = r[o];
                a()
            }
        }
    }

    function o(o) {
        return o.bind(n, "DOMContentLoaded", i), o.bind(n, "readystatechange", i), o.bind(t, "load", i), e
    }

    var n = t.document, r = [];
    e.isReady = !1, "function" == typeof define && define.amd ? (e.isReady = "function" == typeof requirejs, define("doc-ready/doc-ready", ["eventie/eventie"], o)) : t.docReady = o(t.eventie)
}(this), function () {
    function t() {
    }

    function e(t, e) {
        for (var i = t.length; i--;)if (t[i].listener === e)return i;
        return-1
    }

    function i(t) {
        return function () {
            return this[t].apply(this, arguments)
        }
    }

    var o = t.prototype, n = this, r = n.EventEmitter;
    o.getListeners = function (t) {
        var e, i, o = this._getEvents();
        if (t instanceof RegExp) {
            e = {};
            for (i in o)o.hasOwnProperty(i) && t.test(i) && (e[i] = o[i])
        } else e = o[t] || (o[t] = []);
        return e
    }, o.flattenListeners = function (t) {
        var e, i = [];
        for (e = 0; t.length > e; e += 1)i.push(t[e].listener);
        return i
    }, o.getListenersAsObject = function (t) {
        var e, i = this.getListeners(t);
        return i instanceof Array && (e = {}, e[t] = i), e || i
    }, o.addListener = function (t, i) {
        var o, n = this.getListenersAsObject(t), r = "object" == typeof i;
        for (o in n)n.hasOwnProperty(o) && -1 === e(n[o], i) && n[o].push(r ? i : {listener: i, once: !1});
        return this
    }, o.on = i("addListener"), o.addOnceListener = function (t, e) {
        return this.addListener(t, {listener: e, once: !0})
    }, o.once = i("addOnceListener"), o.defineEvent = function (t) {
        return this.getListeners(t), this
    }, o.defineEvents = function (t) {
        for (var e = 0; t.length > e; e += 1)this.defineEvent(t[e]);
        return this
    }, o.removeListener = function (t, i) {
        var o, n, r = this.getListenersAsObject(t);
        for (n in r)r.hasOwnProperty(n) && (o = e(r[n], i), -1 !== o && r[n].splice(o, 1));
        return this
    }, o.off = i("removeListener"), o.addListeners = function (t, e) {
        return this.manipulateListeners(!1, t, e)
    }, o.removeListeners = function (t, e) {
        return this.manipulateListeners(!0, t, e)
    }, o.manipulateListeners = function (t, e, i) {
        var o, n, r = t ? this.removeListener : this.addListener, s = t ? this.removeListeners : this.addListeners;
        if ("object" != typeof e || e instanceof RegExp)for (o = i.length; o--;)r.call(this, e, i[o]); else for (o in e)e.hasOwnProperty(o) && (n = e[o]) && ("function" == typeof n ? r.call(this, o, n) : s.call(this, o, n));
        return this
    }, o.removeEvent = function (t) {
        var e, i = typeof t, o = this._getEvents();
        if ("string" === i)delete o[t]; else if (t instanceof RegExp)for (e in o)o.hasOwnProperty(e) && t.test(e) && delete o[e]; else delete this._events;
        return this
    }, o.removeAllListeners = i("removeEvent"), o.emitEvent = function (t, e) {
        var i, o, n, r, s = this.getListenersAsObject(t);
        for (n in s)if (s.hasOwnProperty(n))for (o = s[n].length; o--;)i = s[n][o], i.once === !0 && this.removeListener(t, i.listener), r = i.listener.apply(this, e || []), r === this._getOnceReturnValue() && this.removeListener(t, i.listener);
        return this
    }, o.trigger = i("emitEvent"), o.emit = function (t) {
        var e = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(t, e)
    }, o.setOnceReturnValue = function (t) {
        return this._onceReturnValue = t, this
    }, o._getOnceReturnValue = function () {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, o._getEvents = function () {
        return this._events || (this._events = {})
    }, t.noConflict = function () {
        return n.EventEmitter = r, t
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
        return t
    }) : "object" == typeof module && module.exports ? module.exports = t : this.EventEmitter = t
}.call(this), function (t) {
    function e(t) {
        if (t) {
            if ("string" == typeof o[t])return t;
            t = t.charAt(0).toUpperCase() + t.slice(1);
            for (var e, n = 0, r = i.length; r > n; n++)if (e = i[n] + t, "string" == typeof o[e])return e
        }
    }

    var i = "Webkit Moz ms Ms O".split(" "), o = document.documentElement.style;
    "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function () {
        return e
    }) : "object" == typeof exports ? module.exports = e : t.getStyleProperty = e
}(window), function (t) {
    function e(t) {
        var e = parseFloat(t), i = -1 === t.indexOf("%") && !isNaN(e);
        return i && e
    }

    function i() {
        for (var t = {width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0}, e = 0, i = s.length; i > e; e++) {
            var o = s[e];
            t[o] = 0
        }
        return t
    }

    function o(t) {
        function o(t) {
            if ("string" == typeof t && (t = document.querySelector(t)), t && "object" == typeof t && t.nodeType) {
                var o = r(t);
                if ("none" === o.display)return i();
                var n = {};
                n.width = t.offsetWidth, n.height = t.offsetHeight;
                for (var h = n.isBorderBox = !(!p || !o[p] || "border-box" !== o[p]), f = 0, c = s.length; c > f; f++) {
                    var d = s[f], l = o[d];
                    l = a(t, l);
                    var y = parseFloat(l);
                    n[d] = isNaN(y) ? 0 : y
                }
                var m = n.paddingLeft + n.paddingRight, g = n.paddingTop + n.paddingBottom, v = n.marginLeft + n.marginRight, _ = n.marginTop + n.marginBottom, I = n.borderLeftWidth + n.borderRightWidth, L = n.borderTopWidth + n.borderBottomWidth, z = h && u, S = e(o.width);
                S !== !1 && (n.width = S + (z ? 0 : m + I));
                var b = e(o.height);
                return b !== !1 && (n.height = b + (z ? 0 : g + L)), n.innerWidth = n.width - (m + I), n.innerHeight = n.height - (g + L), n.outerWidth = n.width + v, n.outerHeight = n.height + _, n
            }
        }

        function a(t, e) {
            if (n || -1 === e.indexOf("%"))return e;
            var i = t.style, o = i.left, r = t.runtimeStyle, s = r && r.left;
            return s && (r.left = t.currentStyle.left), i.left = e, e = i.pixelLeft, i.left = o, s && (r.left = s), e
        }

        var u, p = t("boxSizing");
        return function () {
            if (p) {
                var t = document.createElement("div");
                t.style.width = "200px", t.style.padding = "1px 2px 3px 4px", t.style.borderStyle = "solid", t.style.borderWidth = "1px 2px 3px 4px", t.style[p] = "border-box";
                var i = document.body || document.documentElement;
                i.appendChild(t);
                var o = r(t);
                u = 200 === e(o.width), i.removeChild(t)
            }
        }(), o
    }

    var n = t.getComputedStyle, r = n ? function (t) {
        return n(t, null)
    } : function (t) {
        return t.currentStyle
    }, s = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
    "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], o) : "object" == typeof exports ? module.exports = o(require("get-style-property")) : t.getSize = o(t.getStyleProperty)
}(window), function (t, e) {
    function i(t, e) {
        return t[a](e)
    }

    function o(t) {
        if (!t.parentNode) {
            var e = document.createDocumentFragment();
            e.appendChild(t)
        }
    }

    function n(t, e) {
        o(t);
        for (var i = t.parentNode.querySelectorAll(e), n = 0, r = i.length; r > n; n++)if (i[n] === t)return!0;
        return!1
    }

    function r(t, e) {
        return o(t), i(t, e)
    }

    var s, a = function () {
        if (e.matchesSelector)return"matchesSelector";
        for (var t = ["webkit", "moz", "ms", "o"], i = 0, o = t.length; o > i; i++) {
            var n = t[i], r = n + "MatchesSelector";
            if (e[r])return r
        }
    }();
    if (a) {
        var u = document.createElement("div"), p = i(u, "div");
        s = p ? i : r
    } else s = n;
    "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function () {
        return s
    }) : window.matchesSelector = s
}(this, Element.prototype), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        for (var e in t)return!1;
        return e = null, !0
    }

    function o(t) {
        return t.replace(/([A-Z])/g, function (t) {
            return"-" + t.toLowerCase()
        })
    }

    function n(t, n, r) {
        function a(t, e) {
            t && (this.element = t, this.layout = e, this.position = {x: 0, y: 0}, this._create())
        }

        var u = r("transition"), p = r("transform"), h = u && p, f = !!r("perspective"), c = {WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "otransitionend", transition: "transitionend"}[u], d = ["transform", "transition", "transitionDuration", "transitionProperty"], l = function () {
            for (var t = {}, e = 0, i = d.length; i > e; e++) {
                var o = d[e], n = r(o);
                n && n !== o && (t[o] = n)
            }
            return t
        }();
        e(a.prototype, t.prototype), a.prototype._create = function () {
            this._transn = {ingProperties: {}, clean: {}, onEnd: {}}, this.css({position: "absolute"})
        }, a.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, a.prototype.getSize = function () {
            this.size = n(this.element)
        }, a.prototype.css = function (t) {
            var e = this.element.style;
            for (var i in t) {
                var o = l[i] || i;
                e[o] = t[i]
            }
        }, a.prototype.getPosition = function () {
            var t = s(this.element), e = this.layout.options, i = e.isOriginLeft, o = e.isOriginTop, n = parseInt(t[i ? "left" : "right"], 10), r = parseInt(t[o ? "top" : "bottom"], 10);
            n = isNaN(n) ? 0 : n, r = isNaN(r) ? 0 : r;
            var a = this.layout.size;
            n -= i ? a.paddingLeft : a.paddingRight, r -= o ? a.paddingTop : a.paddingBottom, this.position.x = n, this.position.y = r
        }, a.prototype.layoutPosition = function () {
            var t = this.layout.size, e = this.layout.options, i = {};
            e.isOriginLeft ? (i.left = this.position.x + t.paddingLeft + "px", i.right = "") : (i.right = this.position.x + t.paddingRight + "px", i.left = ""), e.isOriginTop ? (i.top = this.position.y + t.paddingTop + "px", i.bottom = "") : (i.bottom = this.position.y + t.paddingBottom + "px", i.top = ""), this.css(i), this.emitEvent("layout", [this])
        };
        var y = f ? function (t, e) {
            return"translate3d(" + t + "px, " + e + "px, 0)"
        } : function (t, e) {
            return"translate(" + t + "px, " + e + "px)"
        };
        a.prototype._transitionTo = function (t, e) {
            this.getPosition();
            var i = this.position.x, o = this.position.y, n = parseInt(t, 10), r = parseInt(e, 10), s = n === this.position.x && r === this.position.y;
            if (this.setPosition(t, e), s && !this.isTransitioning)return this.layoutPosition(), void 0;
            var a = t - i, u = e - o, p = {}, h = this.layout.options;
            a = h.isOriginLeft ? a : -a, u = h.isOriginTop ? u : -u, p.transform = y(a, u), this.transition({to: p, onTransitionEnd: {transform: this.layoutPosition}, isCleaning: !0})
        }, a.prototype.goTo = function (t, e) {
            this.setPosition(t, e), this.layoutPosition()
        }, a.prototype.moveTo = h ? a.prototype._transitionTo : a.prototype.goTo, a.prototype.setPosition = function (t, e) {
            this.position.x = parseInt(t, 10), this.position.y = parseInt(e, 10)
        }, a.prototype._nonTransition = function (t) {
            this.css(t.to), t.isCleaning && this._removeStyles(t.to);
            for (var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)
        }, a.prototype._transition = function (t) {
            if (!parseFloat(this.layout.options.transitionDuration))return this._nonTransition(t), void 0;
            var e = this._transn;
            for (var i in t.onTransitionEnd)e.onEnd[i] = t.onTransitionEnd[i];
            for (i in t.to)e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
            if (t.from) {
                this.css(t.from);
                var o = this.element.offsetHeight;
                o = null
            }
            this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
        };
        var m = p && o(p) + ",opacity";
        a.prototype.enableTransition = function () {
            this.isTransitioning || (this.css({transitionProperty: m, transitionDuration: this.layout.options.transitionDuration}), this.element.addEventListener(c, this, !1))
        }, a.prototype.transition = a.prototype[u ? "_transition" : "_nonTransition"], a.prototype.onwebkitTransitionEnd = function (t) {
            this.ontransitionend(t)
        }, a.prototype.onotransitionend = function (t) {
            this.ontransitionend(t)
        };
        var g = {"-webkit-transform": "transform", "-moz-transform": "transform", "-o-transform": "transform"};
        a.prototype.ontransitionend = function (t) {
            if (t.target === this.element) {
                var e = this._transn, o = g[t.propertyName] || t.propertyName;
                if (delete e.ingProperties[o], i(e.ingProperties) && this.disableTransition(), o in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[o]), o in e.onEnd) {
                    var n = e.onEnd[o];
                    n.call(this), delete e.onEnd[o]
                }
                this.emitEvent("transitionEnd", [this])
            }
        }, a.prototype.disableTransition = function () {
            this.removeTransitionStyles(), this.element.removeEventListener(c, this, !1), this.isTransitioning = !1
        }, a.prototype._removeStyles = function (t) {
            var e = {};
            for (var i in t)e[i] = "";
            this.css(e)
        };
        var v = {transitionProperty: "", transitionDuration: ""};
        return a.prototype.removeTransitionStyles = function () {
            this.css(v)
        }, a.prototype.removeElem = function () {
            this.element.parentNode.removeChild(this.element), this.emitEvent("remove", [this])
        }, a.prototype.remove = function () {
            if (!u || !parseFloat(this.layout.options.transitionDuration))return this.removeElem(), void 0;
            var t = this;
            this.on("transitionEnd", function () {
                return t.removeElem(), !0
            }), this.hide()
        }, a.prototype.reveal = function () {
            delete this.isHidden, this.css({display: ""});
            var t = this.layout.options;
            this.transition({from: t.hiddenStyle, to: t.visibleStyle, isCleaning: !0})
        }, a.prototype.hide = function () {
            this.isHidden = !0, this.css({display: ""});
            var t = this.layout.options;
            this.transition({from: t.visibleStyle, to: t.hiddenStyle, isCleaning: !0, onTransitionEnd: {opacity: function () {
                this.isHidden && this.css({display: "none"})
            }}})
        }, a.prototype.destroy = function () {
            this.css({position: "", left: "", right: "", top: "", bottom: "", transition: "", transform: ""})
        }, a
    }

    var r = t.getComputedStyle, s = r ? function (t) {
        return r(t, null)
    } : function (t) {
        return t.currentStyle
    };
    "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property"], n) : (t.Outlayer = {}, t.Outlayer.Item = n(t.EventEmitter, t.getSize, t.getStyleProperty))
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        return"[object Array]" === f.call(t)
    }

    function o(t) {
        var e = [];
        if (i(t))e = t; else if (t && "number" == typeof t.length)for (var o = 0, n = t.length; n > o; o++)e.push(t[o]); else e.push(t);
        return e
    }

    function n(t, e) {
        var i = d(e, t);
        -1 !== i && e.splice(i, 1)
    }

    function r(t) {
        return t.replace(/(.)([A-Z])/g, function (t, e, i) {
            return e + "-" + i
        }).toLowerCase()
    }

    function s(i, s, f, d, l, y) {
        function m(t, i) {
            if ("string" == typeof t && (t = a.querySelector(t)), !t || !c(t))return u && u.error("Bad " + this.constructor.namespace + " element: " + t), void 0;
            this.element = t, this.options = e({}, this.constructor.defaults), this.option(i);
            var o = ++g;
            this.element.outlayerGUID = o, v[o] = this, this._create(), this.options.isInitLayout && this.layout()
        }

        var g = 0, v = {};
        return m.namespace = "outlayer", m.Item = y, m.defaults = {containerStyle: {position: "relative"}, isInitLayout: !0, isOriginLeft: !0, isOriginTop: !0, isResizeBound: !0, isResizingContainer: !0, transitionDuration: "0.4s", hiddenStyle: {opacity: 0, transform: "scale(0.001)"}, visibleStyle: {opacity: 1, transform: "scale(1)"}}, e(m.prototype, f.prototype), m.prototype.option = function (t) {
            e(this.options, t)
        }, m.prototype._create = function () {
            this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), e(this.element.style, this.options.containerStyle), this.options.isResizeBound && this.bindResize()
        }, m.prototype.reloadItems = function () {
            this.items = this._itemize(this.element.children)
        }, m.prototype._itemize = function (t) {
            for (var e = this._filterFindItemElements(t), i = this.constructor.Item, o = [], n = 0, r = e.length; r > n; n++) {
                var s = e[n], a = new i(s, this);
                o.push(a)
            }
            return o
        }, m.prototype._filterFindItemElements = function (t) {
            t = o(t);
            for (var e = this.options.itemSelector, i = [], n = 0, r = t.length; r > n; n++) {
                var s = t[n];
                if (c(s))if (e) {
                    l(s, e) && i.push(s);
                    for (var a = s.querySelectorAll(e), u = 0, p = a.length; p > u; u++)i.push(a[u])
                } else i.push(s)
            }
            return i
        }, m.prototype.getItemElements = function () {
            for (var t = [], e = 0, i = this.items.length; i > e; e++)t.push(this.items[e].element);
            return t
        }, m.prototype.layout = function () {
            this._resetLayout(), this._manageStamps();
            var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
            this.layoutItems(this.items, t), this._isLayoutInited = !0
        }, m.prototype._init = m.prototype.layout, m.prototype._resetLayout = function () {
            this.getSize()
        }, m.prototype.getSize = function () {
            this.size = d(this.element)
        }, m.prototype._getMeasurement = function (t, e) {
            var i, o = this.options[t];
            o ? ("string" == typeof o ? i = this.element.querySelector(o) : c(o) && (i = o), this[t] = i ? d(i)[e] : o) : this[t] = 0
        }, m.prototype.layoutItems = function (t, e) {
            t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
        }, m.prototype._getItemsForLayout = function (t) {
            for (var e = [], i = 0, o = t.length; o > i; i++) {
                var n = t[i];
                n.isIgnored || e.push(n)
            }
            return e
        }, m.prototype._layoutItems = function (t, e) {
            function i() {
                o.emitEvent("layoutComplete", [o, t])
            }

            var o = this;
            if (!t || !t.length)return i(), void 0;
            this._itemsOn(t, "layout", i);
            for (var n = [], r = 0, s = t.length; s > r; r++) {
                var a = t[r], u = this._getItemLayoutPosition(a);
                u.item = a, u.isInstant = e || a.isLayoutInstant, n.push(u)
            }
            this._processLayoutQueue(n)
        }, m.prototype._getItemLayoutPosition = function () {
            return{x: 0, y: 0}
        }, m.prototype._processLayoutQueue = function (t) {
            for (var e = 0, i = t.length; i > e; e++) {
                var o = t[e];
                this._positionItem(o.item, o.x, o.y, o.isInstant)
            }
        }, m.prototype._positionItem = function (t, e, i, o) {
            o ? t.goTo(e, i) : t.moveTo(e, i)
        }, m.prototype._postLayout = function () {
            this.resizeContainer()
        }, m.prototype.resizeContainer = function () {
            if (this.options.isResizingContainer) {
                var t = this._getContainerSize();
                t && (this._setContainerMeasure(t.width, !0), this._setContainerMeasure(t.height, !1))
            }
        }, m.prototype._getContainerSize = h, m.prototype._setContainerMeasure = function (t, e) {
            if (void 0 !== t) {
                var i = this.size;
                i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
            }
        }, m.prototype._itemsOn = function (t, e, i) {
            function o() {
                return n++, n === r && i.call(s), !0
            }

            for (var n = 0, r = t.length, s = this, a = 0, u = t.length; u > a; a++) {
                var p = t[a];
                p.on(e, o)
            }
        }, m.prototype.ignore = function (t) {
            var e = this.getItem(t);
            e && (e.isIgnored = !0)
        }, m.prototype.unignore = function (t) {
            var e = this.getItem(t);
            e && delete e.isIgnored
        }, m.prototype.stamp = function (t) {
            if (t = this._find(t)) {
                this.stamps = this.stamps.concat(t);
                for (var e = 0, i = t.length; i > e; e++) {
                    var o = t[e];
                    this.ignore(o)
                }
            }
        }, m.prototype.unstamp = function (t) {
            if (t = this._find(t))for (var e = 0, i = t.length; i > e; e++) {
                var o = t[e];
                n(o, this.stamps), this.unignore(o)
            }
        }, m.prototype._find = function (t) {
            return t ? ("string" == typeof t && (t = this.element.querySelectorAll(t)), t = o(t)) : void 0
        }, m.prototype._manageStamps = function () {
            if (this.stamps && this.stamps.length) {
                this._getBoundingRect();
                for (var t = 0, e = this.stamps.length; e > t; t++) {
                    var i = this.stamps[t];
                    this._manageStamp(i)
                }
            }
        }, m.prototype._getBoundingRect = function () {
            var t = this.element.getBoundingClientRect(), e = this.size;
            this._boundingRect = {left: t.left + e.paddingLeft + e.borderLeftWidth, top: t.top + e.paddingTop + e.borderTopWidth, right: t.right - (e.paddingRight + e.borderRightWidth), bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)}
        }, m.prototype._manageStamp = h, m.prototype._getElementOffset = function (t) {
            var e = t.getBoundingClientRect(), i = this._boundingRect, o = d(t), n = {left: e.left - i.left - o.marginLeft, top: e.top - i.top - o.marginTop, right: i.right - e.right - o.marginRight, bottom: i.bottom - e.bottom - o.marginBottom};
            return n
        }, m.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, m.prototype.bindResize = function () {
            this.isResizeBound || (i.bind(t, "resize", this), this.isResizeBound = !0)
        }, m.prototype.unbindResize = function () {
            this.isResizeBound && i.unbind(t, "resize", this), this.isResizeBound = !1
        }, m.prototype.onresize = function () {
            function t() {
                e.resize(), delete e.resizeTimeout
            }

            this.resizeTimeout && clearTimeout(this.resizeTimeout);
            var e = this;
            this.resizeTimeout = setTimeout(t, 100)
        }, m.prototype.resize = function () {
            this.isResizeBound && this.needsResizeLayout() && this.layout()
        }, m.prototype.needsResizeLayout = function () {
            var t = d(this.element), e = this.size && t;
            return e && t.innerWidth !== this.size.innerWidth
        }, m.prototype.addItems = function (t) {
            var e = this._itemize(t);
            return e.length && (this.items = this.items.concat(e)), e
        }, m.prototype.appended = function (t) {
            var e = this.addItems(t);
            e.length && (this.layoutItems(e, !0), this.reveal(e))
        }, m.prototype.prepended = function (t) {
            var e = this._itemize(t);
            if (e.length) {
                var i = this.items.slice(0);
                this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
            }
        }, m.prototype.reveal = function (t) {
            var e = t && t.length;
            if (e)for (var i = 0; e > i; i++) {
                var o = t[i];
                o.reveal()
            }
        }, m.prototype.hide = function (t) {
            var e = t && t.length;
            if (e)for (var i = 0; e > i; i++) {
                var o = t[i];
                o.hide()
            }
        }, m.prototype.getItem = function (t) {
            for (var e = 0, i = this.items.length; i > e; e++) {
                var o = this.items[e];
                if (o.element === t)return o
            }
        }, m.prototype.getItems = function (t) {
            if (t && t.length) {
                for (var e = [], i = 0, o = t.length; o > i; i++) {
                    var n = t[i], r = this.getItem(n);
                    r && e.push(r)
                }
                return e
            }
        }, m.prototype.remove = function (t) {
            t = o(t);
            var e = this.getItems(t);
            if (e && e.length) {
                this._itemsOn(e, "remove", function () {
                    this.emitEvent("removeComplete", [this, e])
                });
                for (var i = 0, r = e.length; r > i; i++) {
                    var s = e[i];
                    s.remove(), n(s, this.items)
                }
            }
        }, m.prototype.destroy = function () {
            var t = this.element.style;
            t.height = "", t.position = "", t.width = "";
            for (var e = 0, i = this.items.length; i > e; e++) {
                var o = this.items[e];
                o.destroy()
            }
            this.unbindResize(), delete this.element.outlayerGUID, p && p.removeData(this.element, this.constructor.namespace)
        }, m.data = function (t) {
            var e = t && t.outlayerGUID;
            return e && v[e]
        }, m.create = function (t, i) {
            function o() {
                m.apply(this, arguments)
            }

            return Object.create ? o.prototype = Object.create(m.prototype) : e(o.prototype, m.prototype), o.prototype.constructor = o, o.defaults = e({}, m.defaults), e(o.defaults, i), o.prototype.settings = {}, o.namespace = t, o.data = m.data, o.Item = function () {
                y.apply(this, arguments)
            }, o.Item.prototype = new y, s(function () {
                for (var e = r(t), i = a.querySelectorAll(".js-" + e), n = "data-" + e + "-options", s = 0, h = i.length; h > s; s++) {
                    var f, c = i[s], d = c.getAttribute(n);
                    try {
                        f = d && JSON.parse(d)
                    } catch (l) {
                        u && u.error("Error parsing " + n + " on " + c.nodeName.toLowerCase() + (c.id ? "#" + c.id : "") + ": " + l);
                        continue
                    }
                    var y = new o(c, f);
                    p && p.data(c, t, y)
                }
            }), p && p.bridget && p.bridget(t, o), o
        }, m.Item = y, m
    }

    var a = t.document, u = t.console, p = t.jQuery, h = function () {
    }, f = Object.prototype.toString, c = "object" == typeof HTMLElement ? function (t) {
        return t instanceof HTMLElement
    } : function (t) {
        return t && "object" == typeof t && 1 === t.nodeType && "string" == typeof t.nodeName
    }, d = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, o = t.length; o > i; i++)if (t[i] === e)return i;
        return-1
    };
    "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "doc-ready/doc-ready", "eventEmitter/EventEmitter", "get-size/get-size", "matches-selector/matches-selector", "./item"], s) : t.Outlayer = s(t.eventie, t.docReady, t.EventEmitter, t.getSize, t.matchesSelector, t.Outlayer.Item)
}(window), function (t) {
    function e(t) {
        function e() {
            t.Item.apply(this, arguments)
        }

        return e.prototype = new t.Item, e.prototype._create = function () {
            this.id = this.layout.itemGUID++, t.Item.prototype._create.call(this), this.sortData = {}
        }, e.prototype.updateSortData = function () {
            if (!this.isIgnored) {
                this.sortData.id = this.id, this.sortData["original-order"] = this.id, this.sortData.random = Math.random();
                var t = this.layout.options.getSortData, e = this.layout._sorters;
                for (var i in t) {
                    var o = e[i];
                    this.sortData[i] = o(this.element, this)
                }
            }
        }, e
    }

    "function" == typeof define && define.amd ? define("isotope/js/item", ["outlayer/outlayer"], e) : (t.Isotope = t.Isotope || {}, t.Isotope.Item = e(t.Outlayer))
}(window), function (t) {
    function e(t, e) {
        function i(t) {
            this.isotope = t, t && (this.options = t.options[this.namespace], this.element = t.element, this.items = t.filteredItems, this.size = t.size)
        }

        return function () {
            function t(t) {
                return function () {
                    return e.prototype[t].apply(this.isotope, arguments)
                }
            }

            for (var o = ["_resetLayout", "_getItemLayoutPosition", "_manageStamp", "_getContainerSize", "_getElementOffset", "needsResizeLayout"], n = 0, r = o.length; r > n; n++) {
                var s = o[n];
                i.prototype[s] = t(s)
            }
        }(), i.prototype.needsVerticalResizeLayout = function () {
            var e = t(this.isotope.element), i = this.isotope.size && e;
            return i && e.innerHeight !== this.isotope.size.innerHeight
        }, i.prototype._getMeasurement = function () {
            this.isotope._getMeasurement.apply(this, arguments)
        }, i.prototype.getColumnWidth = function () {
            this.getSegmentSize("column", "Width")
        }, i.prototype.getRowHeight = function () {
            this.getSegmentSize("row", "Height")
        }, i.prototype.getSegmentSize = function (t, e) {
            var i = t + e, o = "outer" + e;
            if (this._getMeasurement(i, o), !this[i]) {
                var n = this.getFirstItemSize();
                this[i] = n && n[o] || this.isotope.size["inner" + e]
            }
        }, i.prototype.getFirstItemSize = function () {
            var e = this.isotope.filteredItems[0];
            return e && e.element && t(e.element)
        }, i.prototype.layout = function () {
            this.isotope.layout.apply(this.isotope, arguments)
        }, i.prototype.getSize = function () {
            this.isotope.getSize(), this.size = this.isotope.size
        }, i.modes = {}, i.create = function (t, e) {
            function o() {
                i.apply(this, arguments)
            }

            return o.prototype = new i, e && (o.options = e), o.prototype.namespace = t, i.modes[t] = o, o
        }, i
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-mode", ["get-size/get-size", "outlayer/outlayer"], e) : (t.Isotope = t.Isotope || {}, t.Isotope.LayoutMode = e(t.getSize, t.Outlayer))
}(window), function (t) {
    function e(t, e) {
        var o = t.create("masonry");
        return o.prototype._resetLayout = function () {
            this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns();
            var t = this.cols;
            for (this.colYs = []; t--;)this.colYs.push(0);
            this.maxY = 0
        }, o.prototype.measureColumns = function () {
            if (this.getContainerWidth(), !this.columnWidth) {
                var t = this.items[0], i = t && t.element;
                this.columnWidth = i && e(i).outerWidth || this.containerWidth
            }
            this.columnWidth += this.gutter, this.cols = Math.floor((this.containerWidth + this.gutter) / this.columnWidth), this.cols = Math.max(this.cols, 1)
        }, o.prototype.getContainerWidth = function () {
            var t = this.options.isFitWidth ? this.element.parentNode : this.element, i = e(t);
            this.containerWidth = i && i.innerWidth
        }, o.prototype._getItemLayoutPosition = function (t) {
            t.getSize();
            var e = t.size.outerWidth % this.columnWidth, o = e && 1 > e ? "round" : "ceil", n = Math[o](t.size.outerWidth / this.columnWidth);
            n = Math.min(n, this.cols);
            for (var r = this._getColGroup(n), s = Math.min.apply(Math, r), a = i(r, s), u = {x: this.columnWidth * a, y: s}, p = s + t.size.outerHeight, h = this.cols + 1 - r.length, f = 0; h > f; f++)this.colYs[a + f] = p;
            return u
        }, o.prototype._getColGroup = function (t) {
            if (2 > t)return this.colYs;
            for (var e = [], i = this.cols + 1 - t, o = 0; i > o; o++) {
                var n = this.colYs.slice(o, o + t);
                e[o] = Math.max.apply(Math, n)
            }
            return e
        }, o.prototype._manageStamp = function (t) {
            var i = e(t), o = this._getElementOffset(t), n = this.options.isOriginLeft ? o.left : o.right, r = n + i.outerWidth, s = Math.floor(n / this.columnWidth);
            s = Math.max(0, s);
            var a = Math.floor(r / this.columnWidth);
            a -= r % this.columnWidth ? 0 : 1, a = Math.min(this.cols - 1, a);
            for (var u = (this.options.isOriginTop ? o.top : o.bottom) + i.outerHeight, p = s; a >= p; p++)this.colYs[p] = Math.max(u, this.colYs[p])
        }, o.prototype._getContainerSize = function () {
            this.maxY = Math.max.apply(Math, this.colYs);
            var t = {height: this.maxY};
            return this.options.isFitWidth && (t.width = this._getContainerFitWidth()), t
        }, o.prototype._getContainerFitWidth = function () {
            for (var t = 0, e = this.cols; --e && 0 === this.colYs[e];)t++;
            return(this.cols - t) * this.columnWidth - this.gutter
        }, o.prototype.needsResizeLayout = function () {
            var t = this.containerWidth;
            return this.getContainerWidth(), t !== this.containerWidth
        }, o
    }

    var i = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, o = t.length; o > i; i++) {
            var n = t[i];
            if (n === e)return i
        }
        return-1
    };
    "function" == typeof define && define.amd ? define("masonry/masonry", ["outlayer/outlayer", "get-size/get-size"], e) : t.Masonry = e(t.Outlayer, t.getSize)
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t, i) {
        var o = t.create("masonry"), n = o.prototype._getElementOffset, r = o.prototype.layout, s = o.prototype._getMeasurement;
        e(o.prototype, i.prototype), o.prototype._getElementOffset = n, o.prototype.layout = r, o.prototype._getMeasurement = s;
        var a = o.prototype.measureColumns;
        o.prototype.measureColumns = function () {
            this.items = this.isotope.filteredItems, a.call(this)
        };
        var u = o.prototype._manageStamp;
        return o.prototype._manageStamp = function () {
            this.options.isOriginLeft = this.isotope.options.isOriginLeft, this.options.isOriginTop = this.isotope.options.isOriginTop, u.apply(this, arguments)
        }, o
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/masonry", ["../layout-mode", "masonry/masonry"], i) : i(t.Isotope.LayoutMode, t.Masonry)
}(window), function (t) {
    function e(t) {
        var e = t.create("fitRows");
        return e.prototype._resetLayout = function () {
            this.x = 0, this.y = 0, this.maxY = 0
        }, e.prototype._getItemLayoutPosition = function (t) {
            t.getSize(), 0 !== this.x && t.size.outerWidth + this.x > this.isotope.size.innerWidth && (this.x = 0, this.y = this.maxY);
            var e = {x: this.x, y: this.y};
            return this.maxY = Math.max(this.maxY, this.y + t.size.outerHeight), this.x += t.size.outerWidth, e
        }, e.prototype._getContainerSize = function () {
            return{height: this.maxY}
        }, e
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/fit-rows", ["../layout-mode"], e) : e(t.Isotope.LayoutMode)
}(window), function (t) {
    function e(t) {
        var e = t.create("vertical", {horizontalAlignment: 0});
        return e.prototype._resetLayout = function () {
            this.y = 0
        }, e.prototype._getItemLayoutPosition = function (t) {
            t.getSize();
            var e = (this.isotope.size.innerWidth - t.size.outerWidth) * this.options.horizontalAlignment, i = this.y;
            return this.y += t.size.outerHeight, {x: e, y: i}
        }, e.prototype._getContainerSize = function () {
            return{height: this.y}
        }, e
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/vertical", ["../layout-mode"], e) : e(t.Isotope.LayoutMode)
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        return"[object Array]" === h.call(t)
    }

    function o(t) {
        var e = [];
        if (i(t))e = t; else if (t && "number" == typeof t.length)for (var o = 0, n = t.length; n > o; o++)e.push(t[o]); else e.push(t);
        return e
    }

    function n(t, e) {
        var i = f(e, t);
        -1 !== i && e.splice(i, 1)
    }

    function r(t, i, r, u, h) {
        function f(t, e) {
            return function (i, o) {
                for (var n = 0, r = t.length; r > n; n++) {
                    var s = t[n], a = i.sortData[s], u = o.sortData[s];
                    if (a > u || u > a) {
                        var p = void 0 !== e[s] ? e[s] : e, h = p ? 1 : -1;
                        return(a > u ? 1 : -1) * h
                    }
                }
                return 0
            }
        }

        var c = t.create("isotope", {layoutMode: "masonry", isJQueryFiltering: !0, sortAscending: !0});
        c.Item = u, c.LayoutMode = h, c.prototype._create = function () {
            this.itemGUID = 0, this._sorters = {}, this._getSorters(), t.prototype._create.call(this), this.modes = {}, this.filteredItems = this.items, this.sortHistory = ["original-order"];
            for (var e in h.modes)this._initLayoutMode(e)
        }, c.prototype.reloadItems = function () {
            this.itemGUID = 0, t.prototype.reloadItems.call(this)
        }, c.prototype._itemize = function () {
            for (var e = t.prototype._itemize.apply(this, arguments), i = 0, o = e.length; o > i; i++) {
                var n = e[i];
                n.id = this.itemGUID++
            }
            return this._updateItemsSortData(e), e
        }, c.prototype._initLayoutMode = function (t) {
            var i = h.modes[t], o = this.options[t] || {};
            this.options[t] = i.options ? e(i.options, o) : o, this.modes[t] = new i(this)
        }, c.prototype.layout = function () {
            return!this._isLayoutInited && this.options.isInitLayout ? (this.arrange(), void 0) : (this._layout(), void 0)
        }, c.prototype._layout = function () {
            var t = this._getIsInstant();
            this._resetLayout(), this._manageStamps(), this.layoutItems(this.filteredItems, t), this._isLayoutInited = !0
        }, c.prototype.arrange = function (t) {
            this.option(t), this._getIsInstant(), this.filteredItems = this._filter(this.items), this._sort(), this._layout()
        }, c.prototype._init = c.prototype.arrange, c.prototype._getIsInstant = function () {
            var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
            return this._isInstant = t, t
        }, c.prototype._filter = function (t) {
            function e() {
                f.reveal(n), f.hide(r)
            }

            var i = this.options.filter;
            i = i || "*";
            for (var o = [], n = [], r = [], s = this._getFilterTest(i), a = 0, u = t.length; u > a; a++) {
                var p = t[a];
                if (!p.isIgnored) {
                    var h = s(p);
                    h && o.push(p), h && p.isHidden ? n.push(p) : h || p.isHidden || r.push(p)
                }
            }
            var f = this;
            return this._isInstant ? this._noTransition(e) : e(), o
        }, c.prototype._getFilterTest = function (t) {
            return s && this.options.isJQueryFiltering ? function (e) {
                return s(e.element).is(t)
            } : "function" == typeof t ? function (e) {
                return t(e.element)
            } : function (e) {
                return r(e.element, t)
            }
        }, c.prototype.updateSortData = function (t) {
            this._getSorters(), t = o(t);
            var e = this.getItems(t);
            e = e.length ? e : this.items, this._updateItemsSortData(e)
        }, c.prototype._getSorters = function () {
            var t = this.options.getSortData;
            for (var e in t) {
                var i = t[e];
                this._sorters[e] = d(i)
            }
        }, c.prototype._updateItemsSortData = function (t) {
            for (var e = 0, i = t.length; i > e; e++) {
                var o = t[e];
                o.updateSortData()
            }
        };
        var d = function () {
            function t(t) {
                if ("string" != typeof t)return t;
                var i = a(t).split(" "), o = i[0], n = o.match(/^\[(.+)\]$/), r = n && n[1], s = e(r, o), u = c.sortDataParsers[i[1]];
                return t = u ? function (t) {
                    return t && u(s(t))
                } : function (t) {
                    return t && s(t)
                }
            }

            function e(t, e) {
                var i;
                return i = t ? function (e) {
                    return e.getAttribute(t)
                } : function (t) {
                    var i = t.querySelector(e);
                    return i && p(i)
                }
            }

            return t
        }();
        c.sortDataParsers = {parseInt: function (t) {
            return parseInt(t, 10)
        }, parseFloat: function (t) {
            return parseFloat(t)
        }}, c.prototype._sort = function () {
            var t = this.options.sortBy;
            if (t) {
                var e = [].concat.apply(t, this.sortHistory), i = f(e, this.options.sortAscending);
                this.filteredItems.sort(i), t !== this.sortHistory[0] && this.sortHistory.unshift(t)
            }
        }, c.prototype._mode = function () {
            var t = this.options.layoutMode, e = this.modes[t];
            if (!e)throw Error("No layout mode: " + t);
            return e.options = this.options[t], e
        }, c.prototype._resetLayout = function () {
            t.prototype._resetLayout.call(this), this._mode()._resetLayout()
        }, c.prototype._getItemLayoutPosition = function (t) {
            return this._mode()._getItemLayoutPosition(t)
        }, c.prototype._manageStamp = function (t) {
            this._mode()._manageStamp(t)
        }, c.prototype._getContainerSize = function () {
            return this._mode()._getContainerSize()
        }, c.prototype.needsResizeLayout = function () {
            return this._mode().needsResizeLayout()
        }, c.prototype.appended = function (t) {
            var e = this.addItems(t);
            if (e.length) {
                var i = this._filterRevealAdded(e);
                this.filteredItems = this.filteredItems.concat(i)
            }
        }, c.prototype.prepended = function (t) {
            var e = this._itemize(t);
            if (e.length) {
                var i = this.items.slice(0);
                this.items = e.concat(i), this._resetLayout(), this._manageStamps();
                var o = this._filterRevealAdded(e);
                this.layoutItems(i), this.filteredItems = o.concat(this.filteredItems)
            }
        }, c.prototype._filterRevealAdded = function (t) {
            var e = this._noTransition(function () {
                return this._filter(t)
            });
            return this.layoutItems(e, !0), this.reveal(e), t
        }, c.prototype.insert = function (t) {
            var e = this.addItems(t);
            if (e.length) {
                var i, o, n = e.length;
                for (i = 0; n > i; i++)o = e[i], this.element.appendChild(o.element);
                var r = this._filter(e);
                for (this._noTransition(function () {
                    this.hide(r)
                }), i = 0; n > i; i++)e[i].isLayoutInstant = !0;
                for (this.arrange(), i = 0; n > i; i++)delete e[i].isLayoutInstant;
                this.reveal(r)
            }
        };
        var l = c.prototype.remove;
        return c.prototype.remove = function (t) {
            t = o(t);
            var e = this.getItems(t);
            if (l.call(this, t), e && e.length)for (var i = 0, r = e.length; r > i; i++) {
                var s = e[i];
                n(s, this.filteredItems)
            }
        }, c.prototype._noTransition = function (t) {
            var e = this.options.transitionDuration;
            this.options.transitionDuration = 0;
            var i = t.call(this);
            return this.options.transitionDuration = e, i
        }, c
    }

    var s = t.jQuery, a = String.prototype.trim ? function (t) {
        return t.trim()
    } : function (t) {
        return t.replace(/^\s+|\s+$/g, "")
    }, u = document.documentElement, p = u.textContent ? function (t) {
        return t.textContent
    } : function (t) {
        return t.innerText
    }, h = Object.prototype.toString, f = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, o = t.length; o > i; i++)if (t[i] === e)return i;
        return-1
    };
    "function" == typeof define && define.amd ? define('isotope',["outlayer/outlayer", "get-size/get-size", "matches-selector/matches-selector", "isotope/js/item", "isotope/js/layout-mode", "isotope/js/layout-modes/masonry", "isotope/js/layout-modes/fit-rows", "isotope/js/layout-modes/vertical"], r) : t.Isotope = r(t.Outlayer, t.getSize, t.matchesSelector, t.Isotope.Item, t.Isotope.LayoutMode)
}(window);

/*global define*/

define('structures/Fx-filterable-grid',[
    'jquery',
    'widgets/Fx-widgets-commons',
    "isotope"
], function ($, W_Commons, Isotope) {

    var o = { },
        defaultOptions = {
            data_filter_value: "data-filter-value",
            css_filter_active: "catalog-filter-active"
        };

    var isotope, w_Commons;

    function Fx_Filterable_grid() {
        w_Commons = new W_Commons();
    }

    Fx_Filterable_grid.prototype.initBtns = function () {

        // filter items on button click
        $(o.filters).on('click', 'button', function (event) {
            this.filterIsotope({ filter: $(this).attr(o.data_filter_value) });
            $(o.filters).find(" button").removeClass(o.css_filter_active);
            $(this).addClass(o.css_filter_active);
        });

        $(o.filters).find("button[" + o.data_filter_value + "='*']").addClass(o.css_filter_active);

    };

    Fx_Filterable_grid.prototype.filter = function (filterValue) {

        $("button").removeClass(o.css_filter_active);
        $("button[" + o.data_filter_value + "='" + filterValue + "']").addClass(o.css_filter_active);
        this.filterIsotope({ filter: filterValue });
    };

    Fx_Filterable_grid.prototype.filterIsotope = function (filters) {
        isotope.arrange(filters);
    };

    Fx_Filterable_grid.prototype.clear = function () {
        isotope.remove(isotope.getItemElements());
        this.filter("*");
    };

    Fx_Filterable_grid.prototype.addItems = function (items) {

        o.container.appendChild(items);
        isotope.appended(items);
        isotope.layout();
    };

    Fx_Filterable_grid.prototype.validateOptions = function () {

        //Validate HTML Container
        if (!w_Commons.isElement(o.container)) {
            throw new Error("Filterable Grid: INVALID_CONTAINER.")
        }
    };

    Fx_Filterable_grid.prototype.render = function (options) {

        $.extend(o, options);

        this.validateOptions();

        isotope = new Isotope(o.container, o.isotope);

        if (o.filters) {
            this.initBtns();
        }
    };

    Fx_Filterable_grid.prototype.init = function (baseOptions) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, baseOptions);

    };

    Fx_Filterable_grid.prototype.clear = function () {

        var elements = isotope.getItemElements();

        for (var i = 0; i < elements.length; i++) {
            isotope.remove(elements[i])
        }

    };

    //Public API
    return Fx_Filterable_grid
});

/*!
 * stroll.js 1.2 - CSS scroll effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 *
 * Copyright (C) 2012 Hakim El Hattab, http://hakim.se
 */
(function(){

	

	// When a list is configured as 'live', this is how frequently
	// the DOM will be polled for changes
	var LIVE_INTERVAL = 500;

	var IS_TOUCH_DEVICE = !!( 'ontouchstart' in window );

	// All of the lists that are currently bound
	var lists = [];

	// Set to true when there are lists to refresh
	var active = false;

	/**
	 * Updates all currently bound lists.
	 */
	function refresh() {
		if( active ) {
			requestAnimFrame( refresh );

			for( var i = 0, len = lists.length; i < len; i++ ) {
				lists[i].update();
			}
		}
	}

	/**
	 * Starts monitoring a list and applies classes to each of
	 * its contained elements based on its position relative to
	 * the list's viewport.
	 *
	 * @param {HTMLElement} element
	 * @param {Object} options Additional arguments;
	 * 	- live; Flags if the DOM should be repeatedly checked for changes
	 * 			repeatedly. Useful if the list contents is changing. Use
	 * 			scarcely as it has an impact on performance.
	 */
	function add( element, options ) {
		// Only allow ul/ol
		if( !element.nodeName || /^(ul|li)$/i.test( element.nodeName ) === false ) {
			return false;
		}
		// Delete duplicates (but continue and re-bind this list to get the
		// latest properties and list items)
		else if( contains( element ) ) {
			remove( element );
		}

		var list = IS_TOUCH_DEVICE ? new TouchList( element ) : new List( element );

		// Handle options
		if( options && options.live ) {
			list.syncInterval = setInterval( function() {
				list.sync.call( list );
			}, LIVE_INTERVAL );
		}

		// Synchronize the list with the DOM
		list.sync();

		// Add this element to the collection
		lists.push( list );

		// Start refreshing if this was the first list to be added
		if( lists.length === 1 ) {
			active = true;
			refresh();
		}
	}

	/**
	 * Stops monitoring a list element and removes any classes
	 * that were applied to its list items.
	 *
	 * @param {HTMLElement} element
	 */
	function remove( element ) {
		for( var i = 0; i < lists.length; i++ ) {
			var list = lists[i];

			if( list.element == element ) {
				list.destroy();
				lists.splice( i, 1 );
				i--;
			}
		}

		// Stopped refreshing if the last list was removed
		if( lists.length === 0 ) {
			active = false;
		}
	}

	/**
	 * Checks if the specified element has already been bound.
	 */
	function contains( element ) {
		for( var i = 0, len = lists.length; i < len; i++ ) {
			if( lists[i].element == element ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Calls 'method' for each DOM element discovered in
	 * 'target'.
	 *
	 * @param target String selector / array of UL elements /
	 * jQuery object / single UL element
	 * @param method A function to call for each element target
	 */
	function batch( target, method, options ) {
		var i, len;

		// Selector
		if( typeof target === 'string' ) {
			var targets = document.querySelectorAll( target );

			for( i = 0, len = targets.length; i < len; i++ ) {
				method.call( null, targets[i], options );
			}
		}
		// Array (jQuery)
		else if( typeof target === 'object' && typeof target.length === 'number' ) {
			for( i = 0, len = target.length; i < len; i++ ) {
				method.call( null, target[i], options );
			}
		}
		// Single element
		else if( target.nodeName ) {
			method.call( null, target, options );
		}
		else {
			throw 'Stroll target was of unexpected type.';
		}
	}

	/**
	 * Checks if the client is capable of running the library.
	 */
	function isCapable() {
		return !!document.body.classList;
	}

	/**
	 * The basic type of list; applies past & future classes to
	 * list items based on scroll state.
	 */
	function List( element ) {
		this.element = element;
	}

	/**
	 * Fetches the latest properties from the DOM to ensure that
	 * this list is in sync with its contents.
	 */
	List.prototype.sync = function() {
		this.items = Array.prototype.slice.apply( this.element.children );

		// Caching some heights so we don't need to go back to the DOM so much
		this.listHeight = this.element.offsetHeight;

		// One loop to get the offsets from the DOM
		for( var i = 0, len = this.items.length; i < len; i++ ) {
			var item = this.items[i];
			item._offsetHeight = item.offsetHeight;
			item._offsetTop = item.offsetTop;
			item._offsetBottom = item._offsetTop + item._offsetHeight;
			item._state = '';
		}

		// Force an update
		this.update( true );
	}

	/**
	 * Apply past/future classes to list items outside of the viewport
	 */
	List.prototype.update = function( force ) {
		var scrollTop = this.element.pageYOffset || this.element.scrollTop,
			scrollBottom = scrollTop + this.listHeight;

		// Quit if nothing changed
		if( scrollTop !== this.lastTop || force ) {
			this.lastTop = scrollTop;

			// One loop to make our changes to the DOM
			for( var i = 0, len = this.items.length; i < len; i++ ) {
				var item = this.items[i];

				// Above list viewport
				if( item._offsetBottom < scrollTop ) {
					// Exclusion via string matching improves performance
					if( item._state !== 'past' ) {
						item._state = 'past';
						item.classList.add( 'past' );
						item.classList.remove( 'future' );
					}
				}
				// Below list viewport
				else if( item._offsetTop > scrollBottom ) {
					// Exclusion via string matching improves performance
					if( item._state !== 'future' ) {
						item._state = 'future';
						item.classList.add( 'future' );
						item.classList.remove( 'past' );
					}
				}
				// Inside of list viewport
				else if( item._state ) {
					if( item._state === 'past' ) item.classList.remove( 'past' );
					if( item._state === 'future' ) item.classList.remove( 'future' );
					item._state = '';
				}
			}
		}
	}

	/**
	 * Cleans up after this list and disposes of it.
	 */
	List.prototype.destroy = function() {
		clearInterval( this.syncInterval );

		for( var j = 0, len = this.items.length; j < len; j++ ) {
			var item = this.items[j];

			item.classList.remove( 'past' );
			item.classList.remove( 'future' );
		}
	}


	/**
	 * A list specifically for touch devices. Simulates the style
	 * of scrolling you'd see on a touch device but does not rely
	 * on webkit-overflow-scrolling since that makes it impossible
	 * to read the up-to-date scroll position.
	 */
	function TouchList( element ) {
		this.element = element;
		this.element.style.overflow = 'hidden';

		this.top = {
			value: 0,
			natural: 0
		};

		this.touch = {
			value: 0,
			offset: 0,
			start: 0,
			previous: 0,
			lastMove: Date.now(),
			accellerateTimeout: -1,
			isAccellerating: false,
			isActive: false
		};

		this.velocity = 0;
	}
	TouchList.prototype = new List();

	/**
	 * Fetches the latest properties from the DOM to ensure that
	 * this list is in sync with its contents. This is typically
	 * only used once (per list) at initialization.
	 */
	TouchList.prototype.sync = function() {
		this.items = Array.prototype.slice.apply( this.element.children );

		this.listHeight = this.element.offsetHeight;

		var item;

		// One loop to get the properties we need from the DOM
		for( var i = 0, len = this.items.length; i < len; i++ ) {
			item = this.items[i];
			item._offsetHeight = item.offsetHeight;
			item._offsetTop = item.offsetTop;
			item._offsetBottom = item._offsetTop + item._offsetHeight;
			item._state = '';

			// Animating opacity is a MAJOR performance hit on mobile so we can't allow it
			item.style.opacity = 1;
		}

		this.top.natural = this.element.scrollTop;
		this.top.value = this.top.natural;
		this.top.max = item._offsetBottom - this.listHeight;

		// Force an update
		this.update( true );

		this.bind();
	}

	/**
	 * Binds the events for this list. References to proxy methods
	 * are kept for unbinding if the list is disposed of.
	 */
	TouchList.prototype.bind = function() {
		var scope = this;

		this.touchStartDelegate = function( event ) {
			scope.onTouchStart( event );
		};

		this.touchMoveDelegate = function( event ) {
			scope.onTouchMove( event );
		};

		this.touchEndDelegate = function( event ) {
			scope.onTouchEnd( event );
		};

		this.element.addEventListener( 'touchstart', this.touchStartDelegate, false );
		this.element.addEventListener( 'touchmove', this.touchMoveDelegate, false );
		this.element.addEventListener( 'touchend', this.touchEndDelegate, false );
	}

	TouchList.prototype.onTouchStart = function( event ) {
		event.preventDefault();

		if( event.touches.length === 1 ) {
			this.touch.isActive = true;
			this.touch.start = event.touches[0].clientY;
			this.touch.previous = this.touch.start;
			this.touch.value = this.touch.start;
			this.touch.offset = 0;

			if( this.velocity ) {
				this.touch.isAccellerating = true;

				var scope = this;

				this.touch.accellerateTimeout = setTimeout( function() {
					scope.touch.isAccellerating = false;
					scope.velocity = 0;
				}, 500 );
			}
			else {
				this.velocity = 0;
			}
		}
	}

	TouchList.prototype.onTouchMove = function( event ) {
		if( event.touches.length === 1 ) {
			var previous = this.touch.value;

			this.touch.value = event.touches[0].clientY;
			this.touch.lastMove = Date.now();

			var sameDirection = ( this.touch.value > this.touch.previous && this.velocity < 0 )
								|| ( this.touch.value < this.touch.previous && this.velocity > 0 );

			if( this.touch.isAccellerating && sameDirection ) {
				clearInterval( this.touch.accellerateTimeout );

				// Increase velocity significantly
				this.velocity += ( this.touch.previous - this.touch.value ) / 10;
			}
			else {
				this.velocity = 0;

				this.touch.isAccellerating = false;
				this.touch.offset = Math.round( this.touch.start - this.touch.value );
			}

			this.touch.previous = previous;
		}
	}

	TouchList.prototype.onTouchEnd = function( event ) {
		var distanceMoved = this.touch.start - this.touch.value;

		if( !this.touch.isAccellerating ) {
			// Apply velocity based on the start position of the touch
			this.velocity = ( this.touch.start - this.touch.value ) / 10;
		}

		// Don't apply any velocity if the touch ended in a still state
		if( Date.now() - this.touch.lastMove > 200 || Math.abs( this.touch.previous - this.touch.value ) < 5 ) {
			this.velocity = 0;
		}

		this.top.value += this.touch.offset;

		// Reset the variables used to determne swipe speed
		this.touch.offset = 0;
		this.touch.start = 0;
		this.touch.value = 0;
		this.touch.isActive = false;
		this.touch.isAccellerating = false;

		clearInterval( this.touch.accellerateTimeout );

		// If a swipe was captured, prevent event propagation
		if( Math.abs( this.velocity ) > 4 || Math.abs( distanceMoved ) > 10 ) {
			event.preventDefault();
		}
	};

	/**
	 * Apply past/future classes to list items outside of the viewport
	 */
	TouchList.prototype.update = function( force ) {
		// Determine the desired scroll top position
		var scrollTop = this.top.value + this.velocity + this.touch.offset;

		// Only scroll the list if there's input
		if( this.velocity || this.touch.offset ) {
			// Scroll the DOM and add on the offset from touch
			this.element.scrollTop = scrollTop;

			// Keep the scroll value within bounds
			scrollTop = Math.max( 0, Math.min( this.element.scrollTop, this.top.max ) );

			// Cache the currently set scroll top and touch offset
			this.top.value = scrollTop - this.touch.offset;
		}

		// If there is no active touch, decay velocity
		if( !this.touch.isActive || this.touch.isAccellerating ) {
			this.velocity *= 0.95;
		}

		// Cut off early, the last fraction of velocity doesn't have
		// much impact on movement
		if( Math.abs( this.velocity ) < 0.15 ) {
			this.velocity = 0;
		}

		// Only proceed if the scroll position has changed
		if( scrollTop !== this.top.natural || force ) {
			this.top.natural = scrollTop;
			this.top.value = scrollTop - this.touch.offset;

			var scrollBottom = scrollTop + this.listHeight;

			// One loop to make our changes to the DOM
			for( var i = 0, len = this.items.length; i < len; i++ ) {
				var item = this.items[i];

				// Above list viewport
				if( item._offsetBottom < scrollTop ) {
					// Exclusion via string matching improves performance
					if( this.velocity <= 0 && item._state !== 'past' ) {
						item.classList.add( 'past' );
						item._state = 'past';
					}
				}
				// Below list viewport
				else if( item._offsetTop > scrollBottom ) {
					// Exclusion via string matching improves performance
					if( this.velocity >= 0 && item._state !== 'future' ) {
						item.classList.add( 'future' );
						item._state = 'future';
					}
				}
				// Inside of list viewport
				else if( item._state ) {
					if( item._state === 'past' ) item.classList.remove( 'past' );
					if( item._state === 'future' ) item.classList.remove( 'future' );
					item._state = '';
				}
			}
		}
	};

	/**
	 * Cleans up after this list and disposes of it.
	 */
	TouchList.prototype.destroy = function() {
		List.prototype.destroy.apply( this );

		this.element.removeEventListener( 'touchstart', this.touchStartDelegate, false );
		this.element.removeEventListener( 'touchmove', this.touchMoveDelegate, false );
		this.element.removeEventListener( 'touchend', this.touchEndDelegate, false );
	}


	/**
	 * Public API
	 */
	window.stroll = {
		/**
		 * Binds one or more lists for scroll effects.
		 *
		 * @see #add()
		 */
		bind: function( target, options ) {
			if( isCapable() ) {
				batch( target, add, options );
			}
		},

		/**
		 * Unbinds one or more lists from scroll effects.
		 *
		 * @see #remove()
		 */
		unbind: function( target ) {
			if( isCapable() ) {
				batch( target, remove );
			}
		}
	}

	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
	})()

})();

define("stroll", function(){});

/*global define*/

define('structures/Fx-crazy-grid',[
    'jquery',
    'widgets/Fx-widgets-commons',
    "stroll"
], function ($, W_Commons, Stroll) {

    var o = { },
        defaultOptions = {
            data_filter_value: "data-filter-value",
            css_filter_active: "catalog-filter-active"
        };

    var isotope, w_Commons;

    function loadCss(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    function Fx_Filterable_grid() {
        w_Commons = new W_Commons();
    }

    Fx_Filterable_grid.prototype.initBtns = function () {

        // filter items on button click
        $(o.filters).on('click', 'button', function (event) {
            this.filterIsotope({ filter: $(this).attr(o.data_filter_value) });
            $(o.filters).find(" button").removeClass(o.css_filter_active);
            $(this).addClass(o.css_filter_active);
        });

        $(o.filters).find("button[" + o.data_filter_value + "='*']").addClass(o.css_filter_active);

    };

    Fx_Filterable_grid.prototype.clear = function () {
        //TODO
    };

    Fx_Filterable_grid.prototype.addItems = function (items) {

        var li = document.createElement("LI");
            li.appendChild(items);
        document.querySelector("#crazy-scroll").appendChild(li);

    };

    Fx_Filterable_grid.prototype.validateOptions = function () {

        //Validate HTML Container
        if (!w_Commons.isElement(o.container)) {
            throw new Error("Filterable Grid: INVALID_CONTAINER.")
        }
    };

    Fx_Filterable_grid.prototype.render = function (options) {

        $.extend(o, options);

        this.validateOptions();

        // Makes stroll.js monitor changes to the DOM (like adding or resizing items).
        // This is taxing on performance, so use scarcely. Defaults to false.
        stroll.bind( "#crazy-scroll" , { live: true } );

        if (o.filters) {
            this.initBtns();
        }
    };

    Fx_Filterable_grid.prototype.init = function (baseOptions) {

        //Merge options
        $.extend(o, defaultOptions);
        $.extend(o, baseOptions);
        loadCss("css/stroll.css");
        loadCss("css/strollexample.css");


    };

    Fx_Filterable_grid.prototype.clear = function () {



    };

    //Public API
    return Fx_Filterable_grid
});

/*global define */

define('js/IndexContext',["catalog/controller/Fx-catalog-page",
        "controller/Fx-catalog-filter",
        "widgets/filter/Fx-catalog-collapsible-menu",
        "widgets/filter/Fx-catalog-modular-form",
        "widgets/filter/Fx-catalog-resume-bar",
        "structures/Fx-fluid-grid",
        "widgets/bridge/Fx-catalog-bridge",
        "controller/Fx-catalog-results",
        "widgets/results/Fx-catalog-results-generator",
        "structures/Fx-filterable-grid",
        "structures/Fx-crazy-grid"
    ],
    function (Controller, FilterController, Menu, Form, Resume, FluidForm, Bridge, ResultController, ResultsRenderer, FilterableGrid, CrazyGrid) {

        var html_ids = {
            MENU: "fx-catalog-modular-menu",
            FORM: "fx-catalog-modular-form",
            SUBMIT: "fx-catalog-submit-btn",
            RESULT: "fx-catalog-results",
            RESUME: "fx-catalog-resume"
        };

        function IndexContext() {
        }

        IndexContext.prototype.init = function () {
            var self = this,
                pageController = new Controller();

            // Perform dependency injection by extending objects
            $.extend(pageController, {
                filter: self.initFilter(),
                bridge: self.initBridge(),
                results: self.initResults()
            });

            pageController.render();

        };

        IndexContext.prototype.initFilter = function () {

            var filterController = new FilterController(),
                menu = new Menu(),
                form = new Form(),
                resume = new Resume();

            menu.init({
                container: document.querySelector("#" + html_ids.MENU),
                config: "json/fx-catalog-collapsible-menu-config.json"
            });
            form.init({
                container: document.querySelector("#" + html_ids.FORM),
                config: "json/fx-catalog-modular-form-config.json",
                grid: {
                    drag: {
                        handle: '.fx-catalog-modular-form-handler',
                        containment: "#" + html_ids.FORM
                    },
                    config: {
                        itemSelector: '.fx-catalog-form-module',
                        columnWidth: '.fx-catalog-form-module',
                        rowHeight: '.fx-catalog-form-module'
                    }
                }
            });

            $.extend(form, {
                grid: new FluidForm()
            });

            resume.init({
                container: document.querySelector("#" + html_ids.RESUME)
            });

            // Perform dependency injection by extending objects
            $.extend(filterController, {
                menu: menu,
                form: form,
                resume: resume,
                submit: document.querySelector("#" + html_ids.SUBMIT)
            });

            return filterController;

        };

        IndexContext.prototype.initBridge = function () {
            var bridge = new Bridge();
            bridge.init();
            return bridge;
        };

        IndexContext.prototype.initResults = function () {

            var resultsController = new ResultController(),
                //grid = new FilterableGrid(),
                grid = new CrazyGrid();
                renderer = new ResultsRenderer();

            grid.init({
                container: document.querySelector("#" + html_ids.RESULT),
                isotope: {
                    itemSelector: '.fenix-result',
                    layoutMode: 'fitRows'
                }
            })

            $.extend(resultsController, {
                resultsRenderer: renderer,
                grid: grid
            });

            return resultsController;
        };

        return IndexContext;

    });

/**
 * @license RequireJS domReady 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
 window: false, clearInterval: false, document: false,
 self: false, setInterval: false */


define('domReady',[],function () {
    

    var isTop, testDiv, scrollIntervalId,
        isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [];

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch (e) {
            }

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {
                    }
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        //Hmm, this is more complicated on further use, see "firing too early"
        //bug: https://github.com/requirejs/domReady/issues/1
        //so removing the || document.readyState === "interactive" test.
        //There is still a window.onload binding that should get fired if
        //DOMContentLoaded is missed.
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    domReady.version = '2.0.1';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});


// Place third party dependencies in the lib folder
requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        js: "../../js",
        json: "../../json",
        catalog: "../catalog",
        controller: "../catalog/controller",
        widgets: "../catalog/widgets",
        plugins: "../catalog/widgets/bridge/plugins",
        structures: "../structures",
        html: "../../html",
        jqwidgets: "http://fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-all",
        jqueryui: "http://code.jquery.com/ui/1.10.3/jquery-ui.min"
    },
    "shim": {
        "jqrangeslider": {
            deps: ["jquery", "jqueryui"]
        },
        "bootstrap": {
            deps: ["jquery"]
        }
    }
});

require(["js/IndexContext", "domReady!"], function (IndexContext) {

    var indexContext = new IndexContext();
    indexContext.init();

});

define("../index", function(){});

