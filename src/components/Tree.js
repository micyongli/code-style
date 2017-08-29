import React from 'react';
import reactDom from 'react-dom';
import './Tree.css';
import Modal from 'react-modal';
import SvgButton from './SvgButton';
import { connect } from 'react-redux';
import { mapProps, mapDispatch } from './TreeStore';

class Tree extends React.Component {

    static defaultProps = {
        onSelectedNode: item => { },
        onLoaded: () => { }
    }
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        //加载树
        this.props.fetchTreeAction('/road/query');
    }

    componentWillReceiveProps(nx) {
        let { beginLoad, endLoad } = this.props.treeReducer;
        let newObj = nx.treeReducer;
        if (beginLoad === true && endLoad === false && newObj.beginLoad === false && newObj.endLoad === true) {
            this.props.onLoaded();
            console.log('加载完毕')
        }
    }

    getIconClass = item => {
        let className = 'icon';
        let type = item.type;
        switch (type.toString()) {
            case '1': //路段
                className += ' t-road';
                break;
            case '2': //车检器
                className += ' t-sw';
                break;
            case '3': //车检组
                className += ' t-area';
                break;
            case '4': //路口
                className += ' t-cross';
                break;
            case '5': //区域
                className += ' t-area';
                break;
        }
        return className;
    }

    getSwid = item => {
        let swid = parseInt(item.data.swid);
        let code = swid.toString(16).toUpperCase();
        return `(${code})`;
    }

    /**显示值 */
    getNodeDisplayValue = item => {
        let nodeName = item.value;
        let type = item.type;
        switch (type.toString()) {
            case '1': //路段
                nodeName += `(${item.data.code})`;
                break;
            case '2': //车检器
                nodeName += this.getSwid(item);
                break;
            case '3': //车检组
                nodeName += '';
                break;
            case '4': //路口
                nodeName += `(${item.data.code})`;
                break;
            case '5': //区域
                // nodeName += `(${item.data.code})`;
                break;
        }
        return nodeName;
    }

    getProps = () => {
        return this.props.treeReducer;
    }

    getDragState = (cur) => {
        let p = this.getProps();
        if (p.dragNode === null) {
            return {};
        } else {
            if (p.dragNodeData && p.dragNodeData.id !== cur.id)
                return {};
            return { backgroundColor: (p.dragAccepted ? 'green' : 'red') };
        }
    }

    canDrag = (item) => {
        let limit = item.type.toString() !== '5';
        return this.getProps().selectedNodes.indexOf(item) >= 0 ? (this.getProps().selectedSw.length > 0 ? (true && limit) : false) : false;
    }

    renderTree = (data) => {
        let lastKey = '';
        let rs = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let isShow = item.expand;
            let len = item.children.length;
            lastKey = `children-${item.id}`;
            let selectedClass = this.getProps().selectedNodes.indexOf(item) >= 0 ? 'txt selected-node' : 'txt';
            rs.push(
                <li key={item.id} >
                    <span
                        className={this.getIconClass(item)}
                        onMouseDown={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.props.expandTreeNodeAction(item.id);

                        }} ></span>
                    <span
                        onDoubleClick={
                            e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (this.props.dblClick)
                                    this.props.dblClick(e, item)
                            }
                        }
                        draggable={this.canDrag(item)}
                        onDrag={
                            e => {

                            }
                        }
                        onDragStart={
                            e => {
                                //console.log('drag start')
                                e.stopPropagation();
                                e.nativeEvent.dataTransfer.setData('url', 'abc')

                                /**把对像放入容器 */
                                e.nativeEvent.effectAllowed = 'move';
                                this.props.dragNodeBeginAction(e.target, item);

                            }
                        }
                        onDragEnd={
                            e => {
                                e.stopPropagation();
                                e.preventDefault();
                                /**清除容器 */
                                this.props.drapNodeEndAction();
                                e.dataTransfer.clearData();
                            }
                        }

                        className={selectedClass}
                        onMouseDown={e => {
                            //e.preventDefault();
                            //e.preventDefault();
                            this.props.selectTreeNodeAction(item);
                            this.props.onSelectedNode(item);
                        }}
                        style={this.getDragState(item)}
                    >
                        {this.getNodeDisplayValue(item)}
                    </span>
                    {isShow ? this.renderTree(item.children) : null}
                </li>);
        }
        return rs.length == 0 ? null : (<ul key={lastKey}>{rs}</ul>);
    }

    render() {
        return (
            <div ref={a => this.treeContainer = a} className="tree-container">
                {this.getProps().loading ? (<img src="imgs/loading.gif" />) : null}
                {this.renderTree(this.getProps().treeNodes)}
            </div >
        );
    }
}

export default connect(mapProps, mapDispatch)(Tree);