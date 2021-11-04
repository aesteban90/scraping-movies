const fetch = require('node-fetch');
const {GOOGLE_API_KEY} = process.env;

const blogID = '1960239950165354362';
const urlApiBlogger = `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts`;
const accessKey = `?key=${GOOGLE_API_KEY}`;
//const url = 'https://www228.ff-01.com/token=ZMbDeb0wtaPT-kBmEQirkw/1620799725/45.170.0.0/130/4/98/5100cbe3f1ebf5625ed57965b05f8984-360p.mp4';
const url = 'https://www1727.ff-04.com/token=XMqA2jDIDcIkj8tcV0d2sA/1620833016/45.170.0.0/22/d/7e/b5cc7dfd929cb6c3bc34b3f3487977ed-480p.mp4';

(async () => {
    //Buscando si existe el post
    //let arrayPost = await fetch(urlApiBlogger+accessKey)                        
    let arrayPost = await fetch(url)
    .then(data => {console.log(data.status)})                        
    .catch((err) => {
        console.log(err); 
        return undefined;
    })   

    console.log(arrayPost)

})();