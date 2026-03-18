document.addEventListener('DOMContentLoaded', () => {

    /* ===========================
       ANIMATIONS
       =========================== */
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));


    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '1rem 0';
            navbar.style.background = 'rgba(12, 12, 12, 0.9)';
        } else {
            navbar.style.padding = '1.5rem 0';
            navbar.style.background = 'rgba(12, 12, 12, 0.7)';
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.menu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    /* ===========================
       CART LOGIC
       =========================== */

    // Check if we are on the store page
    if (document.querySelector('.store-container')) {

        // 1. Inject Cart HTML
        const cartHTML = `
            <div class="cart-trigger">
                <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                <div class="cart-count">0</div>
            </div>
            <div class="cart-overlay"></div>
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h2>YOUR STUFF</h2>
                    <button class="close-cart">&times;</button>
                </div>
                <div class="cart-items">
                    <!-- Items go here -->
                    <p style="text-align:center; opacity:0.5; margin-top:2rem;">Your cart is empty.</p>
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="total-price">$0.00</span>
                    </div>
                    <button class="checkout-btn">CHECKOUT</button>
                </div>
            </div>
        `;

        // Only inject if it doesn't exist (safety check)
        if (!document.querySelector('.cart-sidebar')) {
            document.body.insertAdjacentHTML('beforeend', cartHTML);
        }

        // 2. State & Functions
        let cart = JSON.parse(localStorage.getItem('skdl_cart')) || [];

        const cartTrigger = document.querySelector('.cart-trigger');
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        const closeCartBtn = document.querySelector('.close-cart');
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartCountEl = document.querySelector('.cart-count');
        const totalPriceEl = document.querySelector('.total-price');
        const checkoutBtn = document.querySelector('.checkout-btn');

        function toggleCart() {
            cartSidebar.classList.toggle('open');
            cartOverlay.classList.toggle('open');
        }

        function updateCartUI() {
            // Count
            const count = cart.reduce((acc, item) => acc + item.quantity, 0);
            cartCountEl.textContent = count;

            // Items
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:2rem;">Your cart is empty.</p>';
            } else {
                cart.forEach(item => {
                    const el = document.createElement('div');
                    el.classList.add('cart-item');
                    const isJohncoin = item.name.toLowerCase().includes('johnception');
                    const priceLabel = isJohncoin ? `${item.price} <span class="jc-symbol">J₵</span>` : `$${item.price}`;
                    el.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${priceLabel} x ${item.quantity}</p>
                        </div>
                        <button class="remove-item" data-id="${item.id}">Remove</button>
                    `;
                    cartItemsContainer.appendChild(el);
                });
            }

            // Total (Simplified mixing of currencies for now, just adds numbers)
            const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
            const hasJohncoin = cart.some(item => item.name.toLowerCase().includes('johnception'));
            const hasUSD = cart.some(item => !item.name.toLowerCase().includes('johnception'));

            if (hasJohncoin && !hasUSD) {
                totalPriceEl.innerHTML = total.toFixed(0) + ' <span class="jc-symbol">J₵</span>';
            } else if (hasJohncoin && hasUSD) {
                totalPriceEl.textContent = 'Mixed (See Items)';
            } else {
                totalPriceEl.textContent = '$' + total.toFixed(2);
            }

            // Save
            localStorage.setItem('skdl_cart', JSON.stringify(cart));

            // Re-bind remove buttons
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    removeFromCart(id);
                });
            });
        }

        function addToCart(product) {
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartUI();
            if (!cartSidebar.classList.contains('open')) {
                toggleCart(); // Show cart when adding
            }
        }

        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
        }

        function checkout() {
            if (cart.length === 0) return;
            alert('Thank you for your money! We will defineitely ship this.');
            cart = [];
            updateCartUI();
            toggleCart();
        }

        // 3. Event Listeners
        cartTrigger.addEventListener('click', toggleCart);
        closeCartBtn.addEventListener('click', toggleCart);
        cartOverlay.addEventListener('click', toggleCart);
        checkoutBtn.addEventListener('click', checkout);

        // Add to Cart Buttons (on Store Page)
        const addToCartBtns = document.querySelectorAll('.add-to-cart');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const product = {
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    price: btn.dataset.price
                };
                addToCart(product);
            });
        });

        // Initialize UI
        updateCartUI();
    }


    /* ===========================
       JOHN COIN CHART LOGIC
       =========================== */
    const chartContainer = document.getElementById('johnCoinChart');
    if (chartContainer) {
        const svg = document.getElementById('chartSvg');
        const chartPath = document.getElementById('chartPath');
        const chartArea = document.getElementById('chartArea');
        const tooltip = chartContainer.querySelector('.chart-tooltip');
        const crosshair = chartContainer.querySelector('.chart-crosshair');
        const timelineBtns = document.querySelectorAll('.chart-btn');

        let chartData = [];
        let currentRange = 'ALL';

        // 1. Lore-Accurate Data Generation
        function generateJohnCoinData() {
            const startDate = new Date('2008-03-01');
            const surgeDate = new Date('2021-01-01');
            const today = new Date();
            const data = [];

            let tempDate = new Date(startDate);
            let currentPrice = 1.0;

            while (tempDate <= today) {
                const isYesterday = new Date(tempDate).toDateString() === new Date(today.getTime() - 86400000).toDateString();
                const isToday = tempDate.toDateString() === today.toDateString();

                if (isToday) {
                    currentPrice = 0.005;
                } else if (isYesterday) {
                    currentPrice = 400000;
                } else {
                    const isPreSurge = tempDate < surgeDate;

                    // Volatility: Steeper ups and downs
                    const volatility = (Math.random() - 0.5) * 0.15;

                    if (isPreSurge) {
                        // Flatter, linear-ish growth with high noise
                        const baseGrowth = 1.0001;
                        currentPrice *= (baseGrowth + volatility);
                        if (currentPrice < 0.1) currentPrice = 0.1; // Floor
                    } else {
                        // Exponential surge starts around 2021
                        const daysSinceSurge = (tempDate - surgeDate) / (1000 * 60 * 60 * 24);
                        const exponentialFactor = 1.005 + (daysSinceSurge * 0.00001);
                        currentPrice *= (exponentialFactor + volatility);
                    }
                }

                data.push({
                    date: new Date(tempDate),
                    price: currentPrice
                });

                tempDate.setDate(tempDate.getDate() + 1);
            }

            // Add initial jitter for the last 60 minutes so '1D' timeline doesn't look completely empty
            let lastPrice = currentPrice;
            const pastHour = new Date(today.getTime() - (60 * 60 * 1000));

            for (let i = 0; i < 60; i++) {
                const minuteDate = new Date(pastHour.getTime() + (i * 60 * 1000));
                lastPrice += ((Math.random() - 0.5) * 0.001);

                if (lastPrice > 0.01) lastPrice = 0.01;
                if (lastPrice < 0.001) lastPrice = 0.001;

                data.push({
                    date: minuteDate,
                    price: lastPrice
                });
            }

            return data;
        }

        chartData = generateJohnCoinData();

        // Helper: Downsample data for rendering performance and visual clarity
        function downsampleData(data, maxPoints) {
            if (data.length <= maxPoints) return data;
            const step = Math.floor(data.length / maxPoints);
            const sampled = [];
            for (let i = 0; i < data.length; i += step) {
                sampled.push(data[i]);
            }
            // Ensure the very last point is always included for accuracy
            if (sampled[sampled.length - 1] !== data[data.length - 1]) {
                sampled.push(data[data.length - 1]);
            }
            return sampled;
        }

        // 2. Rendering Logic
        function renderChart(range) {
            const now = new Date();
            let filteredData = chartData;

            if (range === '1D') {
                const oneDayAgo = new Date(now).getTime() - (24 * 60 * 60 * 1000);
                filteredData = chartData.filter(d => d.date.getTime() >= oneDayAgo);
            } else if (range === '1M') {
                const oneMonthAgo = new Date(now).setMonth(now.getMonth() - 1);
                filteredData = chartData.filter(d => d.date >= oneMonthAgo);
            } else if (range === '1Y') {
                const oneYearAgo = new Date(now).setFullYear(now.getFullYear() - 1);
                filteredData = chartData.filter(d => d.date >= oneYearAgo);
            } else if (range === '5Y') {
                const fiveYearsAgo = new Date(now).setFullYear(now.getFullYear() - 5);
                filteredData = chartData.filter(d => d.date >= fiveYearsAgo);
            }

            // Downsample to max 200 points for performance and hover stability
            filteredData = downsampleData(filteredData, 200);

            const width = chartContainer.clientWidth;
            const height = chartContainer.clientHeight;

            // Padding for axes (bottom and right)
            const paddingBottom = 20;
            const paddingRight = 40;
            const chartWidth = width - paddingRight;
            const chartHeight = height - paddingBottom;

            const maxPrice = Math.max(...filteredData.map(d => d.price));

            // Map points to SVG coordinates within padded area
            const points = filteredData.map((d, i) => {
                const x = (i / (filteredData.length - 1)) * chartWidth;
                const y = chartHeight - ((Math.log10(d.price) - Math.log10(0.001)) / (Math.log10(maxPrice) - Math.log10(0.001)) * chartHeight);
                return { x, y, price: d.price, date: d.date };
            });

            // Build path string
            const dStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            chartPath.setAttribute('d', dStr);

            // Build area string
            const areaD = `${dStr} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
            chartArea.setAttribute('d', areaD);

            // Draw Axes
            drawAxes(width, height, chartWidth, chartHeight, filteredData, maxPrice, range);

            // Event Listeners for Hover
            chartContainer.onmousemove = (e) => {
                const rect = chartContainer.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;

                // Only trigger if within chart area
                if (mouseX > chartWidth) return;

                // Find nearest point
                const index = Math.min(
                    Math.max(0, Math.floor((mouseX / chartWidth) * (points.length - 1))),
                    points.length - 1
                );
                const p = points[index];

                crosshair.style.display = 'block';
                crosshair.style.left = `${p.x}px`;

                tooltip.style.display = 'block';
                if (range === '1D') {
                    tooltip.querySelector('.date').textContent = p.date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                } else {
                    tooltip.querySelector('.date').textContent = p.date.toLocaleDateString();
                }
                tooltip.querySelector('.price').textContent = `$${p.price.toLocaleString(undefined, { maximumFractionDigits: 3 })}`;

                const mktCap = p.price * 69;
                tooltip.querySelector('.mkt-cap').textContent = `$${mktCap.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

                const tooltipWidth = tooltip.clientWidth;
                let leftPos = p.x + 20;
                if (leftPos + tooltipWidth > chartWidth) leftPos = p.x - tooltipWidth - 20;
                tooltip.style.left = `${leftPos}px`;
                tooltip.style.top = `${p.y - 40}px`;
            };

            chartContainer.onmouseleave = () => {
                crosshair.style.display = 'none';
                tooltip.style.display = 'none';
            };
        }

        function drawAxes(totalW, totalH, w, h, data, maxPrice, range) {
            const xAxisGrp = document.getElementById('xAxis');
            const yAxisGrp = document.getElementById('yAxis');
            xAxisGrp.innerHTML = '';
            yAxisGrp.innerHTML = '';

            // X-Axis (Time) - 4 ticks
            const xTicks = 4;
            for (let i = 0; i <= xTicks; i++) {
                const x = (i / xTicks) * w;
                const dateIndex = Math.floor((i / xTicks) * (data.length - 1));
                const date = data[dateIndex].date;
                let dateStr = "";

                if (range === '1D') {
                    dateStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                } else if (range === '1M' || range === '1Y') {
                    dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                } else {
                    dateStr = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                }

                xAxisGrp.innerHTML += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="rgba(255,255,255,0.05)" />`;
                xAxisGrp.innerHTML += `<text x="${x}" y="${totalH - 5}" fill="rgba(255,255,255,0.5)" font-size="10px" text-anchor="middle">${dateStr}</text>`;
            }

            // Y-Axis (Price) - 4 ticks (logarithmic approximation for labels)
            const yTicks = [0.001, 1, 1000, maxPrice];
            yTicks.forEach(tickVal => {
                const y = h - ((Math.log10(tickVal) - Math.log10(0.001)) / (Math.log10(maxPrice) - Math.log10(0.001)) * h);
                let label = tickVal >= 1000 ? `${(tickVal / 1000).toFixed(0)}k` : tickVal;

                yAxisGrp.innerHTML += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="rgba(255,255,255,0.05)" />`;
                yAxisGrp.innerHTML += `<text x="${w + 5}" y="${y + 4}" fill="rgba(255,255,255,0.5)" font-size="10px" text-anchor="start">$${label}</text>`;
            });
        }

        // Initialize
        renderChart('ALL');

        // Resize handler
        window.addEventListener('resize', () => {
            const activeBtn = document.querySelector('.chart-btn.active');
            renderChart(activeBtn.dataset.range);
        });

        // Button clicks
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentRange = btn.dataset.range;
                renderChart(currentRange);
            });
        });

        // Initial Render
        window.addEventListener('resize', () => renderChart(currentRange));

        // 3. Real-time minimal updates (every 60s)
        setInterval(() => {
            const lastData = chartData[chartData.length - 1];
            // Random tiny jitter between -0.0005 and +0.0005
            let newPrice = lastData.price + ((Math.random() - 0.5) * 0.001);

            // Clamp between $0.001 and $0.01 max
            if (newPrice > 0.01) newPrice = 0.01;
            if (newPrice < 0.001) newPrice = 0.001;

            // Append the new minimal data point
            chartData.push({
                date: new Date(),
                price: newPrice
            });

            // Only update DOM if chart is actively showing
            renderChart(currentRange);

            // Update the big header value to reflect real-time struggle
            const marketValueMain = document.querySelector('.jc-value');
            if (marketValueMain && !isCrashing) { // Only update if not currently being hijacked by the crash
                marketValueMain.innerHTML = `${newPrice.toFixed(3)} <span class="jc-symbol">J₵</span>`;
            }
        }, 60000);
    }

    let isCrashing = false;


    /* ===========================
       VIOLENT CHAOTIC ALARM v3 (Lore-Accurate)
       =========================== */
    const crashBadge = document.querySelector('.jc-forex-badge');
    const sirenFiles = ['siren.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren_chaos.mp3', 'siren3.mp3'];
    let activeSirens = [];

    function startChaos() {
        if (isCrashing) return;
        isCrashing = true;

        // 1. SOUND CHAOS (9 Layers)
        for (let i = 0; i < 9; i++) {
            const siren = new Audio(sirenFiles[i % sirenFiles.length]);
            siren.loop = true;
            siren.volume = 1.0;
            // Extreme pitch variation for disharmony
            siren.playbackRate = 0.4 + (Math.random() * 1.2);
            siren.play().catch(() => { }); // Swallow error if not interacted
            activeSirens.push(siren);
        }

        // 2. VISUAL CHAOS (Red Overlay Only)
        document.documentElement.classList.add('crash-mode');
    }


    if (crashBadge) {
        crashBadge.addEventListener('mouseenter', startChaos);
        crashBadge.addEventListener('mouseleave', stopChaos);
    }

});

