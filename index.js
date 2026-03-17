const mineflayer = require('mineflayer')
const http = require('http')

// Small web server so UptimeRobot has a URL to ping
http.createServer((req, res) => {
    res.writeHead(200)
    res.end('Bot is running!')
}).listen(process.env.PORT || 3000, () => console.log('Web server running!'))

// Prevent any single crash from taking down the whole process
process.on('uncaughtException', (err) => {
    console.log('Uncaught error (keeping process alive):', err.message)
})

function createBot(username, delay = 5000) {
    setTimeout(() => {
        console.log(`${username} attempting to connect...`)

        let bot
        let afkInterval = null

        try {
            bot = mineflayer.createBot({
                host: 'FrigusPippo.aternos.me',
                port: 59506,
                username: username,
                version: '1.21.11',
                hideErrors: false
            })
        } catch (err) {
            console.log(`${username} failed to create bot, retrying in 15s...`)
            createBot(username, 15000)
            return
        }

        bot.on('login', () => {
            console.log(`${username} has joined the server!`)

            // Clear any existing interval before creating a new one
            if (afkInterval) clearInterval(afkInterval)

            afkInterval = setInterval(() => {
                const yaw = Math.random() * Math.PI * 2
                const pitch = (Math.random() - 0.5) * 0.5
                bot.look(yaw, pitch, false)
                bot.setControlState('forward', true)
                bot.setControlState('jump', true)
                setTimeout(() => bot.setControlState('jump', false), 500)
                setTimeout(() => bot.setControlState('forward', false), 2000)
            }, 30000)
        })

        bot.on('end', () => {
            console.log(`${username} disconnected. Reconnecting in 10 seconds...`)
            if (afkInterval) {
                clearInterval(afkInterval)
                afkInterval = null
            }
            createBot(username, 10000)
        })

        bot.on('error', (err) => {
            console.log(`${username} error: ${err.message}`)
            if (afkInterval) {
                clearInterval(afkInterval)
                afkInterval = null
            }
        })

    }, delay)
}

// Stagger the two bots so they don't reconnect at the same time
createBot('AFK_Bot', 1000)
createBot('AFK_Bot_2', 8000)
