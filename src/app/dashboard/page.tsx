"use client";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">MyApp 🚀</h2>

        <ul className="space-y-4">
          <li className="hover:bg-indigo-600 p-2 rounded cursor-pointer">
            Dashboard
          </li>
          <li className="hover:bg-indigo-600 p-2 rounded cursor-pointer">
            Users
          </li>
          <li className="hover:bg-indigo-600 p-2 rounded cursor-pointer">
            Settings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl mt-2 text-indigo-600">120</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <p className="text-3xl mt-2 text-green-600">45</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Admin Accounts</h3>
            <p className="text-3xl mt-2 text-purple-600">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}