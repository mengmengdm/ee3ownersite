const API_URL = 'https://ujoniobvifxkbhhfopwu.supabase.co/rest/v1/order';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqb25pb2J2aWZ4a2JoaGZvcHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4ODU2NDEsImV4cCI6MjA1NTQ2MTY0MX0.aWD395KJsOXsEZKoV-xWx512ypVkSMkMPhFVOa7IYhc';

// Fetch order data
async function fetchOrders() {
    try {
        // Fetch pending orders
        const pendingResponse = await fetch(`${API_URL}?apikey=${API_KEY}&order=create_at.asc&order_status=eq.0`);
        const pendingOrders = await pendingResponse.json();
        
        // Fetch completed orders
        const completedResponse = await fetch(`${API_URL}?apikey=${API_KEY}&order=create_at.asc&order_status=eq.1`);
        const completedOrders = await completedResponse.json();
        
        displayOrders(pendingOrders, completedOrders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
    }
}

// Display orders
function displayOrders(pendingOrders, completedOrders) {
    const pendingContainer = document.getElementById('pending-orders-container');
    const completedContainer = document.getElementById('completed-orders-container');
    
    pendingContainer.innerHTML = '';
    completedContainer.innerHTML = '';

    // Display pending orders
    pendingOrders.forEach(order => {
        const orderCard = createOrderCard(order, true);
        pendingContainer.appendChild(orderCard);
    });

    // Display completed orders
    completedOrders.forEach(order => {
        const orderCard = createOrderCard(order, false);
        completedContainer.appendChild(orderCard);
    });
}

// Create order card
function createOrderCard(order, isPending) {
    const card = document.createElement('div');
    card.className = 'card order-card mb-3';

    const header = document.createElement('div');
    header.className = 'order-header';
    header.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Order #${order.order_id}</h6>
            <span class="status-badge ${isPending ? 'status-pending' : 'status-completed'}">
                ${isPending ? 'Pending' : 'Completed'}
            </span>
        </div>
    `;

    const body = document.createElement('div');
    body.className = 'order-body';
    
    // Create order details
    const orderDetails = document.createElement('div');
    orderDetails.className = 'order-details';
    
    // Add product information
    const items = [
        { name: 'Salty Popcorn', quantity: order.salty_popcorn || 0 },
        { name: 'Sweet Popcorn', quantity: order.sweet_popcorn || 0 },
        { name: 'Still Water', quantity: order.still_water || 0 },
        { name: 'Sparkling Water', quantity: order.sparkling_water || 0 },
        { name: 'Coca Cola', quantity: order.coca_cola || 0 },
        { name: 'Fanta', quantity: order.fanta || 0 },
        { name: 'Salty Chips', quantity: order.salty_chips || 0 },
        { name: 'Paprika Chips', quantity: order.paprika_chips || 0 },
        { name: 'M&M', quantity: order.mms || 0 }
    ];

    // Filter out items with quantity 0 and sort by quantity (highest first)
    const orderedItems = items
        .filter(item => item.quantity > 0)
        .sort((a, b) => b.quantity - a.quantity);

    if (orderedItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-muted';
        emptyMessage.textContent = 'No items in this order';
        orderDetails.appendChild(emptyMessage);
    } else {
        orderedItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>${item.quantity} pcs</span>
            `;
            orderDetails.appendChild(itemElement);
        });
    }

    // Add order time and room information
    const orderInfo = document.createElement('div');
    orderInfo.className = 'order-info mt-3';
    
    try {
        const orderDate = new Date(order.create_at);
        orderInfo.innerHTML = `
            <div class="order-item">
                <span>Room Number</span>
                <span>${order.room_id || 'N/A'}</span>
            </div>
            <div class="order-item">
                <span>Order Time</span>
                <span>${orderDate.toLocaleString()}</span>
            </div>
            <div class="order-item">
                <span>Customer ID</span>
                <span class="text-truncate" style="max-width: 200px;">${order.customer_id || 'N/A'}</span>
            </div>
        `;
    } catch (error) {
        console.error('Error formatting order date:', error);
        orderInfo.innerHTML = `
            <div class="order-item">
                <span>Room Number</span>
                <span>${order.room_id || 'N/A'}</span>
            </div>
            <div class="order-item">
                <span>Order Time</span>
                <span>Invalid Date</span>
            </div>
        `;
    }

    body.appendChild(orderDetails);
    body.appendChild(orderInfo);

    // Add action buttons only for pending orders
    if (isPending) {
        const actions = document.createElement('div');
        actions.className = 'order-actions';
        actions.innerHTML = `
            <button class="btn btn-success btn-sm" onclick="completeOrder(${order.order_id})">Complete Order</button>
        `;
        body.appendChild(actions);
    }

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

// Complete order
async function completeOrder(orderId) {
    try {
        const response = await fetch(`${API_URL}?order_id=eq.${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ order_status: 1 })
        });

        if (response.ok) {
            fetchOrders(); // Refresh order list
        }
    } catch (error) {
        console.error('Failed to update order status:', error);
    }
}

// Fetch orders when page loads
document.addEventListener('DOMContentLoaded', fetchOrders); 