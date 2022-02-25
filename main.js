(function () {
  const canvas = document.getElementById("get-user-media-canvas");
  const video = document.getElementById("get-user-media-video");
  const img = document.getElementById("show-user-media-image");

  const framesProcessed = document.getElementById("frames-processed");
  const framesTimeout = document.getElementById("frames-timeout");
  const framesResponse = document.getElementById("frames-response");

  const context = canvas.getContext("2d");

  let countErrors = 0;
  let countSuccess = 1;
  function getFrameFromAPI(frameData) {
    if (window.$) {
      const now = new Date().getTime();
      window.$.ajax({
        url: "http://focal-column-339522.rj.r.appspot.com/facial_recognition",
        method: "POST",
        timeout: countErrors === 3 ? Infinity : 300,
        data: {
          type: "b64",
          url: frameData.frame.split("data:image/png;base64,")[1],
        },
        success: function (data) {
          countErrors = 0;
          if (!frameData.displayed) {
            frameData.processedFrame = data.image_response;
          }
          framesResponse.textContent =
            (parseFloat(framesResponse.textContent) +
              new Date().getTime() -
              now) /
              countSuccess +
            "ms";

          countSuccess += 1;
          framesProcessed.textContent = countSuccess;
        },
        error: function () {
          countErrors += 1;
          frameData.processedFrame = frameData.frame;

          framesTimeout.textContent = countErrors;

          frameData.error = true;
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
        (function loadNewFrame(firstFrame) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          const frame = canvas.toDataURL();
          const frameData = {
            frame: frame,
            displayed: false,
            processedFrame: firstFrame ? frame : "",
            error: false,
          };

          getFrameFromAPI(frameData);

          (function loop() {
            const setTimeoutId = setTimeout(() => {
              clearTimeout(setTimeoutId);

              if (frameData.processedFrame || frameData.error) {
                img.src = frameData.processedFrame;
                frameData.displayed = true;
                loadNewFrame();
              } else {
                loop();
              }
            });
          })();
        })(true);
      }, 1000);
    });
})();
