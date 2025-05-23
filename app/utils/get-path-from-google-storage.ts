export const getPathFromGoogleStorage = (url: string) => {
  const match = url.match(/\/o\/([^?]+)/)
  if (!match) return null

  return decodeURIComponent(match[1])
}
