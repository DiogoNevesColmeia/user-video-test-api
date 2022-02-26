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
  let countAlternateFrame = 0;
  let responseTime = 0;

  function getFrameFromAPI(frameData) {
    if (window.$) {
      const now = new Date().getTime();
      const ajaxConfig = {
        url: "http://colmeia-cameras-flask.herokuapp.com/facial_recognition",
        // http://focal-column-339522.rj.r.appspot.com/facial_recognition
        method: "POST",
        data: {
          type: "b64",
          url: frameData.frame.split("data:image/png;base64,")[1],
        },
        success: function (data) {
          if (!frameData.displayed) {
            frameData.processedFrame = data.image_response;
          }
          responseTime += new Date().getTime() - now;

          framesResponse.textContent =
            Math.round(responseTime / countSuccess) + "ms";

          countSuccess += 1;
          framesProcessed.textContent = countSuccess;
        },
        error: function () {
          countErrors += 1;
          frameData.processedFrame = frameData.frame;

          framesTimeout.textContent = countErrors;

          frameData.error = true;
        },
      };

      if (countAlternateFrame <= 4) {
        ajaxConfig.timeout = 300;
      } else {
        countAlternateFrame = 0;
      }

      window.$.ajax(ajaxConfig);
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
                countAlternateFrame += 1;
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
