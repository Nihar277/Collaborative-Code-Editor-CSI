import express from 'express';\nconst app = express();\napp.get('/', (req, res) => res.send('API Running'));\nexport default app;
