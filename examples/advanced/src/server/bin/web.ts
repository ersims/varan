// Dependencies
import 'source-map-support/register';
import express from 'express';
import fs from 'fs';
import path from 'path';
import gzipStatic from 'connect-gzip-static';
import renderReact from '../middlewares/renderReact';

// Hot reloading
if (module.hot) module.hot.accept('../middlewares/renderReact', () => {});

// Enable preloading of files that is highly likely to be used e.g fonts (will map to the webpack hashed file name)
const PRELOAD_FILES = [
  'static/media/open-sans-v15-latin-ext_latin-600.woff2',
  'static/media/open-sans-v15-latin-ext_latin-700.woff2',
  'static/media/open-sans-v15-latin-ext_latin-regular.woff2',
];

// Init
const app = express();
app.set('env', process.env.NODE_ENV || 'production');
app.set('host', process.env.HOST);
app.set('port', (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000);
const CLIENT_FILES = path.resolve(__dirname, '../../client');
const CLIENT_FILES_CACHE_AGE = app.get('env') === 'production' ? 86400000 : undefined;
const stats =
  process.env.VARAN_STATS_MANIFEST &&
  JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.VARAN_STATS_MANIFEST)).toString());
const assets =
  process.env.VARAN_ASSETS_MANIFEST &&
  JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.VARAN_ASSETS_MANIFEST)).toString());

// Serve static files and attempt to serve .gz files if found
app.use((req, res, next) => {
  if (req.url === '/service-worker.js')
    res.setHeader('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate');
  return next();
});
app.use(gzipStatic(CLIENT_FILES, { maxAge: CLIENT_FILES_CACHE_AGE }));

// Render react server side
app.get('*', renderReact(stats, assets, PRELOAD_FILES));

// Export server
export default app.listen(app.get('port'), app.get('host'), () => {
  // if (process.send) process.send('ready'); // TODO: Re-enable https://github.com/facebook/jest/issues/5891
  /* tslint:disable-next-line no-console */
  console.log(`Server listening on ${app.get('port')} in ${app.get('env')} mode`);
});
