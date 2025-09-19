import path from 'path'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'
import getData from './getData.js'
import getLinks from './getLinks.js'
import * as prettier from 'prettier'

const getAbsolutePath = dirpath => path.resolve(process.cwd(), dirpath)

const generateName = (url) => {
  const href = new URL(url)
  return (href.hostname + href.pathname).replace(/[^a-zA-Z0-9]/g, '-')
}

const downloadPage = (url, outputDir) => {
  const fileName = generateName(url) + '.html'
  const filePath = path.join(getAbsolutePath(outputDir), fileName)
  const filesDirName = generateName(url) + '_files'
  const filesDirPath = path.join(getAbsolutePath(outputDir), filesDirName)
  let links
  let $

  return getData(url)
    .then((html) => {
      $ = cheerio.load(html)
      links = getLinks(html)

      if (links.length === 0) {
        return null
      }
      return fsp.mkdir(filesDirPath)
    })
    .then(() => {
      if (links.length === 0) {
        return null
      }
      return Promise.all(links.map((link) => {
        const absoluteLink = new URL(link, url).href
        const imageName = generateName(absoluteLink).replace(/-(?=[a-zA-Z0-9]+$)/, '.')
        const imagePath = path.join(filesDirPath, imageName)

        return getData(absoluteLink)
          .then(imgData => fsp.writeFile(imagePath, imgData))
          .then(() => {
            $('img').each((i, tag) => {
              if ($(tag).attr('src') === link) {
                $(tag).attr('src', path.join(filesDirName, imageName))
              }
            })
          })
      }),
      )
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
