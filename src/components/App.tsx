import * as React from "react";
import {Coordinates} from "./Coordinates"
import {MandelbrotRenderer} from "../MandelbrotRenderer"
import {CanvasComponent} from "./CanvasComponent"

const testDraw = (ctx:CanvasRenderingContext2D) => {
    let height = ctx.canvas.height;
    let width = ctx.canvas.width;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(0,200,0)';
    if(width < 800) {
        ctx.fillStyle = 'rgb(200, 0, 0)';
    }
    ctx.fillRect(10, 10, width - 20, height - 20);
}

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
            <CanvasComponent className='testCanvas' onContextChange={testDraw} />
        </div>
        );
    }
}