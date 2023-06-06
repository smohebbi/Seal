const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
// const { fromPath } = require('pdf2pic');
// const pdf2pic = require('pdf2pic');


const dbFilePath = './DB/database.db';
const db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});
const createTableQuery = ` 
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        downloadLink TEXT,
        downloads INTEGER DEFAULT 0,
        expiration TIMESTAMP
    )
`;// previewImage TEXT

db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating documents table:', err.message);
    } else {
        console.log('Documents table created successfully.');
    }
});


const app = express();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, callback) => {
        const name = file.originalname;
        callback(null, name);
    }
});
const upload = multer({ storage });

const PORT = process.env.PORT || 4002;


app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.put('/api/documents/shared/:id', (req, res) => {
    const documentId = req.params.id;

    db.run(
        'UPDATE documents SET expiration = ?, downloadLink = ? WHERE id = ?',
        [req.body.expiration, req.body.link, documentId],
        function (err) {
            if (err) {
                console.error('Error updating document:', err.message);
                return res.sendStatus(500);
            }

            if (this.changes === 0) {
                return res.status(404).send('Document not found.');
            }

            res.sendStatus(200);
        }
    );
});

app.get('/api/documents/download/:id', (req, res) => {
    const documentId = req.params.id;

    db.get(
        'SELECT * FROM documents WHERE id = ?',
        [documentId],
        (err, row) => {
            if (err) {
                console.error('Error retrieving document:', err.message);
                return res.sendStatus(500);
            }

            if (!row) {
                return res.status(404).send('Document not found.');
            }

            const filePath = path.join(__dirname, 'uploads', row.name);
            console.log(filePath);

            if (fs.existsSync(filePath)) {
                const fileStream = fs.createReadStream(filePath);
                res.setHeader('Content-Type', row.name);
                fileStream.pipe(res);
            } else {
                res.status(404).send('File not found');
            }
        }
    );
})

app.get('/api/documents/shared/:link', (req, res) => {
    db.get(
        'SELECT * FROM documents WHERE downloadLink = ?',
        ['http://localhost:4002/api/documents/shared/' + req.params.link],
        (err, row) => {
            if (err) {
                console.error('Error retrieving document:', err.message);
                return res.sendStatus(500);
            }

            if (!row) {
                return res.status(404).send('No file');
            } else if (row.expiration < Date.now()) {
                return res.status(400).send('Link has expired!');
            }

            const filePath = path.join(__dirname, 'uploads', row.name);
            console.log(filePath);

            if (fs.existsSync(filePath)) {
                const fileStream = fs.createReadStream(filePath);
                res.setHeader('Content-Type', row.name);
                fileStream.pipe(res);
            } else {
                res.status(404).send('File not found');
            }
        }
    );
});

app.get('/api/documents', (req, res) => {
    db.all('SELECT * FROM documents', (err, rows) => {
        if (err) {
            console.error('Error retrieving documents:', err.message);
            return res.sendStatus(500);
        }

        res.json(rows);
    });
})

app.post('/api/documents/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file');
    }

    const document = {
        id: Date.now().toString(),
        name: req.file.originalname,
        type: req.file.mimetype,
        uploadDateTime: new Date(),
        downloads: 0,
        downloadLink: '',
        expiration: null
    };

    (async () => {
        // Generate the preview image
        try {
            // const converter = new pdf2pic();
            // const options = {
            //     density: 200,            // Image density (dpi)
            //     saveFilename: 'thumbnail',   // Output filename without extension
            //     savePath: 'previews',   // Output directory
            //     format: 'png',          // Output image format
            //     width: 200,
            //     height: 300,
            //     page: 1,                // Page number to extract the thumbnail from
            // };

            // document.previewImage = converter.convert(req.file.path, options)
            //     .then((result) => {
            //         console.log('Image created successfully:', result);
            //         // Process the converted image here
            //     })
            //     .catch((error) => {
            //         console.error('Error converting PDF to image:', error);
            //     });
            // console.log('path: ', req.file.path);
            // const pdf2pic = fromPath(req.file.path, options);
            // console.log('type of pdf2pic: ', typeof(pdf2pic));
            // console.log('t pdf2pic: ', pdf2pic);
            // const thumbnailPath = await pdf2pic();
            // console.log('thumbnailPath: ', thumbnailPath);
            // document.previewImage = thumbnailPath;

            const insertQuery = `INSERT INTO documents (id, name, type, uploadDate, downloads, downloadLink, expiration)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(
                insertQuery,
                [
                    document.id,
                    document.name,
                    document.type,
                    document.uploadDateTime,
                    document.downloads,
                    document.downloadLink,
                    document.expiration,
                    // document.previewImage
                ],
                function (err) {
                    if (err) {
                        console.error('Error inserting document:', err.message);
                        res.status(500).send('Failed to upload document.');
                    } else {
                        console.log('Document uploaded successfully.');
                        res.status(200).send('Document uploaded successfully.');
                    }
                });
        } catch (error) {
            console.error('Error generating preview image:', error);
            res.status(500).send('Failed to generate preview image.');
        }
    })();
});

app.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}`);
})
