# react-braintree-custom-dropin

```js
import React, { useState } from 'react'
import {
  DropIn,
  HostedField,
  PaypalButton,
} from 'react-braintree-custom-dropin'

function Payment() {
  const [paypalReady, setPayPalReady] = useState(false)
  const [focused, setFocused] = useState(false)
  const [fieldsEmpty, setFieldsEmpty] = useState({})
  const onSubmit => () => {}
  return (
    <DropIn
      authorization="sandbox_xxxxxxxx_xxxxxxxxxxxxxxxx  "
      styles={styles}
      ns="custom_namespace"
    >
      {({ getPayload, paypalPayload, reset, ready }) => (
        <div className="container">
          {paypalPayload ? (
            <span>
              PayPal already set <button onClick={reset}>reset</button>
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
                  onEnter={() => setPayPalReady(true)}
                />
              </span>
              <br />

              <div className="fieldContainer">
                <HostedField
                  type="number"
                  onFocus={({ emittedBy }) => setFocused(emittedBy)}
                  onBlur={({ emittedBy, fields }) => {
                    setFieldsEmpty(prevStatus => ({
                      ...prevStatus,
                      [emittedBy]: fields[emittedBy].isEmpty,
                    }))
                  }}
                  className="field"
                >
                  {id => (
                    <label
                      className={cn('label', {
                        focused: focused === 'number' || !fieldsEmpty['number'],
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
                onFocus={({ emittedBy }) => setFocused(emittedBy)}
              />

              <HostedField type="expirationDate" placeholder="11/19" />
            </>
          )}
          {ready && <button onClick={() => onSubmit(getPayload)}>send</button>}
        </div>
      )}
    </DropIn>
  )
}

const onCancel = data => {
  console.log('checkout.js payment cancelled', JSON.stringify(data, 0, 2))
}
const onError = err => {
  console.error('checkout.js error', err)
}

export default Payment
```

### Links

- https://developer.paypal.com/docs/checkout/best-practices/#performance-and-analytics
