
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 5001;

app.get('/test-undefined', (req, res) => {
    res.json(undefined);
});

app.get('/test-null', (req, res) => {
    res.json(null);
});

app.listen(PORT, async () => {
    console.log(`Server running on ${PORT}`);

    try {
        console.log("Fetching /test-undefined");
        const res1 = await fetch(`http://localhost:${PORT}/test-undefined`);
        const text1 = await res1.text();
        console.log(`Response 1: '${text1}'`);

        console.log("Fetching /test-null");
        const res2 = await fetch(`http://localhost:${PORT}/test-null`);
        const text2 = await res2.text();
        console.log(`Response 2: '${text2}'`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
