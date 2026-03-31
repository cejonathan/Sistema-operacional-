import React, { useState, useEffect } from 'react';
import { Plus, Save, Eraser, ClipboardList, Settings, MapPin, Hash, Info, FileText, Trash2 } from 'lucide-react';
import { OcorrenciaType, SimplesItem, LogData, SinistroData, Report } from '@/src/types';
import { CODIGOS_DEFAULT, LOCAIS_DEFAULT, VTR_CODES, DET_CODES } from '@/src/constants';
import { SinistroForm } from './SinistroForm';
import { cn } from '@/src/lib/utils';

interface OcorrenciasTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onSaveReport: (report: Partial<Report>) => void;
  editingReport: Report | null;
  onCancelEdit: () => void;
  onOpenManageOptions: (type: 'codigo' | 'local') => void;
  availableCodigos: string[];
  availableLocais: string[];
}

export const OcorrenciasTab: React.FC<OcorrenciasTabProps> = ({ 
  onShowToast, onSaveReport, editingReport, onCancelEdit, onOpenManageOptions, availableCodigos, availableLocais 
}) => {
  const [activeType, setActiveType] = useState<OcorrenciaType>('log');
  
  // Log State
  const [logData, setLogData] = useState<Partial<LogData>>({});
  
  // Simples State
  const [simplesList, setSimplesList] = useState<SimplesItem[]>([]);
  const [simplesCodigo, setSimplesCodigo] = useState('');
  const [simplesCustomCodigo, setSimplesCustomCodigo] = useState('');
  const [simplesLocal, setSimplesLocal] = useState('');
  const [simplesCustomLocal, setSimplesCustomLocal] = useState('');

  // Especial State
  const [especialTipo, setEspecialTipo] = useState('');
  const [especialDescricao, setEspecialDescricao] = useState('');
  const [especialLocal, setEspecialLocal] = useState('');
  const [sinistroData, setSinistroData] = useState<Partial<SinistroData>>({
    envolvidos: [], apoio: [], socorro: [], vitimas: [], agentes: [], vtrs: [], photos: []
  });

  useEffect(() => {
    if (editingReport) {
      setActiveType(editingReport.type);
      if (editingReport.type === 'log') setLogData(editingReport.data);
      if (editingReport.type === 'simples') setSimplesList(editingReport.data.items);
      if (editingReport.type === 'especial') {
        setEspecialTipo(editingReport.data.tipo);
        if (editingReport.data.tipo === 'Sinistro de trânsito') {
          setSinistroData(editingReport.data);
        } else {
          setEspecialDescricao(editingReport.data.descricao);
          setEspecialLocal(editingReport.data.local);
        }
      }
    }
  }, [editingReport]);

  const handleSave = () => {
    let data: any = {};
    if (activeType === 'log') {
      if (!logData.codigo || !logData.local || !logData.inicio || !logData.vtr || !logData.condutor) {
        return onShowToast('Preencha os campos obrigatórios.', 'error');
      }
      data = logData;
    } else if (activeType === 'simples') {
      const finalCodigo = simplesCodigo === 'Outros' ? simplesCustomCodigo : simplesCodigo;
      const finalLocal = simplesLocal === 'Outros' ? simplesCustomLocal : simplesLocal;
      const finalItems = [...simplesList];
      if (finalCodigo && finalLocal) finalItems.push({ codigo: finalCodigo, local: finalLocal });
      if (finalItems.length === 0) return onShowToast('Adicione ocorrências.', 'error');
      data = { items: finalItems };
    } else if (activeType === 'especial') {
      if (!especialTipo) return onShowToast('Selecione o tipo de ocorrência.', 'error');
      if (especialTipo === 'Sinistro de trânsito') {
        if (!sinistroData.data || !sinistroData.hora || !sinistroData.endereco) {
          return onShowToast('Preencha os campos obrigatórios (Data, Hora, Endereço).', 'error');
        }
        data = { tipo: especialTipo, ...sinistroData };
      } else {
        if (!especialDescricao || !especialLocal) return onShowToast('Preencha os campos.', 'error');
        data = { tipo: especialTipo, descricao: especialDescricao, local: especialLocal };
      }
    }

    onSaveReport({ type: activeType, data });
    handleClear();
  };

  const handleClear = () => {
    setLogData({});
    setSimplesList([]);
    setSimplesCodigo('');
    setSimplesCustomCodigo('');
    setSimplesLocal('');
    setSimplesCustomLocal('');
    setEspecialTipo('');
    setEspecialDescricao('');
    setEspecialLocal('');
    setSinistroData({ envolvidos: [], apoio: [], socorro: [], vitimas: [], agentes: [], vtrs: [], photos: [] });
    if (editingReport) onCancelEdit();
  };

  const addSimplesItem = () => {
    const finalCodigo = simplesCodigo === 'Outros' ? simplesCustomCodigo : simplesCodigo;
    const finalLocal = simplesLocal === 'Outros' ? simplesCustomLocal : simplesLocal;
    if (!finalCodigo || !finalLocal) return onShowToast('Preencha Código e Local.', 'error');
    setSimplesList([...simplesList, { codigo: finalCodigo, local: finalLocal }]);
    setSimplesLocal('');
    setSimplesCustomLocal('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
        {(['log', 'simples', 'especial'] as OcorrenciaType[]).map(t => (
          <button 
            key={t}
            onClick={() => setActiveType(t)} 
            className={cn(
              "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
              activeType === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-lg space-y-4 sm:space-y-5 border border-slate-200">
        {editingReport && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight flex items-center gap-2">
              <ClipboardList className="w-3 h-3" /> Editando Registro
            </span>
            <button onClick={handleClear} className="text-[10px] font-black text-indigo-600 uppercase">Cancelar</button>
          </div>
        )}

        {activeType === 'log' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
              <select value={logData.codigo || ''} onChange={e => setLogData({...logData, codigo: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                <option value="">Selecionar Código...</option>
                {availableCodigos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Local</label>
              <select value={logData.local || ''} onChange={e => setLogData({...logData, local: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                <option value="">Selecionar Local...</option>
                {availableLocais.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Início</label>
                <input type="time" value={logData.inicio || ''} onChange={e => setLogData({...logData, inicio: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Término</label>
                <input type="time" value={logData.termino || ''} onChange={e => setLogData({...logData, termino: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Viatura</label>
              <select value={logData.vtr || ''} onChange={e => setLogData({...logData, vtr: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                <option value="">Selecionar VTR...</option>
                {VTR_CODES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Condutor</label>
                <select value={logData.condutor || ''} onChange={e => setLogData({...logData, condutor: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                  <option value="">Selecionar...</option>
                  {DET_CODES.map(c => <option key={c} value={`DET ${c}`}>DET {c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Apoio</label>
                <select value={logData.apoio || ''} onChange={e => setLogData({...logData, apoio: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                  <option value="">Selecionar...</option>
                  {DET_CODES.map(c => <option key={c} value={`DET ${c}`}>DET {c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeType === 'simples' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><Hash className="w-4 h-4" /> Código</span>
                <button onClick={() => onOpenManageOptions('codigo')} className="text-indigo-600 hover:text-indigo-500 transition-colors p-1">
                  <Settings className="w-4 h-4" />
                </button>
              </label>
              <select value={simplesCodigo} onChange={e => setSimplesCodigo(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                <option value="">Selecione um código...</option>
                {availableCodigos.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Outros">Outros (Escrever manualmente)</option>
              </select>
              {simplesCodigo === 'Outros' && (
                <input type="text" value={simplesCustomCodigo} onChange={e => setSimplesCustomCodigo(e.target.value)} placeholder="Digite o código manualmente..." className="w-full p-4 mt-2 bg-white border-2 border-indigo-500/50 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Local</span>
                <button onClick={() => onOpenManageOptions('local')} className="text-indigo-600 hover:text-indigo-500 transition-colors p-1">
                  <Settings className="w-4 h-4" />
                </button>
              </label>
              <div className="flex gap-2">
                <select value={simplesLocal} onChange={e => setSimplesLocal(e.target.value)} className="flex-1 p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                  <option value="">Selecione um local...</option>
                  {availableLocais.map(l => <option key={l} value={l}>{l}</option>)}
                  <option value="Outros">Outros (Escrever manualmente)</option>
                </select>
                <button onClick={addSimplesItem} className="bg-indigo-600 text-white p-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-900/40 shrink-0">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              {simplesLocal === 'Outros' && (
                <input type="text" value={simplesCustomLocal} onChange={e => setSimplesCustomLocal(e.target.value)} placeholder="Digite o local manualmente..." className="w-full p-4 mt-2 bg-white border-2 border-indigo-500/50 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
              )}
            </div>

            {simplesList.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens na Lista ({simplesList.length})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {simplesList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-sm">
                        <span className="font-bold text-indigo-600 mr-2">{item.codigo}</span>
                        <span className="text-slate-600">{item.local}</span>
                      </div>
                      <button onClick={() => setSimplesList(simplesList.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeType === 'especial' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                <Info className="w-4 h-4" /> Tipo de Ocorrência
              </label>
              <select value={especialTipo} onChange={e => setEspecialTipo(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
                <option value="">Selecionar...</option>
                <option value="Sinistro de trânsito">Sinistro de trânsito</option>
                <option value="Remoção de veículo">Remoção de veículo</option>
                <option value="Remoção de veículo em estado de abandono">Remoção de veículo em estado de abandono</option>
                <option value="Relatório de fiscalização">Relatório de fiscalização</option>
                <option value="Buraco na via">Buraco na via</option>
              </select>
            </div>

            {especialTipo === 'Sinistro de trânsito' ? (
              <SinistroForm data={sinistroData} onChange={setSinistroData} onShowToast={onShowToast} />
            ) : especialTipo !== '' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Descrição
                  </label>
                  <textarea value={especialDescricao} onChange={e => setEspecialDescricao(e.target.value)} placeholder="Descreva a situação..." rows={3} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none"></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Local
                  </label>
                  <input type="text" value={especialLocal} onChange={e => setEspecialLocal(e.target.value)} placeholder="Ex: Cruzamento X com Y" className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Salvar {activeType === 'log' ? 'Log' : 'Ocorrência'}
          </button>
          <button onClick={handleClear} className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold uppercase text-xs active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-200">
            <Eraser className="w-4 h-4" /> Limpar Formulário
          </button>
        </div>
      </div>
    </div>
  );
};
