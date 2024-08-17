'use client'

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Home, Ticket, Bot } from 'lucide-react';
import SideBar from '@/app/components/sideBar';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import axios from 'axios';

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isLoading = session === undefined;
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchProfile = async () => {
    const email = session?.user?.email;

    const userProfileResponse = await axios.post('/api/profile/get', { user_email: email });
    const userProfile = userProfileResponse.data.data;

    if (userProfile.tier === 0) {
      router.push('/');
      return;
    }
    }
  

  // if (isLoading) {
  //   return (
  //     <div className="bg-base-100 min-h-full flex items-center justify-center text-primary-content">
  //       <h1>Loading...</h1>
  //     </div>
  //   );
  // }


  if (!session) {
    return (
      <>
        <div className="bg-base-100 min-h-full flex items-center justify-center">
          <h1 className='text-primary-content cursor-pointer underline' onClick={() => signIn('authProvider', { callbackUrl: '/chat' })}>Please login or signup to continue.</h1>
        </div>
      </>
    );
  }


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-100 overflow-hidden">
      {/* Sidebar (visible on medium and larger screens) */}
      <div className="hidden md:flex w-64 flex-shrink-0">
        <SideBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Top Navigation for Mobile */}
        <div className="w-full bg-base-200 shadow-md md:hidden">
          <div className="flex justify-between items-center p-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Image src="/logo.svg" alt="logo" width={40} height={25} />
              <span className="text-xl font-semibold text-black">SupBot</span>
            </div>
            {/* Hamburger Menu */}
            <button
              className="bg-primary-600 p-2 rounded-full shadow-lg"
              onClick={toggleMenu}
            >
              <Menu size={24} color="gray" />
            </button>
          </div>
          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <ul className="menu menu-compact bg-base-200 rounded-box mt-2 shadow-lg">
              <li>
                <Link href="/chat" className="flex items-center text-primary-content">
                  <Home className="w-5 h-5 mr-2" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/chat/btos" className="flex items-center text-primary-content">
                  <Bot className="w-5 h-5 mr-2" />
                  <span>Bots</span>
                </Link>
              </li>
              <li>
                <Link href="/chat/tickets" className="flex items-center text-primary-content">
                  <Ticket className="w-5 h-5 mr-2" />
                  <span>Tickets</span>
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-grow p-10">{children}</div>
      </div>
    </div>
  );
};

export default ChatLayout;

