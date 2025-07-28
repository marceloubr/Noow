document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.textContent = '';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        // Armazena os dados do usuário para uso em outras páginas
        sessionStorage.setItem('user', JSON.stringify(user));
        // Redireciona para a página principal
        window.location.href = '/index.html';
      } else {
        loginError.textContent = 'Credenciais inválidas. Tente novamente.';
      }
    } catch (error) {
      console.error('Erro no login:', error);
      loginError.textContent = 'Ocorreu um erro. Tente novamente mais tarde.';
    }
  });
});
