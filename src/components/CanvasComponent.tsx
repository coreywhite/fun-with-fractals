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