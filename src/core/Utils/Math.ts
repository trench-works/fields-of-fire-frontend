export class MyMath {
    public static getSign(value: number): string {
        switch (Math.sign(value)) {
            case -1:
                return "-";
            case 1:
                return "+";
            default:
            case 0:
                return "";
        }
    }
    public static getSigned(value: number): string {
        return `${MyMath.getSign(value)}${Math.abs(value)}`;
    }
}

