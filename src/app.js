import * as yup from 'yup';
import view from './view.js';
import parse from './parser.js';

const setIds = (data) => {
  const id = Date.now();
  const { title, description } = data.feed;
  const feed = { id, title, description };
  const posts = data.posts.map((post) => ({ id, ...post }));
  return { feed, posts };
};

export default async (i18nInstance) => {
  const intialState = {
    rssForm: {
      state: 'intial',
      validate: true,
      links: [],
      error: '',
      successMessage: i18nInstance.t('success'),
      feeds: [],
      posts: [],
    },
  };
  const state = view(intialState);

  yup.setLocale({
    mixed: {
      notOneOf: i18nInstance.t('duplicate'),
      required: 'required',
    },
    string: {
      url: i18nInstance.t('invalidUrl'),
    },
  });

  const schema = yup.string().url().required();

  const form = document.querySelector('form.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputURL = (e.target.elements.url.value).trim();

    schema.notOneOf(state.rssForm.links).validate(inputURL)
      .then(() => {
        state.rssForm.validate = true;
        state.rssForm.links.push(inputURL);
        state.rssForm.state = 'valid';
        e.target.reset();
        e.target.elements.url.focus();
        Promise.resolve(fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputURL)}`)
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error('Network response was not ok.');
          })
          .then((data) => data.contents)
          .then((content) => parse(content))
          .then((parsedData) => setIds(parsedData))
          .then((normalizedData) => {
            state.rssForm.feeds.push(normalizedData.feed);
            state.rssForm.posts.push(...normalizedData.posts);
          })
          .then(() => console.log(state)));
      })
      .catch((err) => {
        state.rssForm.error = err.message;
        state.rssForm.validate = false;
        state.rssForm.state = 'invalid';
      });
  });
};