export class CanvasDisplay {
    constructor(readonly ctx: CanvasRenderingContext2D, readonly width: number, readonly height: number){}

    getImageData(): ImageData {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    render(imgData: ImageData): void {
        this.ctx.putImageData(imgData, 0, 0);
    }
}

export class Color {
    constructor(readonly R: number, readonly G: number, readonly B: number, readonly A: number = 255) {}

    public static FromHSLA(H: number, S: number, L: number, A: number = 255): Color {
        let rgb = Color.hslToRgb(H, S, L);
        return new Color(rgb[0], rgb[1], rgb[2], A);
    }

    //HSL -> RGB Algorithm from https://gist.github.com/mjackson/5311256
    private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;

            r = this.hue2rgb(p, q, h + 1/3);
            g = this.hue2rgb(p, q, h);
            b = this.hue2rgb(p, q, h - 1/3);
        }

        return [ r * 255, g * 255, b * 255 ];
    }    
    private static hue2rgb(p: number, q: number, t: number): number {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }
}

export class MandelbrotRenderer {
    private _display: CanvasDisplay;
    private _hasDisplay: boolean;
    private fractalWidth: number; 
    private fractalHeight: number;
    private centerX: number;
    private centerY: number;
    private readonly maxIterations: number;
    private readonly xResolution: number;
    private readonly yResolution: number;
    private readonly fractalData: number[][];
    private readonly imgData: ImageData;

    constructor(readonly canvas: HTMLCanvasElement, readonly coordinatesDisplay: HTMLElement) {
        
        //The Mandelbrot set is contained in the closed disk of radius 2 around the origin, so the
        //initial width and height are both 4 and the initial center is at (0, 0) in the complex plane.
        this.fractalWidth = 4.0;
        this.fractalHeight = 4.0;
        this.centerX = 0;
        this.centerY = 0;

        //TODO: Extract this to something configurable probably.
        this.maxIterations = 3000;
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

    private getFractalCoordinatesAtCanvasCoordinates(canvasCoordinates:[number, number]): [number, number] {
        var x = this.centerX - (this.fractalWidth / 2) + canvasCoordinates[0] * this.fractalWidth / this.canvas.width;
        var y = this.centerY + (this.fractalHeight / 2) - canvasCoordinates[1] * this.fractalHeight / this.canvas.height;
        return [x, y];
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

    private buildHistogram(): number[] {
        // let hist = new Array<number>(this.maxIterations).map(()=>0);
        let hist:Array<number> = Array.apply(null, Array(this.maxIterations)).map(Number.prototype.valueOf,0);
        // let hist = new Array<number>(this.maxIterations);
        // for(let i = 0; i < hist.length; i++) {
        //     hist[i] = 0;
        // }
        for(let row = 0; row < this.yResolution; row++) {
            for(let col = 0; col < this.xResolution; col++) {
                hist[this.fractalData[row][col] - 1]++;
            }
        }
        return hist;
    }

    private normalizeHist(hist: number[]): number[] {
        let totalIter = hist.reduce((a,b)=>a+b,0);
        // for(let i = 0; i < hist.length; i++) {
        //     totalIter += hist[i];
        // }
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
        // if(fractalValue == this.maxIterations) {
        //     return Color.FromHSLA(.5, 1, 0)
        // } else {
        //     return Color.FromHSLA(.5, 1, hist[fractalValue]);
        // }
    }

    render(): void {
        if(!this._hasDisplay) {
            return;
        }
        this.calculateFractal();
        let hist = this.normalizeHist(this.buildHistogram());
        for(let i = 0; i < this.imgData.height; i++) {
            for(let j = 0; j < this.imgData.width; j++) {
                var fractalValue = this.getFractalValueAtImagePosition(i, j);
                this.setPixel(i, j, this.mapColor(fractalValue, hist));
            }
        }
        this._display.render(this.imgData);
    }

    recenter(newCenter: [number, number], fractalWidth?: number, fractalHeight?: number): void {
        this.centerX = newCenter[0];
        this.centerY = newCenter[1];
        this.fractalWidth = fractalWidth || this.fractalWidth;
        this.fractalHeight = fractalHeight || this.fractalHeight;
        
        this.render();
    }

    displayCoordinates(coordinates: [number, number]): void {
        this.coordinatesDisplay.innerHTML = `(${coordinates[0].toFixed(4)},${coordinates[1].toFixed(4)})`;
    }

    handleMouseOver = (event: MouseEvent) => {
        var rect = this.canvas.getBoundingClientRect();
        var canvasCoordinates: [number, number] = [event.clientX - rect.left, event.clientY - rect.top];
        var fractalCoordinates = this.getFractalCoordinatesAtCanvasCoordinates(canvasCoordinates);
        
        this.displayCoordinates(fractalCoordinates);        
    }

    handleClick = (event: MouseEvent, isRightClick: boolean = false) => {
        var rect = this.canvas.getBoundingClientRect();
        var canvasCoordinates: [number, number] = [event.clientX - rect.left, event.clientY - rect.top];
        var fractalCoordinates = this.getFractalCoordinatesAtCanvasCoordinates(canvasCoordinates);
        if(isRightClick) {
            this.recenter(fractalCoordinates, this.fractalWidth * 2, this.fractalHeight * 2);
        } else {
            this.recenter(fractalCoordinates, this.fractalWidth / 2, this.fractalHeight / 2);
        }
    }
}