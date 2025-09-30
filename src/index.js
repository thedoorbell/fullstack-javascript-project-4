import path from 'path'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'
import debug from 'debug'
import getData from './getData.js'
import downloadFiles from './downloadFiles.js'
import generateName from './generateName.js'

const log = debug('page-loader')

const getAbsolutePath = dirpath => path.resolve(process.cwd(), dirpath)

const downloadPage = (url, outputDir = process.cwd()) => {
  log('download page %s to %s', url, outputDir)

  const absOutputDir = getAbsolutePath(outputDir)
  const fileName = generateName(url)
  const filePath = path.join(absOutputDir, fileName)
  const filesDirName = generateName(url).replace('.html', '_files')
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
      log('write to file %s', filePath)
      return fsp.writeFile(filePath, $.html())
    })
    .then(() => {
      log('done, output file is %s', filePath)
      return filePath
    })
    .catch((err) => {
      log('error: %s', err.message)
      if (err.code === 'ENOENT') {
        throw new Error(`ERROR: No such output directory - ${outputDir}`)
      }
      if (err.code === 'EACCES') {
        throw new Error(`ERROR: No access to output directory - ${outputDir}`)
      }
      if (err.message.startsWith('Cant get ')) {
        throw err
      }
      throw new Error(`ERROR: ${err.message}`)
    })
}

export default downloadPage
