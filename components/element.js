class Element extends HTMLElement {
  title = "Fenster";
  id = "window-" + Math.random().toString(36).substr(2, 9); // Generate a random ID
  icon = "img/logo.png";
  started = false;
  shortcut = true;
  maximized = false;
  hidden = false;
  desktop = document.querySelector(".desktop");

  constructor() {
    super();
    this.id = this.getAttribute("window-id") || this.id;
    this.hidden = this.getAttribute("hidden") == null ? false : true;
    this.shortcut = this.getAttribute("shortcut") || this.shortcut;
    this.title = this.getAttribute("title") ?? this.title;
    this.icon = this.getAttribute("icon") || this.icon;
    this.started = this.getAttribute("started") || this.started;
    if (this.shortcut) this.addDesktopShortcut();
    if (this.started) this.start();
  }

  start() {
    this.title = this.getAttribute("title") ?? this.title;
    this.icon = this.getAttribute("icon") || this.icon;
    this.started = this.getAttribute("started") || this.started;

    if (this.started == "true" || this.started == true) this.addWindow();

    // Add styles dynamically
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", "components/element.css");
    const shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    shadow.appendChild(style);

    if (this.getWindow()) this.addEventListeners();
    this.setZIndex();
  }

  // MARK: ADD
  addDesktopShortcut() {
    // ✔
    const desktopShortcut = document.createElement("div");
    desktopShortcut.innerHTML = `<img src="${this.icon}" alt="${this.title}" class="shortcut-icon"> <span class="shortcut-label">${this.title}</span>`;
    desktopShortcut.classList.add("desktop-shortcut");
    desktopShortcut.setAttribute("window-id", this.id);
    desktopShortcut.setAttribute("draggable", "true");
    document.querySelector(".desktop").appendChild(desktopShortcut);

    desktopShortcut.addEventListener("dblclick", () => {
      if (this.started == "true" || this.started == true) {
        console.error("window already started");
        return;
      }
      this.started = true;
      this.setAttribute("started", true);
      this.start();
    });

    desktopShortcut.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", this.getAttribute("window-id"));
    });
    desktopShortcut.addEventListener("dragend", (event) => {
      event.dataTransfer.clearData();

      // Get the position of the drag end
      const dropX = event.clientX - 20;
      const dropY = event.clientY - 20;

      // Find the closest grid position
      const desktop = document.querySelector(".desktop");
      if (desktop) {
        const rect = desktop.getBoundingClientRect();
        let gridColumn = 0;
        let gridRow = 0;
        const gridX = Math.round((dropX - rect.left) / 80) + 1;
        const gridY = Math.round((dropY - rect.top) / 80) + 1;

        gridColumn = gridX;
        gridRow = gridY;

        // Check if the position is already occupied
        const isOccupied = Array.from(desktop.children).some((child) => {
          const childGrid = {
            gridColumn: parseInt(child.style.gridColumn) || 1,
            gridRow: parseInt(child.style.gridRow) || 1,
          };
          if (child === desktopShortcut) return false; // Skip the current element
          if (childGrid.gridColumn === gridX && childGrid.gridRow === gridY)
            return true; // Check if the position is occupied
        });

        if (!isOccupied) {
          desktopShortcut.style.gridColumn = `${gridColumn}`;
          desktopShortcut.style.gridRow = `${gridRow}`;
        }
      }
    });
  }

  addWindow() {
    // Attach shadow DOM
    const shadow = this.shadowRoot || this.attachShadow({ mode: "open" });

    // Create container
    const container = document.createElement("div");
    container.classList.add("xp-element");
    container.setAttribute("window-id", this.id);

    // Create header
    const header = document.createElement("div");
    header.classList.add("xp-element-header");

    const title = document.createElement("span");
    title.textContent = this.title;

    const controls = document.createElement("div");
    controls.classList.add("xp-element-controls");

    const minimizeButton = document.createElement("button");
    minimizeButton.textContent = "_";
    minimizeButton.setAttribute("minimize", "");

    const maximizeButton = document.createElement("button");
    maximizeButton.textContent = "🗖";
    maximizeButton.setAttribute("maximize", "");

    const closeButton = document.createElement("button");
    closeButton.textContent = "✖";
    closeButton.setAttribute("close", "");

    controls.appendChild(minimizeButton);
    controls.appendChild(maximizeButton);
    controls.appendChild(closeButton);

    header.appendChild(title);
    header.appendChild(controls);

    // Create content
    const content = document.createElement("div");
    content.classList.add("xp-element-content");
    content.innerHTML = this.innerHTML;

    container.appendChild(header);
    container.appendChild(content);
    shadow.appendChild(container);

    this.setWindowPosition();
    this.addTaskbarButton();
  }

  addTaskbarButton() {
    const taskbarButton = document.createElement("button");
    taskbarButton.setAttribute("window-id", this.id);
    taskbarButton.classList.add("taskbar-button");
    taskbarButton.innerHTML = `<img src="${this.icon}" alt="${this.title}" class='taskbar-icon'> ${this.title}`;
    document.querySelector(".xp-taskbar").appendChild(taskbarButton);

    taskbarButton.addEventListener("click", () => {
      this.setZIndex();
      const elWindow = this.getWindow();
      if (this.hidden) {
        elWindow.style.visibility = "visible";
        this.hidden = false;
        this.removeAttribute("hidden");
      } else {
        elWindow.style.visibility = "hidden";
        this.hidden = true;
        this.setAttribute("hidden", "");
      }
    });
  }

  // MARK: GET
  getElement() {
    return document.querySelector(`xp-element[window-id='${this.id}']`);
  }

  getWindow() {
    return this.getElement().shadowRoot.querySelector(".xp-element");
  }

  getTaskbarButton() {
    const taskbar = document.querySelector(".xp-taskbar");
    if (!taskbar) return null;
    return taskbar.querySelector(`button[window-id='${this.id}']`);
  }

  getDesktopShortcut() {
    return document.querySelector(`desktop-shortcut[window-id='${this.id}']`);
  }

  // MARK: SET
  setWindowPosition(l) {
    const window = this.getWindow();
    if (!window) return;
    const windowRect = window.getBoundingClientRect();
    const desktop = document.querySelector(".desktop");
    const desktopRect = desktop.getBoundingClientRect();

    let offsetX = (desktopRect.width - windowRect.width) / 2;
    const offsetY = (desktopRect.height - windowRect.height) / 2;

    if (!this.maximized && offsetX == 0) {
      offsetX = desktopRect.width / 2;
    }

    window.style.left = `${desktopRect.left + offsetX}px`;
    window.style.top = `${desktopRect.top + offsetY}px`;

    const taskbarButton = this.getTaskbarButton();
    if (taskbarButton) {
      taskbarButton.style.display = "flex";
    }
  }

  setWindowMaximized(maximized) {
    this.maximized = maximized;
    const elWindow = this.getWindow();
    const maximizeButton = this.shadowRoot.querySelector("[maximize]");
    const desktopRect = this.desktop.getBoundingClientRect();
    if (this.maximized) {
      elWindow.style.maxWidth = "700px";
      elWindow.style.maxHeight = "500px"; // Reset maxHeight to 500px
      elWindow.style.width = "auto";
      elWindow.style.height = `fit-content`;
      const windowRect = elWindow.getBoundingClientRect();
      const left = (desktopRect.width - windowRect.width) / 2;
      const top = (desktopRect.height - windowRect.height) / 2;
      elWindow.style.left = left + "px";
      elWindow.style.top = top + "px";
      maximizeButton.textContent = "🗖"; // Change back to maximize icon
      this.maximized = false;
    } else {
      elWindow.style.maxWidth = "100%";
      elWindow.style.maxHeight = "100%"; // Reset maxHeight to 100%
      elWindow.style.width = "100%";
      elWindow.style.height = `${desktopRect.height}px`;
      elWindow.style.left = "0px";
      elWindow.style.top = "0px";
      maximizeButton.textContent = "🗗"; // Change to minimize icon
      this.maximized = true;
    }
  }

  setZIndex() {
    const elWindow = this.getWindow();
    if (!elWindow) return;
    const windows = document.querySelectorAll("xp-element[started='true']");
    console.log(windows);
    let highestZIndex = windows.length;
    console.log(highestZIndex);
    const sortedWindows = Array.from(windows).sort((a, b) => {
      const zIndexA = parseInt(a.style.zIndex) || 0;
      const zIndexB = parseInt(b.style.zIndex) || 0;
      return zIndexA - zIndexB;
    });
    console.log(sortedWindows);
    let zIndex = highestZIndex;
    for (const window of sortedWindows) {
      window.style.zIndex = zIndex;
      zIndex--;
    }

    this.style.zIndex = highestZIndex + 1;
  }

  // MARK: EVENTS
  addEventListeners() {
    this.addEventListener("click", this.setZIndex);
    const minimizeButton = this.shadowRoot.querySelector("[minimize]");
    const maximizeButton = this.shadowRoot.querySelector("[maximize]");
    const closeButton = this.shadowRoot.querySelector("[close]");
    const elementHeader = this.shadowRoot.querySelector(".xp-element-header");

    minimizeButton.addEventListener("click", () => {
      this.setZIndex();
      this.setAttribute("hidden", "");
      this.hidden = true;
    });

    maximizeButton.addEventListener("click", () => {
      this.setZIndex();
      this.setWindowMaximized(this.maximized);
    });

    closeButton.addEventListener("click", () => {
      this.getWindow().remove();
      this.getTaskbarButton().remove();
      this.started = false;
      this.setAttribute("started", false);
    });

    elementHeader.addEventListener("mousedown", (event) => {
      this.setZIndex();
      event.preventDefault(); // Prevent text selection
      if (event.target.tagName == "BUTTON") return;

      const parentElement = event.target.closest(".xp-element");
      const id = parentElement.getAttribute("window-id");
      const element = document.querySelector(`xp-element[window-id='${id}']`);

      const elWindow = this.getWindow();
      const winXp = document.querySelector(".windows-xp");
      let elWindowRect = elWindow.getBoundingClientRect();

      let left = elWindowRect.left;
      if (elWindowRect.left <= 0) {
        left = event.clientX + elWindowRect.left;
      }

      let top = elWindowRect.top;
      if (elWindowRect.top <= 0) {
        top = event.clientY + elWindowRect.top - event.clientY;
      }

      const offsetX = event.clientX - left;
      const offsetY = event.clientY - top;

      if (this.maximized) {
        this.setWindowMaximized(this.maximized);
        elWindowRect = elWindow.getBoundingClientRect();
        elWindow.style.left = `${event.clientX - offsetX}px`;
        elWindow.style.top = `${event.clientY - offsetY}px`;
      }

      const onMouseMove = (event) => {
        const taskbarHeight =
          document.querySelector(".xp-start-bar").offsetHeight;
        if (event.clientX < 10 || event.clientY < 10) return;
        if (event.clientX > window.innerWidth - 10) return;
        if (event.clientY > window.innerHeight - taskbarHeight - 10) return;
        elWindow.style.left = `${event.clientX - offsetX}px`;
        elWindow.style.top = `${event.clientY - offsetY}px`;

        const mouseY = event.clientY;
        if (mouseY <= 20 && !winXp.classList.contains("bright")) {
          winXp.classList.add("bright");
        } else if (mouseY > 20 && winXp.classList.contains("bright")) {
          winXp.classList.remove("bright");
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      function onMouseUp(event) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        if (element.maximized == false && event.clientY <= 20) {
          // console.log("maximized Wind", element);
          element.setWindowMaximized(element.maximized);
          if (winXp.classList.contains("bright")) {
            winXp.classList.remove("bright");
          }
        }
      }
    });
  }
}

customElements.define("xp-element", Element);
