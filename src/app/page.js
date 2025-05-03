'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // Get user role and redirect to appropriate dashboard
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'player') {
      router.push('/player-dashboard');
    } else if (userRole === 'manager') {
      router.push('/manager-dashboard');
    } else {
      // If role is not recognized, redirect to login
      router.push('/login');
    }
  }, [router]);
  
  return null; // This component won't render anything visible
}
