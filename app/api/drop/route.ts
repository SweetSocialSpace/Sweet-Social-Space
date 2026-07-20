// app/api/drop/route.ts - runs via cron 0 9-20 * * *
export async function GET() {
  const businesses = await supabase.from('businesses').select('*').eq('zip_code', '95122');
  const winner = businesses.data![Math.floor(Math.random() * businesses.data!.length)];
  await supabase.from('posts').insert({
    category: 'drop',
    title: `THE DROP: Free item at ${winner.name} - next 30 min! First 5 only!`,
    expires_at: new Date(Date.now() + 30*60000).toISOString()
  });
  // Trigger push notification here
  return NextResponse.json({ dropped: winner.name });
}
