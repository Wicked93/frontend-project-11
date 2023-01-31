import i18next from 'i18next';
import app from './app.js';

const resources = {
  ru: {
    translation: {
      invalidUrl: 'Ресурс не содержит валидный RSS',
      duplicate: 'RSS уже существует',
      success: 'RSS успешно загружен',
      required: 'Не должно быть пустым',
      networkError: 'Ошибка сети',
      rssError: 'Ресурс не содержит валидный RSS',
      posts: 'Посты',
      postsButton: 'Просмотр',
      feeds: 'Фиды',
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
