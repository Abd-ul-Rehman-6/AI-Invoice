"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadComponent() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login again');
      setLoading(false);
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/user/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('uploadResult', JSON.stringify(result));
        alert('File uploaded successfully!');
        router.push('/dashboard');
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem',
      background: '#071222',
      borderRadius: '16px',
      border: '1px solid rgba(0,212,255,0.18)'
    }}>
      <h2 style={{ color: '#e8f4ff', marginBottom: '1.5rem' }}>
        Upload Invoice
      </h2>

      <div style={{
        border: '2px dashed rgba(0,212,255,0.3)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        background: '#020617'
      }}>
        <input
          type="file"
          id="fileInput"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ color: '#00d4ff' }}>
            {file ? file.name : 'Click to select PDF file'}
          </div>
        </label>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.5)',
          color: '#fecaca',
          borderRadius: '8px',
          padding: '0.7rem',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '999px',
          border: 'none',
          background: !file || loading ? '#4b5563' : 'linear-gradient(135deg, #00d4ff, #38bdf8)',
          color: '#020617',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: !file || loading ? 'not-allowed' : 'pointer',
          opacity: !file || loading ? 0.5 : 1
        }}
      >
        {loading ? 'Uploading...' : 'Upload Invoice'}
      </button>
    </div>
  );
}