const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dikqzl7sk', // Replace with your Cloudinary cloud name
  api_key: '413718729298563',       // Replace with your Cloudinary API key
  api_secret: 'rQy3cLXjfyCzSn5q-kmC_aADHXg', // Replace with your Cloudinary API secret
});

module.exports = cloudinary; 