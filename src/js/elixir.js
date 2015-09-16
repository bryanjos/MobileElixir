function MatchError(message) {
  this.name = 'MatchError';
  this.message = message || 'No match for arguments given';
  this.stack = (new Error()).stack;
}

MatchError.prototype = Object.create(Error.prototype);
MatchError.prototype.constructor = MatchError;

const Type = {
  isSymbol: function(value) {
    return typeof x === 'symbol';
  },

  isAtom: function(value) {
    return !Type.isSymbol(value) && ((typeof value !== 'object' || value === null) &&
      typeof value !== 'function') ||
      Type.isBoolean(value) || Type.isNumber(value) || Type.isString(value);
  },

  isRegExp: function(value) {
    return (value.constructor.name === "RegExp" || value instanceof RegExp);
  },

  isNumber: function(value) {
    return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
  },

  isString: function(value) {
    return typeof value === 'string' || value instanceof String;
  },

  isBoolean: function(value) {
    return value !== null &&
      (typeof value === 'boolean' || value instanceof Boolean);
  },

  isArray: function(value) {
    return Array.isArray(value);
  },

  isObject: function(value) {
    return Object.prototype.toString.apply(value) === '[object Object]';
  },

  isFunction: function(value) {
    return typeof value === 'function';
  },

  isDefined: function(value) {
    return typeof value !== 'undefined';
  },

  isUndefined: function(value) {
    return typeof value === 'undefined';
  },

  isWildcard: function(value) {
    return value &&
    value.constructor === _fun.wildcard.constructor;
  },

  isVariable: function(value) {
    return value &&
        typeof value === 'object' &&
        typeof value.is_variable === 'function' &&
        typeof value.get_name === 'function' &&
        value.is_variable();
  },

  isParameter: function(value){
    return value &&
    (value === _fun.parameter || value.constructor.name === _fun.parameter().constructor.name);
  },

  isStartsWith: function(value){
    return value &&
    value.constructor.name === _fun.startsWith().constructor.name;
  },

  isCapture: function(value) {
    return value &&
    value.constructor.name === _fun.capture().constructor.name;
  },

  isHeadTail: function(value) {
    return value.constructor === _fun.headTail.constructor;
  },

  isBound: function(value) {
    return value &&
    value.constructor.name === _fun.bound().constructor.name;
  }
};

