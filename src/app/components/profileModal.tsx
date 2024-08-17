"use client;"
import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import Login from '../components/login';
import axios from 'axios';
import { set } from 'zod';

const ProfileModal: React.FC<{ session: any, onClose: () => void }> = ({ session, onClose }) => {
    const [email, setEmail] = useState(session?.user?.email || '');
    const [apiKey, setApiKey] = useState('')
    const [tier, setTier] = useState(0);
    const [response, setResponse] = useState('');

    const handleEmailSend = async () => {
        try {
            const { data } = await axios.post('/api/email/test', { user_email: email });
        } catch (error) {
            console.error('Failed to send email', error);
        }
    }
    
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.post('/api/profile/get', { user_email: email });
            // setApiKey(data.data[0].openai_api_key);
            console.log(data.data.tier)
            setTier(data.data.tier);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    }

    const handleSave = () => {
        try {
            axios.post('/api/profile/save_api', { user_email: email, api_key: apiKey });
        } catch (error) {
            console.error('Failed to save profile', error);
        }

        onClose();
    };

    const cancelSubscription = async () => {
        setResponse('Cancelling subscription...');
        try {
            const response = await axios.post('/api/profile/cancel_subscription', { user_email: email });
            setResponse(response.data.message);
        } catch (error) {
            console.error('Failed to cancel subscription', error);
            setResponse('Failed to cancel subscription');
        }
    }

    const tierMap: { [key: number]: string } = {
        0: 'Free',
        1: 'Standard',
        2: 'Premium',
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 text-primary-content">
            <div className="bg-white rounded-lg p-10 shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Profile</h3>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input input-bordered w-full"
                        disabled
                    />
                </div>
                {/* <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">OpenAI Restricted API Key</label>
                    <input 
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder='ex: sk_proj_1234567890abcdefg...'
                    />
                </div> */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Payment Tier</label>
                    <input 
                        type="text"
                        value={tierMap[tier]}
                        className="input input-bordered w-full"
                        disabled
                    />
                </div>
                <div className='flex justify-between text-primary-content mt-10'><p>Have Feedback?</p> <a className="btn btn-sm" target="_blank" href="https://insigh.to/b/supbot">Click here</a></div>
                <div className='flex justify-between text-primary-content mt-5'><p>Cancel Subscription?</p><p className="btn btn-sm" onClick={cancelSubscription}>Click here</p></div>
                {/* <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Message Usage</label>
                    <input 
                        type="text"
                        value="0/10,000"
                        className="input input-bordered w-full"
                        disabled
                    />
                </div> */}
                {/* <div className="flex justify-end">
                    <button className="btn btn-primary" onClick={handleSave}>Save</button>
                </div> */}
                {/* <div className="btn btn-primary" onClick={handleEmailSend}>Send Email</div> */}
                {response && <p className="text-red-500">{response}</p>}
            </div>
        </div>
    );
};

export default ProfileModal;