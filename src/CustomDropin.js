import React, { Component, Fragment } from 'react'
import braintree from 'braintree-web'
import PropTypes from 'prop-types'

class CustomDropin extends Component {
  clientInstance = null
  hostedFieldsInstance = null
  paypalCheckoutInstance = null

  state = { ready: false, paymentPayload: null }

  async componentDidMount() {
    const { authorization } = this.props
    this.setState({ ready: false })

    const client = await braintree.client.create({
      authorization,
    })

    await this.initHostedFields(client)
    await this.initPaypal(client)

    this.setState({ ready: true })
  }

  async initHostedFields(client) {
    const { styles, fields, onValidityChange } = this.props
    this.hostedFieldsInstance = await braintree.hostedFields.create({
      client,
      styles,
      fields,
    })

    this.hostedFieldsInstance.on('validityChange', onValidityChange)
  }

  async initPaypal(client) {
    const paypalCheckoutInstance = (this.paypalCheckoutInstance = await braintree.paypalCheckout.create(
      {
        client,
      }
    ))

    const paypal = await import('paypal-checkout')

    const setPaymentPayload = paymentPayload => {
      this.setState({ paymentPayload })
    }

    paypal.Button.render(
      {
        env: 'sandbox',
        braintree,
        style: {
          label: 'paypal',
          size: 'medium', // small | medium | large | responsive
          shape: 'rect', // pill | rect
          color: 'black', // gold | blue | silver | black
          tagline: false,
        },

        client: {
          sandbox: 'sandbox_bd423mtc_48gzm6fs32mwz2x3',
          production: '<insert production auth key>',
        },

        payment() {
          return paypalCheckoutInstance.createPayment({
            flow: 'vault', // Required
          })
        },

        async onAuthorize(data, actions) {
          const paymentPayload = await paypalCheckoutInstance.tokenizePayment(
            data
          )
          setPaymentPayload(paymentPayload)
        },

        onCancel(data) {
          console.log(
            'checkout.js payment cancelled',
            JSON.stringify(data, 0, 2)
          )
        },

        onError(err) {
          console.error('checkout.js error', err)
        },
      },
      '#paypal-container'
    )
  }

  render() {
    return (
      <Fragment>
        <div id="paypal-container" />

        <label htmlFor="card-number">Card Number</label>
        <div id="card-number" className="hosted-field" />

        <label htmlFor="expiration-date">Expiration Date</label>
        <div id="expiration-date" className="hosted-field" />

        <label htmlFor="cvv">CVV</label>
        <div id="cvv" className="hosted-field" />

        <label>
          Postal Code
          <div id="postal-code" className="hosted-field" />
        </label>
      </Fragment>
    )
  }
}

CustomDropin.propTypes = {
  paypal: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  authorization: PropTypes.string.isRequired,
  styles: PropTypes.object,
  fields: PropTypes.object,
  onValidityChange: PropTypes.func,
}

CustomDropin.defaultProps = {
  paypal: false,
  onSubmit: payload => console.log(payload.nonce),
  authorization: 'sandbox_bd423mtc_48gzm6fs32mwz2x3',
  styles: {
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
  },
  fields: {
    number: {
      selector: '#card-number',
      placeholder: '4111 1111 1111 1111',
    },
    cvv: {
      selector: '#cvv',
      placeholder: '123',
    },
    expirationDate: {
      selector: '#expiration-date',
      placeholder: 'MM/YYYY',
    },
    postalCode: {
      selector: '#postal-code',
      placeholder: '11111',
    },
  },
  onValidityChange: ({ fields, emittedBy }) => {
    const field = fields[emittedBy]
    if (field.isValid) {
      console.log(emittedBy, 'is fully valid')
    } else if (field.isPotentiallyValid) {
      console.log(emittedBy, 'is potentially valid')
    } else {
      console.log(emittedBy, 'is not valid')
    }
  },
}

export default CustomDropin
