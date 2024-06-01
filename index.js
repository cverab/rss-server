import cors from 'cors';
import express from 'express';
import RSSParser from 'rss-parser';
import feedUrl from './feeds.js';

const parser = new RSSParser();
let articlesCache = [];
let lastFetchTime = 0;
const cacheDuration = 10 * 60 * 1000;

const fetchFeeds = async () => {
  let newArticles = [];
  for (let url of feedUrl) {
    try {
      const feed = await Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Tiempo de espera excedido')), 5000)
        )
      ]);
      feed.items.forEach(item => {
        newArticles.push({ title: feed.title, item });
      });
    } catch (error) {
      console.error(`Hubo un error al procesar la URL ${url}: ${error.message}`);
    }
  }
  return newArticles;
};

const updateCache = async () => {
  try {
    articlesCache = await fetchFeeds();
    lastFetchTime = Date.now();
  } catch (error) {
    console.error(`Error al actualizar la caché: ${error.message}`);
  }
};

updateCache();
setInterval(updateCache, cacheDuration);

const app = express();
const port = process.env.PORT || 4000;
app.use(cors({ origin: "*", }));

app.get('/', (req, res) => {
  if (Date.now() - lastFetchTime > cacheDuration) {
    updateCache().then(() => {
      res.send(articlesCache);
    }).catch(error => {
      res.status(500).send({ error: 'Error updating caché', details: error.message });
    });
  } else {
    res.send(articlesCache);
  }
});

const server = app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
});

export default server;