// Dummy routes for the API
// Path: routes.js

const express = require('express');
const router = express.Router();
const status = require('http-status');

// GET /api
router.get('/', (req, res) => {
  res.status(status.OK).json({
    message: 'Welcome to the API'
  });
});

// GET /api/users
router.get('/users', (req, res) => {
  res.status(status.OK).json({
    message: 'Users'
  });
});

// GET /api/users/:id
router.get('/users/:id', (req, res) => {
  res.status(status.OK).json({
    message: 'User'
  });
});

// POST /api/users
router.post('/users', (req, res) => {
  res.status(status.OK).json({
    message: 'User created'
  });
});

// PUT /api/users/:id
router.put('/users/:id', (req, res) => {
  res.status(status.OK).json({
    message: 'User updated'
  });
});

// DELETE /api/users/:id
router.delete('/users/:id', (req, res) => {
  res.status(status.OK).json({
    message: 'User deleted'
  });
});

// api route to display all the available routes with required parameters
router.get('/routes', (req, res) => {
  const routes = [];
  const availableRoutes = router.stack
    .filter(r => r.route)
    .map(r => {
      const method = r.route.stack[0].method;
      const path = r.route.path;
      return {
        method: method.toUpperCase(),
        path
      };
    });
  availableRoutes.forEach(route => {
    routes.push(`${route.method} ${route.path}`);
  });
  res.status(status.OK).json(routes);
});

module.exports = router;