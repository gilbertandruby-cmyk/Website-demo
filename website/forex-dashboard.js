// ====================== PAGE NAVIGATION ======================
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(el => {
            el.classList.remove('active');
        });
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Get page name from data attribute
        const pageName = item.getAttribute('data-page');
        
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const pageElement = document.getElementById(`${pageName}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Close sidebar on mobile after clicking
        if (window.innerWidth < 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    });
});

// ====================== SIDEBAR TOGGLE ======================
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// ====================== THEME TOGGLE ======================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Update icon
    themeToggle.innerHTML = isDarkMode 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// ====================== CHART CONTROLS ======================
document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons in this chart
        this.parentElement.querySelectorAll('.chart-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Here you would load data for the selected time period
        console.log('Loading chart data for:', this.textContent);
    });
});

// ====================== NOTIFICATION BUTTON ======================
document.querySelector('.notification-btn').addEventListener('click', () => {
    alert('You have 3 new notifications!\n\n• EUR/USD reached target price\n• GBP/USD signal generated\n• System maintenance scheduled');
});

// ====================== ACTION BUTTONS (MODAL) ======================
const modal = document.getElementById('signalModal');
const closeBtn = document.querySelector('.close');

document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const pair = row.cells[0].textContent.trim().split('\n')[0];
        const type = row.cells[1].textContent.trim();
        const entry = row.cells[2].textContent.trim();
        const target = row.cells[3].textContent.trim();
        const stopLoss = row.cells[4].textContent.trim();
        
        // Populate modal with signal details
        modal.querySelector('.modal-body').innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">Signal Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Currency Pair</p>
                        <p style="font-weight: 600; font-size: 1.1rem;">${pair}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Signal Type</p>
                        <p style="font-weight: 600; font-size: 1.1rem;">${type}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Entry Price</p>
                        <p style="font-weight: 600; font-size: 1.1rem;">${entry}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Target</p>
                        <p style="font-weight: 600; font-size: 1.1rem; color: var(--success);">${target}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Stop Loss</p>
                        <p style="font-weight: 600; font-size: 1.1rem; color: var(--danger);">${stopLoss}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Risk/Reward</p>
                        <p style="font-weight: 600; font-size: 1.1rem;">1:2.5</p>
                    </div>
                </div>
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e0e0e0;">
                    <h4 style="margin-bottom: 0.5rem;">Analysis</h4>
                    <p style="color: var(--text-light); font-size: 0.9rem;">This signal is based on multiple technical indicators including moving averages, RSI, and MACD confirmation. The trend is strong with good risk-to-reward ratio.</p>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// ====================== RESPONSIVE HANDLING ======================
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});

// ====================== SEARCH FUNCTIONALITY ======================
const searchBox = document.querySelector('.search-box input');
if (searchBox) {
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('.signals-table tbody tr');
        
        tableRows.forEach(row => {
            const pairName = row.cells[0].textContent.toLowerCase();
            if (pairName.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// ====================== INITIALIZATION ======================
console.log('Forex Dashboard loaded successfully!');
console.log('Features:');
console.log('- Real-time signal monitoring');
console.log('- Dark/Light theme toggle');
console.log('- Responsive design');
console.log('- Signal details modal');
console.log('- Search functionality');

// Simulate real-time updates (for demo purposes)
setInterval(() => {
    // Update stat values randomly (for demo)
    const activeSignals = document.querySelector('.stat-card:nth-child(1) h3');
    if (activeSignals && Math.random() > 0.8) {
        const currentValue = parseInt(activeSignals.textContent);
        activeSignals.textContent = (currentValue + Math.floor(Math.random() * 2)).toString();
    }
}, 5000);
