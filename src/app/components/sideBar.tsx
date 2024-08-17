import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react'
import { Trash2, TicketCheck, Bot, LayoutDashboard, BotMessageSquare } from 'lucide-react';
import axios from 'axios'
import Image from 'next/image';
import Login from '../components/login';
import ProfileModal from './profileModal';

const SideBar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [bots, setBots] = useState([]);

  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
      setProfileModalOpen(true);
  };

  const handleCloseModal = () => {
      setProfileModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col w-64 bg-base-100 p-4 border-r border-gray-300 sticky top-0 h-screen overflow-hidden">
        {/* Logo and Title */}
        <div className="flex items-center p-4">
          <Image src="/logo.svg" alt="logo" width={40} height={25} />
          <a
            className="btn btn-ghost text-xl text-black font-semibold"
            onClick={() => router.push('/')}
          >
            SupBot
          </a>
        </div>

        {/* Navigation Menu */}
        <ul className="menu flex-grow overflow-auto">
          <li>
            <Link
              href="/chat"
              passHref
              className="flex items-center justify-between hover:text-primary-content"
            >
              <p className="text-primary-content flex font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-house w-5 h-5 mr-2"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Home
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/chat/bots"
              passHref
              className="flex items-center justify-between hover:text-primary-content"
            >
              <p className="text-primary-content flex font-medium">
                <Bot className="w-5 h-5 mr-2" />
                Bots
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/chat/tickets"
              passHref
              className="flex items-center justify-between hover:text-primary-content"
            >
              <p className="text-primary-content flex font-medium">
                <TicketCheck className="w-5 h-5 mr-2" />
                Tickets
              </p>
            </Link>
          </li>
        </ul>

        {/* Profile/Logout Section */}
        <div className="navbar bg-base-100">
          {session ? (
            <div className="dropdown dropdown-top dropdown-end">
              <div tabIndex={0} role="button" className="btn m-1">
                {session?.user?.email}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a className="text-primary-content" onClick={() => signOut()}>
                    Logout
                  </a>
                </li>
                <li>
                  <a className="text-primary-content" onClick={handleProfileClick}>
                    Profile
                  </a>
                </li>
              </ul>
            </div>
          ) : (
            <Login />
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal session={session} onClose={handleCloseModal} />
      )}
    </>
  );
};


export default SideBar;