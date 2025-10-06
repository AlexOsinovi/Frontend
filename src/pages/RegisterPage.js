import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!surname.trim()) {
      setError('Surname is required');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (birthDate) {
      const today = new Date();
      const bd = new Date(birthDate);
      if (bd > new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        setError('Birth date cannot be in the future');
        return;
      }
    }
    
    setLoading(true);
    try {
      const res = await register(email, password, name, surname, birthDate);
      if (res.success) navigate('/');
    } catch (err) {
      
      if (err && err.status === 400) {
        setError('This email is already registered. Please use another.');
      } else {

        const msg = (err && err.message) ? err.message : 'Registration failed';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <h2 className="mb-3">Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
          
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength="32" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Surname</label>
            <input type="text" className="form-control" value={surname} onChange={(e) => setSurname(e.target.value)} maxLength="32" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} maxLength="128" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Birth Date</label>
            <input type="date" className="form-control" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button disabled={loading} type="submit" className="btn btn-primary w-100">
            {loading ? 'Creating account...' : 'Create Account'}    
          </button>
        </form>
        <p className="mt-3 mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}