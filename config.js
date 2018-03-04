module.exports = {
    oauth: {
        db_uri: 'mongodb://localhost:27017/unit-test-ras',
        port: 3001,
        url: '127.0.0.1'
    },
    redis: {
        port: 6379,
        host: '127.0.0.1',
        family: 4,
        password: '',
        db: 0
    },
    resourse_server: {
        port: 3000,
        url: '127.0.0.1'
    }
}