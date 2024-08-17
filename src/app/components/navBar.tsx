"use client;"
import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import Login from '../components/login';
import ProfileModal from './profileModal';

const NavBar: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

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
                    <Image
                        src=""
                        alt="logo"
                        width={40}
                        height={25} 
                    />
                    <a className="btn btn-ghost text-xl text-black font-semibold z-10" onClick={() => router.push('/')}>name</a>
                </div>
                <div className="flex-1 hidden sm:block">
                    <a className="btn btn-ghost text-xl text-primary-content" onClick={() => scrollToSection("pricing")}>Pricing</a>
                    <a className="btn btn-ghost text-xl text-primary-content" onClick={() => scrollToSection("faq")}>FAQ</a>
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