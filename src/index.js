import path from 'path'
import fsp from 'fs/promises'
import getPage from './getPage.js'

const getAbsolutePath = dirpath => path.resolve(process.cwd(), dirpath)

const generateFileName = (url) => {
  const href = new URL(url)
  return (href.hostname + href.pathname).replace(/[^a-zA-Z0-9]/g, '-') + '.html'
}

const downloadPage = (url, outputDir) => {
  const fileName = generateFileName(url)
  const filePath = path.join(getAbsolutePath(outputDir), fileName)

  return getPage(url)
    .then(pageData => fsp.writeFile(filePath, pageData)
      .then(() => filePath))
    .catch((err) => {
      throw new Error(`Error: ${err.message}`)
    })
}

export default downloadPage
