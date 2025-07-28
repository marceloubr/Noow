document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }

    const ordersListEl = document.getElementById('orders-list');
    const logoutBtn = document.getElementById('logout-btn');

    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        sessionStorage.clear();
        window.location.href = '/';
    });

    async function fetchOrders() {
        try {
            const response = await fetch('/api/deliveries');
            const deliveries = await response.json();
            renderOrders(deliveries);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        }
    }

    let deliverers = [];

    async function fetchDeliverers() {
        try {
            const response = await fetch('/api/restaurant/deliverers');
            deliverers = await response.json();
        } catch (error) {
            console.error('Erro ao buscar entregadores:', error);
        }
    }

    function renderOrders(deliveries) {
        ordersListEl.innerHTML = '';
        deliveries.forEach(delivery => {
            const item = document.createElement('div');
            item.className = 'order-item';

            const selectOptions = deliverers
                .map(d => `<option value="${d.id}">${d.username}</option>`)
                .join('');

            item.innerHTML = `
                <h3>Pedido #${delivery.id}</h3>
                <p><strong>Status:</strong> ${delivery.status}</p>
                <p><strong>Entregador:</strong> ${delivery.UserId ? deliverers.find(d => d.id === delivery.UserId)?.username : 'Nenhum'}</p>
                <select data-id="${delivery.id}">
                    <option value="">Atribuir a...</option>
                    ${selectOptions}
                </select>
                <button data-id="${delivery.id}">Atribuir</button>
            `;
            ordersListEl.appendChild(item);
        });

        ordersListEl.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', assignDelivery);
        });
    }

    async function assignDelivery(event) {
        const deliveryId = event.target.dataset.id;
        const select = event.target.previousElementSibling;
        const delivererId = select.value;

        if (!delivererId) {
            alert('Selecione um entregador');
            return;
        }

        try {
            await fetch(`/api/deliveries/${deliveryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: delivererId })
            });
            fetchOrders();
        } catch (error) {
            console.error('Erro ao atribuir entrega:', error);
        }
    }

    async function init() {
        await fetchDeliverers();
        fetchOrders();
    }

    init();
});
