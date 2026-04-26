/**
 * ============================================
 * CLASSE PRINCIPAL: RegistrationForm
 * ============================================
 * Gerencia toda a lógica do formulário de registro
 * Implementa validações em tempo real, força de senha,
 * formatação de telefone, e feedback visual
 *
 * @class RegistrationForm
 */
class RegistrationForm {
  /**
   * Construtor - Inicializa o formulário
   * Configura todos os elementos DOM e eventos
   */
  constructor() {
    // Obtém referência do formulário principal
    this.form = document.getElementById("registerForm");

    // Inicializa todos os elementos do DOM
    this.initElements();

    // Configura todos os event listeners
    this.attachEvents();
  }

  /**
   * Inicializa referências para todos os elementos do DOM
   * Mapeia inputs, spans de erro e outros elementos importantes
   */
  initElements() {
    // === INPUTS DO FORMULÁRIO ===
    this.fullname = document.getElementById("fullname");
    this.email = document.getElementById("email");
    this.phone = document.getElementById("phone");
    this.password = document.getElementById("password");
    this.confirmPassword = document.getElementById("confirmPassword");
    this.terms = document.getElementById("terms");

    // === ELEMENTOS DE MENSAGEM DE ERRO ===
    this.fullnameError = document.getElementById("fullnameError");
    this.emailError = document.getElementById("emailError");
    this.phoneError = document.getElementById("phoneError");
    this.passwordError = document.getElementById("passwordError");
    this.confirmError = document.getElementById("confirmError");
    this.termsError = document.getElementById("termsError");

    // === MEDIDOR DE FORÇA DA SENHA ===
    this.strengthBar = document.querySelector(".strength-bar");
    this.strengthText = document.querySelector(".strength-text");

    // === SISTEMA DE NOTIFICAÇÕES ===
    this.toast = document.getElementById("toast");
  }

  /**
   * Configura todos os event listeners do formulário
   * - Submit: validação final antes do envio
   * - Input: validação em tempo real
   * - Click: toggle de senha
   */
  attachEvents() {
    // Evento de submissão do formulário
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Validação em tempo real (cada campo)
    this.fullname.addEventListener("input", () => this.validateFullname());
    this.email.addEventListener("input", () => this.validateEmail());
    this.phone.addEventListener("input", () => this.validatePhone());

    // Senha: valida força e confirmação
    this.password.addEventListener("input", () => {
      this.validatePassword();
      this.checkPasswordStrength();
      this.validateConfirmPassword(); // Revalida confirmação quando senha muda
    });

    this.confirmPassword.addEventListener("input", () =>
      this.validateConfirmPassword(),
    );

    // Botões de mostrar/ocultar senha
    document.querySelectorAll(".toggle-password").forEach((btn) => {
      btn.addEventListener("click", (e) => this.togglePassword(e.target));
    });

    // Formatação automática do telefone
    if (this.phone) {
      this.phone.addEventListener("input", (e) => this.formatPhone(e.target));
    }
  }

  /**
   * ============================================
   * VALIDAÇÕES DE CAMPOS INDIVIDUAIS
   * ============================================
   */

  /**
   * Valida nome completo
   * - Mínimo de 3 caracteres
   * - Deve conter espaço (nome e sobrenome)
   * @returns {boolean} true se válido, false caso contrário
   */
  validateFullname() {
    const value = this.fullname.value.trim();

    // Validação: tamanho mínimo
    if (value.length < 3) {
      this.setError(
        this.fullnameError,
        "Nome deve ter pelo menos 3 caracteres",
      );
      return false;
    }

    // Validação: deve ter nome e sobrenome
    if (value.split(" ").length < 2) {
      this.setError(
        this.fullnameError,
        "Digite o nome completo (nome e sobrenome)",
      );
      return false;
    }

    // Tudo ok
    this.setSuccess(this.fullnameError);
    return true;
  }

  /**
   * Valida formato do e-mail
   * Usa regex padrão para validação de emails
   * @returns {boolean} true se email válido
   */
  validateEmail() {
    const value = this.email.value.trim();

    // Regex para validação de email (padrão RFC 5322 simplificado)
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

    if (!value) {
      this.setError(this.emailError, "E-mail é obrigatório");
      return false;
    }

    if (!emailRegex.test(value)) {
      this.setError(
        this.emailError,
        "E-mail inválido (ex: usuario@dominio.com)",
      );
      return false;
    }

    this.setSuccess(this.emailError);
    return true;
  }

