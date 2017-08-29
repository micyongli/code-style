import React from 'react';
//import $ from 'jquery';
import { mat2d, vec2 } from 'gl-matrix';
import './Svg.css';
import Mover from './Mover';
import { connect } from 'react-redux';
import { mapProps, mapDispatch, _unwrapper, _wrapper } from './SvgStore';
import { mapDispatch as treeMapDisaptch } from './TreeStore';
import Text from './Text'

function mergeDispatch(dispatch) {
    return { ...mapDispatch(dispatch), ...treeMapDisaptch(dispatch) };
}

class Svg extends React.Component {
    static defaultProps = {
        disabledEdit: true
    }
    constructor(p) {
        super(p);
    }
    getProps = () => this.props.svgReducer
    getTreeProps = () => this.props.treeReducer
    onWheel = (e) => {
        let deltaY = e.deltaY;
        this.props.scaleGroupAction({
            deltaY,
            point: this.getPoint(e.nativeEvent)
        });
    }
    getPoint(e) {
        let floor = Math.floor;
        let bx = this.self.getBoundingClientRect();
        let x = floor(e.clientX - bx.left);
        let y = floor(e.clientY - bx.top);
        return [x, y];
    }

    mapSize() {
        let bx = this.self.getBoundingClientRect();
        return [bx.left, bx.top, bx.width, bx.height];
    }


    rightMenu = (e) => {
        return false;
    }

    componentDidMount() {
        this.props.initSvgAction();
        this.onResize();
        $(window).bind('resize ', this.onResize);
        $(this.self).bind('contextmenu', this.rightMenu);
       
    }

    componentWillUnmount() {
        $(window).unbind('resize ', this.onResize);
        $(this.self).unbind('contextmenu', this.rightMenu);
    }

    onResize = () => {
        this.props.mapSizeAction(this.mapSize());
    }

    screenPointToMap(p, m) {
        return vec2.transformMat2d([], p, mat2d.invert([], m));
    }

    mouseEvent = e => {
        let type = e.type;
        let tran = mat2d.identity([]);
        switch (type) {
            case 'mousedown':
                this.beginDrag(e);
                $(document).bind('mouseup', this.upevent);
                break;
            case 'click':
                break;
            case 'mouseup':
                this.endDrag(e);
                break;
            case 'mousemove':
                this.dragging(e);
                break;
        }
    }

    beginDrag = e => {
        this.props.beginMovingAction(this.getPoint(e.nativeEvent));
    }
    endDrag = e => {
        let ne = e.nativeEvent || e;
        this.props.endMovingAction(this.getPoint(ne));
    }

    dragging = e => {
        this.props.movingAction(this.getPoint(e.nativeEvent));
    }

    upevent = e => {
        $(document).unbind('mouseup', this.upevent);
        this.endDrag(e);
    }
    events = () => {
        let ev = {
            onWheel: this.onWheel,
            onMouseDown: this.mouseEvent,
            onMouseUp: this.mouseEvent,
            onMouseMove: this.mouseEvent,
            onClick: this.mouseEvent,
            onDrop: e => {
                /**拖放操作 */
                this.props.drapNodeEndAction();
                let rp = this.screenPointToMap(this.getPoint(e), this.getProps().scale);
                this.props.dropDrawShapesAction(this.getProps().roadId, this.getTreeProps().selectedSw, rp)
                e.preventDefault();
            },
            onDragOver: e => {
                e.preventDefault();
                e.stopPropagation();
            },
            onDragEnter:
            e => {
                this.props.dragNodeSetEffectAction(true)

            },
            onDragLeave:
            e => {
                this.props.dragNodeSetEffectAction(false)
            }

        };
        return this.props.disabledEdit ? {} : ev
    }

    restoreShape = (info) => {
        let sp = _unwrapper(info);
        let { type } = sp
        switch (type) {
            case 'img':
                return this._restoreImg(sp);
            case 'circle':
                return this._restoreCircle(sp);
            case 'text':
                return this._restoreText(sp);
        }
    }

    _restoreText = (info) => {
        let { x, y, txt, id, transform, dx, dy } = info
        let [xt, pid] = id.split('_')
        return <Text fontColor={info.fontColor} onClick={e => { if (!this.props.disabledEdit) this.props.clickShapeAction(pid) }} dx={dx} dy={dy} setTextDxyAction={this.props.setTextDxyAction} id={id} transform={transform} key={id} x={x} y={y} txt={txt} />
    }

    _restoreCircle = (info) => {
        /**逻辑，填充与文字同时变色 */
        let { cx, cy, r, id, transform, fill, stroke } = info;
        if (typeof fill === 'undefined') {
            fill = 'none';// 'rgba(0,0,255,0.5)'
        }
        if (typeof stroke === 'undefined') {
            stroke = 'rgba(0,255,0,0.8)'
        }
        return <circle strokeWidth="1" stroke={stroke} fill={fill} transform={`matrix(${transform.join(',')})`} onClick={e => { if (!this.props.disabledEdit) this.props.clickShapeAction(id) }} key={id} cx={cx} cy={cy} r={r}></circle>
    }
    _restoreImg = (info) => {
        let { x, y, url, id, width, height } = info;
        return <image onMouseDown={e => e.preventDefault()} width={width} height={height} key={id} x={x} y={y} xlinkHref={url}></image>
    }

    _createMover = () => {
        let { moverBeginAction,
            moverEndAction,
            moverMovingAction,
            moverAdjustSizeAction,
            removeShapeAction } = this.props;
        return this.getProps().selectedShapes.map(a => {
            let { x, y, w, h, transform, id } = a
            let p = {
                removeShapeAction,
                moverBeginAction,
                moverEndAction,
                moverMovingAction,
                moverAdjustSizeAction
            };
            return <Mover source={a} transform={transform} key={id} x={x} y={y} id={id} w={w} h={h} parent={this.self} {...p} />
        });
    }

    render() {
        let {
             shapes,
            scale
        } = this.getProps();

        return (
            <svg style={{ backgroundColor: 'rgba(0,0,0,.017)', textRendering: "geometricPrecision" }}
                {...this.events() }
                focusable="true"
                ref={obj => this.self = obj}
                className="mysvg">
                <g ref={a => this.group = a} transform={`matrix(${scale.join(',')})`}>
                    {shapes.map(a => this.restoreShape(a))}
                    {this._createMover()}
                </g>
            </svg>
        );
    }
}

export default connect(mapProps, mergeDispatch)(Svg);