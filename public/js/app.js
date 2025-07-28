document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }

    // Elementos da UI
    const viewList = document.getElementById('view-list');
    const viewDetails = document.getElementById('view-details');
    const deliveriesListEl = document.getElementById('deliveries-list');
    const userInfoEl = document.getElementById('user-info');
    const backBtn = document.getElementById('back-to-list-btn');

    // Elementos dos Detalhes
    const detailsOrderIdEl = document.getElementById('details-order-id');
    const detailsMapEl = document.getElementById('details-map');
    const detailsInfoEl = document.getElementById('details-info');
    const detailsActionEl = document.getElementById('details-action');

    let map = null;
    let deliveries = [];

    userInfoEl.textContent = `Olá, ${user.username}`;

    // Navegação entre telas
    function showListView() {
        viewList.classList.remove('hidden');
        viewDetails.classList.add('hidden');
    }

    function showDetailsView() {
        viewList.classList.add('hidden');
        viewDetails.classList.remove('hidden');
    }

    backBtn.addEventListener('click', showListView);

    // Renderizar a lista de entregas
    function renderDeliveriesList() {
        deliveriesListEl.innerHTML = '';
        const relevantDeliveries = deliveries.filter(d => d.status !== 'Entregue' && (d.assignedTo === null || d.assignedTo === user.id));

        if (relevantDeliveries.length === 0) {
            deliveriesListEl.innerHTML = '<p style="padding: 15px;">Nenhum pedido disponível.</p>';
            return;
        }

        relevantDeliveries.forEach(delivery => {
            const item = document.createElement('div');
            item.className = 'delivery-item';
            item.dataset.id = delivery.id;
            item.innerHTML = `
                <h3>Pedido #${delivery.id}</h3>
                <p>${delivery.pickupAddress}</p>
                <p><strong>Status: ${delivery.status}</strong></p>
            `;
            item.addEventListener('click', () => renderDetailsView(delivery.id));
            deliveriesListEl.appendChild(item);
        });
    }

    // Renderizar a tela de detalhes
    function renderDetailsView(id) {
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        detailsOrderIdEl.textContent = `Pedido #${delivery.id}`;

        // Info do Pedido
        detailsInfoEl.innerHTML = `
            <p><strong>De:</strong> ${delivery.pickupAddress}</p>
            <p><strong>Para:</strong> ${delivery.deliveryAddress}</p>
        `;

        // Ação do Pedido
        let actionButton = '';
        switch(delivery.status) {
            case 'Pendente':
                actionButton = `<button data-id="${delivery.id}" data-next-status="Aceito">ACEITAR PEDIDO</button>`;
                break;
            case 'Aceito':
                actionButton = `<button data-id="${delivery.id}" data-next-status="Coletado">CHEGUEI NA COLETA</button>`;
                break;
            case 'Coletado':
                actionButton = `<button data-id="${delivery.id}" data-next-status="Entregue">FINALIZAR ENTREGA</button>`;
                break;
        }
        detailsActionEl.innerHTML = actionButton;
        if(detailsActionEl.querySelector('button')){
            detailsActionEl.querySelector('button').addEventListener('click', handleUpdateStatus);
        }

        // Inicializar ou atualizar o mapa
        if (!map) {
            map = L.map('details-map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }
        const pickupCoords = [38.7223, -9.1393];
        const deliveryCoords = [38.7369, -9.1427];
        map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
        L.marker(pickupCoords).addTo(map).bindPopup(delivery.pickupAddress);
        L.marker(deliveryCoords).addTo(map).bindPopup(delivery.deliveryAddress);
        map.fitBounds([pickupCoords, deliveryCoords], { padding: [50, 50] });
        setTimeout(() => map.invalidateSize(), 100);

        showDetailsView();
    }

    // Atualizar status
    async function handleUpdateStatus(event) {
        const { id, nextStatus } = event.target.dataset;
        try {
            const response = await fetch(`/api/deliveries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus, assignedTo: user.id })
            });
            if (!response.ok) throw new Error('Falha ao atualizar');

            // Atualiza o estado local e re-renderiza
            const updatedDelivery = await response.json();
            const index = deliveries.findIndex(d => d.id === updatedDelivery.id);
            deliveries[index] = updatedDelivery;

            renderDeliveriesList();
            showListView();

        } catch (error) {
            console.error(error);
            alert('Não foi possível atualizar o status.');
        }
    }

    // Função inicial
    async function init() {
        try {
            const response = await fetch('/api/deliveries');
            deliveries = await response.json();
            renderDeliveriesList();
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
        }
    }

    init();
});
