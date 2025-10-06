import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setEmail(user.email || '');
      setBirthDate(user.birthDate || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (birthDate) {
      const today = new Date();
      const bd = new Date(birthDate);
      if (bd > new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        setError('Birth date cannot be in the future');
        return;
      }
    }
    setSaving(true);
    try {
      const res = await updateProfile({ name, surname, email, birthDate });
      if (res.success) setMessage('Profile updated');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <h2 className="mb-3">Profile</h2>
        {message && <div className="alert alert-info">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength="32" />
          </div>
          <div className="mb-3">
            <label className="form-label">Surname</label>
            <input type="text" className="form-control" value={surname} onChange={(e) => setSurname(e.target.value)} maxLength="32" />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} maxLength="128" required disabled readOnly />
          </div>
          <div className="mb-3">
            <label className="form-label">Birth Date</label>
            <input type="date" className="form-control" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <button disabled={saving} type="submit" className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}


