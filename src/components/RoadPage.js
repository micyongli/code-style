import React, { Component } from 'react';
import reactDom from 'react-dom';
import './RoadPage.css';
import SearchBox from './SearchBox';
import Svg from './Svg';
import Tree from './Tree';
import SvgButton from './SvgButton';
import RoadDialog from './RoadDialog';
import Dialog from './Dialog';
import { connect } from 'react-redux';
import { mapProps, mapDispatch } from './TreeStore';
import { mapDispatch as svgDispatch } from './SvgStore';
import DialogManager from './DialogManager';
import { dialogManagerDispatch } from './DialogManagerStore';
import CloneDialog from './CloneDialog';
import { mapHistoryDispatch } from '../history';

class RoadPage extends Component {

    closeDialog = (dlg) => {
        let self = dlg;
        let index = this.dialogs.indexOf(self);
        if (index >= 0) {
            this.dialogs.splice(index, 1);
            this.setState({ ref: !this.state.ref });
        }
    }
    createDialog = (param) => {
        let { title, ...other } = param;
        let dlg = (
            <RoadDialog
                {...other}
                requiredClose={true}
                title={title}
                key={'dialog' + this.dialogs.length}
                onClose={() => { this.closeDialog(dlg); }} >
            </RoadDialog>);
        this.dialogs.push(dlg);
        this.setState({ ref: !this.state.ref });
    }

    ComfirmDialog = (param) => {
        let { content, onOk, onCancle } = param;
        let dlg = (
            <Dialog
                content={content}
                key={'dialog' + this.dialogs.length}
                onOk={() => {
                    if (onOk) {
                        onOk(() => { this.closeDialog(dlg) });
                    } else
                        this.closeDialog(dlg);
                }}
                onCancle={() => {
                    if (onCancle) {
                        onCancle(() => { this.closeDialog(dlg) });
                    } else
                        this.closeDialog(dlg);
                }}>
            </Dialog>
        );
        this.dialogs.push(dlg);
        this.setState({ ref: !this.state.ref });
    }

    /**创建对话框 */

    constructor(props) {
        super(props);
        this.state = {
            ref: false,
            toggleUploader: true
        };
        this.dialogs = [];
        this.roadId = '';
    }


    setHistory = (d) => {
        this.props.setHistoryAction('roadpage_roadid', d)
    }

    getHistory = () => {
        return this.props.historyReducer.history['roadpage_roadid']
    }

    loadHistory = () => {
        let rid = this.getHistory();
        console.log('load history ', rid)
        if (rid) {
            this.props.searchExpandTreeAction(rid);
        } else {
            fetch('/road/queryoneroad', { credentials: 'include', method: 'post', headers: { 'content-type': 'applicatin/json' } })
                .then(r => {
                    if (r.status >= 200 && r.status < 300) {
                        return r.json();
                    }
                    throw new Error(r.statusText);
                })
                .then(r => {
                    if (r.code != 0)
                        throw new Error(r.msg);
                    if (r.data.length > 0) {
                        let first = r.data[0];
                        this.setHistory(first.id);
                        this.props.searchExpandTreeAction(first.id);
                    }
                })
                .catch(e => {
                    this.props.showDialogAction(Dialog,
                        {
                            content: e.message,
                            onCancle: id => {
                                this.props.closeDialogAction(id);
                            },
                            isShowButton: false
                        }
                    );
                });
        }
    }

    componentWillReceiveProps(nprops) {
        let nid = nprops.treeReducer.roadId;
        let cid = this.props.treeReducer.roadId;
        if (nid && nid !== cid) {
            this.setHistory(nid);
            nprops.createRoad(nid);
        } else
            if (nid != cid) {
                nprops.initSvgAction();
            }
    }

    /**树结点选择 */
    onSelectedNode = item => {
        this.props.getRoadIdAction();
    }

    onSearch = item => {
        this.props.searchExpandTreeAction(item.key);
    }

    canAppend = () => {
        let sel = this.props.treeReducer.selectedNodes;
        if (sel.length === 0) {
            return false;
        }
        let cur = sel[0];
        if (['2'].indexOf(cur.type.toString()) >= 0) {
            return false;
        }
        return true;
    }

    disabledToolBtn = () => {
        return this.props.treeReducer.roadId ? false : true;
    }

