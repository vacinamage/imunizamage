import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Send, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { VACCINE_CATALOG } from '../../data/vaccineCatalog';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestItem {
  vaccineId: string;
  name: string;
  quantity: number;
  localStock: number;
}

export const OrderVaccines = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [selectedItems, setSelectedItems] = useState<RequestItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredVaccines = useMemo(() => {
    return VACCINE_CATALOG.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'Todas' || v.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filter]);

 const addToRequest = (vaccine: any) => {
  const qty = quantities[vaccine.id] || 0;
  const localStock = localStocks[vaccine.id] || 0;

  if (qty <= 0) return;

  setSelectedItems((prev) => {
    const existing = prev.find(
      (item) => item.vaccineId === vaccine.id
    );

    if (existing) {
      return prev.map((item) =>
        item.vaccineId === vaccine.id
          ? {
              ...item,
              quantity: item.quantity + qty,
              localStock,
            }
          : item
      );
    }

    return [
      ...prev,
      {
        vaccineId: vaccine.id,
        name: vaccine.name,
        quantity: qty,
        localStock,
      },
    ];
  });

  setQuantities((prev) => ({
    ...prev,
    [vaccine.id]: 0,
  }));

  setLocalStocks((prev) => ({
    ...prev,
    [vaccine.id]: 0,
  }));

  console.log('Vacina adicionada à solicitação.');
};

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.vaccineId !== id));
  };

  const totalDoses = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleSendRequest = () => {
    setShowConfirmModal(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/app/solicitações');
    }, 2500);
  };

  if (showSuccess) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Solicitação enviada com sucesso!</h1>
        <p className="text-slate-500 mt-2">Você está sendo redirecionado para o histórico de solicitações...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pedir Vacinas</h1>
        <p className="text-slate-500 mt-1">Selecione as vacinas desejadas e informe as quantidades para montar sua solicitação.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Lado Esquerdo: Catálogo */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar vacina..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-brand-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['Todas', 'COVID', 'Rotina', 'Campanhas'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredVaccines.map(vaccine => (
              <Card key={vaccine.id} className="group hover:border-brand-300 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <Badge
  status={
    vaccine.category === 'COVID'
      ? 'PENDING'
      : vaccine.category === 'Campanhas'
        ? 'ACTIVE'
        : 'PROCESSING'
  }
>
  {vaccine.category}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400">Atu: {vaccine.updatedAt}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{vaccine.name}</h3>
                <div className="mt-4 flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xs text-slate-500 font-medium">Estoque disponível:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vaccine.stock.toLocaleString()} doses</span>
                </div>
                
                <div className="mt-6 space-y-3">
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-500">
        Estoque atual da unidade
      </label>

      <input
        type="number"
        min="0"
        placeholder="Quantidade em estoque"
        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
        value={localStocks[vaccine.id] ?? ''}
        onChange={(event) =>
          setLocalStocks((prev) => ({
            ...prev,
            [vaccine.id]:
              event.target.value === ''
                ? 0
                : Number(event.target.value),
          }))
        }
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-bold text-slate-500">
        Quantidade solicitada
      </label>

      <input
        type="number"
        min="1"
        placeholder="Quantidade do pedido"
        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
        value={quantities[vaccine.id] ?? ''}
        onChange={(event) =>
          setQuantities((prev) => ({
            ...prev,
            [vaccine.id]:
              event.target.value === ''
                ? 0
                : Number(event.target.value),
          }))
        }
      />
    </div>
  </div>

  <Button
    className="w-full text-xs"
    disabled={
      !quantities[vaccine.id] ||
      localStocks[vaccine.id] === undefined
    }
    onClick={() => addToRequest(vaccine)}
  >
    <Plus size={14} />
    Adicionar
  </Button>
</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Lado Direito: Resumo (Sticky) */}
        <aside className="xl:sticky xl:top-24 space-y-4">
          <Card className="border-2 border-brand-100 dark:border-brand-900/30">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Info size={20} className="text-brand-600" />
              Resumo da Solicitação
            </h2>
            
            <div className="space-y-3 text-sm border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex justify-between text-slate-500">
                <span>Unidade:</span>
                <span className="font-bold text-slate-900 dark:text-white">Central de Imunização</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Itens:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedItems.length} vacinas</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total doses:</span>
                <span className="font-bold text-brand-600">{totalDoses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Data:</span>
                <span className="font-bold text-slate-900 dark:text-white">15/07/2024</span>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 mb-6 pr-2">
              <AnimatePresence>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 italic text-xs">
                    Nenhuma vacina selecionada
                  </div>
                ) : (
                  selectedItems.map(item => (
                    <motion.div 
                      key={item.vaccineId}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-brand-600 font-bold">{item.quantity.toLocaleString()} doses</p>
                      </div>
                      <button onClick={() => removeItem(item.vaccineId)} className="p-1 text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full text-slate-500 hover:text-red-500" 
                disabled={selectedItems.length === 0}
                onClick={() => setSelectedItems([])}
              >
                Limpar solicitação
              </Button>
              <Button 
                className="w-full py-3 font-bold" 
                disabled={selectedItems.length === 0}
                onClick={() => setShowConfirmModal(true)}
              >
                <Send size={18} className="mr-2" /> Enviar Solicitação
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold">Confirmar Envio?</h3>
              <p className="text-slate-500 mt-2 text-sm">
                Esta ação enviará sua solicitação para a Central Municipal e não poderá ser desfeita até a análise técnica.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                <Button onClick={handleSendRequest}>Confirmar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};