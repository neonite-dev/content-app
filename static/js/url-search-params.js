;(function (w) {
	w.URLSearchParams =
		w.URLSearchParams ||
		function (searchString) {
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this
			self.searchString = searchString
			self.get = function (name) {
				const results = new RegExp('[?&]' + name + '=([^&#]*)').exec(self.searchString)
				if (results == null) {
					return null
				} else {
					return decodeURI(results[1]) || 0
				}
			}
		}
})(window)
