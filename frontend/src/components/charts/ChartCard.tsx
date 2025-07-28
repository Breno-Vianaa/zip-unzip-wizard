
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

// Interface para definir tipos de gráficos disponíveis
type ChartType = 'line' | 'area' | 'bar';

// Interface para dados dos gráficos
interface ChartData {
    name: string;
    value: number;
    [key: string]: any;
}

// Interface para configuração do gráfico
interface ChartCardProps {
    title: string;
    description?: string;
    data: ChartData[];
    type: ChartType;
    dataKey: string;
    color?: string;
    height?: number;
    showGrid?: boolean;
    showTooltip?: boolean;
    className?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

// Componente reutilizável para gráficos com títulos de eixos
const ChartCard: React.FC<ChartCardProps> = ({
    title,
    description,
    data,
    type,
    dataKey,
    color = 'hsl(var(--bvolt-blue))',
    height = 200,
    showGrid = true,
    showTooltip = true,
    className = '',
    xAxisLabel,
    yAxisLabel
}) => {
    // Configuração básica do gráfico
    const chartConfig = {
        [dataKey]: {
            label: title,
            color: color,
        },
    };

    // Função para renderizar o gráfico baseado no tipo
    const renderChart = () => {
        // Propriedades comuns para todos os gráficos
        const commonProps = {
            data,
            margin: { top: 10, right: 10, left: 10, bottom: 30 }
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className={showGrid ? 'opacity-30' : 'opacity-0'} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                        />
                        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: color }}
                        />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className={showGrid ? 'opacity-30' : 'opacity-0'} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                        />
                        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fill={color}
                            fillOpacity={0.2}
                            strokeWidth={2}
                        />
                    </AreaChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className={showGrid ? 'opacity-30' : 'opacity-0'} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                        />
                        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
                        <Bar
                            dataKey={dataKey}
                            fill={color}
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                );

            default:
                return null;
        }
    };

    return (
        <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-slate-800 dark:border-slate-700 ${className}`}>
            {/* Cabeçalho do card com título e descrição */}
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>

            {/* Conteúdo do gráfico */}
            <CardContent className="pt-2">
                <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default ChartCard;