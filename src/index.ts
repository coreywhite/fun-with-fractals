class CanvasDisplay {
    constructor(readonly ctx: CanvasRenderingContext2D, readonly width: number, readonly height: number)
    {
    }
    getImageData(): ImageData {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    render(imgData: ImageData): void {
        this.ctx.putImageData(imgData, 0, 0);
    }
}

class MandelbrotRenderer {
    private _display: CanvasDisplay;
    private _hasDisplay: boolean;
    private readonly fractalWidth: number; 
    private readonly fractalHeight: number;
    private readonly centerX: number;
    private readonly centerY: number;
    private readonly resolution: number;
    private readonly imgData: ImageData;

    constructor(readonly canvas: HTMLCanvasElement) {
        
        //The Mandelbrot set is contained in the closed disk of radius 2 around the origin, so the
        //initial width and height are both 4 and the initial center is at (0, 0) in the complex plane.
        this.fractalWidth = 4;
        this.fractalHeight = 4;
        this.centerX = 0;
        this.centerY = 0;

        //TODO: Extract this to something configurable probably.
        this.resolution = 400;

        if(this.canvas.getContext) {
            this._hasDisplay = true;
            var ctx = this.canvas.getContext("2d");
            this._display = new CanvasDisplay(ctx, this.canvas.width, this.canvas.height);
            this.imgData = this._display.getImageData();
        } else {
            this._hasDisplay = false;
        }
    }
    private updateFractal(): void {
        var data = this.imgData.data;
        for(let i = 0; i < this.imgData.height; i++) {
            for(let j = 0; j < this.imgData.width; j++) {
                if(i >= 100 && i < 200 && j >= 200 && j < 300) {
                    this.setPixel(i, j, 255);
                } else if (i >= 200 && i < 300 && j >= 100 && j < 200) {
                    this.setPixel(i, j, 0);
                } else {
                    this.setPixel(i, j, Math.floor(Math.random() * 256));
                }
            }
        }
    }
    private setPixel(row: number, col: number, value: number) {
        //Image Data is stored in a one-dimensional array as 4 separate values: RGBA
        this.imgData.data[4 * (row * this.imgData.width + col) + 0] = value;    //Red
        this.imgData.data[4 * (row * this.imgData.width + col) + 1] = value;    //Green
        this.imgData.data[4 * (row * this.imgData.width + col) + 2] = value;    //Blue
        this.imgData.data[4 * (row * this.imgData.width + col) + 3] = 255;      //Alpha
    }
    render(): void {
        if(!this._hasDisplay) {
            return;
        }
        this.updateFractal();
        this._display.render(this.imgData);
    }
}

var canvas = <HTMLCanvasElement> document.getElementById('fractal-canvas');
var mandelbrot = new MandelbrotRenderer(canvas);
mandelbrot.render();