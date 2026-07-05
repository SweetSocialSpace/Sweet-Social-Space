import PostComposer from '../components/PostComposer'
import Feed from '../components/Feed'
export default function FaithPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Faith Corner</h1>
      <p className="text-zinc-600 mb-4">Prayer requests, encouragement, get to know God – together.</p>
      <PostComposer postType="faith" />
      <Feed postType="faith" />
    </div>
  )
}
