'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Manager accounts
    const managerAccounts = [
      { username: 'manager', password: 'password' },
      { username: 'manager1', password: 'password' },
      { username: 'manager2', password: 'password' },
      { username: 'manager3', password: 'password' },
      { username: 'will-manager', password: 'password' },
      { username: 'jeff-manager', password: 'password' },
      { username: 'davon-manager', password: 'password' }
    ];
    
    // Player accounts
    const playerAccounts = [
      { username: 'player', password: 'password' },
      { username: 'timmy-player', password: 'password' },
      { username: 'jon-player', password: 'password' },
      { username: 'player1', password: 'password' },
      { username: 'player2', password: 'password' },
      { username: 'player3', password: 'password' },
      { username: 'player4', password: 'password' },
      { username: 'player5', password: 'password' },
      { username: 'player6', password: 'password' },
      { username: 'player7', password: 'password' },
      { username: 'player8', password: 'password' },
      { username: 'player9', password: 'password' },
    ];
    
    // Check for manager login
    const managerAccount = managerAccounts.find(
      account => account.username === username && account.password === password
    );
    
    if (managerAccount) {
      // Manager login
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'manager');
      
      // Extract name from username (e.g., 'will-manager' → 'Will')
      const name = managerAccount.username.split('-')[0];
      const displayName = name === 'manager' ? 'Manager' : name.charAt(0).toUpperCase() + name.slice(1);
      
      const userData = {
        id: managerAccount.username,
        name: displayName,
        email: `${displayName.toLowerCase()}@example.com`,
        invitations: []
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
      return;
    }
    
    // Check for player login
    const playerAccount = playerAccounts.find(
      account => account.username === username && account.password === password
    );
    
    if (playerAccount) {
      // Player login
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'player');
      
      // Extract name from username (e.g., 'timmy-player' → 'Timmy')
      const name = playerAccount.username.split('-')[0];
      const displayName = name === 'player' ? 'Player' : name.charAt(0).toUpperCase() + name.slice(1);
      
      const userData = {
        id: playerAccount.username,
        name: displayName,
        email: `${displayName.toLowerCase()}@example.com`,
        invitations: []
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
      return;
    }
    
    // If we reach here, login failed
    setError('Invalid username or password');
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className={styles.loginButton}>
          Log In
        </button>
        
        <div className={styles.hint}>
          <p>Test accounts:</p>
          <p>Player: username "player", password "password"</p>
          <p>Manager: username "manager", password "password"</p>
        </div>
      </form>
    </div>
  );
} 