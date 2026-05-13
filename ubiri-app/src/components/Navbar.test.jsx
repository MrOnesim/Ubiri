import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Navbar from './Navbar';
import { describe, it, expect } from 'vitest';

describe('Navbar Component', () => {
  it('renders the application name', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/biri/i)).toBeInTheDocument();
  });

  it('shows login button when not logged in', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });
});
