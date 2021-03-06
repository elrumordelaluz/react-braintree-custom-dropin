import React, { Component, createContext, forwardRef } from 'react'
import ReactDOM from 'react-dom'
import braintree from 'braintree-web'
import PropTypes from 'prop-types'

const { Provider, Consumer } = createContext(0)

const fieldEvents = [
  {
    eventName: 'blur',
    handlerName: 'onBlur',
  },
  {
    eventName: 'focus',
    handlerName: 'onFocus',
  },
  {
    eventName: 'empty',
    handlerName: 'onEmpty',
  },
  {
    eventName: 'notEmpty',
    handlerName: 'onNotEmpty',
  },
  {
    eventName: 'cardTypeChange',
    handlerName: 'onCardTypeChange',
  },
  {
    eventName: 'validityChange',
    handlerName: 'onValidityChange',
  },
]

class DropIn extends Component {
  currId = 0
  hostedFieldsInstance = null
  paypalCheckoutInstance = null

  state = {
    client: null,
    fields: {},
    handlers: {},
    addField: options => this.addField(options),
    addPaypalButton: options => this.addPaypalButton(options),
    PaypalBtn: null,
    paypalPayload: null,
    ready: false,
  }

  getPayload = async () => {
    const { paypalPayload } = this.state
    try {
      if (paypalPayload) {
        return paypalPayload
      } else {
        const { fields } = this.hostedFieldsInstance.getState()
        const invalidFields = Object.keys(fields).filter(
          field => !fields[field].isValid
        )
        if (invalidFields.length === 0) {
          return await this.hostedFieldsInstance.tokenize()
        } else {
          return Promise.reject(invalidFields)
        }
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async componentDidMount() {
    await this.init()
  }

  async componentWillUnmount() {
    if (this.hostedFieldsInstance) {
      await this.hostedFieldsInstance.teardown()
    }
    if (this.paypalCheckoutInstance) {
      await this.paypalCheckoutInstance.teardown()
    }
  }

  init = async () => {
    this.setState({ ready: false })
    const { authorization, paypal, loader: PaypalBtn } = this.props
    const client = await braintree.client.create({
      authorization,
    })
    await this.initHostedFields(client)
    if (paypal) {
      this.setState({ PaypalBtn })
      await this.initPaypal(client)
    }
    this.setState({ client, ready: true })
  }

  async initHostedFields(client) {
    const { fields, handlers } = this.state
    const { styles } = this.props
    const hostedFields = (this.hostedFieldsInstance = await braintree.hostedFields.create(
      {
        client,
        styles,
        fields,
      }
    ))

    fieldEvents.map(({ eventName, handlerName }) => {
      hostedFields.on(eventName, event => {
        if (handlers[event.emittedBy][handlerName]) {
          handlers[event.emittedBy][handlerName](event)
        }
      })
    })
  }

  async initPaypal(client) {
    const { authorization, env } = this.props
    const paypalCheckoutInstance = (this.paypalCheckoutInstance = await braintree.paypalCheckout.create(
      {
        client,
      }
    ))
    const paypal = await import('paypal-checkout')

    const Btn = paypal.Button.driver('react', { React, ReactDOM })

    const payment = () => {
      return paypalCheckoutInstance.createPayment({
        flow: 'vault',
      })
    }

    const onAuthorize = async (data, actions) => {
      const paypalPayload = await paypalCheckoutInstance.tokenizePayment(data)
      this.setState({ paypalPayload })
    }

    const PaypalBtn = props => (
      <Btn
        {...props}
        braintree={braintree}
        client={{
          sandbox: env === 'sandbox' ? authorization : '',
          production: env === 'production' ? authorization : '',
        }}
        payment={payment}
        onAuthorize={onAuthorize}
        env={env}
      />
    )

    this.setState({
      PaypalBtn,
    })
  }

  addField({
    type,
    placeholder,
    formatInput,
    maskInput,
    select,
    maxlength,
    minlength,
    prefill,
    rejectUnsupportedCards,
    ...rest
  }) {
    const id = `${this.props.ns}-${type}-${this.currId++}`
    const attrs = {
      placeholder,
      formatInput,
      maskInput,
      select,
      maxlength,
      minlength,
      prefill,
      rejectUnsupportedCards,
    }
    this.setState(prevState => ({
      fields: {
        ...prevState.fields,
        [type]: { ...attrs, selector: `#${id}` },
      },
      handlers: {
        ...prevState.handlers,
        [type]: rest,
      },
    }))
    return id
  }

  resetPaymentMethod = async () => {
    await this.paypalCheckoutInstance.teardown()
    await this.hostedFieldsInstance.teardown()
    this.setState({ paypalPayload: null })
    this.init()
  }

  render() {
    const { paypalPayload, ready } = this.state
    return (
      <Provider value={this.state}>
        {this.props.children({
          getPayload: this.getPayload,
          paypalPayload,
          reset: this.resetPaymentMethod,
          ready,
        })}
      </Provider>
    )
  }
}

DropIn.propTypes = {
  styles: PropTypes.object,
  authorization: PropTypes.string,
  ns: PropTypes.string,
  paypal: PropTypes.bool,
  env: PropTypes.oneOf(['sandbox', 'production']),
  loader: PropTypes.func,
}

DropIn.defaultProps = {
  ns: 'bt-custom',
  paypal: true,
  env: 'sandbox',
  loader: () => <span>Loading…</span>,
}

class Field extends Component {
  componentDidMount() {
    const { addField, client, ...fieldProps } = this.props
    this.id = addField(fieldProps)
  }

  render() {
    return (
      <>
        {this.props.children &&
          typeof this.props.children === 'function' &&
          this.props.children(this.id)}
        <div id={this.id} className={this.props.className} />
      </>
    )
  }
}

const HostedField = forwardRef((props, ref) => (
  <Consumer>
    {({ addField, client, paypalPayload }) => (
      <Field {...props} addField={addField} client={client} ref={ref} />
    )}
  </Consumer>
))

HostedField.propTypes = {
  // https://braintree.github.io/braintree-web/current/module-braintree-web_hosted-fields.html#~field
  type: PropTypes.oneOf([
    'number',
    'cvv',
    'expirationDate',
    'postalCode',
    'expirationMonth',
    'expirationYear',
  ]).isRequired,
  placeholder: PropTypes.string,
  formatInput: PropTypes.bool,
  maskInput: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      character: PropTypes.string,
      showLastFour: PropTypes.bool,
    }),
  ]),
  select: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      options: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
  maxlength: PropTypes.number,
  minlength: PropTypes.number,
  prefill: PropTypes.string,
  rejectUnsupportedCards: PropTypes.bool,
  // https://braintree.github.io/braintree-web/current/HostedFields.html#on
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onEmpty: PropTypes.func,
  onNotEmpty: PropTypes.func,
  onCardTypeChange: PropTypes.func,
  onValidityChange: PropTypes.func,
}

const PaypalButton = props => (
  <Consumer>
    {({ PaypalBtn }) => PaypalBtn && <PaypalBtn {...props} />}
  </Consumer>
)

// https://developer.paypal.com/docs/checkout/quick-start/
// https://developer.paypal.com/docs/checkout/how-to/customize-button/#button-styles

export { DropIn, HostedField, PaypalButton }
