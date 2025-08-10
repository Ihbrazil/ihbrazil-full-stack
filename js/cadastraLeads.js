// Configuração da API do Supabase
const SUPABASE_CONFIG = {
    endpoint: 'https://zwvisfrdzizehayydrcg.supabase.co/rest/v1/ihb_fs_captura_leads',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dmlzZnJkeml6ZWhheXlkcmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjQ0MjAsImV4cCI6MjA2ODM0MDQyMH0.ctL6jvT0VUsYUF-VZ0i1W449ZX5xDSQBBVHCGmQpckI'
};

class LeadCaptureApp {
    constructor() {
        this.form = document.getElementById('leadForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('successMessage');
        this.errorAlert = document.getElementById('errorAlert');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }
    
    setupEventListeners() {
        // Submit do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validação em tempo real
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    setupFormValidation() {
        // Validação específica para email
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('input', () => {
            this.validateEmail(emailInput);
        });
    }
    
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Validação de campos obrigatórios
        if (!value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} é obrigatório.`;
        } else {
            // Validações específicas por campo
            switch (fieldName) {
                case 'nome':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Nome deve ter pelo menos 2 caracteres.';
                    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Nome deve conter apenas letras e espaços.';
                    }
                    break;
                    
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Digite um e-mail válido.';
                    }
                    break;
                    
                case 'tipo_de_projeto':
                    const validTypes = ['Site Institucional', 'E-commerce', 'Aplicação Web'];
                    if (!validTypes.includes(value)) {
                        isValid = false;
                        errorMessage = 'Selecione um tipo de projeto válido.';
                    }
                    break;
                    
                case 'detalhes_adicionais':
                    if (value.length < 10) {
                        isValid = false;
                        errorMessage = 'Forneça mais detalhes sobre seu projeto (mínimo 10 caracteres).';
                    }
                    break;
            }
        }
        
        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }
    
    validateEmail(emailField) {
        const email = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError(emailField, false, 'Digite um e-mail válido.');
        } else if (email && emailRegex.test(email)) {
            this.clearFieldError(emailField);
        }
    }
    
    showFieldError(field, isValid, errorMessage) {
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (!isValid) {
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        } else {
            field.classList.remove('error');
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    clearFieldError(field) {
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        field.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            'nome': 'Nome',
            'email': 'E-mail',
            'tipo_de_projeto': 'Tipo de projeto',
            'detalhes_adicionais': 'Detalhes adicionais'
        };
        return labels[fieldName] || fieldName;
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            const isFieldValid = this.validateField(input);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!this.validateForm()) {
            this.showError('Por favor, corrija os erros no formulário antes de enviar.');
            return;
        }
        
        // Mostrar loading
        this.setLoadingState(true);
        this.hideMessages();
        
        try {
            // Coletar dados do formulário
            const formData = this.getFormData();
            
            // Enviar dados para o Supabase
            const response = await this.sendToSupabase(formData);
            
            if (response.ok) {
                this.showSuccess();
                this.resetForm();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao enviar dados');
            }
            
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.showError(error.message || 'Erro inesperado. Tente novamente.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    getFormData() {
        return {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            tipo_de_projeto: document.getElementById('tipo_de_projeto').value,
            detalhes_adicionais: document.getElementById('detalhes_adicionais').value.trim()
        };
    }
    
    async sendToSupabase(data) {
        const response = await fetch(SUPABASE_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_CONFIG.apiKey}`,
                'apikey': SUPABASE_CONFIG.apiKey,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        });
        
        return response;
    }
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }
    
    showSuccess() {
        this.form.style.display = 'none';
        this.successMessage.classList.add('show');
        
        // Voltar ao formulário após 5 segundos
        setTimeout(() => {
            this.hideMessages();
            this.form.style.display = 'flex';
        }, 5000);
    }
    
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.errorAlert.classList.add('show');
        
        // Esconder erro após 5 segundos
        setTimeout(() => {
            this.hideMessages();
        }, 5000);
    }
    
    hideMessages() {
        this.successMessage.classList.remove('show');
        this.errorAlert.classList.remove('show');
    }
    
    resetForm() {
        this.form.reset();
        
        // Limpar erros
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
    }
}

// Utilitários para melhorar a experiência do usuário
class UIEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupAccessibility();
        this.setupAnimations();
    }
    
    setupAccessibility() {
        // Melhorar navegação por teclado
        const form = document.getElementById('leadForm');
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.focusNextInput(e.target);
            }
        });
    }
    
    focusNextInput(currentInput) {
        const inputs = Array.from(document.querySelectorAll('input, select, textarea, button'));
        const currentIndex = inputs.indexOf(currentInput);
        const nextInput = inputs[currentIndex + 1];
        
        if (nextInput) {
            nextInput.focus();
        }
    }
    
    setupAnimations() {
        // Adicionar animação de entrada nos elementos
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0.1s';
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observar elementos que devem ser animados
        const animatedElements = document.querySelectorAll('.form-container, .hero-section');
        animatedElements.forEach(el => observer.observe(el));
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LeadCaptureApp();
    new UIEnhancements();
    
    // Log para debug (remover em produção)
    console.log('🚀 Aplicação de Captura de Leads iniciada com sucesso!');
});