import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';

class Html extends PureComponent {
  static propTypes = {
    title: PropTypes.node,
    meta: PropTypes.node,
    link: PropTypes.node,
    style: PropTypes.node,
    script: PropTypes.node,
    noscript: PropTypes.node,
    base: PropTypes.node,
    htmlAttributes: PropTypes.object,
    bodyAttributes: PropTypes.object,
    bundleJs: PropTypes.arrayOf(PropTypes.string.isRequired),
    bundleCss: PropTypes.arrayOf(PropTypes.string.isRequired),
    manifest: PropTypes.string,
    body: PropTypes.string,
    initialState: PropTypes.object,
    preload: PropTypes.arrayOf(PropTypes.string.isRequired),
  };
  static defaultProps = {
    htmlAttributes: {},
    bodyAttributes: {},
    body: '',
    preload: [],
  };
  render() {
    const {
      htmlAttributes,
      bodyAttributes,
      title,
      meta,
      link,
      style,
      script,
      noscript,
      base,
      body,
      bundleJs,
      bundleCss,
      initialState,
      manifest,
      preload,
    } = this.props;
    return (
      <html {...htmlAttributes}>
        <head>
          {title}
          {meta}
          {noscript}
          {base}
          {manifest && <link rel="manifest" href={manifest} />}
          {link}
          {preload.map((file, i) => {
            if (/\.js$/.test(file)) return <link key={i} href={file} rel="preload" as="script" />;
            if (/\.css$/.test(file)) return <link key={i} href={file} rel="preload" as="style" />;
            if (/(\.woff|\.woff2|\.eot|\.ttf)$/.test(file))
              return <link key={i} href={file} rel="preload" as="font" crossOrigin="anonymous" />;
            if (/(\.png|\.jpe?g|\.gif)$/.test(file))
              return <link key={i} href={file} rel="preload" as="image" crossOrigin="anonymous" />;
            return null;
          })}
          {bundleCss.map((css, i) => (
            <link key={i} href={css} rel="stylesheet" />
          ))}
          {style}
          {script}
        </head>
        <body {...bodyAttributes}>
          <div id="root" dangerouslySetInnerHTML={{ __html: body }} />
          {initialState && (
            <script
              id="initial-state"
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `window.__INITIAL_REDUX_STATE__ = ${serialize(initialState, { isJSON: true })}`,
              }}
            />
          )}
          {bundleJs.map((js, i) => (
            <script key={i} type="text/javascript" src={js} defer />
          ))}
        </body>
      </html>
    );
  }
}

export default Html;
