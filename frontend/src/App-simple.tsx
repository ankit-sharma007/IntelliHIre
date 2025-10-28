import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 AI Hiring Platform
        </h1>
        <p className="text-gray-600 mb-8">
          Frontend is loading successfully!
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4">Next Steps:</h2>
          <ol className="text-left space-y-2">
            <li>1. ✅ Frontend is running</li>
            <li>2. ✅ Backend is running</li>
            <li>3. 🔄 Loading full application...</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;