let object = {
  extend: function(obj) {
    let i = 1, key,
      len = arguments.length;
    for (; i < len; i += 1) {
      for (key in arguments[i]) {
        // make sure we do not override built-in methods but toString and valueOf
        if (arguments[i].hasOwnProperty(key) &&
          (!obj[key] || obj.propertyIsEnumerable(key) || key === 'toString' || key === 'valueOf')) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  },

  filter: function(obj, fun, thisObj) {
    let key,
      r = {}, val;
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

  map: function(obj, fun, thisObj) {
    let key,
      r = {};
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        r[key] = fun.call(thisObj, obj[key], key, obj);
      }
    }
    return r;
  },

  forEach: function(obj, fun, thisObj) {
    let key;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        fun.call(thisObj, obj[key], key, obj);
      }
    }
  },

  every: function(obj, fun, thisObj) {
    let key;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && !fun.call(thisObj, obj[key], key, obj)) {
        return false;
      }
    }
    return true;
  },

  some: function(obj, fun, thisObj) {
    let key;
    thisObj = thisObj || obj;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && fun.call(thisObj, obj[key], key, obj)) {
        return true;
      }
    }
    return false;
  },

  isEmpty: function(obj) {
    return object.every(obj, function(value, key) {
      return !obj.hasOwnProperty(key);
    });
  },

  values: function(obj) {
    let r = [];
    object.forEach(obj, function(value) {
      r.push(value);
    });
    return r;
  },

  keys: function(obj) {
    let r = [];
    object.forEach(obj, function(value, key) {
      r.push(key);
    });
    return r;
  },

  reduce: function(obj, fun, initial) {
    let key, initialKey;

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
  } else if(Type.isBound(pattern)) {
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

function equals(one, two){
  if(typeof one !== typeof two){
    return false;
  }

  if(Type.isArray(one) || Type.isObject(one) || Type.isString(one)){
    if(one.length !== two.length){
      return false;
    }

    for(let i in one){
      if(!equals(one[i], two[i])){
        return false;
      }
    }

    return true;
  }

  return one === two;
}

function matchBound(pattern){
  return function(value, bindings){
    return equals(value, pattern.value) && bindings.push(value) > 0;
  };
}

function matchParameter(pattern){
  return function(value, bindings) {
    return bindings.push(value) > 0;
  };
}

function matchWildcard(pattern){
  return function() {
    return true;
  };
}

function matchHeadTail(patternHeadTail){
  return function(value, bindings) {
    return value.length > 1 &&
    bindings.push(value[0]) > 0 &&
    bindings.push(value.slice(1)) > 0;
  };
}

function matchCapture(patternCapture){
  let pattern = patternCapture.pattern;
  let subMatches = buildMatch(pattern);

  return function(value, bindings) {
    return subMatches(value, bindings) && bindings.push(value) > 0;
  };

}

function matchStartsWith(patternStartsWith) {
  let substr = patternStartsWith.substr;

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  return function(value, bindings) {
    return Type.isString(substr) &&
      value.startsWith(substr) &&
      value.substring(substr.length) !== '' &&
      bindings.push(value.substring(substr.length)) > 0;
  };
}

function matchSymbol(patternSymbol) {
  let type = typeof patternSymbol,
    value = patternSymbol;

  return function(valueSymbol, bindings) {
    return (typeof valueSymbol === type && valueSymbol === value);
  };
}

function matchAtom(patternAtom) {
  let type = typeof patternAtom,
    value = patternAtom;

  return function(valueAtom, bindings) {
    return (typeof valueAtom === type && valueAtom === value) ||
      (typeof value === 'number' && isNaN(valueAtom) && isNaN(value));
  };
}

function matchRegExp(patternRegExp) {
  return function(value, bindings) {
    return !(typeof value === undefined) && typeof value === 'string' && patternRegExp.test(value);
  };
}

function matchFunction(patternFunction) {
  return function(value, bindings) {
    return value.constructor === patternFunction &&
      bindings.push(value) > 0;
  };
}

function matchArray(patternArray) {
  let patternLength = patternArray.length,
    subMatches = patternArray.map(function(value) {
      return buildMatch(value);
    });

  return function(valueArray, bindings) {
    return patternLength === valueArray.length &&
      valueArray.every(function(value, i) {
        return (i in subMatches) && subMatches[i](valueArray[i], bindings);
      });
  };
}

function matchObject(patternObject) {
  let type = patternObject.constructor,
    patternLength = 0,
    // Figure out the number of properties in the object
    // and the keys we need to check for. We put these
    // in another object so access is very fast. The build_match
    // function creates new subtests which we execute later.
    subMatches = object.map(patternObject, function(value) {
      patternLength += 1;
      return buildMatch(value);
    });

  // We then return a function which uses that information
  // to check against the object passed to it.
  return function(valueObject, bindings) {
    if(valueObject.constructor !== type){
      return false;
    }

    let newValueObject = {};

    for(let key of Object.keys(patternObject)){
      if(key in valueObject){
        newValueObject[key] = valueObject[key];
      }else{
        return false;
      }
    }

    // Checking the object type is very fast so we do it first.
    // Then we iterate through the value object and check the keys
    // it contains against the hash object we built earlier.
    // We also count the number of keys in the value object,
    // so we can also test against it as a final check.
    return object.every(newValueObject, function(value, key) {
        return ((key in subMatches) && subMatches[key](newValueObject[key], bindings));
      });
  };
}


var Match = {
  buildMatch
};

/**
 * @preserve jFun - JavaScript Pattern Matching v0.12
 *
 * Licensed under the new BSD License.
 * Copyright 2008, Bram Stein
 * All rights reserved.
 */
let _fun = function(...args) {
  let patterns = args.slice(0).map(function(value, i) {
    let pattern = {
      pattern: Match.buildMatch(value[0]),
      fn: value[1],
      guard: value.length === 3 ? value[2] : function() {
        return true;
      }
    };

    return pattern;
  });

  return function(...inner_args) {
    let value = inner_args.slice(0),
      result = [];

    for (let pattern of patterns) {
      if (pattern.pattern(value, result) && pattern.guard.apply(this, result)) {
        return pattern.fn.apply(this, result);
      }

      result = [];
    }
    // no matches were made so we throw an exception.
    throw new MatchError('No match for: ' + value);
  };
};

_fun.bind = function(pattern, expr){
  let result = [];
  let processedPattern = Match.buildMatch(pattern);
  if (processedPattern(expr, result)){
    return result;
  }else{
    throw new MatchError('No match for: ' + expr);
  }
};


_fun.parameter = function(name, orElse) {
  function Parameter(n, o) {
    this.name = n;
    this.orElse = o;
  }
  return new Parameter(name, orElse);
};

_fun.capture = function(pattern) {
  function Capture(p) {
    this.pattern = p;
  }
  return new Capture(pattern);
};

_fun.startsWith = function(substr) {
  function StartsWith(s) {
    this.substr = s;
  }

  return new StartsWith(substr);
};

_fun.wildcard = (function() {
  function Wildcard() {
  }
  return new Wildcard();
}());

_fun.headTail = (function() {
  function HeadTail() {
  }
  return new HeadTail();
}());

_fun.bound = function(value) {
  function Bound(v) {
    this.value = v;
  }

  return new Bound(value);
};

let BitString = {};

BitString.__MODULE__ = Symbol.for("BitString");

BitString.integer = function(value){
  return BitString.wrap(value, { 'type': 'integer', 'unit': 1, 'size': 8 });
};

BitString.float = function(value){
  return BitString.wrap(value, { 'type': 'float', 'unit': 1, 'size': 64 });
};

BitString.bitstring = function(value){
  return BitString.wrap(value, { 'type': 'bitstring', 'unit': 1, 'size': value.length });
};

BitString.bits = function(value){
  return BitString.bitstring(value);
};

BitString.binary = function(value){
  return BitString.wrap(value, { 'type': 'binary', 'unit': 8, 'size': value.length});
};

BitString.bytes = function(value){
  return BitString.binary(value);
};

BitString.utf8 = function(value){
  return BitString.wrap(value, { 'type': 'utf8' });
};

BitString.utf16 = function(value){
  return BitString.wrap(value, { 'type': 'utf16' });
};

BitString.utf32 = function(value){
  return BitString.wrap(value, { 'type': 'utf32' });
};

BitString.signed = function(value){
  return BitString.wrap(value, {}, 'signed');
};

BitString.unsigned = function(value){
  return BitString.wrap(value, {}, 'unsigned');
};

BitString.native = function(value){
  return BitString.wrap(value, {}, 'native');
};

BitString.big = function(value){
  return BitString.wrap(value, {}, 'big');
};

BitString.little = function(value){
  return BitString.wrap(value, {}, 'little');
};

BitString.size = function(value, count){
  return BitString.wrap(value, {'size': count});
};

BitString.unit = function(value, count){
  return BitString.wrap(value, {'unit': count});
};

BitString.wrap = function(value, opt, new_attribute = null){
  let the_value = value;

  if(!(value instanceof Object)){
    the_value = {'value': value, 'attributes': []};
  }

  the_value = Object.assign(the_value, opt);

  if(new_attribute){
    the_value.attributes.push(new_attribute);
  }


  return the_value;
};

BitString.toUTF8Array = function(str) {
  var utf8 = [];
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80){
      utf8.push(charcode);
    }
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
    }
    else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
    }
  }
  return utf8;
};

