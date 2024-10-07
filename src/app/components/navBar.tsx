"use client;"
import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import Login from '../components/login';
import ProfileModal from './profileModal';
import { FileText } from 'lucide-react';
import axios from 'axios';
import { set } from 'zod';

interface NavBarProps {
    credits: number;
    setCredits: (credits: number) => void;
}

const NavBar: React.FC<NavBarProps> = ({ credits, setCredits }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

    useEffect(() => {
        if (session) {
            profileCheck();
          }
        }
      , [session]);
    
      const profileCheck = async () => {
        const email = session?.user?.email;
        const userProfileResponse = await axios.post('/api/profile/get', { user_email: email });
        const userProfile = userProfileResponse.data.data;
        console.log(userProfile);
        setCredits(userProfile.credits);
      }

    const handleProfileClick = () => {
        setProfileModalOpen(true);
    };

    const handleCloseModal = () => {
        setProfileModalOpen(false);
    };

    const scrollToSection = (sectionSelect: any) => {
        const section = document.getElementById(sectionSelect);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    }

    return (
        <div className='bg-base-100'>
        <div className='lg:mx-60'>
            <div className="navbar bg-base-100 px-10 py-4">
                <div className="flex-1">
                    <div className='bg-base-100 px-4 py-5' onClick={() => router.push('/')}>
                        <h1 className="text-md font-semibold text-black z-10 opacity-90 flex items-center">
                        <FileText className="w-8 h-8 mr-2 text-black" />
                        PDF Data Extractor
                        </h1>
                    </div>
                </div>
                {/* <div className="flex-1 hidden sm:block">
                    <a className="btn btn-ghost text-xl text-primary-content" onClick={() => scrollToSection("pricing")}>Pricing</a>
                    <a className="btn btn-ghost text-xl text-primary-content" onClick={() => scrollToSection("faq")}>FAQ</a>
                </div> */}
                <div className='mr-5'>
                    <div className="badge  badge-lg badge-secondary badge-outline p-4">
                    <p className='ml-2 font-medium'>{credits} credits</p>
                    </div>
                </div>
                {session ? (
                <div className="dropdown dropdown-bottom dropdown-end z-10">
                    <div tabIndex={0} role="button" className="btn m-1">{session?.user?.email}</div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a className="text-primary-content" onClick={() => signOut()}>Logout</a></li>
                        <li><a className="text-primary-content" onClick={handleProfileClick}>Profile</a></li>
                    </ul>
                </div>
                ) : (
                    <Login />
                )}
            </div>
            {isProfileModalOpen && (
                <ProfileModal session={session} onClose={handleCloseModal} />
            )}
        </div>
    </div>
    );
};

export default NavBar;