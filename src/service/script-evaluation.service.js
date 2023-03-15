import { readFileSync } from 'fs'
import { runInNewContext } from 'vm'

// eslint-disable-next-line require-jsdoc
export class ScriptEvaluationService {
  /**
   * @param {Logger} logger
   */
  constructor (logger) {
    this.logger = logger
  }

  /**
   * @param {string} fileName
   * @param {string} encoding
   * @param {object} context
   * @return {{responseBody: string, error: (Error | null) }}
   */
  evaluateScriptFile (fileName, encoding, context) {
    let responseBody = {
      errorMessage: 'the mock file did not provide any responseBody',
    }
    let error = null
    let scriptContent = readFileSync(fileName, encoding).toString()
    if (scriptContent.includes('export default function')) {
      scriptContent = scriptContent.replace('export default function', '(function')
      scriptContent += ')(globalThis.context)'
    } else {
      error = new Error('script file did not meet expectations')
      this.logger.warn('no "export default function" section found in ' + fileName)
    }
    const vmContext = { context }
    const scriptResult = runInNewContext(scriptContent, vmContext)
    if (scriptResult) {
      responseBody = JSON.stringify(scriptResult, null, 2)
    }
    // as an alternative the "responseBody" global variable can be set in the script
    if (!responseBody && vmContext.responseBody) {
      responseBody = JSON.stringify(vmContext.responseBody, null, 2)
    }

    return {
      responseBody,
      error,
    }
  }
}
