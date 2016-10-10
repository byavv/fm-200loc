const debug = require('debug')('test')
module.exports = function seedTestData(app) {
    let ApiConfig = app.models.ApiConfig;
    let DriverConfig = app.models.DriverConfig;
    return new Promise((resolve, reject) => {
        DriverConfig.create({
            name: 'test',
            description: 'test',
            settings: {
                param: 'test'
            },
            driverId: 'testDriver'
        }, (err, config) => {
            ApiConfig.create([
                {
                    name: 'route',
                    entry: '/pluginnotexists',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "pluginnotexists",
                            settings: {
                            }
                        }
                    ]
                },
                {
                    name: 'route1',
                    entry: '/test',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "errPlugin",
                            settings: {
                                throwError: true,
                                errorCode: 404
                            }
                        }
                    ]
                },
                {
                    name: 'route11',
                    entry: '/testnotreturn',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "notReturnAnythingPlugin",
                            settings: {
                            }
                        }
                    ]
                },
                {
                    name: 'route2',
                    entry: '/test2',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "errPlugin",
                            settings: {
                                throwError: false,
                            }
                        },
                        {
                            name: "errPlugin",
                            settings: {
                                throwError: true,
                                errorCode: 500
                            }
                        }
                    ]
                },
                {
                    name: 'route3',
                    entry: '/test3',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "errPlugin",
                            settings: {
                                throwError: false,
                            }
                        }
                    ]
                },
                {
                    name: 'route4',
                    entry: '/test4',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "setDynamicPlugin",
                            settings: {

                            }
                        },
                        {
                            name: "simplePlugin",
                            settings: {
                                dynamic: "${dynamic}",
                            }
                        }
                    ]
                },
                {
                    name: 'route5',
                    entry: '/test5',
                    methods: ['GET', "POST"],
                    plugins: [
                        {
                            name: "simplePlugin",
                            settings: {
                                env: "env{SOME_HOST}",
                            }
                        }
                    ]
                },
                {
                    name: 'route6',
                    entry: '/test6',
                    methods: ['GET'],
                    plugins: [
                        {
                            name: "pluginWithDI",
                            settings: {
                                some: "param",
                            },
                            dependencies: { testDriver: config.id.toString() }
                        }
                    ],

                }
            ], (err, configs) => {
                if (err)
                    reject(err);
                resolve(configs);
            })
        });
    });
};