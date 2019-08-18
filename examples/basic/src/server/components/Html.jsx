import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';

class Html extends PureComponent {
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
      // eslint-disable-next-line react/jsx-props-no-spreading
      <html lang="en" {...htmlAttributes}>
        <head>
          {title}
          {meta}
          {noscript}
          {base}
          {manifest && <link rel="manifest" href={manifest} />}
          {link}
          {preload.map(file => {
            if (/\.js$/.test(file)) return <link key={file} href={file} rel="preload" as="script" />;
            if (/\.css$/.test(file)) return <link key={file} href={file} rel="preload" as="style" />;
            if (/(\.woff|\.woff2|\.eot|\.ttf)$/.test(file))
              return <link key={file} href={file} rel="preload" as="font" crossOrigin="anonymous" />;
            if (/(\.png|\.jpe?g|\.gif)$/.test(file))
              return <link key={file} href={file} rel="preload" as="image" crossOrigin="anonymous" />;
            return null;
          })}
          {bundleCss.map(css => (
            <link key={css} href={css} rel="stylesheet" />
          ))}
          {style}
          {script}
        </head>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <body {...bodyAttributes}>
          {/* eslint-disable-next-line react/no-danger */}
          <div id="root" dangerouslySetInnerHTML={{ __html: body }} />
          {initialState && (
            <script
              id="initial-state"
              type="text/javascript"
              /* eslint-disable-next-line react/no-danger */
              dangerouslySetInnerHTML={{
                __html: `window.__INITIAL_REDUX_STATE__ = ${serialize(initialState, { isJSON: true })}`,
              }}
            />
          )}
          {bundleJs.map(js => (
            <script key={js} type="text/javascript" src={js} defer />
          ))}
        </body>
      </html>
    );
  }
}
Html.propTypes = {
  title: PropTypes.node,
  meta: PropTypes.node,
  link: PropTypes.node,
  style: PropTypes.node,
  script: PropTypes.node,
  noscript: PropTypes.node,
  base: PropTypes.node,
  htmlAttributes: PropTypes.objectOf(PropTypes.shape({})),
  bodyAttributes: PropTypes.objectOf(PropTypes.shape({})),
  bundleJs: PropTypes.arrayOf(PropTypes.string.isRequired),
  bundleCss: PropTypes.arrayOf(PropTypes.string.isRequired),
  manifest: PropTypes.string,
  body: PropTypes.string,
  initialState: PropTypes.objectOf(PropTypes.shape({})),
  preload: PropTypes.arrayOf(PropTypes.string.isRequired),
};
Html.defaultProps = {
  title: null,
  meta: null,
  link: null,
  style: null,
  script: null,
  noscript: null,
  base: null,
  htmlAttributes: {},
  bodyAttributes: {},
  initialState: {},
  body: '',
  manifest: '',
  preload: [],
  bundleJs: [],
  bundleCss: [],
};

export default Html;
