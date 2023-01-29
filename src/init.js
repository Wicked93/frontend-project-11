import i18next from 'i18next';
import app from './app.js';

const resources = {
  ru: {
    translation: {
      invalidUrl: 'Ссылка должна быть валидным URL',
      duplicate: 'RSS уже существует',
      success: 'RSS успешно загружен',
    },
  },
};

export default async (lang = 'ru') => {
  const i18nextInstance = i18next.createInstance();
  Promise.resolve(i18nextInstance.init({
    lng: lang,
    resources,
  }));
  app(i18nextInstance);
};
