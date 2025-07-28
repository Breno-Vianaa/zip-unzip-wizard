
import { useState, useEffect, useMemo } from 'react';

// Interface para resultados de busca
interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: 'produto' | 'cliente' | 'venda' | 'fornecedor';
    route: string;
}

/**
 * Hook personalizado para busca global no sistema
 * Busca em produtos, clientes, vendas e fornecedores
 */
export const useGlobalSearch = () => {
    const [searchTerm, setSearchTerm] = useState(''); // Termo de busca atual
    const [isSearching, setIsSearching] = useState(false); // Estado de carregamento da busca

    // Dados mockados para demonstração - em produção viriam de uma API
    const mockData: SearchResult[] = [
        // Produtos
        { id: '1', title: 'Smartphone Galaxy S23', description: 'Smartphone Samsung 128GB', category: 'produto', route: '/produtos' },
        { id: '2', title: 'Notebook Dell Inspiron', description: 'Notebook Dell i5 8GB RAM', category: 'produto', route: '/produtos' },
        { id: '3', title: 'Mouse Gamer RGB', description: 'Mouse gamer com LED RGB', category: 'produto', route: '/produtos' },

        // Clientes
        { id: '4', title: 'João Silva', description: 'Cliente Premium - joao@email.com', category: 'cliente', route: '/clientes' },
        { id: '5', title: 'Maria Santos', description: 'Cliente Regular - maria@email.com', category: 'cliente', route: '/clientes' },
        { id: '6', title: 'Pedro Costa', description: 'Cliente VIP - pedro@email.com', category: 'cliente', route: '/clientes' },

        // Vendas
        { id: '7', title: 'Venda #1234', description: 'Venda para João Silva - R$ 2.450,00', category: 'venda', route: '/vendas' },
        { id: '8', title: 'Venda #1235', description: 'Venda para Maria Santos - R$ 1.200,00', category: 'venda', route: '/vendas' },

        // Fornecedores
        { id: '9', title: 'TechSup Distribuidora', description: 'Fornecedor de eletrônicos', category: 'fornecedor', route: '/fornecedores' },
        { id: '10', title: 'InfoParts Ltda', description: 'Fornecedor de informática', category: 'fornecedor', route: '/fornecedores' },
    ];

    // Função para realizar a busca com debounce
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];

        // Simula busca com filtro - em produção seria uma chamada à API
        return mockData.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Effect para simular carregamento da busca
    useEffect(() => {
        if (searchTerm.trim()) {
            setIsSearching(true);
            // Simula delay de busca
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setIsSearching(false);
        }
    }, [searchTerm]);

    // Função para limpar a busca
    const clearSearch = () => {
        setSearchTerm('');
    };

    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        clearSearch
    };
};
