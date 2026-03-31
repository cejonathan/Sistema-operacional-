import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { SinistroData, Envolvido, ApoioPolicial, SocorroMedico, Vitima } from '@/src/types';
import { DET_CODES, VTR_CODES } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface SinistroFormProps {
  data: Partial<SinistroData>;
  onChange: (data: Partial<SinistroData>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SinistroForm: React.FC<SinistroFormProps> = ({ data, onChange, onShowToast }) => {
  const updateField = (field: keyof SinistroData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addEnvolvido = () => {
    const newEnvolvido: Envolvido = { tipo: '' };
    updateField('envolvidos', [...(data.envolvidos || []), newEnvolvido]);
  };

  const removeEnvolvido = (index: number) => {
    const updated = [...(data.envolvidos || [])];
    updated.splice(index, 1);
    updateField('envolvidos', updated);
  };

  const updateEnvolvido = (index: number, field: keyof Envolvido, value: string) => {
    const updated = [...(data.envolvidos || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('envolvidos', updated);
  };

  const addApoio = () => {
    const newApoio: ApoioPolicial = { tipo: '', prefixo: '', responsavel: '' };
    updateField('apoio', [...(data.apoio || []), newApoio]);
  };

  const removeApoio = (index: number) => {
    const updated = [...(data.apoio || [])];
    updated.splice(index, 1);
    updateField('apoio', updated);
  };

  const updateApoio = (index: number, field: keyof ApoioPolicial, value: string) => {
    const updated = [...(data.apoio || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('apoio', updated);
  };

  const addSocorro = () => {
    const newSocorro: SocorroMedico = { tipo: '' };
    updateField('socorro', [...(data.socorro || []), newSocorro]);
  };

  const removeSocorro = (index: number) => {
    const updated = [...(data.socorro || [])];
    updated.splice(index, 1);
    updateField('socorro', updated);
  };

  const updateSocorro = (index: number, field: keyof SocorroMedico, value: string) => {
    const updated = [...(data.socorro || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('socorro', updated);
  };

  const addVitima = () => {
    const newVitima: Vitima = { nome: '', sexo: '', estado: '', descricao: '' };
    updateField('vitimas', [...(data.vitimas || []), newVitima]);
  };

  const removeVitima = (index: number) => {
    const updated = [...(data.vitimas || [])];
    updated.splice(index, 1);
    updateField('vitimas', updated);
  };

  const updateVitima = (index: number, field: keyof Vitima, value: string) => {
    const updated = [...(data.vitimas || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('vitimas', updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentPhotos = data.photos || [];
    const remainingSlots = 10 - currentPhotos.length;
    if (remainingSlots <= 0) {
      onShowToast('Limite de 10 fotos atingido.', 'error');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1280;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          updateField('photos', [...(data.photos || []), compressed]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updated = [...(data.photos || [])];
    updated.splice(index, 1);
    updateField('photos', updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
          <input type="date" value={data.data || ''} onChange={e => updateField('data', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Hora</label>
          <input type="time" value={data.hora || ''} onChange={e => updateField('hora', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">N° Ocorrência</label>
          <input type="text" value={data.numero || ''} onChange={e => updateField('numero', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" placeholder="Ex: 123/2024" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Origem</label>
          <select value={data.origem || ''} onChange={e => updateField('origem', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
            <option value="">Selecionar...</option>
            <option value="Fiscalização de rotina">Fiscalização de rotina</option>
            <option value="COTRAN">COTRAN</option>
            <option value="COI">COI</option>
            <option value="CECOM">CECOM</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Endereço</label>
        <input type="text" value={data.endereco || ''} onChange={e => updateField('endereco', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" placeholder="Rua, Número, Bairro..." />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Característica do sinistro</label>
        <select value={data.caracteristica || ''} onChange={e => updateField('caracteristica', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none">
          <option value="">Selecionar...</option>
          <option value="Com vítima">Com vítima</option>
          <option value="Sem vítima">Sem vítima</option>
        </select>
      </div>

      {data.caracteristica === 'Com vítima' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Vítimas</h4>
            <button onClick={addVitima} className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
              <Plus className="w-3 h-3" /> Adicionar Vítima
            </button>
          </div>
          <div className="space-y-3">
            {(data.vitimas || []).map((v, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 relative shadow-sm">
                <button onClick={() => removeVitima(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Vítima</label>
                  <input type="text" value={v.nome} onChange={e => updateVitima(idx, 'nome', e.target.value)} placeholder="Nome completo..." className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Sexo</label>
                    <select value={v.sexo} onChange={e => updateVitima(idx, 'sexo', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none">
                      <option value="">Selecionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Estado</label>
                    <select value={v.estado} onChange={e => updateVitima(idx, 'estado', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none">
                      <option value="">Selecionar...</option>
                      <option value="Leve">Leve</option>
                      <option value="Grave">Grave</option>
                      <option value="Gravíssimo">Gravíssimo</option>
                      <option value="Óbito">Óbito</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição</label>
                  <textarea value={v.descricao} onChange={e => updateVitima(idx, 'descricao', e.target.value)} placeholder="Detalhes..." className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" rows={2}></textarea>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase">Envolvidos</label>
          <button onClick={addEnvolvido} className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
            <Plus className="w-3 h-3" /> Adicionar Veículo
          </button>
        </div>
        <div className="space-y-3">
          {(data.envolvidos || []).map((env, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
              <button onClick={() => removeEnvolvido(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Condutor {idx + 1}</label>
                <select value={env.tipo} onChange={e => updateEnvolvido(idx, 'tipo', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none">
                  <option value="">Selecionar...</option>
                  <option value="Carro 🚗">Carro 🚗</option>
                  <option value="Moto 🏍️">Moto 🏍️</option>
                  <option value="Caminhão 🚛">Caminhão 🚛</option>
                  <option value="Ônibus 🚌">Ônibus 🚌</option>
                  <option value="Ciclomotor 🛵">Ciclomotor 🛵</option>
                  <option value="Autopropelido 🛴">Autopropelido 🛴</option>
                  <option value="Bicicleta 🚲">Bicicleta 🚲</option>
                  <option value="Pedestre 🧍🏻">Pedestre 🧍🏻</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              {env.tipo === 'Outros' && (
                <input type="text" value={env.custom || ''} onChange={e => updateEnvolvido(idx, 'custom', e.target.value)} placeholder="Especifique..." className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
              )}
              {["Carro 🚗", "Moto 🏍️", "Caminhão 🚛", "Ônibus 🚌", "Ciclomotor 🛵"].includes(env.tipo) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Placa</label>
                    <input type="text" value={env.placa || ''} onChange={e => updateEnvolvido(idx, 'placa', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none uppercase" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">CNH</label>
                    <input type="text" value={env.cnh || ''} onChange={e => updateEnvolvido(idx, 'cnh', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase">Apoio Policial</label>
          <button onClick={addApoio} className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
            <Plus className="w-3 h-3" /> Adicionar Apoio
          </button>
        </div>
        <div className="space-y-3">
          {(data.apoio || []).map((ap, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
              <button onClick={() => removeApoio(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                <select value={ap.tipo} onChange={e => updateApoio(idx, 'tipo', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none">
                  <option value="">Selecionar...</option>
                  <option value="PM">PM</option>
                  <option value="GCM">GCM</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Prefixo</label>
                  <input type="text" value={ap.prefixo} onChange={e => updateApoio(idx, 'prefixo', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Responsável</label>
                  <input type="text" value={ap.responsavel} onChange={e => updateApoio(idx, 'responsavel', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase">Socorro Médico</label>
          <button onClick={addSocorro} className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
            <Plus className="w-3 h-3" /> Adicionar Socorro
          </button>
        </div>
        <div className="space-y-3">
          {(data.socorro || []).map((s, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
              <button onClick={() => removeSocorro(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                <select value={s.tipo} onChange={e => updateSocorro(idx, 'tipo', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none">
                  <option value="">Selecionar...</option>
                  <option value="SAMU">SAMU</option>
                  <option value="Resgate">Resgate</option>
                  <option value="Vítima Recusou">Vítima Recusou</option>
                  <option value="Sem Necessidade">Sem Necessidade</option>
                </select>
              </div>
              {["SAMU", "Resgate"].includes(s.tipo) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Prefixo</label>
                    <input type="text" value={s.prefixo || ''} onChange={e => updateSocorro(idx, 'prefixo', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Responsável</label>
                    <input type="text" value={s.responsavel || ''} onChange={e => updateSocorro(idx, 'responsavel', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Resumo dos Fatos</label>
        <textarea value={data.resumo || ''} onChange={e => updateField('resumo', e.target.value)} rows={3} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" placeholder="Descreva os detalhes..."></textarea>
      </div>

      <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Agentes Envolvidos</label>
          <button onClick={() => updateField('agentes', [...(data.agentes || []), ''])} className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            <Plus className="w-3 h-3" /> Adicionar Agente
          </button>
        </div>
        <div className="space-y-2">
          {(data.agentes || []).map((ag, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select 
                value={DET_CODES.some(c => `DET ${c}` === ag) ? ag : ag ? 'Outros' : ''} 
                onChange={e => {
                  const val = e.target.value;
                  const updated = [...(data.agentes || [])];
                  updated[idx] = val === 'Outros' ? '' : val;
                  updateField('agentes', updated);
                }}
                className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
              >
                <option value="">Selecionar...</option>
                {DET_CODES.map(c => <option key={c} value={`DET ${c}`}>DET {c}</option>)}
                <option value="Outros">Outros</option>
              </select>
              {!DET_CODES.some(c => `DET ${c}` === ag) && ag !== '' && (
                <input 
                  type="text" 
                  value={ag} 
                  onChange={e => {
                    const updated = [...(data.agentes || [])];
                    updated[idx] = e.target.value;
                    updateField('agentes', updated);
                  }}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="Nome do agente..."
                />
              )}
              <button onClick={() => {
                const updated = [...(data.agentes || [])];
                updated.splice(idx, 1);
                updateField('agentes', updated);
              }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">VTRs</label>
          <button onClick={() => updateField('vtrs', [...(data.vtrs || []), ''])} className="text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            <Plus className="w-3 h-3" /> Adicionar VTR
          </button>
        </div>
        <div className="space-y-2">
          {(data.vtrs || []).map((v, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select 
                value={VTR_CODES.includes(v) ? v : v ? 'Outros' : ''} 
                onChange={e => {
                  const val = e.target.value;
                  const updated = [...(data.vtrs || [])];
                  updated[idx] = val === 'Outros' ? '' : val;
                  updateField('vtrs', updated);
                }}
                className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
              >
                <option value="">Selecionar...</option>
                {VTR_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Outros">Outros</option>
              </select>
              {!VTR_CODES.includes(v) && v !== '' && (
                <input 
                  type="text" 
                  value={v} 
                  onChange={e => {
                    const updated = [...(data.vtrs || [])];
                    updated[idx] = e.target.value;
                    updateField('vtrs', updated);
                  }}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm outline-none"
                  placeholder="Prefixo VTR..."
                />
              )}
              <button onClick={() => {
                const updated = [...(data.vtrs || [])];
                updated.splice(idx, 1);
                updateField('agentes', updated);
              }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Supervisão</label>
          <input type="text" value={data.supervisao || ''} onChange={e => updateField('supervisao', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase leading-tight">Responsável</label>
          <select 
            value={DET_CODES.some(c => `DET ${c}` === data.responsavel) ? data.responsavel : data.responsavel ? 'Outros' : ''} 
            onChange={e => {
              const val = e.target.value;
              updateField('responsavel', val === 'Outros' ? '' : val);
            }}
            className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none"
          >
            <option value="">Selecionar...</option>
            {DET_CODES.map(c => <option key={c} value={`DET ${c}`}>DET {c}</option>)}
            <option value="Outros">Outros</option>
          </select>
          {!DET_CODES.some(c => `DET ${c}` === data.responsavel) && data.responsavel !== undefined && (
            <input 
              type="text" 
              value={data.responsavel} 
              onChange={e => updateField('responsavel', e.target.value)}
              className="mt-2 w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" 
              placeholder="Nome do responsável..." 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Matrícula</label>
          <input type="text" value={data.matricula || ''} onChange={e => updateField('matricula', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase leading-tight">Data Relatório</label>
          <input type="date" value={data.dataFinal || ''} onChange={e => updateField('dataFinal', e.target.value)} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 text-slate-900 outline-none" />
        </div>
      </div>

      <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase">Fotos do Sinistro</label>
          <label className="cursor-pointer text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
            <ImageIcon className="w-3 h-3" /> Anexar Fotos
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.photos || []).map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img src={photo} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
