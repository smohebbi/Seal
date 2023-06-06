import axios from "axios"
import { useState } from "react";
const { v4: uuidv4 } = require('uuid');

export const DocumentLink = () => {
    const [docId, setDocId] = useState('');
    const [exTime, setExTime] = useState(0);
    const [link, setLink] = useState({});
    const [documents, setDocuments] = useState([]);

    const changeIdHandler = (e) => {
        setDocId(e.target.value);
    }

    const changeTimeHandler = (e) => {
        setExTime(e.target.value);
    }

    const generateDownloadData = (id, expiration) => {
        const linkId = uuidv4();
        const linkExpiration = Date.now() + expiration * 60 * 60 * 1000;

        const linkData = {
            link: `http://localhost:4002/api/documents/shared/${linkId}`,
            id: linkId,
            documentId: id,
            expiration: linkExpiration
        };

        return linkData;
    }

    const linkHandler = async () => {
        const generatedLink = generateDownloadData(docId, exTime);
        setLink(generatedLink);
        
        try {
            const response = await axios.put(`http://localhost:4002/api/documents/shared/${docId}`, generatedLink);        
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div id='linkContainer'>
            <h2>Create a Share Link</h2>
            <label htmlFor="docId">Document Id </label>
            <input id="docId" type="text" value={docId} onChange={changeIdHandler} required /> <br />
            <label htmlFor="exTime">Expiration Duration </label>
            <input id="exTime" type="number" step="1" min="1" max="24" value={exTime} onChange={changeTimeHandler} required /><br />

            <button onClick={linkHandler}>Share Link</button>
            <h3 id="link">{link.link}</h3>
        </div>
    );
}