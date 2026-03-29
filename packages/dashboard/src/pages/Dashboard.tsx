/**
 * Dashboard page - Main overview
 */

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Scans</div>
          <div className="text-3xl font-bold">-</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Threats Blocked</div>
          <div className="text-3xl font-bold text-red-600">-</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Protection Status</div>
          <div className="text-lg font-semibold text-green-600">Active</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-500">No recent threats detected</p>
      </div>
    </div>
  )
}
