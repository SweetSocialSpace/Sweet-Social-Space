export async function GET() {
  const verse = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json&order=random', { next: { revalidate: 3600 } }).then(r=>r.json()).catch(()=>null)
  return Response.json(verse || { text: "The Lord is near to the brokenhearted.", reference: "Psalm 34:18" })
}
