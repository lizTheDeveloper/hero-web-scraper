const fs = require('fs');
const Hero = require('@ulixee/hero');
const pg = require('pg');


//const websites = ['https://whitehouse.gov', 'https://ai.gov'];
const websites = ['https://en.wikipedia.org/wiki/British_logistics_in_the_Western_Allied_invasion_of_Germany', 'https://en.wikipedia.org/wiki/Complex_adaptive_system']


async function takeScreenshots(websites) {
    for (const site of websites) {
        console.log(`Taking screenshot of ${site}`)

        const hero = new Hero({ connectionToCore: 'ws://localhost:1818' });

        await hero.goto(site);

        //check the status code
        const statusCode = await hero.statusCode;
        if (statusCode == 429) {
            console.log('Error: 429 Too Many Requests');
            continue
        }

        await hero.waitForPaintingStable(); // waits for the page to load

        await hero.waitForMillis(5000); // waits 5 seconds

        // search for body text and get the innerText
        const titleContent = await hero.document.querySelector('.mw-body-header');
        const titleContentText = await titleContent.innerText;
        const bodyContent = await hero.document.querySelector('#bodyContent');
        const bodyContentText = await bodyContent.innerText;

        let imageBuffer = await hero.takeScreenshot({ format: `png` });
        // save the image to disk
        fs.writeFileSync(`./${titleContentText}.png`, imageBuffer);

        // write the body content to a .txt file
        fs.writeFileSync(`./${titleContentText}.txt`, bodyContentText);

        // insert into the database
        const insertQuery = `INSERT INTO wikipedia (title, body, screenshoturl) VALUES ($1, $2, $3);`;
        const values = [titleContentText, bodyContentText, `./${titleContentText}.png`];
        console.log(insertQuery)
        const { rows } = await query(insertQuery,values);
        console.log(JSON.stringify(rows))
        await hero.close();
    }
}

takeScreenshots(websites).catch(error => console.error('Error in scraping:', error));




// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: '', // env var: PGUSER
  database: 'wikipedia', // env var: PGDATABASE
  password: '', // env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, // env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
}

const pool = new pg.Pool(config)

async function query (q,values=[]) {
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q,values)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res
}


// create table statement for wikipedia
// CREATE TABLE wikipedia (id SERIAL PRIMARY KEY,title VARCHAR(255),body TEXT,screenshoturl VARCHAR(255));