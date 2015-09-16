'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _bind = Function.prototype.bind;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function MatchError(message) {
  this.name = 'MatchError';
  this.message = message || 'No match for arguments given';
  this.stack = new Error().stack;
}

MatchError.prototype = Object.create(Error.prototype);
MatchError.prototype.constructor = MatchError;

var Type = {
  isSymbol: function isSymbol(value) {
    return typeof x === 'symbol';
  },

  isAtom: function isAtom(value) {
    return !Type.isSymbol(value) && ((typeof value !== 'object' || value === null) && typeof value !== 'function') || Type.isBoolean(value) || Type.isNumber(value) || Type.isString(value);
  },

  isRegExp: function isRegExp(value) {
    return value.constructor.name === "RegExp" || value instanceof RegExp;
  },

  isNumber: function isNumber(value) {
    return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
  },

  isString: function isString(value) {
    return typeof value === 'string' || value instanceof String;
  },

  isBoolean: function isBoolean(value) {
    return value !== null && (typeof value === 'boolean' || value instanceof Boolean);
  },

  isArray: function isArray(value) {
    return Array.isArray(value);
  },

  isObject: function isObject(value) {
    return Object.prototype.toString.apply(value) === '[object Object]';
  },

  isFunction: function isFunction(value) {
    return typeof value === 'function';
  },

  isDefined: function isDefined(value) {
    return typeof value !== 'undefined';
  },

  isUndefined: function isUndefined(value) {
    return typeof value === 'undefined';
  },

  isWildcard: function isWildcard(value) {
    return value && value.constructor === _fun.wildcard.constructor;
  },

  isVariable: function isVariable(value) {
    return value && typeof value === 'object' && typeof value.is_variable === 'function' && typeof value.get_name === 'function' && value.is_variable();
  },

  isParameter: function isParameter(value) {
    return value && (value === _fun.parameter || value.constructor.name === _fun.parameter().constructor.name);
  },

  isStartsWith: function isStartsWith(value) {
    return value && value.constructor.name === _fun.startsWith().constructor.name;
  },

  isCapture: function isCapture(value) {
    return value && value.constructor.name === _fun.capture().constructor.name;
  },

  isHeadTail: function isHeadTail(value) {
    return value.constructor === _fun.headTail.constructor;
  },

  isBound: function isBound(value) {
    return value && value.constructor.name === _fun.bound().constructor.name;
  }
};

var object = {
  extend: function extend(obj) {
    var i = 1,
        key = undefined,
        len = arguments.length;
    for (; i < len; i += 1) {
      for (key in arguments[i]) {
        // make sure we do not override built-in methods but toString and valueOf
        if (arguments[i].hasOwnProperty(key) && (!obj[key] || obj.propertyIsEnumerable(key) || key === 'toString' || key === 'valueOf')) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  },

  filter: function filter(obj, fun, thisObj) {
    var key = undefined,
        r = {},
        val = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        val = obj[key];
        if (fun.call(thisObj, val, key, obj)) {
          r[key] = val;
        }
      }
    }
    return r;
  },

  map: function map(obj, fun, thisObj) {
    var key = undefined,
        r = {};
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        r[key] = fun.call(thisObj, obj[key], key, obj);
      }
    }
    return r;
  },

  forEach: function forEach(obj, fun, thisObj) {
    var key = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        fun.call(thisObj, obj[key], key, obj);
      }
    }
  },

  every: function every(obj, fun, thisObj) {
    var key = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && !fun.call(thisObj, obj[key], key, obj)) {
        return false;
      }
    }
    return true;
  },

  some: function some(obj, fun, thisObj) {
    var key = undefined;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && fun.call(thisObj, obj[key], key, obj)) {
        return true;
      }
    }
    return false;
  },

  isEmpty: function isEmpty(obj) {
    return object.every(obj, function (value, key) {
      return !obj.hasOwnProperty(key);
    });
  },

  values: function values(obj) {
    var r = [];
    object.forEach(obj, function (value) {
      r.push(value);
    });
    return r;
  },

  keys: function keys(obj) {
    var r = [];
    object.forEach(obj, function (value, key) {
      r.push(key);
    });
    return r;
  },

  reduce: function reduce(obj, fun, initial) {
    var key = undefined,
        initialKey = undefined;

    if (object.isEmpty(obj) && initial === undefined) {
      throw new TypeError();
    }
    if (initial === undefined) {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          initial = obj[key];
          initialKey = key;
          break;
        }
      }
    }
    for (key in obj) {
      if (obj.hasOwnProperty(key) && key !== initialKey) {
        initial = fun.call(null, initial, obj[key], key, obj);
      }
    }
    return initial;
  }
};

