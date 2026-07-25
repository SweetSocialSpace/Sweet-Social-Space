export async function fetchBlock(url: string, opts?: any) {
  const zip = typeof window !== 'undefined' ? localStorage.getItem('user_zip') : ''
  const sep = url.includes('?') ? '&' : '?'
  const finalUrl = zip && !url.includes('zip=') ? `${url}${sep}zip=${zip}` : url
  return fetch(finalUrl, opts)
}
