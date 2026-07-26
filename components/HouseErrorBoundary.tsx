'use client'
import React from 'react'

export class HouseErrorBoundary extends React.Component<{children: React.ReactNode, name: string}, {hasError: boolean}>{
  constructor(props:any){ super(props); this.state = {hasError: false} }
  static getDerivedStateFromError(){ return {hasError: true} }
  componentDidCatch(err:any){ console.error(`[HOUSE] ${this.props.name} failed:`, err) }
  render(){
    if(this.state.hasError){
      // Feature failed, but house stays live - returns nothing, no crash
      return null
    }
    return this.props.children
  }
}
