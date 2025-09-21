const generateName = (url) => {
  const href = new URL(url)
  return (href.hostname + href.pathname).replace(/[^a-zA-Z0-9]/g, '-')
}

export default generateName
