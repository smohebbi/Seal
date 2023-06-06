import axios from "axios"
import { useState } from "react"

export const DocumentDownload = () => {
    const [fileId, setFileId] = useState('');

    const changeHandler = (event) => {
        setFileId(event.target.value);
    }

    const downloadHandler = async () => {
        try {
            const response = await axios.get(`http://localhost:4002/api/documents/download/${fileId}`, {
                responseType: 'blob',
            });

            const downloadUrl = URL.createObjectURL(new Blob([response.data]));
            console.log(response);
            const link = document.createElement('a');
            link.href = downloadUrl;

            link.download = response.headers['content-type'];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
        }   
    }

    return (
        <div id='downContainer'>
            <h2>Download Document</h2>
            <input type="text" value={fileId} onChange={changeHandler} required/>
            <button onClick={downloadHandler} type="submit">Download</button>
        </div>
    );
}