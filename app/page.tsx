"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpenText, ChevronRight, FileText, Menu, Search, ShieldCheck, Sparkles, X } from "lucide-react";

type Article = { id: string; section: string; title: string; keywords: string[]; shortAnswer: string; fullAnswer: string; updatedAt: string; sourceUrl?: string };

const fallbackArticles: Article[] = [
  { id: "etrn-signing", section: "Подписание", title: "Кто участвует в подписании ЭТРН?", keywords: ["подписание", "участники", "грузоотправитель", "перевозчик", "получатель"], shortAnswer: "ЭТРН последовательно оформляют участники перевозки в пределах своей ответственности.", fullAnswer: "Карточка подготовлена для демонстрации структуры ответа. После подключения рабочих материалов здесь будет отображаться проверенная инструкция с этапами, ролями и ссылкой на источник.", updatedAt: "18.09.2026" },
  { id: "gis-epd-status", section: "ГИС ЭПД", title: "Как проверить статус электронного перевозочного документа?", keywords: ["гис эпд", "статус", "документ", "проверка"], shortAnswer: "Статус документа показывает, на каком этапе обмена и подписания он находится.", fullAnswer: "В рабочей базе к каждому статусу можно добавить расшифровку, ответственного участника и порядок действий при ошибке.", updatedAt: "18.09.2026" },
  { id: "etrn-correction", section: "Ошибки", title: "Что делать, если в ЭТРН обнаружена ошибка?", keywords: ["ошибка", "исправление", "корректировка", "этрн"], shortAnswer: "Порядок исправления зависит от этапа оформления и текущего статуса документа.", fullAnswer: "Рабочая карточка будет содержать пошаговый сценарий: кто вносит изменение, какие действия выполняют остальные участники и когда создаётся новая версия документа.", updatedAt: "18.09.2026" },
];

const categories = ["Все материалы", "ЭТРН", "ГИС ЭПД", "Подписание", "Ошибки", "Нормативные документы"];

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[^a-zа-я0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
}

function scoreArticle(article: Article, query: string) {
  const words = normalize(query).split(" ").filter(Boolean);
  if (!words.length) return 1;
  const title = normalize(article.title);
  const section = normalize(article.section);
  const keywords = normalize(article.keywords.join(" "));
  const content = normalize(`${article.shortAnswer} ${article.fullAnswer}`);
  return words.reduce((score, word) => score + (title.includes(word) ? 8 : 0) + (keywords.includes(word) ? 5 : 0) + (section.includes(word) ? 4 : 0) + (content.includes(word) ? 2 : 0), 0);
}

function highlight(text: string, query: string) {
  const words = normalize(query).split(" ").filter((word) => word.length > 2);
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(pattern).map((part, index) => words.some((word) => normalize(part) === word) ? <mark key={`${part}-${index}`}>{part}</mark> : part);
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все материалы");
  const [articles, setArticles] = useState<Article[]>(fallbackArticles);
  const [selected, setSelected] = useState<Article | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => { if (Array.isArray(payload.articles) && payload.articles.length) setArticles(payload.articles); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const results = useMemo(() => articles
    .filter((article) => category === "Все материалы" || article.section === category)
    .map((article) => ({ article, score: scoreArticle(article, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article), [articles, category, query]);

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="WAY WIKI — на главную"><span className="brand-mark">W</span><span className="brand-name">WAY <b>WIKI</b></span></a>
        <nav className={menuOpen ? "top-nav is-open" : "top-nav"} aria-label="Основная навигация">
          <a href="#search" onClick={() => setMenuOpen(false)}>Поиск</a><a href="#categories" onClick={() => setMenuOpen(false)}>Разделы</a><a href="#about" onClick={() => setMenuOpen(false)}>О портале</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Открыть меню">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </header>

      <section className="search-shell" id="top">
        <div className="eyebrow"><Sparkles size={15} /> ЭТРН · ГИС ЭПД</div>
        <h1>Найдите точный ответ<br />по электронным перевозочным документам</h1>
        <p className="lead">Проверенные инструкции, разъяснения и нормативные источники в одном поиске.</p>
        <div className="search-box" id="search">
          <Search size={24} aria-hidden="true" />
          <input autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Введите вопрос, термин или название документа" aria-label="Поиск по базе WAY WIKI" />
          {query && <button className="clear-button" onClick={() => setQuery("")} aria-label="Очистить поиск"><X size={18} /></button>}
          <span className="shortcut">⌘ K</span>
        </div>
        <div className="category-row" id="categories" aria-label="Разделы базы знаний">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "category active" : "category"}>{item}</button>)}
        </div>
      </section>

      <section className="results-section" aria-live="polite">
        <div className="results-heading"><div><span className="section-label">{query ? "Результаты поиска" : "Рекомендуемые материалы"}</span><h2>{query ? `Найдено: ${results.length}` : "С чего начать"}</h2></div><span className="verified"><ShieldCheck size={16} /> Актуальная база</span></div>
        {results.length ? <div className="result-grid">
          {results.map((article, index) => <article className="result-card" key={article.id} onClick={() => setSelected(article)}>
            <div className="card-topline"><span className="result-number">{String(index + 1).padStart(2, "0")}</span><span className="result-section">{article.section}</span><ArrowUpRight size={18} /></div>
            <h3>{highlight(article.title, query)}</h3><p>{highlight(article.shortAnswer, query)}</p>
            <div className="card-footer"><span>Обновлено {article.updatedAt}</span><button>Открыть <ChevronRight size={16} /></button></div>
          </article>)}
        </div> : <div className="empty-state"><Search size={28} /><h3>Ничего не найдено</h3><p>Попробуйте сократить запрос или выбрать другой раздел.</p></div>}
      </section>

      <section className="about-strip" id="about">
        <div><BookOpenText size={22} /><span><b>Единая база</b>Инструкции и ответы собраны по темам</span></div>
        <div><FileText size={22} /><span><b>Первоисточники</b>Ссылки на документы и материалы</span></div>
        <div><ShieldCheck size={22} /><span><b>Контроль актуальности</b>Дата проверки указана в каждой карточке</span></div>
      </section>
      <footer><span>© 2026 WAY WIKI</span><span>ЭТРН и ГИС ЭПД</span></footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
        <article className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Закрыть"><X size={20} /></button><span className="detail-section">{selected.section}</span>
          <h2 id="detail-title">{selected.title}</h2><p className="detail-lead">{selected.shortAnswer}</p><div className="detail-body">{selected.fullAnswer}</div>
          <div className="detail-meta"><span>Актуально на {selected.updatedAt}</span>{selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Открыть источник <ArrowUpRight size={15} /></a>}</div>
        </article>
      </div>}
    </main>
  );
}
