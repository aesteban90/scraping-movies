const puppeteer = require('puppeteer');
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless:false});
            const page = await browser.newPage();
            //page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0")
            //page.setCookie('NID=214=Ehg9ELIyk6zeqVFuxmBGw-GeL9Y2wkyDpi25qrD7mHpj0rMCY8FTe1g5LcYhATisGjxSuNbcMFodavbmqOtvtO9to-WXRu-9H0SXJpC04J4OsGfrOckZouJFAqvia6Wt_BaynZrap-daBehNBUS8K6S5nDnhzNtjjiqURl4v9a0')
            
            /*
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'document') {
                    request.continue();
                } else {
                    request.abort();
                }
            });
            */
            await page.goto("https://www.blogger.com/");
            
            
            //browser.close(); 
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(console.log).catch(console.error);