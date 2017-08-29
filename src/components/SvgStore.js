import { mat2d, vec2 } from 'gl-matrix';
import ext from '../util/gl-matrix-ext';

/**
 *
 * @param {*} state
 */
export function mapProps(state) {
    return {
        ...state
    };
}


/**
 *
 * @param {*} dispatch
 */
export function mapDispatch(dispatch) {
    return {
        /**监控状态时对数据操作 */
        updateMonListAction: (guid, data) => {
            dispatch({ type: 'updateMonListAction', guid, data });
        },

        /**创建道路 */
        createRoad: (roadId, isMon) => {
            createRoadAsync(dispatch, roadId, isMon);
        },

        /**加载图形 */
        loadShapesAction: (roadid, isMon) => {
            loadShapesAsync(dispatch, roadid, isMon);
        },

        /**添加图形 */
        appendShapesAction: (data) => {
            dispatch({ type: 'appendShapesAction', data });
        },

        /**删除图形 */
        removeShapeAction: (id) => {
            removeShapeAsync(dispatch, id)
        },

        /**缩放 */
        scaleGroupAction: (param) => {
            dispatch({
                type: 'scaleGroupAction',
                ...param
            });
        },

        /**移动开始 */
        beginMovingAction: (point) => {
            dispatch({ type: 'beginMovingAction', point });
        },

        /**移动中 */
        movingAction: (point) => {
            dispatch({ type: 'movingAction', point });
        },

        /**结束移动 */
        endMovingAction: (point) => {
            dispatch({ type: 'endMovingAction', point });
        },

        /**映射地图中心 */
        mapSizeAction: (point) => {
            dispatch({ type: 'mapSizeAction', point });
        },

        /**单击图形 */
        clickShapeAction: (id) => {
            dispatch({ type: 'clickShapeAction', id });
        },

        /**移动器开始 */
        moverBeginAction: (id) => {
            dispatch({ type: 'moverBeginAction', id });
        },

        /**移动器结束 */
        moverEndAction: (shape) => {
            updateShapeAsync(dispatch, shape);
        },

        /**移动器移动中 */
        moverMovingAction: (offset, id) => {
            dispatch({ type: 'moverMovingAction', offset, id });
        },

        /**移动器调整大小 */
        moverAdjustSizeAction: (lastPoint, currentPoint, offset, id) => {
            dispatch({ type: 'moverAdjustSizeAction', lastPoint, currentPoint, offset, id });
        },

        /**初始化数据 */
        initSvgAction: () => {
            dispatch({ type: 'initSvgAction' });
        },

        /**拖放绘制图形 */
        dropDrawShapesAction: (roadId, items, point) => {
            dropDrawShapesAsync(dispatch, roadId, items, point);
        },

        /** */
        setRoadIdAction: id => {
            dispatch({ type: 'setRoadIdAction', id })
        },
        setImgUrlAction: (url, roadId) => {
            setImagUrlAsync(dispatch, url, roadId);
        },
        setImgUrlEndAction: (url, id, w, h) => {
            dispatch({ type: 'setImagUrlEndAction', url, id, w, h })
        },
        getImgUrlAction: (roadId, isMon) => {
            getImgUrlAsync(dispatch, roadId, isMon)
        },

        /**调整文件偏移量 */
        setTextDxyAction: (id, center) => {
            dispatch({ type: 'setTextDxyAction', id, center });
        },

        /**全选  */
        selectAllShapesAction: () => {
            dispatch({ type: 'selectAllShapesAction' })
        },
        /**取消全选 */
        cancleSelectAllShapesAction: () => {
            dispatch({ type: 'cancleSelectAllShapesAction' })
        },
        /**删除选中 */
        deleteSelectedShapesAction: (ids) => {
            deleteSelectedShapesAsync(dispatch, ids);
        },
        /**左对齐 */
        leftAlignShapesAction: () => {
            dispatch({ type: 'leftAlignShapesAction', dispatch })
        },

        /**右对齐 */
        rightAlignShapesAction: () => {
            dispatch({ type: 'rightAlignShapesAction', dispatch })
        },
        /**顶端对齐 */
        topAlignShapesAction: () => {
            dispatch({ type: 'topAlignShapesAction', dispatch })
        },

        /**底部对齐 */
        bottomAlignShapesAction: () => {
            dispatch({ type: 'bottomAlignShapesAction', dispatch })
        },
        adjustShapesMinAction: () => {
            dispatch({ type: 'adjustShapesMinAction', dispatch })
        },
        adjustShapesMaxAction: () => {
            dispatch({ type: 'adjustShapesMaxAction', dispatch })
        },

        /**触发图形变化 */
        triggerAlarmAction: (id) => {
            dispatch({ type: 'changeShapeFillAction', id, fill: 'rgba(255,255,0,1)', fontColor: 'rgba(0,0,0,1)' })
        },
        triggerNormalAction: id => {
            dispatch({ type: 'changeShapeFillAction', id, fill: 'none', fontColor: 'rgba(0,255,0,0.8)' })
        },
        triggerBusyAction: id => {
            dispatch({ type: 'changeShapeFillAction', id, fill: 'rgba(0,0,255,0.8)', fontColor: 'rgba(255,255,255,1)' })
        },
        /**更改图形外观 */
        changeShapeFillAction: (id, fill, fonColor) => {
            dispatch({ type: 'changeShapeFillAction', id, fill, fontColor })
        }
    };
}

