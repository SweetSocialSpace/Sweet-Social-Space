import PostComposer from '../components/PostComposer'
import Feed from '../components/Feed'
export default function VentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Speak Freely – Vent Wall</h1>
      <p className="text-zinc-600 mb-4">Say what's on your mind. Get it off your shoulders. No judgment here.</p>
      <PostComposer postType="vent" />
      <Feed postType="vent" />
    </div>
  )
}
