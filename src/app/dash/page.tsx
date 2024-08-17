'use client';

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SideBar from '../components/sideBar';
import axios from 'axios';
import { setTimeout } from 'timers';
import { signIn, signOut } from 'next-auth/react'
import Link from 'next/link';
import { Trash2, TicketCheck, PlusIcon, MailWarning, MailCheck, Inbox, Mail } from 'lucide-react';

export default function Home() {

  const [tier, setTier] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    
  }, [session]);

  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
    <div className="min-h-full bg-base-100 flex">
      <div className="flex-grow gap-10">
      dashboard
      </div>
    </div>
  </>
);
};