function changeShapeFill(state, other) {
    let { shapes, ...nx } = state
    let { id, fill, fontColor } = other
    shapes = shapes.slice()
    let [changeShape] = shapes.filter(a => _unwrapper(a).id === id)

    if (changeShape) {
        let changeShapeUn = _unwrapper(changeShape)
        changeShapeUn.fill = fill
        let [txtshape] = shapes.filter(a => _unwrapper(a).id === changeShape.labelId)
        let untxtshape = _unwrapper(txtshape)
        untxtshape.fontColor = fontColor
    }
    return { shapes, ...nx }
}

function adjustShapesMax(state, other) {
    let { dispatch } = other
    let { shapes, selectedShapes, ...nx } = state
    if (selectedShapes.length <= 1)
        return state
    shapes = shapes.slice()
    selectedShapes = selectedShapes.slice();
    let maxR;
    /**最左边的点 */
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        let sidePoint = [shape.shape.cx + shape.shape.r, shape.shape.cy]
        let centerPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        sidePoint = ext.multiplyPoint(shape.shape.transform, sidePoint);
        let rx = vec2.dist(centerPoint, sidePoint)
        if (typeof maxR === 'undefined' || maxR < rx) {
            maxR = rx
        }
    });
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        let sidePoint = [shape.shape.cx + shape.shape.r, shape.shape.cy]
        let centerPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        sidePoint = ext.multiplyPoint(shape.shape.transform, sidePoint);
        let r = vec2.dist(centerPoint, sidePoint)
        let sc = maxR / r
        if (sc !== 1 && sc !== 0) {
            shape.shape.transform = ext.applyMatrix(shape.shape.transform, ext.scaleAt(centerPoint, [sc, sc]))
            sidePoint = ext.multiplyPoint(a.transform, [a.x + a.w / 2, a.y + a.h / 2])
            recalculateSelectedShape(a, shape)
            updateShapeAsync(dispatch, shape);
            /**文字标签 */
            let [labelShape] = shapes.filter(b => _unwrapper(b).id === shape.labelId)
            labelShape = _unwrapper(labelShape)
            labelShape.transform = ext.applyMatrix(labelShape.transform, ext.scaleAt(centerPoint, [sc, sc]))
        }

    })

    return { shapes, selectedShapes, ...nx }
}

function adjustShapesMin(state, other) {
    let { dispatch } = other
    let { shapes, selectedShapes, ...nx } = state
    if (selectedShapes.length <= 1)
        return state
    shapes = shapes.slice()
    selectedShapes = selectedShapes.slice();
    let maxR;
    /**最左边的点 */
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        let sidePoint = [shape.shape.cx + shape.shape.r, shape.shape.cy]
        let centerPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        sidePoint = ext.multiplyPoint(shape.shape.transform, sidePoint);
        let rx = vec2.dist(centerPoint, sidePoint)
        if (typeof maxR === 'undefined' || maxR > rx) {
            maxR = rx
        }
    });
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        let sidePoint = [shape.shape.cx + shape.shape.r, shape.shape.cy]
        let centerPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        sidePoint = ext.multiplyPoint(shape.shape.transform, sidePoint);
        let r = vec2.dist(centerPoint, sidePoint)
        let sc = maxR / r
        if (sc !== 1 && sc !== 0) {
            shape.shape.transform = ext.applyMatrix(shape.shape.transform, ext.scaleAt(centerPoint, [sc, sc]))
            sidePoint = ext.multiplyPoint(a.transform, [a.x + a.w / 2, a.y + a.h / 2])
            recalculateSelectedShape(a, shape)
            updateShapeAsync(dispatch, shape);
            /**文字标签 */
            let [labelShape] = shapes.filter(b => _unwrapper(b).id === shape.labelId)
            labelShape = _unwrapper(labelShape)
            labelShape.transform = ext.applyMatrix(labelShape.transform, ext.scaleAt(centerPoint, [sc, sc]))
        }

    })

    return { shapes, selectedShapes, ...nx }
}

