
import 'es6-shim';
import 'fetch-bluebird';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './index.css';

import { Provider } from 'react-redux';
import store from './store';
import NavButton from './components/NavButton';
import Company from './components/Company';
import MonPage from './components/MonPage';
import RoadPage from './components/RoadPage';
import ChartPage from './components/ChartPage';
import ReceiverPage from './components/ReceiverPage';
import AlarmQuery from './components/AlarmQuery';

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <div className="xroot">
                <div className="flex-row flex-menu">
                    <NavButton
                        to='/'
                        name="实时监控"
                        onClass='nav-btn nav-btn-hover nav-mon-on'
                        offClass='nav-btn nav-mon-off' />
                    <NavButton
                        to='/chart'
                        name="流量图表"
                        onClass='nav-btn nav-btn-hover nav-flow-on'
                        offClass='nav-btn nav-flow-off' />
                    <NavButton
                        to='/road'
                        name="道路配置"
                        onClass='nav-btn nav-btn-hover nav-road-on'
                        offClass='nav-btn nav-road-off' />
                    <NavButton
                        to='/receiver'
                        name="硬件配置"
                        onClass='nav-btn nav-btn-hover nav-config-on'
                        offClass='nav-btn nav-config-off' />
                    <NavButton
                        to='/query'
                        name="报警查询"
                        onClass='nav-btn nav-btn-hover nav-alarm-on'
                        offClass='nav-btn nav-alarm-off' />
                </div>
                <Route exact path='/' component={MonPage} />
                <Route exact path='/chart' component={ChartPage} />
                <Route exact path='/road' component={RoadPage} />
                <Route exact path='/receiver' component={ReceiverPage} />
                <Route exact path='/query' component={AlarmQuery} />
            </div>
        </Router >
    </Provider>, document.getElementById('root'));
