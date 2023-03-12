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
  });

const handleError = (error) => {
  if (error.isParsingError) {
    return 'rssError';
  }
  if (axios.isAxiosError(error)) {
    return 'networkError';
  }
  return error.message.key ?? 'unknown';
};

export default () => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'duplicate' }),
      required: () => ({ key: 'required' }),
    },
    string: {
      url: () => ({ key: 'invalidUrl' }),
    },
  });

  const intialState = {
    state: 'intial',
    error: null,
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
  })
    .then(() => {
      const state = view(intialState, i18nextInstance);
      const makeSchema = (validatedLinks) => yup.string()
        .required()
        .url()
        .notOneOf(validatedLinks);

      const form = document.querySelector('form.rss-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const links = state.feeds.map((feed) => feed.link);
        const schema = makeSchema(links);
        const formData = new FormData(e.target);
        const inputURL = formData.get('url');
        schema.validate(inputURL)
          .then(() => {
            state.state = 'loading';
            state.error = null;
            return getFeedsPostsFromURL(inputURL);
          })
          .then((normalizedData) => {
            state.feeds.unshift(normalizedData.feed);
            state.feeds[0].link = inputURL;
            state.posts.unshift(...normalizedData.posts);
            state.state = 'loaded';
          })
          .catch((error) => {
            state.error = handleError(error);
            state.state = 'failed';
          });
      });

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        state.readPostsIds.add(id);
        state.modalPost.postId = id;
        state.state = 'loaded';
      });

      const checkForNewPosts = () => {
        const promises = state.feeds
          .map((feed, index) => getFeedsPostsFromURL(feed.link)
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
              console.log(new Error(err.message));
            }));
        Promise.all(promises).finally(() => setTimeout(checkForNewPosts, timeOut));
      };
      checkForNewPosts();
    });
};