function bottomAlignShapes(state, other) {
    let { dispatch } = other
    let { shapes, selectedShapes, ...nx } = state
    if (selectedShapes.length <= 1)
        return state
    shapes = shapes.slice()
    selectedShapes = selectedShapes.slice();
    let leftPoint;
    /**最左边的点 */
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        if (typeof leftPoint === 'undefined' || leftPoint[1] < realPoint[1]) {
            leftPoint = realPoint
        }
    });
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        let dx = leftPoint[1] - realPoint[1]
        shape.shape.transform = ext.applyMatrix(shape.shape.transform, mat2d.fromTranslation([], [0, dx]))
        a.transform = ext.applyMatrix(a.transform, mat2d.fromTranslation([], [0, dx]))

        updateShapeAsync(dispatch, shape);
        /**文字标签 */
        let [labelShape] = shapes.filter(b => _unwrapper(b).id === shape.labelId)
        labelShape = _unwrapper(labelShape)
        labelShape.transform = ext.applyMatrix(labelShape.transform, mat2d.fromTranslation([], [0, dx]))

    })

    return { shapes, selectedShapes, ...nx }
}

function topAlignShapes(state, other) {
    let { dispatch } = other
    let { shapes, selectedShapes, ...nx } = state
    if (selectedShapes.length <= 1)
        return state
    shapes = shapes.slice()
    selectedShapes = selectedShapes.slice();
    let leftPoint;
    /**最左边的点 */
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        if (typeof leftPoint === 'undefined' || leftPoint[1] > realPoint[1]) {
            leftPoint = realPoint
        }
    });
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        let dx = leftPoint[1] - realPoint[1]
        shape.shape.transform = ext.applyMatrix(shape.shape.transform, mat2d.fromTranslation([], [0, dx]))
        a.transform = ext.applyMatrix(a.transform, mat2d.fromTranslation([], [0, dx]))
        updateShapeAsync(dispatch, shape);
        /**文字标签 */
        let [labelShape] = shapes.filter(b => _unwrapper(b).id === shape.labelId)
        labelShape = _unwrapper(labelShape)
        labelShape.transform = ext.applyMatrix(labelShape.transform, mat2d.fromTranslation([], [0, dx]))

    })

    return { shapes, selectedShapes, ...nx }
}

function rightAlignShapes(state, other) {
    let { dispatch } = other
    let { shapes, selectedShapes, ...nx } = state
    if (selectedShapes.length <= 1)
        return state
    shapes = shapes.slice()
    selectedShapes = selectedShapes.slice();
    let leftPoint;
    /**最左边的点 */
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        if (typeof leftPoint === 'undefined' || leftPoint[0] < realPoint[0]) {
            leftPoint = realPoint
        }
    });
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        let dx = leftPoint[0] - realPoint[0]
        shape.shape.transform = ext.applyMatrix(shape.shape.transform, mat2d.fromTranslation([], [dx, 0]))
        a.transform = ext.applyMatrix(a.transform, mat2d.fromTranslation([], [dx, 0]))
        updateShapeAsync(dispatch, shape);
        /**文字标签 */
        let [labelShape] = shapes.filter(b => _unwrapper(b).id === shape.labelId)
        labelShape = _unwrapper(labelShape)
        labelShape.transform = ext.applyMatrix(labelShape.transform, mat2d.fromTranslation([], [dx, 0]))

    })

    return { shapes, selectedShapes, ...nx }
}

/**左对齐，先调整 */
function leftAlignShapes(state, other) {
    let { dispatch } = other
    let { shapes, selectedShapes, ...nx } = state
    if (selectedShapes.length <= 1)
        return state
    shapes = shapes.slice()
    selectedShapes = selectedShapes.slice();
    let leftPoint;
    /**最左边的点 */
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        if (typeof leftPoint === 'undefined' || leftPoint[0] > realPoint[0]) {
            leftPoint = realPoint
        }
    });
    selectedShapes.forEach(a => {
        let { shape } = a;
        let realPoint = [shape.shape.cx, shape.shape.cy];
        realPoint = ext.multiplyPoint(shape.shape.transform, realPoint);
        let dx = leftPoint[0] - realPoint[0]
        shape.shape.transform = ext.applyMatrix(shape.shape.transform, mat2d.fromTranslation([], [dx, 0]))
        a.transform = ext.applyMatrix(a.transform, mat2d.fromTranslation([], [dx, 0]))
        updateShapeAsync(dispatch, shape);
        /**文字标签 */
        let [labelShape] = shapes.filter(b => _unwrapper(b).id === shape.labelId)
        labelShape = _unwrapper(labelShape)
        labelShape.transform = ext.applyMatrix(labelShape.transform, mat2d.fromTranslation([], [dx, 0]))

    })

    return { shapes, selectedShapes, ...nx }
}

