export default function MainLayout({children}:{children:React.ReactNode}) {
  return (
    <>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="w-full py-6 text-center text-xs text-zinc-300 bg-black/30 backdrop-blur border-t border-white/10">
        © {new Date().getFullYear()} Sweet Social Space • Speak Freely. Love your neighbor.
      </footer>
    </>
  )
}
