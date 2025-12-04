// Webcam Overlay for OpenHud
(function () {
  let webcamSettings = null;
  let videoElement = null;
  let containerElement = null;
  let mediaStream = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  const API_URL = "http://localhost:1349";

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
          width: { ideal: webcamSettings.width },
          height: { ideal: webcamSettings.height },
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

      applySettings();
    } catch (error) {
      console.error("Error starting webcam:", error);
      showError("Camera access denied or unavailable");
    }
  }

  function createWebcamElement() {
    // Create container
    containerElement = document.createElement("div");
    containerElement.id = "webcam-overlay-container";
    containerElement.style.cssText = `
      position: fixed;
      cursor: move;
      user-select: none;
      -webkit-user-select: none;
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
    `;

    containerElement.appendChild(videoElement);
    document.body.appendChild(containerElement);

    // Add drag functionality
    containerElement.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  }

  function startDrag(e) {
    if (!containerElement) return;
    isDragging = true;
    const rect = containerElement.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    containerElement.style.cursor = "grabbing";
  }

  function drag(e) {
    if (!isDragging || !containerElement) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    containerElement.style.left = `${x}px`;
    containerElement.style.top = `${y}px`;
  }

  function stopDrag() {
    if (!containerElement) return;
    isDragging = false;
    containerElement.style.cursor = "move";
  }

  function applySettings() {
    if (!containerElement || !videoElement || !webcamSettings) return;

    containerElement.style.width = `${webcamSettings.width}px`;
    containerElement.style.height = `${webcamSettings.height}px`;
    containerElement.style.left = `${webcamSettings.positionX}px`;
    containerElement.style.top = `${webcamSettings.positionY}px`;
    containerElement.style.borderRadius = `${webcamSettings.borderRadius}px`;
    containerElement.style.opacity = webcamSettings.opacity;
    containerElement.style.border = `${webcamSettings.borderWidth}px solid ${webcamSettings.borderColor}`;
    containerElement.style.zIndex = webcamSettings.zIndex;
    containerElement.style.overflow = "hidden";
    containerElement.style.display = webcamSettings.enabled ? "block" : "none";
  }

  function stopWebcam() {
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
          font-size: 12px;
          text-align: center;
          padding: 10px;
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
  console.log("Webcam overlay script loaded");
})();
