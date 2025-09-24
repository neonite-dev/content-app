import convertTimeMMSS from './Utils'
import WavEncoder from './WavEncoder'

export default class Recorder {
	beforeRecording: any
	pauseRecording: any
	afterRecording: any
	micFailed: any
	encoderOptions: { bitRate: any; sampleRate: any }
	bufferSize: number
	records: any
	isPause: boolean
	isRecording: boolean
	duration: number
	volume: number
	wavSamples: any
	_duration: number
	stream: any
	input: any
	processor: any
	context: any
	onaudioprocessCallback?: any
	constructor(options = {} as any) {
		this.beforeRecording = options.beforeRecording
		this.pauseRecording = options.pauseRecording
		this.afterRecording = options.afterRecording
		this.micFailed = options.micFailed
		this.onaudioprocessCallback = options.onaudioprocessCallback

		this.encoderOptions = {
			bitRate: options.bitRate,
			sampleRate: options.sampleRate,
		}

		this.bufferSize = 4096
		this.records = []

		this.isPause = false
		this.isRecording = false

		this.duration = 0
		this.volume = options.volume

		this.wavSamples = []

		this._duration = 0
	}

	start() {
		const constraints = {
			video: false,
			audio: {
				channelCount: 1,
				echoCancellation: false,
			},
		}

		this.beforeRecording && this.beforeRecording('start recording')

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(this._micCaptured.bind(this))
			.catch(this._micError.bind(this))

		this.isPause = false
		this.isRecording = true
	}

	startStt() {
		const constraints = {
			video: false,
			audio: {
				channelCount: 1,
				echoCancellation: false,
			},
		}

		this.beforeRecording && this.beforeRecording('start recording')

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(this._micCapturedStt.bind(this))
			.catch(this._micError.bind(this))

		this.isPause = false
		this.isRecording = true
	}

	async stop() {
		this.stream.getTracks().forEach((track: { stop: () => any }) => track.stop())
		this.input.disconnect()
		this.processor.disconnect()
		this.context.close()

		let record = null as any

		const wavEncoder = await new WavEncoder({
			bufferSize: this.bufferSize,
			sampleRate: this.encoderOptions.sampleRate,
			samples: this.wavSamples,
		})
		record = wavEncoder.finish() as any
		this.wavSamples = []
		if (record) {
			record.duration = convertTimeMMSS(this.duration) as any
			this.records?.push(record)

			this._duration = 0
			this.duration = 0

			this.isPause = false
			this.isRecording = false

			this.afterRecording && this.afterRecording(record)
		}
	}

	async stopStt() {
		this.stream.getTracks().forEach((track: { stop: () => any }) => track.stop())
		this.input.disconnect()
		this.processor.disconnect()
		this.context.close()

		let record = null as any

		const wavEncoder = await new WavEncoder({
			bufferSize: this.bufferSize,
			sampleRate: this.encoderOptions.sampleRate,
			samples: this.wavSamples,
		})
		record = wavEncoder.finishStt() as any
		this.wavSamples = []
		if (record) {
			record.duration = convertTimeMMSS(this.duration) as any
			this.records?.push(record)

			this._duration = 0
			this.duration = 0

			this.isPause = false
			this.isRecording = false

			this.afterRecording && this.afterRecording(record)
		}
	}

	pause() {
		this.stream.getTracks().forEach((track: { stop: () => any }) => track.stop())
		this.input.disconnect()
		this.processor.disconnect()

		this._duration = this.duration
		this.isPause = true

		this.pauseRecording && this.pauseRecording('pause recording')
	}

	recordList() {
		return this.records
	}

	lastRecord() {
		return this.records.slice(-1).pop()
	}

	_micCaptured(stream: any) {
		this.context = new (window.AudioContext || window.AudioContext)() // window.webkitAudioContext
		this.duration = this._duration
		this.input = this.context.createMediaStreamSource(stream)
		this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1)
		this.stream = stream

		this.processor.onaudioprocess = (ev: {
			inputBuffer: { getChannelData: (arg0: number) => any }
		}) => {
			const sample = ev.inputBuffer.getChannelData(0)
			let sum = 0.0

			this.wavSamples.push(new Float32Array(sample))

			for (let i = 0; i < sample.length; ++i) {
				sum += sample[i] * sample[i]
			}

			this.duration =
				parseFloat(this._duration.toString()) + parseFloat(this.context.currentTime.toFixed(2))
			this.volume =
				this.volume === 0 ? (Math.sqrt(sum / sample.length).toFixed(2) as any) : this.volume
		}

		this.input.connect(this.processor)
		this.processor.connect(this.context.destination)
	}

	_micCapturedStt(stream: any) {
		this.context = new (window.AudioContext || window.AudioContext)() // window.webkitAudioContext
		this.duration = this._duration
		this.input = this.context.createMediaStreamSource(stream)
		this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1)
		this.stream = stream
		const callback = this.onaudioprocessCallback
		let roofCnt = 0
		this.processor.onaudioprocess = (ev: {
			inputBuffer: { getChannelData: (arg0: number) => any }
		}) => {
			const sample = ev.inputBuffer.getChannelData(0)
			let sum = 0.0

			this.wavSamples.push(new Float32Array(sample))
			// this.wavSamples.push(new Float64Array(sample))
			// this.wavSamples.push(new Uint32Array(sample))
			// this.wavSamples.push(new Uint8Array(sample))

			for (let i = 0; i < sample.length; ++i) {
				sum += sample[i] * sample[i]
			}

			this.duration =
				parseFloat(this._duration.toString()) + parseFloat(this.context.currentTime.toFixed(2))
			this.volume =
				this.volume === 0 ? (Math.sqrt(sum / sample.length).toFixed(2) as any) : this.volume
			if (callback) {
				// if (roofCnt % 10 === 0 && roofCnt <= 150) {
				// 	callback(sample)
				// }
				if (roofCnt < 150) {
					callback(sample, this.wavSamples)
				}
				roofCnt = roofCnt + 1
			}
		}

		this.input.connect(this.processor)
		this.processor.connect(this.context.destination)
	}

	_micError(error: any) {
		this.micFailed && this.micFailed(error)
	}
}
