export async function fetchBlock(url: string, opts?: RequestInit): Promise<Response> {
  try {
    let zip = ''
    if (typeof window !== 'undefined') {
      try { zip = localStorage.getItem('user_zip') || '' } catch {}
    }
    const sep = url.includes('?') ? '&' : '?'
    const finalUrl = zip && !url.includes('zip=') ? `${url}${sep}zip=${encodeURIComponent(zip)}` : url
    return await fetch(finalUrl, opts)
  } catch {
    // House never dies - if zip read fails, just fetch without zip - global fallback
    return fetch(url, opts)
  }
}
