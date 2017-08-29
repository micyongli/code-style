
function initStore() {
    return {
        treeNodes: [],
        selectedNodes: [],
        /**选择子结点下的车检器 */
        selectedSw: [],
        beginLoad: false,
        endLoad: false,
        /**异常信息*/
        failtMsg: '',
        isFailt: false,
        /**拖放 */
        dragNode: null,
        dragAccepted: false,
        dragNodeData: null,

        /**道路Id */
        roadId: '',
        roadPath: ''
    };
}
/**
 *映射
 */
export function mapProps(state) {
    let { treeReducer, ...nx } = state;
    return { ...state };
}

/**
 *
 * @param {*} dispatch
 */
export function mapDispatch(dispatch) {
    return {
        fetchTreeAction: (url) => {
            dispatch({ type: 'initTreeAction' })
            dispatch({ type: 'fetchTreeBeginAction' });
            fetchTreeDataAsync(dispatch, url);
        },
        updateTreeNodeAction: (url, data, cb) => {
            dispatch({ type: 'updateTreeNodeBeginAction' });
            updateTreeNodeAsync(dispatch, url, data, cb);
        },
        deleteTreeNodeAction: (url, data, cb) => {
            dispatch({ type: 'deleteTreeNodeBeginAction' });
            deleteTreeNodeAsync(dispatch, url, data, cb);
        },
        addTreeNodeAction: (url, data, cb) => {
            dispatch({ type: 'addTreeNodeBeginAction' });
            addTreeNodeAsync(dispatch, url, data, cb);
        },
        selectTreeNodeAction: item => {
            dispatch({ type: 'selectTreeNodeAction', item });
        },
        searchExpandTreeAction: id => {
            //console.log('search action')
            dispatch({ type: 'searchExpandTreeAction', id });
            dispatch({ type: 'getRoadIdAction' });
        },
        expandTreeNodeAction: id => {
            dispatch({ type: 'expandTreeNodeAction', id });
            dispatch({ type: 'getRoadIdAction' });
        },
        resetFailtAction: () => {
            dispatch({ type: 'resetFailtAction' });
        },
        setFailtAction: (msg) => {
            dispatch({ type: 'setFailtAction', msg });
        },

        /**
         * 拖放操作
         */
        dragNodeBeginAction: (node, data) => {
            dispatch({ type: 'dragNodeBeginAction', node, data });
        },
        drapNodeEndAction: () => {
            dispatch({ type: 'drapNodeEndAction' })
        },
        dragNodeSetEffectAction: (accepted) => {
            dispatch({ type: 'dragNodeSetEffectAction', accepted })
        },

        /**获取真实的道路ID */
        getRoadIdAction: () => {
            dispatch({ type: 'getRoadIdAction' });
        },
        initTreeAction: () => {

            dispatch({ type: 'initTreeAction' })
        }
    };
}

function addTreeNodeAsync(dispatch, url, data, cb) {
    fetch(url,
        {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then(r => {
            if (r.status >= 200 && r.status < 300) {
                return r.json();
            }
            throw new Error('service failt');
        })
        .then(d => {
            if (d.code !== 0) {
                throw new Error(d.msg);
            }
            dispatch({ type: 'addTreeNodeEndAction', data: d.data, cb });
            dispatch({ type: 'getRoadIdAction' });
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message });
        });
}

function fetchTreeDataAsync(dispatch, url) {
    fetch(url,
        {
            headers: { 'Content-Type': 'application/json' },
            method: 'post',
            credentials: 'include'
        }
    )
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
            let data = d.data;
            dispatch({ type: 'fetchTreeEndAction', data });
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message });
        });
}

function updateTreeNodeAsync(dispatch, url, data, cb) {
    fetch(url,
        {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then(r => {
            if (r.status >= 200 && r.status < 300) {
                return r.json();
            }
            throw new Error(r.statusText);
        })
        .then(d => {
            if (d.code !== 0) {
                throw new Error(d.msg);
            }
            dispatch({ type: 'updateTreeNodeSuccessAction', data: d.data, cb });
            dispatch({ type: 'getRoadIdAction' });
            /**直接更新 */
            dispatch({ type: 'updateShapeNameAction', id: d.data.id, name: d.data.name })
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message });
        });
}

