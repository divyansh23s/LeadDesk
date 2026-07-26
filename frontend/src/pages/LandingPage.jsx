import React, { useState } from 'react';
import axios from 'axios';
import { Rocket, CheckCircle2, AlertCircle } from 'lucide-react';
import './LandingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://leaddesk-zisl.onrender.com';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.budget) newErrors.budget = 'Please select a budget range';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await axios.post(`${API_URL}/leads`, formData);
      setStatus({ type: 'success', message: 'Thank you! We will be in touch shortly.' });
      setFormData({ name: '', email: '', budget: '', message: '' });
      setErrors({});
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Something went wrong. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content animate-fade-in">
          <div className="badge">
            <Rocket size={16} />
            <span>Accelerate Your Growth</span>
          </div>
          <h1>Transform Your Ideas Into <span className="text-gradient">Digital Reality</span></h1>
          <p>We build high-performance web applications tailored to your business needs. Partner with us to scale your digital presence.</p>
        </div>

        <div className="form-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2>Start Your Project</h2>
          <p className="form-subtitle">Tell us about your requirements</p>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="budget">Budget Range</label>
              <select
                id="budget"
                name="budget"
                className="form-select"
                value={formData.budget}
                onChange={handleChange}
              >
                <option value="" disabled>Select a budget...</option>
                <option value="< $5k">Less than $5,000</option>
                <option value="$5k - $20k">$5,000 - $20,000</option>
                <option value="$20k - $50k">$20,000 - $50,000</option>
                <option value="$50k+">$50,000+</option>
              </select>
              {errors.budget && <span className="form-error">{errors.budget}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="message">Project Details</label>
              <textarea
                id="message"
                name="message"
                className="form-textarea"
                rows="4"
                placeholder="Tell us about your project goals..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              {errors.message && <span className="form-error">{errors.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
