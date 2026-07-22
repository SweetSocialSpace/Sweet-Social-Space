export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if(!q) return Response.json({error:'no query'}, {status:400})

  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
    headers: { 'User-Agent': 'SweetSocialSpace/1.0' }
  })
  const data = await res.json()
  return Response.json(data)
}
