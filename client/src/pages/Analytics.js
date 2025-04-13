import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalytics } from '../features/url/urlSlice';
import { Bar, Line, Pie } from 'react-chartjs-2';

function Analytics() {
  const { urlCode } = useParams();
  const dispatch = useDispatch();
  const { analytics, isLoading } = useSelector((state) => state.url);

  useEffect(() => {
    dispatch(getAnalytics(urlCode));
  }, [dispatch, urlCode]);

  if (isLoading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics data found</div>;

  // Prepare chart data
  const clicksOverTimeData = {
    labels: analytics.clicksOverTime?.map(item => item._id) || [],
    datasets: [{
      label: 'Clicks',
      data: analytics.clicksOverTime?.map(item => item.count) || [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  };

  const devicesData = {
    labels: analytics.devices?.map(item => item._id) || [],
    datasets: [{
      label: 'Devices',
      data: analytics.devices?.map(item => item.count) || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)'
      ]
    }]
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics for: {analytics.url?.shortUrl}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Clicks Over Time</h2>
          <Line data={clicksOverTimeData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Devices</h2>
          <Pie data={devicesData} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Clicks ({analytics.totalClicks})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">IP Address</th>
                <th className="text-left p-2">Device</th>
                <th className="text-left p-2">Browser</th>
              </tr>
            </thead>
            <tbody>
              {analytics.clicks?.map((click) => (
                <tr key={click._id} className="border-t">
                  <td className="p-2">{new Date(click.timestamp).toLocaleString()}</td>
                  <td className="p-2">{click.ipAddress}</td>
                  <td className="p-2">{click.deviceType}</td>
                  <td className="p-2">{click.browser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;