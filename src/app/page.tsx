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
  const { data: session } = useSession();
  const [tier, setTier] = useState(0);

  const router = useRouter();
  const priceId = 'price_1PU1adE9ZZnNVjbUZI69CRNU';
  const priceIdPremium = 'price_1PU1acE9ZZnNVjbUiEkjkAZx';

  const scrollToSection = (sectionSelect: any) => {
    const section = document.getElementById(sectionSelect);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
  }

  const profileCheck = async () => {
    const email = session?.user?.email;
    const userProfileResponse = await axios.post('/api/profile/get', { user_email: email });
    const userProfile = userProfileResponse.data.data;
    setTier(userProfile.tier);
  }
  
  useEffect(() => {
      if (session) {
        profileCheck();
      }
    }
  , [session]);

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
      <NavBar />
      <div className="min-h-full bg-base-100 md:flex justify-center">
        {/* Hero Section */}
        <section
          data-aos="zoom-y-in"
          className="flex flex-col items-center justify-center py-10 bg-base-100 space-y-10"
        >
        <div className="relative w-full flex flex-col items-end justify-center mb-20 mt-10 px-4 md:px-0">
          <div className="w-full md:w-full lg:w-3/4 flex flex-col items-center md:items-start">
          <div className="badge badge-primary badge-outline bg-white z-10 mb-5">
            Launch Special: 7 day free trial!
          </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-primary-content text-center md:text-left lg:text-left z-10 opacity-90">
              Product <em className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">header </em>ok
            </h1>
            <p className="text-xl mb-8 text-primary-content text-center md:text-left font-semibold z-10">
              Sub header
            </p>
              <div className="flex justify-center md:justify-start w-full">
                {session && tier !== 0 ? (
                  <button
                    className="btn btn-secondary btn-md font-bold items-center"
                    onClick={() => router.push('/dash')}
                  >
                    Launch Product
                    <SendHorizonal />
                  </button>
                ) : (
                  <>
                    {/* <p className='text-primary-content mb-2'>7 day free trial, cancel anytime</p> */}
                    <StripeCheckoutButton priceId={priceId} tier={1}></StripeCheckoutButton>
                    <button
                      className="btn btn-light btn-md font-bold items-center ml-5 w-40"
                      onClick={() => scrollToSection('setup')}
                    >
                      Learn More
                      <ArrowRight />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Features and Pain Points Section */}
      <section className="py-20 bg-base-100 h-full p-20 border-2 border-base-100 h-screen" id="setup">
        <div className="flex flex-col justify-center">
        </div>
      </section>

      <div className="min-h-full bg-base-100 sm:flex flex-col">
        {/* Pricing Section */}
        <section id="pricing" className="min-h-screen p-20 bg-base-100">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="badge badge-primary badge-outline mb-4">Launch Special: 7 day free trial!</div>
            <p className="text-5xl font-semibold text-primary-content mb-4">Pricing</p>
            <p className="text-center text-primary-content max-w-md mb-10">
              Instant AI support bots. Train and deploy support bots with ease.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-start md:space-x-8 space-y-8 sm:space-y-0">
            {/* Standard Plan */}
            <div data-aos="fade-right" className="lg:w-1/4 bg-base-100 p-6 rounded-lg text-primary-content space-y-5 border-base-300 border-2">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Standard</h3>
              <h3 className="text-4xl font-bold mb-4 text-primary">$15<span className="text-xl">/per month</span></h3>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                1 trainable and deployable bot
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Unlimited bot retrains
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                10,000 monthly/messages
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Ticketing System
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                ChatGPT 4o Model
              </p>
              <div className="h-5"></div>
              <PricingCheckoutButton priceId={priceId} tier={1} buttonText="Standard" className="btn btn-primary btn-md font-semibold items-center w-full bg-secondary-content" />
            </div>
            {/* Premium Plan */}
            <div data-aos="fade-left" className="lg:w-1/4 bg-base-100 p-6 rounded-lg text-primary-content border-2 border-primary space-y-5">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Premium</h3>
              <h3 className="text-4xl font-bold mb-4 text-primary">$45<span className="text-xl">/per month</span></h3>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                5 trainable and deployable bots
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Unlimited bot retrains
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                100,000 monthly/messages
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Ticketing System
              </p>
              <p className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                ChatGPT 4o Model
              </p>
              <div className="h-5"></div>
              <PricingCheckoutButton priceId={priceIdPremium} tier={2} buttonText="Premium" className="btn btn-primary btn-md font-semibold items-center w-full" />
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="py-20 bg-base-100 p-20 border-2 border-base-100">
          <div className="flex flex-col items-center justify-center mb-10">
            <p className="text-2xl font-medium text-primary mb-2">FAQs</p>
            <p className="text-4xl font-semibold text-primary-content">Frequently Asked Questions</p>
          </div>
          <div className="flex justify-center items-start flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
            <div className="lg:w-2/4 text-primary-content">
              <div data-aos="fade-up" className="collapse collapse-plus bg-base-100 border-t border-b">
                <input type="radio" name="my-accordion-3" defaultChecked />
                <div className="collapse-title text-xl font-medium">What is SupBot?</div>
                <div className="collapse-content">
                  <p>SupBot is an AI-powered support solution that can be easily integrated into any website.</p>
                </div>
              </div>
              <div data-aos="fade-up" className="collapse collapse-plus bg-base-100 mt-4 border-t border-b">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-xl font-medium">How do I get started with SupBot?</div>
                <div className="collapse-content">
                  <p>After successfully purchasing you will be redirected to your chat dashboard where you can train your first bot. You will be required to create an account.</p>
                </div>
              </div>
              <div data-aos="fade-up" className="collapse collapse-plus bg-base-100 border-t border-b mt-4">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-xl font-medium">How much does SupBot cost?</div>
                <div className="collapse-content">
                  <p>SupBot will be $15/monthly for one bot with Standard, or $45/monthly for 5 bots with Premium.</p>
                </div>
              </div>
              <div data-aos="fade-up"className="collapse collapse-plus bg-base-100 border-t border-b mt-4">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-xl font-medium">How can I contact support?</div>
                <div className="collapse-content">
                  <p>You can contact support by clicking the chat icon in the bottom right corner and ask for support email.</p>
                </div>
              </div>
              <div data-aos="fade-up" className="collapse collapse-plus bg-base-100 border-t border-b mt-4">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-xl font-medium">How do I see my customers messages?</div>
                <div className="collapse-content">
                  <p>You will receive an email of message conversation if customer requests to speak with a human.</p>
                </div>
              </div>
              <div data-aos="fade-up" className="collapse collapse-plus bg-base-100 border-t border-b mt-4">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-xl font-medium">How does SupBot work?</div>
                <div className="collapse-content">
                  <p>SupBot is built on top of OpenAI to create custom support bots that are trained from user inputs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Footer Section */}
      <footer className="bg-base-200">
      <div className="container mx-auto px-6 py-10 sm:flex items-center justify-center text-primary-content">
        <div className="flex flex-col items-center lg:ml-40">
            {/* SupBot logo */}
            {/* <Image
                src="/logo.png"
                alt="SupBot logo"
                width={60}
                height={20}
                className='mt-5'
            /> */}
            <h2 className="text-2xl font-bold mt-4"></h2>
            <p className="text-center max-w-md mt-4">
                Instant AI support bots. Train and deploy support bots with ease.
            </p>
            <p className='mt-5'>
              Built by <a href="https://x.com/axenieady" target='_blank' className="text-primary-content underline">@axenieady</a>
            </p>
        </div>
        <div className="container w-full mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                <h3 className="font-bold text-primary">LINKS</h3>
                <ul className="mt-2 space-y-2">
                    {/* <li><p onClick={() => setBotOpen(true)} className="text-primary-content cursor-pointer">Support</p></li> */}
                    <li><a href="#pricing" className="text-primary-content">Pricing</a></li>
                    {/* <li><a href="/affiliates" className="text-primary-content">Affiliates</a></li> */}
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-primary">LEGAL</h3>
                <ul className="mt-2 space-y-2">
                    <li><a href="/terms" className="text-primary-content">Terms of Service</a></li>
                    <li><a href="/privacy" className="text-primary-content">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
      </div>
      <p className="text-center mt-6 text-primary-content p-10">© 2024 - All rights reserved</p>

      </footer>
    </>
  );
};
