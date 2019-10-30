import React, { Component } from "react";

class Home extends Component {
  state = { started: false };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

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

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    var context = new AudioContext();
    var src = context.createMediaStreamSource(stream);
    var analyser = context.createAnalyser();

    var canvas = this.canvasRef.current;
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

    var barHeight;
    let xCoord = 0;
    let yCoord = 0;
    let angle = 0;
    const radius = 100;
    const rad_step = (Math.PI * 2) / dataArray.length;
    const color = "hsl(180, 80%, 80%)";
    ctx.fillStyle = "hsla(0, 0%, 10%, 0.2)";
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.lineWidth = 1;

    const renderFrame = () => {
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 15;

      ctx.save();
      ctx.translate(WIDTH / 2, HEIGHT / 2);

      for (var i = 0; i < bufferLength; i++) {
        ctx.save();
        xCoord = radius * Math.cos(angle);
        yCoord = radius * Math.sin(angle);
        ctx.translate(xCoord, yCoord);
        ctx.rotate(-Math.PI / 2 + angle);

        barHeight = dataArray[i];

        const lightning = this.createLightning(barHeight, 17, 5, 2.2);
        ctx.beginPath();
        for (var j = 0; j < lightning.length; j++) {
          ctx.lineTo(Math.round(lightning[j].x), Math.round(lightning[j].y));
        }
        ctx.stroke();

        angle += rad_step;

        ctx.restore();
      }

      ctx.restore();
    };
    renderFrame();
  };

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
      <>
        {!this.state.started && (
          <button onClick={this.setUpAudio}>Start!</button>
        )}
        <canvas ref={this.canvasRef}></canvas>
      </>
    );
  }
}

export default Home;
