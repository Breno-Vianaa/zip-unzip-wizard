import React, { useState } from 'react';
import { useAuth, UserPermissions, Permission } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings } from 'lucide-react';

interface PermissionsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (permissions: UserPermissions) => void;
    currentPermissions?: UserPermissions;
    userType?: string;
}

interface ModuleInfo {
    key: keyof UserPermissions;
    name: string;
    description: string;
    icon: string;
}

const modules: ModuleInfo[] = [
    {
        key: 'produtos',
        name: 'Produtos',
        description: 'Gestão do catálogo de produtos',
        icon: '📦'
    },
    {
        key: 'vendas',
        name: 'Vendas',
        description: 'Processamento e acompanhamento de vendas',
        icon: '💰'
    },
    {
        key: 'clientes',
        name: 'Clientes',
        description: 'Cadastro e gestão de clientes',
        icon: '👥'
    },
    {
        key: 'fornecedores',
        name: 'Fornecedores',
        description: 'Gestão de fornecedores e parcerias',
        icon: '🏢'
    },
    {
        key: 'estoque',
        name: 'Estoque',
        description: 'Controle de inventário e movimentações',
        icon: '📊'
    },
    {
        key: 'relatorios',
        name: 'Relatórios',
        description: 'Análises e relatórios de desempenho',
        icon: '📈'
    },
    {
        key: 'financeiro',
        name: 'Financeiro',
        description: 'Gestão financeira e contábil',
        icon: '💳'
    },
    {
        key: 'usuarios',
        name: 'Usuários',
        description: 'Gerenciamento de usuários do sistema',
        icon: '👤'
    },
    {
        key: 'configuracoes',
        name: 'Configurações',
        description: 'Configurações globais do sistema',
        icon: '⚙️'
    }
];

const actions: { key: keyof Permission; name: string; description: string }[] = [
    { key: 'view', name: 'Visualizar', description: 'Pode ver informações do módulo' },
    { key: 'create', name: 'Criar', description: 'Pode criar novos registros' },
    { key: 'edit', name: 'Editar', description: 'Pode modificar registros existentes' },
    { key: 'delete', name: 'Excluir', description: 'Pode remover registros' }
];

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({
    isOpen,
    onClose,
    onSave,
    currentPermissions,
    userType
}) => {
    const { user, getDefaultPermissions } = useAuth();
    const [permissions, setPermissions] = useState<UserPermissions>(
        currentPermissions || getDefaultPermissions('vendedor')
    );

    const handlePermissionChange = (module: keyof UserPermissions, action: keyof Permission, checked: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: checked
            }
        }));
    };

    const handlePresetLoad = (type: 'admin' | 'gerente' | 'vendedor') => {
        setPermissions(getDefaultPermissions(type));
    };

    const handleSave = () => {
        onSave(permissions);
        onClose();
    };

    // Verificar se usuário pode gerenciar permissões
    if (user?.tipo !== 'admin') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Acesso Negado
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        Apenas administradores podem gerenciar permissões.
                    </p>
                    <Button onClick={onClose} variant="outline">
                        Fechar
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Gerenciar Permissões
                    </DialogTitle>
                    <DialogDescription>
                        Configure as permissões por módulo e ação para este usuário
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Presets rápidos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Modelos Rápidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePresetLoad('vendedor')}
                                >
                                    Vendedor
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePresetLoad('gerente')}
                                >
                                    Gerente
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePresetLoad('admin')}
                                >
                                    Administrador
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grid de permissões */}
                    <div className="space-y-4">
                        {modules.map((module) => (
                            <Card key={module.key}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <span className="text-2xl">{module.icon}</span>
                                        <div>
                                            <h3>{module.name}</h3>
                                            <p className="text-sm text-muted-foreground font-normal">
                                                {module.description}
                                            </p>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {actions.map((action) => (
                                            <div key={action.key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${module.key}-${action.key}`}
                                                    checked={permissions[module.key]?.[action.key] || false}
                                                    onCheckedChange={(checked) =>
                                                        handlePermissionChange(module.key, action.key, checked as boolean)
                                                    }
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label
                                                        htmlFor={`${module.key}-${action.key}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {action.name}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Resumo das permissões */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Resumo das Permissões</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {modules.map((module) => {
                                    const modulePerms = permissions[module.key];
                                    const activeActions = actions.filter(action => modulePerms?.[action.key]);
                                    
                                    if (activeActions.length === 0) return null;
                                    
                                    return (
                                        <Badge key={module.key} variant="outline" className="text-xs">
                                            {module.icon} {module.name}: {activeActions.map(a => a.name).join(', ')}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de ação */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-bvolt-gradient hover:opacity-90">
                            Salvar Permissões
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};