import {Color} from "./Color"
import {IFractalCalculator} from "../interfaces/IFractalCalculator"

export class MandelbrotCalculator implements IFractalCalculator{
    public isCalculating: boolean;
    private fractalWidth: number; 
    private fractalHeight: number;
    private centerX: number;
    private centerY: number;
    private readonly maxIterations: number;
    private readonly xResolution: number;
    private readonly yResolution: number;
    private readonly fractalData: number[][];

    constructor() {
        //The Mandelbrot set is contained in the closed disk of radius 2 around the origin, so the
        //initial width and height are both 4 and the initial center is at (0, 0) in the complex plane.
        this.fractalWidth = 4.0;
        this.fractalHeight = 4.0;
        this.centerX = 0;
        this.centerY = 0;
        this.isCalculating = false;

        //TODO: Extract this to something configurable probably.
        this.maxIterations = 3000;
        this.xResolution = 800;
        this.yResolution = 800;
        this.fractalData = new Array<Array<number>>(this.yResolution);
        for(let i = 0; i < this.yResolution; i++) {
            this.fractalData[i] = new Array<number>(this.xResolution);
        }
    }
    public calculate(calculationDoneCallback:(fractal:number[][])=>void,
                    approximationDoneCallback?:(fractal:number[][])=>void,
                    lineCallback?:(rowIndex:number, fractalRow:number[])=>void):void {
        
        this.isCalculating = true;
        //TODO: Implement approximationDoneCallback and lineCallback
        this.calculateFractal();
        this.isCalculating = false;
        calculationDoneCallback(this.fractalData);
    }
    private calculateFractal(): void {
        var x_init, y_init, x, y, x_temp, y_temp, iteration: number;
        for(let row = 0; row < this.yResolution; row++) {
            for(let col = 0; col < this.xResolution; col++) {
                iteration = 0;
                x_init = this.centerX - (this.fractalWidth / 2) + col * (this.fractalWidth / this.xResolution);
                y_init = this.centerY + (this.fractalHeight / 2) - row * (this.fractalHeight / this.yResolution);
                x = y = 0;
                while(x*x + y*y < 2*2 && iteration < this.maxIterations) {
                    x_temp = x*x - y*y + x_init;
                    y_temp = 2*x*y + y_init;
                    if(x == x_temp && y == y_temp) {
                        //Exit early if Z_k+1 = Z_k.
                        iteration = this.maxIterations;
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