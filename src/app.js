/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import ru from './locales/ru.js';
import view from './view.js';
import parse from './parser.js';

const setIds = (data) => {
  const feedId = _.uniqueId();
  const { title, description } = data.feed;
  const feed = { feedId, title, description };
  const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
  return { feed, posts };
};

const timeOut = 5000;

const generateURL = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.append('disableCache', 'true');
  url.searchParams.append('url', link);
  return url;
};

const getFeedsPostsFromURL = (link) => axios.get(generateURL(link))
  .then((response) => {
    const parsedData = parse(response.data.contents);
    return setIds(parsedData);
  })
  .catch((e) => {
    throw new Error(e.message);
  });

export default () => {
  const intialState = {
    state: 'intial',
    error: '',
    links: [],
    feeds: [],
    posts: [],
    readPostsIds: new Set(),
    modalPost: {
      postId: '',
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    resources: { ru },
  });

  const state = view(intialState, i18nextInstance);

  yup.setLocale({
    mixed: {
      notOneOf: 'duplicate',
      required: 'required',
    },
    string: {
      url: 'invalidUrl',
    },
  });

  const schema = yup.string().url().required();
  const validate = (checkingState, inputURL) => {
    schema.notOneOf(checkingState.links).validate(inputURL)
      .then(() => {
        checkingState.state = 'loading';
        checkingState.error = '';
        return getFeedsPostsFromURL(inputURL);
      })
      .then((normalizedData) => {
        checkingState.feeds.unshift(normalizedData.feed);
        checkingState.posts.unshift(...normalizedData.posts);
        checkingState.links.unshift(inputURL);
        checkingState.state = 'loaded';
      })
      .catch((err) => {
        checkingState.error = err.message;
        checkingState.state = 'failed';
      });
  };

  const form = document.querySelector('form.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputURL = (e.target.elements.url.value).trim();
    validate(state, inputURL);
  });

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) return;
    state.readPostsIds.add(id);
    state.modalPost.postId = id;
    state.state = 'loading';
    state.state = 'loaded';
  });

  const checkForNewPosts = () => {
    const promises = state.links
      .map((link, index) => getFeedsPostsFromURL(link)
        .then((response) => {
          const { feedId } = state.feeds[index];
          const filteredPosts = state.posts.filter((post) => post.feedId === feedId);
          const currentNewPosts = _.differenceBy(response.posts, filteredPosts, 'title')
            .map((post) => ({ feedId, id: _.uniqueId, ...post }));
          if (currentNewPosts.length > 0) {
            state.posts.unshift(...currentNewPosts);
            state.state = 'loaded';
          }
        })
        .catch((err) => {
          state.error = err.message;
          state.state = 'failed';
          throw new Error(err.message);
        }));
    Promise.all(promises).finally(() => setTimeout(checkForNewPosts, timeOut));
  };
  checkForNewPosts();
};
