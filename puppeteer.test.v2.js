const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
//const url = 'https://pelisplus.so/pelicula/encuentro-explosivo';
//const url = 'https://pelisplus.icu/play?id=NDM1Njc&option=latin';
//const url = 'https://stream07.peliscloud.net/public/dist/index.html?id=2a73cca7cff3b8ac3f807675ecf1b61f';
//const url = 'https://pelisplus.so/pelicula/godzilla-vs-kong';
const url = 'https://fcdn.stream/v/134mdcjzdrdzr2-';
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();

            const blockedResourceTypes = [
                /*
                'image',
                'media',
                'font',
                'texttrack',
                'object',
                'beacon',
                'csp_report',
                'imageset',
                */
              ];
              
              const skippedResources = [
                'quantserve',
                'adzerk',
                'doubleclick',
                'adition',
                'exelator',
                'sharethrough',
                'cdn.api.twitter',
                'google-analytics',
                'googletagmanager',
                'google',
                'fontawesome',
                'facebook',
                'analytics',
                'optimizely',
                'clicktale',
                'mixpanel',
                'zedo',
                'clicksor',
                'tiqcdn',
              ];
            const page = await browser.newPage();
            //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
            await page.setRequestInterception(true);
            page.on('request', request => {
                const requestUrl = request._url.split('?')[0].split('#')[0];
                if (
                  blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
                  skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
                ) {
                  request.abort();
                } else {
                  request.continue();
                }
            });
            
           try {
              await page.goto(url,{timeout:3000});
           } catch (error) {
               //continuar de igual forma
           }
           try {
              await page.waitForSelector('svg');
              await page.click('svg');
              await page.waitForTimeout(200);
              await page.waitForSelector('svg');
              await page.click('svg');
           } catch (error) {
             //continuar
           }           
            
            await page.waitForSelector('.jwplayer');
            let url_redirect = await page.evaluate(() => {
              let id_jwplqyer = document.querySelector('.jwplayer').getAttribute('id');
              return jwplayer(id_jwplqyer).getConfig().sources[0].file;
            })

            let link_video = await fetch(url_redirect)
              .then((data) => {return data.url})
              .catch((err) => console.log(err))

            browser.close(); 
            return resolve(link_video);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(console.log).catch(console.error);