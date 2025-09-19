import axios from 'axios'
import path from 'path'

const getData = (url) => {
  const imgExtenstions = ['.png', '.jpg', '.jpeg', '.svg']
  if (imgExtenstions.includes(path.extname(url).toLowerCase())) {
    return axios.get(url, { responseType: 'arraybuffer' }).then(response => response.data)
  }
  return axios.get(url).then(response => response.data)
}

export default getData
