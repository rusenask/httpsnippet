var HTTPSnippet =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var debug = __webpack_require__(2)('httpsnippet')
	
	var FormData = __webpack_require__(5)
	var qs = __webpack_require__(6)
	var reducer = __webpack_require__(9)
	var targets = __webpack_require__(10)
	var url = __webpack_require__(55)
	var util = __webpack_require__(14)
	var validate = __webpack_require__(58)
	
	// constructor
	var HTTPSnippet = function (data) {
	  var entries
	  var self = this
	  var input = util._extend({}, data)
	
	  // prep the main container
	  self.requests = []
	
	  // is it har?
	  if (input.log && input.log.entries) {
	    entries = input.log.entries
	  } else {
	    entries = [{
	      request: input
	    }]
	  }
	
	  entries.forEach(function (entry) {
	    // add optional properties to make validation successful
	    entry.request.httpVersion = entry.request.httpVersion || 'HTTP/1.1'
	    entry.request.queryString = entry.request.queryString || []
	    entry.request.headers = entry.request.headers || []
	    entry.request.cookies = entry.request.cookies || []
	    entry.request.postData = entry.request.postData || {}
	    entry.request.postData.mimeType = entry.request.postData.mimeType || 'application/octet-stream'
	
	    entry.request.bodySize = 0
	    entry.request.headersSize = 0
	    entry.request.postData.size = 0
	
	    validate.request(entry.request, function (err, valid) {
	      if (!valid) {
	        throw err
	      }
	
	      self.requests.push(self.prepare(entry.request))
	    })
	  })
	}
	
	HTTPSnippet.prototype.prepare = function (request) {
	  // construct utility properties
	  request.queryObj = {}
	  request.headersObj = {}
	  request.cookiesObj = {}
	  request.allHeaders = {}
	  request.postData.jsonObj = false
	  request.postData.paramsObj = false
	
	  // construct query objects
	  if (request.queryString && request.queryString.length) {
	    debug('queryString found, constructing queryString pair map')
	
	    request.queryObj = request.queryString.reduce(reducer, {})
	  }
	
	  // construct headers objects
	  if (request.headers && request.headers.length) {
	    // loweCase header keys
	    request.headersObj = request.headers.reduceRight(function (headers, header) {
	      headers[header.name.toLowerCase()] = header.value
	      return headers
	    }, {})
	  }
	
	  // construct headers objects
	  if (request.cookies && request.cookies.length) {
	    request.cookiesObj = request.cookies.reduceRight(function (cookies, cookie) {
	      cookies[cookie.name] = cookie.value
	      return cookies
	    }, {})
	  }
	
	  // construct Cookie header
	  var cookies = request.cookies.map(function (cookie) {
	    return encodeURIComponent(cookie.name) + '=' + encodeURIComponent(cookie.value)
	  })
	
	  if (cookies.length) {
	    request.allHeaders.cookie = cookies.join('; ')
	  }
	
	  switch (request.postData.mimeType) {
	    case 'multipart/mixed':
	    case 'multipart/related':
	    case 'multipart/form-data':
	    case 'multipart/alternative':
	      // reset values
	      request.postData.text = ''
	      request.postData.mimeType = 'multipart/form-data'
	
	      if (request.postData.params) {
	        var form = new FormData()
	
	        // easter egg
	        form._boundary = '---011000010111000001101001'
	
	        request.postData.params.forEach(function (param) {
	          // Handle differences between executing this script in a browser
	          // or with Node.js.
	          try {
	            form.append(param.name, param.value || '', {
	              filename: param.fileName || null,
	              contentType: param.contentType || null
	            })
	          } catch (e) {
	            if (e instanceof TypeError) {
	              form.append(param.name, param.value || '')
	            }
	          }
	        })
	
	        // This function and object do not exists in browsers.
	        if (typeof form.pipe == 'function' && typeof es == 'object') {
	          form.pipe(es.map(function (data, cb) {
	            request.postData.text += data
	          }))
	        }
	
	        request.postData.boundary = form._boundary
	        request.headersObj['content-type'] = 'multipart/form-data; boundary=' + form._boundary
	      }
	      break
	
	    case 'application/x-www-form-urlencoded':
	      if (!request.postData.params) {
	        request.postData.text = ''
	      } else {
	        request.postData.paramsObj = request.postData.params.reduce(reducer, {})
	
	        // always overwrite
	        request.postData.text = qs.stringify(request.postData.paramsObj)
	      }
	      break
	
	    case 'text/json':
	    case 'text/x-json':
	    case 'application/json':
	    case 'application/x-json':
	      request.postData.mimeType = 'application/json'
	
	      if (request.postData.text) {
	        try {
	          request.postData.jsonObj = JSON.parse(request.postData.text)
	        } catch (e) {
	          debug(e)
	
	          // force back to text/plain
	          // if headers have proper content-type value, then this should also work
	          request.postData.mimeType = 'text/plain'
	        }
	      }
	      break
	  }
	
	  // create allHeaders object
	  request.allHeaders = util._extend(request.allHeaders, request.headersObj)
	
	  // deconstruct the uri
	  request.uriObj = url.parse(request.url, true, true)
	
	  // merge all possible queryString values
	  request.queryObj = util._extend(request.queryObj, request.uriObj.query)
	
	  // reset uriObj values for a clean url
	  request.uriObj.query = null
	  request.uriObj.search = null
	  request.uriObj.path = request.uriObj.pathname
	
	  // keep the base url clean of queryString
	  request.url = url.format(request.uriObj)
	
	  // update the uri object
	  request.uriObj.query = request.queryObj
	  request.uriObj.search = qs.stringify(request.queryObj)
	
	  if (request.uriObj.search) {
	    request.uriObj.path = request.uriObj.pathname + '?' + request.uriObj.search
	  }
	
	  // construct a full url
	  request.fullUrl = url.format(request.uriObj)
	
	  return request
	}
	
	HTTPSnippet.prototype.convert = function (target, client, opts) {
	  if (!opts && client) {
	    opts = client
	  }
	
	  var func = this._matchTarget(target, client)
	
	  if (func) {
	    var results = this.requests.map(function (request) {
	      return func(request, opts)
	    })
	
	    return results.length === 1 ? results[0] : results
	  }
	
	  return false
	}
	
	HTTPSnippet.prototype._matchTarget = function (target, client) {
	  // does it exist?
	  if (!targets.hasOwnProperty(target)) {
	    return false
	  }
	
	  // shorthand
	  if (typeof client === 'string' && typeof targets[target][client] === 'function') {
	    return targets[target][client]
	  }
	
	  // default target
	  return targets[target][targets[target].info.default]
	}
	
	// exports
	module.exports = HTTPSnippet
	
	module.exports.availableTargets = function () {
	  return Object.keys(targets).map(function (key) {
	    var target = util._extend({}, targets[key].info)
	    var clients = Object.keys(targets[key])
	
	      .filter(function (prop) {
	        return !~['info', 'index'].indexOf(prop)
	      })
	
	      .map(function (client) {
	        return targets[key][client].info
	      })
	
	    if (clients.length) {
	      target.clients = clients
	    }
	
	    return target
	  })
	}
	
	module.exports.extname = function (target) {
	  return targets[target] ? targets[target].info.extname : ''
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = __webpack_require__(3);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	
	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);
	
	  if (!useColors) return args;
	
	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));
	
	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });
	
	  args.splice(lastC, 0, c);
	  return args;
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(4);
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */
	
	exports.formatters = {};
	
	/**
	 * Previously assigned color.
	 */
	
	var prevColor = 0;
	
	/**
	 * Previous log timestamp.
	 */
	
	var prevTime;
	
	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function debug(namespace) {
	
	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;
	
	  // define the `enabled` version
	  function enabled() {
	
	    var self = enabled;
	
	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;
	
	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();
	
	    var args = Array.prototype.slice.call(arguments);
	
	    args[0] = exports.coerce(args[0]);
	
	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }
	
	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);
	
	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });
	
	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;
	
	  var fn = exports.enabled(namespace) ? enabled : disabled;
	
	  fn.namespace = namespace;
	
	  return fn;
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
	  exports.save(namespaces);
	
	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;
	
	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
	  exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	/* eslint-env browser */
	module.exports = window.FormData;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(7);
	exports.encode = exports.stringify = __webpack_require__(8);


/***/ },
/* 7 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict'
	
	module.exports = function (obj, pair) {
	  if (obj[pair.name] === undefined) {
	    obj[pair.name] = pair.value
	    return obj
	  }
	
	  // convert to array
	  var arr = [
	    obj[pair.name],
	    pair.value
	  ]
	
	  obj[pair.name] = arr
	
	  return obj
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  c: __webpack_require__(11),
	  csharp: __webpack_require__(18),
	  go: __webpack_require__(20),
	  java: __webpack_require__(22),
	  javascript: __webpack_require__(25),
	  node: __webpack_require__(28),
	  objc: __webpack_require__(32),
	  ocaml: __webpack_require__(35),
	  php: __webpack_require__(37),
	  python: __webpack_require__(42),
	  ruby: __webpack_require__(45),
	  shell: __webpack_require__(47),
	  swift: __webpack_require__(52)
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'c',
	    title: 'C',
	    extname: '.c',
	    default: 'libcurl'
	  },
	
	  libcurl: __webpack_require__(12)
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var code = new CodeBuilder()
	
	  code.push('CURL *hnd = curl_easy_init();')
	      .blank()
	      .push('curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "%s");', source.method.toUpperCase())
	      .push('curl_easy_setopt(hnd, CURLOPT_URL, "%s");', source.fullUrl)
	
	  // Add headers, including the cookies
	  var headers = Object.keys(source.headersObj)
	
	  // construct headers
	  if (headers.length) {
	    code.blank()
	        .push('struct curl_slist *headers = NULL;')
	
	    headers.forEach(function (key) {
	      code.push('headers = curl_slist_append(headers, "%s: %s");', key, source.headersObj[key])
	    })
	
	    code.push('curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);')
	  }
	
	  // construct cookies
	  if (source.allHeaders.cookie) {
	    code.blank()
	        .push('curl_easy_setopt(hnd, CURLOPT_COOKIE, "%s");', source.allHeaders.cookie)
	  }
	
	  if (source.postData.text) {
	    code.blank()
	        .push('curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, %s);', JSON.stringify(source.postData.text))
	  }
	
	  code.blank()
	      .push('CURLcode ret = curl_easy_perform(hnd);')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'libcurl',
	  title: 'Libcurl',
	  link: 'http://curl.haxx.se/libcurl/',
	  description: 'Simple REST and HTTP API Client for C'
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var util = __webpack_require__(14)
	
	/**
	 * Helper object to format and aggragate lines of code.
	 * Lines are aggregated in a `code` array, and need to be joined to obtain a proper code snippet.
	 *
	 * @class
	 *
	 * @param {string} indentation Desired indentation character for aggregated lines of code
	 * @param {string} join Desired character to join each line of code
	 */
	var CodeBuilder = function (indentation, join) {
	  this.code = []
	  this.indentation = indentation
	  this.lineJoin = join || '\n'
	}
	
	/**
	 * Add given indentation level to given string and format the string (variadic)
	 * @param {number} [indentationLevel=0] - Desired level of indentation for this line
	 * @param {string} line - Line of code. Can contain formatting placeholders
	 * @param {...anyobject} - Parameter to bind to `line`'s formatting placeholders
	 * @return {string}
	 *
	 * @example
	 *   var builder = CodeBuilder('\t')
	 *
	 *   builder.buildLine('console.log("hello world")')
	 *   // returns: 'console.log("hello world")'
	 *
	 *   builder.buildLine(2, 'console.log("hello world")')
	 *   // returns: 'console.log("\t\thello world")'
	 *
	 *   builder.buildLine(2, 'console.log("%s %s")', 'hello', 'world')
	 *   // returns: 'console.log("\t\thello world")'
	 */
	CodeBuilder.prototype.buildLine = function (indentationLevel, line) {
	  var lineIndentation = ''
	  var slice = 2
	  if (Object.prototype.toString.call(indentationLevel) === '[object String]') {
	    slice = 1
	    line = indentationLevel
	    indentationLevel = 0
	  } else if (indentationLevel === null) {
	    return null
	  }
	
	  while (indentationLevel) {
	    lineIndentation += this.indentation
	    indentationLevel--
	  }
	
	  var format = Array.prototype.slice.call(arguments, slice, arguments.length)
	  format.unshift(lineIndentation + line)
	
	  return util.format.apply(this, format)
	}
	
	/**
	 * Invoke buildLine() and add the line at the top of current lines
	 * @param {number} [indentationLevel=0] Desired level of indentation for this line
	 * @param {string} line Line of code
	 * @return {this}
	 */
	CodeBuilder.prototype.unshift = function () {
	  this.code.unshift(this.buildLine.apply(this, arguments))
	
	  return this
	}
	
	/**
	 * Invoke buildLine() and add the line at the bottom of current lines
	 * @param {number} [indentationLevel=0] Desired level of indentation for this line
	 * @param {string} line Line of code
	 * @return {this}
	 */
	CodeBuilder.prototype.push = function () {
	  this.code.push(this.buildLine.apply(this, arguments))
	
	  return this
	}
	
	/**
	 * Add an empty line at the end of current lines
	 * @return {this}
	 */
	CodeBuilder.prototype.blank = function () {
	  this.code.push(null)
	
	  return this
	}
	
	/**
	 * Concatenate all current lines using the given lineJoin
	 * @return {string}
	 */
	CodeBuilder.prototype.join = function () {
	  return this.code.join(this.lineJoin)
	}
	
	module.exports = CodeBuilder


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }
	
	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};
	
	
	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }
	
	  if (process.noDeprecation === true) {
	    return fn;
	  }
	
	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }
	
	  return deprecated;
	};
	
	
	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};
	
	
	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;
	
	
	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};
	
	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};
	
	
	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];
	
	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}
	
	
	function stylizeNoColor(str, styleType) {
	  return str;
	}
	
	
	function arrayToHash(array) {
	  var hash = {};
	
	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });
	
	  return hash;
	}
	
	
	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }
	
	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	
	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);
	
	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }
	
	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }
	
	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }
	
	  var base = '', array = false, braces = ['{', '}'];
	
	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	
	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }
	
	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	
	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	
	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }
	
	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }
	
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	
	  ctx.seen.push(value);
	
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	
	  ctx.seen.pop();
	
	  return reduceToSingleString(output, base, braces);
	}
	
	
	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}
	
	
	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}
	
	
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}
	
	
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }
	
	  return name + ': ' + str;
	}
	
	
	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);
	
	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }
	
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}
	
	
	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;
	
	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;
	
	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;
	
	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;
	
	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;
	
	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;
	
	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;
	
	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;
	
	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	
	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;
	
	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;
	
	exports.isBuffer = __webpack_require__(16);
	
	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	
	
	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}
	
	
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];
	
	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}
	
	
	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};
	
	
	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(17);
	
	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;
	
	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};
	
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(15)))