function buildMatch(pattern) {
  // A parameter can either be a function, or the result of invoking that
  // function so we need to check for both.
  if (Type.isUndefined(pattern) || Type.isWildcard(pattern)) {
    return matchWildcard(pattern);
  } else if (Type.isBound(pattern)) {
    return matchBound(pattern);
  } else if (Type.isParameter(pattern)) {
    return matchParameter(pattern);
  } else if (Type.isHeadTail(pattern)) {
    return matchHeadTail(pattern);
  } else if (Type.isStartsWith(pattern)) {
    return matchStartsWith(pattern);
  } else if (Type.isCapture(pattern)) {
    return matchCapture(pattern);
  } else if (Type.isAtom(pattern)) {
    return matchAtom(pattern);
  } else if (Type.isRegExp(pattern)) {
    return matchRegExp(pattern);
  } else if (Type.isObject(pattern)) {
    return matchObject(pattern);
  } else if (Type.isArray(pattern)) {
    return matchArray(pattern);
  } else if (Type.isFunction(pattern)) {
    return matchFunction(pattern);
  } else if (Type.isSymbol(pattern)) {
    return matchSymbol(pattern);
  }
}

function equals(one, two) {
  if (typeof one !== typeof two) {
    return false;
  }

  if (Type.isArray(one) || Type.isObject(one) || Type.isString(one)) {
    if (one.length !== two.length) {
      return false;
    }

    for (var i in one) {
      if (!equals(one[i], two[i])) {
        return false;
      }
    }

    return true;
  }

  return one === two;
}

function matchBound(pattern) {
  return function (value, bindings) {
    return equals(value, pattern.value) && bindings.push(value) > 0;
  };
}

function matchParameter(pattern) {
  return function (value, bindings) {
    return bindings.push(value) > 0;
  };
}

function matchWildcard(pattern) {
  return function () {
    return true;
  };
}

function matchHeadTail(patternHeadTail) {
  return function (value, bindings) {
    return value.length > 1 && bindings.push(value[0]) > 0 && bindings.push(value.slice(1)) > 0;
  };
}

function matchCapture(patternCapture) {
  var pattern = patternCapture.pattern;
  var subMatches = buildMatch(pattern);

  return function (value, bindings) {
    return subMatches(value, bindings) && bindings.push(value) > 0;
  };
}

function matchStartsWith(patternStartsWith) {
  var substr = patternStartsWith.substr;

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  return function (value, bindings) {
    return Type.isString(substr) && value.startsWith(substr) && value.substring(substr.length) !== '' && bindings.push(value.substring(substr.length)) > 0;
  };
}

function matchSymbol(patternSymbol) {
  var type = typeof patternSymbol,
      value = patternSymbol;

  return function (valueSymbol, bindings) {
    return typeof valueSymbol === type && valueSymbol === value;
  };
}

function matchAtom(patternAtom) {
  var type = typeof patternAtom,
      value = patternAtom;

  return function (valueAtom, bindings) {
    return typeof valueAtom === type && valueAtom === value || typeof value === 'number' && isNaN(valueAtom) && isNaN(value);
  };
}

function matchRegExp(patternRegExp) {
  return function (value, bindings) {
    return !(typeof value === undefined) && typeof value === 'string' && patternRegExp.test(value);
  };
}

function matchFunction(patternFunction) {
  return function (value, bindings) {
    return value.constructor === patternFunction && bindings.push(value) > 0;
  };
}

function matchArray(patternArray) {
  var patternLength = patternArray.length,
      subMatches = patternArray.map(function (value) {
    return buildMatch(value);
  });

  return function (valueArray, bindings) {
    return patternLength === valueArray.length && valueArray.every(function (value, i) {
      return i in subMatches && subMatches[i](valueArray[i], bindings);
    });
  };
}

function matchObject(patternObject) {
  var type = patternObject.constructor,
      patternLength = 0,

  // Figure out the number of properties in the object
  // and the keys we need to check for. We put these
  // in another object so access is very fast. The build_match
  // function creates new subtests which we execute later.
  subMatches = object.map(patternObject, function (value) {
    patternLength += 1;
    return buildMatch(value);
  });

  // We then return a function which uses that information
  // to check against the object passed to it.
  return function (valueObject, bindings) {
    if (valueObject.constructor !== type) {
      return false;
    }

    var newValueObject = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(patternObject)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (key in valueObject) {
          newValueObject[key] = valueObject[key];
        } else {
          return false;
        }
      }

      // Checking the object type is very fast so we do it first.
      // Then we iterate through the value object and check the keys
      // it contains against the hash object we built earlier.
      // We also count the number of keys in the value object,
      // so we can also test against it as a final check.
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return object.every(newValueObject, function (value, key) {
      return key in subMatches && subMatches[key](newValueObject[key], bindings);
    });
  };
}

var Match = {
  buildMatch: buildMatch
};

/**
 * @preserve jFun - JavaScript Pattern Matching v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2008, Bram Stein
 * All rights reserved.
 */
