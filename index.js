const fs = require('fs');
const Hero = require('@ulixee/hero');


const websites = ['https://whitehouse.gov', 'https://ai.gov'];
// const websites = ['https://en.wikipedia.org/wiki/British_logistics_in_the_Western_Allied_invasion_of_Germany']


async function takeScreenshots() {
    for (const site of websites) {
        console.log(`Taking screenshot of ${site}`)

        const hero = new Hero({ connectionToCore: 'ws://localhost:1818' });

        await hero.goto(site);

        await hero.waitForPaintingStable(); // waits for the page to load

        await hero.waitForMillis(5000); // waits 5 seconds

        let imageBuffer = await hero.takeScreenshot({ format: `png` });

        // save the image to disk
        let filename = site.split('//')[1].split('.')[0]
        fs.writeFileSync(`./${filename}.png`, imageBuffer);


        // search for .mw-body-content and get the innerText
        const bodyContent = await hero.document.querySelector('body');
        const bodyContentText = await bodyContent.textContent;
        // write the body content to a .txt file
        fs.writeFileSync(`./${filename}.txt`, bodyContentText);

        await hero.close();
    }
}

takeScreenshots().catch(error => console.error('Error in scraping:', error));
