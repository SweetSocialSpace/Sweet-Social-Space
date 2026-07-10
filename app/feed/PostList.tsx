type Post = {
  id: string
  body: string
  user_id: string
  city: string
  created_at: string
}

type PostListProps = {
  posts: Post[]
}

export default function PostList({ posts }: PostListProps) {
  if (!posts || posts.length === 0) {
    return <p className="text-gray-500 text-center mt-8">No posts yet. Be the first!</p>
  }

  return (
    <div className="space-y-4 mt-8">
      {posts.map((post) => (
        <div key={post.id} className="border rounded-lg p-4 bg-white shadow">
          <p className="text-gray-800">{post.body}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleString()} • {post.city}
          </p>
        </div>
      ))}
    </div>
  )
}
