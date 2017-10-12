import {Color} from "./Color"
import {IFractalOptions, IFractalCalculator} from "../interfaces/IFractalCalculator"

export interface MandelbrotOptions extends IFractalOptions {
    fractalWidth?: number,
    fractalHeight?: number,
    centerX?:number,
    centerY?:number,
    xResolution?:number,
    yResolution?:number,
    maxIterations?:number
}

//The Mandelbrot set is contained in the closed disk of radius 2 around the origin, so the
//initial width and height are both 4 and the initial center is at (0, 0) in the complex plane.
const defaultOptions:MandelbrotOptions = {
    fractalWidth: 4.0,
    fractalHeight: 4.0,
    centerX: 0.0,
    centerY: 0.0,
    xResolution: 800,
    yResolution: 800,
    maxIterations: 3000
}

export class MandelbrotCalculator implements IFractalCalculator{
    public isCalculating: boolean;
    private fractalWidth: number; 
    private fractalHeight: number;
    private centerX: number;
    private centerY: number;
    private maxIterations: number;
    private xResolution: number;
    private yResolution: number;
    private fractalData: number[][];

    private options: MandelbrotOptions;

    constructor(options?:MandelbrotOptions) {
        this.isCalculating = false;
        this.options = {};
        this.setOptions(defaultOptions);
        if(options !== undefined) {
            this.setOptions(options);
        }
    }

    public getOptions() {
        return this.options;
    }

    public setOptions(newOpts:MandelbrotOptions) {
        let resolutionChanged = false;
        if(newOpts.xResolution !== undefined && (this.options.xResolution === undefined || newOpts.xResolution !== this.options.xResolution)) {
            resolutionChanged = true;
        }
        if(newOpts.yResolution !== undefined && (this.options.yResolution === undefined || newOpts.yResolution !== this.options.yResolution)) {
            resolutionChanged = true;
        }
        this.options = {...this.options, ...newOpts};
        //If required, re-build the fractalData array
        if(resolutionChanged) {
            this.fractalData = new Array<Array<number>>(this.options.yResolution);
            for(let i = 0; i < this.options.yResolution; i++) {
                this.fractalData[i] = new Array<number>(this.options.xResolution);
            }
        }
    }


    public calculate(calculationDoneCallback:(fractal:number[][])=>void,
                    options?:IFractalOptions,
                    approximationDoneCallback?:(fractal:number[][])=>void,
                    lineCallback?:(rowIndex:number, fractalRow:number[])=>void):void                    
    {
        this.isCalculating = true;
        if(options !== undefined) {
            this.setOptions(options);
        }
        //TODO: Implement approximationDoneCallback and lineCallback
        this.calculateFractal();
        this.isCalculating = false;
        calculationDoneCallback(this.fractalData);
    }
    private calculateFractal(): void {
        let x_init:number, y_init:number, x:number, y:number,
            x_temp:number, y_temp:number, iteration: number;
        let width = this.options.fractalWidth;
        let height = this.options.fractalHeight;
        let centerX = this.options.centerX;
        let centerY = this.options.centerY;
        let xRes = this.options.xResolution;
        let yRes = this.options.yResolution;
        let maxIterations = this.options.maxIterations;

        for(let row = 0; row < yRes; row++) {
            for(let col = 0; col < xRes; col++) {
                iteration = 0;
                x_init = centerX - (width / 2) + col * (width / xRes);
                y_init = centerY + (height / 2) - row * (height / yRes);
                x = y = 0;
                while(x*x + y*y < 2*2 && iteration < maxIterations) {
                    x_temp = x*x - y*y + x_init;
                    y_temp = 2*x*y + y_init;
                    if(x == x_temp && y == y_temp) {
                        //Exit early if Z_k+1 = Z_k.
                        iteration = maxIterations;
                        break;
                    }
                    x = x_temp;
                    y = y_temp;
                    iteration++;
                }
                this.fractalData[row][col] = iteration;
            }
        }
    }

}