const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');
const { convertCompilerOptionsFromJson } = require('typescript');
const apiGoogleAccessToken = require('./googleapis.oauth/apiGoogleAccessToken');
const blogID = '1960239950165354362';

const {GOOGLE_API_KEY, GOOGLE_ACCESS_TOKEN} = process.env;
//Se Genera automaticamente con el metodo en la carpeta googleapis.oauth/apiGoogleAccessToken.js
//Se exporta el client secret desde la pagina de google apis y se modifica el redirected en el codigo y la pagina

const urlApiBlogger = `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts`;
const accessKey = `?key=${GOOGLE_API_KEY}`;
const accessToken = `&access_token=${GOOGLE_ACCESS_TOKEN}`;

//Genera desde el api links por video
//var adfly = require("adf.ly")("17814843", "12bb3933132c8a52f6f99cb8ec081619");
//Genera el Full Page Script de ADFLY: no hace falta crear los links en el server adfly
const scripts_adfly = '<script type="text/javascript">var adfly_id = 17814843;var adfly_advert = "int";var popunder = true;var domains = ["ff-04.com","peliculas-onilne-descargas.blogspot.com/p"];</script><script src="https://cdn.adf.ly/js/link-converter.js"></script>'

const image_button_descargar = 'https://1.bp.blogspot.com/-msTvOREDmWo/YIK3EO5OjuI/AAAAAAAACnc/OpBzMqNwvzU5ICAdTPcPNrtgl62bXOJ4ACLcBGAsYHQ/s0/Button-Descargar.png'
const image_button_veronline = 'https://1.bp.blogspot.com/-1ebAbdCyuNQ/YIK3EMcEA4I/AAAAAAAACng/_KIV7l8oZGYmzJvhGLOgUQuWfRfuVg7OACLcBGAsYHQ/s0/Button-VerOnline.png';
const url_acortado_antes_VerOnline = 'https://peliculas-onilne-descargas.blogspot.com/p/blog-page.html?idapi=f8f70ebf-9844-485d-ace0-c06e5ba548b4&plr=00a8dba0-a0d4-470c-98b3-8d09b1fcdf4d&knim=78dbede9-2458-49e1-8832-bd8f2a332bd2';
const url_acortado_antes_Descarga = 'https://peliculas-onilne-descargas.blogspot.com/p/descarga.html?idapi=f8f70ebf-9844-485d-ace0-c06e5ba548b4&plr=00a8dba0-a0d4-470c-98b3-8d09b1fcdf4d&knim=78dbede9-2458-49e1-8832-bd8f2a332bd2';
const url_acortado_despues = '&respl=ce222f33-378b-43bc-9365-e9cbe555d108&wamp=ecb264e2-b775-4502-ad12-668c4f3df8f2&support=257b0eef-f01c-4ae8-9741-e1100527f9b1&referente=53631477-dd4e-4f45-a9b0-5ce30df980d7'
const server = 'https://pelisplus.so';
const tag = 'peliculas-2010';
const url = server+'/'+tag;
function run() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
            
            apiAccessToken = await apiGoogleAccessToken.getAccessToken();
           
            let url_movies_ya_cargadas = await getMoviesCargadasJSON(tag);                   
            if(!url_movies_ya_cargadas)url_movies_ya_cargadas = {tag, movies:[]};
             
            if(url_movies_ya_cargadas.movies.length == 0){
                try {
                    await page.goto(url, { waitUntil: 'load', timeout: 5000 });
                } catch (error) {
                    //Continuar
                }

                let count = 1;
                while (true) {
                    if (await page.$('div.butmore') !== null) {
                        await page.$eval('div.butmore', form => form.click());
                        await page.waitForSelector('div.butmore');
                        await page.waitForTimeout(1000);
                    } else {
                        console.log("Cargo todas las peliculas");
                        break;
                    }
                    count++;
                    if (count > 50) break;
                    //if (count > 2) break;
                }

                let page_peliculas = await page.evaluate(() => {
                    let results = [];
                    let items = document.querySelectorAll('.item-pelicula');
                    items.forEach((item) => {
                        results.push({
                            link: item.querySelector('a').getAttribute('href')
                        });                        
                    });
                    return results;
                });                
                url_movies_ya_cargadas.movies = page_peliculas;
                setMoviesCargadasJSON(tag, url_movies_ya_cargadas)
            }else{
                console.log("Obtuvo las peliculas desde el JSON");
            }            
            console.log("Encontro " + url_movies_ya_cargadas.movies.length + " en "+tag)
            count = 0;
            let post_exist = undefined;
            for (let index = url_movies_ya_cargadas.movies.length - 1; index >= 0; index--) {
                const item = url_movies_ya_cargadas.movies[index];
                
               

                //Solamente entrar en los que aun no se cargaron
                //if(url_movies_ya_cargadas.movies[index].estado){
                if(true){
                    count++;
                    if (count > 300) break;
                    try {
  
                        post_exist = undefined;
                        if(url_movies_ya_cargadas.movies[index].bloggerID){
                            //console.log("Busca el post en el blogger "+url_movies_ya_cargadas.movies[index].bloggerID)
                            //Buscando si existe el post
                            post_exist = await fetch(urlApiBlogger+'/'+url_movies_ya_cargadas.movies[index].bloggerID+accessKey)                        
                            .then(res => res.json())
                            .then(json => {return json})                        
                            .catch((err) => {
                                console.log(err); 
                                return undefined;
                            }) 
                        }

                        //Cerrando las demas pestanhas abiertas
                        //await closedOtherTabs(browser);
                        if(!url_movies_ya_cargadas.movies[index].link_iframe_video){
                            try {
                                await page.goto(server + item.link, { waitUntil: 'load', timeout: 5000 });
                            } catch (error) {
                                //Continuar de igual manera
                            }

                            await page.waitForSelector('li[role=presentation]')
                            
                            let data = await page.evaluate(() => {
                                let items = undefined;
                                let link_iframe = undefined;
                                let server_video = undefined;
                                let img = document.querySelector('#cover').getAttribute('src');
                                let title = document.querySelector('.pelicula-info .info-content > h1').innerText;
                                let published = document.querySelectorAll('.pelicula-info .info-content .info-half')[0].querySelectorAll('span')[1].innerText;
                                let anho = '<b>Año:</b> ' + published;
                                let duracion = '<b>Duración:</b> ' + document.querySelectorAll('.pelicula-info .info-content .info-half')[1].querySelectorAll('span')[1].innerText;
                                let sinopsis = document.querySelector('.pelicula-info .info-content .sinopsis').innerText;
                                let genero = '<b>Genero:</b> ';
                                let genero_labels = '';
                                let idioma = '<b>Idioma:</b> ';
                                items = document.querySelectorAll('.pelicula-info .info-content .content-type-a > a');
                                items.forEach(item => {
                                    genero += item.innerText
                                    genero_labels += item.innerText
                                });

                                items = document.querySelectorAll('li[role=presentation]');

                                items.forEach(item => {
                                    let server_video = item.querySelector('.title').innerText;
                                    let link_iframe_item = item.getAttribute('data-video');
                                    let audio = '';

                                    if (server_video.toUpperCase() === 'FEMBED') {
                                        if (item.parentNode.classList.contains('Subtitulado')) {
                                            audio = " Subtitulado";
                                        } else if (item.parentNode.classList.contains('Castellano')) {
                                            audio = " Español";
                                        } else if (item.parentNode.classList.contains('Castellano')) {
                                            audio = " Latino";
                                        }

                                        if(link_iframe == undefined || 
                                            ( 
                                                link_iframe != undefined && 
                                                (audio == " Español" || audio ==" Latino")
                                            )){
                                            idioma = audio;
                                            server_video = server_video;
                                            link_iframe = link_iframe_item;
                                        }
                                    }
                                });
                                return {
                                    img,
                                    title,
                                    anho,
                                    published,
                                    duracion,
                                    idioma,
                                    genero,
                                    genero_labels,
                                    sinopsis,
                                    link_iframe,
                                    server_video
                                }
                                                        
                            });

                            url_movies_ya_cargadas.movies[index].img = data.img,
                            url_movies_ya_cargadas.movies[index].title = data.title,
                            url_movies_ya_cargadas.movies[index].anho = data.anho,
                            url_movies_ya_cargadas.movies[index].published = data.published,
                            url_movies_ya_cargadas.movies[index].duracion = data.duracion,
                            url_movies_ya_cargadas.movies[index].idioma = data.idioma,
                            url_movies_ya_cargadas.movies[index].genero = data.genero,
                            url_movies_ya_cargadas.movies[index].genero_labels = data.genero_labels,
                            url_movies_ya_cargadas.movies[index].sinopsis = data.sinopsis,
                            url_movies_ya_cargadas.movies[index].link_iframe_video = data.link_iframe,
                            url_movies_ya_cargadas.movies[index].server_video = data.server_video 
                        }
                        
                        //if(!url_movies_ya_cargadas.movies[index].link_video){
                            //console.log("### Obteniendo LinkVideo desde la pagina")
                            try {
                                //await page.goto(urls.movie_link_iframe, { timeout: 3000 });
                                await page.goto(url_movies_ya_cargadas.movies[index].link_iframe_video, { waitUntil: 'load', timeout: 3000 });
                            } catch (error) {
                                //continuar de igual forma
                            }
                            try {
                                await page.waitForSelector('svg',{timeout:5000});
                                //await page.waitForTimeout(5000);
                                url_movies_ya_cargadas.movies[index].link_video = await page.evaluate(() => {
                                    return clientSide.pl.sources[0].file;
                                })
                            } catch (error) {
                                console.log('###### Error '+error)
                                //continuar de igual forma                            
                            }   /*                     
                            try {
                                await page.waitForSelector('svg',{timeout:5000});
                                await page.click('svg');
                                await page.waitForTimeout(200);
                                await page.waitForSelector('svg',{timeout:5000});
                                await page.click('svg');
                            } catch (error) {
                                //continuar                        
                            }
                            try {
                                await page.waitForSelector('.jwplayer', { timeout: 2000 });
                                let url_redirect = await page.evaluate(() => {
                                    let id_jwplqyer = document.querySelector('.jwplayer').getAttribute('id');
                                    return jwplayer(id_jwplqyer).getConfig().sources[0].file;
                                })
                                
                                url_movies_ya_cargadas.movies[index].link_video = await fetch(url_redirect)
                                    .then((data) => { return data.url })
                                    .catch((err) => console.log(err))
                            } catch (error) {
                                //continuar
                            }
                            */
                            //console.log(link_video);
                        //}else{
                           // console.log("### Obteniendo LinkVideo desde el JSON")
                        //}

                        
                        if (url_movies_ya_cargadas.movies[index].link_video){
                            let noscript = '<noscript>-BOLD-Año: -ENDBOLD-'+url_movies_ya_cargadas.movies[index].published+'-BR--BOLD-Genero: -ENDBOLD-'+url_movies_ya_cargadas.movies[index].genero_labels+';'+url_movies_ya_cargadas.movies[index].img+';</noscript>'
                            /*
                            urls.movie_title_header = urls.movie_title.toUpperCase();
                            urls.movie_link_veronline = url_acortado_antes_VerOnline + "&titlemovie="+urls.movie_title_header+"&urlmovie=" + link_video+url_acortado_despues;
                            urls.movie_link_descargar = url_acortado_antes_Descarga + "&titlemovie="+urls.movie_title_header+"&urlmovie=" + link_video+url_acortado_despues;

                            // ********************* Acortador ADFLY ************************
                            urls.shorted_link_veronline = urls.movie_link_veronline;//await getLinkShorted(urls.movie_link_veronline);
                            urls.shorted_link_descargar = urls.movie_link_descargar;//await getLinkShorted(urls.movie_link_descargar);
                            */
                            url_movies_ya_cargadas.movies[index].title_header = url_movies_ya_cargadas.movies[index].title.toUpperCase();
                            url_movies_ya_cargadas.movies[index].link_veronline = url_acortado_antes_VerOnline + "&titlemovie="+url_movies_ya_cargadas.movies[index].title_header+"&urlmovie=" + url_movies_ya_cargadas.movies[index].link_video+url_acortado_despues;
                            url_movies_ya_cargadas.movies[index].link_descargar = url_acortado_antes_Descarga + "&titlemovie="+url_movies_ya_cargadas.movies[index].title_header+"&urlmovie=" + url_movies_ya_cargadas.movies[index].link_video+url_acortado_despues;

                            // ********************* Acortador ADFLY ************************
                            url_movies_ya_cargadas.movies[index].shorted_link_veronline = url_movies_ya_cargadas.movies[index].link_veronline;//await getLinkShorted(urls.movie_link_veronline);
                            url_movies_ya_cargadas.movies[index].shorted_link_descargar = url_movies_ya_cargadas.movies[index].link_descargar;//await getLinkShorted(urls.movie_link_descargar);
                            let body_post = {
                                title: url_movies_ya_cargadas.movies[index].title,
                                cuerpo: noscript + scripts_adfly + `<div class="separator" style="clear: both; text-align: center;"><div class="separator" style="clear: both; text-align: center;"><img border="0" data-original-height="278" data-original-width="185" height="200" src="${url_movies_ya_cargadas.movies[index].img}" title="${url_movies_ya_cargadas.movies[index].title}" width="200" /></div><div class="separator" style="clear: both; text-align: center;"><br /></div></div><p></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: center;"><b><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">${url_movies_ya_cargadas.movies[index].title_header}</span></b></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><br /></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${url_movies_ya_cargadas.movies[index].genero}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${url_movies_ya_cargadas.movies[index].anho}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${url_movies_ya_cargadas.movies[index].duracion}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${url_movies_ya_cargadas.movies[index].idioma}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><b><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">Sinopsis:&nbsp;</span></b><span face="&quot;Arial&quot;,sans-serif" style="mso-bidi-font-size: 10.0pt;">${url_movies_ya_cargadas.movies[index].sinopsis}</span><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;</o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><b><span style="background: white; color: red; font-family: &quot;Cambria Math&quot;,serif; mso-bidi-font-family: &quot;Cambria Math&quot;;">⇩</span></b><b><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">&nbsp;AQUÍ TE DEJAMOS LA PELÍCULA PARA QUE LO DISFRUTES&nbsp;</span></b><b><span style="background: white; color: red; font-family: &quot;Cambria Math&quot;,serif; mso-bidi-font-family: &quot;Cambria Math&quot;;">⇩</span></b><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;</o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;<a id="linkveronline" href="${url_movies_ya_cargadas.movies[index].shorted_link_veronline}" style="font-size: 13.5pt; margin-left: 1em; margin-right: 1em; text-align: center;"><img border="0" data-original-height="84" data-original-width="282" src="${image_button_veronline}" /></a></o:p></span><a id="linkdescargar" href="${url_movies_ya_cargadas.movies[index].shorted_link_descargar}" style="font-size: 13.5pt; margin-left: 1em; margin-right: 1em; text-align: center;"><img border="0" data-original-height="84" data-original-width="282" src="${image_button_descargar}" /></a></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;</o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><b><span face="&quot;Arial&quot;,sans-serif" style="color: #333333;">PD:</span></b><span face="&quot;Arial&quot;,sans-serif" style="color: #333333;">&nbsp;Estoy compartiéndote estas geniales películas, totalmente GRATIS. Solo te saldrán algunos anuncios en tu pantalla al presionar en Ver Online o Descargar, solo da click en los captcha y cierra cualquier pantalla que se abra, gracias por entender y disfruta de la película.</span><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="border: 1pt none windowtext; color: #333333; mso-border-alt: none windowtext 0cm; padding: 0cm;">Muchas gracias por visitar nuestra web, esperamos volverte a ver pronto.</span><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><br /><p></p>`
                            }; 

                            //Si es vacio el video que actualice 
                            
                            let new_entrada_blogger = {
                                "kind": "blogger#post",                            
                                "blog": {
                                    "id": blogID
                                },
                                "labels": [
                                    url_movies_ya_cargadas.movies[index].genero_labels
                                ],
                                "published": url_movies_ya_cargadas.movies[index].published+"-01-01T04:00:00-07:00",
                                "updated": url_movies_ya_cargadas.movies[index].published+"-01-01T04:00:10-07:00",
                                "title": body_post.title ,
                                "content": body_post.cuerpo
                            }
                            let post = undefined;
                            
                            if(post_exist){                            
                                //actualizar
                                post = await fetch(urlApiBlogger+'/'+post_exist.id+accessKey+accessToken, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(new_entrada_blogger)
                                })
                                .then(res => res.json())
                                .then(json => {
                                    if(json.id){
                                        console.log('Post Actualizado '+body_post.title);  
                                        url_movies_ya_cargadas.movies[index].bloggerID = json.id;
                                        url_movies_ya_cargadas.movies[index].bloggerURL = json.url;
                                        url_movies_ya_cargadas.movies[index].estado = 'success';
                                       
                                    }
                                    return json;
                                })                        
                                .catch((err) => {
                                    console.log(err); 
                                    return undefined;
                                })
                            }else{        
                                //crear
                                post = await fetch(urlApiBlogger+accessKey+accessToken, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(new_entrada_blogger)
                                })
                                .then(res => res.json())
                                .then(json => {
                                   // console.log(json);
                                    if(json.id){
                                        console.log('Post Creado '+body_post.title);
                                        url_movies_ya_cargadas.movies[index].bloggerID = json.id;
                                        url_movies_ya_cargadas.movies[index].bloggerURL = json.url;
                                        url_movies_ya_cargadas.movies[index].estado = 'success';
                                        
                                    }
                                    return json;
                                })                        
                                .catch((err) => {
                                    console.log(err); 
                                    return undefined;
                                })
                            }
                            
                            if(!post){                           
                                console.log('## Post Cancelado! Message: '+post.error.message);
                                url_movies_ya_cargadas.movies[index].estado = 'error';
                            }
                            
                        }else{
                            /*
                            if(post_exist){ 
                                //Si existe eliminar el post
                                await fetch(urlApiBlogger+'/'+post_exist.id+accessKey+accessToken, {
                                    method: 'DELETE'
                                })
                                .then(res => res.json())
                                .then(json => {
                                    if(json.id)console.log('Post Eliminado '+url_movies_ya_cargadas.movies[index].title);                                                                        
                                    return json;
                                })                        
                                .catch((err) => {
                                    console.log(err); 
                                    return undefined;
                                })
                            }
                            */
                            console.log("No se encontro link del video "+server+item.link);
                            url_movies_ya_cargadas.movies[index].estado = 'error';
                        }
                    } catch (error) {
                        console.log("Error en la pagina de " + server + item.link);
                        console.log(error);
                        url_movies_ya_cargadas.movies[index].estado = 'error';
                        /*
                        if(post_exist){ 
                            //Si existe eliminar el post
                            await fetch(urlApiBlogger+'/'+post_exist.id+accessKey+accessToken, {
                                method: 'DELETE'
                            })
                            .then(res => res.json())
                            .then(json => {
                                if(json.id)console.log('Post Eliminado '+url_movies_ya_cargadas.movies[index].title);                                                                        
                                return json;
                            })                        
                            .catch((err) => {
                                console.log(err); 
                                return undefined;
                            })
                        }
                        */
                    }

                    //Guarda en el Archivo JSON
                    await setMoviesCargadasJSON(tag,url_movies_ya_cargadas);
                }
            }
            
            browser.close();
            return resolve("########## Finalizo la Carga ("+tag+") ###########");
        } catch (e) {
            return reject(e);
        }
    })
}
function getLinkShorted(url_movie) {
    return new Promise(resolve => {
        adfly.short(url_movie, function (url) {
            //console.log("ADFLY shortedLink " + url);
            resolve(url);
        });
    })
}

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
function setMoviesCargadasJSON(path, datajson) {
    return new Promise(resolve => {
        //si existe elimina
        if (fs.existsSync(path)) fs.unlinkSync(path);

        //Crea de nuevo
        let data = JSON.stringify(datajson, null, 2);
        fs.writeFile('./pelisplus.so/'+path+'.json', data, (err) => {
            if (err){consooe.log(err)};
            resolve(JSON.parse(data));
        });
    })
}

function closedOtherTabs(browser){
    return new Promise(resolve => {
        let pages = browser.pages();
        for (let index = 2; index < pages.length; index++) {
                pages[index].close();                            
        }
        resolve(true);
    })
}

run().then(console.log).catch(console.error);