import { extractHttpMethod, HttpMethod } from './http-method.js'
import { sleep } from './async-utilities.js'
import { readFileSync } from 'fs'
import { runInNewContext } from 'vm'
import Ajv from 'ajv'

const ajv = new Ajv()

// String which will be replaced by '/' in api endpoint
// this is being used for directories which have the same name as a file like /test.jpg/medium
// you would name that file /test.jpg---medium.jpg
const SLASH_ALIAS = '---'

/**
 * @param {string} mockFileRoot
 * @param {{extension: string, removeFileExtension: boolean, encoding: string, contentType: string}} fileType
 * @param {Express} app
 * @param {Logger} logger
 * @param {ServemocksOptions} options
 * @return {Function}
 */
export function registerEndpoint (mockFileRoot, fileType, app, logger, options) {
  return function (fileName) {
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
        logger.logRequest(HttpMethod.GET, apiPath)
        await sleep(options.responseDelay_ms)
        let responseBody
        let errorObject
        if (fileType.extension === '.mjs' && options.dynamicMockResponsesMode !== 'disabled') {
          const context = {
            query: req.query || {},
            path: req.path,
            responseBody: {
              errorMessage: 'the mock file did not provide any responseBody',
            },
          }
          try {
            if (options.dynamicMockResponsesMode === 'dynamicImport') {
              const { default: module } = await import(fileName)
              if (module) {
                responseBody = JSON.stringify(module(context), null, 2)
              } else {
                errorObject = { message: 'could not execute default export of javascript module' }
                logger.error('ERROR:' + errorObject.message + ' ' +
                  fileName + ' for GET endpoint ' + apiPath)
              }
            } else {
              let scriptContent = readFileSync(fileName, fileType.encoding).toString()
              if (scriptContent.includes('export default function')) {
                scriptContent = scriptContent.replace('export default function', 'globalThis.responseBody = function')
                scriptContent += '(globalThis.context)'
              } else {
                logger.warn('no "export default function" section found in ' + fileName)
              }
              const vmContext = { context }
              responseBody = JSON.stringify(runInNewContext(scriptContent, vmContext), null, 2)
              responseBody = JSON.stringify(vmContext.responseBody)
            }
          } catch (error) {
            errorObject = error
            logger.error('could not load javascript module ' + fileName + ' for GET endpoint ' + apiPath)
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
      app.post(apiPath, async function (req, res) {
        const endpointParams = JSON.parse(readFileSync(fileName, 'utf8'))
        const responseOptions = endpointParams.responseOptions ? endpointParams.responseOptions : {}
        const requestOptions = endpointParams.requestOptions ? endpointParams.requestOptions : {}
        const requestValidation = requestOptions.validation ? requestOptions.validation : {}
        const responseDelay = responseOptions.delay_ms ? responseOptions.delay_ms : options.responseDelay_ms
        const statusCode = responseOptions.statusCode ? responseOptions.statusCode : 200
        let response = endpointParams.response ? endpointParams.response : { success: true }
        logger.logRequest(HttpMethod.POST, apiPath, req.body)

        await sleep(responseDelay)

        // validate request body against json schema if provided in requestOptions
        if (requestValidation.jsonSchema) {
          const isValid = ajv.compile(requestValidation.jsonSchema)
          if (!isValid(req.body)) {
            const errors = isValid.errors
            logger.info('validation of request body failed; errors:', errors)
            res.status(422).send({
              message: 'request body is not compliant to the expected schema',
              errors,
            })
            return
          }
        }

        if (responseOptions.respondWithRequestBody === true) {
          res.set('Content-Type', req.get('Content-Type'))
          response = req.body
        }

        res.status(statusCode).send(response)
      })
      break
    default:
      throw new Error('Unknown Http Method')
    }

    logger.info(
      '%s %s \n  ⇒ %s (%s)',
      httpMethod.toUpperCase(),
      apiPath,
      fileName.replace(mockFileRoot, '$MOCK_DIR'),
      fileType.contentType,
    )
  }
}
