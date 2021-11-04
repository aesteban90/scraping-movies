const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const {GOOGLE_API_KEY, GOOGLE_ACCESS_TOKEN} = process.env;
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            //const browser = await puppeteer.launch({headless:false});
            //const page = await browser.newPage();
            const blogID = '1960239950165354362';
            const url = `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts?key=${GOOGLE_API_KEY}&access_token=${GOOGLE_ACCESS_TOKEN}`;
            let new_entrada_blogger = {
                "kind": "blogger#post",
                "blog": {
                  "id": blogID
                },
                "labels": [
                    "Documentales"
                ],
                "title": "A new post 3",
                "content": "With <b>exciting</b> content..."
              }
            let data = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(new_entrada_blogger)
            }).then((res) => res.json())
            .then((data) => console.log(data))
            .catch((err) => console.log(err))

            return resolve(data)
        } catch (e) {
            return reject(e);
        }
    })
}

run().then(console.log).catch(console.error);