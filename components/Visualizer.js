import React, { Component } from "react";

class Home extends Component {
  state = { started: false };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.audioRef = React.createRef();
  }

  setUpAudio = () => {
    if (!(this.canvasRef.current && this.audioRef.current)) return;
    this.setState({ started: true });
    const audio = this.audioRef.current;
    audio.load();
    audio.play();
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();

    var canvas = this.canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(
      new Uint8Array(bufferLength).reduce((accum, buff, i) => {
        if (i % 3) return [...accum, buff];

        return accum;
      }, [])
    );
    console.log(bufferLength, dataArray.length);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barHeight;
    let xCoord = 0;
    let yCoord = 0;
    let angle = 0;
    const radius = 100;
    const circunference = Math.PI * radius * 2;
    const rad_step = (Math.PI * 2) / dataArray.length;
    const barWidth = circunference / dataArray.length;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      angle = 0;
      xCoord = 0;
      yCoord = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.save();
      ctx.translate(WIDTH / 2, HEIGHT / 2);

      for (var i = 0; i < bufferLength; i++) {
        ctx.save();
        xCoord = radius * Math.cos(angle);
        yCoord = radius * Math.sin(angle);
        ctx.translate(xCoord, yCoord);

        barHeight = dataArray[i];

        var r = barHeight + 25 * (i / bufferLength);
        var g = 250 * (i / bufferLength);
        var b = 50;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.rotate(-Math.PI / 2 + angle);
        ctx.fillRect(0, 0, barWidth, barHeight);

        angle += rad_step;

        ctx.restore();
      }

      ctx.restore();
    }

    audio.play();
    renderFrame();
  };

  render() {
    return (
      <>
        {!this.state.started && (
          <button onClick={this.setUpAudio}>Start!</button>
        )}
        <canvas ref={this.canvasRef}></canvas>
        <audio
          src="/bohemian.mp3"
          onLoad={this.setUpAudio}
          ref={this.audioRef}
        ></audio>
      </>
    );
  }
}

export default Home;