  /**
   * Valida telefone (opcional)
   * Se preenchido, deve ter 11 dígitos (DDD + número)
   * @returns {boolean} true se válido ou vazio
   */
  validatePhone() {
    const value = this.phone.value.trim();

    // Campo opcional: vazio é válido
    if (!value) return true;

    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    // Brasil: 11 dígitos (2 DDD + 9 número)
    if (numbers.length !== 11) {
      this.setError(
        this.phoneError,
        "Telefone deve ter 11 dígitos (DDD + 9 números)",
      );
      return false;
    }

    this.setSuccess(this.phoneError);
    return true;
  }

  /**
   * Valida requisitos da senha
   * - Mínimo de 6 caracteres
   * - Deve conter letras E números
   * @returns {boolean} true se senha atende requisitos
   */
  validatePassword() {
    const value = this.password.value;

    // Validação: tamanho mínimo
    if (value.length < 6) {
      this.setError(
        this.passwordError,
        "Senha deve ter pelo menos 6 caracteres",
      );
      return false;
    }

    // Validação: deve conter letras e números
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);

    if (!hasNumber || !hasLetter) {
      this.setError(this.passwordError, "Senha deve conter letras e números");
      return false;
    }

    this.setSuccess(this.passwordError);
    return true;
  }

  /**
   * Analisa e exibe força da senha
   * Critérios:
   * - Comprimento (6+, 8+)
   * - Maiúsculas e minúsculas
   * - Números
   * - Caracteres especiais
   */
  checkPasswordStrength() {
    const password = this.password.value;
    let strength = 0;

    // Critério 1: Comprimento mínimo
    if (password.length >= 6) strength++;

    // Critério 2: Comprimento bom
    if (password.length >= 8) strength++;

    // Critério 3: Letras maiúsculas E minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;

    // Critério 4: Contém números
    if (/\d/.test(password)) strength++;

    // Critério 5: Contém caracteres especiais
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Se senha vazia, resetar indicador
    if (password.length === 0) {
      this.strengthBar.className = "strength-bar";
      this.strengthText.textContent = "";
      return;
    }

    // Define classe e texto baseado na pontuação
    if (strength <= 2) {
      this.strengthBar.className = "strength-bar weak";
      this.strengthText.textContent =
        "🔴 Senha fraca - use letras maiúsculas, números e símbolos";
      this.strengthText.style.color = "var(--error-color)";
    } else if (strength <= 4) {
      this.strengthBar.className = "strength-bar medium";
      this.strengthText.textContent =
        "🟡 Senha média - adicione símbolos para mais segurança";
      this.strengthText.style.color = "var(--warning-color)";
    } else {
      this.strengthBar.className = "strength-bar strong";
      this.strengthText.textContent = "🟢 Senha forte - excelente!";
      this.strengthText.style.color = "var(--success-color)";
    }
  }

  /**
   * Valida se senha e confirmação são idênticas
   * @returns {boolean} true se coincidem
   */
  validateConfirmPassword() {
    const confirmValue = this.confirmPassword.value;
    const passwordValue = this.password.value;

    // Se confirmação vazia mas senha tem valor
    if (!confirmValue && passwordValue) {
      this.setError(this.confirmError, "Confirme sua senha");
      return false;
    }

    // Comparação direta
    if (confirmValue !== passwordValue) {
      this.setError(this.confirmError, "As senhas não coincidem");
      return false;
    }

    this.setSuccess(this.confirmError);
    return true;
  }

  /**
   * Valida checkbox dos termos
   * @returns {boolean} true se marcado
   */
  validateTerms() {
    if (!this.terms.checked) {
      this.setError(
        this.termsError,
        "Você precisa aceitar os termos para continuar",
      );
      return false;
    }
    this.setSuccess(this.termsError);
    return true;
  }

  /**
   * ============================================
   * UTILITÁRIOS DE UI
   * ============================================
   */

  /**
   * Exibe mensagem de erro para um campo
   * @param {HTMLElement} element - Span de erro
   * @param {string} message - Mensagem a ser exibida
   */
  setError(element, message) {
    element.textContent = message;

    // Adiciona classe de erro ao input relacionado
    const input = element.closest(".form-group")?.querySelector("input");
    if (input) input.classList.add("error");
  }

  /**
   * Limpa mensagem de erro e remove estilo de erro
   * @param {HTMLElement} element - Span de erro
   */
  setSuccess(element) {
    element.textContent = "";

    // Remove classe de erro do input
    const input = element.closest(".form-group")?.querySelector("input");
    if (input) input.classList.remove("error");
  }

  /**
   * Mostra/oculta senha nos campos de senha
   * Alterna entre type="password" e type="text"
   * @param {HTMLElement} button - Botão que foi clicado
   */
  togglePassword(button) {
    const input = button.parentElement.querySelector("input");
    const currentType = input.getAttribute("type");
    const newType = currentType === "password" ? "text" : "password";

    input.setAttribute("type", newType);

    // Muda o ícone do botão para feedback visual
    button.textContent = newType === "password" ? "👁️" : "🙈";
  }

  /**
   * Formata automaticamente o telefone enquanto digita
   * Padrão: (DD) NNNNN-NNNN
   * @param {HTMLInputElement} input - Campo de telefone
   */
  formatPhone(input) {
    let value = input.value.replace(/\D/g, "");

    // Limita a 11 dígitos
    if (value.length > 11) value = value.slice(0, 11);

    // Aplica formatação progressiva
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }

    input.value = value;
  }

  /**
   * Exibe notificação toast temporária
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo: 'success' ou 'error'
   */
  showToast(message, type = "success") {
    // Configura classe baseada no tipo
    this.toast.className = `toast ${type}`;

    // Atualiza ícone e mensagem
    const icon = this.toast.querySelector(".toast-icon");
    icon.textContent = type === "success" ? "✅" : "❌";

    this.toast.querySelector(".toast-message").textContent = message;

    // Remove hidden para exibir
    this.toast.classList.remove("hidden");

    // Auto-esconde após 3 segundos
    setTimeout(() => {
      this.toast.classList.add("hidden");
    }, 3000);
  }

  /**
   * ============================================
   * SUBMISSÃO DO FORMULÁRIO
   * ============================================
   */

  /**
   * Manipula o envio do formulário
   * Valida todos os campos antes de processar
   * @param {Event} e - Evento de submit
   */
  handleSubmit(e) {
    // Previne comportamento padrão (recarregar página)
    e.preventDefault();

    // Executa todas as validações
    const isValidFullname = this.validateFullname();
    const isValidEmail = this.validateEmail();
    const isValidPhone = this.validatePhone();
    const isValidPassword = this.validatePassword();
    const isValidConfirm = this.validateConfirmPassword();
    const isValidTerms = this.validateTerms();

    // Se todos os campos são válidos
    if (
      isValidFullname &&
      isValidEmail &&
      isValidPhone &&
      isValidPassword &&
      isValidConfirm &&
      isValidTerms
    ) {
      // Coleta dados do usuário (não armazena senha em produção!)
      const userData = {
        fullname: this.fullname.value.trim(),
        email: this.email.value.trim(),
        phone: this.phone.value.trim(),
        registeredAt: new Date().toISOString(),
        // NOTA: Em produção, NUNCA armazene senhas em texto puro!
        // password: this.password.value // Removido por segurança
      };

      // Simula envio para backend
      console.log("📝 Dados do usuário (simulação):", userData);

      // Feedback de sucesso
      this.showToast("Conta criada com sucesso! 🎉 Bem-vindo!", "success");

      // Reseta formulário
      this.form.reset();

      // Reseta indicador de força da senha
      this.strengthBar.className = "strength-bar";
      this.strengthText.textContent = "";

      // Opcional: redirecionar ou limpar formulário
      // window.location.href = '/dashboard';
    } else {
      // Feedback de erro
      this.showToast(
        "Por favor, corrija os erros no formulário antes de continuar",
        "error",
      );

      // Rola suavemente para o primeiro erro (UX)
      const firstError = document.querySelector(".error-message:not(:empty)");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
}

/**
 * ============================================
 * INICIALIZAÇÃO DA APLICAÇÃO
 * ============================================
 * Aguarda o DOM carregar completamente antes de instanciar
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inicia o formulário quando a página estiver pronta
  new RegistrationForm();

  // Log de inicialização
  console.log("✅ Aplicação inicializada com sucesso");
});
