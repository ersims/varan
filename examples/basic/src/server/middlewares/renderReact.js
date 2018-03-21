// Dependencies
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../../client/components/App';

// Add hot reloading
if (module.hot) module.hot.accept('../../client/components/App');

// Exports
export default () => function renderReact(ctx) {
  const templateVars = {
    body: renderToStaticMarkup(<App />),
    append: '<p>Appended from server template</p>',
  };
  return ctx.render('index', templateVars);
};
