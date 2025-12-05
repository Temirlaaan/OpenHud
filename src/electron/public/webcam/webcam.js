// VDO.Ninja Camera Overlay for OpenHud with GSI Integration
(function () {
  const API_URL = "http://localhost:1349";

  let currentPlayerSteamId = null;
  let currentVdoUrl = null;
  let iframeElement = null;
  let containerElement = null;
  let playersCache = {};
  let isTransitioning = false;

  // Initialize Socket.io client
  const socket = io(API_URL);

  socket.on("connect", () => {
    console.log("[VDO.Ninja Camera] Connected to server");
    loadPlayers();
  });

  // Listen for GSI updates (observer slot changes)
  socket.on("update", (gsiData) => {
    handleGSIUpdate(gsiData);
  });

  // Load all players and cache their VDO.Ninja URLs
  async function loadPlayers() {
    try {
      const response = await fetch(`${API_URL}/api/players`);
      const players = await response.json();

      console.log("[VDO.Ninja Camera] Loaded players:", players);

      // Cache steamid -> vdoNinjaUrl mapping
      players.forEach(player => {
        if (player.steamid && player.vdoNinjaUrl) {
          playersCache[player.steamid] = {
            username: player.username,
            vdoNinjaUrl: player.vdoNinjaUrl
          };
        }
      });

      console.log("[VDO.Ninja Camera] Players cache:", playersCache);
    } catch (error) {
      console.error("[VDO.Ninja Camera] Error loading players:", error);
    }
  }

  // Handle GSI data updates
  function handleGSIUpdate(data) {
    if (!data || !data.player || !data.allplayers) return;

    const observerSlot = data.player.observer_slot;

    if (observerSlot === undefined || observerSlot === null) return;

    // Find player by observer_slot in allplayers
    const observedPlayer = Object.entries(data.allplayers).find(
      ([steamid, playerData]) => playerData.observer_slot === observerSlot
    );

    if (!observedPlayer) {
      // No player in this slot, hide camera
      hideCamera();
      return;
    }

    const [steamid, playerData] = observedPlayer;

    // Check if we switched to a different player
    if (steamid !== currentPlayerSteamId) {
      console.log(`[VDO.Ninja Camera] Observer switched to player: ${playerData.name} (${steamid})`);
      switchToPlayer(steamid);
    }
  }

  // Switch camera to a different player
  function switchToPlayer(steamid) {
    const playerInfo = playersCache[steamid];

    if (!playerInfo || !playerInfo.vdoNinjaUrl) {
      console.log(`[VDO.Ninja Camera] No VDO.Ninja URL for player ${steamid}`);
      hideCamera();
      return;
    }

    currentPlayerSteamId = steamid;
    const newUrl = playerInfo.vdoNinjaUrl;

    if (newUrl === currentVdoUrl) {
      // Same URL, just ensure camera is visible
      showCamera();
      return;
    }

    console.log(`[VDO.Ninja Camera] Switching to ${playerInfo.username}: ${newUrl}`);
    currentVdoUrl = newUrl;

    // Fade out, switch, fade in
    fadeOutThenSwitch(newUrl);
  }

  // Create or get camera container
  function getOrCreateContainer() {
    if (!containerElement) {
      containerElement = document.createElement("div");
      containerElement.id = "vdo-ninja-camera-container";
      containerElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 240px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        display: none;
      `;
      document.body.appendChild(containerElement);
    }
    return containerElement;
  }

  // Create iframe for VDO.Ninja
  function createIframe(url) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    `;
    iframe.allow = "camera; microphone; autoplay; display-capture; fullscreen";
    iframe.allowFullscreen = true;
    return iframe;
  }

  // Fade out, switch URL, fade in
  function fadeOutThenSwitch(newUrl) {
    if (isTransitioning) return;

    const container = getOrCreateContainer();
    isTransitioning = true;

    if (container.style.display === "block" && container.style.opacity === "1") {
      // Fade out current camera
      container.style.opacity = "0";

      setTimeout(() => {
        // Remove old iframe
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        // Create new iframe
        iframeElement = createIframe(newUrl);
        container.appendChild(iframeElement);

        // Fade in new camera
        setTimeout(() => {
          container.style.opacity = "1";
          isTransitioning = false;
        }, 100);
      }, 500); // Wait for fade out
    } else {
      // No camera currently shown, just show new one
      container.style.display = "block";

      // Remove old iframe if any
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create new iframe
      iframeElement = createIframe(newUrl);
      container.appendChild(iframeElement);

      // Fade in
      setTimeout(() => {
        container.style.opacity = "1";
        isTransitioning = false;
      }, 100);
    }
  }

  // Show camera (without switching)
  function showCamera() {
    const container = getOrCreateContainer();
    if (container.style.display === "none") {
      container.style.display = "block";
      setTimeout(() => {
        container.style.opacity = "1";
      }, 100);
    }
  }

  // Hide camera
  function hideCamera() {
    if (!containerElement) return;

    containerElement.style.opacity = "0";
    setTimeout(() => {
      containerElement.style.display = "none";
      currentPlayerSteamId = null;
      currentVdoUrl = null;
    }, 500);
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    if (socket) {
      socket.disconnect();
    }
  });

  // Initialize
  console.log("[VDO.Ninja Camera] Script loaded and ready");
})();
