const parseToHTML = (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const errorNode = parsedData.querySelector('parsererror');
  if (errorNode) throw new Error('rssError');
  return parsedData;
};

const getFeed = (parsedData) => {
  const titleEl = parsedData.querySelector('channel title');
  const title = titleEl.textContent;
  const descriptionEl = parsedData.querySelector('channel description');
  const description = descriptionEl.textContent;
  return { title, description };
};

const getPosts = (parsedData) => {
  const items = parsedData.querySelectorAll('item');
  return [...items].map((item) => {
    const titleEl = item.querySelector('title');
    const title = titleEl.textContent;
    const descriptionEl = item.querySelector('description');
    const description = descriptionEl.textContent;
    const linkEl = item.querySelector('link');
    const link = linkEl.textContent.trim();
    return { title, description, link };
  });
};

export default (data) => {
  const parsedData = parseToHTML(data);
  return {
    feed: getFeed(parsedData),
    posts: getPosts(parsedData),
  };
};
