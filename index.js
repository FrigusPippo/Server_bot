const mineflayer = require('mineflayer')
const http = require('http')

// Small web server so UptimeRobot has a URL to ping
http.createServer((req, res) => {
    res.writeHead(200)
    res.end('Bot is running!')
}).listen(3000, () => console.log('Web server running on port 3000'))


function createBot() {
    const bot = mineflayer.createBot({
        host: 'FrigusPippo.aternos.me',
        port: 59506,
        username: 'AFK_Bot',
        version: '1.21.1'
    })

    bot.on('login', () => {
        console.log('Bot has joined the server!')
    })

    // Auto-reconnect if kicked or server restarts
    bot.on('end', () => {
        console.log('Bot disconnected. Reconnecting in 30 seconds...')
        setTimeout(createBot, 30000)
    })

    bot.on('error', (err) => console.log(err))
}

createBot()
