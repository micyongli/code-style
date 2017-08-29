
import React from 'react';
import reactDom from 'react-dom';
import Modal from 'react-modal';
import './Dialog.css';

class Dialog extends React.Component {
    static defaultProps = {
        content: '',
        isShowButton: true,
        showHeader:true,
        show: true,
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
                minWidth: '500px',
            }
        },
        onOk: () => {

        },
        onCancle: () => {

        }
    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal style={this.props.dlgStyle} contentLabel={"DialogConfirm" + new Date()}
                onRequestClose={() => { this.props.onCancle(); }}
                isOpen={this.props.show}>
                <div>
                    <div className="col-xs-12" >
                        <h4 style={{color:'#e34c0d'}}>{this.props.content}</h4>
                    </div>
                    <div className="col-xs-12" >
                        {this.props.children}
                    </div>
                    {
                        this.props.isShowButton ?
                            (
                                <div className="row">
                                    <div className="col-xs-12">
                                        <button
                                            className="btn btn-default default-btn"
                                            onClick={
                                                e => this.props.onOk()
                                            }
                                        >确定</button>
                                        <button
                                            style={{ marginLeft: '10px' }}
                                            className="btn btn-default"
                                            onClick={e => { this.props.onCancle(); }}
                                        >取消</button>
                                    </div>
                                </div>) : null
                    }
                </div>
            </Modal >
        );
    }

}

export default Dialog;