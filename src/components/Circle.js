import React from 'react';

class Circle extends React.Component {
    static defaultProps = {
        onClick: (e, d) => {
        }
    }
    constructor(props) {
        super(props)
    }
    _renderShape = (data) => {
        let {
            transform,
            key,
            type,
            ...other
        } = data;
        return <circle {...other} key={key} transform={`matrix(${transform.join(',')})`} onClick={e => this.props.onClick(e, data)}></circle>
    }
    render() {

        return typeof this.props.data !== 'undefined' ? this._renderShape(this.props.data) : null
    }
}
export default Circle