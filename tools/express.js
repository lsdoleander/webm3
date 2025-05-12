
    import cors from "cors"
    import express from "express"
    const app = express()
    const port = 8766

    app.use(express.static('dist/browser'));

    const corsOptions = {
        origin: process.env.CORS_ALLOW_ORIGIN || '*',
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };

    app.use(cors(corsOptions));
    app.listen(port, () => {
        console.log(`Staged: http://localhost:${port}/`);
    })
