import Express from 'express';
import exphbs from 'express-handlebars';
import renderReact from '../middlewares/renderReact';
import path from 'path';

// Init
const app = new Express();
const PORT = process.env.PORT || 3000;

// Templates
app.engine('hbs', exphbs());
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, '..', '..', 'templates'));
app.use(Express.static(path.resolve(__dirname, '..', '..', 'client')));

// Render react server side
app.get('*', renderReact());

// Start server
app.listen(PORT, () => {
  if (process.send) process.send('ready');
  console.log(`Server listening on ${PORT}`);
});
if (module.hot) module.hot.accept('../middlewares/renderReact.js');