/***/ },
/* 15 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'csharp',
	    title: 'C#',
	    extname: '.cs',
	    default: 'restsharp'
	  },
	
	  restsharp: __webpack_require__(19)
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var code = new CodeBuilder()
	  var methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS' ]
	
	  if (methods.indexOf(source.method.toUpperCase()) === -1) {
	    return 'Method not supported'
	  } else {
	    code.push('var client = new RestClient("%s");', source.fullUrl)
	    code.push('var request = new RestRequest(Method.%s);', source.method.toUpperCase())
	  }
	
	  // Add headers, including the cookies
	  var headers = Object.keys(source.headersObj)
	
	  // construct headers
	  if (headers.length) {
	    headers.forEach(function (key) {
	      code.push('request.AddHeader("%s", "%s");', key, source.headersObj[key])
	    })
	  }
	
	  // construct cookies
	  if (source.cookies.length) {
	    source.cookies.forEach(function (cookie) {
	      code.push('request.AddCookie("%s", "%s");', cookie.name, cookie.value)
	    })
	  }
	
	  if (source.postData.text) {
	    code.push('request.AddParameter("%s", %s, ParameterType.RequestBody);', source.allHeaders['content-type'], JSON.stringify(source.postData.text))
	  }
	
	  code.push('IRestResponse response = client.Execute(request);')
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'restsharp',
	  title: 'RestSharp',
	  link: 'http://restsharp.org/',
	  description: 'Simple REST and HTTP API Client for .NET'
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'go',
	    title: 'Go',
	    extname: '.go',
	    default: 'native'
	  },
	
	  native: __webpack_require__(21)
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for native Go.
	 *
	 * @author
	 * @montanaflynn
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  // Let's Go!
	  var code = new CodeBuilder('\t')
	
	  // Define Options
	  var opts = util._extend({
	    showBoilerplate: true,
	    checkErrors: false,
	    printBody: true,
	    timeout: -1
	  }, options)
	
	  var errorPlaceholder = opts.checkErrors ? 'err' : '_'
	
	  var indent = opts.showBoilerplate ? 1 : 0
	
	  var errorCheck = function () {
	    if (opts.checkErrors) {
	      code.push(indent, 'if err != nil {')
	        .push(indent + 1, 'panic(err)')
	        .push(indent, '}')
	    }
	  }
	
	  // Create boilerplate
	  if (opts.showBoilerplate) {
	    code.push('package main')
	      .blank()
	      .push('import (')
	      .push(indent, '"fmt"')
	
	    if (opts.timeout > 0) {
	      code.push(indent, '"time"')
	    }
	
	    if (source.postData.text) {
	      code.push(indent, '"strings"')
	    }
	
	    code.push(indent, '"net/http"')
	
	    if (opts.printBody) {
	      code.push(indent, '"io/ioutil"')
	    }
	
	    code.push(')')
	      .blank()
	      .push('func main() {')
	      .blank()
	  }
	
	  // Create client
	  var client
	  if (opts.timeout > 0) {
	    client = 'client'
	    code.push(indent, 'client := http.Client{')
	      .push(indent + 1, 'Timeout: time.Duration(%s * time.Second),', opts.timeout)
	      .push(indent, '}')
	      .blank()
	  } else {
	    client = 'http.DefaultClient'
	  }
	
	  code.push(indent, 'url := "%s"', source.fullUrl)
	    .blank()
	
	  // If we have body content or not create the var and reader or nil
	  if (source.postData.text) {
	    code.push(indent, 'payload := strings.NewReader(%s)', JSON.stringify(source.postData.text))
	      .blank()
	      .push(indent, 'req, %s := http.NewRequest("%s", url, payload)', errorPlaceholder, source.method)
	      .blank()
	  } else {
	    code.push(indent, 'req, %s := http.NewRequest("%s", url, nil)', errorPlaceholder, source.method)
	      .blank()
	  }
	
	  errorCheck()
	
	  // Add headers
	  if (Object.keys(source.allHeaders).length) {
	    Object.keys(source.allHeaders).forEach(function (key) {
	      code.push(indent, 'req.Header.Add("%s", "%s")', key, source.allHeaders[key])
	    })
	
	    code.blank()
	  }
	
	  // Make request
	  code.push(indent, 'res, %s := %s.Do(req)', errorPlaceholder, client)
	  errorCheck()
	
	  // Get Body
	  if (opts.printBody) {
	    code.blank()
	      .push(indent, 'defer res.Body.Close()')
	      .push(indent, 'body, %s := ioutil.ReadAll(res.Body)', errorPlaceholder)
	    errorCheck()
	  }
	
	  // Print it
	  code.blank()
	    .push(indent, 'fmt.Println(res)')
	
	  if (opts.printBody) {
	    code.push(indent, 'fmt.Println(string(body))')
	  }
	
	  // End main block
	  if (opts.showBoilerplate) {
	    code.blank()
	      .push('}')
	  }
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'native',
	  title: 'NewRequest',
	  link: 'http://golang.org/pkg/net/http/#NewRequest',
	  description: 'Golang HTTP client request'
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'java',
	    title: 'Java',
	    extname: '.java',
	    default: 'unirest'
	  },
	
	  okhttp: __webpack_require__(23),
	  unirest: __webpack_require__(24)
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Java using OkHttp.
	 *
	 * @author
	 * @shashiranjan84
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  var methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
	
	  var methodsWithBody = ['POST', 'PUT', 'DELETE', 'PATCH']
	
	  code.push('OkHttpClient client = new OkHttpClient();')
	    .blank()
	
	  if (source.postData.text) {
	    if (source.postData.boundary) {
	      code.push('MediaType mediaType = MediaType.parse("%s; boundary=%s");', source.postData.mimeType, source.postData.boundary)
	    } else {
	      code.push('MediaType mediaType = MediaType.parse("%s");', source.postData.mimeType)
	    }
	    code.push('RequestBody body = RequestBody.create(mediaType, %s);', JSON.stringify(source.postData.text))
	  }
	
	  code.push('Request request = new Request.Builder()')
	  code.push(1, '.url("%s")', source.fullUrl)
	  if (methods.indexOf(source.method.toUpperCase()) === -1) {
	    if (source.postData.text) {
	      code.push(1, '.method("%s", body)', source.method.toUpperCase())
	    } else {
	      code.push(1, '.method("%s", null)', source.method.toUpperCase())
	    }
	  } else if (methodsWithBody.indexOf(source.method.toUpperCase()) >= 0) {
	    if (source.postData.text) {
	      code.push(1, '.%s(body)', source.method.toLowerCase())
	    } else {
	      code.push(1, '.%s(null)', source.method.toLowerCase())
	    }
	  } else {
	    code.push(1, '.%s()', source.method.toLowerCase())
	  }
	
	  // Add headers, including the cookies
	  var headers = Object.keys(source.allHeaders)
	
	  // construct headers
	  if (headers.length) {
	    headers.forEach(function (key) {
	      code.push(1, '.addHeader("%s", "%s")', key, source.allHeaders[key])
	    })
	  }
	
	  code.push(1, '.build();')
	    .blank()
	    .push('Response response = client.newCall(request).execute();')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'okhttp',
	  title: 'OkHttp',
	  link: 'http://square.github.io/okhttp/',
	  description: 'An HTTP Request Client Library'
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Java using Unirest.
	 *
	 * @author
	 * @shashiranjan84
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  var methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS' ]
	
	  if (methods.indexOf(source.method.toUpperCase()) === -1) {
	    code.push('HttpResponse<String> response = Unirest.customMethod("%s","%s")', source.method.toUpperCase(), source.fullUrl)
	  } else {
	    code.push('HttpResponse<String> response = Unirest.%s("%s")', source.method.toLowerCase(), source.fullUrl)
	  }
	
	  // Add headers, including the cookies
	  var headers = Object.keys(source.allHeaders)
	
	  // construct headers
	  if (headers.length) {
	    headers.forEach(function (key) {
	      code.push(1, '.header("%s", "%s")', key, source.allHeaders[key])
	    })
	  }
	
	  if (source.postData.text) {
	    code.push(1, '.body(%s)', JSON.stringify(source.postData.text))
	  }
	
	  code.push(1, '.asString();')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'unirest',
	  title: 'Unirest',
	  link: 'http://unirest.io/java.html',
	  description: 'Lightweight HTTP Request Client Library'
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'javascript',
	    title: 'JavaScript',
	    extname: '.js',
	    default: 'xhr'
	  },
	
	  jquery: __webpack_require__(26),
	  xhr: __webpack_require__(27)
	}


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for native XMLHttpRequest
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  var settings = {
	    async: true,
	    crossDomain: true,
	    url: source.fullUrl,
	    method: source.method,
	    headers: source.allHeaders
	  }
	
	  switch (source.postData.mimeType) {
	    case 'application/x-www-form-urlencoded':
	      settings.data = source.postData.paramsObj ? source.postData.paramsObj : source.postData.text
	      break
	
	    case 'application/json':
	      settings.processData = false
	      settings.data = source.postData.text
	      break
	
	    case 'multipart/form-data':
	      code.push('var form = new FormData();')
	
	      source.postData.params.forEach(function (param) {
	        code.push('form.append(%s, %s);', JSON.stringify(param.name), JSON.stringify(param.value || param.fileName || ''))
	      })
	
	      settings.processData = false
	      settings.contentType = false
	      settings.mimeType = 'multipart/form-data'
	      settings.data = '[form]'
	
	      // remove the contentType header
	      if (~settings.headers['content-type'].indexOf('boundary')) {
	        delete settings.headers['content-type']
	      }
	      code.blank()
	      break
	
	    default:
	      if (source.postData.text) {
	        settings.data = source.postData.text
	      }
	  }
	
	  code.push('var settings = ' + JSON.stringify(settings, null, opts.indent).replace('"[form]"', 'form'))
	      .blank()
	      .push('$.ajax(settings).done(function (response) {')
	      .push(1, 'console.log(response);')
	      .push('});')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'jquery',
	  title: 'jQuery',
	  link: 'http://api.jquery.com/jquery.ajax/',
	  description: 'Perform an asynchronous HTTP (Ajax) requests with jQuery'
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for native XMLHttpRequest
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  ',
	    cors: true
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  switch (source.postData.mimeType) {
	    case 'application/json':
	      code.push('var data = JSON.stringify(%s);', JSON.stringify(source.postData.jsonObj, null, opts.indent))
	          .push(null)
	      break
	
	    case 'multipart/form-data':
	      code.push('var data = new FormData();')
	
	      source.postData.params.forEach(function (param) {
	        code.push('data.append(%s, %s);', JSON.stringify(param.name), JSON.stringify(param.value || param.fileName || ''))
	      })
	
	      // remove the contentType header
	      if (source.allHeaders['content-type'].indexOf('boundary')) {
	        delete source.allHeaders['content-type']
	      }
	
	      code.blank()
	      break
	
	    default:
	      code.push('var data = %s;', JSON.stringify(source.postData.text || null))
	          .blank()
	  }
	
	  code.push('var xhr = new XMLHttpRequest();')
	
	  if (opts.cors) {
	    code.push('xhr.withCredentials = true;')
	  }
	
	  code.blank()
	      .push('xhr.addEventListener("readystatechange", function () {')
	      .push(1, 'if (this.readyState === this.DONE) {')
	      .push(2, 'console.log(this.responseText);')
	      .push(1, '}')
	      .push('});')
	      .blank()
	      .push('xhr.open(%s, %s);', JSON.stringify(source.method), JSON.stringify(source.fullUrl))
	
	  Object.keys(source.allHeaders).forEach(function (key) {
	    code.push('xhr.setRequestHeader(%s, %s);', JSON.stringify(key), JSON.stringify(source.allHeaders[key]))
	  })
	
	  code.blank()
	      .push('xhr.send(data);')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'xhr',
	  title: 'XMLHttpRequest',
	  link: 'https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest',
	  description: 'W3C Standard API that provides scripted client functionality'
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'node',
	    title: 'Node.js',
	    extname: '.js',
	    default: 'native'
	  },
	
	  native: __webpack_require__(29),
	  request: __webpack_require__(30),
	  unirest: __webpack_require__(31)
	}


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for native Node.js.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  var reqOpts = {
	    method: source.method,
	    hostname: source.uriObj.hostname,
	    port: source.uriObj.port,
	    path: source.uriObj.path,
	    headers: source.allHeaders
	  }
	
	  code.push('var http = require("%s");', source.uriObj.protocol.replace(':', ''))
	
	  code.blank()
	      .push('var options = %s;', JSON.stringify(reqOpts, null, opts.indent))
	      .blank()
	      .push('var req = http.request(options, function (res) {')
	      .push(1, 'var chunks = [];')
	      .blank()
	      .push(1, 'res.on("data", function (chunk) {')
	      .push(2, 'chunks.push(chunk);')
	      .push(1, '});')
	      .blank()
	      .push(1, 'res.on("end", function () {')
	      .push(2, 'var body = Buffer.concat(chunks);')
	      .push(2, 'console.log(body.toString());')
	      .push(1, '});')
	      .push('});')
	      .blank()
	
	  switch (source.postData.mimeType) {
	    case 'application/x-www-form-urlencoded':
	      if (source.postData.paramsObj) {
	        code.unshift('var qs = require("querystring");')
	        code.push('req.write(qs.stringify(%s));', util.inspect(source.postData.paramsObj, {
	          depth: null
	        }))
	      }
	      break
	
	    case 'application/json':
	      if (source.postData.jsonObj) {
	        code.push('req.write(JSON.stringify(%s));', util.inspect(source.postData.jsonObj, {
	          depth: null
	        }))
	      }
	      break
	
	    default:
	      if (source.postData.text) {
	        code.push('req.write(%s);', JSON.stringify(source.postData.text, null, opts.indent))
	      }
	  }
	
	  code.push('req.end();')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'native',
	  title: 'HTTP',
	  link: 'http://nodejs.org/api/http.html#http_http_request_options_callback',
	  description: 'Node.js native HTTP interface'
	}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Node.js using Request.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var includeFS = false
	  var code = new CodeBuilder(opts.indent)
	
	  code.push('var request = require("request");')
	      .blank()
	
	  var reqOpts = {
	    method: source.method,
	    url: source.url
	  }
	
	  if (Object.keys(source.queryObj).length) {
	    reqOpts.qs = source.queryObj
	  }
	
	  if (Object.keys(source.headersObj).length) {
	    reqOpts.headers = source.headersObj
	  }
	
	  switch (source.postData.mimeType) {
	    case 'application/x-www-form-urlencoded':
	      reqOpts.form = source.postData.paramsObj
	      break
	
	    case 'application/json':
	      if (source.postData.jsonObj) {
	        reqOpts.body = source.postData.jsonObj
	        reqOpts.json = true
	      }
	      break
	
	    case 'multipart/form-data':
	      reqOpts.formData = {}
	
	      source.postData.params.forEach(function (param) {
	        var attachement = {}
	
	        if (!param.fileName && !param.fileName && !param.contentType) {
	          reqOpts.formData[param.name] = param.value
	          return
	        }
	
	        if (param.fileName && !param.value) {
	          includeFS = true
	
	          attachement.value = 'fs.createReadStream("' + param.fileName + '")'
	        } else if (param.value) {
	          attachement.value = param.value
	        }
	
	        if (param.fileName) {
	          attachement.options = {
	            filename: param.fileName,
	            contentType: param.contentType ? param.contentType : null
	          }
	        }
	
	        reqOpts.formData[param.name] = attachement
	      })
	      break
	
	    default:
	      if (source.postData.text) {
	        reqOpts.body = source.postData.text
	      }
	  }
	
	  // construct cookies argument
	  if (source.cookies.length) {
	    reqOpts.jar = 'JAR'
	
	    code.push('var jar = request.jar();')
	
	    var url = source.url
	
	    source.cookies.forEach(function (cookie) {
	      code.push('jar.setCookie(request.cookie("%s=%s"), "%s");', encodeURIComponent(cookie.name), encodeURIComponent(cookie.value), url)
	    })
	    code.blank()
	  }
	
	  if (includeFS) {
	    code.unshift('var fs = require("fs");')
	  }
	
	  code.push('var options = %s;', util.inspect(reqOpts, { depth: null }))
	    .blank()
	
	  code.push(util.format('request(options, %s', 'function (error, response, body) {'))
	
	      .push(1, 'if (error) throw new Error(error);')
	      .blank()
	      .push(1, 'console.log(body);')
	      .push('});')
	      .blank()
	
	  return code.join().replace('"JAR"', 'jar').replace(/"fs\.createReadStream\(\\\"(.+)\\\"\)\"/, 'fs.createReadStream("$1")')
	}
	
	module.exports.info = {
	  key: 'request',
	  title: 'Request',
	  link: 'https://github.com/request/request',
	  description: 'Simplified HTTP request client'
	}


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Node.js using Unirest.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var includeFS = false
	  var code = new CodeBuilder(opts.indent)
	
	  code.push('var unirest = require("unirest");')
	      .blank()
	      .push('var req = unirest("%s", "%s");', source.method, source.url)
	      .blank()
	
	  if (source.cookies.length) {
	    code.push('var CookieJar = unirest.jar();')
	
	    source.cookies.forEach(function (cookie) {
	      code.push('CookieJar.add("%s=%s","%s");', encodeURIComponent(cookie.name), encodeURIComponent(cookie.value), source.url)
	    })
	
	    code.push('req.jar(CookieJar);')
	        .blank()
	  }
	
	  if (Object.keys(source.queryObj).length) {
	    code.push('req.query(%s);', JSON.stringify(source.queryObj, null, opts.indent))
	        .blank()
	  }
	
	  if (Object.keys(source.headersObj).length) {
	    code.push('req.headers(%s);', JSON.stringify(source.headersObj, null, opts.indent))
	        .blank()
	  }
	
	  switch (source.postData.mimeType) {
	    case 'application/x-www-form-urlencoded':
	      if (source.postData.paramsObj) {
	        code.push('req.form(%s);', JSON.stringify(source.postData.paramsObj, null, opts.indent))
	      }
	      break
	
	    case 'application/json':
	      if (source.postData.jsonObj) {
	        code.push('req.type("json");')
	            .push('req.send(%s);', JSON.stringify(source.postData.jsonObj, null, opts.indent))
	      }
	      break
	
	    case 'multipart/form-data':
	      var multipart = []
	
	      source.postData.params.forEach(function (param) {
	        var part = {}
	
	        if (param.fileName && !param.value) {
	          includeFS = true
	
	          part.body = 'fs.createReadStream("' + param.fileName + '")'
	        } else if (param.value) {
	          part.body = param.value
	        }
	
	        if (part.body) {
	          if (param.contentType) {
	            part['content-type'] = param.contentType
	          }
	
	          multipart.push(part)
	        }
	      })
	
	      code.push('req.multipart(%s);', JSON.stringify(multipart, null, opts.indent))
	      break
	
	    default:
	      if (source.postData.text) {
	        code.push(opts.indent + 'req.send(%s);', JSON.stringify(source.postData.text, null, opts.indent))
	      }
	  }
	
	  if (includeFS) {
	    code.unshift('var fs = require("fs");')
	  }
	
	  code.blank()
	      .push('req.end(function (res) {')
	      .push(1, 'if (res.error) throw new Error(res.error);')
	      .blank()
	      .push(1, 'console.log(res.body);')
	      .push('});')
	      .blank()
	
	  return code.join().replace(/"fs\.createReadStream\(\\\"(.+)\\\"\)\"/, 'fs.createReadStream("$1")')
	}
	
	module.exports.info = {
	  key: 'unirest',
	  title: 'Unirest',
	  link: 'http://unirest.io/nodejs.html',
	  description: 'Lightweight HTTP Request Client Library'
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'objc',
	    title: 'Objective-C',
	    extname: '.m',
	    default: 'nsurlsession'
	  },
	
	  nsurlsession: __webpack_require__(33)
	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Objective-C using NSURLSession.
	 *
	 * @author
	 * @thibaultCha
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var helpers = __webpack_require__(34)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '    ',
	    pretty: true,
	    timeout: '10'
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	  // Markers for headers to be created as litteral objects and later be set on the NSURLRequest if exist
	  var req = {
	    hasHeaders: false,
	    hasBody: false
	  }
	
	  // We just want to make sure people understand that is the only dependency
	  code.push('#import <Foundation/Foundation.h>')
	
	  if (Object.keys(source.allHeaders).length) {
	    req.hasHeaders = true
	    code.blank()
	        .push(helpers.nsDeclaration('NSDictionary', 'headers', source.allHeaders, opts.pretty))
	  }
	
	  if (source.postData.text || source.postData.jsonObj || source.postData.params) {
	    req.hasBody = true
	
	    switch (source.postData.mimeType) {
	      case 'application/x-www-form-urlencoded':
	        // By appending parameters one by one in the resulting snippet,
	        // we make it easier for the user to edit it according to his or her needs after pasting.
	        // The user can just add/remove lines adding/removing body parameters.
	        code.blank()
	            .push('NSMutableData *postData = [[NSMutableData alloc] initWithData:[@"%s=%s" dataUsingEncoding:NSUTF8StringEncoding]];',
	          source.postData.params[0].name, source.postData.params[0].value)
	        for (var i = 1, len = source.postData.params.length; i < len; i++) {
	          code.push('[postData appendData:[@"&%s=%s" dataUsingEncoding:NSUTF8StringEncoding]];',
	            source.postData.params[i].name, source.postData.params[i].value)
	        }
	        break
	
	      case 'application/json':
	        if (source.postData.jsonObj) {
	          code.push(helpers.nsDeclaration('NSDictionary', 'parameters', source.postData.jsonObj, opts.pretty))
	              .blank()
	              .push('NSData *postData = [NSJSONSerialization dataWithJSONObject:parameters options:0 error:nil];')
	        }
	        break
	
	      case 'multipart/form-data':
	        // By appending multipart parameters one by one in the resulting snippet,
	        // we make it easier for the user to edit it according to his or her needs after pasting.
	        // The user can just edit the parameters NSDictionary or put this part of a snippet in a multipart builder method.
	        code.push(helpers.nsDeclaration('NSArray', 'parameters', source.postData.params, opts.pretty))
	            .push('NSString *boundary = @"%s";', source.postData.boundary)
	            .blank()
	            .push('NSError *error;')
	            .push('NSMutableString *body = [NSMutableString string];')
	            .push('for (NSDictionary *param in parameters) {')
	            .push(1, '[body appendFormat:@"--%@\\r\\n", boundary];')
	            .push(1, 'if (param[@"fileName"]) {')
	            .push(2, '[body appendFormat:@"Content-Disposition:form-data; name=\\"%@\\"; filename=\\"%@\\"\\r\\n", param[@"name"], param[@"fileName"]];')
	            .push(2, '[body appendFormat:@"Content-Type: %@\\r\\n\\r\\n", param[@"contentType"]];')
	            .push(2, '[body appendFormat:@"%@", [NSString stringWithContentsOfFile:param[@"fileName"] encoding:NSUTF8StringEncoding error:&error]];')
	            .push(2, 'if (error) {')
	            .push(3, 'NSLog(@"%@", error);')
	            .push(2, '}')
	            .push(1, '} else {')
	            .push(2, '[body appendFormat:@"Content-Disposition:form-data; name=\\"%@\\"\\r\\n\\r\\n", param[@"name"]];')
	            .push(2, '[body appendFormat:@"%@", param[@"value"]];')
	            .push(1, '}')
	            .push('}')
	            .push('[body appendFormat:@"\\r\\n--%@--\\r\\n", boundary];')
	            .push('NSData *postData = [body dataUsingEncoding:NSUTF8StringEncoding];')
	        break
	
	      default:
	        code.blank()
	            .push('NSData *postData = [[NSData alloc] initWithData:[@"' + source.postData.text + '" dataUsingEncoding:NSUTF8StringEncoding]];')
	    }
	  }
	
	  code.blank()
	      .push('NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"' + source.fullUrl + '"]')
	      // NSURLRequestUseProtocolCachePolicy is the default policy, let's just always set it to avoid confusion.
	      .push('                                                       cachePolicy:NSURLRequestUseProtocolCachePolicy')
	      .push('                                                   timeoutInterval:' + parseInt(opts.timeout, 10).toFixed(1) + '];')
	      .push('[request setHTTPMethod:@"' + source.method + '"];')
	
	  if (req.hasHeaders) {
	    code.push('[request setAllHTTPHeaderFields:headers];')
	  }
	
	  if (req.hasBody) {
	    code.push('[request setHTTPBody:postData];')
	  }
	
	  code.blank()
	      // Retrieving the shared session will be less verbose than creating a new one.
	      .push('NSURLSession *session = [NSURLSession sharedSession];')
	      .push('NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request')
	      .push('                                            completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {')
	      .push(1, '                                            if (error) {')
	      .push(2, '                                            NSLog(@"%@", error);')
	      .push(1, '                                            } else {')
	      // Casting the NSURLResponse to NSHTTPURLResponse so the user can see the status     .
	      .push(2, '                                            NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;')
	      .push(2, '                                            NSLog(@"%@", httpResponse);')
	      .push(1, '                                            }')
	      .push('                                            }];')
	      .push('[dataTask resume];')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'nsurlsession',
	  title: 'NSURLSession',
	  link: 'https://developer.apple.com/library/mac/documentation/Foundation/Reference/NSURLSession_class/index.html',
	  description: 'Foundation\'s NSURLSession request'
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var util = __webpack_require__(14)
	
	module.exports = {
	  /**
	   * Create an string of given length filled with blank spaces
	   *
	   * @param {number} length Length of the array to return
	   * @return {string}
	   */
	  blankString: function (length) {
	    return Array.apply(null, new Array(length)).map(String.prototype.valueOf, ' ').join('')
	  },
	
	  /**
	   * Create a string corresponding to a valid declaration and initialization of an Objective-C object literal.
	   *
	   * @param {string} nsClass Class of the litteral
	   * @param {string} name Desired name of the instance
	   * @param {Object} parameters Key-value object of parameters to translate to an Objective-C object litearal
	   * @param {boolean} indent If true, will declare the litteral by indenting each new key/value pair.
	   * @return {string} A valid Objective-C declaration and initialization of an Objective-C object litteral.
	   *
	   * @example
	   *   nsDeclaration('NSDictionary', 'params', {a: 'b', c: 'd'}, true)
	   *   // returns:
	   *   NSDictionary *params = @{ @"a": @"b",
	   *                             @"c": @"d" };
	   *
	   *   nsDeclaration('NSDictionary', 'params', {a: 'b', c: 'd'})
	   *   // returns:
	   *   NSDictionary *params = @{ @"a": @"b", @"c": @"d" };
	   */
	  nsDeclaration: function (nsClass, name, parameters, indent) {
	    var opening = nsClass + ' *' + name + ' = '
	    var literal = this.literalRepresentation(parameters, indent ? opening.length : undefined)
	    return opening + literal + ';'
	  },
	
	  /**
	   * Create a valid Objective-C string of a literal value according to its type.
	   *
	   * @param {*} value Any JavaScript literal
	   * @return {string}
	   */
	  literalRepresentation: function (value, indentation) {
	    var join = indentation === undefined ? ', ' : ',\n   ' + this.blankString(indentation)
	
	    switch (Object.prototype.toString.call(value)) {
	      case '[object Number]':
	        return '@' + value
	      case '[object Array]':
	        var values_representation = value.map(function (v) {
	          return this.literalRepresentation(v)
	        }.bind(this))
	        return '@[ ' + values_representation.join(join) + ' ]'
	      case '[object Object]':
	        var keyValuePairs = []
	        for (var k in value) {
	          keyValuePairs.push(util.format('@"%s": %s', k, this.literalRepresentation(value[k])))
	        }
	        return '@{ ' + keyValuePairs.join(join) + ' }'
	      case '[object Boolean]':
	        return value ? '@YES' : '@NO'
	      default:
	        return '@"' + value.toString().replace(/"/g, '\\"') + '"'
	    }
	  }
	}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'ocaml',
	    title: 'OCaml',
	    extname: '.ml',
	    default: 'cohttp'
	  },
	
	  cohttp: __webpack_require__(36)
	}


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for OCaml using CoHTTP.
	 *
	 * @author
	 * @SGrondin
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  '
	  }, options)
	
	  var methods = ['get', 'post', 'head', 'delete', 'patch', 'put', 'options']
	  var code = new CodeBuilder(opts.indent)
	
	  code.push('open Cohttp_lwt_unix')
	      .push('open Cohttp')
	      .push('open Lwt')
	      .blank()
	      .push('let uri = Uri.of_string "%s" in', source.fullUrl)
	
	  // Add headers, including the cookies
	  var headers = Object.keys(source.allHeaders)
	
	  if (headers.length === 1) {
	    code.push('let headers = Header.add (Header.init ()) "%s" "%s" in', headers[0], source.allHeaders[headers[0]])
	  } else if (headers.length > 1) {
	    code.push('let headers = Header.add_list (Header.init ()) [')
	
	    headers.forEach(function (key) {
	      code.push(1, '("%s", "%s");', key, source.allHeaders[key])
	    })
	
	    code.push('] in')
	  }
	
	  // Add body
	  if (source.postData.text) {
	    // Just text
	    code.push('let body = Cohttp_lwt_body.of_string %s in', JSON.stringify(source.postData.text))
	  }
	
	  // Do the request
	  code.blank()
	
	  code.push('Client.call %s%s%s uri',
	    headers.length ? '~headers ' : '',
	    source.postData.text ? '~body ' : '',
	    (methods.indexOf(source.method.toLowerCase()) >= 0 ? ('`' + source.method.toUpperCase()) : '(Code.method_of_string "' + source.method + '")')
	  )
	
	  // Catch result
	  code.push('>>= fun (res, body_stream) ->')
	      .push(1, '(* Do stuff with the result *)')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'cohttp',
	  title: 'CoHTTP',
	  link: 'https://github.com/mirage/ocaml-cohttp',
	  description: 'Cohttp is a very lightweight HTTP server using Lwt or Async for OCaml'
	}


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'php',
	    title: 'PHP',
	    extname: '.php',
	    default: 'curl'
	  },
	
	  curl: __webpack_require__(38),
	  http1: __webpack_require__(39),
	  http2: __webpack_require__(41)
	}


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for PHP using curl-ext.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    closingTag: false,
	    indent: '  ',
	    maxRedirects: 10,
	    namedErrors: false,
	    noTags: false,
	    shortTags: false,
	    timeout: 30
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  if (!opts.noTags) {
	    code.push(opts.shortTags ? '<?' : '<?php')
	      .blank()
	  }
	
	  code.push('$curl = curl_init();')
	    .blank()
	
	  var curlOptions = [{
	    escape: true,
	    name: 'CURLOPT_PORT',
	    value: source.uriObj.port
	  }, {
	    escape: true,
	    name: 'CURLOPT_URL',
	    value: source.fullUrl
	  }, {
	    escape: false,
	    name: 'CURLOPT_RETURNTRANSFER',
	    value: 'true'
	  }, {
	    escape: true,
	    name: 'CURLOPT_ENCODING',
	    value: ''
	  }, {
	    escape: false,
	    name: 'CURLOPT_MAXREDIRS',
	    value: opts.maxRedirects
	  }, {
	    escape: false,
	    name: 'CURLOPT_TIMEOUT',
	    value: opts.timeout
	  }, {
	    escape: false,
	    name: 'CURLOPT_HTTP_VERSION',
	    value: source.httpVersion === 'HTTP/1.0' ? 'CURL_HTTP_VERSION_1_0' : 'CURL_HTTP_VERSION_1_1'
	  }, {
	    escape: true,
	    name: 'CURLOPT_CUSTOMREQUEST',
	    value: source.method
	  }, {
	    escape: true,
	    name: 'CURLOPT_POSTFIELDS',
	    value: source.postData ? source.postData.text : undefined
	  }]
	
	  code.push('curl_setopt_array($curl, array(')
	
	  var curlopts = new CodeBuilder(opts.indent, '\n' + opts.indent)
	
	  curlOptions.forEach(function (option) {
	    if (!~[null, undefined].indexOf(option.value)) {
	      curlopts.push(util.format('%s => %s,', option.name, option.escape ? JSON.stringify(option.value) : option.value))
	    }
	  })
	
	  // construct cookies
	  var cookies = source.cookies.map(function (cookie) {
	    return encodeURIComponent(cookie.name) + '=' + encodeURIComponent(cookie.value)
	  })
	
	  if (cookies.length) {
	    curlopts.push(util.format('CURLOPT_COOKIE => "%s",', cookies.join('; ')))
	  }
	
	  // construct cookies
	  var headers = Object.keys(source.headersObj).sort().map(function (key) {
	    return util.format('"%s: %s"', key, source.headersObj[key])
	  })
	
	  if (headers.length) {
	    curlopts.push('CURLOPT_HTTPHEADER => array(')
	      .push(1, headers.join(',\n' + opts.indent + opts.indent))
	      .push('),')
	  }
	
	  code.push(1, curlopts.join())
	    .push('));')
	    .blank()
	    .push('$response = curl_exec($curl);')
	    .push('$err = curl_error($curl);')
	    .blank()
	    .push('curl_close($curl);')
	    .blank()
	    .push('if ($err) {')
	
	  if (opts.namedErrors) {
	    code.push(1, 'echo array_flip(get_defined_constants(true)["curl"])[$err];')
	  } else {
	    code.push(1, 'echo "cURL Error #:" . $err;')
	  }
	
	  code.push('} else {')
	    .push(1, 'echo $response;')
	    .push('}')
	
	  if (!opts.noTags && opts.closingTag) {
	    code.blank()
	      .push('?>')
	  }
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'curl',
	  title: 'cURL',
	  link: 'http://php.net/manual/en/book.curl.php',
	  description: 'PHP with ext-curl'
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for PHP using curl-ext.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var helpers = __webpack_require__(40)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    closingTag: false,
	    indent: '  ',
	    noTags: false,
	    shortTags: false
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  if (!opts.noTags) {
	    code.push(opts.shortTags ? '<?' : '<?php')
	        .blank()
	  }
	
	  if (!~helpers.methods.indexOf(source.method.toUpperCase())) {
	    code.push('HttpRequest::methodRegister(\'%s\');', source.method)
	  }
	
	  code.push('$request = new HttpRequest();')
	      .push('$request->setUrl(%s);', helpers.convert(source.url))
	
	  if (~helpers.methods.indexOf(source.method.toUpperCase())) {
	    code.push('$request->setMethod(HTTP_METH_%s);', source.method.toUpperCase())
	  } else {
	    code.push('$request->setMethod(HttpRequest::HTTP_METH_%s);', source.method.toUpperCase())
	  }
	
	  code.blank()
	
	  if (Object.keys(source.queryObj).length) {
	    code.push('$request->setQueryData(%s);', helpers.convert(source.queryObj, opts.indent))
	        .blank()
	  }
	
	  if (Object.keys(source.headersObj).length) {
	    code.push('$request->setHeaders(%s);', helpers.convert(source.headersObj, opts.indent))
	        .blank()
	  }
	
	  if (Object.keys(source.cookiesObj).length) {
	    code.push('$request->setCookies(%s);', helpers.convert(source.cookiesObj, opts.indent))
	        .blank()
	  }
	
	  switch (source.postData.mimeType) {
	    case 'application/x-www-form-urlencoded':
	      code.push('$request->setContentType(%s);', helpers.convert(source.postData.mimeType))
	          .push('$request->setPostFields(%s);', helpers.convert(source.postData.paramsObj, opts.indent))
	          .blank()
	      break
	
	    default:
	      if (source.postData.text) {
	        code.push('$request->setBody(%s);', helpers.convert(source.postData.text))
	            .blank()
	      }
	  }
	
	  code.push('try {')
	      .push(1, '$response = $request->send();')
	      .blank()
	      .push(1, 'echo $response->getBody();')
	      .push('} catch (HttpException $ex) {')
	      .push(1, 'echo $ex;')
	      .push('}')
	
	  if (!opts.noTags && opts.closingTag) {
	    code.blank()
	        .push('?>')
	  }
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'http1',
	  title: 'HTTP v1',
	  link: 'http://php.net/manual/en/book.http.php',
	  description: 'PHP with pecl/http v1'
	}


