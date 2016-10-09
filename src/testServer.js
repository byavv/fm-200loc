

const app = require('express')(),
    pipeBuilder = require('./components/route/pipeBuilder'),
    logger = require('../lib/logger'),
    request = require('request-promise'),
    async = require('async');

app.use((tReq, tRes, next) => {
    let plugins = req.body.plugins;
    debug(`Testing pipe`, plugins)
    const pipe = pipeBuilder.build(plugins);
    const handlers = (pipe || [])
        .map(plugin => {
            return plugin.handler.bind(plugin, tReq, tRes);
        });

    async.series(handlers, (err) => {
        if (err) {
            logger.warn(`Error processing ${req.originalUrl}, ${err}`);
            return res.status(500).send({ error: err });
        }
        return res.status(200).send({ result: 'ok' });
    });
})
const testServer = http.createServer(app);
testServer.listen(3333, () => {
    const headers = req.body.headers;
    const method = req.body.method;
    const body = req.body.body;
    // todo: const params = req.body.params
    const options = {
        url: `http://localhost:3333`,
        headers: headers,
        method: method
    };
    if (body && method == 'POST') options.json = body;
    request(options).then((testRespondBody) => {
        process.exit()
        return res.status(200).send(testRespondBody);
    }).catch(err => {
        process.exit()
        return res.status(500).send(err)
    });
});