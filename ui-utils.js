/**
 * UI Utilities
 * Shared UI components and helpers
 */

const UIUtils = {
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', or 'info'
     * @param {number} duration - Duration in ms (default 3000)
     */
    showToast(message, type = 'info', duration = 3000) {
        // Create container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Style based on type
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#2196F3',
            pending: '#FF9800'
        };

        toast.style.cssText = `
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateY(20px);
            pointer-events: auto;
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }

        return toast;
    },
    /**
     * Show a confirmation modal
     * @param {string} message - Message to display
     * @param {string} title - Modal title
     * @param {string} confirmText - Text for confirm button
     * @param {string} cancelText - Text for cancel button
     * @param {string} type - 'danger' or 'primary'
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
     */
    showConfirm(message, title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel', type = 'primary') {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                background: white;
                padding: 25px;
                border-radius: 8px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateY(20px);
                transition: transform 0.2s ease;
            `;

            // Title
            const h3 = document.createElement('h3');
            h3.textContent = title;
            h3.style.cssText = 'margin: 0 0 15px 0; color: #333; font-size: 18px;';

            // Message
            const p = document.createElement('p');
            p.textContent = message;
            p.style.cssText = 'margin: 0 0 25px 0; color: #666; line-height: 1.5;';

            // Buttons
            const btnGroup = document.createElement('div');
            btnGroup.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px;';

            const btnCancel = document.createElement('button');
            btnCancel.textContent = cancelText;
            btnCancel.className = 'btn';
            btnCancel.style.cssText = `
                padding: 8px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                color: #555;
            `;

            const btnConfirm = document.createElement('button');
            btnConfirm.textContent = confirmText;
            btnConfirm.className = `btn btn-${type}`;
            btnConfirm.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                color: white;
                background: ${type === 'danger' ? '#d32f2f' : '#1565C0'};
            `;

            // Event handlers
            const close = (result) => {
                overlay.style.opacity = '0';
                modal.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 200);
                resolve(result);
            };

            btnCancel.onclick = () => close(false);
            btnConfirm.onclick = () => close(true);
            overlay.onclick = (e) => {
                if (e.target === overlay) close(false);
            };

            // Assemble
            btnGroup.appendChild(btnCancel);
            btnGroup.appendChild(btnConfirm);
            modal.appendChild(h3);
            modal.appendChild(p);
            modal.appendChild(btnGroup);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Animate in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                modal.style.transform = 'translateY(0)';
            });
        });
    }
};

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
}
