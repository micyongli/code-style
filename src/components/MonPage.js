import React from 'react'
import reactDom from 'react-dom'
import './MonPage.css';

import SearchBox from './SearchBox'
import Svg from './Svg'
import getGeometry from '../util/geometry';
import Modal from 'react-modal';
import DialogManager from './DialogManager';
import { dialogManagerMapProps, dialogManagerDispatch } from './DialogManagerStore';
import { mapHistoryDispatch } from '../history';
import { connect } from 'react-redux'
import Dialog from './Dialog'
import { mapDispatch as svgDispatch } from './SvgStore';
import { mapDispatch as treeDispatch } from './TreeStore';

import io from 'socket.io-client';



class MonPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            roadName: '',
            roadId: ''
        }
    }
    componentWillUnmount() {
        if (this.socketio) {
            this.socketio.disconnect();
            delete this.socketio;
        }
    }
    componentDidMount() {

        this.props.initTreeAction();
        this.props.initSvgAction();

        /**加载树 */
        this.props.fetchTreeAction('/road/query');

        /**命名空间 */
        this.socketio = io('/');
        this.socketio.on('connect', () => {
            this.socketio.on('suminfo', data => {
                let ml = this.props.svgReducer.monlist;
                if (ml) {
                    let idsets = ml.body.map(a => a['guid'])
                    for (let x in data) {
                        let id = data[x]['guid'];
                        if (idsets.indexOf(id) >= 0)
                            this.props.updateMonListAction(id, data[x]['result']);
                    }
                }
            });

            this.socketio.on('clientFirstLogin', data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(a => {
                        this.setShapeStatus(a)
                    })
                }
            });

            this.socketio.on('status', data => {
                if (Array.isArray(data)) {
                    data.forEach(a => {
                        this.setShapeStatus(a);
                    })
                }
            });
        });

        /**加载历史 */
        this.loadHistory()
    }

    loadHistory = () => {
        let his = this.getHistory();
        if (his) {
            this.props.createRoad(his, true);
            fetch('/road/queryroadname', { body: JSON.stringify({ roadId: his }), credentials: 'include', method: 'post', headers: { 'content-type': 'application/json' } })
                .then(r => {
                    if (r.status >= 200 && r.status < 300) {
                        return r.json()
                    }
                    throw new Error(r.statusText);
                })
                .then(r => {
                    if (r.code != 0)
                        throw new Error(r.msg)
                    if (r.data.length > 0) {
                        let first = r.data[0];
                        this.setState({ roadName: `${first.name}(${first.code})` })
                    }
                })
                .catch(e => {
                    console.log(e)
                    this.props.showDialogAction(Dialog,
                        {
                            content: e.message,
                            onCancle: id => {
                                this.props.closeDialogAction(id);
                            },
                            isShowButton: false
                        }
                    );
                });

        } else {
            fetch('/road/queryoneroad', { credentials: 'include', method: 'post', headers: { 'content-type': 'applicatin/json' } })
                .then(r => {
                    if (r.status >= 200 && r.status < 300) {
                        return r.json();
                    }
                    throw new Error(r.statusText);
                })
                .then(r => {
                    if (r.code != 0)
                        throw new Error(r.msg);
                    if (r.data.length > 0) {
                        let first = r.data[0];
                        this.setHistory(first.id);
                        this.props.createRoad(first.id, true);
                        this.setState({ roadName: `${first.name}(${first.code})` })
                    }
                })
                .catch(e => {
                    console.log(e)
                    this.props.showDialogAction(Dialog,
                        {
                            content: e.message,
                            onCancle: id => {
                                this.props.closeDialogAction(id);
                            },
                            isShowButton: false
                        }
                    );
                });
        }
    };

    setHistory = (d) => {
        this.props.setHistoryAction('monpage_roadid', d)
    }

    getHistory = () => {
        return this.props.historyReducer.history['monpage_roadid']
    }

    setShapeStatus = item => {
        let s = item.state;
        let id = item.gid;
        let ml = this.props.svgReducer.monlist;
        if (ml) {
            ml.body.forEach(a => {
                if (a.guid === id) {
                    switch (s) {
                        case 0:
                            this.props.triggerBusyAction(id)
                            break;
                        case 1:
                            this.props.triggerNormalAction(id)
                            break;
                        case 0:
                            this.props.triggerAlarmAction(id)
                            break;
                        default:
                        //console.debug('未知的状态')
                    }
                }
            })

        }

    }

    componentWillReceiveProps(nx) {
        let nid = nx.treeReducer.roadId;
        let cid = this.props.treeReducer.roadId;
        if (nid && nid !== cid) {
            this.setHistory(nid);
            nx.createRoad(nid, true);
        } else
            if (nid != cid) {
                nx.initSvgAction();
            }

        //初始化
        if (nx.svgReducer.loadedShapes !== this.props.svgReducer.loadedShapes && nx.svgReducer.loadedShapes) {
            this.getInitStatus();
        }
    }

    getInitStatus = () => {
        if (this.socketio) {
            this.socketio.emit('clientFirstLogin', 'get_init_status');
        }
    }

    onSearch = item => {
        this.props.searchExpandTreeAction(item.key);
    }

    renderTable = () => {
        let ml = this.props.svgReducer.monlist;
        return <table className="table">
            <thead >
                <tr style={{ backgroundColor: '#59c2c3', color: 'white' }}>
                    {
                        ml ? <td>序号</td> : null
                    }
                    {
                        ml ?
                            ml.header.map(a => a['enabled'] ? <td className="text-center" key={a.id}>{a.name}</td> : null) : null
                    }
                </tr>
            </thead>
            <tbody>
                {
                    ml ?
                        ml.body.map(
                            (a, i) => {
                                let other = [];
                                let xv = a.value;
                                for (let x in xv) {
                                    other.push(<td key={x}>{x === 'cars' ? xv[x].toFixed(0) : xv[x].toFixed(2)}</td>)
                                }
                                return (
                                    <tr  className="text-center"  key={i}>
                                        <td>{a.name}</td>
                                        {other}
                                    </tr>
                                );
                            }
                        ) : null
                }

            </tbody>
        </table>
    }
    render() {
        return (
            <div className="flex-row hx1 flex-v">
                <div ref={a => this.self = a} className="flex-row mon-page-left">
                    <Svg />
                </div>
                <div style={{ width: '30em' }} className="mon-page-right">
                    <div style={{ marginBottom: '2px' }} className="hx1 can-scroll panel panel-default">
                        <div className="panel-heading">
                            <SearchBox placeholder={this.state.roadName} onChange={item => { this.onSearch(item); }} url="/search"></SearchBox>
                        </div>
                        {this.renderTable()}
                    </div>
                </div>
                <DialogManager />
            </div>
        )
    }

}
export default connect(dialogManagerMapProps, (dispatch) => { return { ...mapHistoryDispatch(dispatch), ...treeDispatch(dispatch), ...dialogManagerDispatch(dispatch), ...svgDispatch(dispatch) } })(MonPage)