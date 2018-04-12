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
    body: PropTypes.string,
    initialState: PropTypes.object,
  };
  static defaultProps = {
    htmlAttributes: {},
    bodyAttributes: {},
    body: '',
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
    } = this.props;
    return (
      <html {...htmlAttributes}>
        <head>
          {title}
          {meta}
          {link}
          {style}
          {script}
          {noscript}
          {base}
          {bundleCss.map((css, i) => <link key={i} href={css} rel="stylesheet"/>)}
        </head>
        <body {...bodyAttributes}>
          <div id="root" dangerouslySetInnerHTML={{ __html: body }}/>
          {bundleJs.map((js, i) => <script key={i} type="text/javascript" src={js} />)}
          {initialState && <script id="initial-state" type="text/javascript" dangerouslySetInnerHTML={{ __html: `window.__INITIAL_REDUX_STATE__ = ${serialize(initialState, { isJSON: true })}` }}/>}
        </body>
      </html>
    );
  }
}

export default Html;
