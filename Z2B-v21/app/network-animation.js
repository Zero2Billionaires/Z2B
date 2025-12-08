// Generate animated network background
const networkBg = document.getElementById('networkBg');

if (networkBg) {
    // Create floating particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        networkBg.appendChild(particle);
    }

    // Create network nodes
    for (let i = 0; i < 50; i++) {
        const node = document.createElement('div');
        node.className = 'network-node';
        node.style.left = Math.random() * 100 + '%';
        node.style.top = Math.random() * 100 + '%';
        node.style.animationDelay = Math.random() * 3 + 's';
        networkBg.appendChild(node);
    }
}
