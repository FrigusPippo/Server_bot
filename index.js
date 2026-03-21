const mineflayer = require('mineflayer')
const http = require('http')
const https = require('https')

const PORT = process.env.PORT || 3000
const SELF_URL = process.env.RENDER_EXTERNAL_URL

// BOT_PAIR=1 runs AFK_Bot + AFK_Bot_2
// BOT_PAIR=2 runs AFK_Bot_3 + AFK_Bot_4
// No BOT_PAIR set = run all four (Replit)
const pair = process.env.BOT_PAIR === '1'
    ? ['AFK_Bot', 'AFK_Bot_2']
    : process.env.BOT_PAIR === '2'
    ? ['AFK_Bot_3', 'AFK_Bot_4']
    : ['AFK_Bot', 'AFK_Bot_2', 'AFK_Bot_3', 'AFK_Bot_4']

// Small web server so external monitors have a URL to ping
http.createServer((req, res) => {
    res.writeHead(200)
    res.end('Bot is running!')
}).listen(PORT, () => console.log('Web server running!'))

// Self-ping every 4 minutes to stay alive
if (SELF_URL) {
    setInterval(() => {
        https.get(SELF_URL, (res) => {
            console.log(`Self-ping OK: ${res.statusCode}`)
        }).on('error', (err) => {
            console.log(`Self-ping failed: ${err.message}`)
        })
    }, 4 * 60 * 1000)
    console.log(`Self-pinging ${SELF_URL} every 4 minutes`)
}

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

pair.forEach((username, i) => createBot(username, 1000 + i * 7000))
