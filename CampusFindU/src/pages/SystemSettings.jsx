export default function SystemSettings() {
  return (
    <div className="max-w-4xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button className="px-6 py-3 font-bold text-sm text-blue-600 border-b-2 border-blue-600 whitespace-nowrap">
          General
        </button>
        <button className="px-6 py-3 font-bold text-sm text-gray-500 hover:text-gray-700 transition whitespace-nowrap">
          Notifications
        </button>
        <button className="px-6 py-3 font-bold text-sm text-gray-500 hover:text-gray-700 transition whitespace-nowrap">
          Security
        </button>
        <button className="px-6 py-3 font-bold text-sm text-gray-500 hover:text-gray-700 transition whitespace-nowrap">
          Backup
        </button>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            System Name
          </label>
          <input
            type="text"
            defaultValue="Campus Lost and Found Management System"
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Contact Email
          </label>
          <input
            type="text"
            defaultValue="support@university.edu"
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Items Auto Release (Days)
          </label>
          <input
            type="number"
            defaultValue={30}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
        </div>
        <div className="flex justify-center md:justify-start mt-4">
          <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 shadow-md transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
