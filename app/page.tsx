import PostComposer from './components/PostComposer'
import Feed from './components/Feed'

export default function Page({ searchParams }: { searchParams: { zip?: string }}) {
  const zip = searchParams.zip || '95122'
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Neighborhood Feed – San Jose</h1>
      <p className="text-zinc-600 mb-4">Talk to your neighbors. Share what's happening around you.</p>
      <PostComposer postType="neighborhood" zipDefault={zip} />
      <Feed postType="neighborhood" zip={zip} />
    </div>
  )
}
