import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { createInterface } from 'readline'
import SwaggerParser from '@apidevtools/swagger-parser'
import chalk from 'chalk'
import { Logger } from './logger.js'

/** @type {string[]} */
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete']

/**
 * Service for importing OpenAPI specifications
 */
class OpenAPIImportService {
  /**
   * @param {object} options
   * @param {boolean} [options.ignoreExamples]
   */
  constructor (options = {}) {
    this.ignoreExamples = options.ignoreExamples || false
    this.logger = new Logger()
  }

  /**
   * @param {string} specPath
   * @param {string} outputDir
   */
  async importSpec (specPath, outputDir) {
    this.specPath = specPath
    this.outputDir = outputDir

    let api
    try {
      api = await SwaggerParser.validate(specPath)
    } catch (err) {
      this.logger.error(`Invalid OpenAPI specification: ${err.message}`)
      process.exit(1)
    }

    if (!api.openapi || !api.openapi.startsWith('3.')) {
      this.logger.error('Only OpenAPI 3.x specifications are supported')
      process.exit(1)
    }

    this.api = api
    this.paths = api.paths || {}

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
      this.logger.info(`Created output directory: ${outputDir}`)
    }

    await this.processPaths()
  }

  /**
   * @private
   */
  async processPaths () {
    let importedCount = 0

    for (const [path, pathItem] of Object.entries(this.paths)) {
      const pathWithoutLeadingSlash = path.replace(/^\//, '')
      const normalizedPath = this.normalizePath(pathWithoutLeadingSlash)

      for (const method of HTTP_METHODS) {
        const operation = pathItem[method]
        if (!operation) continue

        const fileName = this.generateFileName(normalizedPath, method)
        const content = this.generateMockContent(operation)

        const conflictResult = await this.handleConflict(fileName, content)
        if (conflictResult === 'skip') {
          this.logger.info(chalk.yellow(`Skipped: ${fileName}`))
          continue
        }

        importedCount++
      }
    }

    this.logger.info(chalk.green(`Successfully imported ${importedCount} endpoints`))
  }

  /**
   * @param {string} path
   * @return {string}
   * @private
   */
  normalizePath (path) {
    return path.replace(/{([^}]+)}/g, '[$1]')
  }

  /**
   * @param {string} path
   * @param {string} method
   * @return {string}
   * @private
   */
  generateFileName (path, method) {
    const parts = path.split('/')
    const resultParts = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.startsWith('[') && part.endsWith(']') && !part.includes('[any]')) {
        const paramName = part.slice(1, -1)
        resultParts.push('[any]', paramName)
      } else if (part === '[any]') {
        resultParts.push('[any]')
      } else {
        resultParts.push(part)
      }
    }

    const hasFileExtension = resultParts[resultParts.length - 1].includes('.')
    if (!hasFileExtension) {
      resultParts.push('')
    }

    const filePath = resultParts.join('/')
    const finalPath = filePath.endsWith('/') ? filePath.slice(0, -1) : filePath

    return join(this.outputDir, `${finalPath}.${method}.json`)
  }

  /**
   * @param {object} operation
   * @return {string}
   * @private
   */
  generateMockContent (operation) {
    const mock = {
      requestOptions: {},
      responseOptions: {
        statusCode: this.getStatusCode(operation.responses)
      },
      response: this.generateResponse(operation)
    }

    const requestBody = operation.requestBody
    if (requestBody) {
      const schema = this.getContentSchema(requestBody.content)
      if (schema) {
        const jsonSchema = this.generateJsonSchema(schema)
        if (jsonSchema) {
          mock.requestOptions = {
            validation: {
              jsonSchema
            }
          }
        }
      }
    }

    return JSON.stringify(mock, null, 2)
  }

  /**
   * @param {object} responses
   * @return {number}
   * @private
   */
  getStatusCode (responses) {
    if (!responses) return 200

    const statusCodes = Object.keys(responses)
      .map(s => parseInt(s))
      .filter(s => s >= 200 && s < 300)

    return statusCodes.length > 0 ? statusCodes[0] : 200
  }

  /**
   * @param {object} operation
   * @return {object}
   * @private
   */
  generateResponse (operation) {
    const responses = operation.responses || {}

    const successResponse = Object.entries(responses)
      .find(([code]) => parseInt(code) >= 200 && parseInt(code) < 300) ||
      Object.entries(responses)[0]

    if (!successResponse) {
      return { message: 'No response defined' }
    }

    const [, response] = successResponse
    const content = response.content

    if (!content) {
      return { message: 'No content defined' }
    }

    const jsonContent = content['application/json']
    if (!jsonContent) {
      return { message: 'No application/json content defined' }
    }

    if (!this.ignoreExamples && jsonContent.example) {
      return jsonContent.example
    }

    if (!this.ignoreExamples && jsonContent.examples && Object.keys(jsonContent.examples).length > 0) {
      const firstExample = Object.values(jsonContent.examples)[0]
      return firstExample.value
    }

    const schema = jsonContent.schema
    if (!schema) {
      return { message: 'No schema defined' }
    }

    return this.generateExampleFromSchema(schema)
  }

  /**
   * @param {object} content
   * @return {object|null}
   * @private
   */
  getContentSchema (content) {
    if (!content) return null

    const jsonContent = content['application/json']
    if (!jsonContent) return null

    return jsonContent.schema || jsonContent
  }

  /**
   * @param {object} schema
   * @return {object|null}
   * @private
   */
  generateJsonSchema (schema) {
    if (!schema) return null

    const jsonSchema = this.convertToJsonSchema(schema)

    if (jsonSchema.type === 'object' || jsonSchema.properties) {
      return jsonSchema
    }

    if (jsonSchema.type === 'array' && jsonSchema.items) {
      return {
        type: 'array',
        items: jsonSchema.items
      }
    }

    return null
  }

  /**
   * @param {object} schema
   * @param {Map} visited
   * @return {object}
   * @private
   */
  convertToJsonSchema (schema, visited = new Map()) {
    if (!schema) return {}

    if (schema.$ref) {
      return this.resolveRef(schema.$ref)
    }

    const key = JSON.stringify(schema)
    if (visited.has(key)) {
      return visited.get(key)
    }

    const result = {}

    if (schema.type) {
      result.type = schema.type
    }

    if (schema.properties) {
      result.properties = {}
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        result.properties[propName] = this.convertToJsonSchema(propSchema, visited)
      }
    }

    if (schema.required && Array.isArray(schema.required)) {
      result.required = schema.required
    }

    if (schema.items) {
      result.items = this.convertToJsonSchema(schema.items, visited)
    }

    if (schema.enum) {
      result.enum = schema.enum
    }

    if (schema.allOf) {
      result.allOf = schema.allOf.map(s => this.convertToJsonSchema(s, visited))
    }

    if (schema.oneOf) {
      result.oneOf = schema.oneOf.map(s => this.convertToJsonSchema(s, visited))
    }

    if (schema.anyOf) {
      result.anyOf = schema.anyOf.map(s => this.convertToJsonSchema(s, visited))
    }

    visited.set(key, result)
    return result
  }

  /**
   * @param {string} ref
   * @return {object}
   * @private
   */
  resolveRef (ref) {
    if (!this.api) return {}

    const parts = ref.replace('#/', '').split('/')
    let current = this.api

    for (const part of parts) {
      if (current[part]) {
        current = current[part]
      } else {
        return {}
      }
    }

    return current
  }

  /**
   * @param {object} schema
   * @return {*}
   * @private
   */
  generateExampleFromSchema (schema) {
    if (!schema) return {}

    if (schema.$ref) {
      return this.generateExampleFromSchema(this.resolveRef(schema.$ref))
    }

    if (schema.example !== undefined) {
      return schema.example
    }

    switch (schema.type) {
    case 'object':
      return this.generateObjectExample(schema)
    case 'array':
      return this.generateArrayExample(schema)
    case 'string':
      return this.generateStringExample(schema)
    case 'integer':
    case 'number':
      return this.generateNumberExample(schema)
    case 'boolean':
      return true
    case 'null':
      return null
    default:
      return {}
    }
  }

  /**
   * @param {object} schema
   * @return {object}
   * @private
   */
  generateObjectExample (schema) {
    const obj = {}
    const properties = schema.properties || {}
    const required = schema.required || []

    for (const [propName, propSchema] of Object.entries(properties)) {
      const isRequired = required.includes(propName)

      if (isRequired) {
        obj[propName] = this.generateExampleFromSchema(propSchema)
      } else if (Math.random() > 0.5) {
        obj[propName] = this.generateExampleFromSchema(propSchema)
      }
    }

    if (Object.keys(obj).length === 0 && Object.keys(properties).length > 0) {
      for (const [propName, propSchema] of Object.entries(properties)) {
        obj[propName] = this.generateExampleFromSchema(propSchema)
      }
    }

    return obj
  }

  /**
   * @param {object} schema
   * @return {array}
   * @private
   */
  generateArrayExample (schema) {
    const items = schema.items
    if (!items) return []

    const exampleCount = Math.min(3, schema.minItems || 3)
    const examples = []

    for (let i = 0; i < exampleCount; i++) {
      examples.push(this.generateExampleFromSchema(items))
    }

    return examples
  }

  /**
   * @param {object} schema
   * @return {string}
   * @private
   */
  generateStringExample (schema) {
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0]
    }

    if (schema.format) {
      switch (schema.format) {
      case 'date':
        return '2024-01-01'
      case 'date-time':
        return '2024-01-01T00:00:00Z'
      case 'email':
        return 'user@example.com'
      case 'uri':
      case 'url':
        return 'https://example.com'
      case 'uuid':
        return '550e8400-e29b-41d4-a716-446655440000'
      case 'hostname':
        return 'example.com'
      case 'ipv4':
        return '192.168.1.1'
      case 'ipv6':
        return '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
      default:
        break
      }
    }

    return 'string'
  }

  /**
   * @param {object} schema
   * @return {number}
   * @private
   */
  generateNumberExample (schema) {
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0]
    }

    const min = schema.minimum || 0
    const max = schema.maximum || 100

    if (schema.type === 'integer') {
      return Math.floor((min + max) / 2)
    }

    return (min + max) / 2
  }

  /**
   * @param {string} filePath
   * @param {string} content
   * @return {Promise<string>}
   * @private
   */
  async handleConflict (filePath, content) {
    if (!existsSync(filePath)) {
      const dir = dirname(filePath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(filePath, content)
      this.logger.info(`Created: ${filePath}`)
      return 'created'
    }

    this.logger.warn(`\nConflict detected: ${filePath}`)
    this.logger.warn('  (s)kip - skip this file')
    this.logger.warn('  (o)verwrite - overwrite existing file')
    this.logger.warn('  (a)bort - abort import')

    const answer = await this.promptUser()

    switch (answer.toLowerCase()) {
    case 's':
      return 'skip'
    case 'o':
      writeFileSync(filePath, content)
      this.logger.info(`Overwritten: ${filePath}`)
      return 'overwritten'
    case 'a':
      this.logger.error('Import aborted by user')
      process.exit(1)
      break
    default:
      return this.handleConflict(filePath, content)
    }
  }

  /**
   * @return {Promise<string>}
   * @private
   */
  promptUser () {
    return new Promise((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question('Choose action (s/o/a): ', (answer) => {
        rl.close()
        resolve(answer || 's')
      })
    })
  }
}

/**
 * @param {string} specPath
 * @param {string} outputDir
 * @param {object} options
 * @param {boolean} [options.ignoreExamples]
 */
export async function importOpenAPI (specPath, outputDir, options = {}) {
  const service = new OpenAPIImportService(options)
  await service.importSpec(specPath, outputDir)
}