function deleteTreeNodeAsync(dispatch, url, data, cb) {

    fetch(url,
        {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: data }),
            credentials: 'include'
        })
        .then(r => {
            if (r.status >= 200 && r.status < 300) {
                return r.json();
            }
            throw new Error('service failt');
        })
        .then(d => {
            if (d.code !== 0) {
                throw new Error(d.msg);
            }
            dispatch({ type: 'deleteTreeNodeEndAction', data, cb });
            dispatch({ type: 'getRoadIdAction' });
        })
        .catch(e => {
            dispatch({ type: 'setFailtAction', msg: e.message });

        });
}

function deleteTreeNodeEnd(state, other) {
    let { cb, data } = other;
    let { treeNodes, selectedNodes, ...nx } = state;
    cb();
    let nt = [];
    delCloneTree(treeNodes, nt, data, null);
    return { treeNodes: nt, selectedNodes: [], ...nx };
}


function addTreeNodeEnd(state, other) {
    let { treeNodes, selectedNodes, ...nx } = state;
    let { data, cb } = other;
    cb();
    let nt = [];
    addCloneTree(treeNodes, nt, data, null);
    /**特殊处理 */
    if (getParent(data) === 'rootNode') {
        nt.push(makeNode(data, null));
    }
    /***根排序 */
    return { treeNodes: nt, selectedNodes, ...nx };
}



/**树的操作--开始 */

/**获取指定类型的子结点 */
function getSwi(root, type, rt) {
    let tp = getType(root);
    if (tp.toString() === type.toString()) {
        rt.push(root);
    }
    for (let x = 0; x < root.children.length; x++) {
        let cur = root.children[x];
        getSwi(cur, type, rt);
    }
}

/**
 * 形如
 *      att1
 *      att2
 *      children:[]
 */

function createTree(data) {
    let rs = _getRoot(data, 'rootNode');
    _loopFindChildren(rs, data);
    return rs;
}

function findNode(tree, id, rt) {
    let rs = tree;
    for (let x = 0; x < rs.length; x++) {
        let cur = rs[x];
        if (getKey(cur) === id) {
            rt.push(cur);
            return;
        }
        findNode(cur.children, id, rt);
    }
}

function getPath(node, rt) {
    if (node) {
        getPath(node.parentNode, rt);
        rt.push(node);
    }
}

function delCloneTree(tree, newTree, ids, parentNode) {
    let c = tree;
    for (let x = 0; x < c.length; x++) {
        let cur = c[x];
        if (ids.indexOf(getKey(cur)) >= 0) {
            continue;
        }
        let nn = makeNode(cur.data, parentNode);
        newTree.push(nn);
        nn.expand = cur.expand;
        delCloneTree(cur.children, nn.children, ids, cur);
    }
}

function addCloneTree(tree, newTree, item, parentNode) {
    let c = tree;
    for (let x = 0; x < c.length; x++) {
        let cur = c[x];
        newTree[x] = makeNode(cur.data, parentNode);
        newTree[x].expand = cur.expand;
        if (getKey(cur) === getParent(item)) {
            cur.children.push(makeNode(item, cur));
        }
        addCloneTree(cur.children, newTree[x].children, item, cur);
    }
}

function cloneTree(tree, newTree, item, parentNode) {
    let c = tree;
    for (let x = 0; x < c.length; x++) {
        let cur = c[x];
        if (getKey(cur) === getKey(item)) {
            newTree[x] = makeNode(item, parentNode);
            newTree[x].expand = cur.expand;
        } else {
            newTree[x] = makeNode(cur.data, parentNode);
            newTree[x].expand = cur.expand;
        }
        cloneTree(cur.children, newTree[x].children, item, newTree[x]);
    }
}

function _expandTreeNode(tree, newTree, items, parentNode, newSelect) {
    let c = tree;
    for (let x = 0; x < c.length; x++) {
        let cur = c[x];
        newTree[x] = makeNode(cur.data, parentNode);
        let ix = items.indexOf(cur);
        if (ix >= 0) {
            newTree[x].expand = true;
            if ((ix + 1) === items.length) {
                newSelect.push(newTree[x]);
            }
        } else {
            newTree[x].expand = cur.expand;
        }
        _expandTreeNode(cur.children, newTree[x].children, items, newTree[x], newSelect);
    }
}

