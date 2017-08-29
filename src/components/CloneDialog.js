
import React from 'react';
import reactDom from 'react-dom';
import Modal from 'react-modal';
import './CloneDialog.css';
//import { dialogManagerMapProps, dialogManagerDispatch } from './DialogManagerStore';
//import { connect } from 'react-redux';

class CloneDialog extends React.Component {

    static defaultProps = {
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
        },
        onOk: () => {

        }
    }


    getFormValue = () => {
        let kv = {}
        let els = this.form.elements;
        for (let x = 0; x < els.length; x++) {
            kv[els[x]['name']] = els[x]['value'];
        }
        return kv;
    }

    constructor(props) {
        super(props);
    }

    doCleanInput = () => {
        this.targetip.value = "";
        this.targetsw.value = "";
    }

    render() {
        return (
            <Modal style={this.props.dlgStyle} contentLabel={"roadDialog" + new Date()}
                onRequestClose={
                    () => {
                        if (this.props.requiredClose) {
                            this.props.closeDialogAction(this.props.id)
                        }
                    }
                }
                onAfterOpen={
                    () => {

                    }
                }
                isOpen={true}>
                <div style={{ overflow: 'auto', margin: '0 auto' }}>
                    <div className="col-xs-12 text-left" >
                        <h4 style={{ color: '#e34c0d' }}>{this.props.title}</h4>
                    </div>

                    <div className="col-xs-12">
                        <form ref={ref => this.form = ref}>
                            <div className="row dlg-padding">
                                <div className="col-xs-3 text-right">
                                    <label>源IP</label>
                                </div>
                                <div className="col-xs-6 ">
                                    <input name="sourceip" disabled="true" defaultValue={this.props.item.data.ip} className="input-sm form-control" />
                                </div>
                            </div>
                            <div className="row dlg-padding">
                                <div className="col-xs-3 text-right">
                                    <label>源地磁ID</label>
                                </div>
                                <div className="col-xs-6 ">
                                    <input name="sourcesw" disabled="true" defaultValue={this.props.item.data.swid.toString(16).toUpperCase()} className="input-sm form-control" />
                                </div>
                            </div>
                            <div className="row dlg-padding">
                                <div className="col-xs-3 text-right">
                                    <label>目标IP</label>
                                </div>
                                <div className="col-xs-6 ">
                                    <input spellCheck="false" ref={ref => this.targetip = ref} autoComplete="off" defaultValue={this.props.targetip} name="targetip" className="input-sm form-control" />
                                </div>
                            </div>
                            <div className="row dlg-padding">
                                <div className="col-xs-3 text-right">
                                    <label>目标地磁ID</label>
                                </div>
                                <div className="col-xs-6 ">
                                    <input spellCheck="false" ref={ref => this.targetsw = ref} autoComplete="off" defaultValue={this.props.targetsw} name="targetsw" className="input-sm form-control" />
                                </div>
                            </div>

                        </form>
                        <div className="row dlg-padding">
                            <div className="col-xs-12 ">
                                <button
                                    className="btn btn-default default-btn"
                                    onClick={
                                        e => {
                                            if (this.props.onExec)
                                                this.props.onExec(this.getFormValue(), () => this.props.hide())
                                        }
                                    }
                                >绑定</button>
                                {
                                    this.props.targetip ?
                                        <button
                                            style={{ marginLeft: '10px' }}
                                            className="btn btn-default default-btn"
                                            onClick={
                                                e => {
                                                    if (this.props.onCleanBind) {
                                                        this.props.onCleanBind(this.getFormValue(), () => { this.doCleanInput(); })
                                                    }

                                                }
                                            }
                                        >清除</button> : null
                                }
                                <button
                                    style={{ marginLeft: '10px' }}
                                    className="btn btn-default"
                                    onClick={e => { this.props.hide() }}
                                >取消</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal >
        );
    }

}

export default CloneDialog;//connect(dialogManagerMapProps, dialogManagerDispatch)(CloneDialog);