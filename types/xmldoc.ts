export interface IfMenuInfo {
	id: number
	type: string
	title: string
	file_path: string
	height: number
	smi_path: string
	ebook_path: string
}

// CJMenuData
export interface IfXmlDoc {
	ui_type: string
	chapter: string
	title: string
	menuIdx: number
	menu: IfMenuInfo[] // m_listMenuDatas
}