function _expandTreeNode2(tree, newTree, items, parentNode) {
    let c = tree;
    for (let x = 0; x < c.length; x++) {
        let cur = c[x];
        newTree[x] = makeNode(cur.data, parentNode);
        let ix = items.indexOf(cur);
        if (ix >= 0) {
            newTree[x].expand = !cur.expand;
        } else {
            newTree[x].expand = cur.expand;
        }
        _expandTreeNode2(cur.children, newTree[x].children, items, newTree[x]);
    }
}

function _loopFindChildren(root, data) {
    for (let x = 0; x < root.length; x++) {
        let c = _findChildren(root[x], data);
        if (c.length > 0)
            _loopFindChildren(c, data);
    }
}

function _findChildren(root, data) {
    let searchKey = root.id;
    let findResult = [];
    for (let x = 0; x < data.length; x++) {
        let cur = data[x];
        if (searchKey === getParent(cur)) {
            findResult.push(makeNode(cur, root));
        }
    }
    /**特殊处理排序 */
    if (findResult.length > 0 && findResult[0].type === 2) {
        findResult.sort((a, b) => {
            let av = parseInt(a.value);
            let bv = parseInt(b.value);
            return av > bv ? 1 : (av < bv ? -1 : 0);
        });
    }
    root.children = findResult;
    return findResult;
}

function _getRoot(data, rootId) {
    let rs = [];
    for (let x = 0; x < data.length; x++) {
        let cur = data[x];
        if (getParent(cur) === rootId) {
            rs.push(makeNode(cur));
        }
    }
    return rs;
}

function makeNode(item, parentNode) {
    return {
        id: getKey(item),
        value: getValue(item),
        parent: getParent(item),
        type: item.type,
        expand: false,
        children: [],
        parentNode: parentNode,
        data: item
    };
}

function getKey(item) {
    return item.id;
}
function getValue(item) {
    return item.name;
}
function getParent(item) {
    return item.parent;
}
function getType(item) {
    return item.type;
}

/**树操作结束 */


function fetchTreeBegin(state, other) {
    let { beginLoad, ...nx } = state;
    return { ...nx, beginLoad: true };
}

function fetchTreeEnd(state, other) {
    let { data } = other;
    let { beginLoad, endLoad, roadId, roadPath, treeNodes, selectedNodes, ...nx } = state;
    return { roadPath: '', roadPath: '', beginLoad: false, endLoad: true, treeNodes: createTree(data), selectedNodes: [], ...nx };
}

function selectTreeNode(state, other) {
    let { selectedNodes, selectedSw, ...nx } = state;
    let { item } = other;
    selectedSw = [];
    /**选择车检器 */
    getSwi(item, '2', selectedSw);
    return { ...nx, selectedSw, selectedNodes: [item] };
}

function updateTreeNodeSuccess(state, other) {
    let { data, cb } = other;
    let { treeNodes, selectedNodes, ...nx } = state;
    cb();
    let newTree = [];
    cloneTree(treeNodes, newTree, data);
    if (selectedNodes.length > 0) {
        let selNodes = [];
        findNode(newTree, getKey(selectedNodes[0]), selNodes);
        selectedNodes = selNodes;
    }
    return { treeNodes: newTree, selectedNodes, ...nx };
}

function searchExpandTree(state, other) {
    let { id } = other;
    let { treeNodes, selectedSw, selectedNodes, ...nx } = state;
    let fr = [];
    findNode(treeNodes, id, fr);
    if (fr.length > 0) {
        let path = [];
        getPath(fr[0], path);
        let newTreeNodes = [];
        let newSels = [];
        _expandTreeNode(treeNodes, newTreeNodes, path, null, newSels);
        treeNodes = newTreeNodes;
        selectedNodes = newSels;
    }
    if (selectedNodes.length > 0) {
        let item = selectedNodes[0]
        selectedSw = [];
        /**选择车检器 */
        getSwi(item, '2', selectedSw);
    }


    return { treeNodes, selectedSw, selectedNodes, ...nx };
}

function expandTreeNode(state, other) {
    let { id } = other;
    let { treeNodes, selectedNodes, ...nx } = state;
    let fr = [];
    findNode(treeNodes, id, fr);
    if (fr.length > 0) {
        let newTreeNodes = [];
        _expandTreeNode2(treeNodes, newTreeNodes, fr, null);
        treeNodes = newTreeNodes;
    }
    return { treeNodes, selectedNodes: [], ...nx };

}

