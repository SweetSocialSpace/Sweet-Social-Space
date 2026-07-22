export default function MainLayout({children}:{children:React.ReactNode}){
  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <main style={{flexGrow:1}}>{children}</main>
      <footer style={{width:'100%', padding:'24px', textAlign:'center', fontSize:'12px', color:'#a1a1aa', background:'rgba(0,0,0,0.3)', borderTop:'1px solid rgba(255,255,255,0.1)'}}>
        © {new Date().getFullYear()} Sweet Social Space • Speak Freely. Love your neighbor.
      </footer>
    </div>
  )
}
