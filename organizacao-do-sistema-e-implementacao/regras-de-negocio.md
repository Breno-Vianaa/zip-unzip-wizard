# 🇧🇷 Regras de Negócio Brasileiras - Sistema BVOLT

## 📋 Visão Geral

O sistema BVOLT foi desenvolvido especificamente para atender as necessidades do mercado brasileiro, incluindo formatações, validações e regras fiscais específicas do país.

## 💰 Formatação de Moedas

### 🔧 Implementação
```javascript
// Formatação de moeda brasileira (Real)
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

// Exemplos de uso:
formatCurrency(1500.50); // "R$ 1.500,50"
formatCurrency(100);     // "R$ 100,00"
formatCurrency(25.9);    // "R$ 25,90"
```

### 📊 Casos de Uso
- Exibição de preços de produtos
- Totais de vendas e relatórios
- Valores em dashboards
- Campos de entrada monetária

## 📅 Formatação de Datas

### 🔧 Implementação
```javascript
// Formatação de data brasileira (dd/mm/yyyy)
const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
    }).format(new Date(date));
};

// Formatação de data e hora
const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Sao_Paulo'
    }).format(new Date(date));
};

// Exemplos:
formatDate('2024-01-20');           // "20/01/2024"
formatDateTime('2024-01-20T15:30'); // "20/01/2024 15:30:00"
```

### ⏰ Timezone
- **Timezone padrão**: America/Sao_Paulo
- **Horário de verão**: Automático (quando aplicável)
- **Fuso horário**: UTC-3 (padrão) / UTC-2 (verão)

## 📱 Validação de Documentos

### 🆔 Validação de CPF
```javascript
/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF para validar
 * @returns {boolean} - true se válido
 */
const validateCPF = (cpf) => {
    // Remove formatação
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica sequências inválidas (111.111.111-11, etc.)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Cálculo do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    // Cálculo do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    // Verifica se os dígitos calculados coincidem
    return cpf[9] == digit1 && cpf[10] == digit2;
};

// Formatação de CPF
const formatCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
```

### 🏢 Validação de CNPJ
```javascript
/**
 * Valida CNPJ brasileiro
 * @param {string} cnpj - CNPJ para validar
 * @returns {boolean} - true se válido
 */
const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    // Segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return cnpj[12] == digit1 && cnpj[13] == digit2;
};

// Formatação de CNPJ
const formatCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};
```

### 📍 Validação de CEP
```javascript
/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP para validar
 * @returns {boolean} - true se válido
 */
const validateCEP = (cep) => {
    cep = cep.replace(/[^\d]/g, '');
    return /^\d{8}$/.test(cep);
};

// Formatação de CEP
const formatCEP = (cep) => {
    cep = cep.replace(/[^\d]/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Busca de endereço por CEP (ViaCEP API)
const fetchAddressByCEP = async (cep) => {
    try {
        const cleanCEP = cep.replace(/[^\d]/g, '');
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        
        return {
            cep: data.cep,
            logradouro: data.logradouro,
            complemento: data.complemento,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
            ibge: data.ibge,
            gia: data.gia,
            ddd: data.ddd,
            siafi: data.siafi
        };
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        throw error;
    }
};
```

## 📞 Formatação de Telefone

### 🔧 Implementação
```javascript
/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone para formatar
 * @returns {string} - Telefone formatado
 */
const formatPhone = (phone) => {
    phone = phone.replace(/[^\d]/g, '');
    
    if (phone.length === 10) {
        // Telefone fixo: (11) 3333-4444
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 11) {
        // Celular: (11) 99999-8888
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
};

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {boolean} - true se válido
 */
const validatePhone = (phone) => {
    phone = phone.replace(/[^\d]/g, '');
    
    // Telefone fixo (10 dígitos) ou celular (11 dígitos)
    if (phone.length === 10) {
        // Telefone fixo: primeiro dígito do número não pode ser 0 ou 1
        return /^[1-9][1-9]\d{8}$/.test(phone);
    } else if (phone.length === 11) {
        // Celular: terceiro dígito deve ser 9
        return /^[1-9][1-9]9\d{8}$/.test(phone);
    }
    
    return false;
};
```

## 🏛️ Estados e Regiões

