import * as React from "react";
import { MandelbrotRenderer } from "../MandelbrotRenderer"

export class App extends React.Component<undefined, undefined> {
    componentDidMount() {
        let canvas = document.getElementById("fractal-canvas") as HTMLCanvasElement;
        let coordinates = document.getElementById("coordinates");
        let mandelbrot = new MandelbrotRenderer(canvas, coordinates);
        mandelbrot.render();
        canvas.addEventListener("click", mandelbrot.handleClick);
        canvas.addEventListener("mousemove", mandelbrot.handleMouseOver);
        canvas.oncontextmenu = (e: MouseEvent) => {
            e.preventDefault();
            mandelbrot.handleClick(e, true);
        };
    }
    render() {
        return (
        <div className="content">
            <canvas id="fractal-canvas" height="800" width="800" />
            <div id="coordinates"></div>
        </div>
        );
    }
}