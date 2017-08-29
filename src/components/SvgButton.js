import React from 'react';
class SvgButton extends React.Component {
    static defaultProps = {
        width: 28,
        height: 28,
        onClick: e => { },
        enterColor: 'rgba(0,0,0,1)',
        leaveColor: 'rgba(0,0,0,0.7)',
        disabledColor: 'rgba(0,0,0,0.1)',
        disabled: false,
        viewBox: "0 0 1024 1024",
        transform: 'translate(0,-5px)'
    }
    constructor(props) {
        super(props);
        this.state = {
            enter: false
        }
    }
    doEnter = () => {
        if(this.state.enter && !this.props.disabled){
            return {transform:'translate(2px,-4px) scale(1.2,1.2)'}
        }
    }
    componentDidMount(){
        $(this.self).tooltip()
    }

    render() {
        return (

            <svg
                ref={ref=>this.self=ref}
                title={this.props.title}
                style={this.doEnter()}
                fill={
                    this.props.disabled ? this.props.disabledColor : (this.state.enter ? this.props.enterColor : this.props.leaveColor)
                }

                onMouseLeave={
                    e => this.setState({ enter: false })
                }

                onMouseEnter={
                    e => this.setState({ enter: true })
                }


                onMouseDown={e => e.preventDefault()}

                onClick={
                    e => {
                        if (!this.props.disabled)
                            this.props.onClick();
                    }
                }

                width={this.props.width}
                height={this.props.height}
                viewBox={this.props.viewBox}>
                <path d={this.props.d}></path>
            </svg>);
    }
}

export default SvgButton;
