import 'bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

import React, { Component } from 'react';
import reactDom from 'react-dom';
import './ChartPage.css';
import Tree from './Tree';
import SearchBox from './SearchBox';
import { connect } from 'react-redux';
import { mapProps, mapDispatch } from './TreeStore';

import { mapHistoryDispatch } from '../history';

import { dialogManagerDispatch } from './DialogManagerStore';
import DialogManager from './DialogManager';
import Dialog from './Dialog';

class ChartPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            w: 100,
            h: 100,
            startDate: moment(),
            endDate: moment(),
            span: '1h',
            displayType: 'graph',
            tableData: null
        }
    }
    componentDidMount() {
        $(window).bind('resize', this.resize)
        this.switchDisplayType(this.state.displayType)
        this.resize();
        $(this.st)
            .daterangepicker(
            {
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
                this.getChartData(st, et, this.state.span, this.props.treeReducer.selectedSw)
                this.setState({ startDate: st, endDate: et })
            }
            );

    }

    componentWillUnmount() {
        this.unmount=true;
        $(window).unbind('resize', this.resize)
        if (this.echarts) {
            this.echarts.dispose();
            delete this.echarts;
        }
    }

    componentWillReceiveProps(nx) {
        if (nx.treeReducer.selectedSw != this.props.treeReducer.selectedSw) {
            this.getChartData(this.state.startDate, this.state.endDate, this.state.span, nx.treeReducer.selectedSw)
        }
    }

    loadHistory = () => {
        let his = this.getHistory();
        if (his) {
            this.props.searchExpandTreeAction(his);
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
                        this.props.searchExpandTreeAction(first.id);
                    }
                })
                .catch(e => {
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
        this.props.setHistoryAction('chartpage_roadid', d)
    }

    getHistory = () => {
        return this.props.historyReducer.history['chartpage_roadid']
    }

    resize = () => {
        let h = $(this.canvasContainer).innerHeight();
        let w = $(this.canvasContainer).innerWidth();
        if (this.echarts) {
            this.echarts.resize({ width: w, height: h });
        }
        this.setState({ w: w, h: h });
    }

    getChartLables = () => {
        return ['流量(辆)', '速度(km/h)', '占用率(S)', '车头时距(S)'];
    }

    setChartData = data => {
        var labels = this.getChartLables();
        let sel = {};
        sel[labels[0]] = true;
        sel[labels[1]] = true;
        sel[labels[2]] = false;
        sel[labels[3]] = false;
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params, ticket) => {
                    let xv = params[0].axisValue;
                    let rs = `${xv}`;
                    for (let x in params) {
                        let cur = params[x];
                        let nv = cur.seriesName;
                        let vv = cur.value;
                        if (nv !== '流量(辆)') {
                            vv = vv.toFixed(2);
                        }
                        let lv = cur.color;
                        rs += `<br /><span style="width:12px;height:12px;background-color:${lv};display:inline-block"></span> ${nv}: ${vv}`
                    }
                    return rs;
                }
            },
            grid: [
                {
                    left: '8%',
                    right: '8%',
                    bottom: '80px'
                }
            ],
            legend: {
                data: labels,
                textStyle: {
                    color: '#979797'
                },
                selected: sel,
                show: false
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100
            }, {
                start: 0,
                end: 100,
                handleIcon: 'M 384 416.032 c 0 -70.592 57.408 -128 128 -128 s 128 57.408 128 128 s -57.408 128 -128 128 s -128 -57.408 -128 -128 m 128.32 -288 h -0.64 c -158.624 0.16 -287.68 129.312 -287.68 288 c 0 80.512 64.032 195.008 126.72 288 a 2026.4 2026.4 0 0 0 116.512 155.584 a 57.92 57.92 0 0 0 44.8 21.856 h 0.096 a 57.504 57.504 0 0 0 44.512 -21.696 a 2024.26 2024.26 0 0 0 116.64 -155.744 c 62.688 -92.992 126.72 -207.488 126.72 -288 c 0 -158.688 -129.056 -287.84 -287.68 -288',
                handleSize: '80%',
                handleStyle: {
                    color: '#59c2c3',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                fillerColor: 'rgba(89,194,195,0.5)'
            }],
            xAxis: {
                data: data[0],
                axisLine: {
                    lineStyle: {
                        color: '#7F7F7F'
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dotted',
                        color: '#eee'
                    },
                    show: true
                },
                axisLabel: {
                    //rotate: 45,
                    showMinLabel: true,
                    interval: 'auto'
                }
            },
            yAxis: [
                {
                    nameGap: -20,
                    nameLocation: 'middle',
                    name: labels[0],
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dotted',
                            color: '#eee'
                        },
                        show: true
                    },
                    nameTextStyle: {
                        //fontSize: 16
                    }
                },
                {
                    nameTextStyle: {
                        //fontSize: 16
                    },
                    nameLocation: 'middle',
                    nameGap: -20,
                    name: labels[1] + '/' + labels[2] + '/' + labels[3],
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#7F7F7F'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dotted',
                            color: '#eee'
                        },
                        show: true
                    },
                    nameRotate:90
                }
            ],
            series: [
                {
                    name: labels[0],
                    type: 'bar',
                    barWidth: 16,
                    itemStyle: {
                        normal: {
                            color: '#b2dc9e'
                        }
                    },
                    data: data[1]
                },
                {
                    name: labels[1],
                    yAxisIndex: 1,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#edab74'
                        }
                    },
                    symbol: 'circle',
                    showSymbol: true,
                    smooth: true,
                    data: data[2]
                },
                {
                    yAxisIndex: 1,
                    name: labels[2],
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#939cc6'
                        }
                    },
                    symbol: 'circle',
                    showSymbol: true,
                    smooth: true,
                    data: data[3]
                },
                {
                    name: labels[3],
                    yAxisIndex: 1,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    showSymbol: true,
                    itemStyle: {
                        normal: {
                            color: '#eba8d6'
                        }
                    },
                    data: data[4]
                }

            ]
        };

    }

    chartDraw = (r) => {
        if(this.unmount)
            return;
        if (!this.echarts ) {
            this.echarts = echarts.init(this.canvasContainer);
            this.selState = [true, true, false, false];            
        }
        let data = r._data;
        if (data) {
            let labels = data.time.map(a => {
                return this.state.span === '1d' ? a.split(' ')[0] : a.split(' ').reverse().join(' ').replace(' ', '\n')
            });
            if (!data.cars)
                data.cars = [];
            if (!data.speed) {
                data.speed = [];
            }
            if (!data.cardis) {
                data.cardis = [];
            }
            if (!data.usages) {
                data.usages = [];
            }
            this.echarts.setOption(this.setChartData([labels, data.cars, data.speed, data.usages, data.cardis]));
        }
    }

    getRoadSw = (value) => {
        let x = []
        let sws = value
        for (let i = 0; i < sws.length; i++) {
            x.push(sws[i].id)
        }
        return x
    }

    getChartData = (begin, end, span, value) => {
        let sws = this.getRoadSw(value)
        if (sws.length === 0)
            return
        let st = moment(begin.format('YYYY-MM-DD')).format();
        let et = moment(end.format('YYYY-MM-DD')).format();

        fetch('/road/querychartdata',
            {
                headers: { 'content-type': 'application/json' },
                method: 'post',
                body: JSON.stringify({ span, btime: st, etime: et, path: sws }),
                credentials: 'include'
            })
            .then(r => {
                if (r.status >= 200 && r.status < 300) {
                    return r.json()
                }
                throw new Error(r.statusText)
            })
            .then(r => {
                if (this.state.displayType === 'graph')
                    this.chartDraw(r)
                else {
                    this.setState({ tableData: r });
                }
            })
            .catch(e => {
                this.props.showDialogAction(Dialog,
                    {
                        content: e.message,
                        onCancle: id => {
                            this.props.closeDialogAction(id);
                        },
                        isShowButton: false
                    }
                );
            })
    };

    doSelectSpan = (s) => {
        this.getChartData(this.state.startDate, this.state.endDate, s, this.props.treeReducer.selectedSw)
        this.setState({ span: s })
    };

    doSettingDisplay = (t) => {
        this.setState({ displayType: t })
    };

    switchDisplayType = (t) => {
        if (t === 'grid' && this.echarts) {
            this.echarts.dispose();
            delete this.echarts;
        }
        this.getChartData(this.state.startDate, this.state.endDate, this.state.span, this.props.treeReducer.selectedSw);
        this.setState({ displayType: t });
    };

    drawTable = (d) => {
        if (d && d._data) {
            return (
                <div className="tbl-container">
                    <table className="table table-bordered">
                        <thead>
                            <tr style={{ textAlign: 'center', color: 'white', backgroundColor: '#59c2c3' }}>
                                <td>日期</td>
                                <td>流量(辆)</td>
                                <td>速度(千米/小时)</td>
                                <td>占有率(秒)</td>
                                <td>车间隔(秒)</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                d._data.time.map((v, i) =>
                                    <tr style={{ textAlign: 'center' }} key={i}>
                                        <td>{v}</td>
                                        <td>{d._data.cars[i].toFixed(0)}</td>
                                        <td>{d._data.speed[i].toFixed(2)}</td>
                                        <td>{d._data.usages[i].toFixed(2)}</td>
                                        <td>{d._data.cardis[i].toFixed(2)}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            );
        }
        return null;
    };

    setGraphState = (s, n) => {
        let lbl = this.getChartLables();
        this.selState[n] = s;
        this.echarts.dispatchAction({
            'type': s ? 'legendSelect' : 'legendUnSelect',
            'name': lbl[n]
        });
    }

    switchGrap = n => {
        this.setGraphState(!this.selState[n], n)
        if (n > 0) {
            for (let i = 1,mx=this.selState.length; i < mx; i++) {
                if (i !== n) {
                    this.setGraphState(false, i);
                }
            }
        }
    };

    opbtn = () => {
        let w = '8em';
        return (
            <div className="chartpage-opt">
                <button
                    onClick={
                        () => {
                            this.switchGrap(0);
                        }
                    }
                    style={{ width: w }} className="btn btn-default btn-sm btn-cars">流量(辆)</button>
                <button
                    onClick={
                        () => {
                            this.switchGrap(1);
                        }
                    }
                    style={{ width: w }} className="btn btn-default btn-sm btn-margin btn-speed">车速(km/h)</button>
                <button
                    onClick={
                        () => {
                            this.switchGrap(2);
                        }
                    }
                    style={{ width: w }} className="btn btn-default btn-sm btn-usages">占有率(s)</button>
                <button
                    onClick={
                        () => {
                            this.switchGrap(3);
                        }
                    }
                    style={{ width: w }} className="btn btn-default btn-sm btn-margin btn-cardis">车头时距(s)</button>

            </div>
        )
    }
    render() {
        return (
            <div className="flex-row hx1 flex-v">
                <div className="road-page-left">
                    <div className="search-container">
                        <SearchBox onChange={item => { this.props.searchExpandTreeAction(item.key); this.setHistory(item.key); }} url="/search"></SearchBox>
                    </div>
                    <div className="chartpage-tree">
                        <Tree onSelectedNode={obj => this.setHistory(obj.id)} onLoaded={() => { this.loadHistory(); }} />
                    </div>

                </div>
                <div className="chartpage-right">
                    <div style={{ padding: '10px 2px' }} className="chartpage-row bottom-border">
                        <form>
                            <label style={{ color: '#7c7c7c' }} className="label">日期范围</label>
                            <input
                                ref={ref => this.st = ref}
                                style={{ display: 'inline-block', width: '14em' }}
                                className="form-control input-sm" />
                            <select defaultValue="1h" onChange={e => this.doSelectSpan(e.target.value)} style={{ marginLeft: '1em', display: 'inline-block', width: '8em' }} className="form-control input-sm">
                                <option value="10m">10分钟</option>
                                <option value="30m">30分钟</option>
                                <option value="1h">1小时</option>
                                <option value="1d">1日</option>
                            </select>
                            <select defaultValue="graph" onChange={e => this.switchDisplayType(e.target.value)} style={{ marginLeft: '1em', display: 'inline-block', width: '8em' }} className="form-control input-sm">
                                <option value="graph">图表</option>
                                <option value="grid">表格</option>
                            </select>
                            <button
                                style={{ marginLeft: '1em' }}
                                onClick={
                                    e => {
                                        e.preventDefault();
                                        this.getChartData(this.state.startDate, this.state.endDate, this.state.span, this.props.treeReducer.selectedSw)
                                    }
                                }
                                className="btn btn-sm btn-default default-btn">查询</button>
                            <button style={{ marginLeft: 5 }} className="btn btn-sm btn-default">导出</button>
                        </form>
                    </div>
                    <div className="chartpage-cvs chartpage-row">
                        {this.state.displayType === 'graph' ? this.opbtn() : null}
                        <div className="chartpage-cvs-container" ref={ref => this.canvasContainer = ref} >
                            {this.state.displayType === 'graph' ? null : this.drawTable(this.state.tableData)}
                        </div>
                    </div>
                    <DialogManager />
                </div>
            </div>
        );
    }
}

export default connect(mapProps, dis => { return { ...dialogManagerDispatch(dis), ...mapHistoryDispatch(dis), ...mapDispatch(dis) } })(ChartPage)