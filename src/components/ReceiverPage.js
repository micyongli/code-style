import React, { Component } from 'react';
import reactDom from 'react-dom';
import './ReceiverPage.css';

import DialogManager from './DialogManager';
import Dialog from './Dialog';
import { dialogManagerMapProps, dialogManagerDispatch } from './DialogManagerStore';

import { connect } from 'react-redux';

class ReceiverPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            scanList: [],
            curDevice: null
        }
    }

    componentDidMount() {

    }
    componentWillUnmount() {
        if (this.scripts) {
            this.scripts.forEach(a => {
                a.parentNode.removeChild(a);
            })
            delete this.scripts
        }
    }

    getJsonP = (url) => {
        if (typeof this.scripts === 'undefined') {
            this.scripts = []
        }
        let sc = document.createElement('script')
        sc.onload = (a) => {
            if (!this.scripts)
                return
            this.scripts.splice(this.scripts.indexOf(sc), 1);
            sc.parentNode.removeChild(sc)
        };
        sc.onerror = () => { }
        sc.src = url;
        this.scripts.push(sc);
        document.head.appendChild(sc);
    }

    isNetAddress = (ip) => {
        return /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(ip);
    }

    isNum = (n) => {
        return /^[0-9]{1,5}$/.test(n);
    }

    makeHostList = () => {
        let rs = [];
        let ip = this.ip.value
        if (this.isNetAddress(ip) && this.isNum(this.ipend.value) && this.isNum(this.port.value)) {
            let ipAddress = ip.split('.').map(a => parseInt(a));
            let ipAddressEnd = parseInt(this.ipend.value);
            var port = parseInt(this.port.value);
            if (ipAddressEnd >= 1 && ipAddressEnd < 255 && ipAddress[3] <= ipAddressEnd) {
                while (ipAddress[3] <= ipAddressEnd) {
                    rs.push({ host: ipAddress.join('.'), port })
                    ipAddress[3]++;
                }
            }
        }
        return rs;
    }

    getDeviceId = data => {
        return data.map(a => {
            let s = a.toString(16).toUpperCase()
            return s.length === 1 ? ('0' + s) : s
        }).join('')
    }

    doScan = () => {
        this.setState({ curDevice: null })
        this.clearForm();
        let newItems = [];
        this.makeHostList().forEach(a => {
            let jsp = this.getJspName();
            let item =
                <div key={jsp} className="device alert btn-default">
                    <svg viewBox="0 0 1024 1024" style={{ margin: 0, padding: 0,  width: 30, height: 30 }}>
                        <path fill="#E34C0D" d="M 544 576 a 32 32 0 0 1 -64 0 v -256 a 32 32 0 0 1 64 0 v 256 Z m -32 160 a 32 32 0 1 1 0 -64 a 32 32 0 0 1 0 64 Z m 0 -608 C 300.256 128 128 300.256 128 512 s 172.256 384 384 384 s 384 -172.256 384 -384 S 723.744 128 512 128 Z">
                        </path>
                    </svg>
                    <div style={{ overflow: 'hidden', margin: 0, padding: 0, display: 'inline-block', height: '30px', lineHeight: '30px' }}>{a.host}</div>
                </div>;
            this.execJsonP(jsp, '/receiver/scan', a, (rsp) => {
                let data = rsp.data[0]
                if (data.recv) {
                    //判断个条件
                    let old = this.state.scanList.slice();
                    let itemIndex = old.indexOf(item);
                    let ser = this.getDeviceId(data.recv.responed.data);
                    old.splice(itemIndex, 1,
                        <div
                            onClick={
                                () => {
                                    let formData = this.getFormData(this.form);
                                    let { channel } = formData;
                                    let { host, port } = data;
                                    let deviceId = this.getDeviceId(data.recv.responed.data);
                                    let bid = data.recv.address;
                                    this.uploadDataFromDevice(host, port, bid, deviceId, channel)
                                    this.setState({ curDevice: data });
                                }
                            }
                            key={jsp}
                            className="device alert btn-default">
                            <div style={{ overflow: 'hidden', margin: 0, padding: 0, display: 'inline-block', height: '30px', lineHeight: '30px' }}>
                                {a.host} {data.recv.address} {ser}
                            </div>
                        </div>);
                    this.setState({ scanList: old });
                }
            });
            newItems.push(item)
        })
        this.setState({ scanList: newItems })
    }


    getFormData = form => {
        let els = Array.from(form.elements);
        let obj = {}
        for (let i = 0; i < els.length; i++) {
            let type = els[i]['type']
            let tagName = els[i]['name']
            if (tagName) {
                switch (type) {
                    case 'checkbox':
                        obj[tagName] = els[i]['checked'];
                        break;
                    default:
                        obj[tagName] = els[i]['value']
                }
            }
        }
        return obj;
    }

    execJsonP = (jspName, url, data, callback) => {
        window[jspName] = (r) => {
            callback(r)
            delete window[jspName]
        }
        let param = ''
        for (let x in data) {
            param += `&${x}=${data[x]}`;
        }
        this.getJsonP(`${url}?callback=${jspName}${param}`);
    }

    getJspName = () => {
        if (typeof this.jspindex === 'undefined') {
            this.jspindex = 0;
        }
        let jsp = `__jsp_${this.jspindex}__`;
        this.jspindex++;
        return jsp;
    }

    upload = (e) => {
        e.preventDefault()
        if (this.state.curDevice) {
            let data = this.state.curDevice
            let formData = this.getFormData(this.form);
            let { channel } = formData;
            let { host, port } = data;
            let deviceId = this.getDeviceId(data.recv.responed.data);
            let bid = data.recv.address;
            this.uploadDataFromDevice(host, port, bid, deviceId, channel)
        }
    }

    /**上载设备数据 */
    uploadDataFromDevice = (host, port, bid, serial, channel) => {
        this.execJsonP(
            this.getJspName(),
            '/receiver/netupload',
            { host, port, bid, serial, channel },
            r => {
                if (r.code === 0) {
                    let rs = this.analyzeProtocol(r.respone[0]);
                    this.setFormValue(this.form, rs);
                } else {
                    this.props.showDialogAction(Dialog,
                        {
                            content: r.msg,
                            onCancle: id => {
                                this.props.closeDialogAction(id);
                            },
                            isShowButton: false
                        }
                    );
                }
            }
        );
    }

    downloadDataToDevice = (host, port, bid, serial, channel, formdata, cb) => {

        this.execJsonP(
            this.getJspName(),
            '/receiver/netdownload',
            { host, port, bid, serial, channel, ...formdata },
            r => {
                if (r.code === 0) {
                    if (typeof r.respone[0].recv === 'undefined') {
                        this.props.showDialogAction(Dialog,
                            {
                                content: '下载数据中,通信超时!',
                                onCancle: id => {
                                    this.props.closeDialogAction(id);
                                },
                                isShowButton: false
                            }
                        );
                    }
                } else {
                    this.props.showDialogAction(Dialog,
                        {
                            content: r.msg,
                            onCancle: id => {
                                this.props.closeDialogAction(id);
                            },
                            isShowButton: false
                        }
                    );
                }
            }
        );
    }

    clearForm = () => {
        let rs = {
            uploadSpan: '',
            used: false,
            reply: false,
            waitTime: '',
            commuModel: '',
            connectModel: '',
            ip: '',
            configport: ''
        };
        this.setFormValue(this.form, rs);
    }

    analyzeProtocol = data => {
        this.clearForm();
        let rs = {
            uploadSpan: '',
            used: false,
            reply: false,
            commuModel: '',
            waitTime: '',
            connectModel: '',
            ip: '',
            configport: ''
        };

        let { recv } = data;
        if (recv) {
            let { data } = recv.responed;
            if (data.length === 20) {
                rs.uploadSpan = (data[0] << 8) + data[1];
                rs.used = data[3] === 0 ? false : true;
                rs.reply = data[5] === 0 ? false : true;
                rs.commuModel = (data[6] << 8) + data[7];
                rs.waitTime = (data[8] << 8) + data[9];
                rs.connectModel = (data[10] << 8) + data[11];
                rs.configport = (data[16] << 8) + data[17];
                rs.ip = data.splice(12, 4).join('.');
                return rs;
            } else {
                this.props.showDialogAction(Dialog,
                    {
                        content: '返回数据长度异常!',
                        onCancle: id => {
                            this.props.closeDialogAction(id);
                        },
                        isShowButton: false
                    }
                );
            }
        }
    }

    setFormValue = (fm, data) => {
        for (let x in fm.elements) {
            let ns = fm.elements[x]['name'];
            if (typeof data[ns] !== 'undefined') {
                if (fm.elements[x]['type'] !== 'checkbox') {
                    fm.elements[x]['value'] = data[ns];
                } else {
                    fm.elements[x]['checked'] = data[ns];
                }
            }
        }

    }

    download = (e) => {
        e.preventDefault();
        if (!this.state.curDevice) {
            return;
        }
        this.props.showDialogAction(Dialog,
            {
                content: '下载数据,确定?',
                onOk: (id) => {
                    let data = this.state.curDevice
                    let formData = this.getFormData(this.form);
                    let { channel } = formData;
                    let { host, port } = data;
                    let deviceId = this.getDeviceId(data.recv.responed.data);
                    let bid = data.recv.address;
                    this.downloadDataToDevice(host, port, bid, deviceId, channel, this.getFormData(this.form));
                    this.props.closeDialogAction(id);
                },
                onCancle: id => {
                    this.props.closeDialogAction(id);
                }
            }
        );
    }

    onSelectChannel = e => {
        if (this.state.curDevice) {
            let data = this.state.curDevice
            let formData = this.getFormData(this.form);
            let { channel } = formData;
            let { host, port } = data;
            let deviceId = this.getDeviceId(data.recv.responed.data);
            let bid = data.recv.address;
            this.uploadDataFromDevice(host, port, bid, deviceId, channel)
        }
    }


    readReg = e => {
        e.preventDefault();
        if (this.state.curDevice) {
            let regForm = this.getFormData(this.regform);
            regForm.regAddress = parseInt(regForm.regAddress, 16)
            if (isNaN(regForm.regAddress) || regForm.regAddress < 0 || regForm >= 0xffff) {
                this.props.showDialogAction(Dialog,
                    {
                        content: '地址不正确!',
                        onCancle: id => {
                            this.props.closeDialogAction(id);
                        },
                        isShowButton: false
                    }
                );
                return;
            }
            let data = this.state.curDevice;
            let formData = this.getFormData(this.form);
            let { channel } = formData;
            let { host, port } = data;
            let deviceId = this.getDeviceId(data.recv.responed.data);
            let bid = data.recv.address;
            this.execJsonP(
                this.getJspName(),
                '/receiver/readreg',
                { host, port, bid, deviceId, channel, ...regForm },
                r => {
                    if (r.code === 0) {
                        let recv = r.respone[0];
                        if (typeof r.respone[0].recv === 'undefined') {
                            this.props.showDialogAction(Dialog,
                                {
                                    content: '读数据,通信超时!',
                                    onCancle: id => {
                                        this.props.closeDialogAction(id);
                                    },
                                    isShowButton: false
                                }
                            );
                        } else {
                            let rd = r.respone[0].recv.responed.data.map(a => {
                                let dg = a.toString(16).toUpperCase();
                                return dg.length === 1 ? `0${dg}` : dg;
                            }).join('');
                            this.setFormValue(this.regform, { regValue: rd })
                        }
                    } else {
                        this.props.showDialogAction(Dialog,
                            {
                                content: r.msg,
                                onCancle: id => {
                                    this.props.closeDialogAction(id);
                                },
                                isShowButton: false
                            }
                        );
                    }
                }
            );
        }
    }
    writeReg = e => {
        e.preventDefault();
        if (this.state.curDevice) {
            let regForm = this.getFormData(this.regform);
            regForm.regAddress = parseInt(regForm.regAddress, 16);
            let regValue = parseInt(regForm.regValue, 16);
            if (isNaN(regForm.regAddress) || isNaN(regValue) || regValue < 0 || regValue > 0xffff || regForm.regAddress < 0 || regForm >= 0xffff) {
                this.props.showDialogAction(Dialog,
                    {
                        content: '参数不正确!',
                        onCancle: id => {
                            this.props.closeDialogAction(id);
                        },
                        isShowButton: false
                    }
                );
                return;
            }
            let len = 4 - regForm.regValue.length;
            let surfix = '';
            while (len > 0) {
                surfix += '0';
                len--;
            }
            regForm.regValue = surfix + regForm.regValue;


            let data = this.state.curDevice;
            let formData = this.getFormData(this.form);
            let { channel } = formData;
            let { host, port } = data;
            let deviceId = this.getDeviceId(data.recv.responed.data);
            let bid = data.recv.address;
            this.execJsonP(
                this.getJspName(),
                '/receiver/writereg',
                { host, port, bid, deviceId, channel, ...regForm },
                r => {
                    if (r.code === 0) {
                        let recv = r.respone[0];
                        if (typeof r.respone[0].recv === 'undefined') {
                            this.props.showDialogAction(Dialog,
                                {
                                    content: '读数据,通信超时!',
                                    onCancle: id => {
                                        this.props.closeDialogAction(id);
                                    },
                                    isShowButton: false
                                }
                            );
                        }
                        this.props.showDialogAction(Dialog,
                            {
                                content: '写入成功!',
                                onCancle: id => {
                                    this.props.closeDialogAction(id);
                                },
                                isShowButton: false
                            }
                        );
                    } else {
                        this.props.showDialogAction(Dialog,
                            {
                                content: r.msg,
                                onCancle: id => {
                                    this.props.closeDialogAction(id);
                                },
                                isShowButton: false
                            }
                        );
                    }
                }
            );
        }
    }
    render() {
        return (
            <div className="receive-container" >
                <div className="receive-tool">
                    <label>网络地址</label>
                    <input className="form-control input-sm" style={{ width: '10em' }} spellCheck="false" ref={ref => this.ip = ref} defaultValue="192.168.0.200" />
                    <label>/</label>
                    <input className="form-control input-sm" style={{ width: '5em' }} spellCheck="false" ref={ref => this.ipend = ref} defaultValue="200" />
                    <label>端口</label>
                    <input className="form-control input-sm" style={{ width: '5em' }} spellCheck="false" ref={ref => this.port = ref} defaultValue="51201" />
                    <button style={{ marginLeft: 10 }} onClick={this.doScan} className="btn  btn-default btn-sm default-btn">扫  描</button>
                </div>
                <div className="receive-sub">
                    <div className="receive-left">
                        <div className="receive-list">
                            {this.state.scanList}
                        </div>
                    </div>
                    <div className="receive-right">
                        <ul className="nav nav-tabs">
                            <li className="active"><a data-toggle="tab" href="#config">接口配置{this.state.curDevice ? `(${this.state.curDevice['host']})` : null}</a></li>
                            <li><a data-toggle="tab" href="#rwreg">寄存器读写{this.state.curDevice ? `(${this.state.curDevice['host']})` : null}</a></li>
                        </ul>
                        <div className="tab-content">
                            <div id="config" className="tab-pane fade in active">
                                <form ref={ref => this.form = ref}>
                                    <div className="param-container">
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>接口</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <select onChange={this.onSelectChannel} name="channel" className="form-control  input-sm">
                                                    <option value="1" >Socket-1</option>
                                                    <option value="2" >Socket-2</option>
                                                    <option value="3" >Socket-3</option>
                                                    <option value="4" >Socket-4</option>
                                                </select>
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>状态上报间隔(分钟)</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="uploadSpan" className="form-control  input-sm" />
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>启用上传</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="used" type="checkbox" />
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>回复等待</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="reply" type="checkbox" />
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>上传报文格式</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="commuModel" className="form-control input-sm" />
                                            </div>
                                            <div className="col-xs-7">
                                                0=通讯模式1; 1=通讯模式2; 2=上海骏马;
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>等待回复时间(秒)</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="waitTime" className="form-control  input-sm" />
                                            </div>
                                            <div className="col-xs-5">
                                                范围:1-7
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>Socket连接模式</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="connectModel" className="form-control  input-sm" />
                                            </div>
                                            <div className="col-xs-7">
                                                0=端口未启用; 1=UDP通讯 ; 2=TCP客户端 ; 3=TCP服务端 ;
                                        </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>报传IP</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="ip" className="form-control  input-sm" />
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>报传端口</span>
                                            </div>
                                            <div className="col-xs-3">
                                                <input name="configport" className="form-control  input-sm" />
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">

                                            </div>
                                            <div className="col-xs-10">
                                                <button onClick={this.upload} className="btn btn-default btn-sm">上载</button>
                                                <button onClick={this.download} style={{ marginLeft: '1em' }} className="btn btn-default btn-sm default-btn">下载</button>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div id="rwreg" className="tab-pane fade">
                                <form ref={ref => this.regform = ref}>
                                    <div className="param-container">
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>地址</span>
                                            </div>
                                            <div className="col-xs-2">
                                                <input autoComplete="off" name="regAddress" className="form-control input-sm" />
                                            </div>
                                            <div className="col-xs-7">
                                                <span style={{ color: '#848484' }}>十六进制</span>
                                            </div>
                                        </div>
                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                                <span>值</span>
                                            </div>
                                            <div className="col-xs-2">
                                                <input  name="regValue" className="form-control  input-sm" />
                                                <input name="regCount" hidden="true" defaultValue="1" />
                                            </div>
                                            <div className="col-xs-5">
                                                <span style={{ color: '#848484' }}>十六进制</span>
                                            </div>
                                        </div>

                                        <div className="row rowspan">
                                            <div className="col-xs-2 text-right">
                                            </div>
                                            <div className="col-xs-2">
                                                <button onClick={this.readReg} className="btn btn-default btn-sm">读</button>
                                                <button onClick={this.writeReg} style={{ marginLeft: '1em' }} className="btn btn-default btn-sm default-btn">写</button>
                                            </div>
                                            <div className="col-xs-2">
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>

                <DialogManager />
            </div >
        )
    }
}

export default connect(dialogManagerMapProps, dialogManagerDispatch)(ReceiverPage);