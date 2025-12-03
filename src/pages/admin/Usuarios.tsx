import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  User,
  Mail,
  MoreHorizontal,
  Shield,
  Store,
  UserCircle,
  Plus,
  Edit,
  KeyRound,
  Ban,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { adminAPI, type User as UsuarioType } from "@/services/adminAPI";

const tipoConfig = {
  cliente: { label: "Cliente", icon: UserCircle, variant: "soft-secondary" as const, color: "text-blue-600" },
  salao: { label: "Salão", icon: Store, variant: "soft-primary" as const, color: "text-purple-600" },
  admin: { label: "Admin", icon: Shield, variant: "default" as const, color: "text-red-600" },
};

const statusConfig = {
  ativo: { label: "Ativo", variant: "success" as const },
  inativo: { label: "Inativo", variant: "secondary" as const },
  pendente: { label: "Pendente", variant: "warning" as const },
};

export default function AdminUsuarios() {
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioType | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "cliente" as "admin" | "salao" | "cliente",
    status: "ativo" as "ativo" | "inativo" | "pendente",
  });

  useEffect(() => {
    loadUsuarios();
  }, [tipoFiltro, statusFiltro]);

  const loadUsuarios = async () => {
    setLoading(true);
    const filters: any = {};
    if (tipoFiltro !== "todos") filters.tipo = tipoFiltro;
    if (statusFiltro !== "todos") filters.status = statusFiltro;

    const { data, error } = await adminAPI.getUsers(filters);
    if (!error && data) {
      setUsuarios(data);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      tipo: "cliente",
      status: "ativo",
    });
    setCreateDialog(true);
  };

  const handleEdit = (usuario: UsuarioType) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      tipo: usuario.tipo,
      status: usuario.status,
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return;
    }

    const userData: Partial<UsuarioType> = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone || undefined,
      tipo: formData.tipo,
      status: formData.status,
    };

    if (editingUser) {
      const { error } = await adminAPI.updateUser(editingUser.id, userData);
      if (!error) {
        setEditDialog(false);
        await loadUsuarios();
      }
    } else {
      const { error } = await adminAPI.createUser(userData);
      if (!error) {
        setCreateDialog(false);
        await loadUsuarios();
      }
    }
  };

  const handleToggleStatus = async (usuario: UsuarioType) => {
    const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";
    const { error } = await adminAPI.updateUser(usuario.id, { status: novoStatus });
    if (!error) {
      await loadUsuarios();
    }
  };

  const handleResetPassword = async (usuario: UsuarioType) => {
    if (!confirm(`Enviar email de recuperação de senha para ${usuario.email}?`)) {
      return;
    }
    await adminAPI.resetUserPassword(usuario.email);
  };

  const handleDelete = async (usuario: UsuarioType) => {
    if (!confirm(`Tem certeza que deseja desativar o usuário ${usuario.nome}?`)) {
      return;
    }
    await adminAPI.deleteUser(usuario.id);
    await loadUsuarios();
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === "ativo").length,
    clientes: usuarios.filter(u => u.tipo === "cliente").length,
    saloes: usuarios.filter(u => u.tipo === "salao").length,
  };

  return (
    <AdminLayout
      title="Usuários"
      description="Gerencie todos os usuários da plataforma."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{stats.ativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{stats.clientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salões</p>
                <p className="text-2xl font-bold">{stats.saloes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle className="flex-1">Lista de Usuários</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-48"
              />
            </div>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="salao">Salão</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuário</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">E-mail</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Telefone</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((usuario) => {
                      const tipo = tipoConfig[usuario.tipo];
                      const status = statusConfig[usuario.status];
                      const TipoIcon = tipo.icon;

                      return (
                        <tr
                          key={usuario.id}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {usuario.nome
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{usuario.nome}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {usuario.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {usuario.telefone || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={tipo.variant} className="gap-1">
                              <TipoIcon className="h-3 w-3" />
                              {tipo.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(usuario)} className="gap-2">
                                  <Edit className="h-4 w-4" />
                                  Editar usuário
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(usuario)} className="gap-2">
                                  <KeyRound className="h-4 w-4" />
                                  Resetar senha
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStatus(usuario)} className="gap-2">
                                  {usuario.status === "ativo" ? (
                                    <>
                                      <Ban className="h-4 w-4" />
                                      Desativar
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      Ativar
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredUsuarios.map((usuario) => {
                  const tipo = tipoConfig[usuario.tipo];
                  const status = statusConfig[usuario.status];
                  const TipoIcon = tipo.icon;

                  return (
                    <Card key={usuario.id} variant="interactive">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">
                                {usuario.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{usuario.nome}</h3>
                              <p className="text-sm text-muted-foreground">{usuario.email}</p>
                              {usuario.telefone && (
                                <p className="text-xs text-muted-foreground mt-1">{usuario.telefone}</p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(usuario)} className="gap-2">
                                <Edit className="h-4 w-4" />
                                Editar usuário
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(usuario)} className="gap-2">
                                <KeyRound className="h-4 w-4" />
                                Resetar senha
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleStatus(usuario)} className="gap-2">
                                {usuario.status === "ativo" ? (
                                  <>
                                    <Ban className="h-4 w-4" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={tipo.variant} className="gap-1">
                            <TipoIcon className="h-3 w-3" />
                            {tipo.label}
                          </Badge>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredUsuarios.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Nenhum usuário encontrado.</p>
                  <Button onClick={handleCreate} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Usuário
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário. Um email será enviado com as instruções de acesso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Usuário *</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="salao">Salão</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome Completo *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo de Usuário *</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="salao">Salão</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
