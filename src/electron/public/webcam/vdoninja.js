// VDO.Ninja Overlay for OpenHud
// Displays VDO.Ninja player cameras with automatic switching based on observed player
(function () {
  let vdoNinjaSettings = null;
  let iframeElement = null;
  let containerElement = null;
  let positionUpdateInterval = null;
  let currentStreamId = null;
  let currentPlayerSteamId = null;
  let playersCache = {};
  let lastObservedSteamId = null;

  const API_URL = "http://localhost:1349";

  // Avatar element selector - the observed player's avatar
  const AVATAR_SELECTOR = ".observed_container .avatar_holder";

  // Initialize Socket.io client
  const socket = io(API_URL);

  socket.on("connect", () => {
    console.log("VDO.Ninja overlay connected to server");
    fetchSettings();
    fetchPlayers();
  });

  socket.on("vdoNinjaSettingsUpdated", (settings) => {
    console.log("VDO.Ninja settings updated:", settings);
    vdoNinjaSettings = settings;
    updateVdoNinja();
  });

  // Listen for GSI updates to detect observed player changes
  socket.on("update", (data) => {
    handleGsiUpdate(data);
  });

  async function fetchSettings() {
    try {
      const response = await fetch(`${API_URL}/api/camera/vdoninja/settings`);
      vdoNinjaSettings = await response.json();
      console.log("Fetched VDO.Ninja settings:", vdoNinjaSettings);
      updateVdoNinja();
    } catch (error) {
      console.error("Error fetching VDO.Ninja settings:", error);
    }
  }

  async function fetchPlayers() {
    try {
      const response = await fetch(`${API_URL}/api/players`);
      const players = await response.json();
      // Create a map of steamid -> player for quick lookup
      playersCache = {};
      players.forEach((player) => {
        if (player.steamid) {
          playersCache[player.steamid] = player;
        }
      });
      console.log("Fetched players for VDO.Ninja:", Object.keys(playersCache).length);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }

  function handleGsiUpdate(data) {
    if (!vdoNinjaSettings || !vdoNinjaSettings.enabled) {
      return;
    }

    // Get the observed player's steamid from GSI data
    const observedSteamId = data?.player?.steamid;

    if (!observedSteamId) {
      // No player being observed
      hideOverlay();
      return;
    }

    // Check if the observed player changed
    if (observedSteamId !== lastObservedSteamId) {
      lastObservedSteamId = observedSteamId;
      switchToPlayer(observedSteamId);
    }
  }

  function switchToPlayer(steamId) {
    const player = playersCache[steamId];

    if (!player) {
      console.log("VDO.Ninja: Player not found in cache:", steamId);
      // Refresh players cache and try again
      fetchPlayers().then(() => {
        const refreshedPlayer = playersCache[steamId];
        if (refreshedPlayer && refreshedPlayer.vdoNinjaStreamId) {
          setStream(refreshedPlayer.vdoNinjaStreamId, steamId);
        } else {
          hideOverlay();
        }
      });
      return;
    }

    if (!player.vdoNinjaStreamId) {
      console.log("VDO.Ninja: Player has no stream ID:", steamId);
      hideOverlay();
      return;
    }

    setStream(player.vdoNinjaStreamId, steamId);
  }

  function setStream(streamId, steamId) {
    if (currentStreamId === streamId) {
      // Same stream, just ensure it's visible
      showOverlay();
      return;
    }

    console.log("VDO.Ninja: Switching to stream:", streamId);
    currentStreamId = streamId;
    currentPlayerSteamId = steamId;

    if (!iframeElement) {
      createOverlayElement();
    }

    // Build VDO.Ninja URL
    const vdoUrl = buildVdoNinjaUrl(streamId);

    // Apply transition effect
    if (vdoNinjaSettings.transitionDuration > 0) {
      containerElement.style.transition = `opacity ${vdoNinjaSettings.transitionDuration}ms ease-in-out`;
      containerElement.style.opacity = "0";

      setTimeout(() => {
        iframeElement.src = vdoUrl;
        containerElement.style.opacity = String(vdoNinjaSettings.opacity);
      }, vdoNinjaSettings.transitionDuration / 2);
    } else {
      iframeElement.src = vdoUrl;
    }

    showOverlay();
  }

  function buildVdoNinjaUrl(streamId) {
    // Check if streamId is already a full URL
    if (streamId.startsWith("http://") || streamId.startsWith("https://")) {
      return streamId;
    }

    const params = new URLSearchParams({
      view: streamId,
    });

    if (vdoNinjaSettings.autoplay) {
      params.set("autoplay", "1");
    }
    if (vdoNinjaSettings.muted) {
      params.set("muted", "1");
    }
    if (vdoNinjaSettings.cleanOutput) {
      params.set("cleanoutput", "1");
    }
    // Additional parameters for better quality
    params.set("codec", "h264");
    params.set("noaudio", vdoNinjaSettings.muted ? "1" : "0");

    return `https://vdo.ninja/?${params.toString()}`;
  }

  function createOverlayElement() {
    // Create container
    containerElement = document.createElement("div");
    containerElement.id = "vdoninja-overlay-container";
    containerElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
      display: none;
    `;

    // Create iframe element
    iframeElement = document.createElement("iframe");
    iframeElement.id = "vdoninja-overlay-iframe";
    iframeElement.allow = "camera; microphone; autoplay; display-capture";
    iframeElement.style.cssText = `
      display: block;
      width: 100%;
      height: 100%;
      border: none;
      border-radius: inherit;
    `;

    containerElement.appendChild(iframeElement);
    document.body.appendChild(containerElement);

    // Apply settings
    applySettings();
  }

  function applySettings() {
    if (!containerElement || !vdoNinjaSettings) return;

    containerElement.style.borderRadius = `${vdoNinjaSettings.borderRadius}%`;
    containerElement.style.opacity = String(vdoNinjaSettings.opacity);
    containerElement.style.border = `${vdoNinjaSettings.borderWidth}px solid ${vdoNinjaSettings.borderColor}`;
  }

  function startPositionTracking() {
    // Update position immediately
    updatePosition();

    // Clear existing interval if any
    if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
    }

    // Update position every 100ms to follow avatar
    positionUpdateInterval = setInterval(updatePosition, 100);
  }

  function updatePosition() {
    if (!containerElement || !vdoNinjaSettings || !vdoNinjaSettings.enabled) {
      return;
    }

    const avatarElement = document.querySelector(AVATAR_SELECTOR);

    if (avatarElement && currentStreamId) {
      const rect = avatarElement.getBoundingClientRect();

      // Position overlay exactly over the avatar
      containerElement.style.left = `${rect.left}px`;
      containerElement.style.top = `${rect.top}px`;
      containerElement.style.width = `${rect.width}px`;
      containerElement.style.height = `${rect.height}px`;
      containerElement.style.display = "block";
    } else {
      // Hide overlay if avatar not found
      containerElement.style.display = "none";
    }
  }

  function showOverlay() {
    if (!containerElement) return;
    startPositionTracking();
    containerElement.style.display = "block";
  }

  function hideOverlay() {
    currentStreamId = null;
    currentPlayerSteamId = null;

    if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
      positionUpdateInterval = null;
    }

    if (containerElement) {
      containerElement.style.display = "none";
    }

    if (iframeElement) {
      iframeElement.src = "about:blank";
    }
  }

  function stopVdoNinja() {
    hideOverlay();

    if (containerElement) {
      containerElement.remove();
      containerElement = null;
      iframeElement = null;
    }
  }

  function updateVdoNinja() {
    if (vdoNinjaSettings && vdoNinjaSettings.enabled) {
      if (!containerElement) {
        createOverlayElement();
      }
      applySettings();
      startPositionTracking();

      // If we have a last observed player, try to show their stream
      if (lastObservedSteamId) {
        switchToPlayer(lastObservedSteamId);
      }
    } else {
      stopVdoNinja();
    }
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    stopVdoNinja();
    if (socket) {
      socket.disconnect();
    }
  });

  // Initialize
  console.log("VDO.Ninja overlay script loaded - will overlay on observed player avatar");
})();
