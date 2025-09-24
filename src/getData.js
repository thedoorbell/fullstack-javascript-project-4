import axios from 'axios'
import axiosDebugLog from 'axios-debug-log'
import debug from 'debug'

const log = debug('page-loader')

axiosDebugLog({
  debug: log,
  request: (debug, config) => {
    debug('Request with ' + config.headers['content-type'], config.url)
  },
  response: (debug, response) => {
    debug(
      'Response with ' + response.headers['content-type'],
      'from ' + response.config.url,
      'status ' + response.status,
    )
  },
  error: (debug, error) => {
    debug(`Error: ${error.message}`)
  },
})

const getData = url => axios
  .get(url, { responseType: 'arraybuffer' })
  .then(response => response.data)
  .catch((err) => {
    log(`Error: ${err.message}`)
    throw new Error(`Cant get ${url} - ${err.message}`)
  })

export default getData
