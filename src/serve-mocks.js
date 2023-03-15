import express, { json, text } from 'express'
import cors from 'cors'
import { globSync } from 'glob'
import { resolve, sep } from 'path'
import { mockFileTypes } from './mock-file-types.js'
import { Logger } from './service/logger.js'
import { EndpointRegistrationService } from './service/endpoint-registration.service.js'
import { ScriptEvaluationService } from './service/script-evaluation.service.js'

/**
 * @typedef {Object} ServemocksOptions
 * @property {number} responseDelay_ms - default delay which will be added before sending a response
 * @property {'eval' | 'dynamicImport' | 'disabled'} dynamicMockResponsesMode
 * @property {'verbose' | 'compact' | 'disabled'} endpointRegistrationLogging
 */

/**
 * @type {ServemocksOptions}
 */
export const defaultServeMocksOptions = {
  responseDelay_ms: 100,
  dynamicMockResponsesMode: 'eval',
  endpointRegistrationLogging: 'verbose'
}

/**
 * @param {string} mockDirectory
 * @param {object} options
 * @return {Express}
 */
export function createServeMocksExpressApp (mockDirectory, options = {}) {
  /**
   * @type {ServemocksOptions}
   **/
  const effectiveOptions = {
    ...defaultServeMocksOptions,
    ...options
  }
  const logger = new Logger()
  const scriptEvaluationService = new ScriptEvaluationService(logger)
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
  const endpointRegistrationService = new EndpointRegistrationService(
    app,
    logger,
    scriptEvaluationService,
    mockFileRoot,
    effectiveOptions
  )

  logger.info('\nMOCK_DIR=' + mockFileRoot + '\n')
  logger.logTitle('Endpoints')
  for (const fileType of mockFileTypes) {
    const mockFilePattern = mockFileRoot + '/**/*' + fileType.extension
    const files = globSync(mockFilePattern)
    files.forEach(fileName => endpointRegistrationService.registerEndpoint(fileName, fileType))
  }
  if (effectiveOptions.endpointRegistrationLogging === 'compact') {
    logger.info('...')
    logger.info('Total number of API endpoints registered: ' + endpointRegistrationService.numberOfRegisteredEndpoints)
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
