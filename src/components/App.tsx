import * as React from "react";
import {Coordinates} from "./Coordinates"
import {MandelbrotRenderer} from "../MandelbrotRenderer"
import {FractalRenderer} from "./FractalRenderer"

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
        let mandelbrot = new MandelbrotRenderer(canvas, this.handleCoordinatesUpdate);
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
            <div className="fractal">
                <canvas id="fractal-canvas" height="800" width="800" />
                <Coordinates coordinates={this.state.coordinates} precision={4} />
            </div>
            {/*Temporary: Just to demonstrate rendering and resizing.*/}
            <FractalRenderer className='testCanvas' />
        </div>
        );
    }
}