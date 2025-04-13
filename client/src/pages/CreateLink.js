import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { shortenUrl } from '../features/url/urlSlice';

function CreateLink() {
  const [formData, setFormData] = useState({
    longUrl: '',
    customAlias: '',
    expirationDate: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.url);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.longUrl) {
      toast.error('URL is required');
      return;
    }
    
    try {
      const result = await dispatch(shortenUrl(formData)).unwrap();
      toast.success('URL shortened successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to shorten URL');
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Short Link</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="longUrl">
            Long URL
          </label>
          <input
            type="url"
            id="longUrl"
            name="longUrl"
            value={formData.longUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="https://example.com"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="customAlias">
            Custom Alias (optional)
          </label>
          <input
            type="text"
            id="customAlias"
            name="customAlias"
            value={formData.customAlias}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="my-custom-link"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="expirationDate">
            Expiration Date (optional)
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Creating...' : 'Create Short Link'}
        </button>
      </form>
    </div>
  );
}

export default CreateLink;