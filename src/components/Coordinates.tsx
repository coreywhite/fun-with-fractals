import * as React from "react";

export interface CoordinatesProps {coordinates:[number, number], precision:number}

export const Coordinates = (props:CoordinatesProps) => {
    let coordinates = props.coordinates;
    let precision = props.precision;
    let coordinatesDisplay = `(${coordinates[0].toFixed(precision)},${coordinates[1].toFixed(precision)})`;
    return (<div id="coordinates" className="coordinates">{coordinatesDisplay}</div>);
}