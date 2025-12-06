// Webcam Overlay for OpenHud
// Positions webcam over the observed player's avatar
(function () {
  let webcamSettings = null;
  let videoElement = null;
  let containerElement = null;
  let mediaStream = null;
  let positionUpdateInterval = null;

  const API_URL = "http://localhost:1349";

  // Avatar element selector - the observed player's avatar
  const AVATAR_SELECTOR = ".observed_container .avatar_holder";

  // Initialize Socket.io client
  const socket = io(API_URL);

  socket.on("connect", () => {
    console.log("Webcam overlay connected to server");
    fetchSettings();
  });

  socket.on("webcamSettingsUpdated", (settings) => {
    console.log("Webcam settings updated:", settings);
    webcamSettings = settings;
    updateWebcam();
  });

  async function fetchSettings() {
    try {
      const response = await fetch(`${API_URL}/api/camera/settings`);
      webcamSettings = await response.json();
      console.log("Fetched webcam settings:", webcamSettings);
      updateWebcam();
    } catch (error) {
      console.error("Error fetching webcam settings:", error);
    }
  }

  async function startWebcam() {
    if (!webcamSettings || !webcamSettings.enabled) {
      stopWebcam();
      return;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 320 },
          height: { ideal: 320 },
          frameRate: { ideal: 30, max: 30 },
        },
      };

      if (webcamSettings.deviceId) {
        constraints.video.deviceId = { exact: webcamSettings.deviceId };
      }

      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoElement) {
        createWebcamElement();
      }

      videoElement.srcObject = mediaStream;
      videoElement.play();

      // Start tracking avatar position
      startPositionTracking();
    } catch (error) {
      console.error("Error starting webcam:", error);
      showError("Camera access denied");
    }
  }

  function createWebcamElement() {
    // Create container
    containerElement = document.createElement("div");
    containerElement.id = "webcam-overlay-container";
    containerElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      border-radius: 50%;
      overflow: hidden;
      display: none;
    `;

    // Create video element
    videoElement = document.createElement("video");
    videoElement.id = "webcam-overlay-video";
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.cssText = `
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      transform: scaleX(-1);
    `;

    containerElement.appendChild(videoElement);
    document.body.appendChild(containerElement);
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
    if (!containerElement || !webcamSettings || !webcamSettings.enabled) {
      return;
    }

    const avatarElement = document.querySelector(AVATAR_SELECTOR);

    if (avatarElement) {
      const rect = avatarElement.getBoundingClientRect();

      // Position webcam exactly over the avatar
      containerElement.style.left = `${rect.left}px`;
      containerElement.style.top = `${rect.top}px`;
      containerElement.style.width = `${rect.width}px`;
      containerElement.style.height = `${rect.height}px`;
      containerElement.style.display = "block";
      containerElement.style.opacity = webcamSettings.opacity;
      containerElement.style.border = `${webcamSettings.borderWidth}px solid ${webcamSettings.borderColor}`;
    } else {
      // Hide webcam if avatar not found (player not being observed)
      containerElement.style.display = "none";
    }
  }

  function stopWebcam() {
    if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
      positionUpdateInterval = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    if (videoElement) {
      videoElement.srcObject = null;
    }

    if (containerElement) {
      containerElement.style.display = "none";
    }
  }

  function showError(message) {
    console.error("Webcam error:", message);
    if (containerElement) {
      containerElement.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          font-family: Arial, sans-serif;
          font-size: 10px;
          text-align: center;
          padding: 5px;
          border-radius: 50%;
        ">
          ${message}
        </div>
      `;
    }
  }

  function updateWebcam() {
    if (webcamSettings && webcamSettings.enabled) {
      startWebcam();
    } else {
      stopWebcam();
    }
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    stopWebcam();
    if (socket) {
      socket.disconnect();
    }
  });

  // Initialize
  console.log("Webcam overlay script loaded - will overlay on observed player avatar");
})();
