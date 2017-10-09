import * as React from "react";
import {CanvasComponent} from "./CanvasComponent"
import {FractalStatus} from "./FractalStatus"
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
        console.log(`Start of handleCalculationDone. Value of calculating: ${this.state.calculating}`);
        this.setState({fractalData: fractalData, calculating: false}, this.setImageData);
        console.log(`End of handleCalculationDone. Value of calculating: ${this.state.calculating}`);
    }

    private handleClick = () => {
        console.log(`Start of handleClick. Value of calculating: ${this.state.calculating}`);
        this.setState({calculating: true},
            () => {
                console.log(`Start of callback in handleClick. Value of calculating: ${this.state.calculating}`);
                //TODO: Not sure why this setTimeout is necessary, but without it React doesn't re-render
                //the child components after setting state.calculating to TRUE.
                setTimeout(()=>{this.props.fractalCalculator.calculate(this.handleCalculationDone);}, 0)
                //this.props.fractalCalculator.calculate(this.handleCalculationDone);
                console.log(`End of callback in handleClick. Value of calculating: ${this.state.calculating}`);
            }
        );
        console.log(`End of handleClick. Value of calculating: ${this.state.calculating}`);
    }

    private setImageData = () => {
        console.log(`Start of setImageData. Value of calculating: ${this.state.calculating}`);
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
        console.log(`End of setImageData. Value of calculating: ${this.state.calculating}`);
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
        console.log(`Start of componentDidMount. Value of calculating: ${this.state.calculating}`);
        this.setState({calculating: true},
            () => {
                console.log(`Start of callback in componentDidMount. Value of calculating: ${this.state.calculating}`);
                this.props.fractalCalculator.calculate(this.handleCalculationDone);
                console.log(`End of callback in componentDidMount. Value of calculating: ${this.state.calculating}`);
            }
        );
        console.log(`End of componentDidMount. Value of calculating: ${this.state.calculating}`);
    }

    // shouldComponentUpdate(nextProps:FractalRendererProps, nextState:FractalRendererState){
    //     console.log(`In shouldComponentUpdate. Old calculating: ${this.state.calculating}. Next calculating: ${this.state.calculating}.`);
    //     return this.state.calculating != nextState.calculating;
    // }

    render() {
        console.log(`RENDERING with calculating = ${this.state.calculating}`);
        let status = this.state.calculating ? 'Calculating...' : 'Ready';
        return (
            <div onClick={this.handleClick} >
            <CanvasComponent className={this.props.className} onContextChange={this.handleContext} />
            <FractalStatus status={status} />
            </div>
        );
    }
}