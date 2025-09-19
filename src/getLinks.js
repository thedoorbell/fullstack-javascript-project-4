import * as cheerio from 'cheerio'

const getLinks = (html) => {
  const $ = cheerio.load(html)
  const imgTags = $('img')
  const links = imgTags.map((i, tag) => $(tag).attr('src')).get()
  return links
}

export default getLinks
