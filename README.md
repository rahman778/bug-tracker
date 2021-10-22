<<<<<<< HEAD
=======
# Embeddable React Widget
This project is a embeddable React widget that can be inserted into a host website asynchronously using a single <script> tag. It supports JSX, CSS styles, and is compiled using Webpack into a single widget.js file which can be static-hosted.

## Installation

  1. npm install
  2. Change .env for local development and production config
  3. configure the api key inside demo -> index.html
  4. Add site url in the dashboard -> Installation Eg:"http://localhost:3000/"
  5. npm run build
  6. npm run start

## Usage

We can load the widget asynchronously. Using this method we create a temporary object that holds any calls to the widget in a queue and when the widget loads, it will then process those calls.
Add widget url and api key
```sh
<script> 
    (function (w, d, s, o, f, js, fjs) {
    w['JS-Widget'] = o; w[o] = w[o] || 
    function () { (w[o].q = w[o].q || []).push(arguments)};
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
    }(window, document, 'script', 'mw', '<widget_url>'));
    mw({ apiKey: "<api_key>" });
</script>
```
>>>>>>> b0170e1... changed
