document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const container = document.querySelector('.container');
    const macbook = document.querySelector('.macbook');
    const desktop = document.querySelector('.desktop-container');
    const timeElement = document.getElementById('time');
    const dockItems = document.querySelectorAll('.dock-item');
    const windows = document.querySelectorAll('.window');
    const bootScreen = document.getElementById('boot-screen'); // NEW

    // Shutdown elements
    const appleIcon = document.querySelector('.apple-menu');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const shutdownBtn = document.getElementById('shutdown-btn');
    const shutdownOverlay = document.getElementById('shutdown-overlay');
    const cancelShutdownBtn = document.getElementById('cancel-shutdown');
    const confirmShutdownBtn = document.getElementById('confirm-shutdown');
    
    // --- Initial Setup ---
    
    // 2. Update Clock
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Kolkata' 
        });
        timeElement.textContent = timeString;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // 4. Fullscreen Helper Function (NEW)
    function requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        }
    }

    // 1. Zoom Interaction (Boot Up) - MODIFIED LOGIC
    macbook.addEventListener('click', () => {
        // 1. Request Fullscreen
        requestFullscreen(document.documentElement); 
        
        // 2. Show Boot Screen and hide the desk immediately
        bootScreen.classList.remove('hidden');
        document.querySelector('.desk-container').style.opacity = '0'; // Instant hide for clean transition
        
        // 3. Start Animation and Transition to Desktop
        const bootDuration = 3000; // Matches CSS animation duration

        setTimeout(() => {
            // Fade out the boot screen
            bootScreen.classList.add('fade-out'); 
            
            // After fade-out, reveal the desktop
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                
                // Show the desktop environment
                container.classList.add('zoomed-in');
                desktop.classList.remove('hidden');
                
                // Automatically open the portfolio window after boot
                const portfolioWindow = document.getElementById('portfolio-window');
                const portfolioDock = document.querySelector('.dock-item[data-window="portfolio-window"]');
                if (portfolioWindow) {
                    portfolioWindow.classList.remove('hidden');
                    portfolioDock.classList.add('is-open');
                    focusWindow(portfolioWindow);
                }
            }, 500); // Wait for the fade-out transition (0.5s)

        }, bootDuration); 

    });


    // --- Window Management ---
    let activeWindow = null;
    let maxZIndex = 100;

    // Open/Focus window from Dock
    dockItems.forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.dataset.window;
            const windowEl = document.getElementById(windowId);
            
            if (windowEl) {
                if (windowEl.classList.contains('hidden')) {
                    windowEl.classList.remove('hidden');
                }
                item.classList.add('is-open');
                focusWindow(windowEl);
            }
        });
    });

    windows.forEach(windowEl => {
        const header = windowEl.querySelector('.window-header');
        const closeBtn = windowEl.querySelector('.control.close');
        const minimizeBtn = windowEl.querySelector('.control.minimize');
        const maximizeBtn = windowEl.querySelector('.control.maximize');

        // Close button
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.classList.add('hidden');
            const dockItem = document.querySelector(`.dock-item[data-window="${windowEl.id}"]`);
            if (dockItem) {
                dockItem.classList.remove('is-open');
            }
        });
        
        // Minimize button
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.classList.add('hidden');
        });
        
        // Maximize button
        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMaximize(windowEl);
        });
        
        // Focus window on click
        windowEl.addEventListener('mousedown', () => {
             focusWindow(windowEl);
        });

        // Make window draggable
        makeDraggable(windowEl, header);
    });

    function focusWindow(windowEl) {
        if (activeWindow) {
            activeWindow.style.zIndex = maxZIndex -1;
        }
        activeWindow = windowEl;
        maxZIndex++;
        windowEl.style.zIndex = maxZIndex;
    }

    function toggleMaximize(windowEl) {
        if (windowEl.classList.contains('maximized')) {
            // Restore
            windowEl.classList.remove('maximized');
            windowEl.style.width = windowEl.dataset.oldWidth;
            windowEl.style.height = windowEl.dataset.oldHeight;
            windowEl.style.top = windowEl.dataset.oldTop;
            windowEl.style.left = windowEl.dataset.oldLeft;
        } else {
            // Maximize
            // Store current size and position before maximizing
            windowEl.dataset.oldWidth = windowEl.offsetWidth + 'px';
            windowEl.dataset.oldHeight = windowEl.offsetHeight + 'px';
            windowEl.dataset.oldTop = windowEl.offsetTop + 'px';
            windowEl.dataset.oldLeft = windowEl.offsetLeft + 'px';
            
            windowEl.classList.add('maximized');
            // Remove inline styles to let the CSS class take over
            windowEl.style.width = '';
            windowEl.style.height = '';
            windowEl.style.top = '';
            windowEl.style.left = '';
        }
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            // Can't drag if maximized
            if (element.classList.contains('maximized')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    // --- Portfolio Window Sidebar Logic ---
    const sidebarLinks = document.querySelectorAll('.sidebar ul li');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            sidebarLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const sectionId = link.dataset.section + '-section';
            contentSections.forEach(section => {
                section.classList.toggle('hidden', section.id !== sectionId);
            });
        });
    });

    // --- Shutdown Logic ---
    appleIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        if (!dropdownMenu.classList.contains('hidden')) {
            dropdownMenu.classList.add('hidden');
        }
    });

    shutdownBtn.addEventListener('click', () => {
        shutdownOverlay.classList.remove('hidden');
        dropdownMenu.classList.add('hidden');
    });

    cancelShutdownBtn.addEventListener('click', () => {
        shutdownOverlay.classList.add('hidden');
    });

    confirmShutdownBtn.addEventListener('click', () => {
        shutdownOverlay.classList.add('hidden');
        windows.forEach(win => win.classList.add('hidden'));
        
        // Reverse the boot-up animation
        container.classList.remove('zoomed-in');
        
        // Reset dock indicators and macbook visibility
        setTimeout(() => {
            dockItems.forEach(item => item.classList.remove('is-open'));
            document.querySelector('.desk-container').style.opacity = '1'; 
            
            // Exit fullscreen if possible
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

        }, 600); // Must match CSS transition duration
    });
});
