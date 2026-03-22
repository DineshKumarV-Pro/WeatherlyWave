/**
 * Advanced DOM Helper Utilities with Animation and Performance Optimizations
 */

export const DomHelpers = {
    // Element creation
    createElement(tag, classes = [], attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        if (classes.length) {
            element.classList.add(...classes);
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key === 'text') {
                element.textContent = value;
            } else if (key === 'html') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    createFragment(elements = []) {
        const fragment = document.createDocumentFragment();
        elements.forEach(el => {
            if (el instanceof Node) {
                fragment.appendChild(el);
            }
        });
        return fragment;
    },

    // Query selectors
    query(selector, parent = document) {
        return parent.querySelector(selector);
    },
    
    queryAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },
    
    getElementById(id) {
        return document.getElementById(id);
    },

    // Event handling
    on(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.addEventListener(event, handler, options);
            return () => this.off(element, event, handler);
        }
        return () => {};
    },
    
    off(element, event, handler) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    },
    
    once(element, event, handler, options = {}) {
        return this.on(element, event, handler, { ...options, once: true });
    },
    
    delegate(parent, selector, event, handler, options = {}) {
        if (typeof parent === 'string') {
            parent = this.query(parent);
        }
        if (parent) {
            const delegatedHandler = (e) => {
                const target = e.target.closest(selector);
                if (target) {
                    handler.call(target, e, target);
                }
            };
            parent.addEventListener(event, delegatedHandler, options);
            return () => parent.removeEventListener(event, delegatedHandler);
        }
        return () => {};
    },

    emit(element, event, detail = {}) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const customEvent = new CustomEvent(event, { detail, bubbles: true });
            element.dispatchEvent(customEvent);
        }
    },

    // Class manipulation
    addClass(element, className) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            if (Array.isArray(className)) {
                element.classList.add(...className);
            } else {
                element.classList.add(className);
            }
        }
    },
    
    removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            if (Array.isArray(className)) {
                element.classList.remove(...className);
            } else {
                element.classList.remove(className);
            }
        }
    },
    
    toggleClass(element, className, force) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            if (force !== undefined) {
                element.classList.toggle(className, force);
            } else {
                element.classList.toggle(className);
            }
        }
    },
    
    hasClass(element, className) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        return element?.classList.contains(className) || false;
    },

    // Attribute manipulation
    setAttribute(element, name, value) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.setAttribute(name, value);
        }
    },
    
    getAttribute(element, name) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        return element?.getAttribute(name);
    },
    
    removeAttribute(element, name) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.removeAttribute(name);
        }
    },
    
    setAttributes(element, attributes) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
    },

    // Data attributes
    setData(element, key, value) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.dataset[key] = value;
        }
    },
    
    getData(element, key) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        return element?.dataset[key];
    },
    
    removeData(element, key) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            delete element.dataset[key];
        }
    },

    // Style manipulation
    setStyle(element, property, value) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style[property] = value;
        }
    },
    
    getStyle(element, property) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        return element?.style[property];
    },
    
    setStyles(element, styles) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            Object.assign(element.style, styles);
        }
    },
    
    getComputedStyle(element, property) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const styles = window.getComputedStyle(element);
            return property ? styles[property] : styles;
        }
        return null;
    },

    // Visibility
    show(element, display = 'block') {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style.display = display;
        }
    },
    
    hide(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    },
    
    toggle(element, force) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            if (force !== undefined) {
                element.style.display = force ? 'block' : 'none';
            } else {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        }
    },
    
    isVisible(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }
        return false;
    },

    // DOM manipulation
    append(parent, ...children) {
        if (typeof parent === 'string') {
            parent = this.query(parent);
        }
        if (parent) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    parent.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    parent.appendChild(child);
                }
            });
        }
    },
    
    prepend(parent, ...children) {
        if (typeof parent === 'string') {
            parent = this.query(parent);
        }
        if (parent) {
            children.reverse().forEach(child => {
                if (typeof child === 'string') {
                    parent.prepend(document.createTextNode(child));
                } else if (child instanceof Node) {
                    parent.prepend(child);
                }
            });
        }
    },
    
    before(reference, ...children) {
        if (typeof reference === 'string') {
            reference = this.query(reference);
        }
        if (reference?.parentNode) {
            children.reverse().forEach(child => {
                if (typeof child === 'string') {
                    reference.parentNode.insertBefore(document.createTextNode(child), reference);
                } else if (child instanceof Node) {
                    reference.parentNode.insertBefore(child, reference);
                }
            });
        }
    },
    
    after(reference, ...children) {
        if (typeof reference === 'string') {
            reference = this.query(reference);
        }
        if (reference?.parentNode) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    reference.parentNode.insertBefore(document.createTextNode(child), reference.nextSibling);
                } else if (child instanceof Node) {
                    reference.parentNode.insertBefore(child, reference.nextSibling);
                }
            });
        }
    },
    
    remove(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element?.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    
    replace(oldElement, newElement) {
        if (typeof oldElement === 'string') {
            oldElement = this.query(oldElement);
        }
        if (oldElement?.parentNode) {
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }
    },
    
    empty(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    },

    // Dimensions and position
    getDimensions(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const rect = element.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                x: rect.x,
                y: rect.y
            };
        }
        return null;
    },
    
    getOffset(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX
            };
        }
        return null;
    },
    
    getScrollPosition() {
        return {
            top: window.scrollY,
            left: window.scrollX
        };
    },
    
    scrollTo(options) {
        if (typeof options === 'number') {
            window.scrollTo(0, options);
        } else {
            window.scrollTo(options);
        }
    },
    
    scrollToElement(element, options = {}) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start', ...options });
        }
    },

    // Animation helpers
    animate(element, keyframes, options = {}) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            return element.animate(keyframes, options);
        }
        return null;
    },
    
    fadeIn(element, duration = 300, callback) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms ease`;
            
            setTimeout(() => {
                element.style.opacity = '1';
                setTimeout(() => {
                    element.style.transition = '';
                    if (callback) callback();
                }, duration);
            }, 10);
        }
    },
    
    fadeOut(element, duration = 300, callback) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease`;
            
            setTimeout(() => {
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.transition = '';
                    if (callback) callback();
                }, duration);
            }, 10);
        }
    },
    
    slideDown(element, duration = 300, callback) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const height = element.scrollHeight;
            element.style.overflow = 'hidden';
            element.style.height = '0';
            element.style.transition = `height ${duration}ms ease`;
            element.style.display = 'block';
            
            setTimeout(() => {
                element.style.height = `${height}px`;
                setTimeout(() => {
                    element.style.overflow = '';
                    element.style.height = '';
                    element.style.transition = '';
                    if (callback) callback();
                }, duration);
            }, 10);
        }
    },
    
    slideUp(element, duration = 300, callback) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            const height = element.scrollHeight;
            element.style.overflow = 'hidden';
            element.style.height = `${height}px`;
            element.style.transition = `height ${duration}ms ease`;
            
            setTimeout(() => {
                element.style.height = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.overflow = '';
                    element.style.height = '';
                    element.style.transition = '';
                    if (callback) callback();
                }, duration);
            }, 10);
        }
    },

    // Form helpers
    getFormData(form) {
        if (typeof form === 'string') {
            form = this.query(form);
        }
        if (form) {
            return new FormData(form);
        }
        return null;
    },
    
    serializeForm(form) {
        const formData = this.getFormData(form);
        if (!formData) return {};
        
        const data = {};
        formData.forEach((value, key) => {
            if (data[key] !== undefined) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });
        return data;
    },
    
    setFormData(form, data) {
        if (typeof form === 'string') {
            form = this.query(form);
        }
        if (!form) return;
        
        Object.entries(data).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value === true || value === 'on';
                } else if (input.type === 'radio') {
                    const radio = form.querySelector(`[name="${name}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value;
                }
            }
        });
    },

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    loadScript(src, async = true) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = async;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    },
    
    copyToClipboard(text) {
        return navigator.clipboard.writeText(text);
    },
    
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start}ms`);
        return result;
    },
    
    createObserver(type, callback, options = {}) {
        let observer;
        
        switch(type) {
            case 'intersection':
                observer = new IntersectionObserver(callback, options);
                break;
            case 'mutation':
                observer = new MutationObserver(callback);
                break;
            case 'resize':
                observer = new ResizeObserver(callback);
                break;
            case 'performance':
                observer = new PerformanceObserver(callback);
                break;
            default:
                return null;
        }
        
        return observer;
    }
};