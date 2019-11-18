import React from 'react';
import renderer from 'react-test-renderer';
import { Html } from '../../../../src/server/components/Html';

// Tests
test('should render correctly', () => {
  const component = renderer.create(
    <Html
      htmlAttributes={{ id: 'html-id' }}
      bodyAttributes={{ id: 'body-id' }}
      title={<title>title</title>}
      meta={[<meta charSet="utf-8" />, <meta name="description" content="A varan react starter app" />]}
      link={[
        <link href="style.css" rel="stylesheet" />,
        <link rel="icon" href="favicon.ico" data-react-helmet="true" />,
      ]}
      style={<style>{'html { background-color: red; }'}</style>}
      script={[
        <script id="somescript" type="text/javascript">
          window.asd = true;
        </script>,
      ]}
      noscript={<noscript>javascript is required</noscript>}
      base={<base target="_blank" href="http://example.com/" />}
      body={<p>the html body</p>}
      bundleJs={['main.js', 'extra.js']}
      bundleCss={['main.css', 'extra.css']}
      manifest="manifest.json"
      preload={['jsfile.js', 'cssfile.css', 'fontfile.wolff2', 'imgfile.png']}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('should support integrity properties', () => {
  const component = renderer.create(
    <Html
      htmlAttributes={{ id: 'html-id' }}
      bodyAttributes={{ id: 'body-id' }}
      title={<title>title</title>}
      meta={[<meta charSet="utf-8" />, <meta name="description" content="A varan react starter app" />]}
      link={[
        <link href="style.css" rel="stylesheet" />,
        <link rel="icon" href="favicon.ico" data-react-helmet="true" />,
      ]}
      style={<style>{'html { background-color: red; }'}</style>}
      script={[
        <script id="somescript" type="text/javascript">
          window.asd = true;
        </script>,
      ]}
      noscript={<noscript>javascript is required</noscript>}
      base={<base target="_blank" href="http://example.com/" />}
      body={<p>the html body</p>}
      bundleJs={[
        { src: 'main.js', integrity: 'my-integrity' },
        { src: 'extra.js', integrity: 'my-integrity' },
      ]}
      bundleCss={[
        { src: 'main.css', integrity: 'my-integrity' },
        { src: 'extra.css', integrity: 'my-integrity' },
      ]}
      manifest={{ src: 'manifest.json', integrity: 'my-integrity' }}
      preload={[
        { src: 'jsfile.js', integrity: 'my-integrity1' },
        { src: 'cssfile.css', integrity: 'my-integrity2' },
        { src: 'fontfile.wolff2', integrity: 'my-integrity3' },
        { src: 'imgfile.png', integrity: 'my-integrity4' },
      ]}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
