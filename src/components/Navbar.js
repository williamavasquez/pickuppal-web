'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userRole = localStorage.getItem('userRole');
      setUser({ ...userData, role: userRole });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <Link href="/">
            <span className={styles.logo1}>Pickup</span>
            <span className={styles.logo}>Pal</span>
          </Link>
        </div>

        <div className={styles.navbarLinks}>
          <Link href="/search" className={pathname === '/search' ? styles.active : ''}>
            Find Games
          </Link>
          <>
            <Link href="/dashboard" className={pathname === '/dashboard' ? styles.active : ''}>
              My Dashboard
            </Link>
            <Link href="/player-profile" className={pathname === '/player-profile' ? styles.active : ''}>
              My Profile
            </Link>
            {/* <Link href="/leagues" className={pathname.startsWith('/leagues') ? styles.active : ''}>
                Leagues
              </Link> */}
          </>
          {/* {user?.role === 'manager' && (
            <>
              <Link href="/manager-dashboard" className={pathname === '/manager-dashboard' ? styles.active : ''}>
                Manager Dashboard
              </Link>
              <Link href="/leagues" className={pathname.startsWith('/leagues') ? styles.active : ''}>
                Leagues
              </Link>
            </>
          )} */}
        </div>

        <div className={styles.navbarRight}>
          {user ? (
            <>
              <span className={styles.username}>Hi, {user.name}</span>
              <button className={styles.navButton} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className={styles.navButton}>Login</button>
            </Link>
          )}
        </div>

        <div className={styles.mobileMenuButton} onClick={toggleMenu}>
          <span className={styles.menuIcon}>☰</span>
        </div>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/search" onClick={toggleMenu}>
            Find Games
          </Link>
          {user?.role === 'player' && (
            <>
              <Link href="/player-dashboard" onClick={toggleMenu}>
                My Dashboard
              </Link>
              <Link href="/player-profile" onClick={toggleMenu}>
                My Profile
              </Link>
              <Link href="/leagues" onClick={toggleMenu}>
                Leagues
              </Link>
            </>
          )}
          {user?.role === 'manager' && (
            <>
              <Link href="/manager-dashboard" onClick={toggleMenu}>
                Manager Dashboard
              </Link>
              <Link href="/leagues" onClick={toggleMenu}>
                Leagues
              </Link>
            </>
          )}
          {user ? (
            <button className={styles.mobileLogoutButton} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link href="/login" onClick={toggleMenu}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
} 