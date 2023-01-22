import onChange from 'on-change';

export default (state) => {
  const elements = {
    input: document.querySelector('#url-input'),
  };

  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
    if (path === 'rssForm.state') {
      if (value === 'invalid') {
        elements.input.classList.add('is-invalid');
      }
      if (value === 'valid') {
        elements.input.classList.remove('is-invalid');
        watchedState.rssForm.state = 'rendered';
      }
    }
  });
  return watchedState;
};