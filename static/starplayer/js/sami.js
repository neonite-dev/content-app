'use strict';
var regexSyncSearch = /<sync/i;
var regexSyncClose = /<sync|<\/body|<\/sami/i;
var regexSyncTime = /<sync[^>]+?start=(\d+)(?:[^>]+?)?>/i;
var regexLineEnding = /[\r\n]/g;
var regexExtractColor = /<[^>]+?color=(#?[^>]+?)(?:\s[^>]+?)?>(.+?)<\/[^>]+?>/gi;
var regexBrTag = /<br\s?\/?>/gi;
var regexTags = /(<([^>]+)>)/ig;
var regexLangTypeSearch = /<p[^>]+?class=..CC>/ig;
var regexLangType = /<p[^>]+?class=(\w+)(?:[^>]+?)?>/i;

function Smi() { }

Smi.prototype.getLangCount = function getLangCount() {
    if (this.langName == null)
        return 0;

    return this.langName.length;
}

Smi.prototype.getLangNames = function getLangNames() {
    return this.langName;
}

Smi.prototype.getLanguage = function getLanguage(langName) {
    if (this.languages == null)
        return null;

    return this.languages[langName];
}

var timeline=[];
var timelinenum=0;
Smi.prototype.add = function add(element, langName) {
    if (this.langName == null)
        this.langName = [];

    if (this.langName.length == 0) {
        this.langName[0] = langName;
    }
    else {
        var find = false;
        for (var i = 0; i < this.langName.length; ++i) {
            if (this.langName[i] == langName)
            {
                find = true;
                break;
            }                
        }

        if(find == false)
            this.langName[this.langName.length] = langName;
    }

    if (this.languages == null)
        this.languages = new Object;

    if (this.languages[langName] == null)
        this.languages[langName] = new Map();
	
    var time = parseInt(element.startTime / 100, 10) * 100; 
	timeline[timelinenum] = time;

    this.languages[langName].set(time, element.content);
	timelinenum++;

}
var returnTime;
Smi.prototype.getTimeline = function getTimeline(time) {
		for(var i=0;i<=timelinenum;i++){
			if(timeline[0]>time){
				returnTime=0;
			}
			if(timeline[i]<=time){
				returnTime=timeline[i];
			}
		}
    return returnTime;
}

/**
 * 파싱
 */
Smi.prototype.parse = function parse(data) {
	var self = this;

	if (typeof data !== 'string') {
		data = data.toString();
		// Buffer 등등...
	}
	
	var elements = self.splitBySync(data);
	if(elements==""){
	return false;
	}
	for (var i = 0; i < elements.length; i++) {
	    var matches = regexLangType.exec(elements[i].content);
	    if (matches === null)
	        continue;
	    
	    elements[i].content = self.replace(elements[i].content);

	    self.add(elements[i], matches[1]);
	}

	return this.langName.length > 0;
	
}

/**
 * <SYNC> 태그로 자름
 */
Smi.prototype.splitBySync = function splitBySync(data) {
	var elements = [];
	while (true) {
		var syncTagIdx = data.search(regexSyncSearch);
		if (syncTagIdx < 0) {
			break;
		}
		 
		var syncCloseTagIdx = data.slice(syncTagIdx + 1).search(regexSyncClose) + 1;
		var element = '';
		if (syncCloseTagIdx > 0) {
			element = data.slice(syncTagIdx, syncTagIdx + syncCloseTagIdx)
			data = data.slice(syncTagIdx + syncCloseTagIdx);
		} else {
			element = data.slice(syncTagIdx);
			data = '';
		}
			
		var matches = regexSyncTime.exec(element);
		if (matches === null) {
			continue;
		}
		
		//var startTime = Number(matches[1]); Number.parseInt(matches[1], 10);
		var startTime = parseInt(matches[1], 10);
		element = element.replace(regexSyncTime, '').replace(regexLineEnding, '');		
		elements.push({
			'content': element,
			'startTime': startTime
		});
	}
	
	return elements;
}

/**
 * 태그들을 잘 처리해줌.
 */
Smi.prototype.replace = function replace(content) {
	var self = this;
	
	if (typeof content !== 'string') {
		return content;
	}
	
	content = content.replace(regexBrTag, '\n');
	content = content.replace(regexExtractColor, function(match, color, content) {
		return '::lt;span style="color:' + color.trim() + '"::gt;' + content + '::lt;/span::gt;';
	});
	
	content = content.replace(regexTags, '');
	content = self.fixTag(content);
	
	return content.trim();
}

Smi.prototype.fixTag = function fixTag(content) {
	if (typeof content !== 'string') {
		return content;
	}
	return content.replace(/::lt;/gi, '<').replace(/::gt;/gi, '>');
}