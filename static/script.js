window.onload = function () {
    document.documentElement.classList.add('loaded');

    if (document.querySelector('.product_slider')) {
        new Swiper('.product_slider', {
            loop: true,
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 30,
            speed: 1000,
            parallax: true,
            mouseWheel: true,
            keyboard: {
                enabled: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: function () {
                    console.log('initiated');
                },
            },
        });
    }

    const newOverlay = document.getElementById('overlay'); // New overlay
    const newCartContent = document.querySelector('.cart-items'); // New cart content container

    const cart = document.querySelector('.header_cart');
    const cartValue = document.querySelector('.header_cart span');
    const totalDisplay = document.getElementById('amt');

    let totalAmount = 0;
    let totalQuantity = 0;

    document.addEventListener('click', function (e) {
        const targetElement = e.target;

        if (targetElement.classList.contains('product_buy') || targetElement.classList.contains('buy-now')) {
            const productSlide = targetElement.closest('.product_slide');
            const productTitle = productSlide.querySelector('.product_title').textContent;
            const productPrice = parseFloat(productSlide.querySelector('.product_price').textContent.replace('Rs.', ''));
            const productImageSrc = productSlide.querySelector('.product_picture').src;

            const existingCartItem = findCartItem(productTitle);

            if (existingCartItem) {
                incrementCartValue(productTitle, productPrice, productImageSrc);
            } else {
                addToCart(productTitle, productPrice, productImageSrc);
            }

            totalQuantity += 1;
            totalAmount += productPrice;

            updateHeaderCart();
            updateSideMenuTotal();
        }
    });

    function findCartItem(productTitle) {
        return Array.from(newCartContent.querySelectorAll('.cart-item')).find(item => item.dataset.title === productTitle);
    }

    function incrementCartValue(productTitle, productPrice, productImageSrc) {
        const existingCartItem = findCartItem(productTitle);
    
        if (existingCartItem) {
            // If the product already exists, increment the quantity by 1
            const quantityElement = existingCartItem.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent, 10);
            quantity += 1;
            quantityElement.textContent = quantity;
    
            updateCartItemTotal(existingCartItem, quantity, productPrice);
        } else {
            // If the product does not exist, add it to the cart with a quantity of 1
            addToCart(productTitle, productPrice, productImageSrc);S
        }
    
        // Update the total quantity and amount
        // totalQuantity += 1;
        totalAmount += productPrice;
    
        // Update the header cart and side menu total
        updateHeaderCart();
        updateSideMenuTotal();
    }

    function addToCart(productTitle, productPrice, productImageSrc) {
        const cartItem = createCartItemElement(productTitle, productPrice, productImageSrc);
        newCartContent.appendChild(cartItem);

        const quantityButtons = cartItem.querySelectorAll('.quantity-group button');
        quantityButtons.forEach(button => {
            button.addEventListener('click', function () {
                const cartItem = this.closest('.cart-item');
                const quantityElement = cartItem.querySelector('.quantity');
                let quantity = parseInt(quantityElement.textContent, 10);

                if (this.classList.contains('minus-btn')) {
                    quantity = Math.max(0, quantity - 1);
                    quantityElement.textContent = quantity;
                } else if (this.classList.contains('plus-btn')) {
                    quantity += 1;
                    quantityElement.textContent = quantity;
                }

                updateCartItemTotal(cartItem, quantity, productPrice);

                if (quantity === 0) {
                    cartItem.parentNode.removeChild(cartItem);
                }

                totalQuantity = Array.from(newCartContent.querySelectorAll('.quantity')).reduce((sum, el) => sum + parseInt(el.textContent, 10), 0);
                totalAmount = Array.from(newCartContent.querySelectorAll('.cart-item-total')).reduce((sum, el) => sum + parseFloat(el.textContent.replace('Rs.', '')), 0);

                updateHeaderCart();
                updateSideMenuTotal();
            });
        });
    }

    function createCartItemElement(title, price, imageSrc) {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.dataset.title = title;
    
        const titleWidth = '150px'; // Set a constant width for the title
    
        cartItem.innerHTML = `
            <img src="${imageSrc}" alt="Product Image" class="cart-item-image">
            <div class="cart-item-info">
                <span class="cart-item-title" style="width: ${titleWidth};">${title}</span>
                <span class="cart-item-price">Rs.${price.toFixed(2)}</span>
            </div>
            <div class="quantity-group">
                <button class="btn btn-primary minus-btn">-</button>
                <span class="quantity">1</span>
                <button class="btn btn-primary plus-btn">+</button>
            </div>
            <span class="cart-item-total">Rs.${price.toFixed(2)}</span>
        `;
    
        return cartItem;
    }
    

    function updateHeaderCart() {
        cartValue.innerHTML = totalQuantity;
    }

    function updateSideMenuTotal() {
        const cartItems = Array.from(newCartContent.querySelectorAll('.cart-item'));
    
        // Calculate the sum of all product total prices
        const totalAmount = cartItems.reduce((sum, cartItem) => {
            const itemTotal = parseFloat(cartItem.querySelector('.cart-item-total').textContent.replace('Rs.', ''));
            return sum + itemTotal;
        }, 0);
    
        // Display the total amount in the cart total
        const totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = `Rs.${totalAmount.toFixed(2)}`;
    }

    
    

    function updateCartItemTotal(cartItem, quantity, productPrice) {
        const itemTotalPrice = quantity * productPrice;
        cartItem.querySelector('.cart-item-price').textContent = `Rs.${productPrice.toFixed(2)}`;
        cartItem.querySelector('.quantity').textContent = quantity;
        cartItem.querySelector('.cart-item-total').textContent = `Rs.${itemTotalPrice.toFixed(2)}`;
    }

    const submitBtn = document.querySelector('.checkout-btn');
    submitBtn.addEventListener('click', function () {
        const cartItems = Array.from(newCartContent.querySelectorAll('.cart-item-title'));
        const cartQuantities = Array.from(newCartContent.querySelectorAll('.quantity'));

        const cartData = {};

        cartItems.forEach((item, index) => {
            const productTitle = item.textContent.trim();
            const productQuantity = parseInt(cartQuantities[index].textContent, 10);
            cartData[productTitle] = productQuantity;
        });

        // Add the logic for creating the form and submitting it
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = '/create_order';

        var hiddenAmountField = document.createElement('input');
        hiddenAmountField.type = 'hidden';
        hiddenAmountField.name = 'order_amount';
        hiddenAmountField.value = totalAmount.toString();

        var hiddenQuantityField = document.createElement('input');
        hiddenQuantityField.type = 'hidden';
        hiddenQuantityField.name = 'order_quantity';
        hiddenQuantityField.value = totalQuantity.toString();

        var hiddenCartDataField = document.createElement('input');
        hiddenCartDataField.type = 'hidden';
        hiddenCartDataField.name = 'cart_data';
        hiddenCartDataField.value = JSON.stringify(cartData);

        form.appendChild(hiddenAmountField);
        form.appendChild(hiddenQuantityField);
        form.appendChild(hiddenCartDataField);

        document.body.appendChild(form);
        form.submit();
    });
    const clearButton = document.querySelector('.clear-btn');

    // Add event listener for the click event on the clear button
    clearButton.addEventListener('click', clearCart);
    function clearCart() {
        // Get the cart items container
        var cartItemsContainer = document.querySelector('.cart-items');
        
        // Remove all child elements (cart items) from the container
        while (cartItemsContainer.firstChild) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }
        
        // Update the total amount to 0
        var totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = 'Rs.0.00';
        totalQuantity=0;
        cartValue.innerHTML = totalQuantity;
    }

    function toggleOverlay() {
        var overlay = document.getElementById('overlay');
        // var sideMenu = document.getElementById('sideMenu');

        overlay.style.display = (overlay.style.display === 'block') ? 'none' : 'block';
        // sideMenu.style.right = (sideMenu.style.right === '0px') ? '-1500px' : '0px';

    }
};

