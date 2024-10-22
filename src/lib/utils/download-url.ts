/**
 * Download the file specfied by the given url.
 *
 * @param {String} url A url pointing to the file to download.
 * @param {String} fileName The name that the file should have.
 */
const downloadUrl = (url: string, fileName: string = 'file') => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.click();
  a.remove();
};

export default downloadUrl;
