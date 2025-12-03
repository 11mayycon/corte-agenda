import { useEffect, useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, DollarSign, HelpCircle, Scissors } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { salaoAPI, type Servico } from "@/services/salaoAPI";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function LojaServicos() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    duracao_minutos: "",
    preco: "",
    categoria: "",
  });

  useEffect(() => {
    loadLojaId();
  }, [user]);

  useEffect(() => {
    if (lojaId) {
      loadServicos();
    }
  }, [lojaId]);

  const loadLojaId = async () => {
    if (!user) return;

    // Buscar a loja associada ao usuário via usuarios_lojas
    const { data, error } = await supabase
      .from('usuarios_lojas')
      .select('loja_id')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setLojaId(data.loja_id);
    } else {
      // Fallback: buscar primeira loja disponível para demonstração
      const { data: lojas } = await supabase
        .from('lojas')
        .select('id')
        .limit(1)
        .single();
      
      if (lojas) {
        setLojaId(lojas.id);
      } else {
        toast.error('Nenhuma loja encontrada. Configure sua loja primeiro.');
        setLoading(false);
      }
    }
  };

  const loadServicos = async () => {
    if (!lojaId) return;

    setLoading(true);
    const { data, error } = await salaoAPI.getServicos(lojaId);
    if (!error && data) {
      setServicos(data);
    }
    setLoading(false);
  };

  const formatPrice = (cents: number | null) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format((cents || 0) / 100);
  };

  const handleOpenDialog = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        descricao: servico.descricao || "",
        duracao_minutos: servico.duracao_minutos.toString(),
        preco: ((servico.preco_centavos || 0) / 100).toFixed(2),
        categoria: servico.categoria || "",
      });
    } else {
      setEditingServico(null);
      setFormData({
        nome: "",
        descricao: "",
        duracao_minutos: "30",
        preco: "",
        categoria: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!lojaId) {
      toast.error('Loja não identificada');
      return;
    }

    if (!formData.nome || !formData.duracao_minutos || !formData.preco) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const servicoData = {
      loja_id: lojaId,
      nome: formData.nome,
      descricao: formData.descricao,
      duracao_minutos: parseInt(formData.duracao_minutos),
      preco_centavos: Math.round(parseFloat(formData.preco) * 100),
      categoria: formData.categoria,
      ativo: editingServico?.ativo ?? true,
    };

    if (editingServico) {
      const { error } = await salaoAPI.updateServico(editingServico.id, servicoData);
      if (!error) {
        await loadServicos();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await salaoAPI.createServico(servicoData);
      if (!error) {
        await loadServicos();
        setIsDialogOpen(false);
      }
    }
  };

  const toggleAtivo = async (servico: Servico) => {
    const { error } = await salaoAPI.updateServico(servico.id, {
      ativo: !servico.ativo
    });

    if (!error) {
      await loadServicos();
      toast.success(`Serviço ${!servico.ativo ? 'ativado' : 'desativado'} com sucesso!`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este serviço?')) {
      return;
    }

    const { error } = await salaoAPI.deleteServico(id);
    if (!error) {
      await loadServicos();
    }
  };

  const servicosAtivos = servicos.filter(s => s.ativo);
  const servicosInativos = servicos.filter(s => !s.ativo);

  return (
    <LojaLayout
      title="Serviços"
      description="Gerencie os serviços oferecidos pelo seu salão."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Serviços</p>
                <p className="text-2xl font-bold">{servicos.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Serviços Ativos</p>
                <p className="text-2xl font-bold text-green-600">{servicosAtivos.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Scissors className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-primary">
                  {servicos.length > 0
                    ? formatPrice(
                        Math.round(
                          servicos.reduce((acc, s) => acc + (s.preco_centavos || 0), 0) /
                            servicos.length
                        )
                      )
                    : "R$ 0,00"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Lista de Serviços</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Cadastre os serviços que seu salão oferece</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button variant="default" size="sm" onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : servicos.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece cadastrando os serviços que você oferece
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Serviço
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Services */}
              {servicosAtivos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Ativos ({servicosAtivos.length})
                  </h3>
                  {servicosAtivos.map((servico) => (
                    <div
                      key={servico.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Scissors className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{servico.nome}</h3>
                          {servico.descricao && (
                            <p className="text-sm text-muted-foreground truncate">
                              {servico.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {servico.duracao_minutos} min
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-primary">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatPrice(servico.preco_centavos)}
                            </span>
                            {servico.categoria && (
                              <Badge variant="secondary" className="text-xs">
                                {servico.categoria}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={servico.ativo}
                          onCheckedChange={() => toggleAtivo(servico)}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDialog(servico)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(servico.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inactive Services */}
              {servicosInativos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Inativos ({servicosInativos.length})
                  </h3>
                  {servicosInativos.map((servico) => (
                    <div
                      key={servico.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 opacity-60"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Scissors className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{servico.nome}</h3>
                            <Badge variant="secondary">Inativo</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {servico.duracao_minutos} min
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatPrice(servico.preco_centavos)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={servico.ativo}
                          onCheckedChange={() => toggleAtivo(servico)}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDialog(servico)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingServico ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do serviço abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Serviço *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Corte Masculino"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o serviço..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria (opcional)</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: Cortes, Barba, Tratamentos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (min) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  placeholder="45.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingServico ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LojaLayout>
  );
}
