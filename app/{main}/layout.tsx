import './globals.css'

export default function MainLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <body style={{
        margin:0,
        minHeight:'100vh',
        backgroundImage:`url('/hearts-bg.jpg')`,
        backgroundSize:'cover',
        backgroundAttachment:'fixed',
        backgroundColor:'#1a0a00'
      }}>
        <div style={{minHeight:'100vh', backdropFilter:'blur(0px)'}}>
          {children}
        </div>
      </body>
    </html>
  )
}
