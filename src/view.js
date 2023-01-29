import onChange from 'on-change';

const renderPosts = (state, elements) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Посты';
  cardBody.append(cardTitle);
  card.append(cardBody);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const postsElements = state.posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'aling-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    a.classList.add('fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = 'Просмотр';
    li.append(a, button);
    return li;
  });
  ul.append(...postsElements);
  card.append(ul);
  elements.posts.append(card);
};

const renderFeeds = (state, elements) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Фиды';
  cardBody.append(cardTitle);
  card.append(cardBody);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const feedsElements = state.feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);
    return li;
  });
  ul.append(...feedsElements);
  card.append(ul);
  elements.feeds.append(card);
};

export default (state, i18nInstance) => {
  const elements = {
    input: document.querySelector('#url-input'),
    outputText: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'state') {
      if (value === 'failed') {
        elements.input.classList.add('is-invalid');
        watchedState.state = 'rendered';
        elements.outputText.textContent = watchedState.error;
        elements.outputText.classList.remove('text-success');
        elements.outputText.classList.add('text-danger');
      }
      if (value === 'valid') {
        elements.input.classList.remove('is-invalid');
        watchedState.state = 'rendered';
        elements.outputText.textContent = i18nInstance.t('success');
        elements.outputText.classList.remove('text-danger');
        elements.outputText.classList.add('text-success');
        elements.posts.innerHTML = '';
        elements.feeds.innerHTML = '';
        renderPosts(watchedState, elements);
        renderFeeds(watchedState, elements);
      }
    }
  });
  return watchedState;
};
