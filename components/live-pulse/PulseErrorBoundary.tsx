'use client';
import React from 'react';

export class PulseErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.log('Pulse nerve error, isolated:', error); }
  render() { if (this.state.hasError) return null; return this.props.children; }
}
