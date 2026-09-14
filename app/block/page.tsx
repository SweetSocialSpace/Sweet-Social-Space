// app/block/page.tsx
export default function YourBlockPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold">YOUR BLOCK</h1>
      <p className="mt-2 text-gray-600">Enter any zip on earth. Your neighborhood, your feed.</p>
      <form action="/feed" className="mt-6 flex gap-2 justify-center">
        <input name="zip" placeholder="Enter zip" className="border px-4 py-2 rounded-full" />
        <button className="bg-black text-white px-6 rounded-full">Go</button>
      </form>
      <p className="mt-6 text-xs text-gray-400">
        Built for global - any zip on earth. No hard-coded location.
      </p>
    </div>
  )
}
