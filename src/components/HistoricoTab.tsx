import React from 'react';
import { History, Trash2, Edit3, MapPin, Send, ImageOff } from 'lucide-react';
import { Report } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface HistoricoTabProps {
  reports: Report[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClearPhotos: () => void;
  onSendWhatsApp: (id: string) => void;
  onSendBulkWhatsApp: (date: string) => void;
}

export const HistoricoTab: React.FC<HistoricoTabProps> = ({ 
  reports, onEdit, onDelete, onClearAll, onClearPhotos, onSendWhatsApp, onSendBulkWhatsApp 
}) => {
  const groups: Record<string, { simples: Report[], especial: Report[], log: Report[] }> = {};
  
  reports.forEach(r => {
    const date = new Date(r.timestamp).toLocaleDateString('pt-BR');
    if (!groups[date]) groups[date] = { simples: [], especial: [], log: [] };
    if (r.type === 'simples') groups[date].simples.push(r);
    else if (r.type === 'especial') groups[date].especial.push(r);
    else if (r.type === 'log') groups[date].log.push(r);
  });

  const sortedDates = Object.keys(groups).sort((a, b) => {
    const [da, ma, ya] = a.split('/');
    const [db, mb, yb] = b.split('/');
    return new Date(`${yb}-${mb}-${db}`).getTime() - new Date(`${ya}-${ma}-${da}`).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="font-black text-slate-500 uppercase text-xs tracking-widest">Registros Salvos ({reports.length})</h2>
        <div className="flex gap-3">
          <button onClick={onClearPhotos} className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1 hover:text-amber-500 transition-colors">
            <ImageOff className="w-3 h-3" /> Limpar Fotos
          </button>
          <button onClick={onClearAll} className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" /> Limpar Tudo
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 text-center border-2 border-dashed border-slate-200">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Nenhum registro encontrado.</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{date}</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              </div>

              {groups[date].log.sort((a, b) => b.timestamp - a.timestamp).map(r => (
                <div key={r.id} className="bg-white rounded-3xl p-5 shadow-sm space-y-3 border border-slate-200 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">LOG OCORRÊNCIA</span>
                      <h3 className="font-bold text-slate-800">{r.data.codigo}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.data.local}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{r.data.inicio} - {r.data.termino}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(r.id)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 uppercase font-bold bg-slate-50 p-3 rounded-xl">
                    <div>VTR: <span className="text-slate-700">{r.data.vtr}</span></div>
                    <div>COND: <span className="text-slate-700">{r.data.condutor}</span></div>
                    <div className="col-span-2">APOIO: <span className="text-slate-700">{r.data.apoio || '---'}</span></div>
                  </div>
                  <button onClick={() => onSendWhatsApp(r.id)} className="w-full bg-green-600/10 text-green-600 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600/20 transition-all border border-green-600/20 uppercase">
                    <Send className="w-3 h-3" /> Enviar WhatsApp
                  </button>
                </div>
              ))}

              {groups[date].simples.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4 border border-slate-200 border-l-4 border-l-indigo-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600">OCORRÊNCIAS SIMPLES</span>
                    <button onClick={() => onDelete(groups[date].simples.map(r => r.id).join(','))} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-4">
                    {groups[date].simples.sort((a, b) => b.timestamp - a.timestamp).map(r => (
                      <div key={r.id} className="space-y-2">
                        <div className="flex justify-end items-center">
                          <div className="flex gap-2">
                            <button onClick={() => onEdit(r.id)} className="text-[9px] text-indigo-400 font-bold uppercase">Editar</button>
                            <button onClick={() => onDelete(r.id)} className="text-[9px] text-red-400 font-bold uppercase">Remover</button>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-600 p-3 rounded-xl border border-slate-100 space-y-1">
                          {r.data.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span className="font-bold text-slate-700">{it.codigo}</span>
                              <span className="truncate ml-2 text-slate-500">{it.local}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => onSendBulkWhatsApp(date)} className="w-full bg-green-600/10 text-green-600 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600/20 transition-all border border-green-600/20 uppercase">
                    <Send className="w-3 h-3" /> Enviar Tudo ({date})
                  </button>
                </div>
              )}

              {groups[date].especial.sort((a, b) => b.timestamp - a.timestamp).map(r => (
                <div key={r.id} className="bg-white rounded-3xl p-5 shadow-sm space-y-3 border border-slate-200 border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600">{r.data.tipo.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(r.id)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {r.data.tipo === 'Sinistro de trânsito' ? (
                      <>
                        <p className="font-bold text-slate-800">N° {r.data.numero || 'S/N'}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.data.endereco}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{r.data.data} às {r.data.hora}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-slate-800">{r.data.descricao}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.data.local}</p>
                      </>
                    )}
                  </div>
                  <button onClick={() => onSendWhatsApp(r.id)} className="w-full bg-green-600/10 text-green-600 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600/20 transition-colors border border-green-600/20 uppercase">
                    <Send className="w-3 h-3" /> Reenviar WhatsApp
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
