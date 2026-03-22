/**
 * Enhanced Weather Alerts UI Component with Interactive Notifications and Alert Management
 */

export class AlertsUI {
    constructor(domHelpers, utils) {
        this.dom = domHelpers;
        this.utils = utils;
        this.container = null;
        this.expandedAlert = null;
        this.alertSound = null;
        this.initAudio(); // <-- make sure this method exists
    }

    initAudio() {
        // Create audio context for alert sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    render(alerts) {
        const activeAlerts = alerts.filter(a => !a.acknowledged && new Date(a.expires) > new Date());
        if (activeAlerts.length === 0) {
            this.removeContainer();
            return;
        }

        this.createContainer();
        const severityOrder = { 'extreme': 0, 'severe': 1, 'moderate': 2, 'minor': 3 };
        const sortedAlerts = [...activeAlerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        let html = `
            <div class="flex items-center justify-between mb-3 sm:mb-4">
                <div class="flex items-center gap-2">
                    <span class="w-1 h-4 sm:h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></span>
                    <h3 class="font-semibold text-white text-sm sm:text-base md:text-lg">Weather Alerts</h3>
                    <span class="bg-red-500/20 text-red-400 px-1.5 py-0.5 sm:px-2 rounded-full text-[10px] sm:text-xs border border-red-500/30 animate-pulse">
                        ${activeAlerts.length} Active
                    </span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2">
                    <button class="text-[10px] sm:text-xs text-gray-400 hover:text-white transition px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg hover:bg-white/5" id="acknowledge-all">
                        Acknowledge All
                    </button>
                    <button class="text-[10px] sm:text-xs text-gray-400 hover:text-white transition px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg hover:bg-white/5" id="alert-settings">
                        ⚙️
                    </button>
                </div>
            </div>
        `;

        sortedAlerts.forEach(alert => {
            const isExpanded = this.expandedAlert === alert.id;
            html += this.renderAlert(alert, isExpanded);
        });

        if (sortedAlerts.length > 1) html += this.renderAlertSummary(sortedAlerts);

        this.container.innerHTML = html;
        this.attachEventListeners(sortedAlerts);
        this.playAlertSounds(sortedAlerts);
    }

    renderAlert(alert, isExpanded) {
        const severityColors = {
            'extreme': { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: '🚨', gradient: 'from-red-500 to-orange-500' },
            'severe': { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', icon: '⚠️', gradient: 'from-orange-500 to-yellow-500' },
            'moderate': { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: '📢', gradient: 'from-yellow-500 to-amber-500' },
            'minor': { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'ℹ️', gradient: 'from-blue-500 to-cyan-500' }
        };
        const colors = severityColors[alert.severity] || severityColors.minor;
        const timeAgo = this.getTimeAgo(alert.timestamp);
        const expiresIn = this.getTimeUntil(alert.expires);

        return `
            <div class="${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-3 sm:p-4 mb-2 sm:mb-3 relative overflow-hidden group animate-slide-down"
                 data-alert-id="${alert.id}" data-severity="${alert.severity}">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.gradient}"></div>
                <div class="flex items-start justify-between mb-1 sm:mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xl sm:text-2xl">${alert.icon || colors.icon}</span>
                        <div>
                            <h4 class="font-semibold ${colors.text} flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                ${alert.title}
                                <span class="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full uppercase">${alert.severity}</span>
                            </h4>
                            <p class="text-[10px] sm:text-xs text-gray-400">${timeAgo} • Expires ${expiresIn}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button class="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition toggle-details" data-alert-id="${alert.id}">
                            <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <button class="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition acknowledge-alert" data-alert-id="${alert.id}" title="Acknowledge">
                            <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-green-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="text-xs sm:text-sm text-gray-300 mb-2">${alert.description}</p>
                ${isExpanded ? this.renderAlertDetails(alert) : ''}
                <div class="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <button class="text-[10px] sm:text-xs ${colors.text} hover:underline flex items-center gap-1 view-details" data-alert-id="${alert.id}">
                        <span>View Details</span>
                        <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button class="text-[10px] sm:text-xs text-gray-400 hover:text-white transition flex items-center gap-1 share-alert" data-alert-id="${alert.id}">
                        <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                    </button>
                    <button class="text-[10px] sm:text-xs text-gray-400 hover:text-white transition flex items-center gap-1 ml-auto set-reminder" data-alert-id="${alert.id}">
                        <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Remind Me
                    </button>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/5">
                    <div class="h-full bg-gradient-to-r ${colors.gradient} expiry-progress" style="width: ${this.getExpiryProgress(alert.expires)}%"></div>
                </div>
            </div>
        `;
    }

    renderAlertDetails(alert) {
        return `
            <div class="mt-3 p-3 bg-black/20 rounded-lg text-sm space-y-2 animate-fade-in">
                <h5 class="font-medium text-white mb-2">Detailed Information</h5>
                
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span class="text-gray-500">Issued:</span>
                        <p class="text-white">${this.utils.dateFormatter.formatDateTime(new Date(alert.timestamp))}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Expires:</span>
                        <p class="text-white">${this.utils.dateFormatter.formatDateTime(new Date(alert.expires))}</p>
                    </div>
                </div>

                ${alert.details ? `
                    <div class="mt-2">
                        <span class="text-gray-500 text-xs">Additional Details:</span>
                        <ul class="mt-1 space-y-1">
                            ${Object.entries(alert.details).map(([key, value]) => `
                                <li class="text-xs flex items-start gap-2">
                                    <span class="text-gray-400">•</span>
                                    <span class="text-gray-300">${key}: ${value}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        ${alert.severity.toUpperCase()} Priority
                    </span>
                    <span>•</span>
                    <span>ID: ${alert.id.slice(0, 8)}</span>
                </div>
            </div>
        `;
    }

    renderAlertSummary(alerts) {
        const bySeverity = {
            extreme: alerts.filter(a => a.severity === 'extreme').length,
            severe: alerts.filter(a => a.severity === 'severe').length,
            moderate: alerts.filter(a => a.severity === 'moderate').length,
            minor: alerts.filter(a => a.severity === 'minor').length
        };

        return `
            <div class="mt-4 pt-3 border-t border-white/5">
                <div class="flex items-center justify-between text-xs text-gray-400">
                    <span>Alert Summary</span>
                    <span>${alerts.length} total</span>
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2">
                    ${bySeverity.extreme > 0 ? `
                        <div class="bg-red-500/10 rounded-lg p-2 text-center">
                            <span class="text-red-400 font-bold">${bySeverity.extreme}</span>
                            <p class="text-[10px] text-gray-400">Extreme</p>
                        </div>
                    ` : ''}
                    ${bySeverity.severe > 0 ? `
                        <div class="bg-orange-500/10 rounded-lg p-2 text-center">
                            <span class="text-orange-400 font-bold">${bySeverity.severe}</span>
                            <p class="text-[10px] text-gray-400">Severe</p>
                        </div>
                    ` : ''}
                    ${bySeverity.moderate > 0 ? `
                        <div class="bg-yellow-500/10 rounded-lg p-2 text-center">
                            <span class="text-yellow-400 font-bold">${bySeverity.moderate}</span>
                            <p class="text-[10px] text-gray-400">Moderate</p>
                        </div>
                    ` : ''}
                    ${bySeverity.minor > 0 ? `
                        <div class="bg-blue-500/10 rounded-lg p-2 text-center">
                            <span class="text-blue-400 font-bold">${bySeverity.minor}</span>
                            <p class="text-[10px] text-gray-400">Minor</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createContainer() {
        if (this.container) return;

        this.container = this.dom.createElement('div', [
            'glass-luxury',
            'p-4',
            'mb-8',
            'alerts-container',
            'relative',
            'overflow-hidden'
        ]);

        const heroGrid = document.getElementById('hero-grid');
        if (heroGrid) {
            heroGrid.parentNode.insertBefore(this.container, heroGrid);
        }
    }

    removeContainer() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const alertTime = new Date(timestamp);
        const diffMinutes = Math.floor((now - alertTime) / 60000);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
        return `${Math.floor(diffMinutes / 1440)} days ago`;
    }

    getTimeUntil(expires) {
        const now = new Date();
        const expiryTime = new Date(expires);
        const diffMinutes = Math.floor((expiryTime - now) / 60000);
        
        if (diffMinutes < 0) return 'Expired';
        if (diffMinutes < 60) return `${diffMinutes} min`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours`;
        return `${Math.floor(diffMinutes / 1440)} days`;
    }

    getExpiryProgress(expires) {
        const now = new Date();
        const expiryTime = new Date(expires);
        const alertTime = new Date(expiryTime);
        alertTime.setHours(alertTime.getHours() - 1); // Assume 1 hour duration
        
        const total = expiryTime - alertTime;
        const remaining = expiryTime - now;
        const progress = ((total - remaining) / total) * 100;
        
        return Math.min(100, Math.max(0, progress));
    }

    playAlertSounds(alerts) {
        if (!this.audioContext) return;
        
        const severeAlerts = alerts.filter(a => a.severity === 'extreme' || a.severity === 'severe');
        
        if (severeAlerts.length > 0 && window.weatherApp?.settingsManager?.get('notifications.sound')) {
            this.playAlertSound(severeAlerts[0].severity);
        }
    }

    playAlertSound(severity) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = severity === 'extreme' ? 'sawtooth' : 'sine';
            oscillator.frequency.setValueAtTime(
                severity === 'extreme' ? 880 : 440,
                this.audioContext.currentTime
            );

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Could not play alert sound:', e);
        }
    }

    attachEventListeners(alerts) {
        // Toggle details
        document.querySelectorAll('.toggle-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.dataset.alertId;
                this.expandedAlert = this.expandedAlert === alertId ? null : alertId;
                this.render(alerts);
            });
        });

        // Acknowledge single alert
        document.querySelectorAll('.acknowledge-alert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.dataset.alertId;
                document.dispatchEvent(new CustomEvent('acknowledge-alert', {
                    detail: { id: alertId }
                }));
                
                // Show success feedback
                this.showAcknowledgeFeedback(btn);
            });
        });

        // Acknowledge all
        const acknowledgeAll = document.getElementById('acknowledge-all');
        if (acknowledgeAll) {
            acknowledgeAll.addEventListener('click', () => {
                alerts.forEach(alert => {
                    document.dispatchEvent(new CustomEvent('acknowledge-alert', {
                        detail: { id: alert.id }
                    }));
                });
                window.weatherApp?.ui?.loader?.showSuccess('All alerts acknowledged');
            });
        }

        // View details
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.dataset.alertId;
                const alert = alerts.find(a => a.id === alertId);
                if (alert) {
                    this.showAlertModal(alert);
                }
            });
        });

        // Share alert
        document.querySelectorAll('.share-alert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.dataset.alertId;
                const alert = alerts.find(a => a.id === alertId);
                if (alert) {
                    this.shareAlert(alert);
                }
            });
        });

        // Set reminder
        document.querySelectorAll('.set-reminder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.dataset.alertId;
                this.showReminderModal(alertId);
            });
        });

        // Settings
        const settingsBtn = document.getElementById('alert-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showAlertSettings();
            });
        }
    }

    showAcknowledgeFeedback(btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '✓';
        btn.classList.add('text-green-400');
        
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('text-green-400');
        }, 1000);
    }

    showAlertModal(alert) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in';
        modal.innerHTML = `
            <div class="glass-luxury p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold flex items-center gap-2">
                        <span class="text-2xl">${alert.icon || '⚠️'}</span>
                        ${alert.title}
                    </h3>
                    <button class="p-2 hover:bg-white/10 rounded-lg transition close-modal">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="bg-white/5 p-4 rounded-lg">
                        <p class="text-gray-300">${alert.description}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-white/5 p-3 rounded-lg">
                            <span class="text-xs text-gray-500">Severity</span>
                            <p class="font-medium capitalize">${alert.severity}</p>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <span class="text-xs text-gray-500">Issued</span>
                            <p class="font-medium">${this.utils.dateFormatter.formatDateTime(new Date(alert.timestamp))}</p>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <span class="text-xs text-gray-500">Expires</span>
                            <p class="font-medium">${this.utils.dateFormatter.formatDateTime(new Date(alert.expires))}</p>
                        </div>
                        <div class="bg-white/5 p-3 rounded-lg">
                            <span class="text-xs text-gray-500">Status</span>
                            <p class="font-medium ${alert.acknowledged ? 'text-green-400' : 'text-yellow-400'}">
                                ${alert.acknowledged ? 'Acknowledged' : 'Active'}
                            </p>
                        </div>
                    </div>

                    ${alert.details ? `
                        <div class="bg-white/5 p-4 rounded-lg">
                            <h4 class="font-medium mb-2">Additional Details</h4>
                            <div class="space-y-2">
                                ${Object.entries(alert.details).map(([key, value]) => `
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-400">${key}:</span>
                                        <span class="text-white">${value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="flex justify-end gap-2 mt-4">
                        <button class="px-4 py-2 bg-blue-500/20 text-white rounded-lg hover:bg-blue-500/30 transition acknowledge-btn">
                            Acknowledge
                        </button>
                        <button class="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition close-modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        const acknowledgeBtn = modal.querySelector('.acknowledge-btn');
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('acknowledge-alert', {
                    detail: { id: alert.id }
                }));
                modal.remove();
                window.weatherApp?.ui?.loader?.showSuccess('Alert acknowledged');
            });
        }
    }

    shareAlert(alert) {
        const text = `Weather Alert: ${alert.title}\n\n${alert.description}\n\nSeverity: ${alert.severity}\nExpires: ${this.utils.dateFormatter.formatDateTime(new Date(alert.expires))}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Weather Alert: ${alert.title}`,
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text);
            window.weatherApp?.ui?.loader?.showSuccess('Alert copied to clipboard');
        }
    }

