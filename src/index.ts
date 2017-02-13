class CanvasDisplay {
    constructor(readonly ctx: CanvasRenderingContext2D, readonly width: number, readonly height: number){}

    getImageData(): ImageData {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    render(imgData: ImageData): void {
        this.ctx.putImageData(imgData, 0, 0);
    }
}

class Color {
    constructor(readonly R: number, readonly G: number, readonly B: number, readonly A: number = 255) {}
}

class MandelbrotRenderer {
    private _display: CanvasDisplay;
    private _hasDisplay: boolean;
    private readonly fractalWidth: number; 
    private readonly fractalHeight: number;
    private readonly centerX: number;
    private readonly centerY: number;
    private readonly maxIterations: number;
    private readonly xResolution: number;
    private readonly yResolution: number;
    private readonly fractalData: number[][];
    private readonly imgData: ImageData;

    constructor(readonly canvas: HTMLCanvasElement) {
        
        //The Mandelbrot set is contained in the closed disk of radius 2 around the origin, so the
        //initial width and height are both 4 and the initial center is at (0, 0) in the complex plane.
        this.fractalWidth = 4.0;
        this.fractalHeight = 4.0;
        this.centerX = 0;
        this.centerY = 0;

        //TODO: Extract this to something configurable probably.
        this.maxIterations = 1000;
        this.xResolution = 800;
        this.yResolution = 800;
        this.fractalData = new Array<Array<number>>(this.yResolution);
        for(let i = 0; i < this.yResolution; i++) {
            this.fractalData[i] = new Array<number>(this.xResolution);
        }

        if(this.canvas.getContext) {
            this._hasDisplay = true;
            var ctx = this.canvas.getContext("2d");
            this._display = new CanvasDisplay(ctx, this.canvas.width, this.canvas.height);
            this.imgData = this._display.getImageData();
        } else {
            this._hasDisplay = false;
        }
    }
    private calculateFractal(): void {
        var data = this.imgData.data;
        var x_init, y_init, x, y, x_temp, iteration: number;
        for(let row = 0; row < this.yResolution; row++) {
            for(let col = 0; col < this.xResolution; col++) {
                iteration = 0;
                x_init = this.centerX - (this.fractalWidth / 2) + col * (this.fractalWidth / this.xResolution);
                y_init = this.centerY + (this.fractalHeight / 2) - row * (this.fractalHeight / this.yResolution);
                x = y = 0;
                while(x*x + y*y < 2*2 && iteration < this.maxIterations) {
                    x_temp = x*x - y*y + x_init;
                    y = 2*x*y + y_init;
                    x = x_temp;
                    iteration++;
                }
                this.fractalData[row][col] = iteration;
            }
        }
    }
    private getFractalValueAtImagePosition(imageRow: number, imageCol: number): number  {
        var fractalRow = Math.floor(imageRow * this.yResolution / this.imgData.height);
        var fractalCol = Math.floor(imageCol * this.xResolution / this.imgData.width);
        return this.fractalData[fractalRow][fractalCol];
    }
    private setPixel(row: number, col: number, color: Color): void {
        //Image Data is stored in a one-dimensional array as 4 separate values: RGBA
        this.imgData.data[4 * (row * this.imgData.width + col) + 0] = color.R;    //Red
        this.imgData.data[4 * (row * this.imgData.width + col) + 1] = color.G;        //Green
        this.imgData.data[4 * (row * this.imgData.width + col) + 2] = color.B;        //Blue
        this.imgData.data[4 * (row * this.imgData.width + col) + 3] = color.A;      //Alpha
    }
    private mapColor(fractalValue: number): Color {
        if(fractalValue == this.maxIterations) {
            return new Color(0, 0, 0);
        } else {
            return new Color(Math.min(255, (fractalValue - 1) * 20), 0, 0);
        }
    }
    render(): void {
        if(!this._hasDisplay) {
            return;
        }
        this.calculateFractal();
        for(let i = 0; i < this.imgData.height; i++) {
            for(let j = 0; j < this.imgData.width; j++) {
                var fractalValue = this.getFractalValueAtImagePosition(i, j);
                this.setPixel(i, j, this.mapColor(fractalValue));
            }
        }
        this._display.render(this.imgData);
    }
}

var canvas = <HTMLCanvasElement> document.getElementById('fractal-canvas');
var mandelbrot = new MandelbrotRenderer(canvas);
mandelbrot.render();