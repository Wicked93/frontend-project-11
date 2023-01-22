import * as yup from 'yup';
import view from './view.js';

export default async () => {
  const state = {
    rssForm: {
      state: 'intial',
      validate: true,
      links: [],
      errors: {},
    },
  };
  const watchedState = view(state);

  yup.setLocale({
    mixed: {
      notOneOf: 'duplicate',
      required: 'required',
    },
    string: {
      url: 'invalidURL',
    },
  });

  const schema = yup.string().url().required();

  const form = document.querySelector('form.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputURL = (e.target.elements.url.value).trim();

    schema.notOneOf(watchedState.rssForm.links).validate(inputURL)
      .then(() => {
        watchedState.rssForm.validate = true;
        watchedState.rssForm.links.push(inputURL);
        watchedState.rssForm.state = 'valid';
        e.target.reset();
        e.target.elements.url.focus();
      })
      .catch((err) => {
        watchedState.rssForm.errors = err.message;
        watchedState.rssForm.validate = false;
        watchedState.rssForm.state = 'invalid';
      });
  });
};