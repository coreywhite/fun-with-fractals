import * as React from "react";

export interface FractalStatusProps {status: string}

export const FractalStatus = (props:FractalStatusProps) => {
    console.log(`In FractalStatus render with status = ${props.status}`);
    let currentdatetime = new Date().toLocaleString(); 
    return (<p id="status" className="status">{props.status}: {currentdatetime}</p>);
}