var _fun = function _fun() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var patterns = args.slice(0).map(function (value, i) {
    var pattern = {
      pattern: Match.buildMatch(value[0]),
      fn: value[1],
      guard: value.length === 3 ? value[2] : function () {
        return true;
      }
    };

    return pattern;
  });

  return function () {
    for (var _len2 = arguments.length, inner_args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      inner_args[_key2] = arguments[_key2];
    }

    var value = inner_args.slice(0),
        result = [];

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = patterns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var pattern = _step2.value;

        if (pattern.pattern(value, result) && pattern.guard.apply(this, result)) {
          return pattern.fn.apply(this, result);
        }

        result = [];
      }
      // no matches were made so we throw an exception.
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    throw new MatchError('No match for: ' + value);
  };
};

_fun.bind = function (pattern, expr) {
  var result = [];
  var processedPattern = Match.buildMatch(pattern);
  if (processedPattern(expr, result)) {
    return result;
  } else {
    throw new MatchError('No match for: ' + expr);
  }
};

_fun.parameter = function (name, orElse) {
  function Parameter(n, o) {
    this.name = n;
    this.orElse = o;
  }
  return new Parameter(name, orElse);
};

_fun.capture = function (pattern) {
  function Capture(p) {
    this.pattern = p;
  }
  return new Capture(pattern);
};

_fun.startsWith = function (substr) {
  function StartsWith(s) {
    this.substr = s;
  }

  return new StartsWith(substr);
};

_fun.wildcard = (function () {
  function Wildcard() {}
  return new Wildcard();
})();

_fun.headTail = (function () {
  function HeadTail() {}
  return new HeadTail();
})();

_fun.bound = function (value) {
  function Bound(v) {
    this.value = v;
  }

  return new Bound(value);
};

var BitString = {};

BitString.__MODULE__ = Symbol['for']("BitString");

BitString.integer = function (value) {
  return BitString.wrap(value, { 'type': 'integer', 'unit': 1, 'size': 8 });
};

BitString.float = function (value) {
  return BitString.wrap(value, { 'type': 'float', 'unit': 1, 'size': 64 });
};

BitString.bitstring = function (value) {
  return BitString.wrap(value, { 'type': 'bitstring', 'unit': 1, 'size': value.length });
};

BitString.bits = function (value) {
  return BitString.bitstring(value);
};

BitString.binary = function (value) {
  return BitString.wrap(value, { 'type': 'binary', 'unit': 8, 'size': value.length });
};

BitString.bytes = function (value) {
  return BitString.binary(value);
};

BitString.utf8 = function (value) {
  return BitString.wrap(value, { 'type': 'utf8' });
};

BitString.utf16 = function (value) {
  return BitString.wrap(value, { 'type': 'utf16' });
};

BitString.utf32 = function (value) {
  return BitString.wrap(value, { 'type': 'utf32' });
};

BitString.signed = function (value) {
  return BitString.wrap(value, {}, 'signed');
};

BitString.unsigned = function (value) {
  return BitString.wrap(value, {}, 'unsigned');
};

BitString.native = function (value) {
  return BitString.wrap(value, {}, 'native');
};

BitString.big = function (value) {
  return BitString.wrap(value, {}, 'big');
};

BitString.little = function (value) {
  return BitString.wrap(value, {}, 'little');
};

BitString.size = function (value, count) {
  return BitString.wrap(value, { 'size': count });
};

BitString.unit = function (value, count) {
  return BitString.wrap(value, { 'unit': count });
};

BitString.wrap = function (value, opt) {
  var new_attribute = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var the_value = value;

  if (!(value instanceof Object)) {
    the_value = { 'value': value, 'attributes': [] };
  }

  the_value = Object.assign(the_value, opt);

  if (new_attribute) {
    the_value.attributes.push(new_attribute);
  }

  return the_value;
};

BitString.toUTF8Array = function (str) {
  var utf8 = [];
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | charcode >> 6, 0x80 | charcode & 0x3f);
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | charcode >> 12, 0x80 | charcode >> 6 & 0x3f, 0x80 | charcode & 0x3f);
    }
    // surrogate pair
    else {
        i++;
        // UTF-16 encodes 0x10000-0x10FFFF by
        // subtracting 0x10000 and splitting the
        // 20 bits of 0x0-0xFFFFF into two halves
        charcode = 0x10000 + ((charcode & 0x3ff) << 10 | str.charCodeAt(i) & 0x3ff);
        utf8.push(0xf0 | charcode >> 18, 0x80 | charcode >> 12 & 0x3f, 0x80 | charcode >> 6 & 0x3f, 0x80 | charcode & 0x3f);
      }
  }
  return utf8;
};

BitString.toUTF16Array = function (str) {
  var utf16 = [];
  for (var i = 0; i < str.length; i++) {
    var codePoint = str.codePointAt(i);

    if (codePoint <= 255) {
      utf16.push(0);
      utf16.push(codePoint);
    } else {
      utf16.push(codePoint >> 8 & 0xFF);
      utf16.push(codePoint & 0xFF);
    }
  }
  return utf16;
};

