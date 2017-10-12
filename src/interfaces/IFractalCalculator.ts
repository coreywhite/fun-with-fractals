export interface IFractalOptions {
    fractalWidth?: number,
    fractalHeight?: number,
    centerX?:number,
    centerY?:number,
    xResolution?:number,
    yResolution?:number,
    maxIterations?:number
}

export interface IFractalCalculator {
    getOptions: () => IFractalOptions,
    setOptions: (newOpts:IFractalOptions) => void,
    calculate: (
        calculationDoneCallback:(fractal:number[][])=>void,
        options?:IFractalOptions,
        approximationDoneCallback?:(fractal:number[][])=>void,
        lineCallback?:(rowIndex:number, fractalRow:number[])=>void        
    )=>void
}