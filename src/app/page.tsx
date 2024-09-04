'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import axios from 'axios'
import Link from 'next/link';
import { UploadCloud, XIcon } from 'lucide-react';
import Image from 'next/image';
import StripeCheckoutButton from './components/stripeCheckoutButton';
import PricingCheckoutButton from './components/pricingCheckoutButton';
import NavBar from "./components/navBar";
import React from "react";
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import AOS from "aos";
import "aos/dist/aos.css";
import { set } from 'zod';

export default function Home() {
  const [tier, setTier] = useState(0);
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const clearFile = () => {
    setFile(null);
    setText('');
  }

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    console.log(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert('Please select a file before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setUploadProgress(0);

      const response = await axios.post('/api/convert', formData, {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) {
            const percentCompleted = Math.round((loaded * 100) / total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      const binaryData = response.data.text;
      setText(binaryData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = (pdf: any) => {
    pdf.getPage(1).then((page: any) => {
      page.getTextContent().then((textContent: any) => {
        const extractedText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        setText(extractedText);
      });
    });
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
          className="flex flex-col items-center justify-start py-10 bg-base-100 space-y-10"
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-primary-content text-center md:text-left lg:text-left z-10 opacity-90">
          </h1>
          <p className="text-xl mb-8 text-black text-center md:text-left font-semibold z-10">
            PDF Converter
          </p>
          <div className="flex items-center justify-center w-96">
            {file ? (     
              <>    
                <div className='card shadow w-full'>
                  <div className='flex justify-between p-2 px-4'>
                    <p className='text-black text-sm'>{file.name}</p>
                    <button onClick={clearFile}>
                      <XIcon className='w-5 h-5 text-red-500' />
                    </button>
                  </div>
                  <div className="card shadow w-full">
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    </Document>
                    <div className="card shadow w-full mt-4 text-black">
                      <h3>Extracted Text:</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                </div>
              </> 
            ) : (
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-base-300 rounded-lg cursor-pointer text-black hover:bg-base-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-base-content" />
                    <p className="mb-2 text-sm text-base-content">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-base-content">PDF (MAX. 100mb)</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                )}
              </div>
            <form onSubmit={handleSubmit}>
              <button disabled={loading} className='btn btn-secondary w-full' type="submit">
                {loading ? 'Generating...' : 'Convert PDF to Text'}
              </button>
            </form>
          {loading && <progress className="progress w-56" value={uploadProgress} max="100"></progress>}
          {/* {text &&
            <button className='btn btn-primary w-40' type="submit">
              Download File
            </button>
          } */}
        </section>
      </div>
    </>
  );
};
