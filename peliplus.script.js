const fetch = require('node-fetch');
(async () => {
    
    let url = "https://pelisplus.icu/playlist/NDM1Njc/"+ new Date().getTime();
    console.log(url)

    const response = await fetch(url)
    .then(res => res.json())
    .then(json => console.log(json));

    console.log('response1: '+response);
})();