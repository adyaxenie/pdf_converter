'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UploadCloud, XIcon } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);

  const clearFile = () => {
    setFile(null);
    setText('');
  };

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
  
    // Once all pages are processed
    Promise.all(pagesPromises).then((pagesText) => {
      // Each page's text will now be a separate string in the array
      setText(pagesText.join('\n\n--- Page Break ---\n\n')); // Store the entire text with page breaks in state
    });
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
    <>  
      <div className='bg-base-100 px-4 py-5 border-b'>
        <h1 className="text-md font-semibold text-black z-10 opacity-90">
          PDF Playground
        </h1>
      </div>
      <div className="min-h-full bg-base-100">

        {/* Container for the three sections */}
        <div className="flex w-full md:flex justify-center justify-between items-start space-x-10">
  
          {/* Middle Section (Upload Area) */}
          <section className="flex flex-col items-center justify-start bg-base-100 space-y-10 w-2/3">
            <div className="flex items-center justify-center w-full p-4">
              {file ? (
                <>
                  <div className="w-full h-full">
                    <div className="w-full p-2 text-black">
                      <div className="card shadow w-full">
                        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                          <Page pageNumber={1} className="overflow-hidden" />
                        </Document>
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
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </section>
  
          {/* Right Section (Buttons and Progress Bar) */}
          <section className="flex-1 flex flex-col space-y-4 p-4 w-full">
            {/* <form onSubmit={handleSubmit}>
              <button disabled={loading} className="btn btn-sm w-full" type="submit">
                {loading ? 'Generating...' : 'Download as Text'}
              </button>
            </form> */}
            {loading && (
              <progress className="progress w-full" value={uploadProgress} max="100"></progress>
            )}
            {/* Conditionally render download button if text is generated */}
            <button className="btn btn-primary w-full" onClick={downloadTextFile} disabled={!text}>
              Download Extracted Text
            </button>
          </section>
        </div>
      </div>
    </>
  );
};
