import React from 'react'
import reactDom from 'react-dom'
import PropTypes from 'prop-types'
import './NavButton.css'

const isModifiedEvent = (event) =>
    !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

class NavButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        target: PropTypes.string,
        replace: PropTypes.bool,
        to: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]).isRequired,
        isActive: PropTypes.func
    }

    static defaultProps = {
        replace: false
    }

    static contextTypes = {
        router: PropTypes.shape({
            history: PropTypes.shape({
                push: PropTypes.func.isRequired,
                replace: PropTypes.func.isRequired,
                createHref: PropTypes.func.isRequired
            }).isRequired
        }).isRequired
    }
    handleClick = (event) => {
        if (this.props.onClick)
            this.props.onClick(event)

        if (
            !event.defaultPrevented && // onClick prevented default
            event.button === 0 && // ignore right clicks
            !this.props.target && // let browser handle "target=_blank" etc.
            !isModifiedEvent(event) // ignore clicks with modifier keys
        ) {
            event.preventDefault()
            const { history } = this.context.router
            const { replace, to } = this.props
            if (replace) {
                history.replace(to)
            } else {
                history.push(to)
            }
        }
    }

    constructor(p) {
        super(p)
        this.state = {
            isOn: false
        }
    }


    mouseLeave = () => {
        this.setState({ isOn: false })
    }
    mouseEnter = () => {
        this.setState({ isOn: true })
    }
    isActive = () => {
        return this.context.router.route.location.pathname === this.props.to
    }
    assginClass = () => {
        let cn = this.state.isOn ? this.props.onClass : this.props.offClass
        return this.isActive() ? this.props.onClass : cn
    }
    render() {
        return (
            <div className="navwrap">
                <div onClick={this.handleClick} className={`${this.assginClass()}`} onMouseLeave={this.mouseLeave} onMouseEnter={this.mouseEnter} ref={b => this.self = b}>
                    <span className="nav-title">{this.props.name}</span>
                </div>
            </div >
        )
    }
}
export default NavButton