import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Store,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { lojasAPI, type Loja } from "@/services/adminAPI";
import { cn } from "@/lib/utils";

export default function AdminLojas() {
  const [loading, setLoading] = useState(true);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [filteredLojas, setFilteredLojas] = useState<Loja[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [cidadeFilter, setCidadeFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cnpj: "",
    horario_abertura: "08:00",
    horario_fechamento: "18:00",
    status: "ativo" as "ativo" | "inativo" | "pendente",
  });

  useEffect(() => {
    loadLojas();
  }, []);

  useEffect(() => {
    filterLojas();
  }, [searchTerm, statusFilter, cidadeFilter, lojas]);

  const loadLojas = async () => {
    setLoading(true);
    const { data, error } = await lojasAPI.getLojas();
    if (!error && data) {
      setLojas(data);
    }
    setLoading(false);
  };

  const filterLojas = () => {
    let filtered = [...lojas];

    if (searchTerm) {
      filtered = filtered.filter(
        (loja) =>
          loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loja.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loja.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((loja) => loja.status === statusFilter);
    }

    if (cidadeFilter !== "todos") {
      filtered = filtered.filter((loja) => loja.cidade === cidadeFilter);
    }

    setFilteredLojas(filtered);
  };

  const cidades = Array.from(new Set(lojas.map((l) => l.cidade).filter(Boolean)));

  const handleOpenDialog = (loja?: Loja) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({
        nome: loja.nome,
        email: loja.email,
        telefone: loja.telefone || "",
        endereco: loja.endereco,
        cidade: loja.cidade,
        estado: loja.estado,
        cnpj: loja.cnpj || "",
        horario_abertura: loja.horario_abertura || "08:00",
        horario_fechamento: loja.horario_fechamento || "18:00",
        status: loja.status,
      });
    } else {
      setEditingLoja(null);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
        cnpj: "",
        horario_abertura: "08:00",
        horario_fechamento: "18:00",
        status: "ativo",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.cidade) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const lojaData: Partial<Loja> = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      endereco: formData.endereco,
      cidade: formData.cidade,
      estado: formData.estado,
      cnpj: formData.cnpj,
      horario_abertura: formData.horario_abertura,
      horario_fechamento: formData.horario_fechamento,
      status: formData.status,
      dias_funcionamento: ["1", "2", "3", "4", "5", "6"], // Segunda a sábado
    };

    if (editingLoja) {
      const { error } = await lojasAPI.updateLoja(editingLoja.id, lojaData);
      if (!error) {
        await loadLojas();
        setDialogOpen(false);
      }
    } else {
      const { error } = await lojasAPI.createLoja(lojaData);
      if (!error) {
        await loadLojas();
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (loja: Loja) => {
    if (!confirm(`Tem certeza que deseja desativar a loja "${loja.nome}"?`)) {
      return;
    }

    const { error } = await lojasAPI.deleteLoja(loja.id);
    if (!error) {
      await loadLojas();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="success">Ativo</Badge>;
      case "inativo":
        return <Badge variant="secondary">Inativo</Badge>;
      case "pendente":
        return <Badge variant="warning">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout
      title="Gestão de Lojas"
      description="Gerencie todas as lojas cadastradas na plataforma."
    >
      {/* Filters and Actions */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>

            {/* Cidade Filter */}
            <Select value={cidadeFilter} onValueChange={setCidadeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Cidades</SelectItem>
                {cidades.map((cidade) => (
                  <SelectItem key={cidade} value={cidade || ""}>
                    {cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Button */}
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Loja
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredLojas.length} de {lojas.length} lojas
        </p>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredLojas.length === 0 ? (
            <div className="p-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma loja encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "todos" || cidadeFilter !== "todos"
                  ? "Tente ajustar os filtros"
                  : "Comece criando sua primeira loja"}
              </p>
              {!searchTerm && statusFilter === "todos" && cidadeFilter === "todos" && (
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Loja
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLojas.map((loja) => (
                  <TableRow key={loja.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{loja.nome}</p>
                          <p className="text-sm text-muted-foreground">{loja.cnpj || "CNPJ não informado"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {loja.cidade}, {loja.estado}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{loja.endereco}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{loja.email}</span>
                        </div>
                        {loja.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{loja.telefone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {loja.horario_abertura} - {loja.horario_fechamento}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(loja.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDialog(loja)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(loja)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoja ? "Editar Loja" : "Nova Loja"}
            </DialogTitle>
            <DialogDescription>
              {editingLoja
                ? "Atualize as informações da loja"
                : "Cadastre uma nova loja na plataforma"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Loja *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Barbearia Premium"
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@barbearia.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            {/* CNPJ */}
            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>

            {/* Endereço */}
            <div className="grid gap-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua das Flores, 123"
              />
            </div>

            {/* Cidade e Estado */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="São Paulo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Horários */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="horario_abertura">Horário de Abertura</Label>
                <Input
                  id="horario_abertura"
                  type="time"
                  value={formData.horario_abertura}
                  onChange={(e) =>
                    setFormData({ ...formData, horario_abertura: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="horario_fechamento">Horário de Fechamento</Label>
                <Input
                  id="horario_fechamento"
                  type="time"
                  value={formData.horario_fechamento}
                  onChange={(e) =>
                    setFormData({ ...formData, horario_fechamento: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingLoja ? "Salvar Alterações" : "Criar Loja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
