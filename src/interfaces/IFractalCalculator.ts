export interface IFractalCalculator {
    calculate: (
        calculationDoneCallback:(fractal:number[][])=>void,
        approximationDoneCallback?:(fractal:number[][])=>void,
        lineCallback?:(rowIndex:number, fractalRow:number[])=>void
    )=>void
}