import React from 'react'
import { render } from 'react-dom'
import { DropIn, HostedField, PaypalButton } from './src/index'

const styles = {
  input: {
    'font-size': '16px',
    'font-family': 'courier, monospace',
    'font-weight': 'lighter',
    color: '#ccc',
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
    .then(payload => console.log({ payload }))
    .catch(err => console.log({ err }))
}

const Payment = () => (
  <DropIn
    authorization="sandbox_bd423mtc_48gzm6fs32mwz2x3"
    styles={styles}
    ns="holaaa"
  >
    {({ getPayload, paypalPayload, reset, ready }) => (
      <>
        {paypalPayload ? (
          <span>
            payal set <button onClick={reset}>reset</button>
          </span>
        ) : (
          <>
            <HostedField
              type="number"
              placeholder="4111 1111 1111 1111"
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <HostedField
              type="cvv"
              placeholder="123"
              prefill="456"
              onFocus={onFocus}
              onBlur={onBlur}
            />
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
            />
            <HostedField type="expirationDate" placeholder="11/19" />
            <HostedField
              type="expirationMonth"
              placeholder="Month"
              select={{ options: ['01- enero'] }}
            />
          </>
        )}
        {ready && <button onClick={() => onSubmit(getPayload)}>send</button>}
      </>
    )}
  </DropIn>
)

render(<Payment />, document.getElementById('root'))
