function scrollTo(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function showCode() {
    document.getElementById('codeModal').style.display = 'flex';
}

function closeCode() {
    document.getElementById('codeModal').style.display = 'none';
}

function copyCode() {
    const code = document.querySelector('.modal-content pre code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    });
}

function toggleFaq(element) {
    element.parentElement.classList.toggle('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('codeModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
