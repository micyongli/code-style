import React from 'react';
//import $ from 'jquery';
class Mover extends React.Component {

    constructor(p) {
        super(p);
        this.state = {
            fill: 'rgba(255,255,0,0.7)'
        };
    }
    mouseEnter = e => {
        this.setState({ fill: 'rgba(255,255,0,1)' });
    }
    mouseLeave = e => {
        this.setState({ fill: 'rgba(255,255,0,0.7)' });
    }
    getPoint(e) {
        let bx = this
            .props
            .parent
            .getBoundingClientRect();
        return [
            e.clientX - bx.left,
            e.clientY - bx.top
        ];
    }

    down = e => {
        e.preventDefault();
        e.stopPropagation();
        $(document).bind('mouseup', this.mouseUp);
        $(this.props.parent).bind('mousemove', this.mouseMove);
        $(this.props.parent).bind('mouseup', this.mouseUp);
        this.isMoving = true;
        this.lastPoint = this.getPoint(e);
        if (this.props.moverBeginAction)
            this.props.moverBeginAction(this.props.id);
    }
    mouseUp = e => {
        e.preventDefault();
        e.stopPropagation();
        $(document).unbind('mouseup', this.mouseUp);
        $(this.props.parent).unbind('mousemove', this.mouseMove);
        $(this.props.parent).unbind('mouseup', this.mouseUp);
        this.isMoving = false;
        if (this.props.moverEndAction)
            this.props.moverEndAction(this.props.source.shape);
    }
    mouseMove = e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isMoving) {
            let cp = this.getPoint(e);
            let offset = [
                cp[0] - this.lastPoint[0],
                cp[1] - this.lastPoint[1]
            ];
            if (!e.ctrlKey) {
                if (this.props.moverMovingAction)
                    this.props.moverMovingAction(offset, this.props.id);
            }
            else {
                if (this.props.moverAdjustSizeAction) {
                    this
                        .props
                        .moverAdjustSizeAction(
                        Object.assign({}, this.lastPoint),
                        Object.assign({}, cp),
                        offset,
                        this.props.id
                        );
                }
            }
            this.lastPoint = cp;
        }
    }
    dblClick = e => {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.removeShapeAction) {
            this.props.removeShapeAction(this.props.id);
        }
    }


    render() {
        let { x, y, w, h, transform } = this.props;
        let min = w > h
            ? h
            : w;
        min *= 0.25;
        x -= min / 2;
        y -= min / 2;
        let floor = Math.floor;
        return (
            <rect
                ref={a => this.self = a}
                onMouseDown={this.down}
                transform={`matrix(${transform.join(',')})`}
                fill={this.state.fill}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
                onDoubleClick={this.dblClick}
                x={x + w / 2}
                y={y}
                rx={min / 4}
                ry={min / 4}
                width={min}
                height={min}></rect>
        );
    }
}

export default Mover;