import React from 'react'
import PageClient from './pageClient'
import getCurrentUser from '@/actions/getCurrentUser'
import { Role } from '@/types/enum';
import AdminRedirect from '@/components/AdminRedirect/AdminRedirect';
import GuestRedirect from '@/components/GuestRedirect/GuestRedirect';

export const Page = async () => {

  const currentUser = await getCurrentUser();

  if(!currentUser) {
    return <GuestRedirect/>
  }
  
  if(currentUser?.role === Role.ADMIN){
    <AdminRedirect/>
  }

  return (
    <PageClient currentUser={currentUser}/>
  )
}

export default Page