import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerSignup } from '../services/api.js';
import './AdminRegister.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await ownerSignup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        password: formData.password
      });

      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/'); // Redirect to home or login modal
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        <h2>Salon Owner Registration</h2>
        <p className="admin-register-subtitle">Join our platform and manage your salon</p>

        {error && <div className="admin-register-alert error">{error}</div>}
        {success && <div className="admin-register-alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="admin-register-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="e.g. john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Mumbai"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="Create a strong password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="admin-register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Owner'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
