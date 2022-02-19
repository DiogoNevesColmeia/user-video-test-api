(function () {
  const canvas = document.getElementById("get-user-media-canvas");
  const video = document.getElementById("get-user-media-video");
  const img = document.getElementById("show-user-media-image");
  const context = canvas.getContext("2d");
  function getFrameFromAPI(frameData) {
    if (window.$) {
      window.$.ajax({
        url: "http://focal-column-339522.rj.r.appspot.com/facial_recognition",
        method: "POST",
        data: {
          type: "b64",
          url: frameData.frame.split("data:image/png;base64,")[1],
        },
        success: function (data) {
          if (!frameData.displayed) {
            frameData.processedFrame = data.image_response;
          }
        },
      });
    }
  }

  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      // Attach the video stream to the video element and autoplay.

      video.srcObject = stream;

      const setTimeoutId = setTimeout(() => {
        clearTimeout(setTimeoutId);
        (function applyNewFrame() {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          const frameData = {
            frame: canvas.toDataURL(),
            displayed: false,
            processedFrame: "",
          };

          getFrameFromAPI(frameData);

          const setTimeoutId = setInterval(() => {
            if (frameData.processedFrame) {
              clearTimeout(setTimeoutId);
              img.src = frameData.processedFrame;
              frameData.displayed = true;
              applyNewFrame();
            }
          }, 1000 / 120);
        })();
      }, 1000);
    });
})();
