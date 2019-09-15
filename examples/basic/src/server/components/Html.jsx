import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';

// Helpers
function isAssetObject(asset) {
  return typeof asset === 'object';
}

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
          {manifest && isAssetObject(manifest) ? (
            <link rel="manifest" href={manifest.src} integrity={manifest.integrity} crossOrigin="anonymous" />
          ) : (
            <link rel="manifest" href={manifest} crossOrigin="anonymous" />
          )}
          {link}
          {preload.map(asset => {
            const { src, integrity = undefined } = isAssetObject(asset) ? asset : { src: asset };
            if (/\.js$/.test(src))
              return (
                <link key={src} href={src} rel="preload" as="script" integrity={integrity} crossOrigin="anonymous" />
              );
            if (/\.css$/.test(src))
              return (
                <link key={src} href={src} rel="preload" as="style" integrity={integrity} crossOrigin="anonymous" />
              );
            if (/(\.woff|\.woff2|\.eot|\.ttf)$/.test(src))
              return (
                <link key={src} href={src} rel="preload" as="font" integrity={integrity} crossOrigin="anonymous" />
              );
            if (/(\.png|\.jpe?g|\.gif)$/.test(src))
              return (
                <link key={src} href={src} rel="preload" as="image" integrity={integrity} crossOrigin="anonymous" />
              );
            return null;
          })}
          {bundleCss.map(css =>
            isAssetObject(css) ? (
              <link key={css.src} integrity={css.integrity} href={css.src} rel="stylesheet" crossOrigin="anonymous" />
            ) : (
              <link key={css} href={css} rel="stylesheet" crossOrigin="anonymous" />
            ),
          )}
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
          {bundleJs.map(js =>
            isAssetObject(js) ? (
              <script
                key={js.src}
                type="text/javascript"
                src={js.src}
                integrity={js.integrity}
                defer
                crossOrigin="anonymous"
              />
            ) : (
              <script key={js} type="text/javascript" src={js} defer crossOrigin="anonymous" />
            ),
          )}
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
  bundleJs: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.objectOf(PropTypes.shape({ src: PropTypes.string.isRequired, integrity: PropTypes.string })),
      PropTypes.string.isRequired,
    ]),
  ),
  bundleCss: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.objectOf(PropTypes.shape({ src: PropTypes.string.isRequired, integrity: PropTypes.string })),
      PropTypes.string.isRequired,
    ]),
  ),
  manifest: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.shape({ src: PropTypes.string.isRequired, integrity: PropTypes.string })),
    PropTypes.string,
  ]),
  body: PropTypes.string,
  initialState: PropTypes.objectOf(PropTypes.shape({})),
  preload: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.objectOf(PropTypes.shape({ src: PropTypes.string.isRequired, integrity: PropTypes.string })),
      PropTypes.string.isRequired,
    ]),
  ),
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
