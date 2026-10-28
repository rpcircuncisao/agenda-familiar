import React, { useState, useEffect } from 'react';
import { 
  Bell, Calendar, Clock, Plus, Trash2, CheckCircle2, User, Users, 
  Settings, LogIn, LogOut, Check, Share2, Copy, AlertCircle, ShieldAlert,
  ChevronRight, CalendarDays, List, Filter, UserPlus, Heart, ExternalLink
} from 'lucide-react';

// Categoria com cores
const CATEGORIES = [
  { id: 'escola', label: 'Escola / Estudos', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200', bgLight: 'bg-blue-50' },
  { id: 'saude', label: 'Saúde / Médicos', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-200', bgLight: 'bg-emerald-50' },
  { id: 'esporte', label: 'Esportes / Treino', color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-200', bgLight: 'bg-amber-50' },
  { id: 'tarefa', label: 'Tarefas de Casa', color: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-200', bgLight: 'bg-purple-50' },
  { id: 'lazer', label: 'Lazer / Família', color: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-200', bgLight: 'bg-rose-50' },
];

export default function App() {
  // Estado do Usuário e Login
  const [currentUser, setCurrentUser] = useState({
    uid: 'user_rodrigo',
    displayName: 'Rodrigo',
    email: 'rodrigo@exemplo.com',
    role: 'master', // 'master' ou 'member'
    photoURL: null
  });

  // Estado da Família
  const [familyGroup, setFamilyGroup] = useState({
    id: 'fam_circuncisao_123',
    name: 'Família Circuncisão',
    inviteCode: 'CIRCUNCISAO-2026',
    members: [
      { uid: 'user_rodrigo', name: 'Rodrigo', role: 'master', email: 'rodrigo@exemplo.com', isDependent: false },
      { uid: 'user_adriana', name: 'Adriana', role: 'master', email: 'adriana@exemplo.com', isDependent: false },
      { uid: 'user_jessica', name: 'Jessica', role: 'member', email: 'jessica@exemplo.com', isDependent: false },
      { uid: 'user_milena', name: 'Milena', role: 'member', email: 'milena@exemplo.com', isDependent: false },
      { uid: 'dep_lucas', name: 'Lucas', role: 'dependent', guardians: ['user_rodrigo', 'user_adriana'], isDependent: true },
      { uid: 'dep_sofia', name: 'Sofia', role: 'dependent', guardians: ['user_rodrigo', 'user_adriana'], isDependent: true }
    ]
  });

  // Estado das Atividades / Eventos
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Consulta da Adriana (Cardiologista)',
      description: 'Levar os exames de sangue recentes',
      date: '2026-10-29',
      time: '14:30',
      category: 'saude',
      targetMemberId: 'user_adriana', // Atividade atribuída
      notifyMemberIds: ['user_rodrigo', 'user_adriana', 'user_jessica'], // NÃO notifica a Milena
      alarms: { dayBefore: true, hourBefore: true, min15Before: true },
      completed: false,
      createdBy: 'Rodrigo'
    },
    {
      id: '2',
      title: 'Pediatra do Lucas',
      description: 'Consulta de rotina e vacinação de 5 anos',
      date: '2026-10-30',
      time: '10:00',
      category: 'saude',
      targetMemberId: 'dep_lucas', // Menor/Dependente
      notifyMemberIds: ['user_rodrigo', 'user_adriana'], // Apenas os responsáveis
      alarms: { dayBefore: true, hourBefore: true, min15Before: false },
      completed: false,
      createdBy: 'Adriana'
    },
    {
      id: '3',
      title: 'Apresentação de Dança da Milena',
      description: 'Teatro Municipal - Chegar 30 min antes',
      date: '2026-11-05',
      time: '19:00',
      category: 'lazer',
      targetMemberId: 'user_milena',
      notifyMemberIds: ['user_rodrigo', 'user_adriana', 'user_jessica', 'user_milena'],
      alarms: { dayBefore: true, hourBefore: true, min15Before: true },
      completed: false,
      createdBy: 'Milena'
    }
  ]);

  // Estados de Interface e Filtros
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'family'
  const [filterMember, setFilterMember] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Modais e Diálogos
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showAddDependentModal, setShowAddDependentModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeAlarmAlert, setActiveAlarmAlert] = useState(null);

  // Formulário de Novo Evento
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    category: 'escola',
    targetMemberId: 'user_rodrigo',
    notifyMemberIds: ['user_rodrigo'],
    alarms: { dayBefore: true, hourBefore: true, min15Before: true }
  });

  // Formulário de Novo Dependente
  const [newDependent, setNewDependent] = useState({
    name: '',
    guardians: ['user_rodrigo']
  });

  // Copiar Código de Convite
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(familyGroup.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Alternar Destinatário de Notificação no Formulário
  const toggleNotifyMember = (uid) => {
    setNewEvent(prev => {
      const exists = prev.notifyMemberIds.includes(uid);
      const updated = exists 
        ? prev.notifyMemberIds.filter(id => id !== uid)
        : [...prev.notifyMemberIds, uid];
      return { ...prev, notifyMemberIds: updated };
    });
  };

  // Quando escolhe para quem é a tarefa, pré-seleciona responsáveis se for menor
  const handleTargetMemberChange = (memberId) => {
    const selectedMember = familyGroup.members.find(m => m.uid === memberId);
    let defaultNotify = [currentUser.uid];

    if (selectedMember && selectedMember.isDependent && selectedMember.guardians) {
      defaultNotify = [...selectedMember.guardians];
    } else if (selectedMember && !selectedMember.isDependent) {
      defaultNotify = [selectedMember.uid, currentUser.uid];
    }

    setNewEvent(prev => ({
      ...prev,
      targetMemberId: memberId,
      notifyMemberIds: Array.from(new Set(defaultNotify))
    }));
  };

  // Criar Novo Evento
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    const created = {
      ...newEvent,
      id: Date.now().toString(),
      completed: false,
      createdBy: currentUser.displayName
    };

    setEvents([created, ...events]);
    setShowNewEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '09:00',
      category: 'escola',
      targetMemberId: currentUser.uid,
      notifyMemberIds: [currentUser.uid],
      alarms: { dayBefore: true, hourBefore: true, min15Before: true }
    });
  };

  // Criar Novo Dependente (Menor)
  const handleCreateDependent = (e) => {
    e.preventDefault();
    if (!newDependent.name) return;

    const depObj = {
      uid: `dep_${Date.now()}`,
      name: newDependent.name,
      role: 'dependent',
      guardians: newDependent.guardians,
      isDependent: true
    };

    setFamilyGroup(prev => ({
      ...prev,
      members: [...prev.members, depObj]
    }));

    setShowAddDependentModal(false);
    setNewDependent({ name: '', guardians: [currentUser.uid] });
  };

  // Marcar como Concluído
  const toggleComplete = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, completed: !ev.completed } : ev));
  };

  // Deletar Evento
  const deleteEvent = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  // Disparar Alarme de Teste
  const triggerTestAlarm = (eventObj, timing) => {
    setActiveAlarmAlert({
      title: eventObj.title,
      time: eventObj.time,
      timingText: timing === 'dayBefore' ? '1 dia antes' : timing === 'hourBefore' ? '1 hora antes' : '15 minutos antes',
      target: familyGroup.members.find(m => m.uid === eventObj.targetMemberId)?.name || 'Membro'
    });
  };

  // Eventos Filtrados
  const filteredEvents = events.filter(ev => {
    // Filtro por Membro
    if (filterMember !== 'all') {
      const isTarget = ev.targetMemberId === filterMember;
      const isNotified = ev.notifyMemberIds.includes(filterMember);
      if (!isTarget && !isNotified) return false;
    }
    // Filtro por Categoria
    if (filterCategory !== 'all' && ev.category !== filterCategory) return false;
    // Filtro Concluídos
    if (!showCompleted && ev.completed) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* CABEÇALHO */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{familyGroup.name}</h1>
              <p className="text-xs text-indigo-100 flex items-center gap-1">
                <Users className="w-3 h-3" /> Agenda Compartilhada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Guia de Instalação */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-xs bg-indigo-500/50 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 border border-indigo-400/30"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Como Hospedar / Instalar
            </button>

            {/* Alternar Perfil de Teste */}
            <div className="bg-indigo-700/50 p-1 rounded-xl flex items-center border border-indigo-500/30 text-xs">
              <select
                value={currentUser.uid}
                onChange={(e) => {
                  const sel = familyGroup.members.find(m => m.uid === e.target.value);
                  if (sel) {
                    setCurrentUser({
                      uid: sel.uid,
                      displayName: sel.name,
                      email: sel.email || 'membro@familia.com',
                      role: sel.role === 'master' ? 'master' : 'member'
                    });
                  }
                }}
                className="bg-transparent text-white border-none outline-none font-medium cursor-pointer px-2 py-1"
              >
                {familyGroup.members.filter(m => !m.isDependent).map(m => (
                  <option key={m.uid} value={m.uid} className="text-slate-800">
                    {m.name} ({m.role === 'master' ? 'Master' : 'Membro'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* PAINEL PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* BARRA DE NAVEGAÇÃO E AÇÕES */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" /> Atividades
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Mês / Agenda
            </button>
            <button
              onClick={() => setViewMode('family')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'family' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Família ({familyGroup.members.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-indigo-200/60"
            >
              <UserPlus className="w-4 h-4" /> Convite Família
            </button>

            {currentUser.role === 'master' && (
              <button
                onClick={() => setShowNewEventModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Agendar Atividade
              </button>
            )}
          </div>
        </div>

        {/* VISÃO: LISTA DE ATIVIDADES */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* FILTROS */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filtrar:
                </span>
                
                {/* Filtro por Pessoa */}
                <select
                  value={filterMember}
                  onChange={(e) => setFilterMember(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none font-medium"
                >
                  <option value="all">Toda a Família</option>
                  {familyGroup.members.map(m => (
                    <option key={m.uid} value={m.uid}>
                      {m.name} {m.isDependent ? '(Menor)' : ''}
                    </option>
                  ))}
                </select>

                {/* Filtro por Categoria */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none font-medium"
                >
                  <option value="all">Todas as Categorias</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Exibir Concluídas
              </label>
            </div>

            {/* LISTA DE EVENTOS */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-slate-600 font-semibold">Nenhuma atividade encontrada</h3>
                <p className="text-xs text-slate-400">Tente mudar os filtros de pessoa/categoria ou criar uma nova atividade.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredEvents.map(event => {
                  const category = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[0];
                  const targetMember = familyGroup.members.find(m => m.uid === event.targetMemberId);
                  const isUserNotified = event.notifyMemberIds.includes(currentUser.uid);

                  return (
                    <div 
                      key={event.id}
                      className={`bg-white rounded-2xl p-4 border transition hover:shadow-md ${
                        event.completed ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleComplete(event.id)}
                            className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition ${
                              event.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                            {event.completed && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${category.bgLight} ${category.text} ${category.border}`}>
                                {category.label}
                              </span>

                              {targetMember && (
                                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" />
                                  {targetMember.name} {targetMember.isDependent && <span className="text-[9px] text-amber-600 font-bold">(Menor)</span>}
                                </span>
                              )}
                            </div>

                            <h3 className={`font-semibold text-slate-800 ${event.completed ? 'line-through text-slate-400' : ''}`}>
                              {event.title}
                            </h3>

                            {event.description && (
                              <p className="text-xs text-slate-500">{event.description}</p>
                            )}

                            {/* Data e Hora */}
                            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {event.date}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> {event.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ações e Alertas */}
                        <div className="flex flex-col items-end gap-2">
                          {currentUser.role === 'master' && (
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Badge de Avisos para Quem Vai Tocar */}
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block mb-1">Alarmes ativos para:</span>
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              {event.notifyMemberIds.map(uid => {
                                const m = familyGroup.members.find(mem => mem.uid === uid);
                                if (!m) return null;
                                return (
                                  <span 
                                    key={uid} 
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                      uid === currentUser.uid ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {m.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Botões de Simulação de Alarme */}
                          <div className="flex items-center gap-1 pt-1">
                            <span className="text-[9px] text-slate-400">Testar:</span>
                            {event.alarms.dayBefore && (
                              <button
                                onClick={() => triggerTestAlarm(event, 'dayBefore')}
                                className="text-[9px] bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-1.5 py-0.5 rounded border border-slate-200 transition"
                                title="Simular alarme 1 dia antes"
                              >
                                1 Dia
                              </button>
                            )}
                            {event.alarms.hourBefore && (
                              <button
                                onClick={() => triggerTestAlarm(event, 'hourBefore')}
                                className="text-[9px] bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-1.5 py-0.5 rounded border border-slate-200 transition"
                                title="Simular alarme 1 hora antes"
                              >
                                1h
                              </button>
                            )}
                            {event.alarms.min15Before && (
                              <button
                                onClick={() => triggerTestAlarm(event, 'min15Before')}
                                className="text-[9px] bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-1.5 py-0.5 rounded border border-slate-200 transition"
                                title="Simular alarme 15 min antes"
                              >
                                15m
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VISÃO: GRADE MENSAL / GOOGLE AGENDA */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="font-bold text-slate-800 text-lg">Outubro / Novembro 2026</h2>
              <p className="text-xs text-slate-500">Histórico e Visão Mensal de Compromissos</p>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 py-2">
              <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs">
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);

                return (
                  <div 
                    key={i} 
                    className="min-h-[80px] p-1.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-indigo-50/30 transition flex flex-col justify-between"
                  >
                    <span className="font-bold text-slate-500 text-[11px]">{dayNum}</span>
                    <div className="space-y-1">
                      {dayEvents.map(ev => {
                        const cat = CATEGORIES.find(c => c.id === ev.category);
                        return (
                          <div 
                            key={ev.id} 
                            className={`text-[9px] truncate px-1 py-0.5 rounded text-white font-medium ${cat?.color || 'bg-slate-400'}`}
                            title={`${ev.time} - ${ev.title}`}
                          >
                            {ev.time} {ev.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISÃO: GESTÃO DA FAMÍLIA E DEPENDENTES */}
        {viewMode === 'family' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Integrantes da Família</h2>
                  <p className="text-xs text-slate-500">Membros com conta e dependentes/menores sem conta</p>
                </div>

                {currentUser.role === 'master' && (
                  <button
                    onClick={() => setShowAddDependentModal(true)}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> + Adicionar Dependente (Menor)
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {familyGroup.members.map(member => (
                  <div 
                    key={member.uid} 
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        member.isDependent ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm">{member.name}</h4>
                          {member.isDependent ? (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Menor / Dependente</span>
                          ) : (
                            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                              {member.role === 'master' ? 'Master' : 'Membro'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {member.isDependent 
                            ? `Responsáveis: ${member.guardians?.map(gId => familyGroup.members.find(m => m.uid === gId)?.name).join(', ')}`
                            : member.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ALERTA SONORO/SIMULADO */}
      {activeAlarmAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/50 max-w-sm animate-bounce">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Bell className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">
                🔔 ALARME DISPARADO ({activeAlarmAlert.timingText})
              </span>
              <h4 className="font-bold text-sm">{activeAlarmAlert.title}</h4>
              <p className="text-xs text-slate-300">Horário: {activeAlarmAlert.time} | Para: {activeAlarmAlert.target}</p>
            </div>
            <button 
              onClick={() => setActiveAlarmAlert(null)}
              className="text-slate-400 hover:text-white font-bold text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NOVO EVENTO */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800">Agendar Nova Atividade Familiar</h3>
              <button onClick={() => setShowNewEventModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título do Compromisso</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta da Adriana no Médico"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Categoria</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* SELEÇÃO DE PARA QUEM É A ATIVIDADE */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Para quem é esta atividade?</label>
                <select
                  value={newEvent.targetMemberId}
                  onChange={(e) => handleTargetMemberChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500 font-medium"
                >
                  {familyGroup.members.map(m => (
                    <option key={m.uid} value={m.uid}>
                      {m.name} {m.isDependent ? '(Menor / Dependente)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELEÇÃO DE QUEM VAI RECEBER O ALARME (ALARMES DIRECIONADOS) */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <label className="block text-indigo-900 font-bold">
                  🔔 Para quem o ALARME deve tocar?
                </label>
                <p className="text-[11px] text-indigo-700">
                  Selecione quais celulares vão apitar com os avisos prévios.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {familyGroup.members.filter(m => !m.isDependent).map(member => {
                    const isChecked = newEvent.notifyMemberIds.includes(member.uid);
                    return (
                      <label 
                        key={member.uid}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                          isChecked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleNotifyMember(member.uid)}
                          className="hidden"
                        />
                        <span className="font-semibold">{member.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* CONFIGURAÇÃO DE TEMPOS DO ALARME */}
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Antecedência dos Alarmes:</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 p-2 bg-slate-50 border rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.alarms.dayBefore}
                      onChange={(e) => setNewEvent({ ...newEvent, alarms: { ...newEvent.alarms, dayBefore: e.target.checked } })}
                    />
                    <span>1 Dia Antes</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 bg-slate-50 border rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.alarms.hourBefore}
                      onChange={(e) => setNewEvent({ ...newEvent, alarms: { ...newEvent.alarms, hourBefore: e.target.checked } })}
                    />
                    <span>1 Hora Antes</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 bg-slate-50 border rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.alarms.min15Before}
                      onChange={(e) => setNewEvent({ ...newEvent, alarms: { ...newEvent.alarms, min15Before: e.target.checked } })}
                    />
                    <span>15 Min Antes</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Observações / Detalhes</label>
                <textarea
                  rows="2"
                  placeholder="Endereço, recomendações, exames a levar..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO DEPENDENTE (MENOR) */}
      {showAddDependentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800">Cadastrar Menor / Dependente</h3>
              <button onClick={() => setShowAddDependentModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateDependent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Menor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sofia, Lucas..."
                  value={newDependent.name}
                  onChange={(e) => setNewDependent({ ...newDependent, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Responsáveis Legais:</label>
                <div className="space-y-1.5">
                  {familyGroup.members.filter(m => !m.isDependent).map(adult => (
                    <label key={adult.uid} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newDependent.guardians.includes(adult.uid)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewDependent(prev => ({
                            ...prev,
                            guardians: checked 
                              ? [...prev.guardians, adult.uid]
                              : prev.guardians.filter(id => id !== adult.uid)
                          }));
                        }}
                        className="rounded text-amber-600"
                      />
                      <span>{adult.name} ({adult.email})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDependentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md"
                >
                  Cadastrar Dependente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVITAR FAMÍLIA */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Convite para a Família</h3>
            <p className="text-xs text-slate-500">
              Envie este código para a **Adriana**, **Jessica** ou **Milena** se juntarem à sua agenda familiar:
            </p>

            <div className="p-3 bg-slate-100 rounded-xl font-mono text-base font-bold text-indigo-700 flex items-center justify-between border">
              <span>{familyGroup.inviteCode}</span>
              <button 
                onClick={handleCopyInvite}
                className="p-1.5 bg-white text-slate-600 hover:text-indigo-600 rounded-lg shadow-sm border transition"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GUIA DE HOSPEDAGEM */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-base border-b pb-2">Como colocar este app no seu celular</h3>
            <ol className="list-decimal list-inside space-y-2.5 text-slate-600">
              <li><strong>StackBlitz:</strong> Cole este arquivo `App.jsx` no StackBlitz e instale a dependência `lucide-react`.</li>
              <li><strong>GitHub:</strong> Clique no botão de enviar para o seu repositório do GitHub.</li>
              <li><strong>Vercel:</strong> Conecte sua conta do GitHub na Vercel para publicar o app de graça.</li>
              <li><strong>No Celular (PWA):</strong> Abra o link da Vercel no Chrome do seu Android, clique nos 3 pontinhos e selecione <em>"Adicionar à Tela Inicial"</em>.</li>
            </ol>
            <button 
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}