BitString.toUTF16Array = function(str) {
  var utf16 = [];
  for (var i = 0; i < str.length; i++) {
    var codePoint = str.codePointAt(i);

    if(codePoint <= 255){
      utf16.push(0);
      utf16.push(codePoint);
    }else{
      utf16.push(((codePoint >> 8) & 0xFF));
      utf16.push((codePoint & 0xFF));
    }
  }
  return utf16;
};


BitString.toUTF32Array = function(str) {
  var utf32 = [];
  for (var i = 0; i < str.length; i++) {
    var codePoint = str.codePointAt(i);

    if(codePoint <= 255){
      utf32.push(0);
      utf32.push(0);
      utf32.push(0);
      utf32.push(codePoint);
    }else{
      utf32.push(0);
      utf32.push(0);
      utf32.push(((codePoint >> 8) & 0xFF));
      utf32.push((codePoint & 0xFF));
    }
  }
  return utf32;
};

//http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
BitString.float32ToBytes = function(f) {
  var bytes = [];

  var buf = new ArrayBuffer(4);
  (new Float32Array(buf))[0] = f;

  let intVersion = (new Uint32Array(buf))[0];

  bytes.push(((intVersion >> 24) & 0xFF));
  bytes.push(((intVersion >> 16) & 0xFF));
  bytes.push(((intVersion >> 8) & 0xFF));
  bytes.push((intVersion & 0xFF));

  return bytes;
};

