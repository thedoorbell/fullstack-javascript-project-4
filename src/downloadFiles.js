import path from 'path'
import fsp from 'fs/promises'
import debug from 'debug'
import getData from './getData.js'
import generateName from './generateName.js'
import Listr from 'listr'

const log = debug('page-loader')

const tasks = ($, links, url, filesDirPath, selector, attr) => new Listr(links
  .map((link) => {
    const absLink = new URL(link, url)
    if (absLink.hostname === new URL(url).hostname) {
      return {
        title: `${absLink.href}`,
        task: () => downloadFile($, link, absLink, filesDirPath, selector, attr),
      }
    }
    else return null
  })
  .filter(link => link !== null && link !== undefined), {
  concurrent: true,
  exitOnError: false,
})

const downloadFile = ($, link, absLink, filesDirPath, selector, attr) => {
  const fileName = generateName(absLink.href)
  const filePath = path.join(filesDirPath, fileName)

  log('download file %s', absLink.href)
  return getData(absLink.href)
    .then((data) => {
      log('write to file %s', filePath)
      return fsp.writeFile(filePath, data)
    })
    .then(() => {
      const newLink = path.join(path.basename(filesDirPath), fileName)
      log('change link from %s to %s in HTML', link, newLink)
      $(selector).each((i, tag) => {
        if ($(tag).attr(attr) === link) {
          $(tag).attr(attr, newLink)
        }
      })
    })
    .catch((err) => {
      log('failed to download %s: %s', absLink.href, err.message)
      throw new Error(`Cant load file ${absLink.href}`)
    })
}

const downloadFiles = ($, url, filesDirPath, selector, attr) => {
  const links = $(selector).map((i, tag) => $(tag).attr(attr)).get()

  if (links.length === 0) {
    log('no %s links', selector)
    return Promise.resolve()
  }

  log(`download %ss`, selector)
  return fsp.mkdir(filesDirPath, { recursive: true })
    .then(() => tasks($, links, url, filesDirPath, selector, attr)
      .run().catch((err) => {
        log('failed to download files: %s', err.message)
        throw err
      }))
}

export default downloadFiles
