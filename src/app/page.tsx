'use client';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UploadCloud, XIcon, PlusIcon } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import BotContainer from './components/botContainer';

import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

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

  const handleFileChange = (event: any) => {
    setLoading(true);
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    console.log(selectedFile);
    setLoading(false);
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

  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    const pagesPromises = [];
  
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const pagePromise = pdf.getPage(i).then((page: any) => {
        return page.getTextContent().then((textContent: any) => {
          // Extract text content for each row and join with line breaks
          return textContent.items
            .map((item: any) => item.str)
            .join(' ');
        });
      });
      pagesPromises.push(pagePromise);
    }
  
    Promise.all(pagesPromises).then((pagesText) => {
      setText(pagesText.join('\n\n--- Page Break ---\n\n')); // Store the entire text with page breaks in state
    });
    setLoading(false);
  };

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
    <div className='h-screen'>  
      <div className='bg-base-100 px-4 py-5 border-b'>
        <h1 className="text-md font-semibold text-black z-10 opacity-90">
          PDF Playground | Data Extraction Tool
        </h1>
      </div>
      <div className="min-h-full bg-base-100">

        {/* Container for the three sections */}
        <div className="w-full justify-center px-20 py-10 space-y-5">
          {/* Middle Section (Upload Area) */}
            <div className="flex items-center justify-center w-full p-4">
              {file ? (
                <>
                  <div className="w-full h-full flex justify-center items-center"> {/* Centering */}
                    <div>
                      <div className="card shadow-xl w-[300px] mx-auto">
                        {loading ? (
                         <span className="loading loading-spinner loading-lg"></span>
                        ) : (
                        <div className="Example__container__document" ref={setContainerRef}>
                          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
                            <Page
                              pageNumber={1}
                              width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                            />
                          </Document>
                        </div>
                        )}
                      </div>
                      <p className='text-gray-700 mt-5'>{file.name}</p>
                      <p className='text-gray-700 font-light'>{numPages} pages</p>
                    </div>
                  </div>
                </>
              ) : (
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-1/2 h-64 border-2 border-dashed border-base-300 rounded-lg cursor-pointer text-black hover:bg-base-200"
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
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {file && loading && (
              <div className='flex justify-center'>
              <progress className="progress w-56"></progress>
              {/* <progress className="progress w-full text-neutral" value={uploadProgress} max="100"></progress> */}
              </div>
            )}
            {!text && (
              <div className='flex justify-center'>
                <label className="btn btn-primary btn-lg w-60 cursor-pointer">
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
            )}
            {text && (
            <div className='flex justify-center'>
              <button className="btn btn-secondary" onClick={downloadTextFile} disabled={!text}>
                Download Raw Text
              </button>
              <button className="btn btn-secondary ml-2" disabled={!text}>
                Extract Data using OCR
              </button>
            </div>
            )}
            {/* <div>
              <p className='text-black'>Serverless File Data Processing and Conversion</p>
            </div> */}
        </div>
      </div>
      <BotContainer />
    </div>
  );
};
