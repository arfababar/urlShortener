const express = require('express')
const app = express()

const connectDB = require('./config/db')
connectDB()

const url = require('./models/url')
const {nanoid} = require('nanoid')
app.set('view engine', 'ejs')
app.use(express.json())

app.get('/', (req, res) => {
    res.render('index')
});

app.post('/shorten', async (req, res) => {
    try {
        const { longUrl } = req.body;

        if (!longUrl) {
            return res.status(400).json({ message: "longUrl is required" });
        }
       
        const shortId = nanoid(6);  

        const newUrl = await url.create({
            longUrl,
            shortId
        });

        res.status(201).json({
            message: "Short URL created successfully",
            shortUrl: `http://localhost:3000/${shortId}`,
            data: newUrl
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get('/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;

        // 1) Find the URL in the database
        const foundUrl = await url.findOne({ shortId });

        if (!foundUrl) {
            return res.status(404).json({ message: "Short URL not found" });
        }

        // 2) Optional: increment click count
        foundUrl.clicks = foundUrl.clicks + 1;
        await foundUrl.save();

        // 3) Redirect to the original URL
        res.redirect(foundUrl.longUrl);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
});


app.listen(3000)