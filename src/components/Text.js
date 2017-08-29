import React from 'react'

class Text extends React.Component {
    constructor(p) {
        super(p)
        this.state = ({ dx: 0, dy: 0 })
    }
    static defaultProps = {
        x: 0,
        y: 0,
        transform: [1, 0, 0, 1, 0, 0],
        fontColor: 'rgba(0,255,0,0.9)'
    }
    componentDidMount() {
        /**定位到图形中心 */
        this.recalSize()
    }

    recalSize = () => {
        let bx = this.self.getBoundingClientRect();
        let pbx = this.self.parentNode.parentNode.getBoundingClientRect();
        let x = bx.left - pbx.left + bx.width / 2;
        let y = bx.top - pbx.top + bx.height / 2;
        this.props.setTextDxyAction(this.props.id, { x: bx.left - pbx.left, y: bx.top - pbx.top, w: bx.width, h: bx.height })
    }


    tran = d => {
        return `matrix(${d.join(',')})`;
    }
    renderShape = () => {
        return <text onClick={this.props.onClick} fill={this.props.fontColor} dx={this.props.dx} dy={this.props.dy} ref={a => this.self = a} x={this.props.x} y={this.props.y} transform={this.tran(this.props.transform)}>{this.props.txt}</text>
    }
    render() {
        return typeof this.props.txt !== 'undefined' ? this.renderShape() : null
    }
}
export default Text