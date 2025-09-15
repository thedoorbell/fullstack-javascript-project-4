import axios from 'axios'

const getPage = url => axios.get(url).then(response => response.data)

export default getPage
