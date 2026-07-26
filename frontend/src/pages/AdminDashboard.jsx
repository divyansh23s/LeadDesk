import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LogOut, Search, User, Mail, DollarSign, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const { token, logout } = useAuth();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch leads');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/leads/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(leads.map(lead => lead._id === id ? { ...lead, status: newStatus } : lead));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                            lead.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-container header-content">
          <h1>LeadDesk Admin</h1>
          <button onClick={logout} className="btn-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="dashboard-container dashboard-main animate-fade-in">
        <div className="controls-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-wrapper">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        <div className="leads-grid">
          {filteredLeads.length === 0 ? (
            <div className="empty-state">
              <p>No leads found matching your criteria.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead._id} className="lead-card">
                <div className="lead-header">
                  <div className="lead-info">
                    <h3>{lead.name}</h3>
                    <p className="lead-email"><Mail size={14} /> {lead.email}</p>
                  </div>
                  <div className={`status-badge status-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </div>
                </div>
                
                <div className="lead-body">
                  <div className="lead-meta">
                    <span className="meta-item"><DollarSign size={14} /> {lead.budget}</span>
                    <span className="meta-item"><Clock size={14} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="lead-message">
                    <MessageSquare size={14} className="msg-icon" />
                    <p>{lead.message}</p>
                  </div>
                </div>
                
                <div className="lead-footer">
                  <label>Update Status:</label>
                  <select 
                    value={lead.status} 
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