### 📊 Lista de Estados
```javascript
const brazilianStates = [
    { code: 'AC', name: 'Acre', region: 'Norte' },
    { code: 'AL', name: 'Alagoas', region: 'Nordeste' },
    { code: 'AP', name: 'Amapá', region: 'Norte' },
    { code: 'AM', name: 'Amazonas', region: 'Norte' },
    { code: 'BA', name: 'Bahia', region: 'Nordeste' },
    { code: 'CE', name: 'Ceará', region: 'Nordeste' },
    { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
    { code: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
    { code: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
    { code: 'MA', name: 'Maranhão', region: 'Nordeste' },
    { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
    { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
    { code: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
    { code: 'PA', name: 'Pará', region: 'Norte' },
    { code: 'PB', name: 'Paraíba', region: 'Nordeste' },
    { code: 'PR', name: 'Paraná', region: 'Sul' },
    { code: 'PE', name: 'Pernambuco', region: 'Nordeste' },
    { code: 'PI', name: 'Piauí', region: 'Nordeste' },
    { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
    { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
    { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
    { code: 'RO', name: 'Rondônia', region: 'Norte' },
    { code: 'RR', name: 'Roraima', region: 'Norte' },
    { code: 'SC', name: 'Santa Catarina', region: 'Sul' },
    { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
    { code: 'SE', name: 'Sergipe', region: 'Nordeste' },
    { code: 'TO', name: 'Tocantins', region: 'Norte' }
];
```

## 💼 Regras Fiscais

### 📊 Tipos de Tributação
```javascript
const taxationTypes = {
    SIMPLES_NACIONAL: {
        name: 'Simples Nacional',
        description: 'Regime tributário simplificado para micro e pequenas empresas',
        limits: {
            micro: 360000, // R$ 360.000,00
            small: 4800000 // R$ 4.800.000,00
        }
    },
    LUCRO_PRESUMIDO: {
        name: 'Lucro Presumido',
        description: 'Tributação baseada em presunção de lucro',
        limits: {
            max: 78000000 // R$ 78.000.000,00
        }
    },
    LUCRO_REAL: {
        name: 'Lucro Real',
        description: 'Tributação baseada no lucro real apurado',
        mandatory: true // Para empresas com faturamento > R$ 78 milhões
    }
};
```

### 🧮 Cálculos de Impostos (Simples Nacional)
```javascript
/**
 * Calcula impostos do Simples Nacional
 * @param {number} grossRevenue - Faturamento bruto anual
 * @param {string} activity - Tipo de atividade
 * @returns {object} - Alíquotas e valores
 */
const calculateSimplesTax = (grossRevenue, activity = 'commerce') => {
    const commerceTables = [
        { min: 0, max: 180000, rate: 0.04 },
        { min: 180000.01, max: 360000, rate: 0.073 },
        { min: 360000.01, max: 720000, rate: 0.095 },
        { min: 720000.01, max: 1800000, rate: 0.107 },
        { min: 1800000.01, max: 3600000, rate: 0.143 },
        { min: 3600000.01, max: 4800000, rate: 0.19 }
    ];
    
    const bracket = commerceTables.find(b => 
        grossRevenue >= b.min && grossRevenue <= b.max
    );
    
    if (!bracket) {
        throw new Error('Faturamento acima do limite do Simples Nacional');
    }
    
    return {
        rate: bracket.rate,
        monthlyTax: (grossRevenue / 12) * bracket.rate,
        annualTax: grossRevenue * bracket.rate
    };
};
```

## 📄 Notas Fiscais

### 🔢 Numeração de NFe
```javascript
/**
 * Gera número de nota fiscal
 * @param {number} serie - Série da nota
 * @param {number} lastNumber - Último número usado
 * @returns {string} - Número formatado
 */
const generateNFeNumber = (serie = 1, lastNumber = 0) => {
    const newNumber = lastNumber + 1;
    return {
        serie: serie.toString().padStart(3, '0'),
        number: newNumber.toString().padStart(9, '0'),
        formatted: `${serie.toString().padStart(3, '0')}-${newNumber.toString().padStart(9, '0')}`
    };
};
```

### 🔑 Validação de Chave de Acesso
```javascript
/**
 * Valida chave de acesso da NFe (44 dígitos)
 * @param {string} accessKey - Chave de acesso
 * @returns {boolean} - true se válida
 */
const validateNFeAccessKey = (accessKey) => {
    accessKey = accessKey.replace(/[^\d]/g, '');
    
    if (accessKey.length !== 44) return false;
    
    // Algoritmo de validação do dígito verificador
    const weights = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 43; i++) {
        sum += parseInt(accessKey[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(accessKey[43]) === checkDigit;
};
```

## 🏪 Configurações de Loja

### 📍 Dados Obrigatórios
```javascript
const requiredBusinessData = {
    // Dados básicos
    razaoSocial: 'string', // Razão social completa
    nomeFantasia: 'string', // Nome fantasia
    cnpj: 'string', // CNPJ validado
    inscricaoEstadual: 'string', // IE
    inscricaoMunicipal: 'string', // IM (opcional)
    
    // Endereço
    endereco: {
        logradouro: 'string',
        numero: 'string',
        complemento: 'string', // opcional
        bairro: 'string',
        cidade: 'string',
        uf: 'string',
        cep: 'string'
    },
    
    // Contato
    telefone: 'string',
    email: 'string',
    
    // Tributação
    regimeTributario: 'SIMPLES_NACIONAL | LUCRO_PRESUMIDO | LUCRO_REAL',
    crt: 'number' // Código de Regime Tributário (1, 2 ou 3)
};
```