/**设置偏移量 */
function setTextDxy(state, other) {
    let { id, center } = other

    let { shapes, scale, ...nx } = state
    shapes = shapes.slice();
    center = screenPointToMap([center.x + center.w / 2, center.y + center.h / 2], scale);
    let [curTxt] = shapes.filter(a => _unwrapper(a).id === id)
    let [txt, parentId] = id.split('_');
    let [parent] = shapes.filter(a => _unwrapper(a).id === parentId)
    parent = _unwrapper(parent)
    curTxt = _unwrapper(curTxt)
    let cur = ext.multiplyPoint(parent.transform, [parent.cx, parent.cy]);
    let dx = cur[0] - center[0]
    let dy = cur[1] - center[1]
    /**缩放 */
    let dis = parent.transform[0]
    let sc = ext.scaleAt(center, [dis, dis])
    curTxt.transform = ext.applyMatrix(sc, mat2d.fromTranslation([], [dx, dy]))

    return { shapes, scale, ...nx };
}

/**删除选中图形 */
function deleteSelectedShapesAsync(dispatch, ids) {
    ids.forEach(id => {
        removeShapeAsync(dispatch, id)
    })
}

/**删除单个图形 */
function removeShapeAsync(dispatch, id) {
    fetch('/road/deleteshape', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify({ roadId: id }),
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
            dispatch({ type: 'removeShapeAction', id });
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message })
        })
}

function updateShapeAsync(dispatch, shape) {
    let storeShape = Object.assign({}, _unwrapper(shape));
    delete storeShape.name
    fetch('/road/updateshape', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify({ shape: storeShape }),
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
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message })
        })
}

function loadShapesAsync(dispatch, roadId, isMon) {
    fetch('/road/queryroad',
        {
            headers: { 'Content-Type': 'application/json' },
            method: 'post',
            body: JSON.stringify({ roadId: roadId, isMon: isMon }),
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
            return d.data
        })
        .map(r => {
            return fetch('/road/queryroadname', { credentials: 'include', method: 'post', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ roadId: r.id }) })
                .then(r => {
                    if (r.status >= 200 && r.status < 300) {
                        return r.json()
                    }
                    throw new Error(r.statusText);
                })
                .then(rs => {
                    if (rs.code !== 0) {
                        throw new Error(rs.msg)
                    }
                    let [ret] = rs.data
                    r.name = ret.name
                    return r
                })
        })
        .then(rs => {
            dispatch({ type: 'appendShapesAction', data: rs });
            if (isMon) {
                /**加载配置 */
                return fetch(
                    '/road/querymonconfig',
                    {
                        method: 'post',
                        headers: { 'content-type': 'application/json' },
                        credentials: 'include'
                    })
                    .then(r => {
                        if (r.status >= 200 && r.status < 300) {
                            return r.json()
                        }
                        throw new Error(r.statusText);
                    })
                    .then(r => {
                        /**数据结构
                         * id,name,va1,va2,va3
                         */
                        let tbl = [];
                        rs.forEach(a => {
                            let item = { guid: a.id, name: a.name, value: {} };
                            r.forEach(b => {
                                if (b['enabled']) {
                                    item.value[b.id] = 0;
                                }
                            })
                            tbl.push(item);
                        });
                        console.log(r)
                        dispatch({ type: 'setMonListAction', body: tbl, header: r });
                    })
            }
        })
        .then(() => {
            /**加载图形完毕 */
            dispatch({ type: 'didLoadShapesAction' })
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message })
        })
}
function updateMonList(state, other) {
    let { guid, data } = other;
    let { monlist, ...nx } = state;
    if (monlist) {
        monlist.body.forEach(a => {
            if (a['guid'] === guid) {
                monlist.header.forEach(b => {
                    if (b['enabled']) {
                        let cn = parseFloat(data[b.id]);
                        let cv = isNaN(cn) ? 0 : cn;
                        if (b['isAcc']) {
                            a.value[b.id] += cv;
                        } else {
                            a.value[b.id] = cv;
                        }
                    }
                })
            }
        })
    }
    return { monlist, ...nx };
}
function setMonList(state, other) {
    let { body, header } = other;
    let { monlist, ...nx } = state;
    if (Array.isArray(body)) {
        body.sort((a, b) => {
            let x1 = parseInt(a['name'])
            let x2 = parseInt(b['name'])
            if (isNaN(x1) || isNaN(x2)) {
                return 0;
            } else {
                return x1 - x2;
            }
        })
    }
    monlist = { header, body };
    return { monlist, ...nx };
}

