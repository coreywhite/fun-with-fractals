import * as React from "react";
import {Coordinates} from "./Coordinates"
import {MandelbrotRenderer} from "../MandelbrotRenderer"
import {FractalRenderer} from "./FractalRenderer"
import {IFractalCalculator, IFractalOptions} from "../interfaces/IFractalCalculator"
import {MandelbrotCalculator} from "../classes/MandelbrotCalculator"

export interface AppState {
    fractalCalculator:IFractalCalculator,
    coordinates:[number, number]
};

export class App extends React.Component<undefined, AppState> {
    constructor(props:any) {
        super(props);
        let mandelbrot = new MandelbrotCalculator();
        this.state = {
            fractalCalculator: mandelbrot,
            coordinates: [0, 0]
        }
    }
    handleCoordinatesUpdate = (coordinates:[number, number]) => {
        this.setState({coordinates: coordinates});
    }
    componentDidMount() {
        // let canvas = document.getElementById("fractal-canvas") as HTMLCanvasElement;
        // let mandelbrot = new MandelbrotRenderer(canvas, this.handleCoordinatesUpdate);
        // mandelbrot.render();
        // canvas.addEventListener("click", mandelbrot.handleClick);
        // canvas.addEventListener("mousemove", mandelbrot.handleMouseOver);
        // canvas.oncontextmenu = (e: MouseEvent) => {
        //     e.preventDefault();
        //     mandelbrot.handleClick(e, true);
        // };
    }
    render() {
        return (
        <div className="content">
            <div className="fractal">
                <FractalRenderer className='testCanvas'
                    fractalCalculator={this.state.fractalCalculator}
                    coordinatesHandler={this.handleCoordinatesUpdate} />
                <Coordinates coordinates={this.state.coordinates} precision={4} />
            </div>
        </div>
        );
    }
}