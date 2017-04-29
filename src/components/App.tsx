import * as React from "react";
import { MandelbrotRenderer } from "../MandelbrotRenderer"

export interface AppState {coordinates: [number, number]}

export class App extends React.Component<undefined, AppState> {
    constructor(props:any) {
        super(props);
        this.state = {
            coordinates: [0, 0]
        }
    }
    handleCoordinatesUpdate = (coordinates:[number, number]) => {
        this.setState({coordinates: coordinates});
    }
    componentDidMount() {
        let canvas = document.getElementById("fractal-canvas") as HTMLCanvasElement;
        let coordinates = document.getElementById("coordinates");
        let mandelbrot = new MandelbrotRenderer(canvas, this.handleCoordinatesUpdate);
        mandelbrot.render();
        canvas.addEventListener("click", mandelbrot.handleClick);
        canvas.addEventListener("mousemove", mandelbrot.handleMouseOver);
        canvas.oncontextmenu = (e: MouseEvent) => {
            e.preventDefault();
            mandelbrot.handleClick(e, true);
        };
    }
    getCoordinatesString = (): string => {
        return `(${this.state.coordinates[0].toFixed(4)},${this.state.coordinates[1].toFixed(4)})`;
    }
    render() {
        let coordinatesDisplay = this.getCoordinatesString();
        return (
        <div className="content">
            <canvas id="fractal-canvas" height="800" width="800" />
            <div id="coordinates" className="coordinates">{coordinatesDisplay}</div>
        </div>
        );
    }
}