BitString.toUTF32Array = function (str) {
  var utf32 = [];
  for (var i = 0; i < str.length; i++) {
    var codePoint = str.codePointAt(i);

    if (codePoint <= 255) {
      utf32.push(0);
      utf32.push(0);
      utf32.push(0);
      utf32.push(codePoint);
    } else {
      utf32.push(0);
      utf32.push(0);
      utf32.push(codePoint >> 8 & 0xFF);
      utf32.push(codePoint & 0xFF);
    }
  }
  return utf32;
};

//http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
BitString.float32ToBytes = function (f) {
  var bytes = [];

  var buf = new ArrayBuffer(4);
  new Float32Array(buf)[0] = f;

  var intVersion = new Uint32Array(buf)[0];

  bytes.push(intVersion >> 24 & 0xFF);
  bytes.push(intVersion >> 16 & 0xFF);
  bytes.push(intVersion >> 8 & 0xFF);
  bytes.push(intVersion & 0xFF);

  return bytes;
};

BitString.float64ToBytes = function (f) {
  var bytes = [];

  var buf = new ArrayBuffer(8);
  new Float64Array(buf)[0] = f;

  var intVersion1 = new Uint32Array(buf)[0];
  var intVersion2 = new Uint32Array(buf)[1];

  bytes.push(intVersion2 >> 24 & 0xFF);
  bytes.push(intVersion2 >> 16 & 0xFF);
  bytes.push(intVersion2 >> 8 & 0xFF);
  bytes.push(intVersion2 & 0xFF);

  bytes.push(intVersion1 >> 24 & 0xFF);
  bytes.push(intVersion1 >> 16 & 0xFF);
  bytes.push(intVersion1 >> 8 & 0xFF);
  bytes.push(intVersion1 & 0xFF);

  return bytes;
};

function atom(_value) {
  return Symbol['for'](_value);
}

function list() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return Object.freeze(args);
}

function tuple() {
  for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  return Object.freeze({ __tuple__: Object.freeze(args) });
}

function bitstring() {
  for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  if (!(this instanceof bitstring)) {
    return new (_bind.apply(bitstring, [null].concat(args)))();
  }

  this.raw_value = function () {
    return Object.freeze(args);
  };

  var _value = Object.freeze(this.process(args));

  this.value = function () {
    return _value;
  };

  this.length = _value.length;

  this.get = function (i) {
    return _value[i];
  };

  return this;
}

bitstring.prototype[Symbol.iterator] = function () {
  return this.value()[Symbol.iterator]();
};

bitstring.prototype.toString = function () {
  var i,
      s = "";
  for (i = 0; i < this.length; i++) {
    if (s !== "") {
      s += ", ";
    }
    s += this.get(i).toString();
  }

  return "<<" + s + ">>";
};

bitstring.prototype.process = function () {
  var processed_values = [];

  var i;
  for (i = 0; i < this.raw_value().length; i++) {
    var processed_value = this['process_' + this.raw_value()[i].type](this.raw_value()[i]);

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = this.raw_value()[i].attributes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var attr = _step3.value;

        processed_value = this['process_' + attr](processed_value);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
          _iterator3['return']();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    processed_values = processed_values.concat(processed_value);
  }

  return processed_values;
};

bitstring.prototype.process_integer = function (value) {
  return value.value;
};

bitstring.prototype.process_float = function (value) {
  if (value.size === 64) {
    return BitString.float64ToBytes(value.value);
  } else if (value.size === 32) {
    return BitString.float32ToBytes(value.value);
  }

  throw new Error('Invalid size for float');
};

bitstring.prototype.process_bitstring = function (value) {
  return value.value.value;
};

bitstring.prototype.process_binary = function (value) {
  return BitString.toUTF8Array(value.value);
};

bitstring.prototype.process_utf8 = function (value) {
  return BitString.toUTF8Array(value.value);
};

bitstring.prototype.process_utf16 = function (value) {
  return BitString.toUTF16Array(value.value);
};

bitstring.prototype.process_utf32 = function (value) {
  return BitString.toUTF32Array(value.value);
};

bitstring.prototype.process_signed = function (value) {
  return new Uint8Array([value])[0];
};

bitstring.prototype.process_unsigned = function (value) {
  return value;
};

bitstring.prototype.process_native = function (value) {
  return value;
};

bitstring.prototype.process_big = function (value) {
  return value;
};

bitstring.prototype.process_little = function (value) {
  return value.reverse();
};

bitstring.prototype.process_size = function (value) {
  return value;
};

bitstring.prototype.process_unit = function (value) {
  return value;
};

var Erlang = {
  atom: atom,
  tuple: tuple,
  list: list,
  bitstring: bitstring
};

var Tuple = {};

Tuple.__MODULE__ = Erlang.atom('Tuple');

Tuple.to_string = function (tuple) {
  var i,
      s = "";
  for (i = 0; i < tuple.__tuple__.length; i++) {
    if (s !== "") {
      s += ", ";
    }
    s += tuple.__tuple__[i].toString();
  }

  return "{" + s + "}";
};

