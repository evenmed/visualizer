import React, { Component } from "react";
import styled from "styled-components";

const StyledWrap = styled.div`
  canvas {
    cursor: none;
  }
`;
class Home extends Component {
  state = { started: false, mode: "radial", color: "hsl(180, 80%, 80%)" };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("keypress", this.handleKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.handleKeyPress);
  }

  handleKeyPress = ({ keyCode: key }) => {
    if (key == 49) this.setState({ mode: "radial" });
    else if (key == 50) this.setState({ mode: "top" });
    else if (key == 51) this.setState({ mode: "bottom" });
    else if (key == 52) this.setState({ mode: "mix" });
    else if (key == 53) this.setState({ mode: "mix2" });
    else if (key == 103 || key == 71)
      // Green
      this.setState({ color: "hsl(125, 100%, 73%)" });
    else if (key == 119 || key == 88)
      // White (original)
      this.setState({ color: "hsl(180, 80%, 80%)" });
    else if (key == 114 || key == 82)
      // Red
      this.setState({ color: "hsl(0, 100%, 77%)" });
    else if (key == 98 || key == 66)
      // Blue
      this.setState({ color: "hsl(190, 100%, 75%)" });
    else if (key == 112 || key == 80)
      // Purple
      this.setState({ color: "hsl(250, 100%, 75%)" });
    else if (key == 121 || key == 89)
      // Yellow
      this.setState({ color: "hsl(55, 100%, 75%)" });
  };

  setUpAudio = async () => {
    if (!this.canvasRef.current) return;

    const AudioContext =
      window.AudioContext || // Default
      window.webkitAudioContext || // Safari and old versions of Chrome
      false;

    if (!AudioContext) {
      alert("Your browser doesn't support the features needed for this");
      return;
    }

    this.setState({ started: true });

    window.focus();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    var context = new AudioContext();
    var src = context.createMediaStreamSource(stream);
    var analyser = context.createAnalyser();

    var canvas = this.canvasRef.current;
    if (canvas.requestFullscreen) {
      await canvas.requestFullscreen();
    } else if (canvas.msRequestFullscreen) {
      await canvas.msRequestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
      await canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) {
      await canvas.webkitRequestFullscreen();
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    src.connect(analyser);

    analyser.fftSize = 128;

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    let barHeight;
    let xCoord = 0;
    let yCoord = 0;
    let angle = -Math.PI / 2;
    const radius = 100;
    const rad_step = (Math.PI * 2) / dataArray.length;
    const img = new Image();
    img.src = "/space.jpeg";
    ctx.fillStyle = "hsla(0, 0%, 5%, 0.2)";
    ctx.lineWidth = 1;

    const renderFrame = () => {
      const { color, mode } = this.state;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 15;

      ctx.save();
      if (mode === "radial") {
        ctx.translate(WIDTH / 2, HEIGHT / 2);

        for (var i = 0; i < bufferLength; i++) {
          ctx.save();
          xCoord = radius * Math.cos(angle);
          yCoord = radius * Math.sin(angle);
          ctx.translate(xCoord, yCoord);
          ctx.rotate(-Math.PI / 2 + angle);

          barHeight = dataArray[i];

          const lightning = this.createLightning(
            barHeight,
            barHeight / 8,
            5,
            2.2
          );
          ctx.beginPath();
          for (var j = 0; j < lightning.length; j++) {
            ctx.lineTo(Math.round(lightning[j].x), Math.round(lightning[j].y));
          }
          ctx.stroke();

          angle += rad_step;

          ctx.restore();
        }
      } else if (mode === "top") {
        const barWidth = WIDTH / bufferLength;
        xCoord = 0;
        yCoord = 0;

        for (var i = 0; i < bufferLength; i++) {
          ctx.save();
          ctx.translate(xCoord, yCoord);

          barHeight = dataArray[i] * 2;

          const lightning = this.createLightning(
            barHeight,
            barHeight / 8,
            5,
            2.2
          );
          ctx.beginPath();
          for (var j = 0; j < lightning.length; j++) {
            ctx.lineTo(Math.round(lightning[j].x), Math.round(lightning[j].y));
          }
          ctx.stroke();

          xCoord += barWidth;

          ctx.restore();
        }
      } else if (mode === "bottom") {
        const barWidth = WIDTH / bufferLength;
        xCoord = 0;
        yCoord = HEIGHT;

        for (var i = 0; i < bufferLength; i++) {
          ctx.save();
          ctx.translate(xCoord, yCoord);

          barHeight = dataArray[i] * 2;

          const lightning = this.createLightning(
            barHeight,
            barHeight / 8,
            5,
            2.2
          );
          ctx.rotate(Math.PI);
          ctx.beginPath();
          for (var j = 0; j < lightning.length; j++) {
            ctx.lineTo(Math.round(lightning[j].x), Math.round(lightning[j].y));
          }
          ctx.stroke();

          xCoord += barWidth;

          ctx.restore();
        }
      } else if (mode === "mix") {
        const barWidth = WIDTH / bufferLength;
        xCoord = 0;
        yCoord = HEIGHT;

        for (var i = 0; i < bufferLength; i++) {
          ctx.save();
          ctx.translate(xCoord, yCoord);

          barHeight = dataArray[i] * 2;

          const lightning = this.createLightning(
            barHeight,
            barHeight / 8,
            5,
            2.2
          );
          if (i % 2 === 0) {
            ctx.rotate(Math.PI);
          } else {
            ctx.translate(0, -HEIGHT);
          }
          ctx.beginPath();
          for (var j = 0; j < lightning.length; j++) {
            ctx.lineTo(Math.round(lightning[j].x), Math.round(lightning[j].y));
          }
          ctx.stroke();

          xCoord += barWidth;

          ctx.restore();
        }
      } else if (mode === "mix2") {
        const barWidth = HEIGHT / bufferLength;
        xCoord = 0;
        yCoord = 0;

        for (var i = 0; i < bufferLength; i++) {
          ctx.save();
          ctx.translate(xCoord, yCoord);

          barHeight = dataArray[i] * 3;

          const lightning = this.createLightning(
            barHeight,
            barHeight / 8,
            5,
            2.2
          );
          if (i % 2 === 0) {
            ctx.rotate(-Math.PI / 2);
          } else {
            ctx.translate(WIDTH, 0);
            ctx.rotate(Math.PI / 2);
          }
          ctx.beginPath();
          for (var j = 0; j < lightning.length; j++) {
            ctx.lineTo(Math.round(lightning[j].x), Math.round(lightning[j].y));
          }
          ctx.stroke();

          yCoord += barWidth;

          ctx.restore();
        }
      }

      ctx.restore();
    };
    renderFrame();
  };

  updateCanvas = () => {};

  createLightning = (height, maxDifference, minSegmentHeight, roughness) => {
    // The main segment's height
    var segmentHeight = height - 20;
    var lightning = [];
    // The start and the end position of the lightning.
    lightning.push({ x: 0, y: 0 });
    lightning.push({
      x: maxDifference * (0.5 - Math.random()),
      y: height + maxDifference * (0.5 - Math.random()),
    });
    // This is important so we don't change the global one.
    var currDiff = maxDifference;
    while (segmentHeight > minSegmentHeight) {
      // This uses the double buffering pattern
      var newSegments = [];
      for (var i = 0; i < lightning.length - 1; i++) {
        // The start and the end position of the current segment
        var start = lightning[i];
        var end = lightning[i + 1];
        // "midX" is the average X position of the segment
        var midX = (start.x + end.x) / 2;
        var newX = midX + (Math.random() * 2 - 1) * currDiff;
        // Add the start and the middle point to the new segment list
        // Because the end position is going to be added again in the next iteration
        // we don't need to add that here.
        newSegments.push(start, { x: newX, y: (start.y + end.y) / 2 });
      }
      // Add the last point of the lightning to the segments.
      newSegments.push(lightning.pop());
      lightning = newSegments;

      currDiff /= roughness;
      segmentHeight /= 2;
    }
    return lightning;
  };

  render() {
    return (
      <StyledWrap>
        {!this.state.started && (
          <button onClick={this.setUpAudio}>Start!</button>
        )}
        <canvas ref={this.canvasRef}></canvas>
      </StyledWrap>
    );
  }
}

export default Home;
