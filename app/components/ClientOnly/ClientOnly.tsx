'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { usePathname } from 'next/navigation';

export interface user {
  email: string;
  password: string;
}
interface ClientOnlyProps {
  children: React.ReactNode;
  user: any;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children,user }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const pathname = usePathname().startsWith('/auth');
  console.log(pathname,'akwhdnfdivnd');

  if (!hasMounted) return null;

  return (
    <>
      {!pathname && <Navbar user={user} />}
      {children}
      {!pathname && <Footer />}
    </>
  );
};

export default ClientOnly;