function resetFailt(state, other) {
    let { isFailt, failtMsg, ...nx } = state;
    return { isFailt: false, failtMsg: '', ...nx };
}
function setFailt(state, other) {
    let { msg } = other;
    let { isFailt, failtMsg, ...nx } = state;
    return { isFailt: true, failtMsg: msg, ...nx };
}

/**树的操作--结束  */

/**拖放操作 */

function dragNodeBegin(state, other) {
    let { dragNodeData, dragAccepted, dragNode, ...nx } = state;
    let { node, data } = other;
    return { ...nx, dragNode: node, dragAccepted: false, dragNodeData: data };
}

function dragNodeEnd(state, other) {
    let { dragNodeData, dragNode, dragAccepted, ...nx } = state;
    return { dragNodeData: null, dragNode: null, dragAccepted: false, ...nx };
}

function dragNodeSetEffect(state, other) {
    let { accepted } = other;
    let { dragAccepted, ...nx } = state;
    return { dragAccepted: accepted, ...nx };
}

/**获取道路Id及路径 */
function _getRoadId(node, path) {
    let cur = node;
    let tp = cur.type.toString();
    let ftp = ['4', '1'];
    let bf = false;
    if (ftp.indexOf(tp) >= 0) {
        bf = true;
    } else
        while (true) {
            cur = cur.parentNode;
            if (!cur) {
                break;
            }
            tp = cur.type.toString();
            if (ftp.indexOf(tp) >= 0) {
                bf = true;
                break;
            }
        }
    if (bf) {
        path.unshift(cur);
        while (cur.parentNode) {
            path.unshift(cur.parentNode);
            cur = cur.parentNode;
        }
    }
}


/**获取道路id */
function getRoadId(state, other) {
    let { roadId, roadPath, selectedNodes, ...nx } = state;
    if (selectedNodes.length > 0) {
        let curSel = selectedNodes[0];
        let path = [];
        _getRoadId(curSel, path);
        if (path.length == 0) {
            roadId = '';
            roadPath = '';
        } else {
            let nrp = '';
            let sp = '';
            for (let x = 0; x < path.length; x++) {
                nrp += sp + path[x].value;
                sp = ' / ';
            }
            roadPath = nrp;
            curSel = path.pop();
            roadId = curSel.id;
        }
    } else {
        roadId = '';
        roadPath = '';
    }
    return { roadId, roadPath, selectedNodes, ...nx };
}

export default function treeReducer(state, action) {
    let {
        type,
        ...other
    } = action;
    switch (type) {
        case 'getRoadIdAction':
            return getRoadId(state, other);
        case 'dragNodeSetEffectAction':
            return dragNodeSetEffect(state, other);
        case 'drapNodeEndAction':
            return dragNodeEnd(state, other);
        case 'dragNodeBeginAction':
            return dragNodeBegin(state, other);
        case 'addTreeNodeEndAction':
            return addTreeNodeEnd(state, other);
        case 'addTreeNodeBeginAction':
            return state;
        case 'setFailtAction':
            return setFailt(state, other);
        case 'resetFailtAction':
            return resetFailt(state, other);
        case 'deleteTreeNodeEndAction':
            return deleteTreeNodeEnd(state, other);
        case 'deleteTreeNodeBeginAction':// should extend it
            return state;
        case 'expandTreeNodeAction':
            return expandTreeNode(state, other);
        case 'searchExpandTreeAction':
            return searchExpandTree(state, other);
        case 'updateTreeNodeSuccessAction':
            return updateTreeNodeSuccess(state, other);
        case 'updateTreeNodeBeginAction':// should extend it
            return state;
        case 'selectTreeNodeAction':
            return selectTreeNode(state, other);
        case 'fetchTreeEndAction':
            return fetchTreeEnd(state, other);
        case 'fetchTreeErrorAction':
            return state;
        case 'fetchTreeBeginAction':
            return fetchTreeBegin(state, other);
        case 'fetchTreeAction':
            return fetchTree(state, other);
        case 'updateTreeNodeAction':
            return updateTreeNode(state, other);
        case 'deleteTreeNodeAction':
            return deleteTreeNode(state, other);
        case 'addTreeNodeAction':
            return addTreeNode(state, other);
        case 'initTreeAction':
            //console.log('初始化Tree function callback')
            return initStore()
        default:
            return typeof state === 'undefined'
                ? initStore()
                : state;
    }
}