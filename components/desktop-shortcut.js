class DesktopShortcut extends HTMLElement {
  constructor() {
    super();

    // Attach shadow DOM
    const shadow = this.attachShadow({ mode: "open" });

    // Create container
    const container = document.createElement("div");
    container.classList.add("desktop-shortcut");
    container.setAttribute("draggable", "true");

    // Create icon
    const icon = document.createElement("img");
    icon.src = this.getAttribute("icon") || "img/logo.png";
    icon.alt = this.getAttribute("title") || "Shortcut";
    icon.classList.add("shortcut-icon");

    // Create label
    const label = document.createElement("span");
    label.textContent = this.getAttribute("title") || "Shortcut";
    label.classList.add("shortcut-label");

    container.appendChild(icon);
    container.appendChild(label);
    shadow.appendChild(container);

    // Add styles dynamically
    const style = document.createElement("link");
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", "components/desktop-shortcut.css");
    shadow.appendChild(style);

    container.addEventListener("dblclick", () => {
      const windowId = this.getAttribute("window-id");
      if (windowId) {
        const targetWindow = document.querySelector(
          `xp-window[window-id='${windowId}']`
        );
        if (targetWindow) {
          targetWindow.style.display = "block";
          const taskbarButton = document.querySelector(
            `.taskbar-button[window-id='${windowId}']`
          );
          if (taskbarButton) {
            taskbarButton.style.display = "flex";
          }
        }
      }
    });

    container.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", this.getAttribute("window-id"));
    });
    container.addEventListener("dragend", (event) => {
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
          if (child === this) return false; // Skip the current element
          if (childGrid.gridColumn === gridX && childGrid.gridRow === gridY)
            return true; // Check if the position is occupied
        });

        if (!isOccupied) {
          this.style.gridColumn = `${gridColumn}`;
          this.style.gridRow = `${gridRow}`;
        }
      }
    });
  }
}

customElements.define("desktop-shortcut", DesktopShortcut);
