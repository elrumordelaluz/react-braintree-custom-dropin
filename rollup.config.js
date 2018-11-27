import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import pkg from './package.json'

const config = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      name: 'react-braintree-custom-dropin',
      globals: {
        react: 'React',
        'braintree-web': 'braintreeWeb',
        'prop-types': 'PropTypes',
      },
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    'react',
    'react-dom',
    'braintree-web',
    'paypal-checkout',
    'prop-types',
  ],
  plugins: [babel({ runtimeHelpers: true }), resolve(), commonjs(), filesize()],
}

export default config
