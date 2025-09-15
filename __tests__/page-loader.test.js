import path from 'path'
import fsp from 'fs/promises'
import { fileURLToPath } from 'url'
import downloadPage from '../src/index.js'
import nock from 'nock'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const getFixturePath = filename => path.join(__dirname, '..', '__fixtures__', filename)
const readFile = filename => fsp.readFile(getFixturePath(filename), 'utf-8')
let tempDir
let testPage

nock.disableNetConnect()

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
  testPage = await readFile('testpage.html')
})

test('page-loader', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, testPage)

  const outputFilePath = path.join(tempDir, 'ru-hexlet-io-courses.html')
  const receivedFilePath = await downloadPage('https://ru.hexlet.io/courses', tempDir)

  expect(receivedFilePath).toBe(outputFilePath)
  expect(await fsp.readFile(receivedFilePath, 'utf-8')).toBe(testPage)
})

test('page-loader no such directory', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, testPage)

  await expect(downloadPage('https://ru.hexlet.io/courses', 'unexistingDir'))
    .rejects.toThrow()
})
