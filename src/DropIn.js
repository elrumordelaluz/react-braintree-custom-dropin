import React, { Component, createContext, forwardRef } from 'react'
import braintree from 'braintree-web'
import PropTypes from 'prop-types'

const { Provider, Consumer } = createContext(0)

const cap = str => str.charAt(0).toUpperCase() + str.slice(1)

const fieldEvents = [
  'blur',
  'focus',
  'emty',
  'notEmty',
  'cardTypeChange',
  'validityChange',
]

class DropIn extends Component {
  currId = 0
  state = {
    client: null,
    fields: {},
    handlers: {},
    addField: options => this.addField(options),
  }

  async componentDidMount() {
    const { authorization } = this.props
    const client = await braintree.client.create({
      authorization,
    })
    await this.initHostedFields(client)
    this.setState({ client })
  }

  async initHostedFields(client) {
    const { fields, handlers } = this.state
    const { styles } = this.props
    const hostedFields = await braintree.hostedFields.create({
      client,
      styles,
      fields,
    })
    fieldEvents.map(e => {
      hostedFields.on(e, event => {
        const eventName = `on${cap(e)}`
        if (handlers[event.emittedBy][eventName]) {
          handlers[event.emittedBy][eventName](event)
        }
      })
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
    const id = `bt-custom-${this.currId++}`
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

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>
  }
}

DropIn.propTypes = {
  styles: PropTypes.object,
}

class Field extends Component {
  componentDidMount() {
    const { addField, client, ...fieldProps } = this.props
    this.id = addField(fieldProps)
  }

  render() {
    return <div id={this.id} />
  }
}

const HostedField = forwardRef((props, ref) => (
  <Consumer>
    {({ addField, client }) => (
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
  onEmty: PropTypes.func,
  onNotEmty: PropTypes.func,
  onCardTypeChange: PropTypes.func,
  onValidityChange: PropTypes.func,
}

export { DropIn, HostedField }
