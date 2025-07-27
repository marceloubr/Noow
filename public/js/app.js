document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  // Protege a página
  if (!user) {
    window.location.href = '/';
    return;
  }

  const deliveriesList = document.getElementById('deliveries-list');
  const pageTitle = document.querySelector('h1');
  pageTitle.textContent = `Painel de Entregas - ${user.username}`;


  // Função para buscar e exibir as entregas
  async function fetchAndDisplayDeliveries() {
    try {
      const response = await fetch('/api/deliveries');
      if (!response.ok) {
        throw new Error('Erro ao buscar entregas');
      }
      const deliveries = await response.json();

      // Limpa a lista atual
      deliveriesList.innerHTML = '';

      if (deliveries.length === 0) {
        deliveriesList.innerHTML = '<p>Nenhuma entrega pendente.</p>';
        return;
      }

      // Filtra e exibe as entregas
      const relevantDeliveries = deliveries.filter(d => d.status === 'Pendente' || d.assignedTo === user.id);

      if (relevantDeliveries.length === 0) {
        deliveriesList.innerHTML = '<p>Nenhuma entrega disponível no momento.</p>';
        return;
      }

      relevantDeliveries.forEach(delivery => {
        const deliveryElement = document.createElement('div');
        deliveryElement.className = 'delivery-item';
        let actionButton = '';

        switch(delivery.status) {
            case 'Pendente':
                actionButton = `<button class="update-status-btn" data-id="${delivery.id}" data-next-status="Aceito">Aceitar Pedido</button>`;
                break;
            case 'Aceito':
                actionButton = `<button class="update-status-btn" data-id="${delivery.id}" data-next-status="Coletado">Marcar como Coletado</button>`;
                break;
            case 'Coletado':
                actionButton = `<button class="update-status-btn" data-id="${delivery.id}" data-next-status="Entregue">Marcar como Entregue</button>`;
                break;
            case 'Entregue':
                actionButton = '<span>Pedido Finalizado</span>';
                break;
        }

        deliveryElement.innerHTML = `
          <h3>Pedido #${delivery.orderId} (${delivery.platform})</h3>
          <p><strong>Status:</strong> <span class="status">${delivery.status}</span></p>
          <button class="view-details-btn" data-pickup="${delivery.pickupAddress}" data-delivery="${delivery.deliveryAddress}">Ver Detalhes</button>
          ${actionButton}
        `;
        deliveriesList.appendChild(deliveryElement);
      });

      // Adiciona ouvintes de evento para os botões de detalhes
      document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', (event) => {
          const { pickup, delivery } = event.target.dataset;
          showMapForDelivery(pickup, delivery);
        });
      });

      // Lógica de atualização de status
      document.querySelectorAll('.update-status-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const id = event.target.dataset.id;
          const nextStatus = event.target.dataset.nextStatus;

          try {
            const response = await fetch(`/api/deliveries/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: nextStatus, assignedTo: user.id })
            });

            if (!response.ok) {
              throw new Error('Erro ao atualizar status');
            }
            fetchAndDisplayDeliveries(); // Recarrega a lista
          } catch (error) {
            console.error(error);
            alert('Não foi possível atualizar o status.');
          }
        });
      });
    } catch (error) {
      console.error(error);
      deliveriesList.innerHTML = '<p>Erro ao carregar as entregas.</p>';
    }
  }

  // Lógica para o formulário de adicionar entrega
  const addDeliveryForm = document.getElementById('add-delivery-form');
  addDeliveryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newDelivery = {
      platform: document.getElementById('platform').value,
      orderId: document.getElementById('orderId').value,
      clientName: document.getElementById('clientName').value,
      pickupAddress: document.getElementById('pickupAddress').value,
      deliveryAddress: document.getElementById('deliveryAddress').value,
    };

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDelivery),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar entrega');
      }

      // Limpa o formulário e atualiza a lista
      addDeliveryForm.reset();
      fetchAndDisplayDeliveries();
    } catch (error) {
      console.error(error);
      alert('Não foi possível adicionar a entrega.');
    }
  });

  let map = null;

  // Função para exibir o mapa para uma entrega
  function showMapForDelivery(pickupAddress, deliveryAddress) {
    const mapContainer = document.getElementById('map-container');
    mapContainer.style.display = 'block';

    // Simulação de geocodificação
    const pickupCoords = [38.7223, -9.1393]; // Lisboa
    const deliveryCoords = [38.7369, -9.1427]; // Um pouco ao norte de Lisboa

    if (!map) {
      map = L.map('map-container').setView(pickupCoords, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    } else {
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }

    L.marker(pickupCoords).addTo(map).bindPopup(`<b>Retirada:</b> ${pickupAddress}`);
    L.marker(deliveryCoords).addTo(map).bindPopup(`<b>Entrega:</b> ${deliveryAddress}`);
    map.fitBounds([pickupCoords, deliveryCoords], { padding: [50, 50] });
  }

  // Carrega as entregas quando a página é carregada
  fetchAndDisplayDeliveries();
});
