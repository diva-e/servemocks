import express, { json, text } from 'express'
import cors from 'cors'
import { globSync } from 'glob'
import { resolve, sep } from 'path'
import { mockFileTypes } from './mock-file-types.js'
import { Logger } from './utilities/logger.js'
import { registerEndpoint } from './utilities/register-endpoint.js'

/**
 * @typedef {Object} ServemocksOptions
 * @property {number} responseDelay_ms - default delay which will be added before sending a response
 * @property {'eval' | 'dynamicImport' | 'disabled'} dynamicMockResponsesMode
 */

/**
 * @type {ServemocksOptions}
 */
export const defaultServeMocksOptions = {
  responseDelay_ms: 100,
  dynamicMockResponsesMode: 'dynamicImport',
}

/**
 * @param {string} mockDirectory
 * @param {object} options
 * @return {Express}
 */
export function createServeMocksExpressApp (mockDirectory, options = {}) {
  const effectiveOptions = {
    ...defaultServeMocksOptions,
    ...options
  }
  const logger = new Logger()
  const app = express()
  app.use(cors())
  app.use(json({ limit: '20mb' }))
  app.use(text({ limit: '20mb', type: ['application/xml', 'text/plain', 'text/css', 'text/html'] }))

  if (!mockDirectory.startsWith('/')) {
    mockDirectory = '/' + mockDirectory
  }

  if (mockDirectory.endsWith('/')) {
    mockDirectory = mockDirectory.slice(0, -1)
  }

  let currentWorkingDirectory = process.cwd()
  const isPathSeparatorBackslash = sep === '\\' // true on Windows systems

  if (isPathSeparatorBackslash) {
    // replace backslashes for compatibility with paths returned by glob.sync
    // which is always using slashes as path separator
    currentWorkingDirectory = currentWorkingDirectory.replace(/\\/g, '/')
  }

  const mockFileRoot = resolve(currentWorkingDirectory + mockDirectory)
  logger.info('\nMOCK_DIR=' + mockFileRoot + '\n')
  logger.logTitle('Endpoints')
  for (const fileType of mockFileTypes) {
    const mockFilePattern = mockFileRoot + '/**/*' + fileType.extension
    const files = globSync(mockFilePattern)

    files.forEach(registerEndpoint(mockFileRoot, fileType, app, logger, effectiveOptions))
  }
  return app
}

/**
 * @param {string} mockDirectory
 * @param {number} [port]
 * @param {string} hostname
 * @param {object} options
 * @return {Express}
 */
export function serveMocks (mockDirectory, port, hostname, options = {}) {
  const app = createServeMocksExpressApp(mockDirectory, options)
  const logger = new Logger()

  if (port && hostname) {
    logger.info(`\nServing mocks [http://${hostname}:${port}]`)
    app.listen(port, hostname)
  } else {
    logger.warn('No port or hostname was provided, the server will not start automatically')
  }

  return app
}
