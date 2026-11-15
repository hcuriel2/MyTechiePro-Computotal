// Minimal loopback-only fetch adapter for the isolated tests on Node 14.
if (!global.fetch) global.fetch = (url, options = {}) => new Promise((resolve, reject) => {
    const target = new URL(url);
    if (target.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(target.hostname)) {
        return reject(new Error('Only loopback HTTP is supported in tests'));
    }
    const headers = {...options.headers};
    if (options.body !== undefined) headers['Content-Length'] = Buffer.byteLength(options.body);
    const req = require('http').request(target, {...options, headers}, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({status: res.statusCode,
            headers: {get: name => {
                const value = res.headers[name.toLowerCase()];
                return Array.isArray(value) ? value.join(', ') : value || null;
            }}, text: async () => body}));
    });
    req.on('error', reject);
    if (options.body !== undefined) req.write(options.body);
    req.end();
});