BitString.float64ToBytes = function(f) {
  var bytes = [];

  var buf = new ArrayBuffer(8);
  (new Float64Array(buf))[0] = f;

  var intVersion1 = (new Uint32Array(buf))[0];
  var intVersion2 = (new Uint32Array(buf))[1];

  bytes.push(((intVersion2 >> 24) & 0xFF));
  bytes.push(((intVersion2 >> 16) & 0xFF));
  bytes.push(((intVersion2 >> 8) & 0xFF));
  bytes.push((intVersion2 & 0xFF));

  bytes.push(((intVersion1 >> 24) & 0xFF));
  bytes.push(((intVersion1 >> 16) & 0xFF));
  bytes.push(((intVersion1 >> 8) & 0xFF));
  bytes.push((intVersion1 & 0xFF));

  return bytes;
};

function atom (_value) {
  return Symbol.for(_value);
}

function list(...args){
  return Object.freeze(args);
}

function tuple(...args){
  return Object.freeze({__tuple__: Object.freeze(args) });
}

function bitstring(...args){
  if (!(this instanceof bitstring)){
    return new bitstring(...args);
  }

  this.raw_value = function(){
    return Object.freeze(args);
  };

  let _value = Object.freeze(this.process(args));

  this.value = function(){
    return _value;
  };

  this.length = _value.length;

  this.get = function(i){
    return _value[i];
  };

  return this;
}

bitstring.prototype[Symbol.iterator] = function () {
  return this.value()[Symbol.iterator]();
};

bitstring.prototype.toString = function(){
  var i, s = "";
  for (i = 0; i < this.length; i++) {
    if (s !== "") {
      s += ", ";
    }
    s += this.get(i).toString();
  }

  return "<<" + s + ">>";
};

bitstring.prototype.process = function(){
  let processed_values = [];

  var i;
  for (i = 0; i < this.raw_value().length; i++) {
    let processed_value = this['process_' + this.raw_value()[i].type](this.raw_value()[i]);

    for(let attr of this.raw_value()[i].attributes){
      processed_value = this['process_' + attr](processed_value);
    }

    processed_values = processed_values.concat(processed_value);
  }

  return processed_values;
};

bitstring.prototype.process_integer = function(value){
  return value.value;
};

bitstring.prototype.process_float = function(value){
  if(value.size === 64){
    return BitString.float64ToBytes(value.value);
  }else if(value.size === 32){
    return BitString.float32ToBytes(value.value);
  }

  throw new Error('Invalid size for float');
};

bitstring.prototype.process_bitstring = function(value){
  return value.value.value;
};

bitstring.prototype.process_binary = function(value){
  return BitString.toUTF8Array(value.value);
};

bitstring.prototype.process_utf8 = function(value){
  return BitString.toUTF8Array(value.value);
};

bitstring.prototype.process_utf16 = function(value){
  return BitString.toUTF16Array(value.value);
};

bitstring.prototype.process_utf32 = function(value){
  return BitString.toUTF32Array(value.value);
};

bitstring.prototype.process_signed = function(value){
  return (new Uint8Array([value]))[0];
};

bitstring.prototype.process_unsigned = function(value){
  return value;
};

bitstring.prototype.process_native = function(value){
  return value;
};

bitstring.prototype.process_big = function(value){
  return value;
};

bitstring.prototype.process_little = function(value){
  return value.reverse();
};

bitstring.prototype.process_size = function(value){
  return value;
};

bitstring.prototype.process_unit = function(value){
  return value;
};

let Erlang = {
  atom: atom,
  tuple: tuple,
  list: list,
  bitstring: bitstring
};

let Tuple = {};

Tuple.__MODULE__ = Erlang.atom('Tuple');