## 🛒 Regras de Vendas

### 💳 Formas de Pagamento
```javascript
const paymentMethods = {
    DINHEIRO: { name: 'Dinheiro', code: '01' },
    CHEQUE: { name: 'Cheque', code: '02' },
    CARTAO_CREDITO: { name: 'Cartão de Crédito', code: '03' },
    CARTAO_DEBITO: { name: 'Cartão de Débito', code: '04' },
    CREDITO_LOJA: { name: 'Crédito Loja', code: '05' },
    VALE_ALIMENTACAO: { name: 'Vale Alimentação', code: '10' },
    VALE_REFEICAO: { name: 'Vale Refeição', code: '11' },
    VALE_PRESENTE: { name: 'Vale Presente', code: '12' },
    VALE_COMBUSTIVEL: { name: 'Vale Combustível', code: '13' },
    PIX: { name: 'PIX', code: '17' },
    TRANSFERENCIA: { name: 'Transferência Bancária', code: '18' },
    BOLETO: { name: 'Boleto Bancário', code: '19' }
};
```

### 📊 Cálculo de Parcelas
```javascript
/**
 * Calcula parcelas de pagamento
 * @param {number} total - Valor total
 * @param {number} installments - Número de parcelas
 * @param {number} interestRate - Taxa de juros mensal
 * @returns {object} - Detalhes das parcelas
 */
const calculateInstallments = (total, installments, interestRate = 0) => {
    if (installments === 1) {
        return [{
            number: 1,
            amount: total,
            dueDate: new Date()
        }];
    }
    
    const monthlyRate = interestRate / 100;
    let installmentValue;
    
    if (monthlyRate === 0) {
        installmentValue = total / installments;
    } else {
        // Cálculo com juros compostos
        installmentValue = total * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                          (Math.pow(1 + monthlyRate, installments) - 1);
    }
    
    const parcels = [];
    let remainder = total;
    
    for (let i = 1; i <= installments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        
        const amount = i === installments ? remainder : installmentValue;
        remainder -= amount;
        
        parcels.push({
            number: i,
            amount: Math.round(amount * 100) / 100,
            dueDate: dueDate,
            formatted: formatCurrency(amount)
        });
    }
    
    return parcels;
};
```

## 🎯 Aplicação no Sistema

### 🔧 Middleware de Validação
```javascript
// Middleware para validar dados brasileiros
const validateBrazilianData = (req, res, next) => {
    const { cpf, cnpj, cep, telefone } = req.body;
    
    const errors = [];
    
    if (cpf && !validateCPF(cpf)) {
        errors.push('CPF inválido');
    }
    
    if (cnpj && !validateCNPJ(cnpj)) {
        errors.push('CNPJ inválido');
    }
    
    if (cep && !validateCEP(cep)) {
        errors.push('CEP inválido');
    }
    
    if (telefone && !validatePhone(telefone)) {
        errors.push('Telefone inválido');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: errors
        });
    }
    
    next();
};
```

### 🎨 Componentes React
```typescript
// Componente para entrada de CPF/CNPJ
const DocumentInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    type: 'cpf' | 'cnpj';
}> = ({ value, onChange, type }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value.replace(/[^\d]/g, '');
        
        if (type === 'cpf') {
            inputValue = inputValue.substring(0, 11);
            inputValue = formatCPF(inputValue);
        } else {
            inputValue = inputValue.substring(0, 14);
            inputValue = formatCNPJ(inputValue);
        }
        
        onChange(inputValue);
    };
    
    const isValid = type === 'cpf' ? validateCPF(value) : validateCNPJ(value);
    
    return (
        <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
            className={`border rounded px-3 py-2 ${
                value && !isValid ? 'border-red-500' : 'border-gray-300'
            }`}
        />
    );
};
```

## 📚 Referências

### 📖 Documentação Oficial
- [Receita Federal](https://www.gov.br/receitafederal)
- [Portal NFe](http://www.nfe.fazenda.gov.br/)
- [Simples Nacional](http://www8.receita.fazenda.gov.br/simplesnacional/)
- [ViaCEP API](https://viacep.com.br/)

### 🔗 APIs Úteis
- **ViaCEP**: Consulta de CEP e endereços
- **BrasilAPI**: Validações e consultas diversas
- **IBGE**: Dados de municípios e estados
- **Receita Federal**: Consulta de CNPJ