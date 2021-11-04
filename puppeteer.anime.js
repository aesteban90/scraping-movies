const puppeteer = require('puppeteer');
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless:false});
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'document') {
                    request.continue();
                } else {
                    request.abort();
                }
            });
            await page.goto("https://www3.animeflv.net/browse");
            
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll('ul.ListAnimes li article');
                items.forEach((item) => {
                    let name = item.querySelector('h3.Title');
                    let link = item.querySelector('a.Button');
                    results.push({
                        url:  link,
                        title: name
                    });
                });
                return results;
            })
            //browser.close(); 
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(console.log).catch(console.error);