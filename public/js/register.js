document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            alert('Erro ao registrar');
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
    }
});
