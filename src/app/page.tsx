'use client';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { useEffect, useState, useCallback } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UploadCloud, XIcon, PlusIcon, Truck, RotateCcw, FileText} from 'lucide-react';
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

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className='h-screen bg-base-100'>  
        <NavBar credits={credits} setCredits={setCredits} />
        {loading && (
          <progress className="progress w-full"></progress>
        )}
          {/* Middle Section (Upload Area) */}
            <div className="flex items-center justify-center w-full p-4">
              {file ? (
                <>
                  <div className="w-full flex justify-center items-center"> {/* Centering */}
                    <div>
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
                      <p className='text-gray-700 mt-5'>{file.name}</p>
                      {numPages && (
                        <p className='text-gray-700 font-light'>{numPages === 1 ? '1 page' : `${numPages} pages`}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-3/4 h-full p-10 cursor-pointer text-black"
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
            <div className='w-full flex justify-center bg-base-100 rounded p-5'>
              {text && (
              <div className='flex justify-center'>
                <button className="btn btn-secondary" onClick={downloadTextFile}>
                  Download Raw Text
                </button>
                <button className="btn btn-secondary ml-2" onClick={convertText}>
                  Convert to table
                </button>
              </div>
              )}
            </div>
            {responseText && (
              <div className="flex items-center justify-center w-full p-4">
                {/* <p className='text-black'>{responseText}</p>
                <p className='text-black'>{json ? JSON.stringify(json, null, 2) : ''}</p> */}
                <ResponseTable responseText={json} />
              </div>
            )}

        {/* <script src="https://supbot.io/dist/bot-embed.js" data-bot-id="549616c5-052f-4145-929a-95d59f1023fb" data-bot-open="false" data-theme="emerald"></script> */}
      </div>
  );
};
