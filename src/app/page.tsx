'use client';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { useEffect, useState, useCallback } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UploadCloud, XIcon, PlusIcon, Truck, RotateCcw, FileText, Trash2 } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {useDropzone} from 'react-dropzone'
import Tesseract from 'tesseract.js';
import ResponseTable from './components/responseTable';
import 'core-js/full/promise/with-resolvers.js';
import AOS from "aos";
import "aos/dist/aos.css";
import NavBar from './components/navBar';
import { set } from 'zod';

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [json, setJson] = useState('');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const [flowStage, setFlowStage] = useState(0);

  const [tier, setTier] = useState(0);
  const [credits, setCredits] = useState(0);

  const { data: session } = useSession();

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
    setTier(userProfile.tier);
    setCredits(userProfile.credits);
  }

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const clearFile = () => {
    setFile(null);
    setText('');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setFile(acceptedFiles[0]);
    }
  }, [])
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const convertText = async () => {
    if (credits <= 0) {
      alert('Insufficient credits. Cannot perform this operation.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post('/api/chat', { prompt: text });
      setResponseText(response.data.text);
      setJson(response.data.json);
  
      await updateCredits();
    } catch (error) {
      console.error('Error during text conversion:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateCredits = async () => {
    try {
      console.log('Updating credits', credits);
      const response = await axios.post('/api/profile/update_credits', { credits: credits, user_email: session?.user?.email });
  
      if (response.data.error) {
        console.error('Error updating credits:', response.data.error);
        alert(response.data.error);
        return;
      }
  
      setCredits(response.data.data[0].credits);
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };
  

  const onDocumentLoadSuccess = async (pdf: any) => {
    setLoading(true);
    setNumPages(pdf.numPages);
    const pagesPromises = [];
  
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
  
      // Try to get text content
      const pagePromise = page.getTextContent().then((textContent: any) => {
        const extractedText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
  
        // If extracted text is empty, fall back to Tesseract
        if (extractedText.trim().length === 0) {
          return renderPageToImageAndUseTesseract(page);
        }
  
        return extractedText;
      });
  
      pagesPromises.push(pagePromise);
    }
  
    // Once all pages have been processed, join the extracted text
    Promise.all(pagesPromises).then((pagesText) => {
      setText(pagesText.join('\n\n--- Page Break ---\n\n')); // Store the entire text with page breaks
      setLoading(false);
    });

    setLoading(false);
  };
  
  const renderPageToImageAndUseTesseract = async (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
  
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
  
    // Await the rendering task directly
    const renderTask = page.render(renderContext);
    await renderTask.promise; // This is where the PDFRenderTask object has a `promise` property
  
    // Convert the canvas to an image (data URL)
    const dataUrl = canvas.toDataURL();
  
    // Use Tesseract.js to extract text from the image
    const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng');
    return text;
  };

  const [rotation, setRotation] = useState(0);
  const rotateFile = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }

  // Function to handle downloading text as a .txt file
  const downloadTextFile = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted-text.txt';
    link.click();
  };

  const handleRemoveFile = () => {
    setFile(null)
    setText('')
    setNumPages(0)
  };

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  const [activeTab, setActiveTab] = useState('rawText');

  return (
    <div className='h-screen bg-base-100'>
      {/* Header Section */}
      <NavBar credits={credits} setCredits={setCredits} />
      {loading && <progress className="progress w-full"></progress>}

      {/* Main Container for Two-Column Layout */}
      <div className="flex h-full">
        {/* Left Section: PDF Upload and Preview */}
        <div className="w-1/2 p-4 flex items-center justify-center">
          {file ? (
            <div className="w-full flex justify-center items-center">
              <div>
              <div className='flex space-x-2 justify-end m-4'>
                    <Trash2 className='w-4 h-4 text-red-500 cursor-pointer' onClick={handleRemoveFile}/>
                    <RotateCcw className='w-4 h-4 text-black cursor-pointer' onClick={rotateFile}/>
                  </div>
                <div className="card shadow-xl w-[300px] mx-auto rounded-lg">
                  <div className="Example__container__document" ref={setContainerRef}>
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
                      <Page
                        pageNumber={1}
                        width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                        rotate={rotation}
                      />
                    </Document>
                  </div>
                </div>
                <p className='text-black mt-5'>{file.name}</p>
                {numPages && (
                  <p className='text-black font-light'>{numPages === 1 ? '1 page' : `${numPages} pages`}</p>
                )}
              </div>
            </div>
          ) : (
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full p-20 cursor-pointer text-black border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-400"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-4 text-base-content" />
                <p className="mb-2 text-sm text-base-content">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-base-content">PDF (MAX. 100mb)</p>
              </div>
              <div className='flex justify-center'>
                <label className="btn btn-secondary text-white btn-lg w-60 cursor-pointer font-bold">
                  <PlusIcon className="w-6 h-6" />
                  Add File
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Right Section: Tab Navigation and Content Switching */}
        <div className="w-1/2 p-4 flex flex-col">
          {/* Tab Navigation */}
          <div role="tablist" className="tabs tabs-bordered mb-4">
            <a 
              role="tab" 
              className={`tab ${activeTab === 'rawText' ? 'tab-active' : ''}`} 
              onClick={() => setActiveTab('rawText')}
            >
              Raw Text
            </a>
            <a 
              role="tab" 
              className={`tab ${activeTab === 'convertedTable' ? 'tab-active' : ''}`} 
              onClick={() => setActiveTab('convertedTable')}
            >
              Converted Table
            </a>
          </div>

          {/* Tab Content */}
          {activeTab === 'rawText' ? (
            <div className='flex flex-col h-full'>
              {/* Raw Text Display Area */}
              <div className='bg-gray-100 p-6 border rounded-lg flex-1 overflow-hidden'>
                {text ? (
                  <textarea 
                    className='w-full h-full p-2 text-black bg-white border rounded resize-none overflow-auto' 
                    value={text} 
                    readOnly 
                  />
                ) : (
                  <p className='text-gray-500 text-center'>Upload a PDF to view the extracted text here.</p>
                )}
              </div>

              {/* Action Buttons Positioned at the Bottom */}
              {text && (
                <div className='flex justify-end mt-auto p-4'>
                  <button className="btn btn-secondary text-white mr-2" onClick={downloadTextFile}>
                    Download Raw Text
                  </button>
                  <button className="btn btn-secondary text-white" onClick={convertText}>
                    Convert to Table
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='h-full flex flex-col'>
              {/* Converted Table View */}
              {!json ? (
                <p className='text-gray-500 text-center flex-1'>No processed data available to display.</p>
              ) : (
                <div className='h-full overflow-auto'>
                  <ResponseTable responseText={json} />
                </div>
              )}

              {/* Save Button Positioned at the Bottom */}
              {json && (
                <div className='flex justify-end mt-auto p-4'>
                  <button className='btn btn-primary'>
                    Save Table Columns
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};