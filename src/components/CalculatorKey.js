import React, {Component} from 'react';
import PointTarget from 'react-point'

export default class CalculatorKey extends Component {
    
  press = () => {
    this.props.onPress();
    if(this.props.onClick){
      this.props.onClick();
    }
  }
  render() {
    const { onPress, className, ...props } = this.props
    return (
      <PointTarget onPoint={this.press}>
        <button className={`${className}`} {...props}/>
      </PointTarget>
    )
  }
}
