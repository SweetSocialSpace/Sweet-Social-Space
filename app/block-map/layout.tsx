export default function BlockMapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="block-map-body">
        {children}
      </body>
    </html>
  )
}
