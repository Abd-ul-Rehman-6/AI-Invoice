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
      console.log("1️⃣ Uploading file...");
      
      const response = await fetch('http://localhost:5000/user/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log("2️⃣ Response status:", response.status);
      
      const result = await response.json();
      console.log("3️⃣ Response result:", result);

      if (response.ok) {
        console.log("4️⃣ Upload successful, saving to localStorage");
        localStorage.setItem('uploadResult', JSON.stringify(result));
        
        console.log("5️⃣ REDIRECTING TO DASHBOARD NOW...");
        
        // METHOD 1: window.location.href (sabse reliable)
        console.log("5️⃣.1 Using window.location.href");
        window.location.href = '/dashboard';
        
        // Ye code redirect ke baad execute nahi hoga
        console.log("5️⃣.2 This line will not execute if redirect works");
        
        return; // Exit early
        
      } else {
        console.log("❌ Upload failed:", result.error);
        setError(result.error || 'Upload failed');
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    // ... your existing JSX remains exactly the same
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
        background: '#020617',
        transition: 'border-color 0.3s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00d4ff'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
      >
        <input
          type="file"
          id="fileInput"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ color: '#00d4ff', fontWeight: 500 }}>
            {file ? file.name : 'Click to select PDF file'}
          </div>
          {file && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#94a3b8', 
              marginTop: '0.5rem' 
            }}>
              Size: {(file.size / 1024).toFixed(2)} KB
            </div>
          )}
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
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
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
          opacity: !file || loading ? 0.5 : 1,
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '20px',
              height: '20px',
              border: '2px solid #020617',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></span>
            Uploading...
          </span>
        ) : 'Upload Invoice'}
      </button>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}