import { useEffect } from 'react';

export default function HeygenAvatar() {
  useEffect(() => {
    const host = "https://labs.heygen.com";
    const url = host + "/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJBbm5fRG9jdG9yX1NpdHRpbmdfcHVibGlj%0D%0AIiwicHJldmlld0ltZyI6Imh0dHBzOi8vZmlsZXMyLmhleWdlbi5haS9hdmF0YXIvdjMvMjZkZTM2%0D%0AOWIyZDQ0NDNlNTg2ZGVkZjI3YWYxZTBjMWRfNDU1NzAvcHJldmlld190YWxrXzEud2VicCIsIm5l%0D%0AZWRSZW1vdmVCYWNrZ3JvdW5kIjpmYWxzZSwia25vd2xlZGdlQmFzZUlkIjoiZmRjOTdhNzc1NDk5%0D%0ANDM5Yjk2NzVmZWU5YmNkMWViYWMiLCJ1c2VybmFtZSI6ImFmNmVkN2Q3M2QxOTQ3MWFhOWIyNDEw%0D%0AODA4YTBkZWM4In0%3D&inIFrame=1";
    const clientWidth = document.body.clientWidth;

    const wrapDiv = document.createElement("div");
    wrapDiv.id = "heygen-streaming-embed";

    const container = document.createElement("div");
    container.id = "heygen-streaming-container";

    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `
      #heygen-streaming-embed {
        z-index: 9999;
        position: fixed;
        left: 40px;
        bottom: 40px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.12);
        transition: all linear 0.1s;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
      }
      #heygen-streaming-embed.show {
        opacity: 1;
        visibility: visible;
      }
      #heygen-streaming-embed.expand {
        ${clientWidth < 540
          ? "height: 266px; width: 96%; left: 50%; transform: translateX(-50%);"
          : "height: 366px; width: calc(366px * 16 / 9);"}
        border: 0;
        border-radius: 8px;
      }
      #heygen-streaming-container {
        width: 100%;
        height: 100%;
      }
      #heygen-streaming-container iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }
    `;

    const iframe = document.createElement("iframe");
    iframe.allowFullscreen = false;
    iframe.title = "Streaming Embed";
    iframe.role = "dialog";
    iframe.allow = "microphone";
    iframe.src = url;

    let visible = false;
    let initial = false;

    const messageHandler = (e: MessageEvent) => {
      if (e.origin === host && e.data && e.data.type && e.data.type === "streaming-embed") {
        if (e.data.action === "init") {
          initial = true;
          wrapDiv.classList.toggle("show", initial);
        } else if (e.data.action === "show") {
          visible = true;
          wrapDiv.classList.toggle("expand", visible);
        } else if (e.data.action === "hide") {
          visible = false;
          wrapDiv.classList.toggle("expand", visible);
        }
      }
    };

    window.addEventListener("message", messageHandler);

    container.appendChild(iframe);
    wrapDiv.appendChild(stylesheet);
    wrapDiv.appendChild(container);
    document.body.appendChild(wrapDiv);

    return () => {
      window.removeEventListener("message", messageHandler);
      if (document.body.contains(wrapDiv)) {
        document.body.removeChild(wrapDiv);
      }
    };
  }, []);

  return null;
}
