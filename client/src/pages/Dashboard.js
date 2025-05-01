import React, { useEffect , useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyUrls, deleteUrl } from '../features/url/urlSlice';  
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { FaTrash } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const dispatch = useDispatch();
  const { urls = [], isLoading, error } = useSelector((state) => state.url);
  const chartRefs = useRef([]);

  useEffect(() => {
    dispatch(getMyUrls());
     // Cleanup function to destroy charts
     return () => {
      chartRefs.current.forEach(chart => {
        if (chart) chart.destroy();
      });
      chartRefs.current = [];
    };
  }, [dispatch]);

  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  const handleDelete = (id) => {
    dispatch(deleteUrl(id));
  };
  
  // Prepare data for charts (example with mock data)
  const safeUrls = Array.isArray(urls) ? urls : [];
  const clicksData = {
    labels: safeUrls.map(url => url.urlCode || ''),
    datasets: [{
      label: 'Total Clicks',
      data: urls.map(url => url.clicks?.length || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.5)'
    }]
  };
  
  

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Links</h1>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {safeUrls.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No URLs found. Create your first short URL!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Table headers */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Short URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeUrls.map((url) => (
                      <tr key={url._id || url.urlCode}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                          {url.longUrl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <button onClick={() => copyToClipboard(url.shortUrl)}>
                            {url.shortUrl}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {url.clicks || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {url.expirationDate && new Date(url.expirationDate) < new Date() ? (
                            <span className="text-red-600">Expired</span>
                          ) : (
                            <span className="text-green-600">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            to={`/analytics/${url.urlCode}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Analytics
                          </Link>
                        </td>
                        <td>
                          <button onClick={() => handleDelete(url._id)} className="btn btn-danger flex items-center">
                            <FaTrash className="mr-2" /> 
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {safeUrls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Clicks by Link</h2>
                <Bar data={clicksData} 
                ref={(ref) => chartRefs.current[0] = ref?.chartInstance}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <Line data={clicksData} 
                ref={(ref) => chartRefs.current[1] = ref?.chartInstance}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;