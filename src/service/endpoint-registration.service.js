import { extractHttpMethod, HttpMethod } from '../utilities/http-method.js'
import { sleep } from '../utilities/async-utilities.js'
import { readFileSync } from 'fs'
import Ajv from 'ajv'

const ajv = new Ajv()

// String which will be replaced by '/' in api endpoint
// this is being used for directories which have the same name as a file like /test.jpg/medium
// you would name that file /test.jpg---medium.jpg
const SLASH_ALIAS = '---'
const maxNumberOfLogEntriesInCompactMode = 2

// eslint-disable-next-line require-jsdoc
export class EndpointRegistrationService {
  /**
   * @param {Express} app
   * @param {Logger} logger
   * @param {ScriptEvaluationService} scriptEvaluationService
   * @param {string} mockFileRoot
   * @param {ServemocksOptions} options
   */
  constructor (app, logger, scriptEvaluationService, mockFileRoot, options) {
    this.app = app
    this.logger = logger
    this.scriptEvaluationService = scriptEvaluationService
    this.mockFileRoot = mockFileRoot
    this.options = options
    this.numberOfRegisteredEndpoints = 0
    this._isLoggingVerbose = options.endpointRegistrationLogging === 'verbose'
    this._isLoggingCompact = options.endpointRegistrationLogging === 'compact'
  }

  /**
   * @return {boolean}
   * @private
   */
  get _isEndpointLoggingEnabled () {
    return (
      this._isLoggingVerbose ||
      (this._isLoggingCompact && this.numberOfRegisteredEndpoints < maxNumberOfLogEntriesInCompactMode)
    )
  }

  /**
   * @param {string} fileName
   * @param {{extension: string, removeFileExtension: boolean, encoding: string, contentType: string}} fileType
   */
  registerEndpoint (fileName, fileType) {
    let mapping = fileName
      .replace(this.mockFileRoot, '')
      .replace(SLASH_ALIAS, '/')
      .replace(SLASH_ALIAS, '/')
    if (fileType.removeFileExtension === true) {
      mapping = mapping.replace(fileType.extension, '')
    }

    const httpMethod = extractHttpMethod(mapping)
    const apiPath = mapping.replace(`.${httpMethod}`, '')

    switch (httpMethod) {
    case HttpMethod.GET:
      this.app.get(apiPath, this.createGetEndpoint(apiPath, fileType, fileName))
      break
    case HttpMethod.POST:
      this.app.post(apiPath, this.createMutationEndpoint(fileName, apiPath, httpMethod))
      break
    case HttpMethod.DELETE:
      this.app.delete(apiPath, this.createMutationEndpoint(fileName, apiPath, httpMethod))
      break
    case HttpMethod.PUT:
      this.app.put(apiPath, this.createMutationEndpoint(fileName, apiPath, httpMethod))
      break
    case HttpMethod.PATCH:
      this.app.patch(apiPath, this.createMutationEndpoint(fileName, apiPath, httpMethod))
      break
    default:
      throw new Error('Unknown Http Method')
    }

    if (this._isEndpointLoggingEnabled) {
      this.logger.info(
        '%s %s \n  ⇒ %s (%s)',
        httpMethod.toUpperCase(),
        apiPath,
        fileName.replace(this.mockFileRoot, '$MOCK_DIR'),
        fileType.contentType,
      )
    }
    this.numberOfRegisteredEndpoints++
  }

  /**
   * @param {string} apiPath
   * @param {string} fileType
   * @param {string} fileName
   * @return {(function(*, *): Promise<void>)|*}
   */
  createGetEndpoint (apiPath, fileType, fileName) {
    return async (req, res) => {
      this.logger.logRequest(HttpMethod.GET, apiPath)
      await sleep(this.options.responseDelay_ms)
      let responseBody
      let errorObject
      if (fileType.extension === '.mjs' && this.options.dynamicMockResponsesMode !== 'disabled') {
        const context = {
          query: req.query || {},
          path: req.path,
          responseBody: {
            errorMessage: 'the mock file did not provide any responseBody',
          },
        }
        try {
          if (this.options.dynamicMockResponsesMode === 'dynamicImport') {
            // NOTE: using template syntax here to avoid webpack/angular related warning
            const { default: module } = await import(`${fileName}`)
            if (module) {
              const result = module(context)
              if (result) {
                responseBody = JSON.stringify(result, null, 2)
              }
            } else {
              errorObject = { message: 'could not execute default export of javascript module' }
              this.logger.error(errorObject.message + ' ' + fileName + ' for GET endpoint ' + apiPath)
            }
          } else {
            const result = this.scriptEvaluationService.evaluateScriptFile(fileName, fileType.encoding, context)
            responseBody = result.responseBody
            errorObject = result.error
          }
        } catch (error) {
          errorObject = error
          this.logger.error('could not load javascript module ' + fileName + ' for GET endpoint ' + apiPath)
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
        res.write(JSON.stringify({ error: errorObject }), fileType.encoding)
        res.end()
      }
    }
  }

  /**
   * Registers endpoints for http methods other than GET
   * @param {string} fileName
   * @param {string} apiPath
   * @param {HttpMethod} httpMethod
   * @return {(function(*, *): Promise<void>)|*}
   */
  createMutationEndpoint (fileName, apiPath, httpMethod) {
    return async (req, res) => {
      const endpointParams = JSON.parse(readFileSync(fileName, 'utf8'))
      const responseOptions = endpointParams.responseOptions ? endpointParams.responseOptions : {}
      const requestOptions = endpointParams.requestOptions ? endpointParams.requestOptions : {}
      const requestValidation = requestOptions.validation ? requestOptions.validation : {}
      const responseDelay = responseOptions.delay_ms ? responseOptions.delay_ms : this.options.responseDelay_ms
      const statusCode = responseOptions.statusCode ? responseOptions.statusCode : 200
      let response = endpointParams.response ? endpointParams.response : { success: true }
      this.logger.logRequest(httpMethod, apiPath, req.body)
      this.numberOfRegisteredEndpoints++

      await sleep(responseDelay)

      // validate request body against json schema if provided in requestOptions
      if (requestValidation.jsonSchema) {
        const isValid = ajv.compile(requestValidation.jsonSchema)
        if (!isValid(req.body)) {
          const errors = isValid.errors
          this.logger.info('validation of request body failed; errors:', errors)
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
    }
  }
}
