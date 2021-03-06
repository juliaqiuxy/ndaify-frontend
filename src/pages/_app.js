import React from 'react';
import NextApp from 'next/app';
import NProgress from 'nprogress';
import { positions, Provider as AlertProvider } from 'react-alert';
import Router from 'next/router';
import { ReactQueryConfigProvider } from 'react-query';

import { createGlobalStyle } from 'styled-components';

import Head from '../components/Head/Head';
import Alert from '../components/Alert/Alert';
import ErrorView from '../components/ErrorView/ErrorView';

import { NdaifyServiceError } from '../services/NdaifyService';

import {
  IntlProvider,
  getLocalePreference,
  pickSupportedLocale,
  loadMessages,
} from '../lib/useLocale';
import { ThemeProvider, getThemePreference } from '../lib/useTheme';

import getSystemLocale from '../utils/getSystemLocale';
import parseLocaleParts from '../utils/parseLocaleParts';

import sentryBrowserClient from '../db/sentryBrowserClient';
import loggerClient from '../db/loggerClient';

import '../css/nprogress.css';

const lightVars = `
  --ndaify-bg: 220,244,227;
  --ndaify-fg: #424657;

  --ndaify-accents-0: #ffffff;
  --ndaify-accents-1: #fafafa;
  --ndaify-accents-2: #eaeaea;
  --ndaify-accents-3: #999999;
  --ndaify-accents-4: #888888;
  --ndaify-accents-5: #666666;
  --ndaify-accents-6: #444444;
  --ndaify-accents-7: #333333;
  --ndaify-accents-8: #111111;
  --ndaify-accents-9: #1A73E8;

  --ndaify-accents-primary: #CEB778;
  --ndaify-accents-secondary: #0F96CC;
  --ndaify-accents-success: #4AC09A;
  --ndaify-accents-info: #9E82E0;
  --ndaify-accents-warning: #DFA907;
  --ndaify-accents-danger: #DC564A;

  --ndaify-accents-radius-1: 4px;
  --ndaify-accents-radius-2: 8px;
  --ndaify-accents-radius-3: 12px;
  --ndaify-input-radius: 4px;
  --ndaify-button-radius: 4px;

  --ndaify-input-bg: #FFFFFF;
  --ndaify-input-fg: #424657;
  --ndaify-input-placeholder-color: #AAAAAA;
  --ndaify-input-disabled-bg: #AAAAAA;

  --ndaify-button-fg: #FFFFFF;
  
  --ndaify-bg-overlay: #D2E7D8;
  --ndaify-user-action-bg: #BDD8D3;
  --ndaify-link-color: var(--ndaify-fg);
  --ndaify-signature-line: var(--ndaify-accents-8);
  --ndaify-portal-opacity: 0.8;
`;

const darkVars = `
  --ndaify-bg: 66,70,87;
  --ndaify-fg: #FFFFFF;

  --ndaify-accents-0: #000000;
  --ndaify-accents-1: #111111;
  --ndaify-accents-2: #333333;
  --ndaify-accents-3: #444444;
  --ndaify-accents-4: #666666;
  --ndaify-accents-5: #888888;
  --ndaify-accents-6: #999999;
  --ndaify-accents-7: #EAEAEA;
  --ndaify-accents-8: #FAFAFA;
  --ndaify-accents-9: #EDD9A3;

  --ndaify-accents-primary: #CEB778;
  --ndaify-accents-secondary: #0F96CC;
  --ndaify-accents-success: #4AC09A;
  --ndaify-accents-info: #9E82E0;
  --ndaify-accents-warning: #DFA907;
  --ndaify-accents-danger: #DC564A;

  --ndaify-accents-radius-1: 4px;
  --ndaify-accents-radius-2: 8px;
  --ndaify-accents-radius-3: 12px;
  --ndaify-input-radius: 4px;
  --ndaify-button-radius: 4px;

  --ndaify-input-bg: #FFFFFF;
  --ndaify-input-fg: #424657;
  --ndaify-input-placeholder-color: #AAAAAA;
  --ndaify-input-disabled-bg: #AAAAAA;

  --ndaify-button-fg: #FFFFFF;
  
  --ndaify-bg-overlay: #383B49;
  --ndaify-user-action-bg: #5dbfc8;
  --ndaify-link-color: var(--ndaify-fg);
  --ndaify-signature-line: #F1E65D;
  --ndaify-portal-opacity: 0.8;
`;

