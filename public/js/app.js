document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('nav button');
    const logoutBtn = document.getElementById('logout-btn');

    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.toggle('hidden', screen.id !== `${screenId}-screen`);
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const screenId = button.dataset.screen;
            if (screenId) {
                showScreen(screenId);
            }
        });
    });

    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html'; // Redirecionar para a página de login
    });

    const deliveriesList = document.getElementById('deliveries-list');

    async function fetchAvailableDeliveries() {
        try {
            const response = await fetch('/api/deliveries/available');
            const deliveries = await response.json();
            renderDeliveries(deliveries);
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
        }
    }

    function renderDeliveries(deliveries) {
        deliveriesList.innerHTML = '';
        deliveries.forEach(delivery => {
            const item = document.createElement('div');
            item.className = 'delivery-item';
            item.innerHTML = `
                <p><strong>Plataforma:</strong> ${delivery.platform}</p>
                <p><strong>De:</strong> ${delivery.pickupAddress}</p>
                <p><strong>Para:</strong> ${delivery.deliveryAddress}</p>
                <p><strong>Valor:</strong> R$ ${delivery.value}</p>
                <button data-id="${delivery.id}">Aceitar</button>
            `;
            item.querySelector('button').addEventListener('click', acceptDelivery);
            deliveriesList.appendChild(item);
        });
    }

    async function acceptDelivery(event) {
        const deliveryId = event.target.dataset.id;
        try {
            await fetch(`/api/deliveries/${deliveryId}/accept`, { method: 'POST' });
            fetchAvailableDeliveries();
        } catch (error) {
            console.error('Erro ao aceitar entrega:', error);
        }
    }

    // Exibir a tela de entregas por padrão
    showScreen('deliveries');
    fetchAvailableDeliveries();
});
