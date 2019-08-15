import React from 'react';
import renderer from 'react-test-renderer';
import Html from '../../../../src/server/components/Html';

// Tests
test('renders correctly', () => {
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
          {'window.asd = true;'}
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
