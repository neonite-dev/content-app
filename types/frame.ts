export interface ISoundInfo {
	id: string
	src: string
	loop: { type: boolean; default: false }
	volume: any
	callback: any
	isplaying: boolean
}

export interface ICdnMovie {
	strMCode: string
	strAuthUrl: string
}

export interface IRecorderOption {
	time: { type: number; default: 1 }
	bitRate: { type: number; default: 128 }
	sampleRate: { type: number; default: 44100 }
	backendEndpoint: { type: string }
	buttonColor: { type: string; default: 'green' }

	// callback functions
	afterRecording: { type: Function }
	successfulUpload: { type: Function }
	failedUpload: { type: Function }
	customUpload: { type: Function; default: null }
}

export interface ImageDataItem {
    filename: string;
    imageData: string;
}
