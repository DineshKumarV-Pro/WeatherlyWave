/**
 * Fast, Modern Loader UI with Smooth Animations
 */

export class LoaderUI {
    constructor(domHelpers) {
        this.dom = domHelpers;
        this.loader = document.getElementById('loader-screen');
        this.progress = document.getElementById('loader-progress');
        this.message = document.getElementById('loader-message');
        this.location = document.getElementById('loader-location');
        this.toastContainer = document.getElementById('toast-container');
        this.startTime = null;
    }

    show(message = 'Loading...') {
        if (!this.loader) return;
        
        this.startTime = Date.now();
        this.loader.classList.remove('hidden');
        
        if (this.message) {
            this.message.textContent = message;
        }
        
        // Animate progress smoothly
        this.animateProgress(0, 30, 300);
    }

    animateProgress(from, to, duration) {
        if (!this.progress) return;
        
        const start = from;
        const end = to;
        const range = end - start;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = start + (range * progress);
            
            this.progress.style.width = `${value}%`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    updateProgress(percent) {
        if (!this.progress) return;
        
        // Smooth transition
        this.progress.style.transition = 'width 0.3s ease-out';
        this.progress.style.width = `${percent}%`;
    }

    updateLocation(location) {
        if (this.location) {
            this.location.textContent = location;
        }
    }

    hide() {
        if (!this.loader) return;
        
        // Ensure minimum display time for UX (300ms)
        const elapsed = Date.now() - (this.startTime || Date.now());
        const delay = Math.max(0, 300 - elapsed);
        
        setTimeout(() => {
            this.loader.style.opacity = '0';
            setTimeout(() => {
                this.loader.classList.add('hidden');
                this.loader.style.opacity = '1';
                this.progress.style.width = '0%';
            }, 400);
        }, delay);
    }

    showToast(message, type = 'info', duration = 3000) {
        if (!this.toastContainer) {
            this.createToastContainer();
        }

        const colors = {
            info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
            success: 'bg-green-500/20 border-green-500/30 text-green-300',
            warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
            error: 'bg-red-500/20 border-red-500/30 text-red-300'
        };

        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        const toast = document.createElement('div');
        toast.className = `${colors[type]} backdrop-blur-sm border px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-slideIn shadow-xl max-w-md`;
        toast.innerHTML = `
            <span>${icons[type]}</span>
            <span class="flex-1">${message}</span>
            <button class="opacity-50 hover:opacity-100" onclick="this.parentElement.remove()">✕</button>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('animate-slideOut');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(this.toastContainer);
    }

    showError(message) {
        this.showToast(message, 'error', 5000);
    }

    showSuccess(message) {
        this.showToast(message, 'success', 3000);
    }

    showWarning(message) {
        this.showToast(message, 'warning', 4000);
    }

    showInfo(message) {
        this.showToast(message, 'info', 3000);
    }
}