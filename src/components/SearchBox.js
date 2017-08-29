import React from 'react'
import reactDom from 'react-dom'
import './SearchBox.css';

class SearchBox extends React.Component {
    
    static defaultProps = {
        getValue: item => {
            return item.value;
        },
        getKey: item => {
            return item.key;
        },
        onChange: item => {

        },
        url: ''
    };
    constructor(props) {
        super(props)
        this.state = {
            show: false,
            selectIndex: -1
        }
        this.items = [];
        this.selectedNode = null;
    }

    componentDidMount() {
        this.ignoreBlur = false;
        this.canScroll = true;
    }

    keyDown = e => {
        switch (e.keyCode) {
            case 13:
                this.endInput();
                return;
            case 27:
                return;
            case 38:
                e.preventDefault();
                e.stopPropagation();
                this.moveArrow('up');
                break;
            case 40:
                e.preventDefault();
                e.stopPropagation();
                this.moveArrow('down');
                break;
        }

        return true;
    }

    moveArrow = (direct) => {
        this.canScroll = true;
        let items = this.getItems();
        let mx = items.length;
        if (mx === 0) {
            return;
        }
        let oldIndex = this.getSelect();
        let index = oldIndex;
        switch (direct) {
            case 'up':
                index--;
                break;
            case 'down':
                index++;
                break;
            default:
        }

        if (index >= mx) {
            index = 0;
        } else if (index < 0) {
            index = mx - 1;
        }

        //if (index !== oldIndex) {
        this.setSelect(index);
        // }

    }

    onChange = e => {
        let self = this.inputSelf;
        let inputTxt = self.value;
        let url = this.props.url;
        if (!inputTxt && this.state.show) {
            this.setState({ show: false });
        }
        if (url) {
            fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({ searchKey: inputTxt }),
                credentials: 'include'
            }).then(r => {
                if (r.status >= 200 && r.status < 300) {
                    return r.json();
                }
                throw new Error(r.statusText);
            }).then(r => {
                if (r.code === 0) {
                    this.setItems(r.data);
                    this.setState({ show: true });
                }
            }).catch(e => {

            });
        }

    }

    setItems = (data) => {
        this.items = data;
    }
    getItems = () => {
        return this.items;
    }
    findItem = index => {
        let items = this.getItems();
        let mx = items.length;
        if (index < mx && index >= 0)
            return items[index];
        else
            return null;
    }

    endInput = () => {
        this.doSelect();
    }

    doSelect = () => {
        let sel = this.findItem(this.state.selectIndex);
        if (sel) {
            this.setValue(sel);
        } else {
            this.setState({ show: false, selectIndex: -1 });
        }
    }

    setValue = item => {
        this.inputSelf.value = this.props.getValue(item);
        this.setState({ show: false, selectIndex: -1 });
        this.props.onChange(item);
    }

    divPosition = () => {
        let self = this.inputSelf;
        if (self) {
            let h = self.offsetHeight
            let w = self.offsetWidth
            let x = self.offsetLeft
            let y = self.offsetTop
            return {
                display: 'block',
                position: 'absolute',
                left: `${x}px`,
                top: `${y + h}px`,
                width: `${w}px`,
                maxHeight: '10em',
                overflowY: 'auto'
            }
        }
    }
    setSelectedNode = (n, a) => {
        let ix = this.getSelect();
        if (a && ix == n && this.canScroll) {
            if (typeof this.lastIndex === 'undefined' || ix != this.lastIndex) {
                this.lastIndex = ix;
                a.scrollIntoView && a.scrollIntoView(false);
            }

        }
    }

    resultList = () => {
        let rs = [];
        let data = this.getItems();
        let selIndex = this.getSelect();
        for (let i = 0; i < data.length; i++) {
            let cur = (
                <p
                    ref={a => { this.setSelectedNode(i, a) }}
                    className={selIndex === i ? 'active' : null}
                    onMouseMove={e => { this.setSelect(i); }}
                    onClick={e => { this.doSelect(); }}
                    key={this.props.getKey(data[i])}
                >{this.props.getValue(data[i])}</p>
            );
            rs.push(cur);
        }

        return rs.length > 0 ? rs : null;
    }

    mouseEnter = e => {
        this.ignoreBlur = true;
        this.canScroll = false;
    }

    mouseLeave = e => {
        this.ignoreBlur = false;
        this.resetSelect();
    }

    getSelect = () => {
        return this.state.selectIndex;
    }

    setSelect = (index) => {
        //console.log(this.items[index])
        this.inputSelf.value=this.items[index].value
        this.setState({ selectIndex: index });
    }

    resetSelect = () => {
        this.setState({ selectIndex: -1 });
    }

    wrapList = () => {
        if (this.state.show) {
            let items = this.resultList();
            return !items ? null : (
                <div
                    ref={a => this.popDiv = a}
                    onClick={e => { this.setState({ show: false }) }}
                    onMouseEnter={this.mouseEnter}
                    onMouseLeave={this.mouseLeave}
                    className="droplist"
                    style={this.divPosition()}>
                    {items}
                </div>
            );
        }
        return null;
    }

    blur = (e) => {
        if (!this.ignoreBlur)
            this.setState({ show: false });
    }

    focus = (e) => {
    }

    render() {
        return (
            <div className="searchbox">
                <input
                    defaultValue={this.props.defaultValue}
                    spellCheck="false"
                    autoComplete="off"
                    onFocus={this.focus}
                    onBlur={this.blur}
                    ref={ctl => this.inputSelf = ctl}
                    onKeyDown={this.keyDown}
                    onChange={this.onChange}
                    value={this.props.value}
                    placeholder={this.props.placeholder} /> {this.wrapList()}
            </div>
        )
    }
}
export default SearchBox;