import React from 'react'
import { render } from 'react-dom'
import { DropIn, HostedField } from './src/index'

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

const onFocus = ({ emittedBy }) =>
  console.log(`${emittedBy} Field has been Focused`)
const onBlur = ({ emittedBy }) =>
  console.log(`${emittedBy} Field has been Blurred`)

const Payment = () => (
  <DropIn authorization="sandbox_bd423mtc_48gzm6fs32mwz2x3" styles={styles}>
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
  </DropIn>
)

render(<Payment />, document.getElementById('root'))
