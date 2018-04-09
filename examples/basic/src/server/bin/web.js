// Dependencies
import 'source-map-support/register';
import Express from 'express';
import fs from 'fs';
import path from 'path';
import renderReact from '../middlewares/renderReact';

// Hot reloading
if (module.hot) module.hot.accept('../middlewares/renderReact.js');

// Init
const app = new Express();
const ENV = process.env.NODE_ENV || 'production';
const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT, 10) || 3000;
const assets = JSON.parse(fs.readFileSync(path.resolve(process.env.VARAN_CLIENT_ROOT, process.env.VARAN_STATS_MANIFEST)));

// Templates
app.set('env', ENV);
app.set('host', HOST);
app.set('port', PORT);
app.use(Express.static(path.resolve(__dirname, '../../client')));

// Render react server side
app.get('*', renderReact(assets));

// Export app
export default app.listen(app.get('port'), app.get('host'), () => {
  // if (process.send) process.send('ready'); // TODO: Re-enable https://github.com/facebook/jest/issues/5891
  console.log(`Server listening on ${app.get('port')} in ${app.get('env')} mode`);
});
