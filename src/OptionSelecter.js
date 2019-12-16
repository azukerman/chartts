import React, { Component } from 'react';
import './App.css';

class OptionSelecter extends Component {
    render() {
        const { options } = this.props.options;
        const optionsList = options.map(option => {
            return (
                <option value={option.value}>{option.txt}</option>
            )
        })
        return (
            <div>
                <select name={this.props.name} value={this.props.value} onChange={this.props.onChangeFunction}>
                    {optionsList}

                </select>
            </div>


        )
    }
}
export default OptionSelecter;