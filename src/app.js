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
  .catch(() => {
    throw new Error('networkError');
  })
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
      title: '',
      description: '',
      link: '',
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

  const form = document.querySelector('form.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputURL = (e.target.elements.url.value).trim();

    schema.notOneOf(state.links).validate(inputURL)
      .then(() => {
        state.state = 'loading';
        state.error = '';
        return getFeedsPostsFromURL(inputURL);
      })
      .then((normalizedData) => {
        state.feeds.unshift(normalizedData.feed);
        state.posts.unshift(...normalizedData.posts);
        state.links.unshift(inputURL);
        state.state = 'loaded';
      })
      .catch((err) => {
        state.error = err.message;
        state.state = 'failed';
      });
  });

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) return;
    state.readPostsIds.add(id);
    const { title, description, link } = state.posts.filter((item) => item.id === id)[0];
    state.modalPost = { title, description, link };
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
