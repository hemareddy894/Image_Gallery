# Image Gallery

Simple image gallery with search, category filters, modal preview, and load-more functionality.

How it works
- Uses the Unsplash Source endpoint to fetch images by keyword (no API key required).
- Click a category or search to display images. Click an image to preview in a modal. Use arrows or keyboard to navigate.

Optional: use Unsplash API for richer, more consistent results
- Sign up for an API key at https://unsplash.com/developers
- Create a file named `config.js` in the project root with this content:

```js
// set your Unsplash Access Key here
window.UNSPLASH_ACCESS_KEY = 'YOUR_ACCESS_KEY'
```

When set, the app will call the official Unsplash Search API and return many related images for a query. If not set the app will fall back to the Unsplash Source method which provides random images by keyword.

Run
1. Open `index.html` in your browser.
2. Or run a quick static server from the project folder:

```bash
# Python 3
python -m http.server 8000

# then open http://localhost:8000 in your browser
```

Notes
- The gallery uses https://source.unsplash.com which returns random images for a query; adding `&sig=` produces different images per request.
- If you want higher control or metadata (photographer, link), replace image sources with Unsplash API calls (requires an API key).
