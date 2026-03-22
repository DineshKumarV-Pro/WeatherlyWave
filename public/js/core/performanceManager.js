/**
 * Performance Manager - Handles optimizations, lazy loading, and caching
 */

export class PerformanceManager {
    constructor(app) {
        this.app = app;
        this.observers = new Map();
        this.cache = new Map();
        this.metrics = {
            pageLoad: performance.now(),
            apiCalls: 0,
            renderTimes: [],
            memoryUsage: [],
            fps: []
        };
        this.fpsInterval = null;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupLazyLoading();
        this.monitorPerformance();
        this.optimizeAnimations();
        this.setupCacheCleanup();
        this.monitorMemory();
        this.monitorFPS();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.lazy) {
                        this.loadLazyContent(element);
                    }
                    element.classList.add('visible');
                    
                    // Trigger entrance animation
                    element.style.animation = 'fadeIn 0.5s ease forwards';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        this.observers.set('lazy', observer);
        
        // Observe all lazy elements
        document.querySelectorAll('[data-lazy]').forEach(el => observer.observe(el));
    }

    setupLazyLoading() {
        // Images and heavy components
        const lazyElements = document.querySelectorAll('.lazy-load');
        lazyElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.3s ease';
            
            // Add placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'skeleton absolute inset-0';
            el.style.position = 'relative';
            el.appendChild(placeholder);
        });
    }

    loadLazyContent(element) {
        const contentType = element.dataset.lazy;
        
        // Remove placeholder
        const placeholder = element.querySelector('.skeleton');
        if (placeholder) {
            placeholder.remove();
        }
        
        switch(contentType) {
            case 'chart':
                this.loadChart(element);
                break;
            case 'map':
                this.loadMap(element);
                break;
            case 'graph':
                this.loadGraph(element);
                break;
            case 'image':
                this.loadImage(element);
                break;
        }
        
        element.style.opacity = '1';
        element.classList.add('loaded');
    }

    loadChart(element) {
        // Dynamic import for chart library
        import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js')
            .then(() => {
                this.renderChart(element);
            })
            .catch(err => {
                console.warn('Failed to load Chart.js:', err);
            });
    }

    loadMap(element) {
        // Dynamic import for map library
        import('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
            .then(() => {
                // Check if CSS is already loaded
                if (!document.querySelector('link[href*="leaflet.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);
                }
                this.renderMap(element);
            })
            .catch(err => {
                console.warn('Failed to load Leaflet:', err);
            });
    }

    loadGraph(element) {
        // Load graph component
        this.renderGraph(element);
    }

    loadImage(element) {
        const img = element.querySelector('img');
        if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.onload = () => {
                img.classList.add('loaded');
            };
        }
    }

    renderChart(element) {
        // Chart rendering logic - will be implemented by specific components
        const event = new CustomEvent('chart-ready', { detail: { element } });
        document.dispatchEvent(event);
    }

    renderMap(element) {
        // Map rendering logic - will be implemented by specific components
        const event = new CustomEvent('map-ready', { detail: { element } });
        document.dispatchEvent(event);
    }

    renderGraph(element) {
        // Graph rendering logic - will be implemented by specific components
        const event = new CustomEvent('graph-ready', { detail: { element } });
        document.dispatchEvent(event);
    }

    monitorPerformance() {
        if ('performance' in window) {
            // Monitor long tasks
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry);
                        this.metrics.longTasks = this.metrics.longTasks || [];
                        this.metrics.longTasks.push({
                            duration: entry.duration,
                            timestamp: Date.now()
                        });
                        this.optimizeTask(entry);
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task observation not supported');
            }
            
            // Monitor layout shifts
            try {
                const layoutObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.value > 0.1) {
                            console.warn('Large layout shift:', entry);
                            this.metrics.layoutShifts = this.metrics.layoutShifts || [];
                            this.metrics.layoutShifts.push({
                                value: entry.value,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
                
                layoutObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('Layout shift observation not supported');
            }
            
            // Monitor largest contentful paint
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = lastEntry.startTime;
                    console.log('LCP:', lastEntry.startTime);
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observation not supported');
            }
            
            // Monitor first input delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                        console.log('FID:', this.metrics.fid);
                    });
                });
                
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observation not supported');
            }
        }
    }

    monitorMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage.push({
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
                
                // Keep only last 60 samples (1 minute at 1 sample per second)
                if (this.metrics.memoryUsage.length > 60) {
                    this.metrics.memoryUsage.shift();
                }
                
                // Warn if memory usage is high
                if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
                    console.warn('High memory usage detected');
                    this.optimizeMemory();
                }
            }, 1000);
        }
    }

    monitorFPS() {
        this.fpsInterval = setInterval(() => {
            const now = performance.now();
            const delta = now - this.lastFpsUpdate;
            const fps = Math.round((this.frameCount * 1000) / delta);
            
            this.metrics.fps.push({
                value: fps,
                timestamp: now
            });
            
            // Keep only last 60 samples
            if (this.metrics.fps.length > 60) {
                this.metrics.fps.shift();
            }
            
            // Warn if FPS is low
            if (fps < 30) {
                console.warn(`Low FPS detected: ${fps}`);
                this.reduceAnimations();
            }
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }, 1000);
        
        // Count frames
        const countFrame = () => {
            this.frameCount++;
            requestAnimationFrame(countFrame);
        };
        requestAnimationFrame(countFrame);
    }

    optimizeAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            document.documentElement.style.setProperty('--animations-enabled', '0');
        }
        
        // Use will-change for animated elements
        const animatedElements = document.querySelectorAll('.animate-pulse, .group-hover\\:animate-bounce, .transition-all');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });
        
        // Throttle scroll events
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    reduceAnimations() {
        document.documentElement.style.setProperty('--animation-scale', '0.5');
        document.documentElement.style.setProperty('--transition-speed', '0.1s');
    }

    handleScroll() {
        // Optimize scroll performance
        const scrollY = window.scrollY;
        
        // Update parallax elements
        document.querySelectorAll('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        // Lazy load images in viewport
        document.querySelectorAll('img[data-src]').forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }

    optimizeTask(task) {
        // Break down long tasks
        if (task.name === 'self') {
            // Split into smaller chunks
            setTimeout(() => {
                requestIdleCallback(() => {
                    this.processRemainingWork();
                });
            }, 0);
        }
    }

    processRemainingWork() {
        // Process any pending updates
        if (this.app?.state?.weatherData) {
            // Use requestAnimationFrame for visual updates
            requestAnimationFrame(() => {
                this.app.updateUI(); // Fixed: changed from reRenderUI to updateUI
            });
        }
    }

    optimizeMemory() {
        // Clear caches
        this.cache.clear();
        
        // Clear API caches
        if (this.app?.weatherEngine) {
            this.app.weatherEngine.clearCache();
        }
        
        // Clear search cache
        if (this.app?.searchManager) {
            this.app.searchManager.cache.clear();
        }
        
        // Force garbage collection if available (Chrome with flags)
        if (window.gc) {
            window.gc();
        }
    }

    setupCacheCleanup() {
        // Clean up cache every 5 minutes
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > 300000) { // 5 minutes
                    this.cache.delete(key);
                }
            }
        }, 300000);
    }

    measureRenderTime(component, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        this.metrics.renderTimes.push({
            component,
            time: end - start,
            timestamp: Date.now()
        });
        
        // Keep only last 100 render times
        if (this.metrics.renderTimes.length > 100) {
            this.metrics.renderTimes.shift();
        }
        
        if (end - start > 16) { // More than 1 frame (60fps)
            console.warn(`Slow render: ${component} took ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
    }

    getMetrics() {
        const avgFPS = this.metrics.fps.reduce((sum, f) => sum + f.value, 0) / this.metrics.fps.length || 0;
        const avgRenderTime = this.metrics.renderTimes.reduce((sum, r) => sum + r.time, 0) / this.metrics.renderTimes.length || 0;
        
        return {
            ...this.metrics,
            averageFPS: Math.round(avgFPS),
            averageRenderTime: Math.round(avgRenderTime * 100) / 100,
            memory: performance.memory ? {
                usedJSHeapSize: this.formatBytes(performance.memory.usedJSHeapSize),
                totalJSHeapSize: this.formatBytes(performance.memory.totalJSHeapSize),
                jsHeapSizeLimit: this.formatBytes(performance.memory.jsHeapSizeLimit),
                usagePercent: Math.round((performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100)
            } : null,
            timing: performance.timing ? {
                domLoad: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart
            } : null,
            navigation: performance.getEntriesByType('navigation')[0]
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    clearCache() {
        this.cache.clear();
        this.metrics.apiCalls = 0;
    }

    destroy() {
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
        }
        
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}