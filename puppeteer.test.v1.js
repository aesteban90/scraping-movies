const puppeteer = require('puppeteer');
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless:false});
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            /*
            page.on('request', (request) => {
                if (/png|jpg|css|jpeg|mp4|gif|woff/.test(request.url)) {
                    request.abort();
                } else {
                    request.continue();
                }
            });*/
            page.on('request', (request) => {
                if (request.resourceType() === 'document') {
                    request.continue();
                } else {
                    request.abort();
                }
            });
            await page.goto("https://www.casanissei.com/py/");
            await page.waitForSelector('input[name=q]');
            await page.$eval('input[name=q]', el => el.value = 'Iphone');
            await page.$eval('button[type=submit]', form => form.click());
            // await page.click('button[type=submit].action.search');
            await page.waitFor(500);
            //await page.waitForSelector('.product-item-details',{timeout:10000});
            //await page.waitForNavigation({waitUntil: ['load']});

            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll('.product-item-details');
                console.log(items)
                items.forEach((item) => {
                    let item_a = item.querySelector('.product-item-link');
                    let item_precio = item.querySelector('span.price');
                    
                    results.push({
                        url:  (item_a ? item_a.getAttribute('href') : 'null'),
                        title: (item_a ? item_a.innerText : 'null'),
                        precio: (item_precio ? item_precio.innerHTML : 'null')
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