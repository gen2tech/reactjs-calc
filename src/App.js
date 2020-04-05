import React, {Component} from 'react';
import UIfx from 'uifx';
import FormatValue from './components/FormatValue'
import CalculatorKey from './components/CalculatorKey'

import './App.css';
import mute from './sounds/mute.svg';
import volume from './sounds/volume.svg'
import sound from './sounds/sound.mp3'




const CalculatorOperations = {
  '/': (prevValue, nextValue) => prevValue / nextValue,
  '*': (prevValue, nextValue) => prevValue * nextValue,
  '+': (prevValue, nextValue) => prevValue + nextValue,
  '-': (prevValue, nextValue) => prevValue - nextValue,
  '=': (prevValue, nextValue) => nextValue
}

class App extends Component{
  constructor (props) {
    super(props);
    this.state = {
      value: null,
      historyValue: '0',
      outputValue: '0',
      operator: null,
      waitingForOperand: false,
      soundIcon:volume,
      mute:true
    };
  }
    
  clearAll = () => {
    this.setState({
      value: null,
      outputValue: '0',
      historyValue: '0',
      operator: null,
      waitingForOperand: false
    })
  }

  clearHistory = () => {
    this.setState({
      historyValue: '0'
    })
  }
  
  clearLastChar = () => {
    const { historyValue } = this.state;
    this.setState({
      historyValue: historyValue.substring(0, historyValue.length - 1) || '0'
    })
  }

  togglePosNeg = () => {
    const { historyValue } = this.state
    const newValue = parseFloat(historyValue) * -1
    
    this.setState({
      historyValue: String(newValue)
    })
  }

  createPercent = () => {
    const { historyValue } = this.state
    const currentValue = parseFloat(historyValue)
    
    if (currentValue === 0)
      return
    
    const fixedDigits = historyValue.replace(/^-?\d*\.?/, '')
    const newValue = parseFloat(historyValue) / 100
    
    this.setState({
      historyValue: String(newValue.toFixed(fixedDigits.length + 2))
    })
  }

  
  createDot = () => {
    const { historyValue } = this.state
    
    if (!(/\./).test(historyValue)) {
      this.setState({
        historyValue: historyValue + '.',
        waitingForOperand: false
      })
    }
  }
  
  createDigit = (digit) => {
    const { historyValue, waitingForOperand } = this.state
    
    if (waitingForOperand) {
      this.setState({
        historyValue: String(digit),
        waitingForOperand: false
      })
    } else {
      this.setState({
        historyValue: historyValue === '0' ? String(digit) : historyValue + digit
      })
    }
  }


  performOperation = (nextOperator) => {  
    const { value, historyValue, operator } = this.state
    const inputValue = parseFloat(historyValue)
    
    if (value == null) {
      this.setState({
        value: inputValue
      })
    } else if (operator) {
      const currentValue = value || 0
      const newValue = CalculatorOperations[operator](currentValue, inputValue)
      
      this.setState({
        value: newValue,
        historyValue: String(newValue)
      })
      
      if(nextOperator === '='){
        this.setState({
          outputValue: String(newValue)
        })
      }
    }
    this.setState({
      waitingForOperand: true,
      operator: nextOperator
    })
  }

  toggleSound = () =>{
    const soundIcon = this.state.soundIcon;
    this.setState({
      soundIcon: soundIcon===volume ? mute : volume,
      mute: !this.state.mute
    })
  }
  
  handleKeyDown = (event) => {
    let { key } = event
    
    if (key === 'Enter')
      key = '='
    
    if ((/\d/).test(key)) {
      event.preventDefault()
      this.createDigit(parseInt(key, 10))
    } else if (key in CalculatorOperations) {
      event.preventDefault()
      this.performOperation(key)
    } else if (key === '.') {
      event.preventDefault()
      this.createDot()
    } else if (key === '%') {
      event.preventDefault()
      this.createPercent()
    } else if (key === 'Backspace') {
      event.preventDefault()
      this.clearLastChar()
    } else if (key === 'Clear') {
      event.preventDefault()      
      if (this.state.historyValue !== '0') {
        this.clearHistory()
      } else {
        this.clearAll()
      }
    }
  };
  
  componentDidMount = () => {
    document.addEventListener('keydown', this.handleKeyDown)
  }
  
  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleKeyDown)
  }


  render(){    
    const {outputValue, historyValue } = this.state
    
    const clearHistory = historyValue !== '0'
    const clearText = clearHistory ? 'C' : 'AC'
    const keyboard = [
        {class:'function', value:clearText, onPress:clearHistory ? this.clearHistory : this.clearAll},
        {class:'function', value:'CE', onPress:this.clearLastChar},
        {class:'function', value:'%', onPress:this.createPercent},
        {class:'operator divide', value:'÷', onPress:this.performOperation},
        {class:'number', value:'7', onPress:this.createDigit},
        {class:'number', value:'8', onPress:this.createDigit},
        {class:'number', value:'9', onPress:this.createDigit},
        {class:'operator multiply', value:'*', onPress:this.performOperation},
        {class:'number', value:'4', onPress:this.createDigit},
        {class:'number', value:'5', onPress:this.createDigit},
        {class:'number', value:'6', onPress:this.createDigit},
        {class:'operator minus', value:'-', onPress:this.performOperation},
        {class:'number', value:'1', onPress:this.createDigit},
        {class:'number', value:'2', onPress:this.createDigit},
        {class:'number', value:'3', onPress:this.createDigit},
        {class:'operator plus', value:'+', onPress:this.performOperation},
        {class:'number', value:'●', onPress:this.createDot},
        {class:'number', value:'0', onPress:this.createDigit},
        {class:'function', value:'±', onPress:this.togglePosNeg},
        {class:'operator equal', value:'=', onPress:this.performOperation},
    ];
    return (
      <div id="container">
			<div id="calculator">
				<div id="result">
          <img className='soundIcon' onClick={this.toggleSound} src={this.state.soundIcon} alt=''/>
					<div id="output">
            <FormatValue id="output-value" value={outputValue}/>
					</div>
					<div id="history">
          <FormatValue id="history-value" value={historyValue}/>
					</div>
				</div>
				<div id="keyboard">
          {keyboard.map((key,i) => {
            const noVal = ['C','AC','CE','●','%','±'];
            const beep = new UIfx(sound,{volume: 1.0, throttleMs: 100 });
            let val = '';
            if(!noVal.includes(key.value)){
              val = key.value === '÷' ? '/' : key.value;
            }
            return <CalculatorKey key={i} 
                  className={key.class} 
                  onPress={() => key.onPress(val)} 
                  onClick={this.state.mute && beep.play}>{key.value}</CalculatorKey>
          })}
				</div>
			</div>
		</div>
    );
  }
}


export default App;
