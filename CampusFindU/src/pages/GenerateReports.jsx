export default function GenerateReports() {
  return (
    <div className="max-w-lg font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        4.3 Generate Reports
      </h2>

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Report Type
          </label>
          <select className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white transition shadow-sm">
            <option>Select report type</option>
            <option>Lost Items Summary</option>
            <option>Found Items Summary</option>
            <option>Claims Report</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Format
          </label>
          <select className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white transition shadow-sm">
            <option>PDF</option>
            <option>Excel (CSV)</option>
          </select>
        </div>

        <button className="w-full bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 shadow-md mt-4 transition">
          Generate Report
        </button>
      </div>
    </div>
  );
}
