import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import svgReducer from './components/SvgStore';
import treeReducer from './components/TreeStore';
import dialogManagerReducer from './components/DialogManagerStore';

import historyReducer from './history';
import { createLogger } from 'redux-logger';


let logger = createLogger();
let reducer = combineReducers({ svgReducer, treeReducer, dialogManagerReducer, historyReducer });
let store = createStore(reducer, applyMiddleware(thunk));

export default store;