Tuple.delete_at = function (tuple, index) {
  var new_list = [];

  for (var i = 0; i < tuple.__tuple__.length; i++) {
    if (i !== index) {
      new_list.push(tuple.__tuple__[i]);
    }
  }

  return Erlang.tuple.apply(null, new_list);
};

Tuple.duplicate = function (data, size) {
  var array = [];

  for (var i = size - 1; i >= 0; i--) {
    array.push(data);
  }

  return Erlang.tuple.apply(null, array);
};

Tuple.insert_at = function (tuple, index, term) {
  var new_tuple = [];

  for (var i = 0; i <= tuple.__tuple__.length; i++) {
    if (i === index) {
      new_tuple.push(term);
      i++;
      new_tuple.push(tuple.__tuple__[i]);
    } else {
      new_tuple.push(tuple.__tuple__[i]);
    }
  }

  return Erlang.tuple.apply(null, new_tuple);
};

Tuple.from_list = function (list) {
  return Erlang.tuple.apply(null, list);
};

Tuple.to_list = function (tuple) {
  var new_list = [];

  for (var i = 0; i < tuple.__tuple__.length; i++) {
    new_list.push(tuple.__tuple__[i]);
  }

  return Erlang.list.apply(Erlang, new_list);
};

Tuple.iterator = function (tuple) {
  return tuple.__tuple__[Symbol.iterator]();
};

var SpecialForms = {
  __MODULE__: Erlang.atom('SpecialForms'),

  __DIR__: function __DIR__() {
    if (__dirname) {
      return __dirname;
    }

    if (document.currentScript) {
      return document.currentScript.src;
    }

    return null;
  },

  receive: function receive(receive_fun) {
    var timeout_in_ms = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var timeout_fn = arguments.length <= 2 || arguments[2] === undefined ? function (time) {
      return true;
    } : arguments[2];

    if (timeout_in_ms == null || timeout_in_ms === System['for']('infinity')) {
      while (true) {
        if (self.mailbox.length !== 0) {
          var message = self.mailbox[0];
          self.mailbox = self.mailbox.slice(1);
          return receive_fun(message);
        }
      }
    } else if (timeout_in_ms === 0) {
      if (self.mailbox.length !== 0) {
        var message = self.mailbox[0];
        self.mailbox = self.mailbox.slice(1);
        return receive_fun(message);
      } else {
        return null;
      }
    } else {
      var now = Date.now();
      while (Date.now() < now + timeout_in_ms) {
        if (self.mailbox.length !== 0) {
          var message = self.mailbox[0];
          self.mailbox = self.mailbox.slice(1);
          return receive_fun(message);
        }
      }

      return timeout_fn(timeout_in_ms);
    }
  }
};

var Kernel = {
  __MODULE__: Erlang.atom('Kernel'),

  SpecialForms: SpecialForms,

  tl: function tl(list) {
    return Erlang.list.apply(Erlang, _toConsumableArray(list.slice(1)));
  },

  hd: function hd(list) {
    return list[0];
  },

  is_nil: function is_nil(x) {
    return x == null;
  },

  is_atom: function is_atom(x) {
    return typeof x === 'symbol';
  },

  is_binary: function is_binary(x) {
    return typeof x === 'string' || x instanceof String;
  },

  is_boolean: function is_boolean(x) {
    return typeof x === 'boolean' || x instanceof Boolean;
  },

  is_function: function is_function(x) {
    var arity = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

    return typeof x === 'function' || x instanceof Function;
  },

  // from: http://stackoverflow.com/a/3885844
  is_float: function is_float(x) {
    return x === +x && x !== (x | 0);
  },

  is_integer: function is_integer(x) {
    return x === +x && x === (x | 0);
  },

  is_list: function is_list(x) {
    return x instanceof Array;
  },

  is_map: function is_map(x) {
    return typeof x === 'object' || x instanceof Object && x.__tuple__ === null;
  },

  is_number: function is_number(x) {
    return Kernel.is_integer(x) || Kernel.is_float(x);
  },

  is_tuple: function is_tuple(x) {
    return (typeof x === 'object' || x instanceof Object) && x.__tuple__ !== null;
  },

  length: function length(x) {
    return x.length;
  },

  is_pid: function is_pid(x) {
    return false;
  },

  is_port: function is_port(x) {},

  is_reference: function is_reference(x) {},

  is_bitstring: function is_bitstring(x) {
    return Kernel.is_binary(x) || x instanceof Erlang.bitstring;
  },

  __in__: function __in__(left, right) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = right[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var _x5 = _step4.value;

        if (Kernel.match__qmark__(left, _x5)) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
          _iterator4['return']();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return false;
  },

  abs: function abs(number) {
    return Math.abs(number);
  },

  round: function round(number) {
    return Math.round(number);
  },

  elem: function elem(tuple, index) {
    if (Kernel.is_list(tuple)) {
      return tuple[index];
    }

    return tuple.__tuple__[index];
  },

  rem: function rem(left, right) {
    return left % right;
  },

  div: function div(left, right) {
    return left / right;
  },

  and: function and(left, right) {
    return left && right;
  },

  or: function or(left, right) {
    return left || right;
  },

  not: function not(arg) {
    return !arg;
  },

  apply: function apply(module, func, args) {
    if (arguments.length === 3) {
      return module[func].apply(null, args);
    } else {
      return module.apply(null, func);
    }
  },

  to_string: function to_string(arg) {
    if (Kernel.is_tuple(arg)) {
      return Tuple.to_string(arg);
    }

    return arg.toString();
  },

  'throw': function _throw(e) {
    throw e;
  },

  match__qmark__: function match__qmark__(pattern, expr) {
    var guard = arguments.length <= 2 || arguments[2] === undefined ? function () {
      return true;
    } : arguments[2];

    try {
      var match = _fun([[pattern], function () {
        return true;
      }, guard]);

      return match(expr);
    } catch (e) {
      return false;
    }
  }
};

