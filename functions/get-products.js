/*
 * This function loads product data and returns it for use in the UI.
 */
const products = require('./data/products.json');

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};
