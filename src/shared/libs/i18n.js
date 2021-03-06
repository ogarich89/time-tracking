import i18next from 'i18next';

const i18n = (...plugins) => {
  plugins.forEach(plugin => i18next.use(plugin));
  i18next
    .init({
      interpolation: {
        escapeValue: false
      },
      backend: {
        loadPath: 'http://localhost:3003/public/locales/{{lng}}/{{ns}}.json'
      },
      debug: false
    });
  return i18next;
};

export default i18n;
