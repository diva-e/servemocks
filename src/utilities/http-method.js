export const HttpMethod = {
  GET: 'get',
  POST: 'post',
}

/**
 * @param {object} mapping
 * @return {HttpMethod}
 */
export function extractHttpMethod (mapping) {
  const supportedMethods = Object.values(HttpMethod)

  const potentialMethod = mapping.split('.').reduce(
    (_, current, index, array) => index === array.length - 1 ? current : 'none'
  )

  return supportedMethods.includes(potentialMethod) ? potentialMethod : HttpMethod.GET
}
