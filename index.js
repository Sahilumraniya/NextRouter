import express from 'express';
import fs from 'fs';
const app = express();
const FILE_ROUTER = "./api/";

async function handleRegularRoutes(fileUrl, req, res) {
    try {
        if (fs.existsSync(fileUrl)) {
            let data = fs.readFileSync(fileUrl, 'utf8');
            if (data) {
                return data;
            }
        }else{
            return false;
        }
    } catch (err) {
        console.log("Sahil Error : " + err);
        return false;
    }
}

app.all('/*', async (req, res) => {
    console.log(req.url);
    let fileUrl = (FILE_ROUTER + req.url).replace("//", "/");
    let isfile = fs.existsSync(fileUrl + '.html');
    if (!isfile) {
        fileUrl += '/index.html';
    } else {
        fileUrl += '.html';
    }
    console.log(fileUrl);
    let result = await handleRegularRoutes(fileUrl, req, res);
    if (result) {
        res.send(result);
    } else {
        // res.status(404).json({ message: "Couldn't find Routes" });
        res.status(404).send(fs.readFileSync("./404.html", 'utf8'));
    }
})

app.listen(3000, () => {
    console.log('listening on http://localhost:3000');
})