document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }

    const usersListEl = document.getElementById('users-list');
    const restaurantsListEl = document.getElementById('restaurants-list');
    const ordersListEl = document.getElementById('orders-list');
    const logoutBtn = document.getElementById('logout-btn');

    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        sessionStorage.clear();
        window.location.href = '/';
    });

    async function fetchData() {
        try {
            const [usersRes, restaurantsRes, ordersRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/restaurants'),
                fetch('/api/admin/deliveries')
            ]);
            const users = await usersRes.json();
            const restaurants = await restaurantsRes.json();
            const orders = await ordersRes.json();
            renderData(users, restaurants, orders);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    function renderData(users, restaurants, orders) {
        usersListEl.innerHTML = users.map(u => `<div>${u.username} (${u.role})</div>`).join('');
        restaurantsListEl.innerHTML = restaurants.map(r => `<div>${r.name}</div>`).join('');
        ordersListEl.innerHTML = orders.map(o => `<div>Pedido #${o.id} - ${o.status}</div>`).join('');
    }

    fetchData();
});
