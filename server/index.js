const express = require('express')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV === 'local2'

async function start() {
	const nuxt = new Nuxt(config)
	const { host, port } = nuxt.options.server

	// consola.ready({
	// 	message: `Server start config - config.NODE_ENV: ${process.env.NODE_ENV} config.dev: ${config.dev}`,
	// 	badge: true,
	// })

	if (config.dev) {
		const builder = new Builder(nuxt)
		await builder.build()
	} else {
		try {
			await nuxt.ready()
		} catch (e) {
			console.log(e)
		}
	}

	app.use(nuxt.render)

	app.listen(port, host)
}

start()
