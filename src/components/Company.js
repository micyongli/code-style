import React from 'react'
import reactDom from 'react-dom'
import './Company.css'
class Company extends React.Component {
    constructor(p) {
        super(p)
    }
    render() {
        return (
            <div className="comp">
                {this.props.children}
            </div>
        )
    }
}
export default Company