/**
 * Comparator to order endpoints after their specificity (depends on number of wildcards)
 * @param {string} pathA
 * @param {string} pathB
 * @return {number}
 */
export function compareEndpointsBySpecificity (pathA, pathB) {
  const wildcardsA = (pathA.match(/(\*|\[any\])/g) || [])
  const wildcardsB = (pathB.match(/(\*|\[any\])/g) || [])

  if (wildcardsA.length > 0 && wildcardsB.length > 0) {
    // If the number of wildcards is the same, compare their positions
    const wildcardIndexA = pathA.indexOf('*')
    const wildcardIndexB = pathB.indexOf('*')

    if (wildcardIndexA === wildcardIndexB) {
      if (pathA[wildcardIndexA + 1] === '/') {
        return -1
      } else if (pathB[wildcardIndexB + 1] === '/') {
        return 1
      } else {
        return 0
      }
    } else if (wildcardIndexA < wildcardIndexB) {
      return 1 // 'a' is more specific
    } else if (wildcardIndexA > wildcardIndexB) {
      return -1 // 'b' is more specific
    }
  }

  // Compare based on wildcard count
  if (wildcardsA.length < wildcardsB.length) {
    return -1 // 'pathA' is more specific
  } else if (wildcardsA.length > wildcardsB.length) {
    return 1 // 'pathB' is more specific
  } else {
    return 0
  }
}
