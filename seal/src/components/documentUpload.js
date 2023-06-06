import axios from "axios";
import { useState } from "react";

export const DocumentUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const fileChangeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
    }

    const uploadHandler = async () => {
        if(!selectedFile) {
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post('http://localhost:4002/api/documents/upload', formData);
            setUploadStatus('Upload Successful');
            setSelectedFile(null);
        } catch (error) {
          console.error(error);
          setUploadStatus('Upload Failed');  
        }
    };
    
    return (
        <div id='upContainer'>
            <h2>Upload Document</h2> 
            <input type="file" onChange={fileChangeHandler} />  
            <button onClick={uploadHandler}>Upload</button>  
            <p>{uploadStatus}</p>      
        </div>
    );
}