/**拖放绘制图形*/

function dropDrawShapesAsync(dispatch, roadId, items, point) {
    let obj = [];
    let x = point[0];
    let y = point[1];
    for (let i = 0; i < items.length; i++) {
        let cur = items[i];
        let r = 10;
        let shape = _createCircle(x, y + i * 2.5 * r, r, cur.id);
        obj.push({ roadId: cur.id, parentId: roadId, shape: _unwrapper(shape) });
    }
    fetch('/road/recordshapes', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify({ data: obj }),
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
            return d.data
        })
        .map(r => {
            return fetch('/road/queryroadname', { credentials: 'include', method: 'post', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ roadId: r.id }) })
                .then(r => {
                    if (r.status >= 200 && r.status < 300) {
                        return r.json()
                    }
                    throw new Error(r.statusText);
                })
                .then(rs => {
                    if (rs.code !== 0) {
                        throw new Error(rs.msg)
                    }
                    let [ret] = rs.data
                    r.name = ret.name
                    return r
                })
        })
        .then(r => {
            dispatch({ type: 'appendShapesAction', data: r })
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message })
        })
}

function appendShapes(state, other) {
    let { data } = other;
    let { shapes, ...nx } = state;
    shapes = shapes.slice();
    data.forEach(a => {
        if (!a)
            return;
        let wobj = _wrapper(a);
        shapes.push(wobj);
        if (a.type === 'circle') {
            wobj.labelId = 'text_' + a.id
            let realPoint = ext.multiplyPoint(a.transform, [a.cx, a.cy]);
            let txt = _createText(realPoint[0], realPoint[1], a.name, wobj.labelId);
            shapes.push(txt)
        }
    });
    return { shapes, ...nx };

}


function setImagUrlAsync(dispatch, url, roadId) {
    fetch('/road/updateimgurl', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify({ imgUrl: url, roadId: roadId }),
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
            let img = document.createElement('img');
            img.src = url;
            img.onload = () => {
                if (img.naturalHeight) {
                    dispatch({ type: 'setImagUrlEndAction', w: img.naturalWidth, h: img.naturalHeight, url, id: roadId })
                    /**调整图形为正中心s */
                    dispatch({ type: 'moveToCenterAction', picture: { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight } })
                }
            };
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message })
        })
}

function setImgUrlEnd(state, other) {
    /**此ID为roadId */
    let { url, id, w, h } = other;
    let { roadImgUrl, shapes, ...nx } = state;
    roadImgUrl = url;
    shapes = shapes.filter(a => _unwrapper(a).id !== id);
    shapes.unshift(_createImg(0, 0, url, id, w, h));
    return { roadImgUrl, shapes, ...nx };
}


function getImgUrlAsync(dispatch, roadId, isMon) {
    fetch('/road/getimgurl', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify({ roadId: roadId }),
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
            if (d.data.imgUrl) {
                let img = document.createElement('img');
                img.src = d.data.imgUrl;
                img.onload = () => {
                    if (img.naturalHeight) {
                        dispatch({ type: 'setImagUrlEndAction', w: img.naturalWidth, h: img.naturalHeight, url: d.data.imgUrl, id: d.data.roadId })
                        let picture = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight }
                        /**调整背景图至中心 */
                        dispatch({ type: 'moveToCenterAction', picture });
                        /**加载图形 */
                        loadShapesAsync(dispatch, roadId, isMon);
                    }
                };
            } else {
                /**加载图形 */
                loadShapesAsync(dispatch, roadId, isMon);
            }
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message })
        })
}

/** */
function createRoadAsync(dispatch, roadId, isMon) {
    fetch('/road/recordimgurl', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify({ roadId: roadId }),
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
            let roadId = d.data.roadId;
            dispatch({ type: 'setRoadIdAction', id: roadId });
            getImgUrlAsync(dispatch, roadId, isMon);

        })
        .catch(e => {
            console.log('createRoadAsync ', e)
            dispatch({ type: 'setFailtAction', msg: e.message })
        });
}