var Atom = {};

Atom.__MODULE__ = Erlang.atom("Atom");

Atom.to_string = function (atom) {
  return Symbol.keyFor(atom);
};

Atom.to_char_list = function (atom) {
  return Atom.to_string(atom).split('');
};

var Enum = {
  __MODULE__: Erlang.atom('Enum'),

  all__qmark__: function all__qmark__(collection) {
    var fun = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
      return x;
    } : arguments[1];

    var result = Enum.filter(collection, function (x) {
      return !fun(x);
    });

    return result === [];
  },

  any__qmark__: function any__qmark__(collection) {
    var fun = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
      return x;
    } : arguments[1];

    var result = Enum.filter(collection, function (x) {
      return fun(x);
    });

    return result !== [];
  },

  at: function at(collection, n) {
    var the_default = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    for (var i = 0; i < collection.length; i++) {
      if (i === n) {
        return collection[i];
      }
    }

    return the_default;
  },

  concat: function concat() {
    for (var _len6 = arguments.length, enumables = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      enumables[_key6] = arguments[_key6];
    }

    return enumables[0].concat(enumables.slice(1));
  },

  count: function count(collection) {
    var fun = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    if (fun == null) {
      return Kernel.length(collection);
    } else {
      return Kernel.length(collection.filter(fun));
    }
  },

  each: function each(collection, fun) {
    [].forEach.call(collection, fun);
  },

  empty__qmark__: function empty__qmark__(collection) {
    return Kernel.length(collection) === 0;
  },

  fetch: function fetch(collection, n) {
    if (Kernel.is_list(collection)) {
      if (n < collection.length && n >= 0) {
        return Erlang.tuple(Erlang.atom("ok"), collection[n]);
      } else {
        return Erlang.atom("error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  fetch__emark__: function fetch__emark__(collection, n) {
    if (Kernel.is_list(collection)) {
      if (n < collection.length && n >= 0) {
        return collection[n];
      } else {
        throw new Error("out of bounds error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  filter: function filter(collection, fun) {
    return [].filter.call(collection, fun);
  },

  map: function map(collection, fun) {
    return [].map.call(collection, fun);
  },

  map_reduce: function map_reduce(collection, acc, fun) {
    var mapped = Erlang.list();
    var the_acc = acc;

    for (var i = 0; i < collection.length; i++) {
      var _tuple = fun(collection[i], the_acc);

      the_acc = Kernel.elem(_tuple, 1);
      mapped = Erlang.list.apply(Erlang, _toConsumableArray(mapped.concat([Kernel.elem(_tuple, 0)])));
    }

    return Erlang.tuple(mapped, the_acc);
  },

  member: function member(collection, value) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = collection[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var _x11 = _step5.value;

        if (_x11 === value) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
          _iterator5['return']();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    return false;
  },

  reduce: function reduce(collection, acc, fun) {
    var the_acc = acc;

    for (var i = 0; i < collection.length; i++) {
      the_acc = fun(collection[i], the_acc);
    }

    return the_acc;
  }
};

var Integer = {
  __MODULE__: Erlang.atom('Integer'),

  is_even: function is_even(n) {
    return n % 2 === 0;
  },

  is_odd: function is_odd(n) {
    return n % 2 !== 0;
  },

  parse: function parse(bin) {
    var result = parseInt(bin);

    if (isNaN(result)) {
      return Erlang.atom("error");
    }

    var indexOfDot = bin.indexOf(".");

    if (indexOfDot >= 0) {
      return Erlang.tuple(result, bin.substring(indexOfDot));
    }

    return Erlang.tuple(result, "");
  },

  to_char_list: function to_char_list(number) {
    var base = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    return number.toString(base).split('');
  },

  to_string: function to_string(number) {
    var base = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    return number.toString(base);
  }
};

var JS = {
  __MODULE__: Erlang.atom('JS'),

  get_property_or_call_function: function get_property_or_call_function(item, property) {
    if (item[property] instanceof Function) {
      return item[property]();
    } else {
      return item[property];
    }
  }
};

var List = {};

List.__MODULE__ = Erlang.atom('List');

List['delete'] = function (list, item) {
  var new_value = [];
  var value_found = false;

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _x14 = _step6.value;

      if (_x14 === item && value_found !== false) {
        new_value.push(_x14);
        value_found = true;
      } else if (_x14 !== item) {
        new_value.push(_x14);
      }
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6['return']) {
        _iterator6['return']();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  return Erlang.list.apply(Erlang, new_value);
};

List.delete_at = function (list, index) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i !== index) {
      new_value.push(list[i]);
    }
  }

  return Erlang.list.apply(Erlang, new_value);
};

List.duplicate = function (elem, n) {
  var new_value = [];

  for (var i = 0; i < n; i++) {
    new_value.push(elem);
  }

  return Erlang.list.apply(Erlang, new_value);
};

List.first = function (list) {
  if (list.length === 0) {
    return null;
  }

  return list[0];
};

List.flatten = function (list) {
  var tail = arguments.length <= 1 || arguments[1] === undefined ? Erlang.list() : arguments[1];

  var new_value = [];

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = list[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var _x16 = _step7.value;

      if (Kernel.is_list(_x16)) {
        new_value = new_value.concat(List.flatten(_x16));
      } else {
        new_value.push(_x16);
      }
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7['return']) {
        _iterator7['return']();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  new_value = new_value.concat(tail);

  return Erlang.list.apply(Erlang, _toConsumableArray(new_value));
};

List.foldl = function (list, acc, func) {
  var new_acc = acc;

  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = list[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var _x17 = _step8.value;

      new_acc = func(_x17, new_acc);
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8['return']) {
        _iterator8['return']();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  return new_acc;
};

List.foldr = function (list, acc, func) {
  var new_acc = acc;

  for (var i = list.length - 1; i >= 0; i--) {
    new_acc = func(list[i], new_acc);
  }

  return new_acc;
};

List.insert_at = function (list, index, value) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i === index) {
      new_value.push(value);
      new_value.push(list[i]);
    } else {
      new_value.push(list[i]);
    }
  }

  return Erlang.list.apply(Erlang, new_value);
};

List.keydelete = function (list, key, position) {
  var new_list = [];

  for (var i = 0; i < list.length; i++) {
    if (!Kernel.match__qmark__(list[i][position], key)) {
      new_list.push(list[i]);
    }
  }

  return Erlang.list.apply(Erlang, new_list);
};

List.keyfind = function (list, key, position) {
  var _default = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  for (var i = 0; i < list.length; i++) {
    if (Kernel.match__qmark__(list[i][position], key)) {
      return list[i];
    }
  }

  return _default;
};

List.keymember__qmark__ = function (list, key, position) {

  for (var i = 0; i < list.length; i++) {
    if (Kernel.match__qmark__(list[i][position], key)) {
      return true;
    }
  }

  return false;
};

List.keyreplace = function (list, key, position, new_tuple) {
  var new_list = [];

  for (var i = 0; i < list.length; i++) {
    if (!Kernel.match__qmark__(list[i][position], key)) {
      new_list.push(list[i]);
    } else {
      new_list.push(new_tuple);
    }
  }

  return Erlang.list.apply(Erlang, new_list);
};

List.keysort = function (list, position) {
  var new_list = list;

  new_list.sort(function (a, b) {
    if (position === 0) {
      if (a[position].value < b[position].value) {
        return -1;
      }

      if (a[position].value > b[position].value) {
        return 1;
      }

      return 0;
    } else {
      if (a[position] < b[position]) {
        return -1;
      }

      if (a[position] > b[position]) {
        return 1;
      }

      return 0;
    }
  });

  return Erlang.list.apply(Erlang, _toConsumableArray(new_list));
};

List.keystore = function (list, key, position, new_tuple) {
  var new_list = [];
  var replaced = false;

  for (var i = 0; i < list.length; i++) {
    if (!Kernel.match__qmark__(list[i][position], key)) {
      new_list.push(list[i]);
    } else {
      new_list.push(new_tuple);
      replaced = true;
    }
  }

  if (!replaced) {
    new_list.push(new_tuple);
  }

  return Erlang.list.apply(Erlang, new_list);
};

List.last = function (list) {
  if (list.length === 0) {
    return null;
  }

  return list[list.length - 1];
};

List.replace_at = function (list, index, value) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i === index) {
      new_value.push(value);
    } else {
      new_value.push(list[i]);
    }
  }

  return Erlang.list.apply(Erlang, new_value);
};

