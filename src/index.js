import path from 'path'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'
import * as prettier from 'prettier'
import debug from 'debug'
import getData from './getData.js'
import downloadFiles from './downloadFiles.js'
import generateName from './generateName.js'

const log = debug('page-loader')

const getAbsolutePath = dirpath => path.resolve(process.cwd(), dirpath)

const downloadPage = (url, outputDir) => {
  log('download page %s to %s', url, outputDir)

  const absOutputDir = getAbsolutePath(outputDir)
  const fileName = generateName(url) + '.html'
  const filePath = path.join(absOutputDir, fileName)
  const filesDirName = generateName(url) + '_files'
  const filesDirPath = path.join(absOutputDir, filesDirName)

  return fsp.access(absOutputDir)
    .then(() => {
      log('output dir exists')
      return getData(url)
    })
    .then((html) => {
      log('HTML downloaded')
      const $ = cheerio.load(html)

      return Promise.all([
        downloadFiles($, url, filesDirPath, 'img', 'src'),
        downloadFiles($, url, filesDirPath, 'link', 'href'),
        downloadFiles($, url, filesDirPath, 'script', 'src'),
      ])
        .then(() => $)
    })
    .then(($) => {
      log('files downloaded, format HTML')
      return prettier.format($.html(), { parser: 'html' })
    })
    .then((formattedHtml) => {
      log('write to file %s', filePath)
      return fsp.writeFile(filePath, formattedHtml)
    })
    .then(() => {
      log('done, output file is %s', filePath)
      return filePath
    })
    .catch((err) => {
      // console.error('Full error:', err)
      log('error: %s', err.message)
      throw new Error(`Error: ${err.message}`)
    })
}

export default downloadPage
