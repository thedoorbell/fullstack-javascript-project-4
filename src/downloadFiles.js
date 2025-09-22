import path from 'path'
import fsp from 'fs/promises'
import debug from 'debug'
import getData from './getData.js'
import generateName from './generateName.js'

const log = debug('page-loader')

const downloadFiles = ($, url, filesDirPath, selector, attr) => {
  const links = $(selector).map((i, tag) => $(tag).attr(attr)).get()

  if (links.length === 0) {
    log('no %s links', selector)
    return Promise.resolve()
  }

  log(`download %ss`, selector)
  return fsp.mkdir(filesDirPath, { recursive: true })
    .then(() => Promise.all(links.map((link) => {
      const absLink = new URL(link, url)
      if (absLink.hostname !== new URL(url).hostname) {
        log('skip external link %s', absLink.href)
        return Promise.resolve()
      }
      const fileName = path.extname(absLink.pathname)
        ? generateName(absLink.href).replace(/-(?=[a-zA-Z0-9]+$)/, '.')
        : generateName(absLink.href) + '.html'
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
    }),
    ))
}

export default downloadFiles
