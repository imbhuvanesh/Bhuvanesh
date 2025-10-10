document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const container = document.querySelector('.container');
    const macbook = document.querySelector('.macbook');
    const desktop = document.querySelector('.desktop-container');
    const timeElement = document.getElementById('time');
    const dockItems = document.querySelectorAll('.dock-item');
    
    // --- Initial Setup ---
    
    // 1. Zoom Interaction
    macbook.addEventListener('click', () => {
        container.classList.add('zoomed-in');
        desktop.classList.remove('hidden');
    });

    // 2. Update Clock
    function updateTime() {
        const now = new Date();
        // Using IST for Chennai, though client-side JS uses browser time
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

    // --- Window Management ---
    
    const windows = document.querySelectorAll('.window');
    let activeWindow = null;
    let maxZIndex = 100;

    // Open/Focus window from Dock
    dockItems.forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.dataset.window;
            const windowEl = document.getElementById(windowId);
            
            if (windowEl) {
                windowEl.classList.remove('hidden');
                focusWindow(windowEl);
            }
        });
    });

    windows.forEach(windowEl => {
        const header = windowEl.querySelector('.window-header');
        const closeBtn = windowEl.querySelector('.control.close');

        // **THIS MAKES THE CLOSE BUTTON WORK**
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents other click events on the window
            windowEl.classList.add('hidden');
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

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
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
            
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
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
            // Update active link
            sidebarLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            // Show corresponding content
            const sectionId = link.dataset.section + '-section';
            contentSections.forEach(section => {
                if(section.id === sectionId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });

});