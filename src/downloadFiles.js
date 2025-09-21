import path from 'path'
import fsp from 'fs/promises'
import getData from './getData.js'
import generateName from './generateName.js'

const downloadFiles = ($, url, filesDirPath, selector, attr) => {
  const links = $(selector).map((i, tag) => $(tag).attr(attr)).get()

  if (links.length === 0) {
    return Promise.resolve()
  }

  return fsp.mkdir(filesDirPath, { recursive: true })
    .then(() => Promise.all(links.map((link) => {
      const absLink = new URL(link, url)
      if (absLink.hostname !== new URL(url).hostname) {
        return Promise.resolve()
      }
      const fileName = path.extname(absLink.pathname)
        ? generateName(absLink.href).replace(/-(?=[a-zA-Z0-9]+$)/, '.')
        : generateName(absLink.href) + '.html'
      const filePath = path.join(filesDirPath, fileName)

      return getData(absLink.href)
        .then(data => fsp.writeFile(filePath, data))
        .then(() => {
          $(selector).each((i, tag) => {
            if ($(tag).attr(attr) === link) {
              $(tag).attr(attr, path.join(path.basename(filesDirPath), fileName))
            }
          })
        })
    }),
    ))
}

export default downloadFiles
