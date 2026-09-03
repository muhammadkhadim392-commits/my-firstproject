/* =========================================================
   PREMIUM SLAUGHTER HOUSE
   COMPLETE JAVASCRIPT
   SHOPPING CART + CHECKOUT + DISCOUNTS
   PHONE + ADDRESS VALIDATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       PRODUCT DATA
       ===================================================== */

    const products = [

        {
            id: "fresh-chilled-beef",
            name: "Fresh Chilled Beef",
            price: 1599,
            regularPrice: 1750,
            availability: "Available",
            image: "images/products/fresh-chilled-beef.jpg",
            specialOffer: true
        },

        {
            id: "premium-frozen-beef",
            name: "Premium Frozen Beef",
            price: 2000,
            regularPrice: 2000,
            availability: "Available",
            image: "images/products/premium-frozen-beef.jpg",
            specialOffer: false
        },

        {
            id: "fresh-chilled-mutton",
            name: "Fresh Chilled Mutton",
            price: 3200,
            regularPrice: 3200,
            availability: "Available",
            image: "images/products/fresh-chilled-mutton.jpg",
            specialOffer: false
        },

        {
            id: "premium-frozen-mutton",
            name: "Premium Frozen Mutton",
            price: 3600,
            regularPrice: 3600,
            availability: "Limited Stock",
            image: "images/products/premium-frozen-mutton.jpg",
            specialOffer: false
        },

        {
            id: "fresh-chilled-sheep",
            name: "Fresh Chilled Sheep Meat",
            price: 3250,
            regularPrice: 3250,
            availability: "Available",
            image: "images/products/fresh-chilled-sheep.jpg",
            specialOffer: false
        },

        {
            id: "premium-frozen-sheep",
            name: "Premium Frozen Sheep Meat",
            price: 3650,
            regularPrice: 3650,
            availability: "Limited Stock",
            image: "images/products/premium-frozen-sheep.jpg",
            specialOffer: false
        },

        {
            id: "fresh-chilled-camel",
            name: "Fresh Chilled Camel Meat",
            price: 1450,
            regularPrice: 1450,
            availability: "Available",
            image: "images/products/fresh-chilled-camel.jpg",
            specialOffer: false
        },

        {
            id: "premium-frozen-camel",
            name: "Premium Frozen Camel Meat",
            price: 1650,
            regularPrice: 1650,
            availability: "Limited Stock",
            image: "images/products/premium-frozen-camel.jpg",
            specialOffer: false
        }

    ];


    /* =====================================================
       DISCOUNT SETTINGS
       ===================================================== */

    const FIRST_ORDER_DISCOUNT_RATE = 0.05;


    /* =====================================================
       SHOPPING CART
       ===================================================== */

    let cart = [];


    /* =====================================================
       PAGE ELEMENTS
       ===================================================== */

    const productGrid =
        document.getElementById("product-grid");

    const cartItems =
        document.getElementById("cart-items");

    const cartQuantity =
        document.getElementById("cart-quantity");

    const cartSubtotal =
        document.getElementById("cart-subtotal");

    const cartSpecialDiscount =
        document.getElementById("cart-special-discount");

    const cartFirstOrderDiscount =
        document.getElementById("cart-first-order-discount");

    const cartTotalSavings =
        document.getElementById("cart-total-savings");

    const cartTotal =
        document.getElementById("cart-total");

    const checkoutButton =
        document.getElementById("checkout-button");

    const checkoutSection =
        document.getElementById("checkout-section");

    const checkoutOrderSummary =
        document.getElementById("checkout-order-summary");

    const checkoutSubtotal =
        document.getElementById("checkout-subtotal");

    const checkoutSpecialDiscount =
        document.getElementById("checkout-special-discount");

    const checkoutFirstOrderDiscount =
        document.getElementById("checkout-first-order-discount");

    const checkoutTotalSavings =
        document.getElementById("checkout-total-savings");

    const checkoutTotal =
        document.getElementById("checkout-total");

    const placeOrderButton =
        document.getElementById("place-order-button");

    const orderMessage =
        document.getElementById("order-message");

    const checkoutForm =
        document.getElementById("checkout-form");


    /* =====================================================
       IMPORTANT
       RUN THIS SHOPPING-CART CODE ONLY ON ORDER PAGE
       ===================================================== */

    if (!productGrid) {

        return;

    }


    /* =====================================================
       FIND PRODUCT
       ===================================================== */

    function findProduct(productId) {

        return products.find(function (product) {

            return product.id === productId;

        });

    }


    /* =====================================================
       FORMAT MONEY
       ===================================================== */

    function formatMoney(amount) {

        return Number(amount).toLocaleString("en-PK");

    }


    /* =====================================================
       ITEM TOTAL
       ===================================================== */

    function calculateItemTotal(price, quantity) {

        return price * quantity;

    }


    /* =====================================================
       CART SUBTOTAL
       ===================================================== */

    function calculateSubtotal() {

        return cart.reduce(function (total, item) {

            return total +
                calculateItemTotal(
                    item.price,
                    item.quantity
                );

        }, 0);

    }


    /* =====================================================
       SPECIAL OFFER DISCOUNT
       ===================================================== */

    function calculateSpecialOfferDiscount() {

        return cart.reduce(function (discount, item) {

            const product =
                findProduct(item.id);


            if (
                product &&
                product.specialOffer
            ) {

                const savingPerKg =
                    product.regularPrice -
                    product.price;


                return discount +
                    savingPerKg *
                    item.quantity;

            }


            return discount;

        }, 0);

    }


    /* =====================================================
       PRICE AFTER SPECIAL OFFER
       ===================================================== */

    function calculatePriceAfterSpecialOffer() {

        return calculateSubtotal() -
            calculateSpecialOfferDiscount();

    }


    /* =====================================================
       FIRST ORDER 5% DISCOUNT
       ===================================================== */

    function calculateFirstOrderDiscount() {

        const priceAfterSpecialOffer =
            calculatePriceAfterSpecialOffer();


        return Math.round(
            priceAfterSpecialOffer *
            FIRST_ORDER_DISCOUNT_RATE
        );

    }


    /* =====================================================
       FINAL TOTAL
       ===================================================== */

    function calculateFinalTotal() {

        return calculatePriceAfterSpecialOffer() -
            calculateFirstOrderDiscount();

    }


    /* =====================================================
       TOTAL SAVINGS
       ===================================================== */

    function calculateTotalSavings() {

        return calculateSpecialOfferDiscount() +
            calculateFirstOrderDiscount();

    }


    /* =====================================================
       TOTAL QUANTITY
       ===================================================== */

    function calculateTotalQuantity() {

        return cart.reduce(function (total, item) {

            return total +
                item.quantity;

        }, 0);

    }


    /* =====================================================
       SAVE CART
       ===================================================== */

    function saveCart() {

        localStorage.setItem(
            "premiumMeatCart",
            JSON.stringify(cart)
        );

    }


    /* =====================================================
       LOAD CART
       ===================================================== */

    function loadCart() {

        const savedCart =
            localStorage.getItem(
                "premiumMeatCart"
            );


        if (!savedCart) {

            return;

        }


        try {

            const savedData =
                JSON.parse(savedCart);


            if (Array.isArray(savedData)) {

                cart = savedData;

            }

        }

        catch (error) {

            console.error(
                "Could not load saved cart:",
                error
            );

            cart = [];

        }

    }


    /* =====================================================
       ADD TO CART
       ===================================================== */

    function addToCart(productId, quantity) {

        const product =
            findProduct(productId);


        if (!product) {

            console.error(
                "Product not found:",
                productId
            );

            return;

        }


        const existingItem =
            cart.find(function (item) {

                return item.id === productId;

            });


        if (existingItem) {

            existingItem.quantity =
                existingItem.quantity +
                quantity;

        }

        else {

            cart.push({

                id: product.id,

                name: product.name,

                price: product.price,

                regularPrice:
                    product.regularPrice,

                specialOffer:
                    product.specialOffer,

                quantity: quantity

            });

        }


        saveCart();

        displayCart();

    }


    /* =====================================================
       INCREASE QUANTITY
       ===================================================== */

    function increaseQuantity(productId) {

        const item =
            cart.find(function (cartItem) {

                return cartItem.id === productId;

            });


        if (!item) {

            return;

        }


        item.quantity =
            item.quantity + 1;


        saveCart();

        displayCart();

    }


    /* =====================================================
       DECREASE QUANTITY
       ===================================================== */

    function decreaseQuantity(productId) {

        const item =
            cart.find(function (cartItem) {

                return cartItem.id === productId;

            });


        if (!item) {

            return;

        }


        if (item.quantity > 1) {

            item.quantity =
                item.quantity - 1;

        }

        else {

            removeFromCart(productId);

            return;

        }


        saveCart();

        displayCart();

    }


    /* =====================================================
       REMOVE FROM CART
       ===================================================== */

    function removeFromCart(productId) {

        cart =
            cart.filter(function (item) {

                return item.id !== productId;

            });


        saveCart();

        displayCart();

    }


   function displayCart() {

    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    /* =================================================
       EMPTY CART
       ================================================= */

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="cart-empty">

                <div class="cart-empty-icon">
                    🛒
                </div>

                <h3>
                    Your Shopping Cart is Empty
                </h3>

                <p>
                    Add your favourite meat products
                    to your cart to continue.
                </p>

            </div>
        `;

        updateTotals();

        displayCheckoutSummary();

        return;

    }


    /* =================================================
       CREATE CART PRODUCT CARDS
       ================================================= */

    cart.forEach(function (item) {

        const product =
            findProduct(item.id);


        if (!product) {
            return;
        }


        const itemTotal =
            calculateItemTotal(
                item.price,
                item.quantity
            );


        /* =============================================
           MAIN CART CARD
           ============================================= */

        const cartItem =
            document.createElement("article");


        cartItem.className =
            "cart-item";


        /* =============================================
           PRODUCT IMAGE
           ============================================= */

        const image =
            document.createElement("img");


        image.className =
            "cart-item-image";


        image.src =
            product.image;


        image.alt =
            product.name;


        image.loading =
            "lazy";


        /* =============================================
           PRODUCT INFORMATION
           ============================================= */

        const information =
            document.createElement("div");


        information.className =
            "cart-item-information";


        const itemName =
            document.createElement("h3");


        itemName.className =
            "cart-item-name";


        itemName.textContent =
            item.name;


        const itemPrice =
            document.createElement("p");


        itemPrice.className =
            "cart-item-price";


        itemPrice.textContent =
            "PKR " +
            formatMoney(item.price) +
            " / kg";


        const itemTotalText =
            document.createElement("p");


        itemTotalText.className =
            "cart-item-total";


        itemTotalText.innerHTML =
            "<strong>Item Total:</strong> PKR " +
            formatMoney(itemTotal);


        information.appendChild(
            itemName
        );


        information.appendChild(
            itemPrice
        );


        information.appendChild(
            itemTotalText
        );



        /* =============================================
           CONTROLS
           ============================================= */

        const controls =
            document.createElement("div");


        controls.className =
            "cart-item-controls";


        const quantityLabel =
            document.createElement("span");


        quantityLabel.className =
            "cart-control-label";


        quantityLabel.textContent =
            "Quantity";


        controls.appendChild(
            quantityLabel
        );



        /* =============================================
           QUANTITY CONTROL BOX
           ============================================= */

        const quantityControls =
            document.createElement("div");


        quantityControls.className =
            "cart-quantity-controls";


        /* MINUS */

        const minusButton =
            document.createElement("button");


        minusButton.type =
            "button";


        minusButton.className =
            "cart-minus";


        minusButton.textContent =
            "−";


        minusButton.addEventListener(
            "click",
            function () {

                decreaseQuantity(
                    item.id
                );

            }
        );



        /* QUANTITY */

        const quantityNumber =
            document.createElement("span");


        quantityNumber.className =
            "cart-quantity-number";


        quantityNumber.textContent =
            item.quantity +
            " kg";



        /* PLUS */

        const plusButton =
            document.createElement("button");


        plusButton.type =
            "button";


        plusButton.className =
            "cart-plus";


        plusButton.textContent =
            "+";


        plusButton.addEventListener(
            "click",
            function () {

                increaseQuantity(
                    item.id
                );

            }
        );


        quantityControls.appendChild(
            minusButton
        );


        quantityControls.appendChild(
            quantityNumber
        );


        quantityControls.appendChild(
            plusButton
        );


        controls.appendChild(
            quantityControls
        );



        /* =============================================
           REMOVE BUTTON
           ============================================= */

        const removeButton =
            document.createElement("button");


        removeButton.type =
            "button";


        removeButton.className =
            "remove-cart-item";


        removeButton.textContent =
            "Remove";


        removeButton.addEventListener(
            "click",
            function () {

                removeFromCart(
                    item.id
                );

            }
        );


        controls.appendChild(
            removeButton
        );



        /* =============================================
           PUT EVERYTHING TOGETHER
           ============================================= */

        cartItem.appendChild(
            image
        );


        cartItem.appendChild(
            information
        );


        cartItem.appendChild(
            controls
        );


        cartItems.appendChild(
            cartItem
        );

    });


    /* =================================================
       UPDATE TOTALS
       ================================================= */

    updateTotals();


    displayCheckoutSummary();

}


    /* =====================================================
       UPDATE ALL TOTALS
       ===================================================== */

    function updateTotals() {

        const subtotal =
            calculateSubtotal();


        const specialDiscount =
            calculateSpecialOfferDiscount();


        const firstOrderDiscount =
            calculateFirstOrderDiscount();


        const totalSavings =
            calculateTotalSavings();


        const finalTotal =
            calculateFinalTotal();


        const totalQuantity =
            calculateTotalQuantity();


        if (cartQuantity) {

            cartQuantity.textContent =
                totalQuantity;

        }


        if (cartSubtotal) {

            cartSubtotal.textContent =
                formatMoney(subtotal);

        }


        if (cartSpecialDiscount) {

            cartSpecialDiscount.textContent =
                formatMoney(
                    specialDiscount
                );

        }


        if (cartFirstOrderDiscount) {

            cartFirstOrderDiscount.textContent =
                formatMoney(
                    firstOrderDiscount
                );

        }


        if (cartTotalSavings) {

            cartTotalSavings.textContent =
                formatMoney(
                    totalSavings
                );

        }


        if (cartTotal) {

            cartTotal.textContent =
                formatMoney(finalTotal);

        }


        if (checkoutSubtotal) {

            checkoutSubtotal.textContent =
                formatMoney(subtotal);

        }


        if (checkoutSpecialDiscount) {

            checkoutSpecialDiscount.textContent =
                formatMoney(
                    specialDiscount
                );

        }


        if (checkoutFirstOrderDiscount) {

            checkoutFirstOrderDiscount.textContent =
                formatMoney(
                    firstOrderDiscount
                );

        }


        if (checkoutTotalSavings) {

            checkoutTotalSavings.textContent =
                formatMoney(
                    totalSavings
                );

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                formatMoney(finalTotal);

        }

    }


    /* =====================================================
       CHECKOUT SUMMARY
       ===================================================== */

    function displayCheckoutSummary() {

        if (!checkoutOrderSummary) {

            return;

        }


        checkoutOrderSummary.innerHTML = "";


        if (cart.length === 0) {

            checkoutOrderSummary.innerHTML =
                "<p>Your selected products will appear here.</p>";

            return;

        }


        cart.forEach(function (item) {

            const itemTotal =
                calculateItemTotal(
                    item.price,
                    item.quantity
                );


            const summaryLine =
                document.createElement("p");


            summaryLine.textContent =
                item.name +
                " — " +
                item.quantity +
                " kg × PKR " +
                formatMoney(item.price) +
                " = PKR " +
                formatMoney(itemTotal);


            checkoutOrderSummary.appendChild(
                summaryLine
            );

        });

    }


    /* =====================================================
       ADD TO CART BUTTONS
       ===================================================== */

    const addToCartButtons =
        document.querySelectorAll(
            ".add-to-cart"
        );


    addToCartButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        button.dataset.productId;


                    const quantityInput =
                        document.getElementById(
                            "quantity-" +
                            productId
                        );


                    if (!quantityInput) {

                        alert(
                            "Quantity field not found."
                        );

                        return;

                    }


                    const quantity =
                        Number(
                            quantityInput.value
                        );


                    if (
                        !Number.isFinite(quantity) ||
                        quantity <= 0
                    ) {

                        alert(
                            "Please enter a valid quantity."
                        );

                        quantityInput.focus();

                        return;

                    }


                    addToCart(
                        productId,
                        quantity
                    );


                    button.textContent =
                        "Added to Cart ✓";


                    setTimeout(
                        function () {

                            button.textContent =
                                "Add to Cart";

                        },
                        1200
                    );

                }
            );

        }
    );


    /* =====================================================
       CHECKOUT BUTTON
       ===================================================== */

    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            function () {

                if (cart.length === 0) {

                    alert(
                        "Please add at least one product to your cart."
                    );

                    return;

                }


                if (checkoutSection) {

                    checkoutSection.style.display =
                        "block";


                    checkoutSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }


                displayCheckoutSummary();

                updateTotals();

            }
        );

    }


    /* =====================================================
       PHONE VALIDATION
       ===================================================== */

    function isValidPhone(phone) {

        /*
           Remove spaces and hyphens.

           Accepted examples:

           03001234567
           03123456789
           03211234567
           +923001234567
           00923001234567

           Rejected:

           ghhdvbd
           12345
           0300abc1234
        */

        const cleanedPhone =
            phone
                .trim()
                .replace(/[\s-]/g, "");


        const phonePattern =
            /^(03\d{9}|\+923\d{9}|00923\d{9})$/;


        return phonePattern.test(
            cleanedPhone
        );

    }


    /* =====================================================
       NAME VALIDATION
       ===================================================== */

    function isValidName(name) {

        const cleanedName =
            name.trim();


        /*
           Name must:

           - contain letters
           - be at least 3 characters
           - contain no numbers
        */

        const namePattern =
            /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'-]{2,49}$/;


        return namePattern.test(
            cleanedName
        );

    }


    /* =====================================================
       ADDRESS VALIDATION
       ===================================================== */

    function isValidAddress(address) {

        const cleanedAddress =
            address.trim();


        /*
           Minimum length.
        */

        if (cleanedAddress.length < 15) {

            return false;

        }


        /*
           At least 3 words.
        */

        const words =
            cleanedAddress
                .split(/\s+/)
                .filter(function (word) {

                    return word.length > 0;

                });


        if (words.length < 3) {

            return false;

        }


        /*
           Must contain letters.
        */

        if (
            !/[A-Za-zÀ-ÿ]/.test(
                cleanedAddress
            )
        ) {

            return false;

        }


        /*
           Detect obvious repeated-letter nonsense.

           Example:

           aaaaaaaa
           bbbbbbbbb
        */

        const lettersOnly =
            cleanedAddress
                .replace(
                    /[^A-Za-zÀ-ÿ]/g,
                    ""
                )
                .toLowerCase();


        if (
            lettersOnly.length >= 8 &&
            new Set(lettersOnly).size === 1
        ) {

            return false;

        }


        /*
           Require useful address information.

           Examples of acceptable words:

           house
           plot
           street
           road
           block
           sector
           phase
           lane
           town
           colony
           market
           plaza
           shop
           village
           mohalla
           area
           near
           opposite
           chowk
        */

        const addressWords =
            [
                "house",
                "hno",
                "h.no",
                "plot",
                "flat",
                "apartment",
                "apt",
                "street",
                "st",
                "road",
                "rd",
                "block",
                "sector",
                "phase",
                "lane",
                "town",
                "colony",
                "market",
                "plaza",
                "shop",
                "village",
                "mohalla",
                "area",
                "near",
                "opposite",
                "chowk"
            ];


        const lowerAddress =
            cleanedAddress.toLowerCase();


        let hasAddressWord = false;


        addressWords.forEach(
            function (word) {

                if (
                    lowerAddress.includes(
                        word
                    )
                ) {

                    hasAddressWord = true;

                }

            }
        );


        /*
           A good address should normally have
           either a number or an address keyword.
        */

        const hasNumber =
            /\d/.test(
                cleanedAddress
            );


        if (
            !hasNumber &&
            !hasAddressWord
        ) {

            return false;

        }


        return true;

    }


    /* =====================================================
       CITY VALIDATION
       ===================================================== */

    function isValidCity(city) {

        const cleanedCity =
            city.trim();


        const cityPattern =
            /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'-]{2,39}$/;


        return cityPattern.test(
            cleanedCity
        );

    }


    /* =====================================================
       SHOW ERROR
       ===================================================== */

    function showValidationError(
        message,
        inputElement
    ) {

        if (!orderMessage) {

            alert(message);

        }

        else {

            orderMessage.textContent =
                message;


            orderMessage.style.backgroundColor =
                "#ffe6e6";


            orderMessage.style.color =
                "#a40000";


            orderMessage.style.padding =
                "15px";


            orderMessage.style.borderRadius =
                "8px";

        }


        if (inputElement) {

            inputElement.focus();

        }


        if (orderMessage) {

            orderMessage.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }


    /* =====================================================
       PLACE ORDER
       ===================================================== */

    if (placeOrderButton) {

        placeOrderButton.addEventListener(
            "click",
            function () {


                /* =========================================
                   CHECK FORM
                   ========================================= */

                if (!checkoutForm) {

                    alert(
                        "Checkout form was not found."
                    );

                    return;

                }


                /*
                   First use normal HTML validation.
                */

                if (
                    !checkoutForm.checkValidity()
                ) {

                    checkoutForm.reportValidity();

                    return;

                }


                /* =========================================
                   CHECK CART
                   ========================================= */

                if (cart.length === 0) {

                    alert(
                        "Your cart is empty. Please add products first."
                    );

                    return;

                }


                /* =========================================
                   CUSTOMER NAME
                   ========================================= */

                const customerNameInput =
                    document.getElementById(
                        "full-name"
                    );


                const customerName =
                    customerNameInput
                        ? customerNameInput.value.trim()
                        : "";


                if (
                    !isValidName(
                        customerName
                    )
                ) {

                    showValidationError(
                        "❌ Please enter your correct full name.",
                        customerNameInput
                    );

                    return;

                }


                /* =========================================
                   EMAIL
                   ========================================= */

                const customerEmailInput =
                    document.getElementById(
                        "order-email"
                    );


                const customerEmail =
                    customerEmailInput
                        ? customerEmailInput.value.trim()
                        : "";


                /* =========================================
                   PHONE
                   ========================================= */

                const customerPhoneInput =
                    document.getElementById(
                        "order-phone"
                    );


                const customerPhone =
                    customerPhoneInput
                        ? customerPhoneInput.value.trim()
                        : "";


                if (
                    !isValidPhone(
                        customerPhone
                    )
                ) {

                    showValidationError(
                        "❌ Please enter your correct Pakistani mobile number. Example: 03001234567",
                        customerPhoneInput
                    );

                    return;

                }


                /* =========================================
                   CUSTOMER TYPE
                   ========================================= */

                const customerTypeInput =
                    document.getElementById(
                        "customer-type"
                    );


                const customerType =
                    customerTypeInput
                        ? customerTypeInput.value
                        : "";


                /* =========================================
                   DELIVERY DATE
                   ========================================= */

                const deliveryDateInput =
                    document.getElementById(
                        "delivery-date"
                    );


                const deliveryDate =
                    deliveryDateInput
                        ? deliveryDateInput.value
                        : "";


                /* =========================================
                   ADDRESS
                   ========================================= */

                const addressInput =
                    document.getElementById(
                        "delivery-address"
                    );


                const address =
                    addressInput
                        ? addressInput.value.trim()
                        : "";


                if (
                    !isValidAddress(
                        address
                    )
                ) {

                    showValidationError(
                        "❌ Please enter your complete delivery address. Include house/plot number, street/area, and city.",
                        addressInput
                    );

                    return;

                }


                /* =========================================
                   CITY
                   ========================================= */

                const cityInput =
                    document.getElementById(
                        "city"
                    );


                const city =
                    cityInput
                        ? cityInput.value.trim()
                        : "";


                if (
                    !isValidCity(
                        city
                    )
                ) {

                    showValidationError(
                        "❌ Please enter your correct city name.",
                        cityInput
                    );

                    return;

                }


                /* =========================================
                   POSTAL CODE
                   ========================================= */

                const postalCodeInput =
                    document.getElementById(
                        "postal-code"
                    );


                const postalCode =
                    postalCodeInput
                        ? postalCodeInput.value.trim()
                        : "";


                /* =========================================
                   DELIVERY METHOD
                   ========================================= */

                const deliveryMethod =
                    document.querySelector(
                        'input[name="delivery-method"]:checked'
                    );


                const deliveryMethodValue =
                    deliveryMethod
                        ? deliveryMethod.value
                        : "Not selected";


                /* =========================================
                   ADDITIONAL SERVICES
                   ========================================= */

                const additionalServices =
                    document.querySelectorAll(
                        'input[name="additional-services"]:checked'
                    );


                const selectedServices = [];


                additionalServices.forEach(
                    function (service) {

                        selectedServices.push(
                            service.value
                        );

                    }
                );


                /* =========================================
                   SPECIAL INSTRUCTIONS
                   ========================================= */

                const specialInstructionsInput =
                    document.getElementById(
                        "special-instructions"
                    );


                const specialInstructions =
                    specialInstructionsInput
                        ? specialInstructionsInput.value.trim()
                        : "";


                /* =========================================
                   CALCULATIONS
                   ========================================= */

                const totalQuantity =
                    calculateTotalQuantity();


                const subtotal =
                    calculateSubtotal();


                const specialDiscount =
                    calculateSpecialOfferDiscount();


                const firstOrderDiscount =
                    calculateFirstOrderDiscount();


                const totalSavings =
                    calculateTotalSavings();


                const finalTotal =
                    calculateFinalTotal();


                /* =========================================
                   CONSOLE — CUSTOMER
                   ========================================= */

                console.log(
                    "=========================================="
                );


                console.log(
                    "PREMIUM SLAUGHTER HOUSE ORDER"
                );


                console.log(
                    "=========================================="
                );


                console.log(
                    "Customer Name:",
                    customerName
                );


                console.log(
                    "Email:",
                    customerEmail
                );


                console.log(
                    "Phone:",
                    customerPhone
                );


                console.log(
                    "Customer Type:",
                    customerType
                );


                /* =========================================
                   CONSOLE — PRODUCTS
                   ========================================= */

                console.log(
                    "========== ORDER ITEMS =========="
                );


                cart.forEach(
                    function (item) {

                        console.log(
                            "Product:",
                            item.name
                        );


                        console.log(
                            "Quantity:",
                            item.quantity,
                            "kg"
                        );


                        console.log(
                            "Price:",
                            item.price,
                            "PKR/kg"
                        );


                        console.log(
                            "Item Total:",
                            calculateItemTotal(
                                item.price,
                                item.quantity
                            ),
                            "PKR"
                        );


                        console.log(
                            "--------------------------------"
                        );

                    }
                );


                /* =========================================
                   CONSOLE — DELIVERY
                   ========================================= */

                console.log(
                    "========== DELIVERY =========="
                );


                console.log(
                    "Delivery Date:",
                    deliveryDate
                );


                console.log(
                    "Delivery Method:",
                    deliveryMethodValue
                );


                console.log(
                    "Complete Address:",
                    address
                );


                console.log(
                    "City:",
                    city
                );


                console.log(
                    "Postal Code:",
                    postalCode
                );


                console.log(
                    "Additional Services:",
                    selectedServices
                );


                /* =========================================
                   CONSOLE — SPECIAL INSTRUCTIONS
                   ========================================= */

                console.log(
                    "========== SPECIAL INSTRUCTIONS =========="
                );


                console.log(
                    "Special Instructions:",
                    specialInstructions
                );


                /* =========================================
                   CONSOLE — PRICE SUMMARY
                   ========================================= */

                console.log(
                    "========== PRICE SUMMARY =========="
                );


                console.log(
                    "Subtotal:",
                    subtotal,
                    "PKR"
                );


                console.log(
                    "Today's Special Offer Discount:",
                    specialDiscount,
                    "PKR"
                );


                console.log(
                    "First Order Discount (5%):",
                    firstOrderDiscount,
                    "PKR"
                );


                console.log(
                    "Total Savings:",
                    totalSavings,
                    "PKR"
                );


                console.log(
                    "Final Total:",
                    finalTotal,
                    "PKR"
                );


                console.log(
                    "Total Quantity:",
                    totalQuantity,
                    "kg"
                );


                console.log(
                    "=========================================="
                );


                /* =========================================
                   SUCCESS MESSAGE
                   ========================================= */

                if (orderMessage) {

                    orderMessage.innerHTML =

                        "<strong>Thank you, " +
                        customerName +
                        "!</strong><br><br>" +

                        "Your order request has been " +
                        "prepared successfully.<br><br>" +

                        "Total Quantity: " +
                        totalQuantity +
                        " kg<br>" +

                        "Subtotal: PKR " +
                        formatMoney(
                            subtotal
                        ) +
                        "<br>" +

                        "Today's Special Offer: -PKR " +
                        formatMoney(
                            specialDiscount
                        ) +
                        "<br>" +

                        "First Order Discount (5%): -PKR " +
                        formatMoney(
                            firstOrderDiscount
                        ) +
                        "<br>" +

                        "Total Savings: PKR " +
                        formatMoney(
                            totalSavings
                        ) +
                        "<br><br>" +

                        "<strong>Final Total: PKR " +
                        formatMoney(
                            finalTotal
                        ) +
                        "</strong>";


                    orderMessage.style.backgroundColor =
                        "#e8f5e9";


                    orderMessage.style.color =
                        "#176b2c";


                    orderMessage.style.padding =
                        "15px";


                    orderMessage.style.borderRadius =
                        "8px";


                    orderMessage.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

            }
        );

    }


    /* =====================================================
       CLEAR CHECKOUT FORM
       ===================================================== */

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "reset",
            function () {

                setTimeout(
                    function () {

                        if (orderMessage) {

                            orderMessage.textContent =
                                "";


                            orderMessage.style.backgroundColor =
                                "";


                            orderMessage.style.color =
                                "";


                            orderMessage.style.padding =
                                "";


                            orderMessage.style.borderRadius =
                                "";

                        }


                        displayCheckoutSummary();

                        updateTotals();

                    },
                    0
                );

            }
        );

    }


    /* =====================================================
       START CART
       ===================================================== */

    loadCart();

    displayCart();

    updateTotals();


});