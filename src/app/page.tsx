'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import axios from 'axios'
import Link from 'next/link';
import { BotMessageSquare, SendHorizonal, X, ChevronDown, Check, ChevronRight, ChevronLeft, ArrowRight} from 'lucide-react';
import Image from 'next/image';
import StripeCheckoutButton from './components/stripeCheckoutButton';
import PricingCheckoutButton from './components/pricingCheckoutButton';
import NavBar from "./components/navBar";
import React from "react";

import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  // const { data: session } = useSession();
  const [tier, setTier] = useState(0);

  const router = useRouter();

  const scrollToSection = (sectionSelect: any) => {
    const section = document.getElementById(sectionSelect);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
  }


  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);


  const fetchGeneratedText = async (prompt: any) => {
    try {
      const response = await axios.post('/api/chat', { prompt });
  
      return response.data.text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error('Failed to generate text');
    }
  };

  const handleGenerateText = async () => {
    setLoading(true);
    try {
      const text = await fetchGeneratedText(prompt);
      setGeneratedText(text);
    } catch (error) {
      console.error(error);
      setGeneratedText('Error generating text');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({
    once: true,
    disable: "phone",
    duration: 700,
    easing: "ease-out-cubic",
    });
  }, []);

  return (
    <>
      <div className="min-h-full bg-base-100 md:flex justify-center">
        {/* Hero Section */}
        <section
          data-aos="zoom-y-in"
          className="flex flex-col items-center justify-center py-10 bg-base-100 space-y-10"
        >
        <div className="relative w-full flex flex-col items-end justify-center mb-20 mt-10 px-4 md:px-0">
          <div className="w-full flex flex-col items-center md:items-start space-y-5">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-primary-content text-center md:text-left lg:text-left z-10 opacity-90">
            </h1>
            <p className="text-xl mb-8 text-primary-content text-center md:text-left font-semibold z-10">
              Sub header
            </p>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt"
              className='text-black border-2 border-gray-300 rounded-md p-2 w-96'
            />
            <button onClick={handleGenerateText} disabled={loading} className='btn btn-secondary'>
              {loading ? 'Generating...' : 'Generate Text'}
            </button>
            {generatedText && <p className='text-black'>Generated Text: {generatedText}</p>}
            </div>
          </div>
        </section>
      </div>
      {/* Footer Section */}
    </>
  );
};
