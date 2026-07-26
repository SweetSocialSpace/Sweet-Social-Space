'use client'
import dynamic from 'next/dynamic'
import { HouseErrorBoundary } from './HouseErrorBoundary'

export function Safe({name}:{name:string}){
  const Comp = dynamic(
    () => import(`./${name}`).then(m => m.default || m[name]).catch(() => ({ default: () => null })),
    { ssr: false, loading: () => null }
  )
  return <HouseErrorBoundary name={name}><Comp /></HouseErrorBoundary>
}
