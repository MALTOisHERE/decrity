/**
 * History page - Threat history log
 */

export default function History() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Threat History</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">
          Your threat detection history will appear here.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Note: Free tier shows last 7 days only
        </p>
      </div>
    </div>
  )
}
