'use client'
import React from 'react'

export class HouseErrorBoundary extends React.Component<{children: React.ReactNode, name: string}, {hasError: boolean}>{
  constructor(props:any){ super(props); this.state = {hasError: false} }
  static getDerivedStateFromError(){ return {hasError: true} }
  componentDidCatch(err:any){ try { console.error(`[HOUSE] ${this.props.name} failed:`, err) } catch {} }
  render(){ if(this.state.hasError){ return null } return this.props.children }
}
