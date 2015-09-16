    import { fun, Erlang, Kernel, Atom, Enum, Integer, JS, List, Range, Tuple, Agent, Keyword, BitString } from './elixir';
    import { default as React } from 'react-native';
    const __MODULE__ = Erlang.atom('Index');
    let mobileElixir = fun([[], function()    {
        return     React.createClass({
        ['render']: fun([[], function()    {
        return     React.createElement(React.View,{
        ['style']: JS.get_property_or_call_function(styles,'container')
  },React.createElement(React.Text,{
        ['style']: JS.get_property_or_call_function(styles,'welcome')
  },'Welcome to React Native'),React.createElement(React.Text,{
        ['style']: JS.get_property_or_call_function(styles,'instructions')
  },'To get started, edit index.ios.js'),React.createElement(React.Text,{
        ['style']: JS.get_property_or_call_function(styles,'instructions')
  },'Press Cmd+R to reload, Cmd+D or shake for dev menu\n'));
      }])
  });
      }]);
    let [styles] = fun.bind(fun.parameter,React.StyleSheet.create({
        ['container']: {
        ['flex']: 2,     ['justifyContent']: 'center',     ['alignItems']: 'center',     ['backgroundColor']: '#F5FCFF'
  },     ['welcome']: {
        ['fontSize']: 20,     ['textAlign']: 'center',     ['margin']: 10
  },     ['instructions']: {
        ['textAlign']: 'center',     ['color']: '#333333',     ['marginBottom']: 5
  }
  }));
    React.AppRegistry.registerComponent('MobileElixir',fun([[], function()    {
        return     mobileElixir();
      }]));
    export {
        mobileElixir
  };