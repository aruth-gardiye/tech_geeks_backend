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

// print all available routes
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
    res.status(200).json({
        routes
    });
});

module.exports = router;
