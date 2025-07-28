
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package, Users, ShoppingCart, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de busca global do sistema
 * Permite buscar por produtos, clientes, vendas e fornecedores
 * Exibe resultados em dropdown com navegação por teclado
 */
const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false); // Controla se o dropdown está aberto
    const [selectedIndex, setSelectedIndex] = useState(-1); // Índice do item selecionado via teclado
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { searchTerm, setSearchTerm, searchResults, isSearching, clearSearch } = useGlobalSearch();

    // Função para obter o ícone baseado na categoria
    const getIcon = (category: string) => {
        switch (category) {
            case 'produto': return Package;
            case 'cliente': return Users;
            case 'venda': return ShoppingCart;
            case 'fornecedor': return Building;
            default: return Search;
        }
    };

    // Função para obter a cor do badge baseado na categoria
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'produto': return 'bg-blue-100 text-blue-800';
            case 'cliente': return 'bg-green-100 text-green-800';
            case 'venda': return 'bg-purple-100 text-purple-800';
            case 'fornecedor': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Função para navegar para um resultado
    const handleResultClick = (result: any) => {
        navigate(result.route);
        setIsOpen(false);
        clearSearch();
    };

    // Função para lidar com teclas pressionadas
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : searchResults.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleResultClick(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Effect para controlar abertura/fechamento do dropdown
    useEffect(() => {
        setIsOpen(searchTerm.length > 0);
        setSelectedIndex(-1);
    }, [searchTerm]);

    // Effect para fechar dropdown quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-md" ref={dropdownRef}>
            {/* Campo de busca */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    placeholder="Buscar produtos, clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
                {/* Botão para limpar busca */}
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-200"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Dropdown com resultados */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-slate-500">
                            <div className="animate-spin h-4 w-4 border-2 border-bvolt-blue border-t-transparent rounded-full mx-auto mb-2"></div>
                            Buscando...
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="py-2">
                            {searchResults.map((result, index) => {
                                const Icon = getIcon(result.category);
                                const isSelected = index === selectedIndex;

                                return (
                                    <div
                                        key={result.id}
                                        onClick={() => handleResultClick(result)}
                                        className={`px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-medium text-slate-900 truncate">
                                                        {result.title}
                                                    </h4>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${getCategoryColor(result.category)}`}
                                                    >
                                                        {result.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {result.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-slate-500">
                            <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">Nenhum resultado encontrado</p>
                            <p className="text-xs mt-1">Tente buscar por produtos, clientes, vendas ou fornecedores</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
