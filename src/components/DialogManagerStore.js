import React from 'react';

export function dialogManagerMapProps(state) {
    return { ...state };
}

export function dialogManagerDispatch(dispatch) {
    return {
        showDialogAction: (dlg, param) => {
            dispatch({ type: 'showDialogAction', dlg, param, dispatch });
        },
        closeDialogAction: id => {
            dispatch({ type: 'closeDialogAction', id });
        }
    }
}

function _makeDlgId(c) {
    return 'dialog_' + c.toString();
}

function showDialog(state, other) {
    let { dialogs, count, ...nx } = state;
    let { dlg, param, dispatch } = other;
    let {onOk, onCancle, content, ...xx } = param;
    dialogs = dialogs.slice();
    let id = _makeDlgId(count++);
    let dlgx = React.createElement(dlg,
        {
            key: id,
            id: id,
            onOk: () => {
                if (onOk) {
                    onOk(id);
                }
            },
            onCancle: () => {
                if (onCancle) {
                    onCancle(id);
                }
            },
            hide: () => {
                dispatch({ type: 'closeDialogAction', id });
            },
            content: content,
            ...xx
        }
    );
    dialogs.push(dlgx);
    return { dialogs, count, ...nx };
}

function closeDialog(state, other) {
    let { dialogs, count, ...nx } = state;
    let { id } = other;
    dialogs = dialogs.slice();
    let ix = -1;
    for (let x = dialogs.length - 1; x >= 0; x--) {
        if (dialogs[x].key === id) {
            ix = x;
            break;
        }
    }
    if (ix >= 0) {
        dialogs.splice(ix, 1);
    }
    return { dialogs, count, ...nx };
}

export default function dialogManagerReducer(state, action) {
    let { type, ...other } = action;
    switch (type) {
        case 'showDialogAction':
            return showDialog(state, other);
        case 'closeDialogAction':
            return closeDialog(state, other);
        default:
            return typeof state === 'undefined'
                ? initStore()
                : state;
    }
}

function initStore() {
    return { dialogs: [], count: 0 };
}