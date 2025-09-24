export interface SubjectItem {
	Subject: string
	SubjectAliasName: string
	TabOrder: number
	RowNum: number
	SelSubject: string
}

export interface TextBookJindo {
	mcode: string
	LecCode: string
	lChapter: number
	lTitle: string
	U_Type: string
	U_MChapter: number
	mTitle: string
	L_TextPage: string
	L_Type: string
	Term: number
	L_Template: string
	mTitleInfro: string
	Seq: number
	Subject: string
	MediaChk: string
	MediaStudyDate: string
	Score: number
	OkChk: string
	TestStudyDate: string
	BogangChk: string
	BogangScore: number
	BogangType: string
	BogangeStudyDate: string
	PaperType: string
	TestYN: string
	MediaYN: string
	BogangTestYN: string
	TopTitle: string
	EngText: string
	TextBookType: string
	LecGrade: number
	IntegrationYN: string
	LM_Value: string
	BookReportYN: string
	BookReportDate: string
	L_StartDate: string
	AI_Sort: string
	likeScore: string
	likeRegDate: string
	MediaHisCnt: number
	puzzle_LChapter: string
	avgScore: string
	L_SEQ: number
}

export interface ISubjectState {
	subjectItems: SubjectItem[]
	textBookJindo: TextBookJindo[]
	subjectTerms: any // Object[]
}
