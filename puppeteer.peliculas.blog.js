const puppeteer = require('puppeteer');
const fs = require('fs');
const tag = 'peliculas-2010';

(async () => {
    try {
        console.log("####### Inicia la operacion de visitas al blog")
        const browser = await puppeteer.launch({headless:false});
        const page = await browser.newPage();
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0")
        page.on('dialog', async dialog => {
            //console.log(dialog.message());
            await dialog.dismiss();
        });
        let url_movies_ya_cargadas = await getMoviesCargadasJSON(tag);   
        for (let index = url_movies_ya_cargadas.movies.length - 1; index >= 0; index--) {
            const url = url_movies_ya_cargadas.movies[index].bloggerURL;

            try {
                if(url){
                    console.log('Entrando a '+url_movies_ya_cargadas.movies[index].title);
                    await page.goto(url);                   
                    await page.waitForSelector('#linkveronline',{timeout:1000});
                    await page.click('#linkveronline');
                    await page.waitForTimeout(3000);
                }else{
                    console.log('No encontro la url para '+url_movies_ya_cargadas.movies[index].title)
                }    
            } catch (error) {
                //continuar
            }
            
        }
        console.log("####### FINALIZA la operacion de visitas al blog")
    } catch (error) {
        console.log(error);
    }
})();

function getMoviesCargadasJSON(file) {
    return new Promise(resolve => {
        fs.readFile('./pelisplus.so/'+file+'.json', (err, data) => {
            if (err) {
                resolve(undefined);
            }else{
                resolve(JSON.parse(data));
            }
        });
    })
}