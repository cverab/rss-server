import cors from 'cors';
import express from 'express';
import RSSParser from 'rss-parser';
import feedUrl from './feeds.js';

const parser = new RSSParser();
let articles = [];

const parse = async urls => {
  try {
    for (let url of urls) {
      try {
        const feed = await Promise.race([
          parser.parseURL(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tiempo de espera excedido')), 5000)
          )
        ]);
        feed.items.forEach(item => {
          articles.push({ title: feed.title, item });
        });
      } catch (error) {
        console.error(`Hubo un error al procesar la URL ${url}: ${error.message}`);
      }
    };
  } catch (error) {
    console.error(`Hubo un error general: ${error.message}`);
  }
};

parse(feedUrl);

let app = express();
app.use(cors());
app.get('/', async (req, res) => {
  articles = [];
  await parse(feedUrl);
  res.send(articles);
});
const server = app.listen('4000', () => {
  console.log('App is listening at port 4000');
});

export default server;