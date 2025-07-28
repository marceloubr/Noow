document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }

    // --- Elementos da UI ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const viewDetails = document.getElementById('view-details');
    const deliveriesListEl = document.getElementById('deliveries-list');
    const settingsUsernameEl = document.getElementById('settings-username');
    const logoutBtn = document.getElementById('logout-btn');
    const backBtn = document.getElementById('back-to-list-btn');

    // Detalhes
    const detailsOrderIdEl = document.getElementById('details-order-id');
    const detailsMapEl = document.getElementById('details-map');
    const detailsInfoEl = document.getElementById('details-info');
    const detailsActionEl = document.getElementById('details-action');

    // --- Estado da Aplicação ---
    let deliveries = [];
    let mainMap = null;
    let detailsMap = null;

    // --- Lógica de Navegação por Abas ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tabName === 'map') {
                setTimeout(() => mainMap.invalidateSize(), 100);
            }
        });
    });

    // --- Lógica de Detalhes (Modal) ---
    function showDetailsView(show = true) {
        viewDetails.classList.toggle('hidden', !show);
        if (show) {
            setTimeout(() => detailsMap.invalidateSize(), 100);
        }
    }
    backBtn.addEventListener('click', () => showDetailsView(false));

    // --- Inicialização ---
    async function init() {
        settingsUsernameEl.textContent = user.username;
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = '/';
        });

        initMainMap();

        try {
            const response = await fetch('/api/deliveries');
            deliveries = await response.json();
            renderDeliveriesList();
            plotDeliveriesOnMainMap();
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
        }
    }

    // --- Mapa Principal ---
    function initMainMap() {
        mainMap = L.map('main-map').setView([38.7223, -9.1393], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mainMap);

        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            const riderCoords = [latitude, longitude];
            mainMap.setView(riderCoords, 15);
            L.marker(riderCoords, { title: "Sua Posição" }).addTo(mainMap);
        }, () => {
            console.warn("Não foi possível obter a localização.");
        });
    }

    function plotDeliveriesOnMainMap() {
        deliveries.forEach(delivery => {
            if (delivery.status !== 'Pendente') return;
            const pickupCoords = [38.7223 + (Math.random() - 0.5) * 0.1, -9.1393 + (Math.random() - 0.5) * 0.1];
            L.marker(pickupCoords, { title: `#${delivery.id}` })
                .addTo(mainMap)
                .on('click', () => renderDetailsView(delivery.id));
        });
    }

    // --- Renderização de Listas e Detalhes ---
    function renderDeliveriesList() {
        deliveriesListEl.innerHTML = '';
        let relevantDeliveries = deliveries.filter(d => d.status !== 'Entregue' && (d.assignedTo === null || d.assignedTo === user.id));

        // Simulação de otimização: Pendentes primeiro, depois Aceitos ordenados por ID.
        relevantDeliveries.sort((a, b) => {
            if (a.status === 'Pendente' && b.status !== 'Pendente') return -1;
            if (a.status !== 'Pendente' && b.status === 'Pendente') return 1;
            return a.id - b.id;
        });

        relevantDeliveries.forEach(delivery => {
            const item = document.createElement('div');
            item.className = 'delivery-item';
            item.dataset.id = delivery.id;
            item.innerHTML = `<h3>Pedido #${delivery.id}</h3><p>${delivery.pickupAddress}</p><p><strong>Status: ${delivery.status}</strong></p>`;
            item.addEventListener('click', () => renderDetailsView(delivery.id));
            deliveriesListEl.appendChild(item);
        });
    }

    function renderDetailsView(id) {
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) return;

        detailsOrderIdEl.textContent = `Pedido #${delivery.id}`;

        const encodedPickup = encodeURIComponent(delivery.pickupAddress);
        const encodedDelivery = encodeURIComponent(delivery.deliveryAddress);
        let pickupNavBtn = (delivery.status === 'Aceito' || delivery.status === 'Coletado') ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${encodedPickup}" target="_blank" class="nav-btn">Navegar</a>` : '';
        let deliveryNavBtn = delivery.status === 'Coletado' ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${encodedDelivery}" target="_blank" class="nav-btn">Navegar</a>` : '';

        detailsInfoEl.innerHTML = `
            <div class="address-line"><p><strong>De:</strong> ${delivery.pickupAddress}</p>${pickupNavBtn}</div>
            <div class="address-line"><p><strong>Para:</strong> ${delivery.deliveryAddress}</p>${deliveryNavBtn}</div>`;

        let actionButton = '';
        switch(delivery.status) {
            case 'Pendente': actionButton = `<button data-id="${delivery.id}" data-next-status="Aceito">ACEITAR PEDIDO</button>`; break;
            case 'Aceito': actionButton = `<button data-id="${delivery.id}" data-next-status="Coletado">CHEGUEI NA COLETA</button>`; break;
            case 'Coletado': actionButton = `<button data-id="${delivery.id}" data-next-status="Entregue">FINALIZAR ENTREGA</button>`; break;
        }
        detailsActionEl.innerHTML = actionButton;
        if(detailsActionEl.querySelector('button')) {
            detailsActionEl.querySelector('button').addEventListener('click', handleUpdateStatus);
        }

        if (!detailsMap) detailsMap = L.map('details-map');
        const pickupCoords = [38.7223, -9.1393];
        const deliveryCoords = [38.7369, -9.1427];
        detailsMap.eachLayer(layer => { if (layer instanceof L.Marker || layer instanceof L.TileLayer) detailsMap.removeLayer(layer); });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(detailsMap);
        L.marker(pickupCoords).addTo(detailsMap).bindPopup(delivery.pickupAddress);
        L.marker(deliveryCoords).addTo(detailsMap).bindPopup(delivery.deliveryAddress);
        detailsMap.fitBounds([pickupCoords, deliveryCoords], { padding: [50, 50] });

        showDetailsView(true);
    }

    // --- Ações ---
    async function handleUpdateStatus(event) {
        const { id, nextStatus } = event.target.dataset;
        try {
            const response = await fetch(`/api/deliveries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus, assignedTo: user.id })
            });
            if (!response.ok) throw new Error('Falha ao atualizar');

            const updatedDelivery = await response.json();
            const index = deliveries.findIndex(d => d.id == id);
            deliveries[index] = updatedDelivery;

            renderDeliveriesList();
            plotDeliveriesOnMainMap();
            showDetailsView(false);
        } catch (error) {
            console.error(error);
            alert('Não foi possível atualizar o status.');
        }
    }

    init();
});