List.update_at = function (list, index, fun) {
  var new_value = [];

  for (var i = 0; i < list.length; i++) {
    if (i === index) {
      new_value.push(fun(list[i]));
    } else {
      new_value.push(list[i]);
    }
  }

  return new_value;
};

List.wrap = function (list) {
  if (Kernel.is_list(list)) {
    return list;
  } else if (list == null) {
    return Erlang.list();
  } else {
    return Erlang.list(list);
  }
};

List.zip = function (list_of_lists) {
  if (list_of_lists.length === 0) {
    return Erlang.list();
  }

  var new_value = [];
  var smallest_length = list_of_lists[0];

  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = list_of_lists[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      var _x19 = _step9.value;

      if (_x19.length < smallest_length) {
        smallest_length = _x19.length;
      }
    }
  } catch (err) {
    _didIteratorError9 = true;
    _iteratorError9 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion9 && _iterator9['return']) {
        _iterator9['return']();
      }
    } finally {
      if (_didIteratorError9) {
        throw _iteratorError9;
      }
    }
  }

  for (var i = 0; i < smallest_length; i++) {
    var current_value = [];
    for (var j = 0; j < list_of_lists.length; j++) {
      current_value.push(list_of_lists[j][i]);
    }

    new_value.push(Erlang.tuple.apply(Erlang, current_value));
  }

  return Erlang.list.apply(Erlang, new_value);
};

