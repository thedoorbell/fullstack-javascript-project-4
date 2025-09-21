import path from 'path'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'
import * as prettier from 'prettier'
import getData from './getData.js'
import downloadFiles from './downloadFiles.js'
import generateName from './generateName.js'

const getAbsolutePath = dirpath => path.resolve(process.cwd(), dirpath)

const downloadPage = (url, outputDir) => {
  const fileName = generateName(url) + '.html'
  const filePath = path.join(getAbsolutePath(outputDir), fileName)
  const filesDirName = generateName(url) + '_files'
  const filesDirPath = path.join(getAbsolutePath(outputDir), filesDirName)
  let $

  return getData(url)
    .then((html) => {
      $ = cheerio.load(html)

      return Promise.all([
        downloadFiles($, url, filesDirPath, 'img', 'src'),
        downloadFiles($, url, filesDirPath, 'link', 'href'),
        downloadFiles($, url, filesDirPath, 'script', 'src'),
      ])
    })
    .then(() => prettier.format($.html(), { parser: 'html' }))
    .then(formattedHtml => fsp.writeFile(filePath, formattedHtml))
    .then(() => filePath)
    .catch((err) => {
      // console.error('Full error:', err)
      throw new Error(`Error: ${err.message}`)
    })
}

export default downloadPage
