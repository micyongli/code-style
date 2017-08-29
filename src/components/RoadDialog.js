
import React from 'react';
import reactDom from 'react-dom';
import Modal from 'react-modal';
import './RoadDialog.css';

class RoadDialog extends React.Component {

    static defaultProps = {
        record: null,
        title: '无标题',
        onClose: () => {
        },
        onOk: (item) => {
            return true;
        },
        onCancle: () => {

        },
        requiredClose: false,
        dlgStyle: {
            overlay: {
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                textAlign: 'center'
            },
            content: {
                top: 'none',
                left: 'none',
                right: 'none',
                bottom: 'none',
                position: 'none',
                margin: 'auto',
                minWidth: '500px'
            }
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            formType: '5'
        };
    }

    componentWillMount() {
        if (this.props.record) {
            this.setState({ formType: this.props.record.type });
        }
    }

    getFormValue = () => {
        let els = Array.prototype.slice.apply(this.form.elements);
        let rs = {};
        for (let i = 0; i < els.length; i++) {
            let el = els[i];
            if (el.type === 'checkbox') {
                rs[el.name] = el.checked ? 1 : 0;
            } else {
                rs[el.name] = el.value;
            }
        }
        return rs;
    }

    renderName = () => {
        let isEditing = !!this.props.record;
        let dv = isEditing ? this.props.record.data.name : '';
        return (
            <div className="row dlg-padding">
                <div className="col-xs-4 text-right">
                    <label>名称</label>
                </div>
                <div className="col-xs-6 text-left">
                    <input spellCheck="false" autoComplete="off" name="name" defaultValue={dv} className="form-control" />
                </div>
            </div>
        );
    }

    renderCode = () => {
        let isEditing = !!this.props.record;
        let dv = isEditing ? this.props.record.data.code : '';
        return (
            <div className="row dlg-padding">
                <div className="col-xs-4 text-right">
                    <label>编号</label>
                </div>
                <div className="col-xs-6 text-left">
                    <input spellCheck="false" autoComplete="off" name="code" defaultValue={dv} className="form-control" />
                </div>
            </div>
        );
    }

    renderSwid = () => {
        let isEditing = !!this.props.record;
        let dv = isEditing ? this.props.record.data.swid.toString(16).toUpperCase() : '';
        return (
            <div className="row dlg-padding">
                <div className="col-xs-4 text-right">
                    <label>车检器ID<i style={{fontSize:'0.8em',color:'#e34c0d'}}>(16进制)</i></label>
                </div>
                <div className="col-xs-6 text-left">
                    <input spellCheck="false" autoComplete="off" name="swid" defaultValue={dv} className="form-control" placeholder="十六进制" />
                </div>
              
            </div>
        );
    }



    renderNetAddress = () => {
        let isEditing = !!this.props.record;
        let dv = isEditing ? this.props.record.data.ip : '';
        return (
            <div className="row dlg-padding">
                <div className="col-xs-4 text-right">
                    <label>网络地址</label>
                </div>
                <div className="col-xs-6 text-left">
                    <input spellCheck="false" autoComplete="off" name="ip" placeholder="10.1.1.1" defaultValue={dv} className="form-control" />
                </div>
            </div>
        );
    }

    renderChecking = () => {
        let isEditing = !!this.props.record;
        let dv = isEditing ? (['true', '1'].indexOf(this.props.record.data.checking.toString()) >= 0 ? true : false) : false;
        return (
            <div className="row dlg-padding">
                <div className="col-xs-4 text-right">
                    <label>监控</label>
                </div>
                <div className="col-xs-6 text-left">
                    <input  type="checkbox" defaultChecked={dv} name="checking" />
                </div>
            </div>
        );
    }

    render() {
        return (
            <Modal style={this.props.dlgStyle} contentLabel={"roadDialog" + new Date()}
                onRequestClose={
                    () => { if (!this.props.requiredClose) this.props.onClose(); }
                }
                onAfterOpen={() => { }}
                isOpen={true}>
                <div style={{ overflow: 'auto', margin: '0 auto' }}>
                    <div className="col-xs-12 text-left" >
                        <h4 style={{color:'#e34c0d'}}>{this.props.title}</h4>
                    </div>
                    <div className="col-xs-12">
                        <form ref={f => this.form = f} className="form-group">
                            <div className="row dlg-padding">
                                <div className="col-xs-4 text-right">
                                    <label>类型</label>
                                </div>
                                <div className="col-xs-6 text-left">
                                    <select
                                        name="type"
                                        defaultValue={this.props.record ? this.props.record.type : this.state.formType}
                                        disabled={this.props.record ? true : false}
                                        className="form-control"
                                        onChange={
                                            e => {
                                                let fm = this.getFormValue();
                                                this.setState({ formType: fm.type });
                                            }
                                        }>
                                        <option value="5">区域</option>
                                        <option value="1">路段</option>
                                        <option value="4">路口</option>
                                        <option value="3">车检组</option>
                                        <option value="2">车检器</option>
                                    </select>
                                </div>
                            </div>
                            {['1', '4', 1, 4].indexOf(this.state.formType) >= 0 ? this.renderCode() : null}
                            {this.renderName()}
                            {['2', 2].indexOf(this.state.formType) >= 0 ? this.renderSwid() : null}
                            {['2', 2].indexOf(this.state.formType) >= 0 ? this.renderNetAddress() : null}
                            {['2', 2].indexOf(this.state.formType) >= 0 ? this.renderChecking() : null}
                        </form>
                        <div className="row dlg-padding">
                            <div className="col-xs-12 ">
                                <button
                                    className="btn btn-default default-btn"
                                    onClick={
                                        e => {
                                            this.props.onOk(this.getFormValue(), this.props.onClose)
                                        }
                                    }
                                >保存</button>
                                <button
                                    style={{ marginLeft: '10px' }}
                                    className="btn btn-default"
                                    onClick={e => { this.props.onClose(); }}
                                >取消</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal >
        );
    }

}

export default RoadDialog;