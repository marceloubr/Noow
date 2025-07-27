document.addEventListener('DOMContentLoaded', () => {
  const deliveriesList = document.getElementById('deliveries-list');

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

      // Adiciona cada entrega à lista
      deliveries.forEach(delivery => {
        const deliveryElement = document.createElement('div');
        deliveryElement.className = 'delivery-item';
        deliveryElement.innerHTML = `
          <h3>Pedido #${delivery.orderId} (${delivery.platform})</h3>
          <p><strong>Cliente:</strong> ${delivery.clientName}</p>
          <p><strong>Retirada:</strong> ${delivery.pickupAddress}</p>
          <p><strong>Entrega:</strong> ${delivery.deliveryAddress}</p>
          <p><strong>Status:</strong> <span class="status">${delivery.status}</span></p>
          <button class="update-status-btn" data-id="${delivery.id}">
            ${delivery.status === 'Pendente' ? 'Marcar como Entregue' : 'Marcar como Pendente'}
          </button>
        `;
        deliveriesList.appendChild(deliveryElement);
      });

      // Adiciona ouvintes de evento para os novos botões
      document.querySelectorAll('.update-status-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const id = event.target.dataset.id;
          try {
            const response = await fetch(`/api/deliveries/${id}`, { method: 'PUT' });
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

  // Carrega as entregas quando a página é carregada
  fetchAndDisplayDeliveries();
});