function setRoadId(state, other) {
    let { id } = other;
    let init = initStore(state)
    init.roadId = id;
    return { ...init }
}

function moveToCenter(state, other) {
    let { picture } = other
    let { mapinfo, mapXY, scale, ...nx } = state
    /**这时为初始状态 */
    let w = mapinfo[2]
    let h = mapinfo[3]
    let pw = picture.w
    let ph = picture.h
    let sx = w / pw
    let sy = h / ph
    /**计算方式:
     *  覆盖全部内容 
     */
    scale = mat2d.fromTranslation([], [(w - pw) / 2, (h - ph) / 2])
    scale = ext.applyMatrix(scale, ext.scaleAt([w / 2, h / 2], sx > sy ? [sx, sx] : [sy, sy]))
    mapXY = scale[0]
    return { mapinfo, scale, mapXY, ...nx }
}

/**初始化 */
function initStore(state) {
    let nmapinfo = [0, 0, 0, 0]
    if (state) {
        let { mapinfo } = state
        nmapinfo = mapinfo
    }
    return {
        monlist: null,
        loadedShapes: false,
        roadId: '',
        roadImgUrl: [],
        shapes: [],
        mapXY: 1,
        scale: [1, 0, 0, 1, 0, 0],
        isMoving: false,
        /** x y w h */
        mapinfo: nmapinfo,
        selectedShapes: []
    };
}

/** */
function _createCircle(x, y, r, id) {
    return _wrapper({ type: 'circle', id: id, cx: x, cy: y, r: r, transform: [1, 0, 0, 1, 0, 0] });
}
function _createText(x, y, txt, id) {
    return _wrapper({ id, dx: 0, dy: 0, type: 'text', x: x, y: y, dx: 0, dy: 0, transform: [1, 0, 0, 1, 0, 0], txt: txt })
}

function _createImg(x, y, url, id, w, h) {
    return _wrapper({ type: 'img', x, y, width: w, height: h, url, id });
}

export function _wrapper(shape) {
    return { shape }
}
export function _unwrapper(item) {
    return item.shape;
}

/**删除图形*/

function removeShape(state, other) {
    let { id } = other;
    let {
        mover,
        selectedShapes,
        shapes,
        ...next
    } = state;
    let [willDeleteShape] = shapes.filter(a => _unwrapper(a).id === id)
    selectedShapes = selectedShapes.filter(a => a.id !== id)
    shapes = shapes.filter(a => _unwrapper(a).id !== id && _unwrapper(a).id !== willDeleteShape.labelId);
    let ret = {
        shapes,
        selectedShapes,
        ...next
    };
    return ret;
}

function recalculateSelectedShape(target, sp) {
    let usp = _unwrapper(sp)
    let tran = usp.transform;
    let ncp = ext.multiplyPoint(tran, [usp.cx, usp.cy]);
    let cp = ext.multiplyPoint(tran, [
        usp.cx + usp.r,
        usp.cy + usp.r
    ]);
    let dis = vec2.dist(ncp, cp);
    target.x = ncp[0]
    target.y = ncp[1]
    target.w = dis
    target.h = dis
    target.transform = [1, 0, 0, 1, 0, 0]
}

function takeSelectedShape(sp) {
    let usp = _unwrapper(sp)
    let tran = usp.transform;
    let ncp = ext.multiplyPoint(tran, [usp.cx, usp.cy]);
    let cp = ext.multiplyPoint(tran, [
        usp.cx + usp.r,
        usp.cy + usp.r
    ]);
    let dis = vec2.dist(ncp, cp);
    let p = {
        id: usp.id,
        shape: sp,
        x: ncp[0],
        y: ncp[1],
        w: dis,
        h: dis,
        transform: [1, 0, 0, 1, 0, 0]
    };
    return p;
}

/*** 选择图元 */
function clickShape(state, other) {
    let {
        shapes,
        selectedShapes,
        ...nx
    } = state;
    let { id } = other;
    let [shape] = shapes.filter(a => id === _unwrapper(a).id);
    let isSelected = false
    selectedShapes.forEach(a => {
        if (a.id === id) {
            isSelected = true;
        }
    });
    if (!isSelected) {
        selectedShapes = selectedShapes.slice();
        selectedShapes.push(takeSelectedShape(shape))
    } else {
        selectedShapes = selectedShapes.filter(a => a.id !== id)
    }
    return {
        ...nx,
        selectedShapes,
        shapes
    }
}

