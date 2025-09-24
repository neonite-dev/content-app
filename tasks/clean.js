// clean.js
const fs = require('fs')

function deleteFolderRecursive(path) {
	if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
		fs.readdirSync(path).forEach(function (file, index) {
			const curPath = path + '/' + file

			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath)
			} else {
				// delete file
				fs.unlinkSync(curPath)
			}
		})

		console.log(`Deleting directory "${path}"...`)
		fs.rmdirSync(path)
	}
}
function deleteTargetFile(filePath) {
	// delete file named 'sample.txt'
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath)
		console.log(`Deleting file "${filePath}"...`)
	}
}

console.log('Cleaning working tree...')

deleteFolderRecursive('./node_modules/.cache')
deleteFolderRecursive('./.nuxt')
deleteFolderRecursive('./dist')
deleteFolderRecursive('../deploy/dist')
deleteFolderRecursive('../deploy/.nuxt')
// deleteFolderRecursive('../deploy/iisnode')
deleteFolderRecursive('../deploy/server')
deleteFolderRecursive('../deploy/api')
deleteFolderRecursive('../deploy/plugins')
deleteFolderRecursive('../deploy/static/css')
deleteFolderRecursive('../deploy/static/js')
deleteFolderRecursive('../deploy/static/Include')
deleteTargetFile('../deploy/.env.local')
deleteTargetFile('../deploy/.env.development')
deleteTargetFile('../deploy/.env.production')
deleteTargetFile('../deploy/.env.stage')
deleteTargetFile('../deploy/nuxt.config.js')
deleteTargetFile('../deploy/web.config')
deleteTargetFile('../deploy/web.dev.config')
deleteTargetFile('../deploy/web.stage.config')
deleteTargetFile('../deploy/web.live.config')
deleteTargetFile('../deploy/router.js')
// deleteFolderRecursive('../templates/nuxt')
console.log('Successfully cleaned working tree!')
