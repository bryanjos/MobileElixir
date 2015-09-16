'use strict';

Object.defineProperty(exports, '__esModule', {
      value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _container, _welcome, _instructions, _React$StyleSheet$create;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _elixir = require('./elixir');

var _reactNative = require('react-native');

var _reactNative2 = _interopRequireDefault(_reactNative);

var __MODULE__ = _elixir.Erlang.atom('Index');
var mobileElixir = (0, _elixir.fun)([[], function () {
      return _reactNative2['default'].createClass(_defineProperty({}, 'render', (0, _elixir.fun)([[], function () {
            return _reactNative2['default'].createElement(_reactNative2['default'].View, _defineProperty({}, 'style', _elixir.JS.get_property_or_call_function(styles, 'container')), _reactNative2['default'].createElement(_reactNative2['default'].Text, _defineProperty({}, 'style', _elixir.JS.get_property_or_call_function(styles, 'welcome')), 'Welcome to React Native'), _reactNative2['default'].createElement(_reactNative2['default'].Text, _defineProperty({}, 'style', _elixir.JS.get_property_or_call_function(styles, 'instructions')), 'To get started, edit index.ios.js'), _reactNative2['default'].createElement(_reactNative2['default'].Text, _defineProperty({}, 'style', _elixir.JS.get_property_or_call_function(styles, 'instructions')), 'Press Cmd+R to reload, Cmd+D or shake for dev menu\n'));
      }])));
}]);

var _fun$bind = _elixir.fun.bind(_elixir.fun.parameter, _reactNative2['default'].StyleSheet.create((_React$StyleSheet$create = {}, _defineProperty(_React$StyleSheet$create, 'container', (_container = {}, _defineProperty(_container, 'flex', 2), _defineProperty(_container, 'justifyContent', 'center'), _defineProperty(_container, 'alignItems', 'center'), _defineProperty(_container, 'backgroundColor', '#F5FCFF'), _container)), _defineProperty(_React$StyleSheet$create, 'welcome', (_welcome = {}, _defineProperty(_welcome, 'fontSize', 20), _defineProperty(_welcome, 'textAlign', 'center'), _defineProperty(_welcome, 'margin', 10), _welcome)), _defineProperty(_React$StyleSheet$create, 'instructions', (_instructions = {}, _defineProperty(_instructions, 'textAlign', 'center'), _defineProperty(_instructions, 'color', '#333333'), _defineProperty(_instructions, 'marginBottom', 5), _instructions)), _React$StyleSheet$create)));

var _fun$bind2 = _slicedToArray(_fun$bind, 1);

var styles = _fun$bind2[0];

_reactNative2['default'].AppRegistry.registerComponent('MobileElixir', (0, _elixir.fun)([[], function () {
      return mobileElixir();
}]));
exports.mobileElixir = mobileElixir;