import cors from 'cors';
import express from 'express';
import RSSParser from 'rss-parser';

const feedUrl = [
  'https://www.alertatolima.com/rss.xml',
  'https://www.elnuevodia.com/arc/outboundfeeds/rss/category/noticias/locales/?outputType=xml',
  'https://www.elolfato.com/feed',
  'https://www.ecosdelcombeima.com/rss.xml',
  'https://vozdelpueblo920am.com/index.php/feed/',
  'https://www.tolimastereo.com/blog-feed.xml'
];
const parser = new RSSParser();
let articles = [];

const parse = async urls => {
  try {
    for (let url of urls) {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        articles.push({ title: feed.title, item });
      });
    };
  } catch (error) {
    console.error(`Hubo un error al procesar las URLs: ${error.code}`);
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