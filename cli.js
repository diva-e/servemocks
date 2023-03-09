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
  .action(function (mockDirectory, env) {
    serveMocks(mockDirectory, env.port || 8080, hostname)
  })
  .parse(process.argv)
