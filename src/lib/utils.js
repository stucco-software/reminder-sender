export const arrayify = target => target
  ? Array.isArray(target)
    ? target
    : [target]
  : []


export const asyncMap = async (arr = [], fn) => {
  return await Promise.all(arrayify(arr).map(fn))
}