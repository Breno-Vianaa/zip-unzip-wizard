
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: any) => void;
    editingProduct?: any;
    mode: 'create' | 'edit';
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingProduct,
    mode
}) => {
    const { hasPermission } = useAuth();
    const [formData, setFormData] = useState({
        nome: editingProduct?.nome || '',
        categoria: editingProduct?.categoria || '',
        preco: editingProduct?.preco || '',
        estoque: editingProduct?.estoque || '',
        fornecedor: editingProduct?.fornecedor || '',
        codigoBarras: editingProduct?.codigoBarras || '',
        status: editingProduct?.status || 'ativo'
    });

    const canEdit = hasPermission(['admin', 'gerente']);

    if (!canEdit) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            ...formData,
            id: editingProduct?.id || Date.now(),
            preco: parseFloat(formData.preco),
            estoque: parseInt(formData.estoque)
        };

        onSave(productData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Novo Produto' : 'Editar Produto'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Preencha os dados do novo produto'
                            : 'Altere os dados do produto'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Produto</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                                placeholder="Digite o nome do produto"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria</Label>
                            <Select
                                value={formData.categoria}
                                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                                    <SelectItem value="Informática">Informática</SelectItem>
                                    <SelectItem value="Celulares e Smartphones">Celulares e Smartphones</SelectItem>
                                    <SelectItem value="Áudio e Vídeo">Áudio e Vídeo</SelectItem>
                                    <SelectItem value="Casa e Jardim">Casa e Jardim</SelectItem>
                                    <SelectItem value="Eletrodomésticos">Eletrodomésticos</SelectItem>
                                    <SelectItem value="Móveis e Decoração">Móveis e Decoração</SelectItem>
                                    <SelectItem value="Moda Masculina">Moda Masculina</SelectItem>
                                    <SelectItem value="Moda Feminina">Moda Feminina</SelectItem>
                                    <SelectItem value="Moda Infantil">Moda Infantil</SelectItem>
                                    <SelectItem value="Calçados">Calçados</SelectItem>
                                    <SelectItem value="Acessórios">Acessórios</SelectItem>
                                    <SelectItem value="Esporte e Lazer">Esporte e Lazer</SelectItem>
                                    <SelectItem value="Fitness e Musculação">Fitness e Musculação</SelectItem>
                                    <SelectItem value="Livros e Literatura">Livros e Literatura</SelectItem>
                                    <SelectItem value="Games e Consoles">Games e Consoles</SelectItem>
                                    <SelectItem value="Brinquedos">Brinquedos</SelectItem>
                                    <SelectItem value="Beleza e Cuidados">Beleza e Cuidados</SelectItem>
                                    <SelectItem value="Saúde">Saúde</SelectItem>
                                    <SelectItem value="Automotivo">Automotivo</SelectItem>
                                    <SelectItem value="Ferramentas e Construção">Ferramentas e Construção</SelectItem>
                                    <SelectItem value="Papelaria e Escritório">Papelaria e Escritório</SelectItem>
                                    <SelectItem value="Pet Shop">Pet Shop</SelectItem>
                                    <SelectItem value="Instrumentos Musicais">Instrumentos Musicais</SelectItem>
                                    <SelectItem value="Alimentação e Bebidas">Alimentação e Bebidas</SelectItem>
                                    <SelectItem value="Artesanato e Hobby">Artesanato e Hobby</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="preco">Preço (R$)</Label>
                            <Input
                                id="preco"
                                type="number"
                                step="0.01"
                                value={formData.preco}
                                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                                required
                                placeholder="0,00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estoque">Estoque</Label>
                            <Input
                                id="estoque"
                                type="number"
                                value={formData.estoque}
                                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                                required
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fornecedor">Fornecedor</Label>
                            <Input
                                id="fornecedor"
                                value={formData.fornecedor}
                                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                                required
                                placeholder="Nome do fornecedor"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="codigoBarras">Código de Barras</Label>
                            <Input
                                id="codigoBarras"
                                value={formData.codigoBarras}
                                onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                                placeholder="Código de barras do produto"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-bvolt-gradient hover:opacity-90">
                            {mode === 'create' ? 'Cadastrar Produto' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
