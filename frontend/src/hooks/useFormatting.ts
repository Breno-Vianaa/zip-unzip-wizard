
import { useState, useEffect } from 'react';

// Tipos de configurações regionais
type Currency = 'BRL' | 'USD' | 'EUR';
type Language = 'pt-BR' | 'en-US' | 'es-ES';
type DateFormat = 'dd/mm/aaaa' | 'mm/dd/aaaa' | 'aaaa-mm-dd';

// Interface para as configurações de formatação
interface FormattingConfig {
    currency: Currency;
    language: Language;
    dateFormat: DateFormat;
}

/**
 * Hook personalizado para gerenciar formatação de moeda, data e idioma
 * Persiste as configurações no localStorage e fornece funções de formatação
 */
export const useFormatting = () => {
    // Estado das configurações de formatação
    const [config, setConfig] = useState<FormattingConfig>(() => {
        const savedConfig = localStorage.getItem('bvolt-formatting');
        return savedConfig ? JSON.parse(savedConfig) : {
            currency: 'BRL',
            language: 'pt-BR',
            dateFormat: 'dd/mm/aaaa'
        };
    });

    // Função para atualizar uma configuração específica
    const updateConfig = (key: keyof FormattingConfig, value: string) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        localStorage.setItem('bvolt-formatting', JSON.stringify(newConfig));
    };

    // Função para formatar valores monetários baseado na moeda configurada
    const formatCurrency = (value: number): string => {
        const currencyMap = {
            BRL: { locale: 'pt-BR', currency: 'BRL' },
            USD: { locale: 'en-US', currency: 'USD' },
            EUR: { locale: 'de-DE', currency: 'EUR' }
        };

        const { locale, currency } = currencyMap[config.currency];
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    };

    // Função para formatar datas baseado no formato configurado
    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        switch (config.dateFormat) {
            case 'dd/mm/aaaa':
                return `${day}/${month}/${year}`;
            case 'mm/dd/aaaa':
                return `${month}/${day}/${year}`;
            case 'aaaa-mm-dd':
                return `${year}-${month}-${day}`;
            default:
                return `${day}/${month}/${year}`;
        }
    };

    // Função para obter textos baseado no idioma configurado
    const getText = (key: string): string => {
        const texts = {
            'pt-BR': {
                save: 'Salvar',
                cancel: 'Cancelar',
                confirm: 'Confirmar',
                loading: 'Carregando...',
                success: 'Sucesso',
                error: 'Erro'
            },
            'en-US': {
                save: 'Save',
                cancel: 'Cancel',
                confirm: 'Confirm',
                loading: 'Loading...',
                success: 'Success',
                error: 'Error'
            },
            'es-ES': {
                save: 'Guardar',
                cancel: 'Cancelar',
                confirm: 'Confirmar',
                loading: 'Cargando...',
                success: 'Éxito',
                error: 'Error'
            }
        };

        return texts[config.language]?.[key] || key;
    };

    return {
        config,
        updateConfig,
        formatCurrency,
        formatDate,
        getText
    };
};
