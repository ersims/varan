import App from 'koa';
import serve from 'koa-static';
import views from 'koa-views';
import renderReact from '../middlewares/renderReact';
import path from 'path';
const app = new App();

// Init
const PORT = process.env.PORT || 3000;

// Templates
app.use(views(path.resolve(__dirname, '..', '..', 'templates'), { extension: 'hbs', map: { hbs: 'handlebars' } }));
app.use(serve(path.resolve(__dirname, '..', '..', 'client')));

// Render react server side
app.use(renderReact());

// Start server
app.listen(PORT, () => {
  if (process.send) process.send('ready');
  console.log(`Server listening on ${PORT}`);
});
if (module.hot) module.hot.accept('../middlewares/renderReact.js');
