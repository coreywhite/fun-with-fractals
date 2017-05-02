import * as React from "react";

export interface CanvasComponentProps {
    className:string,
    onContextChange:(ctx:CanvasRenderingContext2D)=>void
}

export class CanvasComponent extends React.Component<CanvasComponentProps, undefined> {

    private canvas:HTMLCanvasElement;

    constructor(props:CanvasComponentProps) {
        super(props);
    }

    private resizeHandler = () => {
        if(this.canvas) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.props.onContextChange(this.canvas.getContext('2d'));
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    render() {
        return (
            <canvas ref={el=>this.canvas = el} className={this.props.className} />
        );
    }

}



// export default class CanvasComponent extends React.Component {

//     constructor(props) {
//         super(props);

//         this._resizeHandler = () => {
//             /* Allows CSS to determine size of canvas */
//             this.canvas.width = this.canvas.clientWidth;
//             this.canvas.height = this.canvas.clientHeight;

//             this.clearAndDraw();
//         }
//     }

//     componentDidMount() {
//         window.addEventListener('resize', this._resizeHandler);

//         /* Allows CSS to determine size of canvas */
//         this.canvas.width = this.canvas.clientWidth;
//         this.canvas.height = this.canvas.clientHeight;

//         this.clearAndDraw();
//     }

//     componentWillUnmount() {
//         window.removeEventListener('resize', this._resizeHandler);
//     }

//     componentDidUpdate(prevProps, prevState) {
//         if (this.props.secondRect !== prevProps.secondRect) {
//             this.clearAndDraw();
//         }
//     }

//     clearAndDraw() {
//         const ctx = this.canvas.getContext('2d');
//         if (ctx) {
//             ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//             this.draw(ctx);
//         }
//     }

//     draw(ctx) {
//         ctx.fillStyle = 'rgb(200, 0, 0)';
//         ctx.fillRect(10, 10, 50, 50);

//         if (this.props.secondRect) {
//             ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
//             ctx.fillRect(30, 30, 50, 50);
//         }
//     }

//     render() {
//         return (
//             <canvas ref={canvas => this.canvas = canvas} />
//         );
//     }
// }