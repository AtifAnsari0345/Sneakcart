// Product data - simulating a database
const products = [
    {
        id: 1,
        name: 'Air Max 90',
        price: 9749,
        image: 'products/shoe1.png',
        description: 'Classic design with modern comfort technology.'
    },
    {
        id: 2,
        name: 'Ultra Boost',
        price: 13499,
        image: 'products/shoe2.jpg',
        description: 'Responsive cushioning for maximum energy return.'
    },
    {
        id: 3,
        name: 'Classic Leather',
        price: 6749,
        image: 'products/shoe3.jpg',
        description: 'Timeless style with premium materials.'
    },
    {
        id: 4,
        name: 'Cloud Runner',
        price: 11249,
        image: 'products/shoe4.jpg',
        description: 'Lightweight design for everyday comfort.'
    },
    {
        id: 5,
        name: 'Retro High',
        price: 11999,
        image: 'products/shoe5.jpg',
        description: 'Vintage-inspired high-top with modern features.'
    },
    {
        id: 6,
        name: 'Street Racer',
        price: 8999,
        image: 'products/shoe6.jpg',
        description: 'Urban style with enhanced durability.'
    },
    {
        id: 7,
        name: 'Urban Walker',
        price: 10499,
        image: 'products/shoe7.jpg',
        description: 'Stylish design for urban exploration.'
    },
    {
        id: 8,
        name: 'Trail Blazer',
        price: 12749,
        image: 'products/shoe8.jpg',
        description: 'Rugged construction for off-road adventures.'
    },
    {
        id: 9,
        name: 'Fashion Forward',
        price: 14249,
        image: 'products/shoe9.jpg',
        description: 'Trendy design for fashion enthusiasts.'
    }
];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartCountElement = document.getElementById('cartCount');
const loginLink = document.getElementById('loginLink');

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Add item to cart
function addToCart(productId) {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Show login required message
        alert('Please login to add items to your cart');
        window.location.href = 'login.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Ensure we're using the correct image path
        const imagePath = product.image;
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: imagePath,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show confirmation
    alert(`${product.name} added to cart!`);
}

// Display products on homepage
function displayProducts() {
    if (!productGrid) return;
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        const buttonText = user ? 'Add to Cart' : 'Login to Shop';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.onerror=null; this.src='products/shoe1.png';" loading="lazy">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <button class="btn add-to-cart" data-id="${product.id}" aria-label="${buttonText} ${product.name}">${buttonText}</button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Cart page functionality
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const checkoutForm = document.getElementById('checkoutForm');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (!cartItemsContainer) return;
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartItemsContainer.classList.add('hidden');
        cartSummary.classList.add('hidden');
        checkoutForm.classList.add('hidden');
        return;
    }
    
    // Show cart items and hide empty message
    emptyCartMessage.classList.add('hidden');
    cartItemsContainer.classList.remove('hidden');
    cartSummary.classList.remove('hidden');
    checkoutForm.classList.remove('hidden');
    
    // Clear previous items
    cartItemsContainer.innerHTML = '';
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 750; // Fixed shipping cost (converted to INR)
    const total = subtotal + shipping;
    
    // Update summary
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    
    // Display each cart item
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.onerror=null; this.src='products/shoe1.png';">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">₹${item.price.toFixed(2)} x ${item.quantity}</p>
                <button class="btn btn-secondary remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.getAttribute('data-id'));
            removeFromCart(productId);
            displayCart(); // Refresh the cart display
        });
    });
    
    // Handle order submission
    const shippingForm = document.getElementById('shippingForm');
    const orderConfirmation = document.getElementById('orderConfirmation');
    const deliveryDateElement = document.getElementById('deliveryDate');
    
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Calculate delivery date (5 days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        
        // Format the date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        deliveryDateElement.textContent = deliveryDate.toLocaleDateString('en-US', options);
        
        // Hide cart and show confirmation
        cartItemsContainer.classList.add('hidden');
        cartSummary.classList.add('hidden');
        checkoutForm.classList.add('hidden');
        orderConfirmation.classList.remove('hidden');
        
        // Clear the cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    });
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// User authentication
function handleUserAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Update login link
    if (user) {
        loginLink.textContent = user.username;
        loginLink.href = 'login.html';
    } else {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
    }
    
    // Login page functionality
    const loginForm = document.getElementById('loginForm');
    const userProfile = document.getElementById('userProfile');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const profileUsername = document.getElementById('profileUsername');
    const usernameInput = document.getElementById('username');
    
    if (loginForm && userProfile) {
        // Show appropriate section based on login status
        if (user) {
            loginForm.classList.add('hidden');
            userProfile.classList.remove('hidden');
            profileUsername.textContent = user.username;
        } else {
            loginForm.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
        
        // Handle login
        loginButton.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username) {
                localStorage.setItem('user', JSON.stringify({ username }));
                profileUsername.textContent = username;
                loginForm.classList.add('hidden');
                userProfile.classList.remove('hidden');
            }
        });
        
        // Handle logout
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('user');
            loginForm.classList.remove('hidden');
            userProfile.classList.add('hidden');
            usernameInput.value = '';
        });
    }
}

// Initialize the app
function init() {
    updateCartCount();
    handleUserAuth();
    
    // Run page-specific functions
    if (productGrid) displayProducts();
    if (document.querySelector('.cart-section')) displayCart();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);