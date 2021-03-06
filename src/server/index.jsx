import serialize from 'serialize-javascript';
import 'source-map-support/register';
import config from '../../config/config';
import url from 'url';
import path from 'path';

import Koa from 'koa';
import Router from 'koa-router';
import { routes } from './routes';
import { middleware } from './middleware';

import React from 'react';
import { StaticRouter, matchPath } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import appRoutes from '../shared/routes';
import App from '../shared/App';

import { Provider } from 'react-redux';
import configureStore from '../shared/configure-store';

import { I18nextProvider } from 'react-i18next';

import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
const statsFile = path.resolve(__dirname, '../dist/loadable-stats.json');

const { server: { port } } = config;
const app = new Koa();
app.keys = ['secret', 'key'];
const router = new Router();

middleware(app);

routes.forEach(({ path, method, controller }) => {
  router[method](path, controller);
});

router.get('*', async (ctx, next) => {
  const store = configureStore();
  const extractor = new ChunkExtractor({ statsFile, entrypoints: ['bundle'] });
  const promises = appRoutes.reduce((acc, route) => {
    const { pathname } = url.parse(ctx.url);
    if (matchPath(pathname, route)) {
      if(route.initialAction) {
        acc.push(Promise.resolve(store.dispatch(route.initialAction(ctx.api, ctx.request))));
      }
    }
    return acc;
  }, []);

  const version = !isDevelopment ? `?version=${timestamp}` : '';
  await Promise.all(promises).catch(next);

  const context = {};
  const initialData = store.getState();

  const html = renderToString(
    <ChunkExtractorManager extractor={extractor}>
      <Provider store={store}>
        <StaticRouter location={ctx.url} context={context}>
          <I18nextProvider i18n={ctx.i18next}>
            <App/>
          </I18nextProvider>
        </StaticRouter>
      </Provider>
    </ChunkExtractorManager>
  );
  const scriptTags = extractor.getScriptTags();
  const styleTags = extractor.getStyleTags();

  if(context.status === 404) {
    ctx.status = 404;
  }

  const initialI18nStore = {};
  ctx.i18next.languages.forEach(l => {
    initialI18nStore[l] = ctx.i18next.services.resourceStore.data[l];
  });
  await ctx.render('index', {
    html,
    envType: process.env.NODE_ENV || 'development',
    initialData: serialize(initialData),
    scriptTags,
    styleTags,
    version,
    initialLanguage: serialize(ctx.i18next.language),
    initialI18nStore: serialize(initialI18nStore)
  });
});

app.use(router.routes());

app.listen(port, error => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
  }
});
