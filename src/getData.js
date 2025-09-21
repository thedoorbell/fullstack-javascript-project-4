import axios from 'axios'

const getData = url => axios
  .get(url, { responseType: 'arraybuffer' })
  .then(response => response.data)

export default getData
