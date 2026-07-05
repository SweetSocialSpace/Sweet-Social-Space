import Feed from '../components/Feed'
export default function AlertsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Local Alerts – San Jose</h1>
      <p className="text-zinc-600 mb-4">Street closures, accidents, fires, theft – automatically posted for your area.</p>
      <Feed postType="alert" />
      <div className="text-xs text-zinc-500 mt-4">Automation runs at /api/alerts/ingest – enable Vercel Cron to run every 15 min.</div>
    </div>
  )
}
