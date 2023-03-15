import chalk from 'chalk'

/* eslint-disable require-jsdoc */
/* eslint-disable no-console */
export class Logger {
  /**
   * @param {string} httpMethod
   * @param {string} apiPath
   * @param {object} requestBody
   */
  logRequest (httpMethod, apiPath, requestBody = '') {
    console.log(chalk.blueBright(`Log Request(${httpMethod.toUpperCase()}): ${apiPath}`), chalk.blueBright(requestBody))
  }

  /**
   * @param {string} title
   */
  logTitle (title) {
    console.log(chalk.bold(title))
  }

  info (...params) {
    console.log(...params)
  }

  warn (...params) {
    const firstParam = params[0]
    const otherParams = params.slice(1)
    console.warn('WARN: ' + firstParam, ...otherParams)
  }

  error (...params) {
    const firstParam = params[0]
    const otherParams = params.slice(1)
    console.error('ERROR: ' + firstParam, ...otherParams)
  }
}
