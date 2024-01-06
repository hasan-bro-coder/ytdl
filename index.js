// ----------------------------------------
// 🔥 simple and fast youtube video downloader app
//  index.js   : the youtube video downloader api
//  index.html : the frontend
//  made by HSN-BRO-CODER 😎
// ----------------------------------------

const bodyParser = require("body-parser");
const compression = require("compression");
const express = require("express");
const app = express();
const logger = require('progress-estimator')();
const youtubedl = require("youtube-dl-exec");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/yt", async (req, res) => {
  function findReqVideoFormat(formats, requestedResolution){
    let Video = null;
    const availableFormats = formats.filter((format) => format.ext === "mp4" && format.format_note !== "none");
    // filtering not supported formats

    const sortedFormats = availableFormats.sort((a, b) => a.height - b.height);
    // sorting the array by height||resolutions

    Video = sortedFormats.find((format) => format.height >= requestedResolution);
    // finding the video

    return Video;
  };

  function findReqAudioFormat(formats){
    let Audio = null;
    const availableFormats = formats.filter(
      (format) => format.ext === "m4a" && format.format_note !== "none"
    );
    // filtering not supported formats

    const sortedFormats = availableFormats.sort((a, b) => b.abr - a.abr);
    // sorting the array by height||resolutions

    Audio = sortedFormats[0];
    return Audio;
  };
  try {
    const promise = youtubedl(req.body.link, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:googlebot"],
    }); // getting youtube video details from youtube-dl 

    const result = await logger(promise, "⏳ Obtaining...");
    // logger for decoration 

    const videoTitle = result.title;
    const Video = findReqVideoFormat(result.formats, req.body.resolution || 720); // filtering video formats
    const Audio = findReqAudioFormat(result.formats); // filtering audio formats

    res.json({
      type: "video",
      title: videoTitle,
      media: req.body.video ? Video : Audio,
    });
    res.end();

  } catch (err) {
    console.error(err)
    res.end();
  }
});

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
});
