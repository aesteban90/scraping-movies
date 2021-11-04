const fs = require('fs');
const tag = 'peliculas-2011';

(async () => {
    let url_movies_ya_cargadas = await getMoviesCargadasJSON(tag);  
    console.log("Encontro "+url_movies_ya_cargadas.movies.length+" peliculas")
    let setear = false;
    for (let index = url_movies_ya_cargadas.movies.length - 1; index >= 0; index--) {
        const item = url_movies_ya_cargadas.movies[index];

        if(item.title === "Schutzengel"){
            setear = true;            
        }
        
        //if(setear){
        if(item.bloggerID === "4115561667563627148"){

            item.estado = undefined;
            item.bloggerID = undefined;
            item.bloggerURL = undefined;
        }
    }
    await setMoviesCargadasJSON(tag, url_movies_ya_cargadas);
})();

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