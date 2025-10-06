import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileViewPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="alert alert-info">Loading profile...</div>;
  }

  if (!user) {
    return <div className="alert alert-secondary">No profile loaded.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card p-4 shadow-sm">
          <h2 className="mb-3">Profile</h2>
          <div className="mb-2"><strong>Name:</strong> {user.name}</div>
          <div className="mb-2"><strong>Surname:</strong> {user.surname}</div>
          <div className="mb-2"><strong>Email:</strong> {user.email}</div>
          <div className="mb-3"><strong>Birth Date:</strong> {user.birthDate}</div>
          <div className="d-flex">
            <Link to="/profile/edit" className="btn btn-primary">Edit</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


