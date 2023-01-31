import i18next from 'i18next';
import app from './app.js';

const resources = {
  ru: {
    translation: {
      invalidUrl: '������ �� �������� �������� RSS',
      duplicate: 'RSS ��� ����������',
      success: 'RSS ������� ��������',
      required: '�� ������ ���� ������',
      networkError: '������ ����',
      rssError: '������ �� �������� �������� RSS',
      posts: '�����',
      postsButton: '��������',
      feeds: '����',
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
