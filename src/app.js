import _ from 'lodash';
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

const getFeedsPostsFromURL = (url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => response.json())
  .then((responseData) => parse(responseData.contents))
  .then((parsedData) => setIds(parsedData))
  .catch((err) => {
    throw new Error(err.message);
  });

export default async (i18nInstance) => {
  const intialState = {
    state: 'intial',
    error: '',
    links: [],
    feeds: [],
    posts: [],
  };
  const state = view(intialState, i18nInstance);

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

    schema.notOneOf(state.links).validate(inputURL)
      .then(() => {
        e.target.reset();
        e.target.elements.url.focus();
      })
      .then(() => getFeedsPostsFromURL(inputURL))
      .then((normalizedData) => {
        state.feeds.unshift(normalizedData.feed);
        state.posts.unshift(...normalizedData.posts);
        state.links.unshift(inputURL);
        state.state = 'valid';
      })
      .catch((err) => {
        state.error = err.message;
        state.state = 'failed';
      });
  });

  const checkForNewPosts = () => {
    const run = () => {
      const promises = state.links
        .map((link, index) => getFeedsPostsFromURL(link)
          .then((response) => {
            const { id } = state.feeds[index];
            const filteredPosts = state.posts.filter((post) => post.id === id);
            const currentNewPosts = _.differenceBy(response.posts, filteredPosts, 'title')
              .map((post) => {
                const newPost = post;
                newPost.id = id;
                return newPost;
              });
            if (currentNewPosts.length > 0) {
              state.posts.unshift(...currentNewPosts);
              state.state = 'valid';
            }
          })
          .catch((err) => {
            state.error = err.message;
            state.state = 'failed';
            throw new Error(err.message);
          }));
      Promise.all(promises).finally(() => setTimeout(run, 5000));
    };
    setTimeout(run, 5000);
  };

  checkForNewPosts();
};