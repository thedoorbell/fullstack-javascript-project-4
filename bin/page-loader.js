#!/usr/bin/env node

import { program } from 'commander'
import downloadPage from '../src/index.js'

program
  .name('Page loader')
  .description('Page loader utility.')
  .version('1.0.0')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => {
    downloadPage(url, options.output)
      .then(filePath => console.log(filePath))
  })

program.parse()
