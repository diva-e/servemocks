/**
 * @param {number} ms
 * @return {Promise}
 */
export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
