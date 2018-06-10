import * as React from 'react';
import serialize from 'serialize-javascript';

// Interface
interface HtmlProps {
  title: React.ReactNode;
  meta: React.ReactNode;
  link: React.ReactNode;
  style: React.ReactNode;
  script: React.ReactNode;
  noscript: React.ReactNode;
  base: React.ReactNode;
  htmlAttributes: object;
  bodyAttributes: object;
  bundleJs: string[];
  bundleCss: string[];
  body: string;
  initialState?: object;
  manifest?: string;
}

class Html extends React.PureComponent<HtmlProps, never> {
  public static defaultProps = {
    htmlAttributes: {},
    bodyAttributes: {},
    body: '',
  };
  public render() {
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
          {bundleCss.map((css, i) => <link key={i} href={css} rel="stylesheet" />)}
          {manifest && <link rel="manifest" href={manifest} />}
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
          {bundleJs.map((js, i) => <script key={i} type="text/javascript" src={js} defer />)}
        </body>
      </html>
    );
  }
}

export default Html;
