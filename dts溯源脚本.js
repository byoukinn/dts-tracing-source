/**
 * scriptName：dts溯源脚本
 * author：BK
 * lastEdit：2020-8-26 13:20:50
 * feature：
 	1.全自动点击溯源，打开来源节点，控制台输入auto()就可以实现
 	2.从sql分析排查哪些字段有别名
 	3.在溯源界面，无别名或者别名相同的情况，标绿色，需要修改的部分标红色，修改后的部分标蓝色
 	4.增加全量版本的sql解析器，不通过\n符来拆除行，增加了对多行case when的兼容
 	5.增加快捷键，打开来源节点页面，按alt+x就自动执行脚本
 */
// 嵌入样式
var styleNode = document.createElement('style')
styleNode.appendChild(document.createTextNode('.marked-row{background: pink}.normal-row{background: lightgreen}.modified-row{background: lightblue}'))
document.head.appendChild(styleNode)
let origin = ''
function auto() {
	var $ = sel => document.querySelectorAll(sel);
	var l = $('.ant-tabs-nav .ant-tabs-tab');
	l[l.length - 3].click();
	var iframe = $('.ant-modal-body iframe')[0]
	setTimeout(function () {
		var sql = iframe.contentWindow.getCode()
		origin = sql
		var mismatchColNums = getMismatchAndPrintRelation(sql)
		setTimeout(function() {
			l[l.length - 2].click();
			$('.ant-tabs-tabpane-active .ant-table-row-collapsed').forEach(e => e.click());
			$('.ant-tabs-tabpane-active .ant-tabs-tab[aria-selected=false]').forEach(e => e.click());
			$('.ant-tabs-tabpane-active .ant-tabs-large .ant-btn.ant-btn-primary').forEach(e => e.click());
			$('.ant-tabs-tabpane-active .ant-table-row-expanded').forEach(e => e.click());
			$('.ant-tabs-tabpane-active .ant-table-row-expand-icon-cell').forEach((e, i) => {
				mismatchColNums.includes(i) 
						? e.classList.add('marked-row')
						: e.classList.add('normal-row')
				e.querySelector('.ant-table-row-expand-icon').addEventListener('click', function() {e.classList.add('modified-row')})
			})
 			}, 1000)
	}, 200)
}

