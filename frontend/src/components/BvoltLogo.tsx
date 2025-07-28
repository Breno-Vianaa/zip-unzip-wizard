
import React from 'react';

// Interface para propriedades do componente de logo
interface BvoltLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'; // Tamanhos predefinidos
    variant?: 'full' | 'icon' | 'text'; // Variantes do logo
    className?: string; // Classes CSS adicionais
}

/**
 * Componente oficial do logo da BVOLT
 * Não pode ser substituído pelos usuários
 * Usado em pontos estratégicos da aplicação
 */
const BvoltLogo: React.FC<BvoltLogoProps> = ({
    size = 'md',
    variant = 'full',
    className = ''
}) => {
    // Função para obter classes de tamanho
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'h-6 w-auto';
            case 'md':
                return 'h-8 w-auto';
            case 'lg':
                return 'h-10 w-auto';
            case 'xl':
                return 'h-12 w-auto';
            default:
                return 'h-8 w-auto';
        }
    };

    // Logo em formato SVG com gradiente BVOLT
    const LogoIcon = () => (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClasses()} ${className}`}
        >
            <defs>
                <linearGradient id="bvolt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
            </defs>

            {/* Ícone estilizado da BVOLT */}
            <rect width="40" height="40" rx="8" fill="url(#bvolt-gradient)" />

            {/* Letra B estilizada */}
            <path
                d="M12 10h8c2.2 0 4 1.8 4 4 0 1.1-.4 2.1-1.2 2.8.8.7 1.2 1.7 1.2 2.8 0 2.2-1.8 4-4 4h-8V10z M16 13v4h4c.6 0 1-.4 1-1s-.4-1-1-1h-4z M16 20v4h4c.6 0 1-.4 1-1s-.4-1-1-1h-4z"
                fill="white"
            />

            {/* Elemento decorativo (raio) */}
            <path
                d="M28 12l-3 6h2l-2 4 3-6h-2l2-4z"
                fill="white"
                opacity="0.8"
            />
        </svg>
    );

    // Texto da marca
    const LogoText = () => (
        <span className={`font-bold text-transparent bg-clip-text bg-bvolt-gradient ${size === 'sm' ? 'text-lg' :
                size === 'md' ? 'text-xl' :
                    size === 'lg' ? 'text-2xl' : 'text-3xl'
            }`}>
            BVOLT
        </span>
    );

    // Renderização baseada na variante
    switch (variant) {
        case 'icon':
            return <LogoIcon />;
        case 'text':
            return <LogoText />;
        case 'full':
        default:
            return (
                <div className={`flex items-center gap-2 ${className}`}>
                    <LogoIcon />
                    <LogoText />
                </div>
            );
    }
};

export default BvoltLogo;