    /**文件上传Input */
    uploadFileInput = () => {
        return (<input
            style={{
                display: 'none'
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onChange={this.onSelectFileChange}
            type="file"
            ref={a => this.uploadFileRef = a} />);
    }

    onSelectFileChange = (e) => {
        let fd = new FormData();
        fd.append('file', this.uploadFileRef.files[0]);
        fetch('/road/uploadfile',
            {
                method: 'post',
                body: fd,
                headers: {
                    'conten-type': 'application/json,multipart/form-data'
                },
                credentials: 'include'
            })
            .then(r => {
                if (r.status >= 200 && r.status < 300) {
                    return r.json();
                }
                throw new Error(r.statusText);
            })
            .then(d => {
                if (d.code != 0) {
                    throw new Error(d.msg);
                }
                this.props.setImgUrlAction(d.imgUrl, this.props.svgReducer.roadId);
            })
            .catch(e => {
                this.props.setFailtAction(e.message);
            });
        setTimeout(() => {
            this.setState({ toggleUploader: false });
            setTimeout(() => {
                this.setState({ toggleUploader: true });
            });
        });
    }

    /**文件上传 */
    execUploadFile = () => {
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", false, false, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.uploadFileRef.dispatchEvent(evt);
    }


    getChildren = (tree, ret) => {
        ret.push(tree.id)
        for (let x = 0; x < tree.children.length; x++) {
            this.getChildren(tree.children[x], ret);
        }
    }

    doDeleteSelectedShapes = () => {
        let ids = []
        this.props.svgReducer.selectedShapes.forEach(a => {
            ids.push(a.id)
        });
        this.props.deleteSelectedShapesAction(ids)
    }

    /**对齐方式 */
    doLeftAlignShapes = () => {
        this.props.leftAlignShapesAction();
    }
    doRightAlignShapes = () => {
        this.props.rightAlignShapesAction();
    }
    doTopAlignShapes = () => {
        this.props.topAlignShapesAction();
    }
    doBottomAlignShapes = () => {
        this.props.bottomAlignShapesAction()
    }
    doAdjustShapesMax = () => {
        this.props.adjustShapesMaxAction()
    }

    doAdjustShapesMin = () => {
        this.props.adjustShapesMinAction()
    }

    doCloneEditor = (e, item) => {
        if (e.ctrlKey && typeof item['type'] !== 'undefined' && [2, '2'].indexOf(item['type']) >= 0) {
            fetch('/road/queryswbinding',
                {
                    credentials: 'include',
                    method: 'post',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ sourceip: item.data.ip, sourcesw: item.data.swid })
                })
                .then(r => {
                    if (r.status >= 200 && r.status < 300)
                        return r.json();
                    throw new Error(r.statusText);

                })
                .then(r => {
                    if (r.code != 0)
                        throw new Error(r.msg)
                    this.props.showDialogAction(CloneDialog,
                        {
                            targetip: r.data.length > 0 ? r.data[0].ip : '',
                            targetsw: r.data.length > 0 ? r.data[0].swid.toString(16).toUpperCase() : '',
                            item,
                            title: '绑定',
                            onExec: (f, cb) => {
                                if (f && (!f['targetip'] || !f['targetsw'])) {
                                    this.props.showDialogAction(Dialog, {
                                        content: '绑定信息不正确',
                                        isShowButton: false,
                                        onCancle: id => this.props.closeDialogAction(id)
                                    });
                                    return;
                                }
                                fetch('/road/swbinding', { body: JSON.stringify(f), credentials: 'include', method: 'post', headers: { 'content-type': 'application/json' } })
                                    .then(r => {
                                        if (r.status >= 200 && r.status < 300)
                                            return r.json();
                                        throw new Error(r.statusText);
                                    })
                                    .then(r => {
                                        if (r.code !== 0)
                                            throw new Error(r.msg);
                                        cb();
                                    })
                                    .catch(e => {
                                        this.props.showDialogAction(Dialog, {
                                            content: e.message,
                                            isShowButton: false,
                                            onCancle: id => this.props.closeDialogAction(id)
                                        });
                                    })
                            },
                            onCleanBind: (f, cb) => {
                                fetch('/road/cleanswbinding', { body: JSON.stringify(f), credentials: 'include', method: 'post', headers: { 'content-type': 'application/json' } })
                                    .then(r => {
                                        if (r.status >= 200 && r.status < 300)
                                            return r.json();
                                        throw new Error(r.statusText);
                                    })
                                    .then(r => {
                                        if (r.code !== 0)
                                            throw new Error(r.msg)
                                        cb();
                                    })
                                    .catch(e => {
                                        this.props.showDialogAction(Dialog, {
                                            content: e.message,
                                            isShowButton: false,
                                            onCancle: id => this.props.closeDialogAction(id)
                                        });
                                    });
                            }
                        }
                    );
                })
                .catch(e => {
                    this.props.showDialogAction(Dialog, {
                        content: e.message,
                        isShowButton: false,
                        onCancle: id => this.props.closeDialogAction(id)
                    });
                });

        }
    }

