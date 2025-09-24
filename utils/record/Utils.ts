export default function convertTimeMMSS(seconds: number) {
	if (!seconds) {
		return null
	}
	return new Date(seconds * 1000).toISOString().substr(14, 5)
}
