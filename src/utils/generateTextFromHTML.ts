import { convert } from 'html-to-text';

const generateTextFromHTML = (html: string, wordwrap = 30) => {
  const options = {
    wordwrap,
    // TODO: finalize selector
    selectors: [{ selector: 'img', format: 'skip' }],
  };
  const textContent = convert(html, options);
  return textContent;
};

export default generateTextFromHTML;