/**全选 */
function selectAllShapes(state, other) {
    let {
        shapes,
        selectedShapes,
        ...nx
    } = state;
    selectedShapes = [];
    shapes.map(a => {
        if (_unwrapper(a).type === 'circle')
            selectedShapes.push(takeSelectedShape(a))
    });

    return {
        ...nx,
        selectedShapes,
        shapes
    }
}

/**取消选择 */
function cancleSelectAllShapes(state, other) {
    let {
        shapes,
        selectedShapes,
        ...nx
    } = state;
    selectedShapes = [];
    return {
        ...nx,
        selectedShapes,
        shapes
    }
}



/**映射尺寸 */
function mapSize(state, other) {
    let {
        mapinfo,
        ...nx
    } = state;
    let { point } = other
    mapinfo = point
    return {
        ...nx,
        mapinfo
    }
}

/**移动器 */
function beginMoving(state, other) {
    let {
        isMoving,
        ...param
    } = state;
    let { point } = other;
    isMoving = true;
    return {
        isMoving,
        lastPoint: point,
        ...param
    };
}
function moving(state, other) {
    let {
        isMoving,
        scale,
        lastPoint,
        ...param
    } = state;
    let { point } = other;

    if (isMoving) {
        let offset = vec2.sub([], point, lastPoint);
        offset[0] = offset[0] / scale[0];
        offset[1] = offset[1] / scale[3];

        let newScale = mat2d.translate([], scale, offset);
        return {
            lastPoint: point,
            isMoving,
            scale: newScale,
            ...param
        };
    } else {
        return {
            isMoving,
            scale,
            ...param
        };
    }
}
function endMoving(state, other) {
    let {
        isMoving,
        lastPoint,
        ...param
    } = state;
    isMoving = false;
    return {
        isMoving,
        ...param
    }
}

/**屏幕坐标转换成地图坐标 */
function screenPointToMap(p, m) {
    return vec2.transformMat2d([], p, mat2d.invert([], m));
}

/**地图坐标转屏幕坐标 */
function mapPointToScreen(p, m) {
    return vec2.transformMat2d([], p, m);
}

/**
 * 缩放
 * @param {*} state
 * @param {*} other
 */
function scaleGroup(state, other) {
    let {
        mapXY,
        scale,
        ...param
    } = state;
    let { deltaY, point } = other;
    let xy = deltaY > 0
        ? Math.pow(1.2, -1)
        : Math.pow(1.2, 1);
    mapXY *= xy;
    let newScale = scale.map((a, i) => {
        return (i == 0 || i == 3)
            ? mapXY
            : a
    });
    let rp = screenPointToMap(point, scale);
    let dx = point[0] - rp[0] * mapXY;
    let dy = point[1] - rp[1] * mapXY;
    newScale = [
        mapXY,
        0,
        0,
        mapXY,
        dx,
        dy
    ];
    return {
        mapXY,
        ...param,
        scale: newScale
    };
}

/*** 平移调整 */
function moverMoving(state, other) {
    let { offset, id } = other;
    let {
        shapes,
        selectedShapes,
        mapXY,
        ...param
    } = state;
    offset[0] /= mapXY;
    offset[1] /= mapXY;
    //平移自身
    selectedShapes = selectedShapes.slice();
    let [sel] = selectedShapes.filter(a => a.id === id)
    let nt = sel.transform;
    nt[4] += offset[0];
    nt[5] += offset[1];

    //目标偏移
    shapes = shapes.slice();
    let [selShape] = shapes.filter(sp => _unwrapper(sp).id === id);
    //文字调整
    let [txtShape] = shapes.filter(sp => _unwrapper(sp).id == selShape.labelId)
    let txtShapeTran = _unwrapper(txtShape);
    txtShapeTran.transform[4] += offset[0];
    txtShapeTran.transform[5] += offset[1];
    //图形调整
    let uselShape = _unwrapper(selShape)
    uselShape.transform[4] += offset[0];
    uselShape.transform[5] += offset[1];
    sel.shape = selShape;
    return {
        shapes,
        selectedShapes,
        mapXY,
        ...param
    };
}

