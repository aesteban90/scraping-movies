
var m3u8ToMp4 = require('m3u8-to-mp4');
var converter = new m3u8ToMp4();
(async function() {
    await converter
      .setInputFile("https://stream07.peliscloud.net/hls/2a73cca7cff3b8ac3f807675ecf1b61f/2a73cca7cff3b8ac3f807675ecf1b61f.m3u8")
      .setOutputFile("C:/Esteban/dummy.mp4")
      .start();
   
    console.log("File converted");
  })();
