import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { Document, Page, pdfjs } from 'react-pdf';

export const DocumentList = () => {
  const [documents, setDocuments] = useState([]);

  // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:4002/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div id='listContainer'>
      <h2>Document List</h2>
      <button onClick={fetchDocuments}>Update</button>

      <div className="scrollableContainer">
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              <div>
                id: {document.id} <br />
                type: {document.type} <br />
                uploadDateTime: {document.uploadDateTime} <br />
                name: {document.name} <br />
                expiration: {document.expiration} <br />
                downloads: {document.downloads} <br />
                downloadLink: {document.downloadLink}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    // <div id='listContainer'>
    //   <h2>Document List</h2>
    //   {/* <Document file="">
    //     <Page pageNumber={1} />
    //   </Document> */}
    //   {/* <iframe id="pdf-prev file={pdfUrl}iew" src="./components/CV.pdf" frameborder="0"></iframe> */}
  );
}
