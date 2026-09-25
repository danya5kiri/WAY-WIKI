const fallbackArticles = [
  {id:"etrn-signing",section:"Подписание",title:"Кто участвует в подписании ЭТРН?",keywords:["подписание","участники","грузоотправитель","перевозчик","получатель"],shortAnswer:"ЭТРН последовательно оформляют участники перевозки в пределах своей ответственности.",fullAnswer:"Карточка подготовлена для демонстрации структуры ответа. После подключения рабочих материалов здесь будет отображаться проверенная инструкция с этапами, ролями и ссылкой на источник.",updatedAt:"18.09.2026"},
  {id:"gis-epd-status",section:"ГИС ЭПД",title:"Как проверить статус электронного перевозочного документа?",keywords:["гис эпд","статус","документ","проверка"],shortAnswer:"Статус документа показывает, на каком этапе обмена и подписания он находится.",fullAnswer:"В рабочей базе к каждому статусу можно добавить расшифровку, ответственного участника и порядок действий при ошибке.",updatedAt:"18.09.2026"},
  {id:"etrn-correction",section:"Ошибки",title:"Что делать, если в ЭТРН обнаружена ошибка?",keywords:["ошибка","исправление","корректировка","этрн"],shortAnswer:"Порядок исправления зависит от этапа оформления и текущего статуса документа.",fullAnswer:"Рабочая карточка будет содержать пошаговый сценарий: кто вносит изменение, какие действия выполняют остальные участники и когда создаётся новая версия документа.",updatedAt:"18.09.2026"}
];

let articles = fallbackArticles;
let category = "Все материалы";
const queryInput = document.querySelector("#query");
const resultsNode = document.querySelector("#results");
const categoriesNode = document.querySelector("#categories");
const modal = document.querySelector("#modal");

function normalize(value="") { return value.toLocaleLowerCase("ru-RU").replaceAll("ё","е").replace(/[^a-zа-я0-9\s]/gi," ").replace(/\s+/g," ").trim(); }
function scoreArticle(article,query) {
  const words=normalize(query).split(" ").filter(Boolean); if(!words.length) return 1;
  const title=normalize(article.title),section=normalize(article.section),keywords=normalize((article.keywords||[]).join(" ")),content=normalize(`${article.shortAnswer} ${article.fullAnswer}`);
  return words.reduce((score,word)=>score+(title.includes(word)?8:0)+(keywords.includes(word)?5:0)+(section.includes(word)?4:0)+(content.includes(word)?2:0),0);
}
function escapeHtml(value="") { return value.replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]); }
function highlight(value,query) {
  const words=normalize(query).split(" ").filter(word=>word.length>2); let safe=escapeHtml(value||"");
  if(!words.length) return safe;
  const pattern=new RegExp(`(${words.map(word=>word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})`,"gi");
  return safe.replace(pattern,"<mark>$1</mark>");
}
function renderCategories() {
  const categories=["Все материалы",...new Set(articles.map(article=>article.section)),"Нормативные документы"].filter((item,index,array)=>array.indexOf(item)===index);
  categoriesNode.innerHTML=categories.map(item=>`<button class="category${item===category?" active":""}" data-category="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
  categoriesNode.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{category=button.dataset.category; renderCategories(); renderResults();}));
}
function renderResults() {
  const query=queryInput.value;
  const matches=articles.filter(article=>category==="Все материалы"||article.section===category).map(article=>({article,score:scoreArticle(article,query)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).map(item=>item.article);
  document.querySelector("#result-label").textContent=query?"Результаты поиска":"Рекомендуемые материалы";
  document.querySelector("#result-title").textContent=query?`Найдено: ${matches.length}`:"С чего начать";
  if(!matches.length){resultsNode.innerHTML='<div class="empty-state"><span class="search-icon">⌕</span><h3>Ничего не найдено</h3><p>Попробуйте сократить запрос или выбрать другой раздел.</p></div>';return;}
  resultsNode.innerHTML=matches.map((article,index)=>`<article class="result-card" data-id="${escapeHtml(article.id)}"><div class="card-topline"><span class="result-number">${String(index+1).padStart(2,"0")}</span><span class="result-section">${escapeHtml(article.section)}</span><span class="arrow">↗</span></div><h3>${highlight(article.title,query)}</h3><p>${highlight(article.shortAnswer,query)}</p><div class="card-footer"><span>Обновлено ${escapeHtml(article.updatedAt)}</span><button>Открыть ›</button></div></article>`).join("");
  resultsNode.querySelectorAll("article").forEach(card=>card.addEventListener("click",()=>openArticle(card.dataset.id)));
}
function openArticle(id) {
  const article=articles.find(item=>item.id===id); if(!article) return;
  document.querySelector("#detail-section").textContent=article.section; document.querySelector("#detail-title").textContent=article.title; document.querySelector("#detail-lead").textContent=article.shortAnswer; document.querySelector("#detail-body").textContent=article.fullAnswer; document.querySelector("#detail-date").textContent=`Актуально на ${article.updatedAt}`;
  const source=document.querySelector("#detail-source"); source.hidden=!article.sourceUrl; if(article.sourceUrl) source.href=article.sourceUrl;
  modal.hidden=false; document.body.classList.add("modal-open"); document.querySelector("#modal-close").focus();
}
function closeModal(){modal.hidden=true;document.body.classList.remove("modal-open");}
queryInput.addEventListener("input",renderResults);
document.querySelector("#clear-query").addEventListener("click",()=>{queryInput.value="";queryInput.focus();renderResults();});
document.querySelector("#modal-close").addEventListener("click",closeModal); modal.addEventListener("click",event=>{if(event.target===modal)closeModal();});
document.addEventListener("keydown",event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();queryInput.focus();}if(event.key==="Escape"&&!modal.hidden)closeModal();});
document.querySelector("#menu-button").addEventListener("click",()=>document.querySelector("#top-nav").classList.toggle("is-open"));
document.querySelectorAll(".top-nav a").forEach(link=>link.addEventListener("click",()=>document.querySelector("#top-nav").classList.remove("is-open")));

fetch("data.json",{cache:"no-store"}).then(response=>response.ok?response.json():Promise.reject()).then(payload=>{const loaded=Array.isArray(payload)?payload:payload.articles;if(Array.isArray(loaded)&&loaded.length)articles=loaded;}).catch(()=>undefined).finally(()=>{renderCategories();renderResults();});
