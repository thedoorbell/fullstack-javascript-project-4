import path from 'path'
import fsp from 'fs/promises'
import { fileURLToPath } from 'url'
import nock from 'nock'
import os from 'os'
import downloadPage from '../src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const getFixturePath = filename => path.join(__dirname, '..', '__fixtures__', filename)
const readFile = filename => fsp.readFile(getFixturePath(filename), 'utf-8')
const readImg = filename => fsp.readFile(getFixturePath(filename))
let tempDir
let html
let expectedHtml
let testImage

nock.disableNetConnect()

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
  html = await readFile('ru-hexlet-io-courses.html')
  expectedHtml = await readFile('expected-ru-hexlet-io-courses.html')
  testImage = await readImg('ru-hexlet-io-assets-professions-nodejs.png')
})

test('page-loader', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)
  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, testImage)

  const expectedFilePath = path.join(tempDir, 'ru-hexlet-io-courses.html')
  const expectedFilesDir = path.join(tempDir, 'ru-hexlet-io-courses_files')
  const imagePath = path.join(expectedFilesDir, 'ru-hexlet-io-assets-professions-nodejs.png')

  const receivedFilePath = await downloadPage('https://ru.hexlet.io/courses', tempDir)
  const downloadedHtml = await fsp.readFile(receivedFilePath, 'utf-8')
  const downloadedImage = await fsp.readFile(imagePath)

  expect(receivedFilePath).toBe(expectedFilePath)
  expect(downloadedHtml).toBe(expectedHtml)
  await expect(fsp.access(expectedFilesDir)).resolves.not.toThrow()
  expect(downloadedImage).toEqual(testImage)
})

test('page-loader no such directory', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)

  await expect(downloadPage('https://ru.hexlet.io/courses', 'unexistingDir'))
    .rejects.toThrow()
})
