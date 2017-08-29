

function initHistoryStore() {
    return {
        history: {}
    };
}

export function mapHistoryDispatch(dispatch) {
    return {
        setHistoryAction: (key, value) => {
            dispatch({ type: 'setHistoryAction', key, value })
        }
    };
}

function setHistory(state, other) {
    let { key, value } = other;
    let { history } = state
    let his = {};

    for (let x in history) {
        if (x !== key) {
            his[x] = history[x];
        }
    }
    his[key] = value;
    return { history: his };
}

export function mapHistoryProps(state) {
    return state;
}

export default function historyReducer(state, action) {
    let {
        type,
        ...other
    } = action;
    switch (type) {
        case 'setHistoryAction':
            return setHistory(state, other);
        default:
            return typeof state === 'undefined'
                ? initHistoryStore()
                : state;
    }
}
