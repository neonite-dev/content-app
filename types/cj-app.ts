export interface CJLectureTitleInfo {
	Grade: number
	Term: number
	Subject: string
	L_info: string
	L_Title: string
	L_Type: string
	C_VALUE: string
	L_Template: string
	NoteYN: string
	JindoYN: string
	HisYN: string
	TestYn: string
	TestStudyYn: string
	BogangYN: string
	PaperType: string
	SPenYN: string
	MyGrade: string
	MediaResetHis: string
	TestResetHis: string
	TimeFinish: number
	TextPage: string
	QuizTitle: string
	L_Level: string
	CoreWordIDX: string
	CoreWord: string
	PocketYN: string
	Point: number
	TestPoint: number
	SimilarPoint: number
	ChallengePoint: number
}

export interface CJNetStudyInfo {
	mCode: string
	comYN: string
	introType: string
	step: number
	mediaTime: number
	playTime: number
	studySec: number
	startDate?: Date
	endDate?: Date
	lastYN: string
	pageType: string
	id: string
	data?: null
	status: string
	score: number
}

export interface CJMenuData {
	// Fields : MenuData
	id: string
	type: number
	title: string
	titleCode: string
	filePath: string
	smiPath: string
	ebookPath: string

	// Fields : StudyData
	status: number // 0:잠김,1:진행,2:완료
	step: number
	playTime: number
	mediaTime: number
	contentHeight: number
	strData: string
	calStartTime?: Date

	// Fiedls : StudyDataMiddle
	stepMiddle: string
	intro: string
	pageType: string

	score: number
}

export interface CJListMenuDatas {
	ui_type: string
	chapter: string
	title: string
	entry_app: boolean
	test_title_type: number
	menuIdx: number
	cjMenuDatas: CJMenuData[]
}

export interface CJConfigInfo {
	mCode: string
	LM_VALUE: string
	UpdateDate?: Date
	OP_VALUE: string
	CoreWord: string
	Version: string
	TestYN: string
	TestStudyYN: string
	SimilarYN: string
	SimilarStudyYN: string
	ChallengeYN: string
	ChallengeStudyYN: string
	SttType: string
	SttModel: string
}
