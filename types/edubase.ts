export interface IEdubaseInfo {
	isTest: boolean
	isLecture: boolean
	isSimilar: boolean
	isChallenge: boolean
	isTemp: boolean
	userId: string
	mCode: string
	pageType: string
	testType: string
	strComplete: string
	questionNumber?: string // 문항번호 (선택적) 
}

export interface ITestJsonData {
	SEQ: number
	WrongYN?: string
	code: number
	head: string
	number: string
	result: string
	score: number
	tail: string
	userinput: string
}

export interface ILectureInfo {
	pageType: string
	LB_TIME?: any
	LM_Value: string
	L_TYPE?: any
	RealMarkerLB_TIME?: any
	intLM_IDX: number
	strLM_IntroType: string
	strLM_MediaType: string
	strLM_Title?: any
	strL_Lesson?: any
	strMCode: string
}