    render() {
        return (
            <div className="flex-row hx1 flex-v">
                <div className="road-page-left">
                    <div className="search-container">
                        <SearchBox onChange={item => { this.onSearch(item); }} url="/search"></SearchBox>
                    </div>
                    <div className="tree-container">
                        <Tree onLoaded={() => this.loadHistory()} dblClick={(e, item) => this.doCloneEditor(e, item)} onSelectedNode={this.onSelectedNode} />
                    </div>
                    <div className="btn-container">
                        {/*树的CURD*/}
                        <SvgButton
                            title="添加"
                            onClick={
                                e => {
                                    let sels = this.props.treeReducer.selectedNodes;
                                    this.createDialog({
                                        title: '新建',
                                        onOk: (item, close) => {
                                            item.parent = sels.length == 0 ? 'rootNode' : sels[0].id;
                                            this.props.addTreeNodeAction('/road/add', item, close);
                                        }
                                    });
                                }
                            }
                            disabled={this.props.treeReducer.selectedNodes.length == 0 ? false : !this.canAppend()}
                            width="40"
                            height="40"
                            d="M683.968 534.944H544v139.968a32 32 0 0 1-64 0v-139.968h-139.968a32 32 0 0 1 0-64H480v-139.968a32 32 0 0 1 64 0v139.968h139.968a32 32 0 0 1 0 64M512 128C300.256 128 128 300.288 128 512c0 211.744 172.256 384 384 384s384-172.256 384-384c0-211.712-172.256-384-384-384" />
                        <SvgButton
                            title="删除"
                            onClick={
                                e => {
                                    let [cur] = this.props.treeReducer.selectedNodes;
                                    if (cur) {
                                        let ids = [];
                                        this.getChildren(cur, ids)
                                        this.ComfirmDialog({
                                            content: '确定删除 "' + cur.value + '" (子项一并删除) ???',
                                            onOk: (cb) => {
                                                this.props.deleteTreeNodeAction('/road/del', ids, cb);
                                            },
                                            onCancle: (cb) => {
                                                cb();
                                            }
                                        });
                                    }
                                }
                            }
                            disabled={this.props.treeReducer.selectedNodes.length > 0 ? false : true} width="40" height="40" d="M512 832c-176.448 0-320-143.552-320-320S335.552 192 512 192s320 143.552 320 320-143.552 320-320 320m0-704C300.256 128 128 300.256 128 512s172.256 384 384 384 384-172.256 384-384S723.744 128 512 128M649.824 361.376a31.968 31.968 0 0 0-45.248 0L505.6 460.352l-98.976-98.976a31.968 31.968 0 1 0-45.248 45.248l98.976 98.976-98.976 98.976a32 32 0 0 0 45.248 45.248l98.976-98.976 98.976 98.976a31.904 31.904 0 0 0 45.248 0 31.968 31.968 0 0 0 0-45.248L550.848 505.6l98.976-98.976a31.968 31.968 0 0 0 0-45.248" />
                        <SvgButton
                            title="编辑"
                            onClick={
                                e => {
                                    let sel = this.props.treeReducer.selectedNodes[0];
                                    this.createDialog({
                                        title: '编辑',
                                        record: sel,
                                        onOk: (item, close) => {
                                            item.id = sel.data.id;
                                            item.parent = sel.data.parent;
                                            this.props.updateTreeNodeAction('/road/edit', item, close);
                                        }
                                    });
                                }
                            }
                            disabled={this.props.treeReducer.selectedNodes.length > 0 ? false : true} width="40" height="40" d="M489.376 534.624a31.904 31.904 0 0 0 45.248 0l304-304a31.968 31.968 0 1 0-45.248-45.248l-304 304a31.968 31.968 0 0 0 0 45.248M832 480a32 32 0 0 0-32 32l0.256 288L224 800.256 223.744 224H512a32 32 0 0 0 0-64H223.744A63.84 63.84 0 0 0 160 223.744v576.512C160 835.392 188.608 864 223.744 864h576.512A63.84 63.84 0 0 0 864 800.256V512a32 32 0 0 0-32-32" />

                    </div>
                </div>
                <div className="road-page-right">
                    {/*工具栏*/}
                    {
                        this.disabledToolBtn() ? null :
                            <div style={{ height: 30, position: 'absolute', bottom: 1, left: 1, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 4 }}>
                                <SvgButton
                                    title="上传图片"
                                    disabled={this.props.svgReducer.roadId ? false : true}
                                    onClick={
                                        () => {
                                            this.execUploadFile();
                                        }
                                    }
                                    width="30"
                                    height="30"
                                    d="M 938.667 170.667 h -853.333 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 682.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 853.333 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -682.667 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 Z m -147.911 460.8 c -11.3778 -17.0667 -34.1333 -17.0667 -51.2 0 l -125.156 130.844 c -5.68889 5.68889 -17.0667 5.68889 -28.4444 0 L 392.533 568.889 c -11.3778 -17.0667 -34.1333 -17.0667 -51.2 0 l -227.556 227.556 V 227.556 h 796.444 v 551.822 l -119.467 -147.911 Z M 716.8 517.689 c 51.2 0 91.0222 -34.1333 91.0222 -85.3333 S 773.689 341.333 722.489 341.333 s -91.0222 34.1333 -91.0222 85.3333 s 34.1333 91.0222 85.3333 91.0222 Z" />

                                <SvgButton
                                    title="全选图形"
                                    width="30"
                                    height="30"
                                    disabled={this.props.svgReducer.roadId ? false : true}
                                    onClick={
                                        () => {
                                            this.props.selectAllShapesAction()
                                        }
                                    }
                                    d='M 464.248 677.488 C 474.215 686.649 489.666 686.202 499.086 676.479 L 798.905 367.038 C 808.503 357.132 808.254 341.32 798.347 331.721 C 788.441 322.123 772.629 322.373 763.031 332.279 L 463.212 641.72 L 498.05 640.712 L 316.609 473.94 C 306.453 464.606 290.654 465.272 281.319 475.427 C 271.985 485.583 272.651 501.382 282.806 510.717 L 464.248 677.488 Z' />
                                <SvgButton
                                    title="取消全选"
                                    width="30"
                                    height="30"
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    onClick={
                                        () => {
                                            this.props.cancleSelectAllShapesAction()
                                        }
                                    }
                                    d='M 176.662 817.173 C 168.473 825.644 168.702 839.15 177.173 847.338 C 185.644 855.527 199.15 855.298 207.338 846.827 L 826.005 206.827 C 834.194 198.356 833.965 184.85 825.494 176.662 C 817.023 168.473 803.517 168.702 795.328 177.173 L 176.662 817.173 Z M 795.328 846.827 C 803.517 855.298 817.023 855.527 825.494 847.338 C 833.965 839.15 834.194 825.644 826.005 817.173 L 207.338 177.173 C 199.15 168.702 185.644 168.473 177.173 176.662 C 168.702 184.85 168.473 198.356 176.662 206.827 L 795.328 846.827 Z'
                                />
                                <SvgButton
                                    title="删除选中图形"
                                    width="30"
                                    height="30"
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    onClick={
                                        () => {
                                            this.doDeleteSelectedShapes()
                                        }
                                    }
                                    d='M 972.658 209.348 C 987.159 209.368 998.93 197.571 998.95 182.999 C 998.97 168.426 987.231 156.597 972.73 156.577 L 32.458 155.281 C 17.957 155.261 6.18547 167.058 6.16559 181.631 C 6.1457 196.203 17.885 208.033 32.386 208.053 L 972.658 209.348 Z M 180.467 992.356 L 180.467 1019.01 L 206.993 1018.74 L 833.362 1012.27 L 859.348 1012 L 859.348 985.883 L 859.348 289.397 C 859.348 274.825 847.593 263.011 833.092 263.011 C 818.591 263.011 806.835 274.825 806.835 289.397 L 806.835 985.883 L 832.822 959.499 L 206.453 965.972 L 232.98 992.356 L 232.98 282.67 C 232.98 268.097 221.224 256.284 206.723 256.284 C 192.222 256.284 180.467 268.097 180.467 282.67 L 180.467 992.356 Z M 656.41 847.079 C 656.41 861.652 668.166 873.465 682.667 873.465 C 697.168 873.465 708.923 861.652 708.923 847.079 L 708.923 372.132 C 708.923 357.559 697.168 345.746 682.667 345.746 C 668.166 345.746 656.41 357.559 656.41 372.132 L 656.41 847.079 Z M 341.333 847.079 C 341.333 861.652 353.089 873.465 367.59 873.465 C 382.091 873.465 393.846 861.652 393.846 847.079 L 393.846 372.132 C 393.846 357.559 382.091 345.746 367.59 345.746 C 353.089 345.746 341.333 357.559 341.333 372.132 L 341.333 847.079 Z M 498.872 847.079 C 498.872 861.652 510.627 873.465 525.128 873.465 C 539.629 873.465 551.385 861.652 551.385 847.079 L 551.385 372.132 C 551.385 357.559 539.629 345.746 525.128 345.746 C 510.627 345.746 498.872 357.559 498.872 372.132 L 498.872 847.079 Z M 392.148 116.722 C 392.148 102.064 403.759 90.3635 418.401 90.3635 L 622.926 90.3635 C 637.409 90.3635 649.179 102.162 649.179 116.55 L 649.179 171.645 L 701.692 171.645 L 701.692 116.55 C 701.692 72.9866 666.381 37.5916 622.926 37.5916 L 418.401 37.5916 C 374.724 37.5916 339.635 72.9508 339.635 116.722 L 339.635 165.311 L 392.148 165.311 L 392.148 116.722 Z'
                                />
                                <SvgButton
                                    title="左对齐"
                                    onClick={this.doLeftAlignShapes}
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 199.111 56.8889 c 17.0667 0 28.4444 11.3778 28.4444 28.4444 v 796.444 c 0 11.3778 -11.3778 28.4444 -28.4444 28.4444 s -28.4444 -11.3778 -28.4444 -28.4444 v -796.444 c 0 -17.0667 11.3778 -28.4444 28.4444 -28.4444 Z M 682.667 256 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -341.333 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 170.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 341.333 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -170.667 Z M 910.222 597.333 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -568.889 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 170.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 568.889 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -170.667 Z" />
                                {/* <SvgButton
                                    title=""
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 739.556 256 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 H 568.889 V 85.3333 c 0 -11.3778 -11.3778 -28.4444 -28.4444 -28.4444 s -28.4444 17.0667 -28.4444 28.4444 V 227.556 H 369.778 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 170.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 H 512 v 113.778 H 256 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 170.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 H 512 v 142.222 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 s 28.4444 -11.3778 28.4444 -28.4444 V 796.444 h 256 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -170.667 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 H 568.889 V 455.111 h 142.222 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -170.667 Z" /> */}
                                <SvgButton
                                    title="右对齐"
                                    onClick={this.doRightAlignShapes}
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 824.889 56.8889 c 17.0667 0 28.4444 11.3778 28.4444 28.4444 v 796.444 c 0 17.0667 -11.3778 28.4444 -28.4444 28.4444 s -28.4444 -11.3778 -28.4444 -22.7556 v -796.444 c 0 -17.0667 11.3778 -34.1333 28.4444 -34.1333 Z M 739.556 256 c 0 -17.0667 -17.0667 -28.4444 -28.4444 -28.4444 h -341.333 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 170.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 335.644 c 17.0667 0 34.1333 -11.3778 34.1333 -28.4444 v -170.667 Z M 739.556 597.333 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -568.889 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 170.667 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 568.889 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -170.667 Z" />
                                <SvgButton
                                    title="上对齐"
                                    onClick={this.doTopAlignShapes}
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 113.778 199.111 c 0 -17.0667 11.3778 -28.4444 28.4444 -28.4444 h 739.556 c 17.0667 0 28.4444 11.3778 28.4444 28.4444 s -17.0667 28.4444 -28.4444 28.4444 h -739.556 c -17.0667 0 -28.4444 -11.3778 -28.4444 -28.4444 Z M 256 284.444 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 568.889 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 170.667 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -568.889 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -170.667 Z M 597.333 284.444 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 341.333 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 170.667 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -341.333 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -170.667 Z" />
                                {/* <SvgButton
                                    title=""
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 682.667 199.111 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -227.556 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 V 284.444 H 142.222 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 s 11.3778 28.4444 28.4444 28.4444 H 398.222 v 85.3333 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 227.556 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 V 341.333 h 256 c 17.0667 0 28.4444 -11.3778 28.4444 -22.7556 c 0 -22.7556 -11.3778 -34.1333 -28.4444 -34.1333 H 682.667 V 199.111 Z M 796.444 597.333 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -455.111 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 V 682.667 H 142.222 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 s 11.3778 28.4444 28.4444 28.4444 H 284.444 v 85.3333 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 455.111 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 V 739.556 h 142.222 c 17.0667 0 28.4444 -11.3778 28.4444 -22.7556 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 H 796.444 v -91.0222 Z" /> */}
                                <SvgButton
                                    title="下对齐"
                                    onClick={this.doBottomAlignShapes}
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 256 113.778 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 568.889 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 170.667 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -568.889 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -170.667 Z M 597.333 341.333 c -17.0667 0 -28.4444 11.3778 -28.4444 28.4444 v 341.333 c 0 17.0667 11.3778 28.4444 28.4444 28.4444 h 170.667 c 17.0667 0 28.4444 -11.3778 28.4444 -28.4444 v -341.333 c 0 -17.0667 -11.3778 -28.4444 -28.4444 -28.4444 h -170.667 Z M 113.778 824.889 c 0 -17.0667 11.3778 -28.4444 28.4444 -28.4444 h 739.556 c 17.0667 0 28.4444 11.3778 28.4444 28.4444 s -11.3778 28.4444 -28.4444 28.4444 h -739.556 c -17.0667 0 -28.4444 -11.3778 -28.4444 -28.4444 Z" />
                                <SvgButton
                                    title="大尺寸"
                                    onClick={this.doAdjustShapesMax}
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 409.376 553.376 L 224 738.752 V 608 a 32 32 0 0 0 -64 0 v 192.544 c 0 3.488 0.48 6.848 1.024 10.176 a 31.456 31.456 0 0 0 8.352 27.904 c 2.336 2.336 5.152 3.808 7.904 5.248 c 11.648 12.48 28.096 20.384 46.464 20.384 h 192.512 a 32 32 0 1 0 0 -64 l -163.488 0.224 l 201.856 -201.856 a 31.968 31.968 0 1 0 -45.248 -45.248 M 800.512 160 H 608 a 32 32 0 0 0 0 64 l 146.944 -0.192 l -201.568 201.568 a 31.968 31.968 0 1 0 45.248 45.248 l 201.632 -201.632 v 147.264 a 32 32 0 1 0 64 0 V 223.744 A 63.84 63.84 0 0 0 800.512 160" />
                                <SvgButton
                                    title="最小尺寸"
                                    onClick={this.doAdjustShapesMin}
                                    disabled={this.props.svgReducer.selectedShapes.length > 0 ? false : true}
                                    width="30"
                                    height="30"
                                    d="M 448.544 496 H 256 a 32 32 0 0 0 0 64 l 146.976 -0.192 l -233.6 233.568 a 32 32 0 0 0 45.248 45.248 l 233.664 -233.632 v 147.264 a 32 32 0 1 0 64 0 v -192.512 a 63.84 63.84 0 0 0 -63.744 -63.744 M 838.624 201.376 a 31.968 31.968 0 0 0 -45.248 0 L 576 418.752 V 272 a 32 32 0 0 0 -64 0 v 192.544 c 0 35.136 28.608 63.712 63.744 63.712 h 192.512 a 32 32 0 1 0 0 -64 l -147.488 0.224 l 217.856 -217.856 a 31.968 31.968 0 0 0 0 -45.248" />
                            </div>
                    }
                    {
                        this.disabledToolBtn() ? null :
                            <div style={{ padding: 4, fontSize: 16, position: 'absolute', top: 1, left: 1, backgroundColor: 'rgba(255,255,255,0.87)', borderRadius: 4 }}>
                                {this.props.treeReducer.roadPath}
                            </div>
                    }
                    <Svg disabledEdit={false} />
                </div>
                {this.dialogs}
                {/*提示窗口*/}
                {
                    this.props.treeReducer.isFailt ?
                        <Dialog
                            content={this.props.treeReducer.failtMsg}
                            isShowButton={false}
                            onCancle={() => {
                                this.props.resetFailtAction();
                            }}>
                        </Dialog> : null
                }
                {/*文件止传*/}
                {
                    this.state.toggleUploader ? this.uploadFileInput() : null
                }
                <DialogManager />
            </div>
        );
    }
}
export default connect(mapProps, (d) => { return { ...mapHistoryDispatch(d), ...dialogManagerDispatch(d), ...svgDispatch(d), ...mapDispatch(d) } })(RoadPage);