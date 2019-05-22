import React, { Component } from 'react'
import { render } from 'react-dom'
import { DropIn, HostedField, PaypalButton } from './src/index'
import cn from 'classnames'
import './styles.css'

const styles = {
  input: {
    'font-size': '16px',
    'font-family': 'courier, monospace',
    'font-weight': 'lighter',
    color: '#ccc',
    padding: '1em 0',
  },
  label: {
    height: '30px',
  },
  ':focus': {
    color: 'black',
  },
  '.valid': {
    color: '#007aff',
  },
  '.invalid': {
    color: 'red',
  },
}

const onFocus = ({ emittedBy }) => {
  console.log(`${emittedBy} Field has been Focused`)
}
const onBlur = ({ emittedBy }) => {
  console.log(`${emittedBy} Field has been Blurred`)
}
const onCancel = data => {
  console.log('checkout.js payment cancelled', JSON.stringify(data, 0, 2))
}
const onError = err => {
  console.error('checkout.js error', err)
}

const onSubmit = async getPayload => {
  getPayload()
    .then(payload => alert(JSON.stringify(payload, true, 2)))
    .catch(err => console.log({ err }))
}

class Payment extends Component {
  state = {
    paypalReady: false,
    focused: null,
    fieldsEmpty: {
      number: true,
      expirationDate: true,
      cvv: true,
    },
  }

  onFocus = ({ emittedBy }) => {
    this.setState({ focused: emittedBy })
  }

  onBlur = ({ emittedBy, fields }) => {
    this.setState(prevState => ({
      fieldsEmpty: {
        ...prevState.fieldsEmpty,
        [emittedBy]: fields[emittedBy].isEmpty,
      },
    }))
  }

  onEnterPP = () => {
    this.setState({
      paypalReady: true,
    })
  }

  render() {
    const { focused, fieldsEmpty, paypalReady } = this.state
    return (
      <DropIn
        authorization="sandbox_bd423mtc_48gzm6fs32mwz2x3"
        styles={styles}
        ns="holaaa"
      >
        {({ getPayload, paypalPayload, reset, ready }) => (
          <div className="container">
            {paypalPayload ? (
              <span>
                payal set <button onClick={reset}>reset</button>
              </span>
            ) : (
              <>
                <span style={{ opacity: paypalReady ? 1 : 0.3 }}>
                  <PaypalButton
                    style={{
                      label: 'paypal',
                      size: 'medium',
                      shape: 'rect',
                      color: 'black',
                      tagline: false,
                    }}
                    onCancel={onCancel}
                    onError={onError}
                    onEnter={this.onEnterPP}
                  />
                </span>
                <br />
                <br />
                <div className="fieldContainer">
                  <HostedField
                    type="number"
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    className="field"
                    prefill="4111111111111111"
                    onNotEmpty={this.onBlur}
                  >
                    {id => (
                      <label
                        className={cn('label', {
                          focused:
                            focused === 'number' || !fieldsEmpty['number'],
                        })}
                        htmlFor={id}
                      >
                        Card Number
                      </label>
                    )}
                  </HostedField>
                </div>

                <HostedField
                  type="cvv"
                  placeholder="123"
                  onFocus={this.onFocus}
                />

                <HostedField type="expirationDate" placeholder="11/19" />
              </>
            )}
            {ready && (
              <button onClick={() => onSubmit(getPayload)}>send</button>
            )}
          </div>
        )}
      </DropIn>
    )
  }
}

render(<Payment />, document.getElementById('root'))
