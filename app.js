function zeigeNachricht() {
  const nachrichtElement = document.getElementById("nachricht");
  nachrichtElement.textContent = "Willkommen auf meiner GitHub Startseite im Windows XP Stil!";
}

function aktualisiereUhrzeit() {
  const uhrzeitElement = document.getElementById("taskbar-clock");
  const jetzt = new Date();
  const stunden = jetzt.getHours().toString().padStart(2, "0");
  const minuten = jetzt.getMinutes().toString().padStart(2, "0");
  uhrzeitElement.textContent = `${stunden}:${minuten}`;
}

// Aktualisiere die Uhrzeit jede Sekunde
setInterval(aktualisiereUhrzeit, 1000);

// Initiale Uhrzeit setzen
aktualisiereUhrzeit();
