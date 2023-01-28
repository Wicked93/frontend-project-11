import onChange from 'on-change';

export default (state) => {
  const elements = {
    input: document.querySelector('#url-input'),
    outputText: document.querySelector('.feedback'),
  };

  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
    if (path === 'rssForm.state') {
      if (value === 'invalid') {
        elements.input.classList.add('is-invalid');
        watchedState.rssForm.state = 'rendered';
        elements.outputText.textContent = watchedState.rssForm.error;
        elements.outputText.classList.remove('text-success');
        elements.outputText.classList.add('text-danger');
      }
      if (value === 'valid') {
        elements.input.classList.remove('is-invalid');
        watchedState.rssForm.state = 'rendered';
        elements.outputText.textContent = watchedState.rssForm.successMessage;
        elements.outputText.classList.remove('text-danger');
        elements.outputText.classList.add('text-success');
      }
    }
  });
  return watchedState;
};