List.to_tuple = function (list) {
  return Erlang.tuple.apply(null, list);
};

List.append = function (list, value) {
  return Erlang.list.apply(Erlang, _toConsumableArray(list.concat([value])));
};

List.concat = function (left, right) {
  return Erlang.list.apply(Erlang, _toConsumableArray(left.concat(right)));
};

var Range = function Range(_first, _last) {
  if (!(this instanceof Range)) {
    return new Range(_first, _last);
  }

  this.first = function () {
    return _first;
  };

  this.last = function () {
    return _last;
  };

  var _range = [];

  for (var i = _first; i <= _last; i++) {
    _range.push(i);
  }

  _range = Object.freeze(_range);

  this.value = function () {
    return _range;
  };

  this.length = function () {
    return _range.length;
  };

  return this;
};

Range.__MODULE__ = Erlang.atom('Range');

Range.prototype[Symbol.iterator] = function () {
  return this.value()[Symbol.iterator]();
};

Range['new'] = function (first, last) {
  return Range(first, last);
};

Range.range__qmark__ = function (range) {
  return range instanceof Range;
};

var Keyword = {};

Keyword.__MODULE__ = Erlang.atom("Keyword");

Keyword.has_key__qm__ = function (keywords, key) {
  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = keywords[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      var keyword = _step10.value;

      if (Kernel.elem(keyword, 0) == key) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError10 = true;
    _iteratorError10 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion10 && _iterator10['return']) {
        _iterator10['return']();
      }
    } finally {
      if (_didIteratorError10) {
        throw _iteratorError10;
      }
    }
  }

  return false;
};

Keyword.get = function (keywords, key) {
  var the_default = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
  var _iteratorNormalCompletion11 = true;
  var _didIteratorError11 = false;
  var _iteratorError11 = undefined;

  try {
    for (var _iterator11 = keywords[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
      var keyword = _step11.value;

      if (Kernel.elem(keyword, 0) == key) {
        return Kernel.elem(keyword, 1);
      }
    }
  } catch (err) {
    _didIteratorError11 = true;
    _iteratorError11 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion11 && _iterator11['return']) {
        _iterator11['return']();
      }
    } finally {
      if (_didIteratorError11) {
        throw _iteratorError11;
      }
    }
  }

  return the_default;
};

var Agent = {};

Agent.__MODULE__ = Erlang.atom("Agent");

Agent.start = function (fun) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var name = Keyword.has_key__qm__(options, Erlang.atom("name")) ? Keyword.get(options, Erlang.atom("name")) : Symbol();
  self.mailbox[name] = fun();
  return Erlang.tuple(Erlang.atom("ok"), name);
};

Agent.stop = function (agent) {
  var timeout = arguments.length <= 1 || arguments[1] === undefined ? 5000 : arguments[1];

  delete self.mailbox[agent];
  return Erlang.atom("ok");
};

Agent.update = function (agent, fun) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5000 : arguments[2];

  var new_state = fun(self.mailbox[agent]);
  self.mailbox[agent] = new_state;
  return Erlang.atom("ok");
};

Agent.get = function (agent, fun) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5000 : arguments[2];

  return fun(self.mailbox[agent]);
};

Agent.get_and_update = function (agent, fun) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 5000 : arguments[2];

  var get_and_update_tuple = fun(self.mailbox[agent]);

  self.mailbox[agent] = Kernel.elem(get_and_update_tuple, 1);
  return Kernel.elem(get_and_update_tuple, 0);
};

self.mailbox = self.mailbox || {};

exports.fun = _fun;
exports.Erlang = Erlang;
exports.BitString = BitString;
exports.Kernel = Kernel;
exports.Atom = Atom;
exports.Enum = Enum;
exports.Integer = Integer;
exports.JS = JS;
exports.List = List;
exports.Range = Range;
exports.Tuple = Tuple;
exports.Agent = Agent;
exports.Keyword = Keyword;