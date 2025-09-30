import path from 'path'

const generateName = (url) => {
  const href = new URL(url)
  const baseName = (href.hostname + href.pathname).replace(/[^a-zA-Z0-9]/g, '-')
  return path.extname(href.pathname)
    ? baseName.replace(/-(?=[a-zA-Z0-9]+$)/, '.')
    : baseName + '.html'
}

export default generateName
