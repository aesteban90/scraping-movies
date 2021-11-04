const fetch = require('node-fetch');
const { MITLY_API_TOKEN } = process.env;
const mitly_url = `https://mitly.us/api?api=${MITLY_API_TOKEN}&url=`;

(async () => {
    url_video = 'https://storage.googleapis.com/theta-strata-310114/5THL2IRD9E5Q/23mes_godzilla-vs-kong_1105489.mp4'
    //let url = mitly_url+url_video+"&alias=godzilla";
    let url = mitly_url+url_video;
    console.log(url)

    const response = await fetch(url)
    .then(res => res.json())
    .then(json => console.log(json));

    console.log('response: '+response);

})();