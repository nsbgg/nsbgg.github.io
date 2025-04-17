class XPWindow extends HTMLElement {
  title = "Fenster";
  id = "window-" + Math.random().toString(36).substr(2, 9); // Generate a random ID
  icon = "img/logo.png";

  constructor() {
    super();

    if (this.getAttribute("started") == "false") {
      this.style.display = "none"; // Hide the window if it is not started
      // return;
    }

    this.id = this.getAttribute("window-id") || this.id; // Use the provided ID or generate a new one
    const desktopShortcut = document.querySelector(
      "desktop-shortcut[window-id='" + this.id + "']"
    );
    console.log(desktopShortcut, this.id);
    this.title = desktopShortcut.getAttribute("title") || this.title; // Use the provided title or default to "Fenster"
    this.icon = desktopShortcut.getAttribute("icon") || this.icon; // Use the provided icon or default to "img/logo.png"

    // Attach shadow DOM
    const shadow = this.attachShadow({ mode: "open" });

    // Create container
    const container = document.createElement("div");
    container.classList.add("xp-window");

    // Position the window at the center of the screen
    const computedStyle = getComputedStyle(container);
    const minWidth = parseInt(computedStyle.minWidth, 10) || 300;
    const minHeight = parseInt(computedStyle.minHeight, 10) || 200;

    const width = container.offsetWidth || minWidth;
    const height = container.offsetHeight || minHeight;

    container.style.left = `${(window.innerWidth - width) / 2}px`;
    container.style.top = `${(window.innerHeight - height) / 2}px`;

    // Create header
    const header = document.createElement("div");
    header.classList.add("xp-window-header");

    const title = document.createElement("span");
    title.textContent = this.title;

    const controls = document.createElement("div");
    controls.classList.add("xp-window-controls");

    const minimizeButton = document.createElement("button");
    minimizeButton.textContent = "_";

    const maximizeButton = document.createElement("button");
    maximizeButton.textContent = "🗖";

    const closeButton = document.createElement("button");
    closeButton.textContent = "✖";

    controls.appendChild(minimizeButton);
    controls.appendChild(maximizeButton);
    closeButton.setAttribute("close", "");
    controls.appendChild(closeButton);

    header.appendChild(title);
    header.appendChild(controls);

    // Create content
    const content = document.createElement("div");
    content.classList.add("xp-window-content");
    content.innerHTML = this.innerHTML;

    container.appendChild(header);
    container.appendChild(content);
    shadow.appendChild(container);

    const taskbar = document.querySelector(".xp-taskbar");

    function addToTaskbar(winEl) {
      const taskbarButton = document.createElement("button");
      taskbarButton.classList.add("taskbar-button");
      // taskbarButton.textContent = winEl.title;
      const taskButImg =
        "<img src='" + winEl.icon + "' alt='Icon' class='taskbar-icon'>";
      taskbarButton.innerHTML = taskButImg + winEl.title;
      taskbarButton.setAttribute("window-id", winEl.id);

      taskbarButton.addEventListener("click", () => {
        if (winEl.style.visibility === "hidden") {
          winEl.style.visibility = "visible";
        } else {
          winEl.style.visibility = "hidden";
        }
      });

      // taskbarButton.appendChild(taskButImg);
      taskbar.appendChild(taskbarButton);
    }

    if (
      this.getAttribute("started") != "false" &&
      this.style.display != "none"
    ) {
      addToTaskbar(this);
    }
    this.setAttribute("started", "true");

    // Add styles dynamically
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", "components/xp-window.css");
    shadow.appendChild(style);

    // Dragging functionality
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (e) => {
      if (e.target == maximizeButton && isMaximized) {
        // Restore the window to its original size and position
        container.style.width = "auto";
        container.style.height = `${
          (window.innerHeight -
            document.querySelector(".xp-start-bar").offsetHeight) /
          2
        }px`;
        // container.style.left = `${e.clientX - container.offsetWidth / 2}px`;
        // container.style.top = `${e.clientY - container.offsetHeight / 2}px`;
        maximizeButton.textContent = "🗖"; // Change back to maximize icon
        isMaximized = false;
      }

      if (e.target.HTMLElement === "button") {
        return; // Ignore clicks on the button
      }

      isDragging = true;
      offsetX = e.clientX - container.offsetLeft;
      offsetY = e.clientY - container.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const newLeft = e.clientX - offsetX;
        const newTop = e.clientY - offsetY;

        const maxLeft = window.innerWidth - container.offsetWidth;
        const maxTop = window.innerHeight - container.offsetHeight;

        container.style.left = `${Math.min(Math.max(0, newLeft), maxLeft)}px`;
        container.style.top = `${Math.min(Math.max(0, newTop), maxTop)}px`;
        container.style.maxWidth = "700px"; // Reset maxWidth to 700px
        container.style.maxHeight = "500px"; // Reset maxHeight to 500px
        isMaximized = false; // Reset maximized state
        maximizeButton.textContent = "🗖"; // Change back to maximize icon
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Maximize functionality
    let isMaximized = false;

    minimizeButton.addEventListener("click", () => {
      this.style.visibility = "hidden";
    });

    maximizeButton.addEventListener("click", () => {
      const taskbarHeight =
        document.querySelector(".xp-start-bar").offsetHeight;
      const availableHeight = window.innerHeight - taskbarHeight;

      if (isMaximized) {
        container.style.maxWidth = "700px";
        container.style.maxHeight = "500px"; // Reset maxHeight to 500px
        container.style.width = "auto";
        container.style.height = `${availableHeight / 2}px`;
        container.style.left = `${
          (window.innerWidth - container.offsetWidth) / 2
        }px`;
        container.style.top = `${
          (availableHeight - container.offsetHeight) / 2
        }px`;
        maximizeButton.textContent = "🗖"; // Change back to maximize icon
        isMaximized = false;
      } else {
        container.style.maxWidth = "100%";
        container.style.maxHeight = "100%"; // Reset maxHeight to 100%
        container.style.width = "100%";
        container.style.height = `${availableHeight}px`;
        container.style.left = "0";
        container.style.top = "0";
        maximizeButton.textContent = "🗗"; // Change to minimize icon
        isMaximized = true;
      }
    });

    // Close functionality
    closeButton.addEventListener("click", () => {
      this.style.display = "none";
    });

    // MutationObserver for visibility changes
    const taskbarButton = document.querySelector(
      `.taskbar-button[window-id='${this.id}']`
    );
    const observer = new MutationObserver(() => {
      if (this.style.display === "none") {
        taskbarButton.style.display = "none";
      } else {
        taskbarButton.style.display = "flex";
      }
    });

    observer.observe(this, { attributes: true, attributeFilter: ["style"] });
  }
}

customElements.define("xp-window", XPWindow);
