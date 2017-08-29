import React from 'react';
import { connect } from 'react-redux';
import { dialogManagerMapProps, dialogManagerDispatch } from './DialogManagerStore';
class DialogManager extends React.Component {
    constructor(props) {
        super(props)
    }
    getProps = () => this.props.dialogManagerReducer
    render() {
        let dlgs = this.getProps().dialogs;
        return <div style={{ display: 'none' }}>{dlgs}</div>
    }
}
export default connect(dialogManagerMapProps, dialogManagerDispatch)(DialogManager)