const themeVars = `
  // default theme in case refers-color-scheme is not supported
  :root {
    ${lightVars}
  }

  @media (prefers-color-scheme: light) {
    :root {
      ${lightVars}
    }

    // dark override
    .dark {
      ${darkVars}
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      ${darkVars}
    }
    
    // light override
    .light {
      ${lightVars}
    }
  }

  @media (prefers-color-scheme: no-preference) {}
`;

const GlobalStyle = createGlobalStyle`
  ${themeVars}

  // mute reach-ui missing style warnings
  :root {
    --reach-menu-button: 1;
    --reach-dialog: 1;
  }

  @font-face {
    font-family: Signerica Fat;
    src: url('/fonts/Signerica_Fat.ttf');
  }

  body {
    font-family: 'Raleway', sans-serif;
    background-color: rgb(var(--ndaify-bg));
    min-width: 100vw;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
`;

NProgress.configure({ showSpinner: false });

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});
Router.events.on('routeChangeComplete', () => {
  NProgress.done();
});
Router.events.on('routeChangeError', () => NProgress.done());

const queryConfig = {
  shared: {
    suspense: false,
  },
  queries: {
    enabled: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    refetchOnMount: true,
    useErrorBoundary: false, // falls back to suspense
  },
};

class App extends NextApp {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    let errorPageProps;

    if (Component.getInitialProps) {
      try {
        pageProps = await Component.getInitialProps(ctx);
      } catch (error) {
        if (error instanceof NdaifyServiceError) {
          loggerClient.error(error);

          errorPageProps = {
            ...error.data,
            errorMessage: error.message,
            statusCode: error.statusCode,
          };
        } else {
          // Propogate all other errors up to next-server to handle
          // https://github.com/vercel/next.js/blob/b7e17e09e5e51a8e33b728a1ef14f11e7bf009db/packages/next/next-server/server/next-server.ts#L282
          // https://github.com/vercel/next.js/blob/b7e17e09e5e51a8e33b728a1ef14f11e7bf009db/packages/next/next-server/server/render.tsx#L652
          throw error;
        }
      }
    }

    const preferredTheme = Component.themeOverride || getThemePreference(ctx);

    const preferredLocale = getLocalePreference(ctx);
    const systemLocale = getSystemLocale(ctx);

    // Given a user preferred locale and user's system locale determine the
    // locale to render based what we support
    const locale = pickSupportedLocale(Component.localeOverride || preferredLocale || systemLocale);
    const { language } = parseLocaleParts(locale);
    // Initial messages are needed to rehydrate them on the client
    const initialMessages = await loadMessages(language);

    const ssrNow = Date.now();

    // TODO infer this value since Server TZ (UTC) !== Client TZ and it'd break ssr
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    return {
      errorPageProps,
      initialMessages,
      locale,
      pageProps,
      preferredLocale,
      preferredTheme,
      ssrNow,
      systemLocale,
      timeZone,
    };
  }

  componentDidCatch(error, errorInfo) {
    sentryBrowserClient.withScope((scope) => {
      scope.setTag('react', 'yes');
      scope.setExtras(errorInfo);

      // Additional extras like the url, os, browser etc are inferred by Sentry
      // but next.js's `asPath` can't be inferred unless explicitly set as extra.

      sentryBrowserClient.captureException(error);
    });

    super.componentDidCatch(error, errorInfo);
  }

  render() {
    const {
      Component,
      errorPageProps,
      initialMessages,
      locale,
      pageProps,
      preferredLocale,
      preferredTheme,
      ssrNow,
      systemLocale,
      timeZone,
    } = this.props;

    return (
      <>
        <Head locale={locale} />
        <GlobalStyle />

        <ReactQueryConfigProvider config={queryConfig}>
          <IntlProvider
            initialMessages={initialMessages}
            locale={locale}
            preferredLocale={preferredLocale}
            systemLocale={systemLocale}
            timeZone={timeZone}
            initialNow={ssrNow}
          >
            <ThemeProvider preferredTheme={preferredTheme}>
              <AlertProvider
                template={Alert}
                timeout={5000}
                position={positions.TOP_CENTER}
              >
                {
                  errorPageProps ? (
                    <ErrorView
                      statusCode={errorPageProps.statusCode}
                      errorMessage={errorPageProps.errorMessage}
                    />
                  ) : (
                    <Component
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...pageProps}
                    />
                  )
                }
              </AlertProvider>
            </ThemeProvider>
          </IntlProvider>
        </ReactQueryConfigProvider>
      </>
    );
  }
}

export default App;
