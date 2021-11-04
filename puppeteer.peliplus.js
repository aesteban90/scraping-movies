const puppeteer = require('puppeteer');
var adfly = require("adf.ly")("17814843","12bb3933132c8a52f6f99cb8ec081619");
const fetch = require('node-fetch');
const { GOOGLE_API_KEY, GOOGLE_ACCESS_TOKEN, MITLY_API_TOKEN } = process.env;

const blogID = '1960239950165354362';
const urlApiBlogger = `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts?key=${GOOGLE_API_KEY}&access_token=${GOOGLE_ACCESS_TOKEN}`;

const image_button_descargar = 'https://1.bp.blogspot.com/-msTvOREDmWo/YIK3EO5OjuI/AAAAAAAACnc/OpBzMqNwvzU5ICAdTPcPNrtgl62bXOJ4ACLcBGAsYHQ/s0/Button-Descargar.png'
const image_button_veronline = 'https://1.bp.blogspot.com/-1ebAbdCyuNQ/YIK3EMcEA4I/AAAAAAAACng/_KIV7l8oZGYmzJvhGLOgUQuWfRfuVg7OACLcBGAsYHQ/s0/Button-VerOnline.png';
const mitly_url = `https://mitly.us/api?api=${MITLY_API_TOKEN}&url=`;
const url_acortado_antes_VerOnline = 'https://peliculas-onilne-descargas.blogspot.com/p/blog-page.html?idapi=f8f70ebf-9844-485d-ace0-c06e5ba548b4&plr=00a8dba0-a0d4-470c-98b3-8d09b1fcdf4d&knim=78dbede9-2458-49e1-8832-bd8f2a332bd2&jwaton=aa701820-2a7d-4714-8b3b-f91f682ad188';
const url_acortado_antes_Descarga = 'https://peliculas-onilne-descargas.blogspot.com/p/descarga.html?idapi=f8f70ebf-9844-485d-ace0-c06e5ba548b4&plr=00a8dba0-a0d4-470c-98b3-8d09b1fcdf4d&knim=78dbede9-2458-49e1-8832-bd8f2a332bd2&jwaton=aa701820-2a7d-4714-8b3b-f91f682ad188';
const url_acortado_despues = '&cunt=bbbffb5d-2985-48d6-905a-2d34e0499467&respl=ce222f33-378b-43bc-9365-e9cbe555d108&wamp=ecb264e2-b775-4502-ad12-668c4f3df8f2&support=257b0eef-f01c-4ae8-9741-e1100527f9b1&referente=53631477-dd4e-4f45-a9b0-5ce30df980d7'
const url = 'https://pelisplus.so/pelicula/secretariat';
//const url = 'https://pelisplus.so/pelicula/encuentro-explosivo';
//const url = 'https://pelisplus.so/pelicula/raya-and-the-last-dragon';
//const url = 'https://pelisplus.so/pelicula/chadwick-boseman-portrait-of-an-artist';
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless:false});
            const page = await browser.newPage();
            page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0")
            
            try {
                await page.goto(url,{timeout:10000});
            } catch (error) {
                //console.log('Cancela la operacion por timesout mas de 30sec')
                //browser.close();
                //return reject(error);
            }
            
            await page.waitForSelector('li[role=presentation]')               
            console.log('Procede a obtener la informacion')
            let urls = await page.evaluate(() => {
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
                let lista_videos = [];
                items = document.querySelectorAll('.pelicula-info .info-content .content-type-a > a');
                items.forEach(item => {
                    genero += item.innerText
                    genero_labels += item.innerText
                });

                items = document.querySelectorAll('li[role=presentation]');
                items.forEach(item => {
                    let audio = '';                   
                    let server_video = item.querySelector('.title').innerText;
                    let link_iframe_item = item.getAttribute('data-video');
                    
                    //if(server_video.toUpperCase() === 'FEMBED'){
                    //if (server_video.toUpperCase() === 'HD') {
                    if (
                        server_video.toUpperCase() === 'FEMBED' || 
                        server_video.toUpperCase() === 'STREAMTAPE'
                    ) {
                        
                        if (item.parentNode.classList.contains('Subtitulado')) {
                            audio = " Subtitulado";
                        } else if (item.parentNode.classList.contains('Castellano')) {
                            audio = " Español";
                        } else if (item.parentNode.classList.contains('Castellano')) {
                            audio = " Latino";
                        }

                        idioma = audio;
                        //server_video = server_video;
                        //link_iframe = link_iframe_item;

                        lista_videos.push({'server':server_video, 'link_iframe':link_iframe_item, audio})
                        
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
                    lista_videos
                }
            });

            for (let index = 0; index < urls.lista_videos.length; index++) {
                const element = urls.lista_videos[index];
                console.log('#####')
                console.log('Server: '+element.server)
                console.log('Audio: '+element.audio)
                console.log('Link Iframe: '+element.link_iframe)
            }
            /*
            try {
                console.log("## Abre el Iframe ")
                console.log("## Iframe: "+urls.link_iframe)
                await page.goto(urls.link_iframe,{timeout:5000});    
            } catch (error) {
                //Continuar
            }
            try {
                //await page.setRequestInterception(false);
                //await page.goto('https://fcdn.stream/v/py4ldsmy0wd01xw',{timeout:5000});    
                //console.log("## Esperando al svg")
                //await page.waitForSelector('svg',{timeout:5000});
                //let data = await page.evaluate(() => {
                //    return clientSide.pl.sources[0].file;
                //})
                
                await page.waitForSelector('#videolink',{timeout:5000});
                let data = await page.evaluate(() => {
                    return document.querySelector('#videolink').innerText;
                })
                return resolve(data);
            } catch (error) {
                console.log("##### Error "+error)
            }
            */
            /*
            await page.waitForTimeout(1000);            
            let page_data = await page.evaluate(()=>{
                return {
                    link_video: playerInstance.getPlaylist()[0].file
                };
            });
            urls.movie_title_header = urls.movie_title.toUpperCase();
            urls.movie_link_veronline = url_acortado_antes_VerOnline + "&titlemovie="+urls.movie_title_header+"&urlmovie=" + page_data.link_video+url_acortado_despues;
            urls.movie_link_descargar = url_acortado_antes_Descarga + "&titlemovie="+urls.movie_title_header+"&urlmovie=" + page_data.link_video+url_acortado_despues;
            
            
            // ********************* Acortador Mitly ************************
            const mitly_VerOnline = await fetch(mitly_url+encodeURIComponent(urls.movie_link_veronline))
            .then(res => res.json())
            .then(json => {return json}); 

            const mitly_Descargar = await fetch(mitly_url+encodeURIComponent(urls.movie_link_descargar))
            .then(res => res.json())
            .then(json => {return json});      
            */

            // ********************* Acortador ADFLY ************************
            //urls.shorted_link_veronline = await getLinkShorted(urls.movie_link_veronline);
            //urls.shorted_link_descargar = await getLinkShorted(urls.movie_link_descargar);
            /*
            let body_post = {
                title: urls.movie_title,                
                cuerpo: `<div class="separator" style="clear: both; text-align: center;"><div class="separator" style="clear: both; text-align: center;"><img border="0" data-original-height="278" data-original-width="185" height="200" src="${urls.movie_img}" title="${urls.movie_title}" width="200" /></div><div class="separator" style="clear: both; text-align: center;"><br /></div></div><p></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: center;"><b><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">${urls.movie_title_header}</span></b></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><br /></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${urls.movie_genero}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">${urls.movie_anho}&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;${urls.movie_duracion}</span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${urls.movie_idioma}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;">${urls.movie_calidad}</p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><b><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">Sinopsis:&nbsp;</span></b><span face="&quot;Arial&quot;,sans-serif" style="mso-bidi-font-size: 10.0pt;">${urls.movie_sinopsis}</span><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;</o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><b><span style="background: white; color: red; font-family: &quot;Cambria Math&quot;,serif; mso-bidi-font-family: &quot;Cambria Math&quot;;">⇩</span></b><b><span face="&quot;Arial&quot;,sans-serif" style="background: white; color: #333333;">&nbsp;AQUÍ TE DEJAMOS LA PELÍCULA PARA QUE LO DISFRUTES&nbsp;</span></b><b><span style="background: white; color: red; font-family: &quot;Cambria Math&quot;,serif; mso-bidi-font-family: &quot;Cambria Math&quot;;">⇩</span></b><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;</o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;<a href="${urls.shorted_link_veronline}" style="font-size: 13.5pt; margin-left: 1em; margin-right: 1em; text-align: center;"><img border="0" data-original-height="84" data-original-width="282" src="${image_button_veronline}" /></a></o:p></span><a href="${urls.shorted_link_descargar}" style="font-size: 13.5pt; margin-left: 1em; margin-right: 1em; text-align: center;"><img border="0" data-original-height="84" data-original-width="282" src="${image_button_descargar}" /></a></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p>&nbsp;</o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><b><span face="&quot;Arial&quot;,sans-serif" style="color: #333333;">PD:</span></b><span face="&quot;Arial&quot;,sans-serif" style="color: #333333;">&nbsp;Estoy compartiéndote estas geniales películas, totalmente GRATIS. Solo te saldrán algunos anuncios en tu pantalla al presionar en Ver Online o Descargar, solo da click en los captcha y cierra cualquier pantalla que se abra, gracias por entender y disfruta de la película.</span><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><p style="margin-bottom: .0001pt; margin: 0cm; text-align: justify;"><span face="&quot;Arial&quot;,sans-serif" style="border: 1pt none windowtext; color: #333333; mso-border-alt: none windowtext 0cm; padding: 0cm;">Muchas gracias por visitar nuestra web, esperamos volverte a ver pronto.</span><span face="&quot;Arial&quot;,sans-serif" style="color: black; font-size: 13.5pt;"><o:p></o:p></span></p><br /><p></p>`
            }

            let new_entrada_blogger = {
                "kind": "blogger#post",
                "blog": {
                  "id": blogID
                },
                "labels": [
                    urls.movie_generos_list
                ],
                "title": body_post.title,
                "content": body_post.cuerpo
              }

            let data = await fetch(urlApiBlogger, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(new_entrada_blogger)
            }).then((res) => res.json())
            .then((data) => console.log(data))
            .catch((err) => console.log(err))
            */
           // browser.close(); 
            
           
            //return resolve(urls);
            
        } catch (e) {
            return reject(e);
        }
    })
}

function getLinkShorted(url_movie){
    return new Promise(resolve => {
        adfly.short(url_movie, function(url){
            console.log("ADFLY shortedLink " + url);
            resolve(url);                    
        });
    })
}

run().then(console.log).catch(console.error);