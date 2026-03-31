import React, { useState, useEffect } from 'react';
import { Play, Gauge, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { KMRecord } from '@/src/types';
import { VTR_CODES, DET_CODES } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface KMTabProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const KMTab: React.FC<KMTabProps> = ({ onShowToast }) => {
  const [kmRecords, setKmRecords] = useState<KMRecord[]>([]);
  const [editingKMId, setEditingKMId] = useState<string | null>(null);
  
  const [vtr, setVtr] = useState('');
  const [condutor, setCondutor] = useState('');
  const [apoio, setApoio] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [horaInicial, setHoraInicial] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('traffic_km_records');
    if (saved) setKmRecords(JSON.parse(saved));
  }, []);

  const saveRecords = (records: KMRecord[]) => {
    setKmRecords(records);
    localStorage.setItem('traffic_km_records', JSON.stringify(records));
  };

  const handleOpenKM = () => {
    if (!vtr || !condutor || !kmInicial || !horaInicial) {
      return onShowToast('Preencha os campos obrigatórios (VTR, Condutor, KM e Hora).', 'error');
    }

    if (editingKMId) {
      const updated = kmRecords.map(r => r.id === editingKMId ? {
        ...r, vtr, condutor, apoio, kmInicial, horaInicial
      } : r);
      saveRecords(updated);
      onShowToast('Registro de KM atualizado!');
      setEditingKMId(null);
    } else {
      const newRecord: KMRecord = {
        id: Date.now().toString(),
        vtr, condutor, apoio, kmInicial, horaInicial,
        status: 'aberto',
        timestamp: new Date().toISOString()
      };
      saveRecords([newRecord, ...kmRecords]);
      onShowToast('KM aberto com sucesso!');
    }

    clearForm();
  };

  const clearForm = () => {
    setVtr('');
    setCondutor('');
    setApoio('');
    setKmInicial('');
    setHoraInicial('');
    setEditingKMId(null);
  };

  const promptCloseKM = (id: string) => {
    const kmFinal = prompt('Digite o KM Final:');
    if (kmFinal === null) return;
    const horaFinal = prompt('Digite o Horário de Término (HH:MM):', new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    if (horaFinal === null) return;

    if (!kmFinal || !horaFinal) return onShowToast('KM e Hora são obrigatórios para fechar.', 'error');

    const updated = kmRecords.map(r => r.id === id ? {
      ...r, kmFinal, horaFinal, status: 'fechado' as const
    } : r);
    saveRecords(updated);
    onShowToast('KM fechado com sucesso!');
  };

  const editKM = (id: string) => {
    const record = kmRecords.find(r => r.id === id);
    if (!record) return;

    setVtr(record.vtr);
    setCondutor(record.condutor);
    setApoio(record.apoio || '');
    setKmInicial(record.kmInicial);
    setHoraInicial(record.horaInicial);
    setEditingKMId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteKM = (id: string) => {
    if (!confirm('Deseja excluir este registro de KM?')) return;
    const filtered = kmRecords.filter(r => r.id !== id);
    saveRecords(filtered);
    onShowToast('Registro excluído.');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-lg space-y-4 sm:space-y-5 border border-slate-200">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Play className="w-4 h-4" /> {editingKMId ? 'Editar Controle de KM' : 'Abrir Controle de KM'}
        </h3>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Viatura (VTR)</label>
          <select 
            value={vtr} 
            onChange={(e) => setVtr(e.target.value)}
            className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none transition-colors"
          >
            <option value="">Selecionar VTR...</option>
            {VTR_CODES.map(code => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Condutor</label>
          <select 
            value={condutor} 
            onChange={(e) => setCondutor(e.target.value)}
            className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none transition-colors"
          >
            <option value="">Selecionar Condutor...</option>
            {DET_CODES.map(code => <option key={code} value={`DET ${code}`}>DET {code}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Apoio</label>
          <select 
            value={apoio} 
            onChange={(e) => setApoio(e.target.value)}
            className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none transition-colors"
          >
            <option value="">Selecionar Apoio...</option>
            {DET_CODES.map(code => <option key={code} value={`DET ${code}`}>DET {code}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">KM Inicial</label>
            <input 
              type="number" 
              value={kmInicial}
              onChange={(e) => setKmInicial(e.target.value)}
              className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none transition-colors" 
              placeholder="0" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Hora Inicial</label>
            <input 
              type="time" 
              value={horaInicial}
              onChange={(e) => setHoraInicial(e.target.value)}
              className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none transition-colors" 
            />
          </div>
        </div>

        <button 
          onClick={handleOpenKM}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {editingKMId ? <Save className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {editingKMId ? 'Atualizar KM' : 'Abrir KM'}
        </button>
        
        {editingKMId && (
          <button 
            onClick={clearForm}
            className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold uppercase text-xs active:scale-95 transition-all border border-slate-200"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Registro de Km</h3>
        <div className="space-y-3">
          {kmRecords.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs font-bold uppercase">Nenhum registro encontrado</p>
          ) : (
            kmRecords.map(record => (
              <div 
                key={record.id}
                className={cn(
                  "bg-white/90 backdrop-blur-xl p-4 rounded-2xl border-l-4 shadow-sm space-y-3 transition-all",
                  record.status === 'aberto' ? 'border-l-amber-500' : 'border-l-green-500'
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 uppercase text-sm">{record.vtr}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(record.timestamp).toLocaleDateString('pt-BR')} {new Date(record.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[9px] font-black uppercase",
                    record.status === 'aberto' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  )}>
                    {record.status === 'aberto' ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase">Início</p>
                    <p className="text-slate-700 font-black">{record.kmInicial} KM / {record.horaInicial}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase">Fim</p>
                    <p className="text-slate-700 font-black">{record.kmFinal ? `${record.kmFinal} KM / ${record.horaFinal}` : '---'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase">Condutor</p>
                    <p className="text-slate-700 font-black">{record.condutor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase">Apoio</p>
                    <p className="text-slate-700 font-black">{record.apoio || '---'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {record.status === 'aberto' && (
                    <button 
                      onClick={() => promptCloseKM(record.id)} 
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Fechar
                    </button>
                  )}
                  <button 
                    onClick={() => editKM(record.id)} 
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => deleteKM(record.id)} 
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Save = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);
