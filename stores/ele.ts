import type { SubjectItem, ISubjectState, TextBookJindo } from '@/types/subject'
import { defineStore } from 'pinia'
import { postData } from '@/api'

export const useSubjectStore = defineStore('subjectStore', {
	state: (): {
		subjectData: ISubjectState
	} => ({
		subjectData: {
			subjectItems: [],
			textBookJindo: [],
			subjectTerms: [
				{ idx: 0, value: 4, name: '겨울방학', ltype: 'T_WINTER_B_Atype' },
				{ idx: 1, value: 1, name: '1학기', ltype: 'T_EBOOK_B' },
				{ idx: 2, value: 3, name: '여름방학', ltype: 'T_SUMMER_B_Atype' },
				{ idx: 3, value: 2, name: '2학기', ltype: 'T_EBOOK_B' },
			],
		},
	}),
	getters: {
		getSubjectData: state => state.subjectData,
	},
	actions: {
		async fetchSubjectData(grade: number, term: number, pageType: string, userName: string) {
			if (process.server) {
				const data = await postData<SubjectItem>('/e_api/contents/SubjectTab_Set', {
					grade,
					term,
					pageType,
					userName,
				})
				if (data) {
					// Object.assign(this.subjectData.subjectItems, data)
					const filterData = (data as any)?.filter((m: any) => m.Subject !== 'W')
					this.subjectData.subjectItems = ([] as any).concat(filterData)
				}
			}
		},
		async fetchTextBookJindoList(
			grade: number,
			term: number,
			subject: string,
			lType?: string,
			userName?: string,
			lChapter?: string,
			Difficulty?: string,
			SelBookType?: string,
		) {
			const items = await postData<TextBookJindo>('/e_api/contents/TextBookJindoList', {
				grade,
				term,
				subject,
				lType,
				userName,
				lChapter,
				Difficulty,
				SelBookType,
			})
			if (items) {
				this.subjectData.textBookJindo = ([] as any).concat(items)
			}
		},
	},
})