Tuple.to_string = function(tuple){
  var i, s = "";
  for (i = 0; i < tuple.__tuple__.length; i++) {
    if (s !== "") {
      s += ", ";
    }
    s += tuple.__tuple__[i].toString();
  }

  return "{" + s + "}";
};

Tuple.delete_at = function(tuple, index){
  let new_list = [];

  for (var i = 0; i < tuple.__tuple__.length; i++) {
    if(i !== index){
      new_list.push(tuple.__tuple__[i]);
    }
  }

  return Erlang.tuple.apply(null, new_list);
};

Tuple.duplicate = function(data, size){
  let array = [];

  for (var i = size - 1; i >= 0; i--) {
    array.push(data);
  }

  return Erlang.tuple.apply(null, array);
};

Tuple.insert_at = function(tuple, index, term){
  let new_tuple = [];

  for (var i = 0; i <= tuple.__tuple__.length; i++) {
    if(i === index){
      new_tuple.push(term);
      i++;
      new_tuple.push(tuple.__tuple__[i]);
    }else{
      new_tuple.push(tuple.__tuple__[i]);
    }
  }

  return Erlang.tuple.apply(null, new_tuple);
};

Tuple.from_list = function(list){
  return Erlang.tuple.apply(null, list);
};

Tuple.to_list = function(tuple){
  let new_list = [];

  for (var i = 0; i < tuple.__tuple__.length; i++) {
    new_list.push(tuple.__tuple__[i]);
  }

  return Erlang.list(...new_list);
};

Tuple.iterator = function(tuple){
  return tuple.__tuple__[Symbol.iterator]();
};

let SpecialForms = {
  __MODULE__: Erlang.atom('SpecialForms'),

  __DIR__: function(){
    if(__dirname){
      return __dirname;
    }

    if(document.currentScript){
      return document.currentScript.src;
    }

    return null;
  },

  receive: function(receive_fun, timeout_in_ms = null, timeout_fn = (time) => true){
    if (timeout_in_ms == null || timeout_in_ms === System.for('infinity')) {
      while(true){
        if(self.mailbox.length !== 0){
          let message = self.mailbox[0];
          self.mailbox = self.mailbox.slice(1);
          return receive_fun(message);
        }
      }
    }else if(timeout_in_ms === 0){
      if(self.mailbox.length !== 0){
        let message = self.mailbox[0];
        self.mailbox = self.mailbox.slice(1);
        return receive_fun(message);
      }else{
        return null;
      }
    }else{
      let now = Date.now();
      while(Date.now() < (now + timeout_in_ms)){
        if(self.mailbox.length !== 0){
          let message = self.mailbox[0];
          self.mailbox = self.mailbox.slice(1);
          return receive_fun(message);
        }
      }

      return timeout_fn(timeout_in_ms);
    }
  }
};

let Kernel = {
  __MODULE__: Erlang.atom('Kernel'),

  SpecialForms: SpecialForms,

  tl: function(list){
    return Erlang.list(...list.slice(1));
  },

  hd: function(list){
    return list[0];
  },

  is_nil: function(x){
    return x == null;
  },

  is_atom: function(x){
    return typeof x === 'symbol';
  },

  is_binary: function (x){
    return typeof x === 'string' || x instanceof String;
  },

  is_boolean: function (x){
    return typeof x === 'boolean' || x instanceof Boolean;
  },

  is_function: function(x, arity = -1){
    return typeof x === 'function' || x instanceof Function;
  },

  // from: http://stackoverflow.com/a/3885844
  is_float: function(x){
    return x === +x && x !== (x|0);
  },

  is_integer: function(x){
    return x === +x && x === (x|0);
  },

  is_list: function(x){
    return x instanceof Array;
  },

  is_map: function(x){
    return typeof x === 'object' || x instanceof Object && x.__tuple__ === null;
  },

  is_number: function(x){
    return Kernel.is_integer(x) || Kernel.is_float(x);
  },

  is_tuple: function(x){
    return (typeof x === 'object' || x instanceof Object) && x.__tuple__ !== null;
  },

  length: function(x){
    return x.length;
  },

  is_pid: function(x){
    return false;
  },

  is_port: function(x){

  },

  is_reference: function(x){

  },

  is_bitstring: function(x){
    return Kernel.is_binary(x) || x instanceof Erlang.bitstring;
  },

  __in__: function(left, right){
    for(let x of right){
      if(Kernel.match__qmark__(left, x)){
        return true;
      }
    }

    return false;
  },

  abs: function(number){
    return Math.abs(number);
  },

  round: function(number){
    return Math.round(number);
  },

  elem: function(tuple, index){
    if(Kernel.is_list(tuple)){
      return tuple[index];
    }

    return tuple.__tuple__[index];
  },

  rem: function(left, right){
    return left % right;
  },

  div: function(left, right){
    return left / right;
  },

  and: function(left, right){
    return left && right;
  },

  or: function(left, right){
    return left || right;
  },

  not: function(arg){
    return !arg;
  },

  apply: function(module, func, args){
    if(arguments.length === 3){
      return module[func].apply(null, args);
    }else{
      return module.apply(null, func);
    }
  },

  to_string: function(arg){
    if(Kernel.is_tuple(arg)){
      return Tuple.to_string(arg);
    }

    return arg.toString();
  },

  throw: function(e){
    throw e;
  },

  match__qmark__: function(pattern, expr, guard = () => true){
    try{
      let match = _fun([
        [pattern],
        function(){
          return true;
        },
        guard
      ]);

      return match(expr);
    }catch(e){
      return false;
    }
  }
};

