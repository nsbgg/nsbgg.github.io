const buttonLink = document.createElement("link");
buttonLink.rel = "stylesheet";
buttonLink.href = "/components/button.css";
document.head.appendChild(buttonLink);

class xpButton extends HTMLElement {
  color = "";
  radius = 0;
  content = "";

  constructor() {
    super();
    this.radius = this.getAttribute("border-radius");
    this.color = this.getAttribute("xp-color");
    this.content = this.innerHTML;
    const after = document.querySelector("xp-button > *::before");
    // after.innerHTML = `"${this.content}"`;
    console.log(this.content);
    

    this.style.setProperty("--xp-button-radius", `${this.radius}px`);
    this.style.setProperty("--xp-button-color", this.color);
  }
}

customElements.define("xp-button", xpButton);
