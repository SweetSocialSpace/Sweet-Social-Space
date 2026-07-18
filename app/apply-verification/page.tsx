'use client'
import { useState } from 'react'
import Header from '@/app/components/Header'
import { createClient } from '@/lib/supabase/client'

export default function ApplyVerificationPage() {
  const [org, setOrg] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('Police / Fire / Government')
  const supabase = createClient()
  const [done, setDone] = useState(false)

  const submit = async () => {
    if(!org ||!email) return alert('Fill all fields')
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('verification_requests').insert({
      user_id: user?.id,
      organization: org,
      contact_email: email,
      org_type: type,
      status: 'pending'
    })
    setDone(true)
  }

  return (
    <>
      <Header />
      <div className="max-w- mx-auto px-4 py-10">
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h1 className="text-3xl font-black text-white">Apply for Verification</h1>
          <p className="text-white/70 mt-2">For Police, Fire, NWS, City Agencies, Schools, and local authorities near 95122</p>

          {done? (
            <div className="mt-6 bg-green-600 text-white p-4 rounded-xl font-bold">Request submitted! We'll review and verify your organization.</div>
          ) : (
            <>
              <input value={org} onChange={e=>setOrg(e.target.value)} placeholder="Organization name (e.g. San Jose Police)" className="mt-6 w-full p-3 rounded-xl text-black" />
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Official email" className="mt-3 w-full p-3 rounded-xl text-black" />
              <select value={type} onChange={e=>setType(e.target.value)} className="mt-3 w-full p-3 rounded-xl text-black">
                <option>Police / Fire / Government</option>
                <option>NWS / Emergency Management</option>
                <option>School / Hospital</option>
                <option>Local Business</option>
                <option>Media / News</option>
              </select>
              <button onClick={submit} className="mt-6 w-full bg-blue-600 text-white font-black py-3 rounded-full">SUBMIT FOR VERIFICATION</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
