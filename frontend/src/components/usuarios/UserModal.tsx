
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserType } from '../../contexts/AuthContext';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: any) => void;
    editingUser?: any;
    mode: 'create' | 'edit';
}

export const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingUser,
    mode
}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nome: editingUser?.nome || '',
        email: editingUser?.email || '',
        tipo: editingUser?.tipo || 'vendedor' as UserType,
        senha: '',
        confirmarSenha: ''
    });

    // Verifica se o usuário pode criar/editar determinado tipo
    const canManageUserType = (tipo: UserType): boolean => {
        if (user?.tipo === 'admin') return true;
        if (user?.tipo === 'gerente') return tipo !== 'admin';
        return false;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create' && formData.senha !== formData.confirmarSenha) {
            alert('As senhas não coincidem');
            return;
        }

        if (!canManageUserType(formData.tipo)) {
            alert('Você não tem permissão para gerenciar este tipo de usuário');
            return;
        }

        onSave({
            ...formData,
            id: editingUser?.id || Date.now().toString()
        });

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Preencha os dados do novo usuário'
                            : 'Altere os dados do usuário'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Usuário</Label>
                        <Select
                            value={formData.tipo}
                            onValueChange={(value: UserType) => setFormData({ ...formData, tipo: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {user?.tipo === 'admin' && (
                                    <SelectItem value="admin">Administrador</SelectItem>
                                )}
                                {(user?.tipo === 'admin' || user?.tipo === 'gerente') && (
                                    <SelectItem value="gerente">Gerente</SelectItem>
                                )}
                                {(user?.tipo === 'admin' || user?.tipo === 'gerente') && (
                                    <SelectItem value="vendedor">Vendedor</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {mode === 'create' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha</Label>
                                <Input
                                    id="senha"
                                    type="password"
                                    value={formData.senha}
                                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                                <Input
                                    id="confirmarSenha"
                                    type="password"
                                    value={formData.confirmarSenha}
                                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-bvolt-gradient hover:opacity-90">
                            {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
