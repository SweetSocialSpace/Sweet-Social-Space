'use client'

export default function PermissionsGate(){
  async function enable(){
    try{ await new Promise((res, rej)=> navigator.geolocation.getCurrentPosition(res, rej)) }catch{}
    try{
      const s = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      s.getTracks().forEach(t=>t.stop())
    }catch{}
    localStorage.setItem('sss_done','1')
    window.location.reload()
  }

  if(typeof window !== 'undefined' && localStorage.getItem('sss_done')) return null

  return(
    <div style={{position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#151515', padding:24, borderRadius:16, width:360, border:'1px solid #333'}}>
        <h2 style={{color:'white', fontWeight:900, fontSize:18}}>Your Block Needs 3 Permissions</h2>
        <p style={{color:'#aaa', fontSize:12, marginTop:8}}>Location, Camera, Microphone required for 95122</p>
        <button onClick={enable} style={{marginTop:16, width:'100%', background:'white', color:'black', fontWeight:900, padding:14, borderRadius:12}}>ENABLE ALL 3 - CONTINUE TO 95122</button>
      </div>
    </div>
  )
}
