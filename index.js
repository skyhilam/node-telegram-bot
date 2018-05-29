const _ = require('lodash')
const axios = require('axios')
const htmlParser = require('node-html-parser')
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const moment = require('moment-timezone')
const token = process.env.BOT_TOKEN


const api = {
	async getRates() {
		const {data} = await axios.get('https://online.bnu.com.mo/ebank/bnu/ExchangeRates')

		const parsered = htmlParser.parse(data);

		const table = parsered.querySelectorAll('table table')[4]
		const tr = table.querySelectorAll('tr')

		return _.map(tr, tr => {
			return _.map(tr.querySelectorAll('td'), td => {
				return this.format(td.text)
			})
		})	
	},
	format(text) {
		return text
			.replace("\r\n    \t ", '')
			.replace(" \r\n    ", '')
			.replace("\r\n\t\r\n    \t\t", '')
			.replace("\r\n    \t\r\n    \t\t", '')
			.replace("\r\n    \t\t\r\n    ", '')
			.replace("\r\n     \t\r\n    \t\t", '')
			.replace("\r\n    \t\t\r\n    ", '')
			.replace("\r\n    \t\t\r\n    ", '')
			.replace("\r\n     \t ", '')
			.replace("\r\n\t ", '')
			.replace("\r\n     \t ", '')
	},
	async getNZD() {
		const data = await this.getRates()
		return data[10]
	}
}

async function getMessage() {
	const nzd = await api.getNZD()
	const date = moment().tz("Asia/Taipei").format('YYYY-MM-DD')
	const time = moment().tz("Asia/Taipei").format('hh:mm:ss')

	return {
		sell: nzd[9],
		buy: nzd[8],
		message: `BNU ${nzd[0]}\n\rSell ${nzd[9]}\n\rBuy ${nzd[8]}\n\rDate ${date}\n\rTime ${time}`
	}
}

const main = async () => {
	
	
	const bot = new Telegraf(token)

	setInterval(async () => {
		const {message, sell} = await getMessage()
		if (sell < 5.4) {
			bot.telegram.sendMessage(412411088, message)
		}
	}, 10 * 60 * 1000) //10 minutes

	bot.start((ctx) => {
		// console.log(ctx.message.chat.id)
		ctx.reply('Welcome')
	})

	bot.command('/NZD', async (ctx) => {
		const {message} = await getMessage()
		ctx.reply(message)
	})

	bot.startPolling()
}

main()



