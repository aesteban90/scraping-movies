const puppeteer = require('puppeteer');
console.log('iniciando scraping');

(async () => {
    console.log('Iniciando proceso asyncrono')

    let urlpage = 'https://www3.animeflv.net/browse';
    let browser = await puppeteer.launch();
    let page = browser.newPage();
    
    console.log('obtuvo la pagina')

    await page.goto(urlpage, {waitUntil: 'networkidle2'});

    let data = await page.evaluate(() => {
        let title = document.querySelector('h3[class="Title"]').innerText;

        return {
            title
        }
    });
    console.log('Obteniendo datos')
    console.log(data);

    await browser.close();
});