// Dependencies
import 'source-map-support/register';
import express from 'express';
import fs from 'fs';
import path from 'path';
import renderReact from '../middlewares/renderReact';

// Hot reloading
if (module.hot) module.hot.accept('../middlewares/renderReact', () => {});

// Init
const app = express();
const ENV = process.env.NODE_ENV || 'production';
const HOST = process.env.HOST;
const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const stats =
  process.env.VARAN_STATS_MANIFEST &&
  JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.VARAN_STATS_MANIFEST)).toString());
const assets =
  process.env.VARAN_ASSETS_MANIFEST &&
  JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.VARAN_ASSETS_MANIFEST)).toString());

// Templates
app.set('env', ENV);
app.set('host', HOST);
app.set('port', PORT);
app.use(express.static(path.resolve(__dirname, '../../client')));

// Render react server side
app.get('*', renderReact(stats, assets));

// Export app
export default app.listen(app.get('port'), app.get('host'), () => {
  // if (process.send) process.send('ready'); // TODO: Re-enable https://github.com/facebook/jest/issues/5891
  /* tslint:disable-next-line no-console */
  console.log(`Server listening on ${app.get('port')} in ${app.get('env')} mode`);
});
