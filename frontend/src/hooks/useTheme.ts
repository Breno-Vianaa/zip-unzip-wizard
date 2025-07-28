
import { useState, useEffect } from 'react';

// Tipos de tema disponíveis no sistema
type Theme = 'claro' | 'escuro' | 'auto';

/**
 * Hook personalizado para gerenciar o tema da aplicação
 * Controla se o tema é claro, escuro ou automático (baseado no sistema)
 */
export const useTheme = () => {
    // Estado do tema atual, inicializado com valor do localStorage ou 'claro' como padrão
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('bvolt-theme');
            return (savedTheme as Theme) || 'claro';
        } catch (error) {
            console.warn('Erro ao carregar tema do localStorage:', error);
            return 'claro';
        }
    });

    // Função para aplicar o tema ao documento HTML
    const applyTheme = (currentTheme: Theme) => {
        const root = document.documentElement;

        // Remove classes de tema existentes
        root.classList.remove('light', 'dark');

        // Aplica o tema baseado na seleção
        if (currentTheme === 'escuro') {
            root.classList.add('dark');
            document.body.classList.add('dark');
        } else if (currentTheme === 'claro') {
            root.classList.add('light');
            document.body.classList.remove('dark');
        } else if (currentTheme === 'auto') {
            // Verifica a preferência do sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
                document.body.classList.add('dark');
            } else {
                root.classList.add('light');
                document.body.classList.remove('dark');
            }
        }
    };

    // Função para alterar o tema
    const changeTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        try {
            localStorage.setItem('bvolt-theme', newTheme); // Persiste no localStorage
        } catch (error) {
            console.warn('Erro ao salvar tema no localStorage:', error);
        }
        applyTheme(newTheme);
    };

    // Effect para aplicar o tema inicial e escutar mudanças na preferência do sistema
    useEffect(() => {
        applyTheme(theme);

        // Listener para mudanças na preferência de cor do sistema (apenas quando tema é 'auto')
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'auto') {
                applyTheme('auto');
            }
        };

        // Listener para sincronizar tema entre abas do navegador
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'bvolt-theme' && e.newValue) {
                try {
                    const newTheme = e.newValue as Theme;
                    setTheme(newTheme);
                    applyTheme(newTheme);
                } catch (error) {
                    console.warn('Erro ao sincronizar tema entre abas:', error);
                }
            }
        };

        // Adiciona os listeners
        mediaQuery.addEventListener('change', handleSystemChange);
        window.addEventListener('storage', handleStorageChange);

        // Remove os listeners na limpeza
        return () => {
            mediaQuery.removeEventListener('change', handleSystemChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [theme]);

    return {
        theme,
        changeTheme,
    };
};
