// Dependencies
import * as React from 'react';
import { RequestHandler } from 'express';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';
import App from '../../client/components/App';
import Html from '../../client/components/Html';

// Types
interface ApplicationStats {
  assetsByChunkName: {
    [bundle: string]: string | string[];
  };
}
interface ApplicationAssets {
  [file: string]: string;
}

// Add hot reloading
if (module.hot) module.hot.accept('../../client/components/App', () => {});

// Exports
export default (stats: ApplicationStats, assets: ApplicationAssets): RequestHandler => {
  // Load bundles list
  const { bundleJs, bundleCss } = Object.values(stats.assetsByChunkName).reduce(
    (acc, cur) => {
      (Array.isArray(cur) ? cur : [cur]).forEach(f => {
        if (f.endsWith('.js')) acc.bundleJs.push(f);
        else if (f.endsWith('.css')) acc.bundleCss.push(f);
      });
      return acc;
    },
    { bundleJs: [], bundleCss: [] } as { bundleJs: string[]; bundleCss: string[] },
  );

  // Find manifest
  const manifest = Object.keys(assets).find(asset => /^manifest\.[a-f0-9]+\.json/.test(asset));

  // Return react rendering middleware
  return function renderReact(req, res) {
    const body = renderToString(<App />);
    const helmet = Helmet.renderStatic();
    const html = renderToStaticMarkup(
      <Html
        htmlAttributes={helmet.htmlAttributes.toComponent()}
        bodyAttributes={helmet.bodyAttributes.toComponent()}
        title={helmet.title.toComponent()}
        meta={helmet.meta.toComponent()}
        link={helmet.link.toComponent()}
        style={helmet.style.toComponent()}
        script={helmet.script.toComponent()}
        noscript={helmet.noscript.toComponent()}
        base={helmet.base.toComponent()}
        body={body}
        bundleJs={bundleJs}
        bundleCss={bundleCss}
        manifest={manifest}
      />,
    );

    return res.send(html);
  };
};
