const express = require('express');
const router = express.Router();
const fs = require('fs');

const files = fs.readdirSync(__dirname);

files
    .filter(f => f !== 'index.js')
    .forEach(file => {
        if (file) {
            router.use(`/api/${file.split('.').slice(0, -1).join('.')}`, require(`./${file}`));
        }
    })

// if user access /, redirect to /api
router.get('/', (req, res) => {
  res.redirect('/api');
});

// if user access /api, display links to root routes
const welcomeMessage = `
  <pre style="font-family: monospace;">
   _____         _      ____           _        
  |_   _|__  ___| |__  / ___| ___  ___| | __ __ 
    | |/ _ \\/ __| '_ \\| |  _ / _ \\/ _ \\ |/ / __|
    | |  __/ (__| | | | |_| |  __/  __/   <\\__ \\
    |_|\\___|\\___|_| |_|\\____|\\___|\\___|_|\\_\\___/
  
  </pre>
`;

router.get('/api', (req, res) => {
  const routes = [];

  // User routes
  routes.push({
    path: '/api/User',
    description: 'User routes'
  });

  // Job routes
  routes.push({
    path: '/api/Job',
    description: 'Job routes'
  });

  // Helper routes
  routes.push({
    path: '/api/Helper',
    description: 'Helper routes'
  });

  const formatted_routes = routes.map(route => {
    return `<li><a href="${route.path}">${route.path}</a> - ${route.description}</li>`;
  }).join('\n');

  const html = `
    <html>
      <head>
        <title>Welcome to the TechGeeks API</title>
      </head>
      <body>
        <div style="text-align: center;">
          <h2 style="font-family: monospace;">
          Welcome to the API of</h2>
          ${welcomeMessage}
          <h3 style="font-family: monospace;>
          Available Routes</h3>
          <ul style="font-family: monospace;list-style-type:none;">
            ${formatted_routes}
          </ul>
        </div>
      </body>
    </html>
  `;

  res.set('Content-Type', 'text/html');
  res.status(200).send(html);
});

module.exports = router;
