import React, { useState, useEffect, useMemo } from 'react';
import { User, Edit2, Gauge, ClipboardList, History, Settings, Plus, MapPin, X, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Report, KMRecord } from './types';
import { CODIGOS_DEFAULT, LOCAIS_DEFAULT } from './constants';
import { KMTab } from './components/KMTab';
import { OcorrenciasTab } from './components/OcorrenciasTab';
import { HistoricoTab } from './components/HistoricoTab';
import { Modal } from './components/ui/Modal';
import { Toast, useToast } from './components/ui/Toast';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'km' | 'ocorrencias' | 'historico'>('km');
  const [agentName, setAgentName] = useState('Agente Trânsito');
  const [reports, setReports] = useState<Report[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  
  // Custom options
  const [availableCodigos, setAvailableCodigos] = useState<string[]>(CODIGOS_DEFAULT);
  const [availableLocais, setAvailableLocais] = useState<string[]>(LOCAIS_DEFAULT);
  
  // Modals
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageType, setManageType] = useState<'codigo' | 'local'>('codigo');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Inputs
  const [newName, setNewName] = useState('');
  const [newLocal, setNewLocal] = useState('');
  const [newOption, setNewOption] = useState('');

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const savedName = localStorage.getItem('traffic_agent_name');
    if (savedName) setAgentName(savedName);

    const savedReports = localStorage.getItem('traffic_reports');
    if (savedReports) setReports(JSON.parse(savedReports));

    const savedCodigos = localStorage.getItem('traffic_available_codigos');
    if (savedCodigos) setAvailableCodigos(JSON.parse(savedCodigos));

    const savedLocais = localStorage.getItem('traffic_available_locais');
    if (savedLocais) setAvailableLocais(JSON.parse(savedLocais));
  }, []);

  const saveReports = (newReports: Report[]) => {
    setReports(newReports);
    localStorage.setItem('traffic_reports', JSON.stringify(newReports));
  };

  const handleSaveReport = (reportData: Partial<Report>) => {
    const report: Report = {
      id: editingReport?.id || Math.random().toString(36).substring(2),
      type: reportData.type!,
      data: reportData.data,
      agent: agentName,
      timestamp: editingReport?.timestamp || Date.now(),
    };

    let newReports: Report[];
    if (editingReport) {
      newReports = reports.map(r => r.id === editingReport.id ? report : r);
      showToast('Registro atualizado!');
    } else {
      newReports = [report, ...reports];
      showToast('Registro salvo localmente!');
    }

    saveReports(newReports);
    setEditingReport(null);
  };

  const handleDeleteReport = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    const ids = deleteTargetId.split(',');
    const filtered = reports.filter(r => !ids.includes(r.id));
    saveReports(filtered);
    setIsConfirmModalOpen(false);
    setDeleteTargetId(null);
    showToast('Excluído com sucesso.');
  };

  const handleClearAll = () => {
    setDeleteTargetId(reports.map(r => r.id).join(','));
    setIsConfirmModalOpen(true);
  };

  const handleClearPhotos = () => {
    if (!confirm('Deseja remover TODAS as fotos de todos os registros?')) return;
    const updated = reports.map(r => {
      if (r.data && r.data.photos) return { ...r, data: { ...r.data, photos: [] } };
      return r;
    });
    saveReports(updated);
    showToast('Fotos removidas.');
  };

  const handleEditReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      setEditingReport(report);
      setActiveTab('ocorrencias');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSendWhatsApp = (id: string) => {
    const r = reports.find(x => x.id === id);
    if (!r) return;
    const msg = formatMessage(r);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSendBulkWhatsApp = (date: string) => {
    const dayReports = reports.filter(r => new Date(r.timestamp).toLocaleDateString('pt-BR') === date && r.type === 'simples');
    const allItems = dayReports.flatMap(r => r.data.items);
    const msg = formatSimplesBulk(allItems, agentName, date);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatMessage = (r: Report) => {
    const dateStr = new Date(r.timestamp).toLocaleDateString('pt-BR');
    if (r.type === 'log') {
      const d = r.data;
      return `*LOG OCORRÊNCIA - ${r.agent}*\n------------------------------\n*CÓDIGO:* ${d.codigo}\n*LOCAL:* ${d.local}\n*INÍCIO:* ${d.inicio}\n*TÉRMINO:* ${d.termino}\n*VIATURA:* ${d.vtr}\n*CONDUTOR:* ${d.condutor}\n*APOIO:* ${d.apoio || '---'}\n*DATA:* ${dateStr}\n------------------------------`;
    }
    if (r.type === 'simples') {
      return formatSimplesBulk(r.data.items, r.agent, dateStr);
    }
    if (r.data.tipo === 'Sinistro de trânsito') {
      const d = r.data;
      let msg = `*RELATÓRIO DE SINISTRO DE TRÂNSITO*\n\n*DATA:* ${d.data}\n*HORA:* ${d.hora}\n*N° OCORRÊNCIA:* ${d.numero}\n*ENDEREÇO:* ${d.endereco}\n*CARACTERÍSTICA:* ${d.caracteristica}\n\n*RESUMO:* ${d.resumo}\n\n*AGENTE:* ${r.agent}`;
      return msg;
    }
    return `*OCORRÊNCIA ESPECIAL*\n*TIPO:* ${r.data.tipo}\n*DESCRIÇÃO:* ${r.data.descricao}\n*LOCAL:* ${r.data.local}\n*AGENTE:* ${r.agent}\n*DATA:* ${dateStr}`;
  };

  const formatSimplesBulk = (items: any[], name: string, date: string) => {
    const grouped: any = {};
    items.forEach(it => {
      if (!grouped[it.codigo]) grouped[it.codigo] = [];
      grouped[it.codigo].push(it.local);
    });
    let msg = `*REGISTRO DE OCORRÊNCIAS*\n*AGENTE:* ${name}\n*DATA:* ${date}\n\n*OCORRÊNCIAS SIMPLES*\n`;
    Object.keys(grouped).forEach(cod => {
      msg += `\n*CÓDIGO:* ${cod}\n*LOCAIS:*`;
      grouped[cod].forEach((loc: string) => msg += `\n- ${loc}`);
      msg += `\n`;
    });
    return msg;
  };

  const storageUsage = useMemo(() => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length * 2);
      }
    }
    return (total / (1024 * 1024)).toFixed(2);
  }, [reports]);

  const todayCount = useMemo(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    return reports.filter(r => new Date(r.timestamp).toLocaleDateString('pt-BR') === today).length;
  }, [reports]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>

      <header className="bg-white/80 backdrop-blur-md text-slate-900 p-6 shadow-sm sticky top-0 z-20 border-b border-slate-200">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/10 p-2 rounded-lg">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight text-slate-900">{agentName}</h1>
              <div className="flex items-center gap-2">
                <p className="text-indigo-600 text-[10px] uppercase tracking-widest font-bold">Registro Operacional</p>
                <span className="bg-indigo-500/10 text-indigo-600 text-[9px] px-1.5 py-0.5 rounded-full font-black border border-indigo-500/20">{todayCount} HOJE</span>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tighter",
                  Number(storageUsage) > 4 ? "text-red-500" : "text-slate-400"
                )}>{storageUsage}MB / 5MB</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setNewName(agentName); setIsNameModalOpen(true); }} 
            className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full font-bold uppercase transition-colors flex items-center gap-1 text-slate-600 border border-slate-200"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <div className="flex bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('km')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all whitespace-nowrap uppercase text-xs", activeTab === 'km' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-500 hover:text-slate-700")}>
            <Gauge className="w-4 h-4" /> KM
          </button>
          <button onClick={() => setActiveTab('ocorrencias')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all whitespace-nowrap uppercase text-xs", activeTab === 'ocorrencias' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-500 hover:text-slate-700")}>
            <ClipboardList className="w-4 h-4" /> OCORRÊNCIAS
          </button>
          <button onClick={() => setActiveTab('historico')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all whitespace-nowrap uppercase text-xs", activeTab === 'historico' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-500 hover:text-slate-700")}>
            <History className="w-4 h-4" /> HISTÓRICO
          </button>
        </div>

        {activeTab === 'km' && <KMTab onShowToast={showToast} />}
        {activeTab === 'ocorrencias' && (
          <OcorrenciasTab 
            onShowToast={showToast} 
            onSaveReport={handleSaveReport} 
            editingReport={editingReport}
            onCancelEdit={() => setEditingReport(null)}
            onOpenManageOptions={(type) => { setManageType(type); setIsManageModalOpen(true); }}
            availableCodigos={availableCodigos}
            availableLocais={availableLocais}
          />
        )}
        {activeTab === 'historico' && (
          <HistoricoTab 
            reports={reports} 
            onEdit={handleEditReport} 
            onDelete={handleDeleteReport} 
            onClearAll={handleClearAll}
            onClearPhotos={handleClearPhotos}
            onSendWhatsApp={handleSendWhatsApp}
            onSendBulkWhatsApp={handleSendBulkWhatsApp}
          />
        )}
      </main>

      {/* Modals */}
      <Modal isOpen={isNameModalOpen} onClose={() => setIsNameModalOpen(false)} title="Nome do Agente" icon={<User className="w-5 h-5 text-indigo-600" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seu Nome</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} type="text" placeholder="Digite seu nome..." className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none text-lg font-medium transition-all text-slate-900" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsNameModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200">Cancelar</button>
            <button onClick={() => { setAgentName(newName); localStorage.setItem('traffic_agent_name', newName); setIsNameModalOpen(false); showToast('Nome atualizado!'); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 active:scale-95 transition-all">Salvar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title={`Gerenciar ${manageType === 'codigo' ? 'Códigos' : 'Locais'}`} icon={<Settings className="w-5 h-5 text-indigo-600" />}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input value={newOption} onChange={e => setNewOption(e.target.value)} type="text" placeholder={`Novo ${manageType === 'codigo' ? 'código' : 'local'}...`} className="flex-1 p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium transition-all text-slate-900" />
            <button 
              onClick={() => {
                if (!newOption.trim()) return;
                const list = manageType === 'codigo' ? availableCodigos : availableLocais;
                if (list.includes(newOption.trim())) { showToast('Já existe.', 'error'); return; }
                const updated = [...list, newOption.trim()];
                if (manageType === 'codigo') { setAvailableCodigos(updated); localStorage.setItem('traffic_available_codigos', JSON.stringify(updated)); }
                else { setAvailableLocais(updated); localStorage.setItem('traffic_available_locais', JSON.stringify(updated)); }
                setNewOption('');
                showToast('Adicionado!');
              }} 
              className="bg-indigo-600 text-white p-3 rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-900/40"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {(manageType === 'codigo' ? availableCodigos : availableLocais).map((opt, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 group">
                <span className="text-sm font-medium text-slate-700 truncate mr-2">{opt}</span>
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => {
                      const list = manageType === 'codigo' ? availableCodigos : availableLocais;
                      const newVal = prompt('Editar opção:', opt);
                      if (!newVal?.trim()) return;
                      const updated = [...list];
                      updated[idx] = newVal.trim();
                      if (manageType === 'codigo') { setAvailableCodigos(updated); localStorage.setItem('traffic_available_codigos', JSON.stringify(updated)); }
                      else { setAvailableLocais(updated); localStorage.setItem('traffic_available_locais', JSON.stringify(updated)); }
                      showToast('Atualizado!');
                    }} 
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const list = manageType === 'codigo' ? availableCodigos : availableLocais;
                      const updated = list.filter((_, i) => i !== idx);
                      if (manageType === 'codigo') { setAvailableCodigos(updated); localStorage.setItem('traffic_available_codigos', JSON.stringify(updated)); }
                      else { setAvailableLocais(updated); localStorage.setItem('traffic_available_locais', JSON.stringify(updated)); }
                      showToast('Excluído.');
                    }} 
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Exclusão" icon={<Trash2 className="w-5 h-5 text-red-500" />}>
        <div className="space-y-6 text-center">
          <p className="text-slate-500 text-sm">Esta ação não pode ser desfeita e o registro será removido permanentemente.</p>
          <div className="flex gap-3">
            <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200">Cancelar</button>
            <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-900/20 transition-colors">Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
