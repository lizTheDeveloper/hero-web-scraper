const fs = require('fs');
const Hero = require('@ulixee/hero');
const websites = ['https://whitehouse.gov', 'https://ai.gov'];

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
        await hero.close();
    }
}
takeScreenshots().catch(error => console.error('Error in scraping:', error));
