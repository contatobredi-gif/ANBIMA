import React, { useState } from 'react';
import { Article } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Newspaper, 
  Search, 
  Mail, 
  Check, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  X,
  Sparkles,
  Calendar
} from 'lucide-react';

interface UpdatesCenterProps {
  articles: Article[];
  newsletterSubscribed: boolean;
  onNewsletterToggle: (email: string) => void;
}

export const UpdatesCenter: React.FC<UpdatesCenterProps> = ({
  articles,
  newsletterSubscribed,
  onNewsletterToggle
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [emailInput, setEmailInput] = useState<string>('rafael.martins@exemplo.com.br');
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const categories = ['Todas', 'Orientações de Estudo', 'Dicas da Prova', 'Alterações no Edital'];

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'Todas' || art.category === selectedCategory;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNewsletterToggle(emailInput);
    setNewsletterMessage(newsletterSubscribed ? 'Inscrição cancelada com sucesso.' : 'Inscrição confirmada! Preferência salva no LocalStorage.');
    setTimeout(() => setNewsletterMessage(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Editorial Pedagógico
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Bredi Exam Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Central de Atualizações & Conteúdos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Artigos técnicos, cronogramas de estudo e orientações fundamentadas para o exame CPA.
          </p>
        </div>
      </div>

      {/* Newsletter Simulation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Boletim Semanal de Estudos</h4>
            <p className="text-xs text-zinc-500">
              Receba análises das questões mais erradas e resumos de novas resoluções.
            </p>
            {newsletterMessage && (
              <span className="text-xs font-semibold text-emerald-700 mt-1 block">
                {newsletterMessage}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 flex-shrink-0">
          <input
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder="Seu e-mail..."
            className="text-xs px-3 py-2 rounded-lg border border-zinc-300 w-56 outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              newsletterSubscribed
                ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {newsletterSubscribed ? 'Inscrito (Cancelar)' : 'Inscrever-se'}
          </button>
        </form>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar artigo ou assunto..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            onClick={() => setReadingArticle(article)}
            className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors mb-2 leading-snug">
                {article.title}
              </h3>

              <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span>{article.date} · {article.author}</span>
              <span className="font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Ler artigo <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reading Article Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative flex flex-col max-h-[85vh]">
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto flex-1 pr-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {readingArticle.category}
              </span>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-2 mb-2 leading-snug">
                {readingArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-zinc-400 pb-4 border-b border-zinc-100 mb-5">
                <span>{readingArticle.date}</span>
                <span>·</span>
                <span>{readingArticle.readTime} de leitura</span>
                <span>·</span>
                <span>{readingArticle.author}</span>
              </div>

              <div className="text-sm text-zinc-700 leading-relaxed space-y-4">
                <p className="font-medium text-zinc-900 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  {readingArticle.summary}
                </p>
                <p>{readingArticle.content}</p>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900">
                  <strong>Dica de Fixação:</strong> Pratique este tema resolvendo 10 a 20 questões no módulo de Treinos Direcionados para automatizar o raciocínio.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 mt-4 text-right">
              <button
                onClick={() => setReadingArticle(null)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