/***/ },
/* 40 */
/***/ function(module, exports) {

	'use strict'
	
	var convert = function (obj, indent, last_indent) {
	  var i, result
	
	  if (!last_indent) {
	    last_indent = ''
	  }
	
	  switch (Object.prototype.toString.call(obj)) {
	    case '[object Null]':
	      result = 'null'
	      break
	
	    case '[object Undefined]':
	      result = 'null'
	      break
	
	    case '[object String]':
	      result = "'" + obj.replace(/\\/g, '\\\\').replace(/\'/g, "\'") + "'"
	      break
	
	    case '[object Number]':
	      result = obj.toString()
	      break
	
	    case '[object Array]':
	      result = []
	
	      obj.forEach(function (item) {
	        result.push(convert(item, indent + indent, indent))
	      })
	
	      result = 'array(\n' + indent + result.join(',\n' + indent) + '\n' + last_indent + ')'
	      break
	
	    case '[object Object]':
	      result = []
	      for (i in obj) {
	        if (obj.hasOwnProperty(i)) {
	          result.push(convert(i, indent) + ' => ' + convert(obj[i], indent + indent, indent))
	        }
	      }
	      result = 'array(\n' + indent + result.join(',\n' + indent) + '\n' + last_indent + ')'
	      break
	
	    default:
	      result = 'null'
	  }
	
	  return result
	}
	
	module.exports = {
	  convert: convert,
	  methods: [
	    'ACL',
	    'BASELINE_CONTROL',
	    'CHECKIN',
	    'CHECKOUT',
	    'CONNECT',
	    'COPY',
	    'DELETE',
	    'GET',
	    'HEAD',
	    'LABEL',
	    'LOCK',
	    'MERGE',
	    'MKACTIVITY',
	    'MKCOL',
	    'MKWORKSPACE',
	    'MOVE',
	    'OPTIONS',
	    'POST',
	    'PROPFIND',
	    'PROPPATCH',
	    'PUT',
	    'REPORT',
	    'TRACE',
	    'UNCHECKOUT',
	    'UNLOCK',
	    'UPDATE',
	    'VERSION_CONTROL'
	  ]
	}


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for PHP using curl-ext.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var helpers = __webpack_require__(40)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    closingTag: false,
	    indent: '  ',
	    noTags: false,
	    shortTags: false
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	  var hasBody = false
	
	  if (!opts.noTags) {
	    code.push(opts.shortTags ? '<?' : '<?php')
	        .blank()
	  }
	
	  code.push('$client = new http\\Client;')
	      .push('$request = new http\\Client\\Request;')
	      .blank()
	
	  switch (source.postData.mimeType) {
	    case 'application/x-www-form-urlencoded':
	      code.push('$body = new http\\Message\\Body;')
	          .push('$body->append(new http\\QueryString(%s));', helpers.convert(source.postData.paramsObj, opts.indent))
	          .blank()
	      hasBody = true
	      break
	
	    case 'multipart/form-data':
	      var files = []
	      var fields = {}
	
	      source.postData.params.forEach(function (param) {
	        if (param.fileName) {
	          files.push({
	            name: param.name,
	            type: param.contentType,
	            file: param.fileName,
	            data: param.value
	          })
	        } else if (param.value) {
	          fields[param.name] = param.value
	        }
	      })
	
	      code.push('$body = new http\\Message\\Body;')
	          .push('$body->addForm(%s, %s);',
	            Object.keys(fields).length ? helpers.convert(fields, opts.indent) : 'NULL',
	            files.length ? helpers.convert(files, opts.indent) : 'NULL'
	          )
	
	      // remove the contentType header
	      if (~source.headersObj['content-type'].indexOf('boundary')) {
	        delete source.headersObj['content-type']
	      }
	
	      code.blank()
	
	      hasBody = true
	      break
	
	    default:
	      if (source.postData.text) {
	        code.push('$body = new http\\Message\\Body;')
	            .push('$body->append(%s);', helpers.convert(source.postData.text))
	            .blank()
	        hasBody = true
	      }
	  }
	
	  code.push('$request->setRequestUrl(%s);', helpers.convert(source.url))
	      .push('$request->setRequestMethod(%s);', helpers.convert(source.method))
	
	  if (hasBody) {
	    code.push('$request->setBody($body);')
	        .blank()
	  }
	
	  if (Object.keys(source.queryObj).length) {
	    code.push('$request->setQuery(new http\\QueryString(%s));', helpers.convert(source.queryObj, opts.indent))
	        .blank()
	  }
	
	  if (Object.keys(source.headersObj).length) {
	    code.push('$request->setHeaders(%s);', helpers.convert(source.headersObj, opts.indent))
	        .blank()
	  }
	
	  if (Object.keys(source.cookiesObj).length) {
	    code.blank()
	        .push('$client->setCookies(%s);', helpers.convert(source.cookiesObj, opts.indent))
	        .blank()
	  }
	
	  code.push('$client->enqueue($request)->send();')
	      .push('$response = $client->getResponse();')
	      .blank()
	      .push('echo $response->getBody();')
	
	  if (!opts.noTags && opts.closingTag) {
	    code.blank()
	        .push('?>')
	  }
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'http2',
	  title: 'HTTP v2',
	  link: 'http://devel-m6w6.rhcloud.com/mdref/http',
	  description: 'PHP with pecl/http v2'
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'python',
	    title: 'Python',
	    extname: '.py',
	    default: 'python3'
	  },
	
	  python3: __webpack_require__(43),
	  requests: __webpack_require__(44)
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for native Python3.
	 *
	 * @author
	 * @montanaflynn
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var code = new CodeBuilder()
	  // Start Request
	  code.push('import http.client')
	      .blank()
	
	  // Check which protocol to be used for the client connection
	  var protocol = source.uriObj.protocol
	  if (protocol === 'https:') {
	    code.push('conn = http.client.HTTPSConnection("%s")', source.uriObj.host)
	        .blank()
	  } else {
	    code.push('conn = http.client.HTTPConnection("%s")', source.uriObj.host)
	        .blank()
	  }
	
	  // Create payload string if it exists
	  var payload = JSON.stringify(source.postData.text)
	  if (payload) {
	    code.push('payload = %s', payload)
	        .blank()
	  }
	
	  // Create Headers
	  var header
	  var headers = source.allHeaders
	  var headerCount = Object.keys(headers).length
	  if (headerCount === 1) {
	    for (header in headers) {
	      code.push('headers = { \'%s\': "%s" }', header, headers[header])
	          .blank()
	    }
	  } else if (headerCount > 1) {
	    var count = 1
	
	    code.push('headers = {')
	
	    for (header in headers) {
	      if (count++ !== headerCount) {
	        code.push('    \'%s\': "%s",', header, headers[header])
	      } else {
	        code.push('    \'%s\': "%s"', header, headers[header])
	      }
	    }
	
	    code.push('    }')
	        .blank()
	  }
	
	  // Make Request
	  var method = source.method
	  var path = source.uriObj.path
	  if (payload && headerCount) {
	    code.push('conn.request("%s", "%s", payload, headers)', method, path)
	  } else if (payload && !headerCount) {
	    code.push('conn.request("%s", "%s", payload)', method, path)
	  } else if (!payload && headerCount) {
	    code.push('conn.request("%s", "%s", headers=headers)', method, path)
	  } else {
	    code.push('conn.request("%s", "%s")', method, path)
	  }
	
	  // Get Response
	  code.blank()
	      .push('res = conn.getresponse()')
	      .push('data = res.read()')
	      .blank()
	      .push('print(data.decode("utf-8"))')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'python3',
	  title: 'http.client',
	  link: 'https://docs.python.org/3/library/http.client.html',
	  description: 'Python3 HTTP Client'
	}


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Python using Requests
	 *
	 * @author
	 * @montanaflynn
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  // Start snippet
	  var code = new CodeBuilder('    ')
	
	  // Import requests
	  code.push('import requests')
	      .blank()
	
	  // Set URL
	  code.push('url = "%s"', source.url)
	      .blank()
	
	  // Construct query string
	  if (source.queryString.length) {
	    var qs = 'querystring = ' + JSON.stringify(source.queryObj)
	
	    code.push(qs)
	        .blank()
	  }
	
	  // Construct payload
	  var payload = JSON.stringify(source.postData.text)
	
	  if (payload) {
	    code.push('payload = %s', payload)
	  }
	
	  // Construct headers
	  var header
	  var headers = source.allHeaders
	  var headerCount = Object.keys(headers).length
	
	  if (headerCount === 1) {
	    for (header in headers) {
	      code.push('headers = {\'%s\': \'%s\'}', header, headers[header])
	          .blank()
	    }
	  } else if (headerCount > 1) {
	    var count = 1
	
	    code.push('headers = {')
	
	    for (header in headers) {
	      if (count++ !== headerCount) {
	        code.push(1, '\'%s\': "%s",', header, headers[header])
	      } else {
	        code.push(1, '\'%s\': "%s"', header, headers[header])
	      }
	    }
	
	    code.push(1, '}')
	        .blank()
	  }
	
	  // Construct request
	  var method = source.method
	  var request = util.format('response = requests.request("%s", url', method)
	
	  if (payload) {
	    request += ', data=payload'
	  }
	
	  if (headerCount > 0) {
	    request += ', headers=headers'
	  }
	
	  if (qs) {
	    request += ', params=querystring'
	  }
	
	  request += ')'
	
	  code.push(request)
	      .blank()
	
	      // Print response
	      .push('print(response.text)')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'requests',
	  title: 'Requests',
	  link: 'http://docs.python-requests.org/en/latest/api/#requests.request',
	  description: 'Requests HTTP library'
	}
	
	// response = requests.request("POST", url, data=payload, headers=headers, params=querystring)


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'ruby',
	    title: 'Ruby',
	    extname: '.rb',
	    default: 'native'
	  },
	
	  native: __webpack_require__(46)
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var code = new CodeBuilder()
	
	  code.push('require \'uri\'')
	      .push('require \'net/http\'')
	      .blank()
	
	  // To support custom methods we check for the supported methods
	  // and if doesn't exist then we build a custom class for it
	  var method = source.method.toUpperCase()
	  var methods = ['GET', 'POST', 'HEAD', 'DELETE', 'PATCH', 'PUT', 'OPTIONS', 'COPY', 'LOCK', 'UNLOCK', 'MOVE', 'TRACE']
	  var capMethod = method.charAt(0) + method.substring(1).toLowerCase()
	  if (methods.indexOf(method) < 0) {
	    code.push('class Net::HTTP::%s < Net::HTTPRequest', capMethod)
	        .push('  METHOD = \'%s\'', method.toUpperCase())
	        .push('  REQUEST_HAS_BODY = \'%s\'', source.postData.text ? 'true' : 'false')
	        .push('  RESPONSE_HAS_BODY = true')
	        .push('end')
	        .blank()
	  }
	
	  code.push('url = URI("%s")', source.fullUrl)
	      .blank()
	      .push('http = Net::HTTP.new(url.host, url.port)')
	
	  if (source.uriObj.protocol === 'https:') {
	    code.push('http.use_ssl = true')
	        .push('http.verify_mode = OpenSSL::SSL::VERIFY_NONE')
	  }
	
	  code.blank()
	      .push('request = Net::HTTP::%s.new(url)', capMethod)
	
	  var headers = Object.keys(source.allHeaders)
	  if (headers.length) {
	    headers.forEach(function (key) {
	      code.push('request["%s"] = \'%s\'', key, source.allHeaders[key])
	    })
	  }
	
	  if (source.postData.text) {
	    code.push('request.body = %s', JSON.stringify(source.postData.text))
	  }
	
	  code.blank()
	      .push('response = http.request(request)')
	      .push('puts response.read_body')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'native',
	  title: 'net::http',
	  link: 'http://ruby-doc.org/stdlib-2.2.1/libdoc/net/http/rdoc/Net/HTTP.html',
	  description: 'Ruby HTTP client'
	}


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'shell',
	    title: 'Shell',
	    extname: '.sh',
	    default: 'curl'
	  },
	
	  curl: __webpack_require__(48),
	  httpie: __webpack_require__(50),
	  wget: __webpack_require__(51)
	}


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for the Shell using cURL.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var helpers = __webpack_require__(49)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  ',
	    short: false,
	    binary: false
	  }, options)
	
	  var code = new CodeBuilder(opts.indent, opts.indent !== false ? ' \\\n' + opts.indent : ' ')
	
	  code.push('curl %s %s', opts.short ? '-X' : '--request', source.method)
	      .push(util.format('%s%s', opts.short ? '' : '--url ', helpers.quote(source.fullUrl)))
	
	  if (source.httpVersion === 'HTTP/1.0') {
	    code.push(opts.short ? '-0' : '--http1.0')
	  }
	
	  // construct headers
	  Object.keys(source.headersObj).sort().forEach(function (key) {
	    var header = util.format('%s: %s', key, source.headersObj[key])
	    code.push('%s %s', opts.short ? '-H' : '--header', helpers.quote(header))
	  })
	
	  if (source.allHeaders.cookie) {
	    code.push('%s %s', opts.short ? '-b' : '--cookie', helpers.quote(source.allHeaders.cookie))
	  }
	
	  // construct post params
	  switch (source.postData.mimeType) {
	    case 'multipart/form-data':
	      source.postData.params.map(function (param) {
	        var post = util.format('%s=%s', param.name, param.value)
	
	        if (param.fileName && !param.value) {
	          post = util.format('%s=@%s', param.name, param.fileName)
	        }
	
	        code.push('%s %s', opts.short ? '-F' : '--form', helpers.quote(post))
	      })
	      break
	
	    default:
	      // raw request body
	      if (source.postData.text) {
	        code.push(
	          '%s %s', opts.binary ? '--data-binary' : (opts.short ? '-d' : '--data'),
	          helpers.escape(helpers.quote(source.postData.text))
	        )
	      }
	  }
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'curl',
	  title: 'cURL',
	  link: 'http://curl.haxx.se/',
	  description: 'cURL is a command line tool and library for transferring data with URL syntax'
	}


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var util = __webpack_require__(14)
	
	module.exports = {
	  /**
	   * Use 'strong quoting' using single quotes so that we only need
	   * to deal with nested single quote characters.
	   * http://wiki.bash-hackers.org/syntax/quoting#strong_quoting
	   */
	  quote: function (value) {
	    var safe = /^[a-z0-9-_/.@%^=:]+$/i
	
	    // Unless `value` is a simple shell-safe string, quote it.
	    if (!safe.test(value)) {
	      return util.format('\'%s\'', value.replace(/'/g, "\'\\'\'"))
	    }
	
	    return value
	  },
	
	  escape: function (value) {
	    return value.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
	  }
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for the Shell using HTTPie.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var shell = __webpack_require__(49)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    body: false,
	    cert: false,
	    headers: false,
	    indent: '  ',
	    pretty: false,
	    print: false,
	    queryParams: false,
	    short: false,
	    style: false,
	    timeout: false,
	    verbose: false,
	    verify: false
	  }, options)
	
	  var code = new CodeBuilder(opts.indent, opts.indent !== false ? ' \\\n' + opts.indent : ' ')
	
	  var raw = false
	  var flags = []
	
	  if (opts.headers) {
	    flags.push(opts.short ? '-h' : '--headers')
	  }
	
	  if (opts.body) {
	    flags.push(opts.short ? '-b' : '--body')
	  }
	
	  if (opts.verbose) {
	    flags.push(opts.short ? '-v' : '--verbose')
	  }
	
	  if (opts.print) {
	    flags.push(util.format('%s=%s', opts.short ? '-p' : '--print', opts.print))
	  }
	
	  if (opts.verify) {
	    flags.push(util.format('--verify=%s', opts.verify))
	  }
	
	  if (opts.cert) {
	    flags.push(util.format('--cert=%s', opts.cert))
	  }
	
	  if (opts.pretty) {
	    flags.push(util.format('--pretty=%s', opts.pretty))
	  }
	
	  if (opts.style) {
	    flags.push(util.format('--style=%s', opts.pretty))
	  }
	
	  if (opts.timeout) {
	    flags.push(util.format('--timeout=%s', opts.timeout))
	  }
	
	  // construct query params
	  if (opts.queryParams) {
	    var queryStringKeys = Object.keys(source.queryObj)
	
	    queryStringKeys.forEach(function (name) {
	      var value = source.queryObj[name]
	
	      if (util.isArray(value)) {
	        value.forEach(function (val) {
	          code.push('%s==%s', name, shell.quote(val))
	        })
	      } else {
	        code.push('%s==%s', name, shell.quote(value))
	      }
	    })
	  }
	
	  // construct headers
	  Object.keys(source.allHeaders).sort().forEach(function (key) {
	    code.push('%s:%s', key, shell.quote(source.allHeaders[key]))
	  })
	
	  if (source.postData.mimeType === 'application/x-www-form-urlencoded') {
	    // construct post params
	    if (source.postData.params && source.postData.params.length) {
	      flags.push(opts.short ? '-f' : '--form')
	
	      source.postData.params.forEach(function (param) {
	        code.push('%s=%s', param.name, shell.quote(param.value))
	      })
	    }
	  } else {
	    raw = true
	  }
	
	  code.unshift('http %s%s %s', flags.length ? flags.join(' ') + ' ' : '', source.method, shell.quote(opts.queryParams ? source.url : source.fullUrl))
	
	  if (raw && source.postData.text) {
	    code.unshift('echo %s | ', shell.quote(source.postData.text))
	  }
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'httpie',
	  title: 'HTTPie',
	  link: 'http://httpie.org/',
	  description: 'a CLI, cURL-like tool for humans'
	}


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for the Shell using Wget.
	 *
	 * @author
	 * @AhmadNassri
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var helpers = __webpack_require__(49)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  ',
	    short: false,
	    verbose: false
	  }, options)
	
	  var code = new CodeBuilder(opts.indent, opts.indent !== false ? ' \\\n' + opts.indent : ' ')
	
	  if (opts.verbose) {
	    code.push('wget %s', opts.short ? '-v' : '--verbose')
	  } else {
	    code.push('wget %s', opts.short ? '-q' : '--quiet')
	  }
	
	  code.push('--method %s', helpers.quote(source.method))
	
	  Object.keys(source.allHeaders).forEach(function (key) {
	    var header = util.format('%s: %s', key, source.allHeaders[key])
	    code.push('--header %s', helpers.quote(header))
	  })
	
	  if (source.postData.text) {
	    code.push('--body-data ' + helpers.escape(helpers.quote(source.postData.text)))
	  }
	
	  code.push(opts.short ? '-O' : '--output-document')
	      .push('- %s', helpers.quote(source.fullUrl))
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'wget',
	  title: 'Wget',
	  link: 'https://www.gnu.org/software/wget/',
	  description: 'a free software package for retrieving files using HTTP, HTTPS'
	}


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	module.exports = {
	  info: {
	    key: 'swift',
	    title: 'Swift',
	    extname: '.swift',
	    default: 'nsurlsession'
	  },
	
	  nsurlsession: __webpack_require__(53)
	}


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @description
	 * HTTP code snippet generator for Swift using NSURLSession.
	 *
	 * @author
	 * @thibaultCha
	 *
	 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
	 */
	
	'use strict'
	
	var util = __webpack_require__(14)
	var helpers = __webpack_require__(54)
	var CodeBuilder = __webpack_require__(13)
	
	module.exports = function (source, options) {
	  var opts = util._extend({
	    indent: '  ',
	    pretty: true,
	    timeout: '10'
	  }, options)
	
	  var code = new CodeBuilder(opts.indent)
	
	  // Markers for headers to be created as litteral objects and later be set on the NSURLRequest if exist
	  var req = {
	    hasHeaders: false,
	    hasBody: false
	  }
	
	  // We just want to make sure people understand that is the only dependency
	  code.push('import Foundation')
	
	  if (Object.keys(source.allHeaders).length) {
	    req.hasHeaders = true
	    code.blank()
	        .push(helpers.literalDeclaration('headers', source.allHeaders, opts))
	  }
	
	  if (source.postData.text || source.postData.jsonObj || source.postData.params) {
	    req.hasBody = true
	
	    switch (source.postData.mimeType) {
	      case 'application/x-www-form-urlencoded':
	        // By appending parameters one by one in the resulting snippet,
	        // we make it easier for the user to edit it according to his or her needs after pasting.
	        // The user can just add/remove lines adding/removing body parameters.
	        code.blank()
	            .push('var postData = NSMutableData(data: "%s=%s".dataUsingEncoding(NSUTF8StringEncoding)!)', source.postData.params[0].name, source.postData.params[0].value)
	        for (var i = 1, len = source.postData.params.length; i < len; i++) {
	          code.push('postData.appendData("&%s=%s".dataUsingEncoding(NSUTF8StringEncoding)!)', source.postData.params[i].name, source.postData.params[i].value)
	        }
	        break
	
	      case 'application/json':
	        if (source.postData.jsonObj) {
	          code.push(helpers.literalDeclaration('parameters', source.postData.jsonObj, opts))
	              .blank()
	              .push('let postData = NSJSONSerialization.dataWithJSONObject(parameters, options: nil, error: nil)')
	        }
	        break
	
	      case 'multipart/form-data':
	        /**
	         * By appending multipart parameters one by one in the resulting snippet,
	         * we make it easier for the user to edit it according to his or her needs after pasting.
	         * The user can just edit the parameters NSDictionary or put this part of a snippet in a multipart builder method.
	        */
	        code.push(helpers.literalDeclaration('parameters', source.postData.params, opts))
	            .blank()
	            .push('let boundary = "%s"', source.postData.boundary)
	            .blank()
	            .push('var body = ""')
	            .push('var error: NSError? = nil')
	            .push('for param in parameters {')
	            .push(1, 'let paramName = param["name"]!')
	            .push(1, 'body += "--\\(boundary)\\r\\n"')
	            .push(1, 'body += "Content-Disposition:form-data; name=\\"\\(paramName)\\""')
	            .push(1, 'if let filename = param["fileName"] {')
	            .push(2, 'let contentType = param["content-type"]!')
	            .push(2, 'let fileContent = String(contentsOfFile: filename, encoding: NSUTF8StringEncoding, error: &error)')
	            .push(2, 'if (error != nil) {')
	            .push(3, 'println(error)')
	            .push(2, '}')
	            .push(2, 'body += "; filename=\\"\\(filename)\\"\\r\\n"')
	            .push(2, 'body += "Content-Type: \\(contentType)\\r\\n\\r\\n"')
	            .push(2, 'body += fileContent!')
	            .push(1, '} else if let paramValue = param["value"] {')
	            .push(2, 'body += "\\r\\n\\r\\n\\(paramValue)"')
	            .push(1, '}')
	            .push('}')
	        break
	
	      default:
	        code.blank()
	            .push('let postData = NSData(data: "%s".dataUsingEncoding(NSUTF8StringEncoding)!)', source.postData.text)
	    }
	  }
	
	  code.blank()
	      // NSURLRequestUseProtocolCachePolicy is the default policy, let's just always set it to avoid confusion.
	      .push('var request = NSMutableURLRequest(URL: NSURL(string: "%s")!,', source.fullUrl)
	      .push('                                        cachePolicy: .UseProtocolCachePolicy,')
	      .push('                                    timeoutInterval: %s)', parseInt(opts.timeout, 10).toFixed(1))
	      .push('request.HTTPMethod = "%s"', source.method)
	
	  if (req.hasHeaders) {
	    code.push('request.allHTTPHeaderFields = headers')
	  }
	
	  if (req.hasBody) {
	    code.push('request.HTTPBody = postData')
	  }
	
	  code.blank()
	      // Retrieving the shared session will be less verbose than creating a new one.
	      .push('let session = NSURLSession.sharedSession()')
	      .push('let dataTask = session.dataTaskWithRequest(request, completionHandler: { (data, response, error) -> Void in')
	      .push(1, 'if (error != nil) {')
	      .push(2, 'println(error)')
	      .push(1, '} else {')
	      // Casting the NSURLResponse to NSHTTPURLResponse so the user can see the status     .
	      .push(2, 'let httpResponse = response as? NSHTTPURLResponse')
	      .push(2, 'println(httpResponse)')
	      .push(1, '}')
	      .push('})')
	      .blank()
	      .push('dataTask.resume()')
	
	  return code.join()
	}
	
	module.exports.info = {
	  key: 'nsurlsession',
	  title: 'NSURLSession',
	  link: 'https://developer.apple.com/library/mac/documentation/Foundation/Reference/NSURLSession_class/index.html',
	  description: 'Foundation\'s NSURLSession request'
	}


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	var util = __webpack_require__(14)
	
	/**
	 * Create an string of given length filled with blank spaces
	 *
	 * @param {number} length Length of the array to return
	 * @return {string}
	 */
	function buildString (length, str) {
	  return Array.apply(null, new Array(length)).map(String.prototype.valueOf, str).join('')
	}
	
	/**
	 * Create a string corresponding to a Dictionary or Array literal representation with pretty option
	 * and indentation.
	 */
	function concatArray (arr, pretty, indentation, indentLevel) {
	  var currentIndent = buildString(indentLevel, indentation)
	  var closingBraceIndent = buildString(indentLevel - 1, indentation)
	  var join = pretty ? ',\n' + currentIndent : ', '
	
	  if (pretty) {
	    return '[\n' + currentIndent + arr.join(join) + '\n' + closingBraceIndent + ']'
	  } else {
	    return '[' + arr.join(join) + ']'
	  }
	}
	
	module.exports = {
	  /**
	   * Create a string corresponding to a valid declaration and initialization of a Swift array or dictionary literal
	   *
	   * @param {string} name Desired name of the instance
	   * @param {Object} parameters Key-value object of parameters to translate to a Swift object litearal
	   * @param {Object} opts Target options
	   * @return {string}
	   */
	  literalDeclaration: function (name, parameters, opts) {
	    return util.format('let %s = %s', name, this.literalRepresentation(parameters, opts))
	  },
	
	  /**
	   * Create a valid Swift string of a literal value according to its type.
	   *
	   * @param {*} value Any JavaScript literal
	   * @param {Object} opts Target options
	   * @return {string}
	   */
	  literalRepresentation: function (value, opts, indentLevel) {
	    indentLevel = indentLevel === undefined ? 1 : indentLevel + 1
	
	    switch (Object.prototype.toString.call(value)) {
	      case '[object Number]':
	        return value
	      case '[object Array]':
	        // Don't prettify arrays nto not take too much space
	        var pretty = false
	        var valuesRepresentation = value.map(function (v) {
	          // Switch to prettify if the value is a dictionary with multiple keys
	          if (Object.prototype.toString.call(v) === '[object Object]') {
	            pretty = Object.keys(v).length > 1
	          }
	          return this.literalRepresentation(v, opts, indentLevel)
	        }.bind(this))
	        return concatArray(valuesRepresentation, pretty, opts.indent, indentLevel)
	      case '[object Object]':
	        var keyValuePairs = []
	        for (var k in value) {
	          keyValuePairs.push(util.format('"%s": %s', k, this.literalRepresentation(value[k], opts, indentLevel)))
	        }
	        return concatArray(keyValuePairs, opts.pretty && keyValuePairs.length > 1, opts.indent, indentLevel)
	      case '[object Boolean]':
	        return value.toString()
	      default:
	        return '"' + value.toString().replace(/"/g, '\\"') + '"'
	    }
	  }
	}


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var punycode = __webpack_require__(56);
	
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	
	exports.Url = Url;
	
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}
	
	// Reference: RFC 3986, RFC 1808, RFC 2396
	
	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,
	
	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(6);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }
	
	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }
	
	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c
	
	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.
	
	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	
	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }
	
	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }
	
	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;
	
	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);
	
	    // pull out port.
	    this.parseHost();
	
	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';
	
	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';
	
	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }
	
	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }
	
	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a puny coded representation of "domain".
	      // It only converts the part of the domain name that
	      // has non ASCII characters. I.e. it dosent matter if
	      // you call it with a domain that already is in ASCII.
	      var domainArray = this.hostname.split('.');
	      var newOut = [];
	      for (var i = 0; i < domainArray.length; ++i) {
	        var s = domainArray[i];
	        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
	            'xn--' + punycode.encode(s) : s);
	      }
	      this.hostname = newOut.join('.');
	    }
	
	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;
	
	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }
	
	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {
	
	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }
	
	
	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }
	
	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }
	
	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};
	
	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}
	
	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }
	
	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';
	
	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }
	
	  if (this.query &&
	      isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }
	
	  var search = this.search || (query && ('?' + query)) || '';
	
	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }
	
	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;
	
	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');
	
	  return protocol + host + pathname + search + hash;
	};
	
	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}
	
	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};
	
	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}
	
	Url.prototype.resolveObject = function(relative) {
	  if (isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  Object.keys(this).forEach(function(k) {
	    result[k] = this[k];
	  }, this);
	
	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;
	
	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }
	
	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    Object.keys(relative).forEach(function(k) {
	      if (k !== 'protocol')
	        result[k] = relative[k];
	    });
	
	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }
	
	    result.href = result.format();
	    return result;
	  }
	
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      Object.keys(relative).forEach(function(k) {
	        result[k] = relative[k];
	      });
	      result.href = result.format();
	      return result;
	    }
	
	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }
	
	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];
	
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especialy happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!isNull(result.pathname) || !isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host) && (last === '.' || last === '..') ||
	      last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last == '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }
	
	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }
	
	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }
	
	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');
	
	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especialy happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }
	
	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }
	
	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }
	
	  //to support request.http
	  if (!isNull(result.pathname) || !isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};
	
	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};
	
	function isString(arg) {
	  return typeof arg === "string";
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isNull(arg) {
	  return arg === null;
	}
	function isNullOrUndefined(arg) {
	  return  arg == null;
	}


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {
	
		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}
	
		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,
	
		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'
	
		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},
	
		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,
	
		/** Temporary variable */
		key;
	
		/*--------------------------------------------------------------------------*/
	
		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}
	
		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}
	
		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}
	
		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}
	
		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}
	
		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
	
		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
	
		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;
	
			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.
	
			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}
	
			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}
	
			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.
	
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
					if (index >= inputLength) {
						error('invalid-input');
					}
	
					digit = basicToDigit(input.charCodeAt(index++));
	
					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}
	
					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
					if (digit < t) {
						break;
					}
	
					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}
	
					w *= baseMinusT;
	
				}
	
				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);
	
				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}
	
				n += floor(i / out);
				i %= out;
	
				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
	
			}
	
			return ucs2encode(output);
		}
	
		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;
	
			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);
	
			// Cache the length
			inputLength = input.length;
	
			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;
	
			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}
	
			handledCPCount = basicLength = output.length;
	
			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.
	
			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}
	
			// Main encoding loop:
			while (handledCPCount < inputLength) {
	
				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}
	
				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}
	
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
	
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
	
					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}
	
					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}
	
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
	
				++delta;
				++n;
	
			}
			return output.join('');
		}
	
		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}
	
		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}
	
		/*--------------------------------------------------------------------------*/
	
		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};
	
		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(57)(module), (function() { return this; }())))

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.validator = validator;
	exports.default = har;
	exports.cache = cache;
	exports.cacheEntry = cacheEntry;
	exports.content = content;
	exports.cookie = cookie;
	exports.creator = creator;
	exports.entry = entry;
	exports.log = log;
	exports.page = page;
	exports.pageTimings = pageTimings;
	exports.postData = postData;
	exports.record = record;
	exports.request = request;
	exports.response = response;
	exports.timings = timings;
	
	var _schemas = __webpack_require__(59);
	
	var schemas = _interopRequireWildcard(_schemas);
	
	var _error = __webpack_require__(75);
	
	var _error2 = _interopRequireDefault(_error);
	
	var _isMyJsonValid = __webpack_require__(76);
	
	var _isMyJsonValid2 = _interopRequireDefault(_isMyJsonValid);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function validator(schema) {
	  var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	  var cb = arguments[2];
	
	  // default value
	  var valid = false;
	
	  // validator config
	  var validate = (0, _isMyJsonValid2.default)(schema, {
	    greedy: true,
	    verbose: true,
	    schemas: schemas
	  });
	
	  // execute is-my-json-valid
	  valid = validate(data);
	
	  // callback?
	  if (typeof cb === 'function') {
	    return cb(validate.errors ? new _error2.default(validate.errors) : null, valid);
	  }
	
	  return valid;
	}
	
	function har(data, cb) {
	  return validator(schemas.har, data, cb);
	}
	
	function cache(data, cb) {
	  return validator(schemas.cache, data, cb);
	}
	
	function cacheEntry(data, cb) {
	  return validator(schemas.cacheEntry, data, cb);
	}
	
	function content(data, cb) {
	  return validator(schemas.content, data, cb);
	}
	
	function cookie(data, cb) {
	  return validator(schemas.cookie, data, cb);
	}
	
	function creator(data, cb) {
	  return validator(schemas.creator, data, cb);
	}
	
	function entry(data, cb) {
	  return validator(schemas.entry, data, cb);
	}
	
	function log(data, cb) {
	  return validator(schemas.log, data, cb);
	}
	
	function page(data, cb) {
	  return validator(schemas.page, data, cb);
	}
	
	function pageTimings(data, cb) {
	  return validator(schemas.pageTimings, data, cb);
	}
	
	function postData(data, cb) {
	  return validator(schemas.postData, data, cb);
	}
	
	function record(data, cb) {
	  return validator(schemas.record, data, cb);
	}
	
	function request(data, cb) {
	  return validator(schemas.request, data, cb);
	}
	
	function response(data, cb) {
	  return validator(schemas.response, data, cb);
	}
	
	function timings(data, cb) {
	  return validator(schemas.timings, data, cb);
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.timings = exports.response = exports.request = exports.record = exports.postData = exports.pageTimings = exports.page = exports.log = exports.har = exports.entry = exports.creator = exports.cookie = exports.content = exports.cacheEntry = exports.cache = undefined;
	
	var _cache = __webpack_require__(60);
	
	var _cache2 = _interopRequireDefault(_cache);
	
	var _cacheEntry = __webpack_require__(61);
	
	var _cacheEntry2 = _interopRequireDefault(_cacheEntry);
	
	var _content = __webpack_require__(62);
	
	var _content2 = _interopRequireDefault(_content);
	
	var _cookie = __webpack_require__(63);
	
	var _cookie2 = _interopRequireDefault(_cookie);
	
	var _creator = __webpack_require__(64);
	
	var _creator2 = _interopRequireDefault(_creator);
	
	var _entry = __webpack_require__(65);
	
	var _entry2 = _interopRequireDefault(_entry);
	
	var _har = __webpack_require__(66);
	
	var _har2 = _interopRequireDefault(_har);
	
	var _log = __webpack_require__(67);
	
	var _log2 = _interopRequireDefault(_log);
	
	var _page = __webpack_require__(68);
	
	var _page2 = _interopRequireDefault(_page);
	
	var _pageTimings = __webpack_require__(69);
	
	var _pageTimings2 = _interopRequireDefault(_pageTimings);
	
	var _postData = __webpack_require__(70);
	
	var _postData2 = _interopRequireDefault(_postData);
	
	var _record = __webpack_require__(71);
	
	var _record2 = _interopRequireDefault(_record);
	
	var _request = __webpack_require__(72);
	
	var _request2 = _interopRequireDefault(_request);
	
	var _response = __webpack_require__(73);
	
	var _response2 = _interopRequireDefault(_response);
	
	var _timings = __webpack_require__(74);
	
	var _timings2 = _interopRequireDefault(_timings);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*
	 * copy external scheams internally
	 * is-my-json-valid does not provide meaningful error messages for external schemas
	 */
	
	_cache2.default.properties.beforeRequest = _cacheEntry2.default;
	_cache2.default.properties.afterRequest = _cacheEntry2.default;
	
	_page2.default.properties.pageTimings = _pageTimings2.default;
	
	_request2.default.properties.cookies.items = _cookie2.default;
	_request2.default.properties.headers.items = _record2.default;
	_request2.default.properties.queryString.items = _record2.default;
	_request2.default.properties.postData = _postData2.default;
	
	_response2.default.properties.cookies.items = _cookie2.default;
	_response2.default.properties.headers.items = _record2.default;
	_response2.default.properties.content = _content2.default;
	
	_entry2.default.properties.request = _request2.default;
	_entry2.default.properties.response = _response2.default;
	_entry2.default.properties.cache = _cache2.default;
	_entry2.default.properties.timings = _timings2.default;
	
	_log2.default.properties.creator = _creator2.default;
	_log2.default.properties.browser = _creator2.default;
	_log2.default.properties.pages.items = _page2.default;
	_log2.default.properties.entries.items = _entry2.default;
	
	_har2.default.properties.log = _log2.default;
	
	exports.cache = _cache2.default;
	exports.cacheEntry = _cacheEntry2.default;
	exports.content = _content2.default;
	exports.cookie = _cookie2.default;
	exports.creator = _creator2.default;
	exports.entry = _entry2.default;
	exports.har = _har2.default;
	exports.log = _log2.default;
	exports.page = _page2.default;
	exports.pageTimings = _pageTimings2.default;
	exports.postData = _postData2.default;
	exports.record = _record2.default;
	exports.request = _request2.default;
	exports.response = _response2.default;
	exports.timings = _timings2.default;

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = {
		"properties": {
			"beforeRequest": {
				"$ref": "#cacheEntry"
			},
			"afterRequest": {
				"$ref": "#cacheEntry"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = {
		"oneOf": [
			{
				"type": "object",
				"optional": true,
				"required": [
					"lastAccess",
					"eTag",
					"hitCount"
				],
				"properties": {
					"expires": {
						"type": "string"
					},
					"lastAccess": {
						"type": "string"
					},
					"eTag": {
						"type": "string"
					},
					"hitCount": {
						"type": "integer"
					},
					"comment": {
						"type": "string"
					}
				}
			},
			{
				"type": null,
				"additionalProperties": false
			}
		]
	};

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"size",
			"mimeType"
		],
		"properties": {
			"size": {
				"type": "integer"
			},
			"compression": {
				"type": "integer"
			},
			"mimeType": {
				"type": "string"
			},
			"text": {
				"type": "string"
			},
			"encoding": {
				"type": "string"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"name",
			"value"
		],
		"properties": {
			"name": {
				"type": "string"
			},
			"value": {
				"type": "string"
			},
			"path": {
				"type": "string"
			},
			"domain": {
				"type": "string"
			},
			"expires": {
				"type": [
					"string",
					"null"
				],
				"format": "date-time"
			},
			"httpOnly": {
				"type": "boolean"
			},
			"secure": {
				"type": "boolean"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"name",
			"version"
		],
		"properties": {
			"name": {
				"type": "string"
			},
			"version": {
				"type": "string"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"optional": true,
		"required": [
			"startedDateTime",
			"time",
			"request",
			"response",
			"cache",
			"timings"
		],
		"properties": {
			"pageref": {
				"type": "string"
			},
			"startedDateTime": {
				"type": "string",
				"format": "date-time",
				"pattern": "^(\\d{4})(-)?(\\d\\d)(-)?(\\d\\d)(T)?(\\d\\d)(:)?(\\d\\d)(:)?(\\d\\d)(\\.\\d+)?(Z|([+-])(\\d\\d)(:)?(\\d\\d))"
			},
			"time": {
				"type": "number",
				"min": 0
			},
			"request": {
				"$ref": "#request"
			},
			"response": {
				"$ref": "#response"
			},
			"cache": {
				"$ref": "#cache"
			},
			"timings": {
				"$ref": "#timings"
			},
			"serverIPAddress": {
				"type": "string",
				"oneOf": [
					{
						"format": "ipv4"
					},
					{
						"format": "ipv6"
					}
				]
			},
			"connection": {
				"type": "string"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"log"
		],
		"properties": {
			"log": {
				"$ref": "#log"
			}
		}
	};

/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"version",
			"creator",
			"entries"
		],
		"properties": {
			"version": {
				"type": "string"
			},
			"creator": {
				"$ref": "#creator"
			},
			"browser": {
				"$ref": "#creator"
			},
			"pages": {
				"type": "array",
				"items": {
					"$ref": "#page"
				}
			},
			"entries": {
				"type": "array",
				"items": {
					"$ref": "#entry"
				}
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 68 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"optional": true,
		"required": [
			"startedDateTime",
			"id",
			"title",
			"pageTimings"
		],
		"properties": {
			"startedDateTime": {
				"type": "string",
				"format": "date-time",
				"pattern": "^(\\d{4})(-)?(\\d\\d)(-)?(\\d\\d)(T)?(\\d\\d)(:)?(\\d\\d)(:)?(\\d\\d)(\\.\\d+)?(Z|([+-])(\\d\\d)(:)?(\\d\\d))"
			},
			"id": {
				"type": "string",
				"unique": true
			},
			"title": {
				"type": "string"
			},
			"pageTimings": {
				"$ref": "#pageTimings"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"properties": {
			"onContentLoad": {
				"type": "number",
				"min": -1
			},
			"onLoad": {
				"type": "number",
				"min": -1
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"optional": true,
		"required": [
			"mimeType"
		],
		"properties": {
			"mimeType": {
				"type": "string"
			},
			"text": {
				"type": "string"
			},
			"params": {
				"type": "array",
				"required": [
					"name"
				],
				"properties": {
					"name": {
						"type": "string"
					},
					"value": {
						"type": "string"
					},
					"fileName": {
						"type": "string"
					},
					"contentType": {
						"type": "string"
					},
					"comment": {
						"type": "string"
					}
				}
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"name",
			"value"
		],
		"properties": {
			"name": {
				"type": "string"
			},
			"value": {
				"type": "string"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"method",
			"url",
			"httpVersion",
			"cookies",
			"headers",
			"queryString",
			"headersSize",
			"bodySize"
		],
		"properties": {
			"method": {
				"type": "string"
			},
			"url": {
				"type": "string",
				"format": "uri"
			},
			"httpVersion": {
				"type": "string"
			},
			"cookies": {
				"type": "array",
				"items": {
					"$ref": "#cookie"
				}
			},
			"headers": {
				"type": "array",
				"items": {
					"$ref": "#record"
				}
			},
			"queryString": {
				"type": "array",
				"items": {
					"$ref": "#record"
				}
			},
			"postData": {
				"$ref": "#postData"
			},
			"headersSize": {
				"type": "integer"
			},
			"bodySize": {
				"type": "integer"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = {
		"type": "object",
		"required": [
			"status",
			"statusText",
			"httpVersion",
			"cookies",
			"headers",
			"content",
			"redirectURL",
			"headersSize",
			"bodySize"
		],
		"properties": {
			"status": {
				"type": "integer"
			},
			"statusText": {
				"type": "string"
			},
			"httpVersion": {
				"type": "string"
			},
			"cookies": {
				"type": "array",
				"items": {
					"$ref": "#cookie"
				}
			},
			"headers": {
				"type": "array",
				"items": {
					"$ref": "#record"
				}
			},
			"content": {
				"$ref": "#content"
			},
			"redirectURL": {
				"type": "string"
			},
			"headersSize": {
				"type": "integer"
			},
			"bodySize": {
				"type": "integer"
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = {
		"required": [
			"send",
			"wait",
			"receive"
		],
		"properties": {
			"dns": {
				"type": "number",
				"min": -1
			},
			"connect": {
				"type": "number",
				"min": -1
			},
			"blocked": {
				"type": "number",
				"min": -1
			},
			"send": {
				"type": "number",
				"min": -1
			},
			"wait": {
				"type": "number",
				"min": -1
			},
			"receive": {
				"type": "number",
				"min": -1
			},
			"ssl": {
				"type": "number",
				"min": -1
			},
			"comment": {
				"type": "string"
			}
		}
	};

/***/ },
/* 75 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = HARError;
	function HARError(errors) {
	  this.name = 'HARError';
	  this.errors = errors;
	}
	
	HARError.prototype = Error.prototype;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var genobj = __webpack_require__(77)
	var genfun = __webpack_require__(79)
	var jsonpointer = __webpack_require__(80)
	var xtend = __webpack_require__(81)
	var formats = __webpack_require__(82)
	
	var get = function(obj, additionalSchemas, ptr) {
	
	  var visit = function(sub) {
	    if (sub && sub.id === ptr) return sub
	    if (typeof sub !== 'object' || !sub) return null
	    return Object.keys(sub).reduce(function(res, k) {
	      return res || visit(sub[k])
	    }, null)
	  }
	
	  var res = visit(obj)
	  if (res) return res
	
	  ptr = ptr.replace(/^#/, '')
	  ptr = ptr.replace(/\/$/, '')
	
	  try {
	    return jsonpointer.get(obj, decodeURI(ptr))
	  } catch (err) {
	    var end = ptr.indexOf('#')
	    var other
	    // external reference
	    if (end !== 0) {
	      // fragment doesn't exist.
	      if (end === -1) {
	        other = additionalSchemas[ptr]
	      } else {
	        var ext = ptr.slice(0, end)
	        other = additionalSchemas[ext]
	        var fragment = ptr.slice(end).replace(/^#/, '')
	        try {
	          return jsonpointer.get(other, fragment)
	        } catch (err) {}
	      }
	    } else {
	      other = additionalSchemas[ptr]
	    }
	    return other || null
	  }
	}
	
	var formatName = function(field) {
	  field = JSON.stringify(field)
	  var pattern = /\[([^\[\]"]+)\]/
	  while (pattern.test(field)) field = field.replace(pattern, '."+$1+"')
	  return field
	}
	
	var types = {}
	
	types.any = function() {
	  return 'true'
	}
	
	types.null = function(name) {
	  return name+' === null'
	}
	
	types.boolean = function(name) {
	  return 'typeof '+name+' === "boolean"'
	}
	
	types.array = function(name) {
	  return 'Array.isArray('+name+')'
	}
	
	types.object = function(name) {
	  return 'typeof '+name+' === "object" && '+name+' && !Array.isArray('+name+')'
	}
	
	types.number = function(name) {
	  return 'typeof '+name+' === "number"'
	}
	
	types.integer = function(name) {
	  return 'typeof '+name+' === "number" && (Math.floor('+name+') === '+name+' || '+name+' > 9007199254740992 || '+name+' < -9007199254740992)'
	}
	
	types.string = function(name) {
	  return 'typeof '+name+' === "string"'
	}
	
	var unique = function(array) {
	  var list = []
	  for (var i = 0; i < array.length; i++) {
	    list.push(typeof array[i] === 'object' ? JSON.stringify(array[i]) : array[i])
	  }
	  for (var i = 1; i < list.length; i++) {
	    if (list.indexOf(list[i]) !== i) return false
	  }
	  return true
	}
	
	var isMultipleOf = function(name, multipleOf) {
	  var res;
	  var factor = ((multipleOf | 0) !== multipleOf) ? Math.pow(10, multipleOf.toString().split('.').pop().length) : 1
	  if (factor > 1) {
	    var factorName = ((name | 0) !== name) ? Math.pow(10, name.toString().split('.').pop().length) : 1
	    if (factorName > factor) res = true
	    else res = Math.round(factor * name) % (factor * multipleOf)
	  }
	  else res = name % multipleOf;
	  return !res;
	}
	
	var toType = function(node) {
	  return node.type
	}
	
	var compile = function(schema, cache, root, reporter, opts) {
	  var fmts = opts ? xtend(formats, opts.formats) : formats
	  var scope = {unique:unique, formats:fmts, isMultipleOf:isMultipleOf}
	  var verbose = opts ? !!opts.verbose : false;
	  var greedy = opts && opts.greedy !== undefined ?
	    opts.greedy : false;
	
	  var syms = {}
	  var gensym = function(name) {
	    return name+(syms[name] = (syms[name] || 0)+1)
	  }
	
	  var reversePatterns = {}
	  var patterns = function(p) {
	    if (reversePatterns[p]) return reversePatterns[p]
	    var n = gensym('pattern')
	    scope[n] = new RegExp(p)
	    reversePatterns[p] = n
	    return n
	  }
	
	  var vars = ['i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','y','z']
	  var genloop = function() {
	    var v = vars.shift()
	    vars.push(v+v[0])
	    return v
	  }
	
	  var visit = function(name, node, reporter, filter) {
	    var properties = node.properties
	    var type = node.type
	    var tuple = false
	
	    if (Array.isArray(node.items)) { // tuple type
	      properties = {}
	      node.items.forEach(function(item, i) {
	        properties[i] = item
	      })
	      type = 'array'
	      tuple = true
	    }
	
	    var indent = 0
	    var error = function(msg, prop, value) {
	      validate('errors++')
	      if (reporter === true) {
	        validate('if (validate.errors === null) validate.errors = []')
	        if (verbose) {
	          validate('validate.errors.push({field:%s,message:%s,value:%s,type:%s})', formatName(prop || name), JSON.stringify(msg), value || name, JSON.stringify(type))
	        } else {
	          validate('validate.errors.push({field:%s,message:%s})', formatName(prop || name), JSON.stringify(msg))
	        }
	      }
	    }
	
	    if (node.required === true) {
	      indent++
	      validate('if (%s === undefined) {', name)
	      error('is required')
	      validate('} else {')
	    } else {
	      indent++
	      validate('if (%s !== undefined) {', name)
	    }
	
	    var valid = [].concat(type)
	      .map(function(t) {
	        return types[t || 'any'](name)
	      })
	      .join(' || ') || 'true'
	
	    if (valid !== 'true') {
	      indent++
	      validate('if (!(%s)) {', valid)
	      error('is the wrong type')
	      validate('} else {')
	    }
	
	    if (tuple) {
	      if (node.additionalItems === false) {
	        validate('if (%s.length > %d) {', name, node.items.length)
	        error('has additional items')
	        validate('}')
	      } else if (node.additionalItems) {
	        var i = genloop()
	        validate('for (var %s = %d; %s < %s.length; %s++) {', i, node.items.length, i, name, i)
	        visit(name+'['+i+']', node.additionalItems, reporter, filter)
	        validate('}')
	      }
	    }
	
	    if (node.format && fmts[node.format]) {
	      if (type !== 'string' && formats[node.format]) validate('if (%s) {', types.string(name))
	      var n = gensym('format')
	      scope[n] = fmts[node.format]
	
	      if (typeof scope[n] === 'function') validate('if (!%s(%s)) {', n, name)
	      else validate('if (!%s.test(%s)) {', n, name)
	      error('must be '+node.format+' format')
	      validate('}')
	      if (type !== 'string' && formats[node.format]) validate('}')
	    }
	
	    if (Array.isArray(node.required)) {
	      var isUndefined = function(req) {
	        return genobj(name, req) + ' === undefined'
	      }
	
	      var checkRequired = function (req) {
	        var prop = genobj(name, req);
	        validate('if (%s === undefined) {', prop)
	        error('is required', prop)
	        validate('missing++')
	        validate('}')
	      }
	      validate('if ((%s)) {', type !== 'object' ? types.object(name) : 'true')
	      validate('var missing = 0')
	      node.required.map(checkRequired)
	      validate('}');
	      if (!greedy) {
	        validate('if (missing === 0) {')
	        indent++
	      }
	    }
	
	    if (node.uniqueItems) {
	      if (type !== 'array') validate('if (%s) {', types.array(name))
	      validate('if (!(unique(%s))) {', name)
	      error('must be unique')
	      validate('}')
	      if (type !== 'array') validate('}')
	    }
	
	    if (node.enum) {
	      var complex = node.enum.some(function(e) {
	        return typeof e === 'object'
	      })
	
	      var compare = complex ?
	        function(e) {
	          return 'JSON.stringify('+name+')'+' !== JSON.stringify('+JSON.stringify(e)+')'
	        } :
	        function(e) {
	          return name+' !== '+JSON.stringify(e)
	        }
	
	      validate('if (%s) {', node.enum.map(compare).join(' && ') || 'false')
	      error('must be an enum value')
	      validate('}')
	    }
	
	    if (node.dependencies) {
	      if (type !== 'object') validate('if (%s) {', types.object(name))
	
	      Object.keys(node.dependencies).forEach(function(key) {
	        var deps = node.dependencies[key]
	        if (typeof deps === 'string') deps = [deps]
	
	        var exists = function(k) {
	          return genobj(name, k) + ' !== undefined'
	        }
	
	        if (Array.isArray(deps)) {
	          validate('if (%s !== undefined && !(%s)) {', genobj(name, key), deps.map(exists).join(' && ') || 'true')
	          error('dependencies not set')
	          validate('}')
	        }
	        if (typeof deps === 'object') {
	          validate('if (%s !== undefined) {', genobj(name, key))
	          visit(name, deps, reporter, filter)
	          validate('}')
	        }
	      })
	
	      if (type !== 'object') validate('}')
	    }
	
	    if (node.additionalProperties || node.additionalProperties === false) {
	      if (type !== 'object') validate('if (%s) {', types.object(name))
	
	      var i = genloop()
	      var keys = gensym('keys')
	
	      var toCompare = function(p) {
	        return keys+'['+i+'] !== '+JSON.stringify(p)
	      }
	
	      var toTest = function(p) {
	        return '!'+patterns(p)+'.test('+keys+'['+i+'])'
	      }
	
	      var additionalProp = Object.keys(properties || {}).map(toCompare)
	        .concat(Object.keys(node.patternProperties || {}).map(toTest))
	        .join(' && ') || 'true'
	
	      validate('var %s = Object.keys(%s)', keys, name)
	        ('for (var %s = 0; %s < %s.length; %s++) {', i, i, keys, i)
	          ('if (%s) {', additionalProp)
	
	      if (node.additionalProperties === false) {
	        if (filter) validate('delete %s', name+'['+keys+'['+i+']]')
	        error('has additional properties', null, JSON.stringify(name+'.') + ' + ' + keys + '['+i+']')
	      } else {
	        visit(name+'['+keys+'['+i+']]', node.additionalProperties, reporter, filter)
	      }
	
	      validate
	          ('}')
	        ('}')
	
	      if (type !== 'object') validate('}')
	    }
	
	    if (node.$ref) {
	      var sub = get(root, opts && opts.schemas || {}, node.$ref)
	      if (sub) {
	        var fn = cache[node.$ref]
	        if (!fn) {
	          cache[node.$ref] = function proxy(data) {
	            return fn(data)
	          }
	          fn = compile(sub, cache, root, false, opts)
	        }
	        var n = gensym('ref')
	        scope[n] = fn
	        validate('if (!(%s(%s))) {', n, name)
	        error('referenced schema does not match')
	        validate('}')
	      }
	    }
	
	    if (node.not) {
	      var prev = gensym('prev')
	      validate('var %s = errors', prev)
	      visit(name, node.not, false, filter)
	      validate('if (%s === errors) {', prev)
	      error('negative schema matches')
	      validate('} else {')
	        ('errors = %s', prev)
	      ('}')
	    }
	
	    if (node.items && !tuple) {
	      if (type !== 'array') validate('if (%s) {', types.array(name))
	
	      var i = genloop()
	      validate('for (var %s = 0; %s < %s.length; %s++) {', i, i, name, i)
	      visit(name+'['+i+']', node.items, reporter, filter)
	      validate('}')
	
	      if (type !== 'array') validate('}')
	    }
	
	    if (node.patternProperties) {
	      if (type !== 'object') validate('if (%s) {', types.object(name))
	      var keys = gensym('keys')
	      var i = genloop()
	      validate
	        ('var %s = Object.keys(%s)', keys, name)
	        ('for (var %s = 0; %s < %s.length; %s++) {', i, i, keys, i)
	
	      Object.keys(node.patternProperties).forEach(function(key) {
	        var p = patterns(key)
	        validate('if (%s.test(%s)) {', p, keys+'['+i+']')
	        visit(name+'['+keys+'['+i+']]', node.patternProperties[key], reporter, filter)
	        validate('}')
	      })
	
	      validate('}')
	      if (type !== 'object') validate('}')
	    }
	
	    if (node.pattern) {
	      var p = patterns(node.pattern)
	      if (type !== 'string') validate('if (%s) {', types.string(name))
	      validate('if (!(%s.test(%s))) {', p, name)
	      error('pattern mismatch')
	      validate('}')
	      if (type !== 'string') validate('}')
	    }
	
	    if (node.allOf) {
	      node.allOf.forEach(function(sch) {
	        visit(name, sch, reporter, filter)
	      })
	    }
	
	    if (node.anyOf && node.anyOf.length) {
	      var prev = gensym('prev')
	
	      node.anyOf.forEach(function(sch, i) {
	        if (i === 0) {
	          validate('var %s = errors', prev)
	        } else {
	          validate('if (errors !== %s) {', prev)
	            ('errors = %s', prev)
	        }
	        visit(name, sch, false, false)
	      })
	      node.anyOf.forEach(function(sch, i) {
	        if (i) validate('}')
	      })
	      validate('if (%s !== errors) {', prev)
	      error('no schemas match')
	      validate('}')
	    }
	
	    if (node.oneOf && node.oneOf.length) {
	      var prev = gensym('prev')
	      var passes = gensym('passes')
	
	      validate
	        ('var %s = errors', prev)
	        ('var %s = 0', passes)
	
	      node.oneOf.forEach(function(sch, i) {
	        visit(name, sch, false, false)
	        validate('if (%s === errors) {', prev)
	          ('%s++', passes)
	        ('} else {')
	          ('errors = %s', prev)
	        ('}')
	      })
	
	      validate('if (%s !== 1) {', passes)
	      error('no (or more than one) schemas match')
	      validate('}')
	    }
	
	    if (node.multipleOf !== undefined) {
	      if (type !== 'number' && type !== 'integer') validate('if (%s) {', types.number(name))
	
	      validate('if (!isMultipleOf(%s, %d)) {', name, node.multipleOf)
	
	      error('has a remainder')
	      validate('}')
	
	      if (type !== 'number' && type !== 'integer') validate('}')
	    }
	
	    if (node.maxProperties !== undefined) {
	      if (type !== 'object') validate('if (%s) {', types.object(name))
	
	      validate('if (Object.keys(%s).length > %d) {', name, node.maxProperties)
	      error('has more properties than allowed')
	      validate('}')
	
	      if (type !== 'object') validate('}')
	    }
	
	    if (node.minProperties !== undefined) {
	      if (type !== 'object') validate('if (%s) {', types.object(name))
	
	      validate('if (Object.keys(%s).length < %d) {', name, node.minProperties)
	      error('has less properties than allowed')
	      validate('}')
	
	      if (type !== 'object') validate('}')
	    }
	
	    if (node.maxItems !== undefined) {
	      if (type !== 'array') validate('if (%s) {', types.array(name))
	
	      validate('if (%s.length > %d) {', name, node.maxItems)
	      error('has more items than allowed')
	      validate('}')
	
	      if (type !== 'array') validate('}')
	    }
	
	    if (node.minItems !== undefined) {
	      if (type !== 'array') validate('if (%s) {', types.array(name))
	
	      validate('if (%s.length < %d) {', name, node.minItems)
	      error('has less items than allowed')
	      validate('}')
	
	      if (type !== 'array') validate('}')
	    }
	
	    if (node.maxLength !== undefined) {
	      if (type !== 'string') validate('if (%s) {', types.string(name))
	
	      validate('if (%s.length > %d) {', name, node.maxLength)
	      error('has longer length than allowed')
	      validate('}')
	
	      if (type !== 'string') validate('}')
	    }
	
	    if (node.minLength !== undefined) {
	      if (type !== 'string') validate('if (%s) {', types.string(name))
	
	      validate('if (%s.length < %d) {', name, node.minLength)
	      error('has less length than allowed')
	      validate('}')
	
	      if (type !== 'string') validate('}')
	    }
	
	    if (node.minimum !== undefined) {
	      validate('if (%s %s %d) {', name, node.exclusiveMinimum ? '<=' : '<', node.minimum)
	      error('is less than minimum')
	      validate('}')
	    }
	
	    if (node.maximum !== undefined) {
	      validate('if (%s %s %d) {', name, node.exclusiveMaximum ? '>=' : '>', node.maximum)
	      error('is more than maximum')
	      validate('}')
	    }
	
	    if (properties) {
	      Object.keys(properties).forEach(function(p) {
	        if (Array.isArray(type) && type.indexOf('null') !== -1) validate('if (%s !== null) {', name)
	
	        visit(genobj(name, p), properties[p], reporter, filter)
	
	        if (Array.isArray(type) && type.indexOf('null') !== -1) validate('}')
	      })
	    }
	
	    while (indent--) validate('}')
	  }
	
	  var validate = genfun
	    ('function validate(data) {')
	      ('validate.errors = null')
	      ('var errors = 0')
	
	  visit('data', schema, reporter, opts && opts.filter)
	
	  validate
	      ('return errors === 0')
	    ('}')
	
	  validate = validate.toFunction(scope)
	  validate.errors = null
	
	  if (Object.defineProperty) {
	    Object.defineProperty(validate, 'error', {
	      get: function() {
	        if (!validate.errors) return ''
	        return validate.errors.map(function(err) {
	          return err.field + ' ' + err.message;
	        }).join('\n')
	      }
	    })
	  }
	
	  validate.toJSON = function() {
	    return schema
	  }
	
	  return validate
	}
	
	module.exports = function(schema, opts) {
	  if (typeof schema === 'string') schema = JSON.parse(schema)
	  return compile(schema, {}, schema, true, opts)
	}
	
	module.exports.filter = function(schema, opts) {
	  var validate = module.exports(schema, xtend(opts, {filter: true}))
	  return function(sch) {
	    validate(sch)
	    return sch
	  }
	}


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var isProperty = __webpack_require__(78)
	
	var gen = function(obj, prop) {
	  return isProperty(prop) ? obj+'.'+prop : obj+'['+JSON.stringify(prop)+']'
	}
	
	gen.valid = isProperty
	gen.property = function (prop) {
	 return isProperty(prop) ? prop : JSON.stringify(prop)
	}
	
	module.exports = gen


/***/ },
/* 78 */
/***/ function(module, exports) {

	"use strict"
	function isProperty(str) {
	  return /^[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/.test(str)
	}
	module.exports = isProperty

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(14)
	
	var INDENT_START = /[\{\[]/
	var INDENT_END = /[\}\]]/
	
	module.exports = function() {
	  var lines = []
	  var indent = 0
	
	  var push = function(str) {
	    var spaces = ''
	    while (spaces.length < indent*2) spaces += '  '
	    lines.push(spaces+str)
	  }
	
	  var line = function(fmt) {
	    if (!fmt) return line
	
	    if (INDENT_END.test(fmt.trim()[0]) && INDENT_START.test(fmt[fmt.length-1])) {
	      indent--
	      push(util.format.apply(util, arguments))
	      indent++
	      return line
	    }
	    if (INDENT_START.test(fmt[fmt.length-1])) {
	      push(util.format.apply(util, arguments))
	      indent++
	      return line
	    }
	    if (INDENT_END.test(fmt.trim()[0])) {
	      indent--
	      push(util.format.apply(util, arguments))
	      return line
	    }
	
	    push(util.format.apply(util, arguments))
	    return line
	  }
	
	  line.toString = function() {
	    return lines.join('\n')
	  }
	
	  line.toFunction = function(scope) {
	    var src = 'return ('+line.toString()+')'
	
	    var keys = Object.keys(scope || {}).map(function(key) {
	      return key
	    })
	
	    var vals = keys.map(function(key) {
	      return scope[key]
	    })
	
	    return Function.apply(null, keys.concat(src)).apply(null, vals)
	  }
	
	  if (arguments.length) line.apply(null, arguments)
	
	  return line
	}


/***/ },
/* 80 */
/***/ function(module, exports) {

	var untilde = function(str) {
	  return str.replace(/~./g, function(m) {
	    switch (m) {
	      case "~0":
	        return "~";
	      case "~1":
	        return "/";
	    }
	    throw new Error("Invalid tilde escape: " + m);
	  });
	}
	
	var traverse = function(obj, pointer, value) {
	  // assert(isArray(pointer))
	  var part = untilde(pointer.shift());
	  if(!obj.hasOwnProperty(part)) {
	    return null;
	  }
	  if(pointer.length !== 0) { // keep traversin!
	    return traverse(obj[part], pointer, value);
	  }
	  // we're done
	  if(typeof value === "undefined") {
	    // just reading
	    return obj[part];
	  }
	  // set new value, return old value
	  var old_value = obj[part];
	  if(value === null) {
	    delete obj[part];
	  } else {
	    obj[part] = value;
	  }
	  return old_value;
	}
	
	var validate_input = function(obj, pointer) {
	  if(typeof obj !== "object") {
	    throw new Error("Invalid input object.");
	  }
	
	  if(pointer === "") {
	    return [];
	  }
	
	  if(!pointer) {
	    throw new Error("Invalid JSON pointer.");
	  }
	
	  pointer = pointer.split("/");
	  var first = pointer.shift();
	  if (first !== "") {
	    throw new Error("Invalid JSON pointer.");
	  }
	
	  return pointer;
	}
	
	var get = function(obj, pointer) {
	  pointer = validate_input(obj, pointer);
	  if (pointer.length === 0) {
	    return obj;
	  }
	  return traverse(obj, pointer);
	}
	
	var set = function(obj, pointer, value) {
	  pointer = validate_input(obj, pointer);
	  if (pointer.length === 0) {
	    throw new Error("Invalid JSON pointer for set.")
	  }
	  return traverse(obj, pointer, value);
	}
	
	exports.get = get
	exports.set = set


/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = extend
	
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	function extend() {
	    var target = {}
	
	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]
	
	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }
	
	    return target
	}


/***/ },
/* 82 */
/***/ function(module, exports) {

	exports['date-time'] = /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}[tT ]\d{2}:\d{2}:\d{2}(\.\d+)?([zZ]|[+-]\d{2}:\d{2})$/
	exports['date'] = /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}$/
	exports['time'] = /^\d{2}:\d{2}:\d{2}$/
	exports['email'] = /^\S+@\S+$/
	exports['ip-address'] = exports['ipv4'] = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
	exports['ipv6'] = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
	exports['uri'] = /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]*$/
	exports['color'] = /(#?([0-9A-Fa-f]{3,6})\b)|(aqua)|(black)|(blue)|(fuchsia)|(gray)|(green)|(lime)|(maroon)|(navy)|(olive)|(orange)|(purple)|(red)|(silver)|(teal)|(white)|(yellow)|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\))/
	exports['hostname'] = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/
	exports['alpha'] = /^[a-zA-Z]+$/
	exports['alphanumeric'] = /^[a-zA-Z0-9]+$/
	exports['style'] = /\s*(.+?):\s*([^;]+);?/g
	exports['phone'] = /^\+(?:[0-9] ?){6,14}[0-9]$/
	exports['utc-millisec'] = /^[0-9]{1,15}\.?[0-9]{0,15}$/


/***/ }
/******/ ]);