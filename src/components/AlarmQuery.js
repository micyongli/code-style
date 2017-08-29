import 'bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import React from 'react';
import './AlarmQuery.css';

import { dialogManagerMapProps, dialogManagerDispatch } from './DialogManagerStore';
import DialogManager from './DialogManager';
import Dialog from './Dialog';

import { connect } from 'react-redux';

class AlarmQuery extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            startDate: moment().subtract(7, 'days'),
            endDate: moment(),
            data: null
        }
    }

    componentDidMount() {

        $(this.timeSelector)
            .daterangepicker(
            {
                startDate: moment().subtract(7, 'days'),
                endDate: moment(),
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    format: 'YYYY-MM-DD',
                    separator: ' 至 ',
                    fromLabel: '从',
                    toLabel: '至',
                    customRangeLabel: 'Custom',
                    daysOfWeek: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                    firstDay: 1
                }
            },
            (st, et) => {
                this.setState({ startDate: st, endDate: et }, () => {
                    this.doQuery();
                })
            });

        this.doQuery();

    }


    queryResult = (d) => {
        if (!d || (d && d.length === 0))
            return null;
        return (
            <table className="table border-table">
                <tbody>
                    {
                        d.map((a, i) =>
                            <tr key={i}>
                                <td>{a.failtDate}</td>
                                <td>{a.areaName}</td>
                                <td>{a.roadName}</td>
                                <td>{a.swname}</td>
                                <td style={a.status === -1 ? { color: '#e34c0d' } : {}}>{a.status === -1 ? '故障' : '恢复'}</td>
                                <td>{a.restoreDate}</td>
                            </tr>
                        )
                    }

                </tbody>
            </table>
        )
    };

    doQuery = () => {
        let st = this.state.startDate.format('YYYY-MM-DD')
        let et = this.state.endDate.format('YYYY-MM-DD')
        let recordType = this.recordType.value;
        fetch(
            '/road/queryfailt',
            {
                headers: { 'content-type': 'application/json' },
                method: 'post',
                body: JSON.stringify({ st, et, recordType }),
                credentials: 'include'
            })
            .then(r => {
                if (r.status >= 200 && r.status < 300) {
                    return r.json()
                }
                throw new Error(r.statusText);
            })
            .then(d => {
                if (d.code != 0)
                    throw new Error(d.msg)
                this.setState({ data: d.data })
            })
            .catch(e => {
                this.props.showDialogAction(Dialog,
                    {
                        content: e.message,
                        onCancle: (id) => {
                            this.props.closeDialogAction(id)
                        },
                        isShowButton: false
                    }
                );
            })

    };

    render() {
        return (
            <div className="alarmquery-container">
                <div className="alarmquery-top">
                    <label style={{ color: '#7c7c7c' }} className="label">日期范围</label>
                    <input
                        ref={ref => this.timeSelector = ref}
                        style={{ display: 'inline-block', width: '14em' }}
                        className="form-control input-sm" />
                    <label style={{ marginLeft: '0.5em', color: '#7c7c7c' }} className="label">报警类型</label>
                    <select onChange={() => this.doQuery()} ref={ref => this.recordType = ref} defaultValue="failt" style={{ marginLeft: '0.2em', display: 'inline-block', width: '10em' }} className="input-sm form-control">
                        <option value="all" >全部</option>
                        <option value="failt">故障</option>
                        <option value="restore">恢复</option>
                    </select>
                    <button onClick={e => this.doQuery()} style={{ marginLeft: '1em' }} className="btn btn-sm btn-default default-btn">查询</button>
                    <button style={{ marginLeft: '1em' }} className="btn btn-sm btn-default">导出</button>
                </div>
                <div className="alarmquery-bottom">
                    <div className="icon-list">
                        <div className="icon-time"></div>
                        <div className="icon-area"></div>
                        <div className="icon-road"></div>
                        <div className="icon-sw"></div>
                        <div className="icon-repare"></div>
                        <div className="icon-time"></div>
                    </div>
                    <div
                        ref={ref => this.scrollContainer = ref}
                        onWheel={e => {
                            e.stopPropagation()
                            e.preventDefault()
                            let source = this.scrollContainer;
                            let y = e.deltaY;
                            let bx = source.getBoundingClientRect();
                            let mx = Math.round(source.scrollHeight - bx.height);
                            let cur = source.scrollTop;
                            if (cur >= 0 && cur <= mx) {
                                let xx = y > 0 ? 50 : -50;
                                source.scrollTop += xx;
                            }
                        }}
                        className="content-list">

                        {this.queryResult(this.state.data)}
                    </div>
                </div>
                <DialogManager />
            </div>
        );
    }
}
export default connect(dialogManagerMapProps, dialogManagerDispatch)(AlarmQuery);