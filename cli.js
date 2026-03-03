#!/usr/bin/env node

import { program } from 'commander'
import { serveMocks } from './src/serve-mocks.js'
import { importOpenAPI } from './src/service/openapi-import.service.js'
import { readFileSync } from 'fs'
import { Logger } from './src/service/logger.js'

import { fileURLToPath } from 'url'
import path from 'path'

const logger = new Logger()

const packageJsonPath = path.join(fileURLToPath(import.meta.url), '../package.json')
const { version } = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }))

const hostname = process.env.SERVEMOCKS_HOST || '127.0.0.1'

program
  .name('servemocks')
  .description('Conventional Mock-Server')
  .version(version)

program
  .command('import <spec-file> <output-dir>')
  .description('Import endpoints from an OpenAPI 3.x specification')
  .option('-i, --ignore-examples', 'Ignore examples in the spec and generate our own')
  .action(async (specFile, outputDir, options) => {
    try {
      await importOpenAPI(specFile, outputDir, {
        ignoreExamples: options.ignoreExamples
      })
    } catch (error) {
      logger.error('Import failed:', error.message)
      process.exit(1)
    }
  })

program
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

program.parse(process.argv)