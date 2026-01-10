// Behavioral monitoring module for ZTNA research
class BehaviorMonitor {
    constructor() {
        this.keystrokeData = [];
        this.mouseData = [];
        this.scrollData = [];
        this.lastMouseMove = null;
        this.lastScroll = null;
        this.batchSize = 20; // Number of events to batch before sending
        this.batchInterval = 10000; // Maximum time between batches (10 seconds)
        this.isMonitoring = false;
        this.batchTimer = null;
        
        // Initialize event listeners
        this.initEventListeners();
    }

    // Initialize all event listeners
    initEventListeners() {
        // Keystroke events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Mouse events
        document.addEventListener('mousemove', this.throttle(this.handleMouseMove.bind(this), 100));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Scroll events
        document.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 200));
        
        // Window events
        window.addEventListener('beforeunload', this.sendBatch.bind(this));
        
        // Start monitoring
        this.startMonitoring();
    }

    // Throttle function to limit event frequency
    throttle(fn, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                fn.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Start monitoring
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('Behavioral monitoring started');
        
        // Start batch timer
        this.resetBatchTimer();
    }

    // Stop monitoring
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        console.log('Behavioral monitoring stopped');
        
        // Clear any pending batch timer
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
    }

    // Reset the batch timer
    resetBatchTimer() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        
        this.batchTimer = setTimeout(() => {
            this.sendBatch();
        }, this.batchInterval);
    }

    // Handle key down event
    handleKeyDown(event) {
        if (!this.isMonitoring) return;
        
        const keyData = {
            type: 'keydown',
            key: event.key,
            code: event.code,
            timestamp: Date.now(),
            target: this.getTargetInfo(event.target),
            meta: {
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                repeat: event.repeat
            }
        };
        
        this.keystrokeData.push(keyData);
        this.checkBatchSize();
    }

    // Handle key up event
    handleKeyUp(event) {
        if (!this.isMonitoring) return;
        
        const keyData = {
            type: 'keyup',
            key: event.key,
            code: event.code,
            timestamp: Date.now(),
            target: this.getTargetInfo(event.target),
            meta: {
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey
            }
        };
        
        this.keystrokeData.push(keyData);
        this.checkBatchSize();
    }

    // Handle mouse move event
    handleMouseMove(event) {
        if (!this.isMonitoring) return;
        
        const now = Date.now();
        const timeSinceLastMove = this.lastMouseMove ? now - this.lastMouseMove : 0;
        
        const mouseData = {
            type: 'mousemove',
            x: event.clientX,
            y: event.clientY,
            timestamp: now,
            timeSinceLastMove,
            target: this.getTargetInfo(event.target),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        this.mouseData.push(mouseData);
        this.lastMouseMove = now;
        this.checkBatchSize();
    }

    // Handle mouse down event
    handleMouseDown(event) {
        if (!this.isMonitoring) return;
        
        const mouseData = {
            type: 'mousedown',
            button: event.button,
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            target: this.getTargetInfo(event.target)
        };
        
        this.mouseData.push(mouseData);
        this.checkBatchSize();
    }

    // Handle mouse up event
    handleMouseUp(event) {
        if (!this.isMonitoring) return;
        
        const mouseData = {
            type: 'mouseup',
            button: event.button,
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            target: this.getTargetInfo(event.target)
        };
        
        this.mouseData.push(mouseData);
        this.checkBatchSize();
    }

    // Handle click event
    handleClick(event) {
        if (!this.isMonitoring) return;
        
        const clickData = {
            type: 'click',
            button: event.button,
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            target: this.getTargetInfo(event.target)
        };
        
        this.mouseData.push(clickData);
        this.checkBatchSize();
    }

    // Handle scroll event
    handleScroll() {
        if (!this.isMonitoring) return;
        
        const now = Date.now();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        
        const scrollData = {
            type: 'scroll',
            x: scrollX,
            y: scrollY,
            timestamp: now,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                documentWidth: document.documentElement.scrollWidth,
                documentHeight: document.documentElement.scrollHeight
            },
            timeSinceLastScroll: this.lastScroll ? now - this.lastScroll : 0
        };
        
        this.scrollData.push(scrollData);
        this.lastScroll = now;
        this.checkBatchSize();
    }

    // Get target element information
    getTargetInfo(element) {
        if (!element) return null;
        
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            name: element.name,
            type: element.type,
            value: element.value,
            text: element.textContent ? element.textContent.substring(0, 100) : null
        };
    }

    // Check if batch size has been reached
    checkBatchSize() {
        const totalEvents = this.keystrokeData.length + this.mouseData.length + this.scrollData.length;
        
        if (totalEvents >= this.batchSize) {
            this.sendBatch();
        } else {
            this.resetBatchTimer();
        }
    }

    // Send batch data to Supabase
    async sendBatch() {
        if (!this.isMonitoring) return;
        
        // Clear any pending batch timer
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        // Check if there's any data to send
        const hasData = this.keystrokeData.length > 0 || 
                       this.mouseData.length > 0 || 
                       this.scrollData.length > 0;
        
        if (!hasData) {
            this.resetBatchTimer();
            return;
        }
        
        // Prepare batch data
        const batchData = {
            keystroke_events: [...this.keystrokeData],
            mouse_events: [...this.mouseData],
            scroll_events: [...this.scrollData],
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            url: window.location.href,
            referrer: document.referrer
        };
        
        try {
            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || 'anonymous';
            
            // Insert data into Supabase
            const { error } = await supabase
                .from('behavior_logs')
                .insert([{
                    user_id: userId,
                    timestamp: new Date().toISOString(),
                    keystroke_data: batchData.keystroke_events,
                    mouse_data: batchData.mouse_events,
                    scroll_data: batchData.scroll_events,
                    metadata: {
                        user_agent: batchData.user_agent,
                        screen_resolution: batchData.screen_resolution,
                        viewport_size: batchData.viewport_size,
                        url: batchData.url,
                        referrer: batchData.referrer
                    }
                }]);
            
            if (error) throw error;
            
            console.log(`Batch sent: ${batchData.keystroke_events.length} keystrokes, ${batchData.mouse_events.length} mouse events, ${batchData.scroll_events.length} scroll events`);
            
            // Clear sent data
            this.keystrokeData = [];
            this.mouseData = [];
            this.scrollData = [];
            
        } catch (error) {
            console.error('Error sending behavioral data:', error);
            // Optionally implement retry logic here
        } finally {
            // Reset the batch timer
            this.resetBatchTimer();
        }
    }
}

// Initialize behavior monitoring when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard page
    if (window.location.pathname.endsWith('dashboard.html')) {
        // Check if user is authenticated
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // Initialize behavior monitoring
                window.behaviorMonitor = new BehaviorMonitor();
                
                // Handle page visibility changes
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        window.behaviorMonitor?.startMonitoring();
                    } else {
                        // Send any remaining data before the page becomes hidden
                        window.behaviorMonitor?.sendBatch();
                    }
                });
                
                // Handle logout
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async () => {
                        // Send any remaining data before logging out
                        await window.behaviorMonitor?.sendBatch();
                        window.behaviorMonitor?.stopMonitoring();
                    });
                }
            }
        });
    }
});
