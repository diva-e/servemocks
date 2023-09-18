#!/usr/bin/env node

import { program } from 'commander'
import { serveMocks } from './src/serve-mocks.js'
import { readFileSync } from 'fs'

import { fileURLToPath } from 'url'
import path from 'path'

const packageJsonPath = path.join(fileURLToPath(import.meta.url), '../package.json')
const { version } = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }))

const hostname = process.env.SERVEMOCKS_HOST || '127.0.0.1'

program
  .version(version)
  .arguments('<mock-directory>')
  .option('-p, --port <port>', 'Change webserver port')
  .option('-c, --compact-logging', 'Limits the number of endpoints which are being printed to the console on init')
  .action(function (mockDirectory, env) {
    const options = {}
    if (env.compactLogging) {
      options.endpointRegistrationLogging = 'compact'
    }
    serveMocks(mockDirectory, env.port || 8080, hostname, options)
  })
  .parse(process.argv)
