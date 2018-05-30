module.exports = {
    oauth: {
        port: 3001,
        url: '127.0.0.1',
        access_token_expires: 300, // 5m
        refresh_token_expires: 86400 // 24h
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