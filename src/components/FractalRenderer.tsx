import * as React from "react";
import {CanvasComponent} from "./CanvasComponent"
import {FractalStatus} from "./FractalStatus"
import {IFractalCalculator, IFractalOptions} from "../interfaces/IFractalCalculator"
import {Color} from "../classes/Color"

export interface FractalRendererProps {
    className:string,
    fractalCalculator: IFractalCalculator,
    fractalOptions?: IFractalOptions,
    coordinatesHandler: (coordinates:[number, number]) => void
}

interface FractalRendererState {
    fractalOptions:IFractalOptions,
    ctx:CanvasRenderingContext2D,
    fractalData:number[][],
    imageData:ImageData,
    calculating:boolean
}

export class FractalRenderer extends React.Component<FractalRendererProps, FractalRendererState> {

    constructor(props:FractalRendererProps) {
        super(props);
        this.state = {
            fractalOptions: props.fractalCalculator.getOptions(),
            ctx: null,
            fractalData: [],
            imageData: null,
            calculating:false
        }
    }

    private getFractalCoordinatesAtCanvasCoordinates(canvasCoordinates:[number, number]): [number, number] {
        let canvas = this.state.ctx.canvas;
        let opts = this.state.fractalOptions;
        var x = opts.centerX - (opts.fractalWidth / 2) + canvasCoordinates[0] * opts.fractalWidth / canvas.width;
        var y = opts.centerY + (opts.fractalHeight / 2) - canvasCoordinates[1] * opts.fractalHeight / canvas.height;
        return [x, y];
    }

    private getFractalValueAtImagePosition(imageRow: number, imageCol: number, imgData:ImageData): number  {
        let opts = this.state.fractalOptions;
        let fractalData = this.state.fractalData;
        var fractalRow = Math.floor(imageRow * opts.yResolution / imgData.height);
        var fractalCol = Math.floor(imageCol * opts.xResolution / imgData.width);
        return fractalData[fractalRow][fractalCol];
    }

    private handleContext = (newCtx:CanvasRenderingContext2D) => {
        this.setState({ctx: newCtx, imageData: this.getInitImageData(newCtx)}, this.renderCanvas);
    }

    private handleCalculationDone = (fractalData: number[][]) => {
        console.log(`Start of handleCalculationDone. Value of calculating: ${this.state.calculating}`);
        this.setState({fractalData: fractalData, calculating: false}, this.setImageData);
        console.log(`End of handleCalculationDone. Value of calculating: ${this.state.calculating}`);
    }

    private recenter(newCenter: [number, number], fractalWidth?: number, fractalHeight?: number): void {
        let oldOpts = this.state.fractalOptions;
        let newOpts:IFractalOptions = {
                    ...oldOpts,
                    centerX:newCenter[0],
                    centerY:newCenter[1],
                    fractalWidth:(fractalWidth || oldOpts.fractalWidth),
                    fractalHeight:(fractalHeight || oldOpts.fractalHeight)
        };
        this.setState({calculating: true, fractalOptions: newOpts},
            () => {
                console.log(`Start of callback in recenter. Value of calculating: ${this.state.calculating}`);
                //TODO: Not sure why this setTimeout is necessary, but without it React doesn't re-render
                //the child components after setting state.calculating to TRUE.
                setTimeout(()=>{this.props.fractalCalculator.calculate(this.handleCalculationDone, newOpts);}, 0)
                //this.props.fractalCalculator.calculate(this.handleCalculationDone);
                console.log(`End of callback in recenter. Value of calculating: ${this.state.calculating}`);
            }
        );
    }

    private handleClick = (event: React.MouseEvent<HTMLElement>) => {
        console.log(`Start of handleClick. Value of calculating: ${this.state.calculating}`);
        let oldOpts = this.state.fractalOptions;
        let canvas = this.state.ctx.canvas;
        let rect = canvas.getBoundingClientRect();
        let canvasCoordinates:[number, number] = [event.clientX - rect.left, event.clientY - rect.top];
        let fractalCoordinates = this.getFractalCoordinatesAtCanvasCoordinates(canvasCoordinates);
        this.recenter(fractalCoordinates, oldOpts.fractalWidth / 2, oldOpts.fractalHeight / 2);
        console.log(`End of handleClick. Value of calculating: ${this.state.calculating}`);
    }

    private handleMouseOver = (event: React.MouseEvent<HTMLElement>) => {
        let canvas = this.state.ctx.canvas;
        let rect = canvas.getBoundingClientRect();
        let canvasCoordinates: [number, number] = [event.clientX - rect.left, event.clientY - rect.top];
        if(canvasCoordinates[0] >= 0 && canvasCoordinates[0] <= canvas.width
            && canvasCoordinates[1] >= 0 && canvasCoordinates[1] <= canvas.height) {
            let fractalCoordinates = this.getFractalCoordinatesAtCanvasCoordinates(canvasCoordinates);
            this.props.coordinatesHandler(fractalCoordinates);      
        }
    }

    private setImageData = () => {
        //TODO: Fix handling of issue when fractal x and y resolutions do not match canvas width and height
        console.log(`Start of setImageData. Value of calculating: ${this.state.calculating}`);
        let fractalData = this.state.fractalData;
        let opts = this.state.fractalOptions;
        let ctx = this.state.ctx;
        let imageData = this.getInitImageData(ctx);
        let hist = this.normalizeHist(this.buildHistogram(opts.maxIterations));
        let setPixel = (row:number, col:number, color: Color) => {
            //Image Data is stored in a one-dimensional array as 4 separate values: RGBA
            imageData.data[4 * (row * imageData.width + col) + 0] = color.R; //Red
            imageData.data[4 * (row * imageData.width + col) + 1] = color.G; //Green
            imageData.data[4 * (row * imageData.width + col) + 2] = color.B; //Blue
            imageData.data[4 * (row * imageData.width + col) + 3] = color.A; //Alpha
        }
        for(let row = 0; row < imageData.height; row++) {
            for(let col = 0; col < imageData.width; col++) {
                let val = this.getFractalValueAtImagePosition(row, col, imageData)
                setPixel(row, col, Color.FromHSLA(.5, 1, hist[val]));
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
        let ctx = this.state.ctx;
        let imageData = this.getInitImageData(ctx);
        for(let row = 0; row < imageData.height; row++) {
            for(let col = 0; col < imageData.width; col++) {
                let val = this.getFractalValueAtImagePosition(row, col, imageData);
                hist[val - 1]++;
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
            <div onClick={this.handleClick} onMouseMove={this.handleMouseOver}>
            <CanvasComponent className={this.props.className} onContextChange={this.handleContext} />
            <FractalStatus status={status} />
            </div>
        );
    }
}