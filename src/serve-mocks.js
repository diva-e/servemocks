import express, { json, text } from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import { globSync } from 'glob'
import chalk from 'chalk'
import { resolve, sep } from 'path'
import Ajv from 'ajv'
import { mockFileTypes } from './mock-file-types.js'
import { extractHttpMethod, HttpMethod } from './utilities/http-method.js'
import { runInNewContext } from 'vm'

const ajv = new Ajv()

/**
 * @param {object} mapping
 * @return {string}
 */

// String which will be replaced by '/' in api endpoint
// this is being used for directories which have the same name as a file like /test.jpg/medium
// you would name that file /test.jpg---medium.jpg
const SLASH_ALIAS = '---'

export const defaultServeMocksOptions = {
  //
  // possible values: 'dynamicImport', 'disabled', 'eval
  //
  dynamicMockResponsesMode: 'dynamicImport'
}

/**
 * @param {string} mockDirectory
 * @param {object} options
 * @return {express}
 */
export function createServeMocksExpressApp (mockDirectory, options = {}) {
  const effectiveOptions = {
    ...defaultServeMocksOptions,
    ...options
  }
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
  console.log('\nMOCK_DIR=' + mockFileRoot + '\n')

  console.log(chalk.bold('Endpoints:'))
  for (const fileType of mockFileTypes) {
    const mockFilePattern = mockFileRoot + '/**/*' + fileType.extension
    const files = globSync(mockFilePattern)

    files.forEach(function (fileName) {
      let mapping = fileName
        .replace(mockFileRoot, '')
        .replace(SLASH_ALIAS, '/')
        .replace(SLASH_ALIAS, '/')
      if (fileType.removeFileExtension === true) {
        mapping = mapping.replace(fileType.extension, '')
      }

      const httpMethod = extractHttpMethod(mapping)
      const apiPath = mapping.replace(`.${httpMethod}`, '')

      switch (httpMethod) {
      case HttpMethod.GET:
        app.get(apiPath, async function (req, res) {
          let responseBody
          let errorObject
          console.log(chalk.blueBright(`receiving GET request on ${apiPath}`))
          if (fileType.extension === '.mjs' && effectiveOptions.dynamicMockResponsesMode !== 'disabled') {
            const context = {
              query: req.query || {},
              path: req.path,
              responseBody: {
                errorMessage: 'the mock file did not provide any responseBody'
              },
            }
            try {
              if (effectiveOptions.dynamicMockResponsesMode === 'dynamicImport') {
                console.log('ENTER dynamicImport')
                const { default: module } = await import(fileName)
                if (module) {
                  responseBody = JSON.stringify(module(context), null, 2)
                } else {
                  errorObject = { message: 'could not execute default export of javascript module' }
                  console.error('ERROR:' + errorObject.message + ' ' +
                    fileName + ' for GET endpoint ' + apiPath)
                }
              } else {
                console.log('ENTER eval')
                let scriptContent = readFileSync(fileName, fileType.encoding).toString()
                if (scriptContent.includes('export default function')) {
                  scriptContent = scriptContent.replace('export default function', 'globalThis.responseBody = function')
                  scriptContent += '(globalThis.context)'
                } else {
                  console.warn('WARN: no "export default function" section found in ' + fileName)
                }
                const vmContext = { context }
                responseBody = JSON.stringify(runInNewContext(scriptContent, vmContext), null, 2)
                responseBody = JSON.stringify(vmContext.responseBody)
              }
            } catch (error) {
              errorObject = error
              console.error('ERROR: could not load javascript module ' + fileName + ' for GET endpoint ' + apiPath)
            }
          } else {
            responseBody = readFileSync(fileName, fileType.encoding)
          }
          if (!errorObject) {
            res.writeHead(200, { 'Content-Type': fileType.contentType })
            res.write(responseBody, fileType.encoding)
            res.end()
          } else {
            res.writeHead(500, { 'Content-Type': fileType.contentType })
            res.write({ error: errorObject }, fileType.encoding)
            res.end()
          }
        })
        break
      case HttpMethod.POST:
        app.post(apiPath, function (req, res) {
          const endpointParams = JSON.parse(readFileSync(fileName, 'utf8'))
          const responseOptions = endpointParams.responseOptions ? endpointParams.responseOptions : {}
          const requestOptions = endpointParams.requestOptions ? endpointParams.requestOptions : {}
          const requestValidation = requestOptions.validation ? requestOptions.validation : {}
          const responseDelay = responseOptions.delay_ms ? responseOptions.delay_ms : 2000
          const statusCode = responseOptions.statusCode ? responseOptions.statusCode : 200
          let response = endpointParams.response ? endpointParams.response : { success: true }
          console.log(`receiving POST request on ${apiPath} with body:`, req.body)

          setTimeout(() => {
            // validate request body against json schema if provided in requestOptions
            if (requestValidation.jsonSchema) {
              const isValid = ajv.compile(requestValidation.jsonSchema)
              if (!isValid(req.body)) {
                const errors = isValid.errors
                console.info('validation of request body failed; errors:', errors)
                res.status(422).send({
                  message: 'request body is not compliant to the expected schema',
                  errors
                })
                return
              }
            }

            if (responseOptions.respondWithRequestBody === true) {
              res.set('Content-Type', req.get('Content-Type'))
              response = req.body
            }

            res.status(statusCode).send(response)
          }, responseDelay)
        })
        break
      default:
        throw new Error('Unknown Http Method')
      }

      console.log(
        '%s %s \n  ⇒ %s (%s)',
        httpMethod.toUpperCase(),
        apiPath,
        fileName.replace(mockFileRoot, '$MOCK_DIR'),
        fileType.contentType
      )
    })
  }
  return app
}

/**
 * @param {string} mockDirectory
 * @param {number} [port]
 * @param {string} hostname
 * @param {object} options
 * @return {express}
 */
export function serveMocks (mockDirectory, port, hostname, options = {}) {
  const app = createServeMocksExpressApp(mockDirectory, options)

  if (port && hostname) {
    console.log(`\nServing mocks [http://${hostname}:${port}]`)
    app.listen(port, hostname)
  } else {
    console.info('No port or hostname was provided, so server will not be started automatically')
  }

  return app
}
