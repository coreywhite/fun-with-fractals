import * as React from "react";
import {CanvasComponent} from "./CanvasComponent"

export interface FractalRendererProps {
    className:string
}

interface FractalRendererState {
    ctx:CanvasRenderingContext2D
}

export class FractalRenderer extends React.Component<FractalRendererProps, FractalRendererState> {

    constructor(props:FractalRendererProps) {
        super(props);
        this.state = {
            ctx: null
        }
    }

    private handleContext = (newCtx:CanvasRenderingContext2D) => {
        this.setState({ctx: newCtx}, this.drawCanvas);
    }

    private drawCanvas = () => {
        let ctx = this.state.ctx;
        //Temporary -- just to demonstrate component
        if(ctx) {
            let height = ctx.canvas.height;
            let width = ctx.canvas.width;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgb(200,200,0)';
            if(width < 800) {
                ctx.fillStyle = 'rgb(200, 0, 200)';
            }
            ctx.fillRect(10, 10, width - 20, height - 20);
        }
    }

    render() {
        return (
            <CanvasComponent className={this.props.className} onContextChange={this.handleContext} />
        );
    }
}