/**
 * Groups the elements of an array based on the given key or iteratee function.
 *
 * @template T - The type of elements in the array
 * @template K - The type of the grouping key
 * @param {T[]} array - The array to be grouped
 * @param {string | ((item: T) => K)} iteratee - The key or function to determine the grouping
 * @returns {Record<string, T[]>} An object where keys are group names and values are arrays of matching elements
 * @throws {Error} If the array is not valid or if the key doesn't exist in array elements
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  iteratee: keyof T | ((item: T) => K)
): Record<string, T[]> {
  if (!Array.isArray(array)) {
    throw new Error("Input must be an array")
  }

  const result: Record<string, T[]> = {}

  const getKey =
    typeof iteratee === "function"
      ? iteratee
      : (item: T) => {
          const key = item[iteratee]
          if (key === undefined) {
            throw new Error(
              `Key "${String(iteratee)}" does not exist in array elements`
            )
          }
          return key as unknown as K
        }

  for (const item of array) {
    const key = String(getKey(item))
    if (!(key in result)) {
      result[key] = []
    }
    result[key].push(item)
  }

  return result
}

/**
 * Example usage:
 *
 * const users = [
 *   { id: 1, role: 'admin', name: 'John' },
 *   { id: 2, role: 'user', name: 'Jane' },
 *   { id: 3, role: 'admin', name: 'Bob' },
 *   { id: 4, role: 'user', name: 'Alice' }
 * ]
 *
 * // Group by property name
 * const byRole = groupBy(users, 'role')
 * // Result:
 * // {
 * //   admin: [
 * //     { id: 1, role: 'admin', name: 'John' },
 * //     { id: 3, role: 'admin', name: 'Bob' }
 * //   ],
 * //   user: [
 * //     { id: 2, role: 'user', name: 'Jane' },
 * //     { id: 4, role: 'user', name: 'Alice' }
 * //   ]
 * // }
 *
 * // Group by function
 * const byNameLength = groupBy(users, user => user.name.length)
 * // Result:
 * // {
 * //   4: [
 * //     { id: 1, role: 'admin', name: 'John' },
 * //     { id: 4, role: 'user', name: 'Jane' },
 * //   ],
 * //   3: [
 * //     { id: 3, role: 'admin', name: 'Bob' },
 * //   ],
 * //   5: [
 * //     { id: 4, role: 'user', name: 'Alice' }
 * //   ]
 * // }
 */
