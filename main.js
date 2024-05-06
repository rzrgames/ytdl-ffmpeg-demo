const ytdl = require("ytdl-core");
const {createFFmpeg, fetchFile} = require("@ffmpeg/ffmpeg");

const ffmpeg = createFFmpeg({log: true});
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.listen(4000, () => {
    console.log('Server Works !!! At port 4000');
});


const proxy = url => {
    return "https://proxy.darenliang.com/?url=" + encodeURIComponent(url);
};

const ytdlOptions = {
    requestOptions: {
        maxRetries: 5,
        backoff: {inc: 2000, max: 2000},
        transform: (parsed) => {
            const originURL = parsed.protocol + "//" + parsed.hostname + parsed.path;
            parsed.host = "proxy.darenliang.com";
            parsed.hostname = "proxy.darenliang.com";
            parsed.path = "/?url=" + encodeURIComponent(originURL);
            parsed.protocol = "https:";
            return parsed;
        }
    }
};

const cleanMemory = () => {
    console.log("[info] unlinking old data");
    try {
        ffmpeg.FS("unlink", "output.mp3");
    } catch {
    }
    try {
        ffmpeg.FS("unlink", "output.mp4");
    } catch {
    }
};



const getAudioBuffer = async audioInfo => {
    cleanMemory();

    console.log("[info] fetching data");
    const audioData = await fetchFile(proxy(audioInfo.url));

    console.log("[info] writing data");
    const audioFilename = `audio.${audioInfo.container}`;
    ffmpeg.FS("writeFile", audioFilename, audioData);

    console.log("[info] encoding as mp3");
    await ffmpeg.run("-i", audioFilename, "output.mp3");

    console.log("[info] unlink temporary file");
    ffmpeg.FS("unlink", audioFilename);

    console.log("[info] sending final data");
    return ffmpeg.FS("readFile", "output.mp3").buffer;
};



const getInfo = async url => {
    console.log("[info] getting info");
    return await ytdl.getInfo(url, ytdlOptions);
};
const getBestAudioBuffer = async url => {
    const info = await getInfo(url);

    console.log("[info] choosing format");
    const audioInfo = ytdl.chooseFormat(info.formats, {
        quality: "highestaudio",
        filter: "audioonly"
    });

    return await audioInfo;
};


	
	
	




app.get('/download', (req,res) => {
	
 (async () => {
        const buffer = await getBestAudioBuffer("https://www.youtube.com/watch?v=KhAcM0Nbtr8");
        res.end(proxy(buffer.url));
    })();

});