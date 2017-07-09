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