/**调整图形尺寸 */
function moverAdjustSize(state, other) {
    let { lastPoint, currentPoint, offset, id } = other;
    let {
        shapes,
        selectedShapes,
        scale,
        mapXY,
        ...param
    } = state;

    offset[0] /= mapXY;
    offset[1] /= mapXY;
    //调整自身偏移
    selectedShapes = selectedShapes.slice();
    let [currentSelected] = selectedShapes.filter(a => a.id === id)
    let selTran = currentSelected.transform;
    selTran[4] += offset[0];
    selTran[5] += offset[1];


    //图形缩放
    shapes = shapes.slice();
    let [willAdjustShape] = shapes.filter(a => _unwrapper(a).id === id);
    let [willAdjustTxtShape] = shapes.filter(a => _unwrapper(a).id == willAdjustShape.labelId)
    let usel = _unwrapper(willAdjustShape);
    let tp = ext.multiplyPoint(usel.transform, [usel.cx, usel.cy]);
    let cp = screenPointToMap(lastPoint, scale);
    let lp = screenPointToMap(currentPoint, scale);
    let dis = vec2.dist(tp, lp) / vec2.dist(tp, cp);
    let ntran = ext.applyMatrix(usel.transform, ext.scaleAt(tp, [dis, dis]));
    let unWillAdjustTxtShape = _unwrapper(willAdjustTxtShape);
    unWillAdjustTxtShape.transform = ext.applyMatrix(unWillAdjustTxtShape.transform, ext.scaleAt(tp, [dis, dis]));
    usel.transform = ntran;
    currentSelected.shape = willAdjustShape;
    //调整自身缩放
    currentSelected.transform = ext.applyMatrix(currentSelected.transform, ext.scaleAt(lp, [dis, dis]));

    return {
        selectedShapes,
        shapes,
        scale,
        mapXY,
        ...param
    };
}

/**修改图形名称 */
function updateShapeName(state, other) {
    let { shapes, ...nx } = state
    let { id, name } = other
    shapes = shapes.slice()
    let [txtShape] = shapes.filter(a => _unwrapper(a).id === ('text_' + id))
    if (txtShape) {
        _unwrapper(txtShape).txt = name
    }
    return { shapes, ...nx }
}

/**图形加载完毕 */
function didLoadShapes(state, other) {
    let { loadedShapes, ...nx } = state;
    return { loadedShapes: true, ...nx }
}


export default function svgReducer(state, action) {
    let {
        type,
        ...other
    } = action;
    switch (type) {
        case 'updateMonListAction':
            return updateMonList(state, other);
        case 'setMonListAction':
            return setMonList(state, other);
        /**加载图形完毕 */
        case 'didLoadShapesAction':
            return didLoadShapes(state, other);
        case 'changeShapeFillAction':
            return changeShapeFill(state, other)
        case 'updateShapeNameAction':
            return updateShapeName(state, other)
        case 'moveToCenterAction':
            return moveToCenter(state, other)
        case 'adjustShapesMinAction':
            return adjustShapesMin(state, other)
        case 'adjustShapesMaxAction':
            return adjustShapesMax(state, other)
        case 'bottomAlignShapesAction':
            return bottomAlignShapes(state, other)
        case 'topAlignShapesAction':
            return topAlignShapes(state, other)
        case 'rightAlignShapesAction':
            return rightAlignShapes(state, action);
        case 'leftAlignShapesAction':
            return leftAlignShapes(state, other);
        case 'cancleSelectAllShapesAction':
            return cancleSelectAllShapes(state, other);
        case 'selectAllShapesAction':
            return selectAllShapes(state, other);
        case 'setTextDxyAction':
            return setTextDxy(state, other);
        case 'appendShapesAction':
            return appendShapes(state, other);
        case 'setImagUrlEndAction':
            return setImgUrlEnd(state, other);
        case 'setRoadIdAction':
            return setRoadId(state, other);
        case 'recordImgBeginAction':
            return state;
        case 'createShapeAction':
            return createShape(state, other);
        case 'removeShapeAction':
            return removeShape(state, other);
        case 'scaleGroupAction':
            return scaleGroup(state, other);
        case 'beginMovingAction':
            return beginMoving(state, other);
        case 'movingAction':
            return moving(state, other);
        case 'endMovingAction':
            return endMoving(state, other);
        case 'mapSizeAction':
            return mapSize(state, other);
        case 'clickShapeAction':
            return clickShape(state, other);
        case 'moverBeginAction':
            //console.log('开始调整');
            return state;
        case 'moverMovingAction':
            return moverMoving(state, other);
        case 'moverAdjustSizeAction':
            return moverAdjustSize(state, other);
        case 'initSvgAction':
            return initStore(state);
        default:
            return typeof state === 'undefined'
                ? initStore()
                : state;
    }
}