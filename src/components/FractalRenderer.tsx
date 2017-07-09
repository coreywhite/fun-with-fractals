import * as React from "react";
import {CanvasComponent} from "./CanvasComponent"
import {IFractalCalculator} from "../interfaces/IFractalCalculator"
import {Color} from "../classes/Color"

export interface FractalRendererProps {
    className:string,
    fractalCalculator: IFractalCalculator
}

interface FractalRendererState {
    ctx:CanvasRenderingContext2D,
    fractalData:number[][],
    imageData:ImageData,
    calculating:boolean
}

export class FractalRenderer extends React.Component<FractalRendererProps, FractalRendererState> {

    constructor(props:FractalRendererProps) {
        super(props);
        this.state = {
            ctx: null,
            fractalData: [],
            imageData: null,
            calculating:false
        }
    }

    private handleContext = (newCtx:CanvasRenderingContext2D) => {
        this.setState({ctx: newCtx, imageData: this.getInitImageData(newCtx)}, this.renderCanvas);
    }

    private handleCalculationDone = (fractalData: number[][]) => {
        this.setState({fractalData: fractalData, calculating: false}, this.setImageData);
    }

    private handleClick = () => {
        this.props.fractalCalculator.calculate(this.handleCalculationDone);
        this.setState({calculating: true});
    }

    private setImageData = () => {
        let fractalData = this.state.fractalData;
        let ctx = this.state.ctx;
        let imageData = this.getInitImageData(ctx);
        let hist = this.normalizeHist(this.buildHistogram(3000));
        let setPixel = (row:number, col:number, color: Color) => {
            //Image Data is stored in a one-dimensional array as 4 separate values: RGBA
            imageData.data[4 * (row * imageData.width + col) + 0] = color.R; //Red
            imageData.data[4 * (row * imageData.width + col) + 1] = color.G; //Green
            imageData.data[4 * (row * imageData.width + col) + 2] = color.B; //Blue
            imageData.data[4 * (row * imageData.width + col) + 3] = color.A; //Alpha
        }
        for(let i = 0; i < fractalData.length; i++) {
            for(let j = 0; j < fractalData[0].length; j++) {
                setPixel(i, j, Color.FromHSLA(.5, 1, hist[fractalData[i][j]]));
            }
        }
        this.setState({imageData: imageData}, this.renderCanvas);
    }

    private getInitImageData = (ctx: CanvasRenderingContext2D) => {
        if(this.state.ctx) {
            return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        return new ImageData(100, 100);
    }

    private renderCanvas = () => {
        let ctx = this.state.ctx;
        let imageData = this.state.imageData;
        ctx.putImageData(imageData, 0, 0);
    }

    private buildHistogram = (maxIterations:number) => {
        let hist:Array<number> = Array.apply(null, Array(maxIterations)).map(Number.prototype.valueOf,0);
        for(let row = 0; row < this.state.fractalData.length; row++) {
            for(let col = 0; col < this.state.fractalData[0].length; col++) {
                hist[this.state.fractalData[row][col] - 1]++;
            }
        }
        return hist;
    }

    private normalizeHist = (hist: number[]) => {
        let totalIter = hist.reduce((a,b)=>a+b,0);
        let cumIter = 0;
        let norm = new Array<number>(hist.length);

        for(let i = 0; i < hist.length; i++) {
            cumIter += hist[i];
            norm[i] = cumIter / totalIter;
        }
        return norm;
    }

    private mapColor(fractalValue: number, hist: number[]): Color {
        return Color.FromHSLA(.5, 1, hist[fractalValue]);
    }

    componentDidMount() {
        this.props.fractalCalculator.calculate(this.handleCalculationDone);
        this.setState({calculating: true});
    }

    render() {
        return (
            <div onClick={this.handleClick} >
            <CanvasComponent className={this.props.className} onContextChange={this.handleContext} />
            {this.state.calculating && <p className = 'coordinates'>Calculating...</p>}
            </div>
        );
    }
}