let Atom = {};

Atom.__MODULE__ = Erlang.atom("Atom");

Atom.to_string = function (atom) {
  return Symbol.keyFor(atom);
};

Atom.to_char_list = function (atom) {
  return Atom.to_string(atom).split('');
};

let Enum = {
  __MODULE__: Erlang.atom('Enum'),

  all__qmark__: function(collection, fun = (x) => x){
    let result = Enum.filter(collection, function(x){
      return !fun(x);
    });

    return result === [];
  },

  any__qmark__: function(collection, fun = (x) => x){
    let result = Enum.filter(collection, function(x){
      return fun(x);
    });

    return result !== [];
  },

  at: function(collection, n, the_default = null){
    for (var i = 0; i < collection.length; i++) {
      if(i === n){
        return collection[i];
      }
    }

    return the_default;
  },

  concat: function(...enumables){
    return enumables[0].concat(enumables.slice(1));
  },

  count: function(collection, fun = null){
    if(fun == null){
      return Kernel.length(collection);
    }else{
      return Kernel.length(collection.filter(fun));
    }
  },

  each: function(collection, fun){
    [].forEach.call(collection, fun);
  },

  empty__qmark__: function(collection){
    return Kernel.length(collection) === 0;
  },

  fetch: function(collection, n){
    if(Kernel.is_list(collection)){
      if(n < collection.length && n >= 0){
        return Erlang.tuple(Erlang.atom("ok"), collection[n]);
      }else{
        return Erlang.atom("error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  fetch__emark__: function(collection, n){
    if(Kernel.is_list(collection)){
      if(n < collection.length && n >= 0){
        return collection[n];
      }else{
        throw new Error("out of bounds error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  filter: function(collection, fun){
    return [].filter.call(collection, fun);
  },

  map: function(collection, fun){
    return [].map.call(collection, fun);
  },

  map_reduce: function(collection, acc, fun){
    let mapped = Erlang.list();
    let the_acc = acc;

    for (var i = 0; i < collection.length; i++) {
      let tuple = fun(collection[i], the_acc);

      the_acc = Kernel.elem(tuple, 1);
      mapped = Erlang.list(...mapped.concat([Kernel.elem(tuple, 0)]));
    }

    return Erlang.tuple(mapped, the_acc);
  },

  member: function(collection, value){
    for(let x of collection){
      if(x === value){
        return true;
      }
    }

    return false;
  },

  reduce: function(collection, acc, fun){
    let the_acc = acc;

    for (var i = 0; i < collection.length; i++) {
      the_acc = fun(collection[i], the_acc);
    }

    return the_acc;
  }
};

let Integer = {
  __MODULE__: Erlang.atom('Integer'),

  is_even: function(n){
    return n % 2 === 0;
  },

  is_odd: function(n){
    return n % 2 !== 0;
  },

  parse: function(bin){
    let result = parseInt(bin);

    if(isNaN(result)){
      return Erlang.atom("error");
    }

    let indexOfDot = bin.indexOf(".");

    if(indexOfDot >= 0){
      return Erlang.tuple(result, bin.substring(indexOfDot));
    }

    return Erlang.tuple(result, "");
  },

  to_char_list: function(number, base = 10){
    return number.toString(base).split('');
  },

  to_string: function(number, base = 10){
    return number.toString(base);
  }
};

let JS = {
  __MODULE__: Erlang.atom('JS'),

  get_property_or_call_function: function(item, property){
    if(item[property] instanceof Function){
      return item[property]();
    }else{
      return item[property];
    }
  }
};

let List = {};

List.__MODULE__ = Erlang.atom('List');

List.delete = function(list, item){
  let new_value = [];
  let value_found = false;

  for(let x of list){
    if(x === item && value_found !== false){
      new_value.push(x);
      value_found = true;
    }else if(x !== item){
      new_value.push(x);
    }
  }

  return Erlang.list(...new_value);
};

List.delete_at = function(list, index){
  let new_value = [];

  for(let i = 0; i < list.length; i++){
    if(i !== index){
      new_value.push(list[i]);
    }
  }

  return Erlang.list(...new_value);
};

List.duplicate = function(elem, n){
  let new_value = [];

  for (var i = 0; i < n; i++) {
    new_value.push(elem);
  }

  return Erlang.list(...new_value);
};

List.first = function(list){
  if(list.length === 0){
    return null;
  }

  return list[0];
};

List.flatten = function(list, tail = Erlang.list()){
  let new_value = [];

  for(let x of list){
    if(Kernel.is_list(x)){
      new_value = new_value.concat(List.flatten(x));
    }else{
      new_value.push(x);
    }
  }

  new_value = new_value.concat(tail);

  return Erlang.list(...new_value);
};

List.foldl = function(list, acc, func){
  let new_acc = acc;

  for(let x of list){
    new_acc = func(x, new_acc);
  }

  return new_acc;
};

List.foldr = function(list, acc, func){
  let new_acc = acc;

  for (var i = list.length - 1; i >= 0; i--) {
    new_acc = func(list[i], new_acc);
  }

  return new_acc;
};

List.insert_at = function(list, index, value){
  let new_value = [];

  for(let i = 0; i < list.length; i++){
    if(i === index){
      new_value.push(value);
      new_value.push(list[i]);
    }else{
      new_value.push(list[i]);
    }
  }

  return Erlang.list(...new_value);
};

List.keydelete = function(list, key, position){
  let new_list = [];

  for(let i = 0; i < list.length; i++){
    if(!Kernel.match__qmark__(list[i][position], key)){
      new_list.push(list[i]);
    }
  }

  return Erlang.list(...new_list);
};

List.keyfind = function(list, key, position, _default = null){

  for(let i = 0; i < list.length; i++){
    if(Kernel.match__qmark__(list[i][position], key)){
      return list[i];
    }
  }

  return _default;
};

List.keymember__qmark__ = function(list, key, position){

  for(let i = 0; i < list.length; i++){
    if(Kernel.match__qmark__(list[i][position], key)){
      return true;
    }
  }

  return false;
};

List.keyreplace = function(list, key, position, new_tuple){
  let new_list = [];

  for(let i = 0; i < list.length; i++){
    if(!Kernel.match__qmark__(list[i][position], key)){
      new_list.push(list[i]);
    }else{
      new_list.push(new_tuple);
    }
  }

  return Erlang.list(...new_list);
};


List.keysort = function(list, position){
  let new_list = list;

  new_list.sort(function(a, b){
    if(position === 0){
      if(a[position].value < b[position].value){
        return -1;
      }

      if(a[position].value > b[position].value){
        return 1;
      }

      return 0;
    }else{
      if(a[position] < b[position]){
        return -1;
      }

      if(a[position] > b[position]){
        return 1;
      }

      return 0;
    }

  });

  return Erlang.list(...new_list);
};

List.keystore = function(list, key, position, new_tuple){
  let new_list = [];
  let replaced = false;

  for(let i = 0; i < list.length; i++){
    if(!Kernel.match__qmark__(list[i][position], key)){
      new_list.push(list[i]);
    }else{
      new_list.push(new_tuple);
      replaced = true;
    }
  }

  if(!replaced){
    new_list.push(new_tuple);
  }

  return Erlang.list(...new_list);
};

List.last = function(list){
  if(list.length === 0){
    return null;
  }

  return list[list.length - 1];
};

List.replace_at = function(list, index, value){
  let new_value = [];

  for(let i = 0; i < list.length; i++){
    if(i === index){
      new_value.push(value);
    }else{
      new_value.push(list[i]);
    }
  }

  return Erlang.list(...new_value);
};

List.update_at = function(list, index, fun){
  let new_value = [];

  for(let i = 0; i < list.length; i++){
    if(i === index){
      new_value.push(fun(list[i]));
    }else{
      new_value.push(list[i]);
    }
  }

  return new_value;
};

List.wrap = function(list){
  if(Kernel.is_list(list)){
    return list;
  }else if(list == null){
    return Erlang.list();
  }else{
    return Erlang.list(list);
  }
};

List.zip = function(list_of_lists){
  if(list_of_lists.length === 0){
    return Erlang.list();
  }

  let new_value = [];
  let smallest_length = list_of_lists[0];

  for(let x of list_of_lists){
    if(x.length < smallest_length){
      smallest_length = x.length;
    }
  }

  for(let i = 0; i < smallest_length; i++){
    let current_value = [];
    for(let j = 0; j < list_of_lists.length; j++){
      current_value.push(list_of_lists[j][i]);
    }

    new_value.push(Erlang.tuple(...current_value));
  }

  return Erlang.list(...new_value);
};

List.to_tuple = function(list){
  return Erlang.tuple.apply(null, list);
};

List.append = function(list, value){
  return Erlang.list(...list.concat([value]));
};

List.concat = function(left, right){
  return Erlang.list(...left.concat(right));
};

let Range = function(_first, _last){
  if (!(this instanceof Range)){
    return new Range(_first, _last);
  }

  this.first = function(){
    return _first;
  };

  this.last = function(){
    return _last;
  };

  let _range = [];

  for(let i = _first; i <= _last; i++){
    _range.push(i);
  }

  _range = Object.freeze(_range);

  this.value = function(){
    return _range;
  };

  this.length = function(){
    return _range.length;
  };

  return this;
};

Range.__MODULE__ = Erlang.atom('Range');

Range.prototype[Symbol.iterator] = function(){
  return this.value()[Symbol.iterator]();
};

Range.new = function (first, last) {
  return Range(first, last);
};

Range.range__qmark__ = function (range) {
  return range instanceof Range;
};

let Keyword = {};

Keyword.__MODULE__ = Erlang.atom("Keyword");

Keyword.has_key__qm__ = function(keywords, key){
  for(let keyword of keywords){
    if(Kernel.elem(keyword, 0) == key){
      return true;
    }
  }

  return false;
}

Keyword.get = function(keywords, key, the_default = null){
  for(let keyword of keywords){
    if(Kernel.elem(keyword, 0) == key){
      return Kernel.elem(keyword, 1);
    }
  }

  return the_default;
}

let Agent = {};

Agent.__MODULE__ = Erlang.atom("Agent");

Agent.start = function(fun, options = []){
  const name = Keyword.has_key__qm__(options, Erlang.atom("name")) ? Keyword.get(options, Erlang.atom("name")) : Symbol();
  self.mailbox[name] = fun();
  return Erlang.tuple(Erlang.atom("ok"), name);
}

Agent.stop = function(agent, timeout = 5000){
  delete self.mailbox[agent];
  return Erlang.atom("ok");
}

Agent.update = function(agent, fun, timeout = 5000){
  const new_state = fun(self.mailbox[agent]);
  self.mailbox[agent] = new_state;
  return Erlang.atom("ok");
}

Agent.get = function(agent, fun, timeout = 5000){
  return fun(self.mailbox[agent]);
}

Agent.get_and_update = function(agent, fun, timeout = 5000){
  const get_and_update_tuple = fun(self.mailbox[agent]);
  
  self.mailbox[agent] = Kernel.elem(get_and_update_tuple, 1);
  return Kernel.elem(get_and_update_tuple, 0);
}

self.mailbox = self.mailbox || {};

export { _fun as fun, Erlang, BitString, Kernel, Atom, Enum, Integer, JS, List, Range, Tuple, Agent, Keyword };