    showReminderModal(alertId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass-luxury p-6 max-w-md w-full">
                <h3 class="text-xl font-semibold mb-4">Set Reminder</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-400 text-sm mb-2">Remind me in:</label>
                        <select class="w-full bg-white/5 text-white px-4 py-2 rounded-xl border border-white/10" id="reminder-time">
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="360">6 hours</option>
                            <option value="720">12 hours</option>
                            <option value="1440">24 hours</option>
                        </select>
                    </div>

                    <div>
                        <label class="flex items-center gap-2 text-gray-400 text-sm">
                            <input type="checkbox" class="rounded bg-gray-700 border-gray-600" id="repeat-reminder">
                            Repeat every selected interval
                        </label>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button class="px-4 py-2 bg-blue-500/20 text-white rounded-lg hover:bg-blue-500/30 transition" id="set-reminder-btn">
                            Set Reminder
                        </button>
                        <button class="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition close-modal">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        const setBtn = document.getElementById('set-reminder-btn');
        if (setBtn) {
            setBtn.addEventListener('click', () => {
                const minutes = document.getElementById('reminder-time').value;
                const repeat = document.getElementById('repeat-reminder').checked;
                
                // Store reminder in localStorage
                const reminders = JSON.parse(localStorage.getItem('weatherpro_reminders') || '[]');
                reminders.push({
                    alertId,
                    time: minutes,
                    repeat,
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('weatherpro_reminders', JSON.stringify(reminders));

                window.weatherApp?.ui?.loader?.showSuccess(`Reminder set for ${minutes} minutes`);
                modal.remove();
            });
        }
    }

    showAlertSettings() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass-luxury p-6 max-w-md w-full">
                <h3 class="text-xl font-semibold mb-4">Alert Settings</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="flex items-center justify-between text-gray-400 text-sm">
                            <span>Enable Sound Alerts</span>
                            <input type="checkbox" class="rounded bg-gray-700 border-gray-600" 
                                   ${window.weatherApp?.settingsManager?.get('notifications.sound') ? 'checked' : ''}
                                   id="sound-alerts">
                        </label>
                    </div>

                    <div>
                        <label class="flex items-center justify-between text-gray-400 text-sm">
                            <span>Desktop Notifications</span>
                            <input type="checkbox" class="rounded bg-gray-700 border-gray-600" 
                                   ${window.weatherApp?.settingsManager?.get('notifications.desktop') ? 'checked' : ''}
                                   id="desktop-alerts">
                        </label>
                    </div>

                    <div class="pt-3 border-t border-white/5">
                        <h4 class="font-medium text-sm mb-2">Alert Severity Levels</h4>
                        
                        <div class="space-y-2">
                            <label class="flex items-center justify-between text-gray-400 text-sm">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                                    Extreme
                                </span>
                                <input type="checkbox" class="rounded bg-gray-700 border-gray-600" 
                                       ${window.weatherApp?.settingsManager?.get('notifications.alerts.extreme') ? 'checked' : ''}
                                       id="alert-extreme">
                            </label>
                            
                            <label class="flex items-center justify-between text-gray-400 text-sm">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Severe
                                </span>
                                <input type="checkbox" class="rounded bg-gray-700 border-gray-600" 
                                       ${window.weatherApp?.settingsManager?.get('notifications.alerts.severe') ? 'checked' : ''}
                                       id="alert-severe">
                            </label>
                            
                            <label class="flex items-center justify-between text-gray-400 text-sm">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Moderate
                                </span>
                                <input type="checkbox" class="rounded bg-gray-700 border-gray-600" 
                                       ${window.weatherApp?.settingsManager?.get('notifications.alerts.moderate') ? 'checked' : ''}
                                       id="alert-moderate">
                            </label>
                            
                            <label class="flex items-center justify-between text-gray-400 text-sm">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Minor
                                </span>
                                <input type="checkbox" class="rounded bg-gray-700 border-gray-600" 
                                       ${window.weatherApp?.settingsManager?.get('notifications.alerts.minor') ? 'checked' : ''}
                                       id="alert-minor">
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button class="px-4 py-2 bg-blue-500/20 text-white rounded-lg hover:bg-blue-500/30 transition" id="save-settings">
                            Save Settings
                        </button>
                        <button class="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition close-modal">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const settings = window.weatherApp?.settingsManager;
                if (settings) {
                    settings.set('notifications.sound', document.getElementById('sound-alerts').checked);
                    settings.set('notifications.desktop', document.getElementById('desktop-alerts').checked);
                    settings.set('notifications.alerts.extreme', document.getElementById('alert-extreme').checked);
                    settings.set('notifications.alerts.severe', document.getElementById('alert-severe').checked);
                    settings.set('notifications.alerts.moderate', document.getElementById('alert-moderate').checked);
                    settings.set('notifications.alerts.minor', document.getElementById('alert-minor').checked);
                    
                    window.weatherApp?.ui?.loader?.showSuccess('Alert settings saved');
                    modal.remove();
                }
            });
        }
    }
}