function getMismatchAndPrintRelation( sql ) {
	var a_FuncReg = /\((\w*\.?\w+),.*[ASas]{2}\s+(\w+)/ // 有函数 跟逗号 写as
	var n_FuncReg = /\((\w*\.?\w+),.*\s+(\w+)/ // 有函数  跟逗号 没写as
	var a_FuncReg1 = /\((\w*\.?\w+),?.*[ASas]{2}\s+(\w+)/ // 有函数 写as
	var n_FuncReg1 = /\((\w*\.?\w+),?.*\s+(\w+)/ // 有函数 没写as
	var a_CaseReg = /case\s*when\s*(\w*.?\w+).*[ASas]{2}\s+(\w+)/ // case when的 写as
	var n_CaseReg = /case\s*when\s*(\w*.?\w+).*\s+(\w+)/ // case when的 没写as
	var a_QuotaReg = /(\'?\w*\.?\w+\'?).*[ASas]{2}\s+(\w+)/ // 前面是字符串 写as
	var n_QuotaReg = /(\'?\w*\.?\w+\'?).*\s+(\w+)/ // 前面是字符串 没写as
	var regs = [
		a_FuncReg ,
		n_FuncReg ,
		a_FuncReg1,
		n_FuncReg1,
		a_CaseReg ,
		n_CaseReg ,
		a_QuotaReg,
		n_QuotaReg,
	]
	// 数据分组处理
	let arr = splitSql(sql.substr(7, sql.toLowerCase().indexOf('from')-7).trim())
	let colNums = []
	// 显示
	let datas = []
	let found = false
	for (var k = 0; k < arr.length; k++) {
		for (var i = 0; i < regs.length; i++) {
			var s = arr[k].match(regs[i])
			if (s && s.length) {
				if (s[1] != s[2] && s[1].indexOf("'")) {
					found = true
					datas.push({'源表': s[1], '目标': s[2]})
					colNums.push(k)
				}
				break
			}
		}
	}
	if (found) {
		console.table(datas, ['源表', '目标'])
	} else {
		// NO AS OR STAR
		console.groupCollapsed('%cNAOS%c没有对比项或者原sql是星号(点此展开原sql', 'padding:2px 4px;background: greenyellow', 'padding:2px 4px;background: #666;color:white')
		console.log(origin)
		console.groupEnd()
	}
	return colNums
}

function splitSql(sql) {
	var stack = []
	var ret = []
	var start = 0, cnt = 0
	var prevChar = ''
	var nextChar = ''
	for (i of sql) {
	    cnt += 1
    	var prevChar = cnt > 0 ? sql[cnt-2] : '' 
		var nextChar = cnt != sql.length ? sql[cnt] : '' 
	    // console.log(cnt, i)
	    switch (i) {
	        case '(': stack.push(1); break;
	        case ')': stack.pop(); break;
	        case '-': if (prevChar == '-') {stack.push(2)}; break;
	        case '/': prevChar == '*' ? (stack.pop(), start=cnt) : nextChar == '*' ? stack.push(2) : undefined; break;
	        case '\n': if (stack[stack.length-1] == 2) {stack.pop(); start=cnt}; break;
	        case ',': if (!stack.length) {
	            ret.push(sql.substr(start, cnt-1-start).trim()); 
	            start = cnt;
	        }; break;
	    }
	}
	var r = sql.substr(start, sql.length)
	ret.push(r.substr(0, r.indexOf('--')-1).trim()); 
	return ret
}

window.addEventListener("keyup", e => {
    if(e.code == 'KeyX' && e.altKey) {auto()}
})

// 压缩后的代码
function auto(){var t=function(t){return document.querySelectorAll(t)},e=t(".ant-tabs-nav .ant-tabs-tab");e[e.length-3].click();var a=t(".ant-modal-body iframe")[0];setTimeout(function(){var n=a.contentWindow.getCode();origin=n;var r=getMismatchAndPrintRelation(n);setTimeout(function(){e[e.length-2].click(),t(".ant-tabs-tabpane-active .ant-table-row-collapsed").forEach(function(t){return t.click()}),t(".ant-tabs-tabpane-active .ant-tabs-tab[aria-selected=false]").forEach(function(t){return t.click()}),t(".ant-tabs-tabpane-active .ant-tabs-large .ant-btn.ant-btn-primary").forEach(function(t){return t.click()}),t(".ant-tabs-tabpane-active .ant-table-row-expanded").forEach(function(t){return t.click()}),t(".ant-tabs-tabpane-active .ant-table-row-expand-icon-cell").forEach(function(t,e){r.includes(e)?t.classList.add("marked-row"):t.classList.add("normal-row"),t.querySelector(".ant-table-row-expand-icon").addEventListener("click",function(){t.classList.add("modified-row")})})},1e3)},200)}function getMismatchAndPrintRelation(t){for(var e=/\((\w*\.?\w+),.*[ASas]{2}\s+(\w+)/,a=/\((\w*\.?\w+),.*\s+(\w+)/,n=/\((\w*\.?\w+),?.*[ASas]{2}\s+(\w+)/,r=/\((\w*\.?\w+),?.*\s+(\w+)/,o=/case\s*when\s*(\w*.?\w+).*[ASas]{2}\s+(\w+)/,c=/case\s*when\s*(\w*.?\w+).*\s+(\w+)/,s=/(\'?\w*\.?\w+\'?).*[ASas]{2}\s+(\w+)/,i=/(\'?\w*\.?\w+\'?).*\s+(\w+)/,l=[e,a,n,r,o,c,s,i],d=splitSql(t.substr(7,t.toLowerCase().indexOf("from")-7).trim()),u=[],w=[],b=!1,p=0;p<d.length;p++)for(var h=0;h<l.length;h++){var f=d[p].match(l[h]);if(f&&f.length){f[1]!=f[2]&&f[1].indexOf("'")&&(b=!0,w.push({"源表":f[1],"目标":f[2]}),u.push(p));break}}return b?console.table(w,["源表","目标"]):(console.groupCollapsed("%cNAOS%c没有对比项或者原sql是星号(点此展开原sql","padding:2px 4px;background: greenyellow","padding:2px 4px;background: #666;color:white"),console.log(origin),console.groupEnd()),u}function splitSql(t){var e=[],a=[],n=0,r=0,o="",c=!0,s=!1,l=void 0;try{for(var d,u=t[Symbol.iterator]();!(c=(d=u.next()).done);c=!0){i=d.value,r+=1;var o=r>0?t[r-2]:"";switch(r!=t.length&&t[r],i){case"(":e.push(1);break;case")":e.pop();break;case"-":"-"==o&&e.push(2);break;case"/":"*"==o&&(e.pop(),n=r);break;case"\n":2==e[e.length-1]&&(e.pop(),n=r);break;case",":e.length||(a.push(t.substr(n,r-1-n).trim()),n=r)}}}catch(t){s=!0,l=t}finally{try{!c&&u.return&&u.return()}finally{if(s)throw l}}var w=t.substr(n,t.length);return a.push(w.substr(0,w.indexOf("--")-1).trim()),a}var styleNode=document.createElement("style");styleNode.appendChild(document.createTextNode(".marked-row{background: pink}.normal-row{background: lightgreen}.modified-row{background: lightblue}")),document.head.appendChild(styleNode);var origin="";window.addEventListener("keyup",function(t){"KeyX"==t.code&&t.altKey&&auto()});