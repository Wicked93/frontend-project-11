import i18next from 'i18next';
import app from './app.js';

const resources = {
  ru: {
    translation: {
      invalidUrl: '������ ������ ���� �������� URL',
      duplicate: 'RSS ��� ����������',
      success: 'RSS ������� ��������',
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
