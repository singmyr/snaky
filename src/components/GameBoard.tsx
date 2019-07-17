import React from 'react';

interface PureCanvasProps {
    contextRef: any;
    width: number;
    height: number;
}
class PureCanvas extends React.Component<PureCanvasProps> {
    public shouldComponentUpdate(): boolean {
        return false;
    }

    public render(): JSX.Element {
        return (
            <canvas
                width={this.props.width}
                height={this.props.height}
                ref={(node: any): any => (node ? this.props.contextRef(node.getContext('2d')) : null)}
            />
        );
    }
}

const rotateVector = (vec: number[], ang: number): number[] => {
    ang = -ang * (Math.PI / 180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return [
        Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000,
        Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000,
    ];
};

const KEYS = {
    LEFT: 1,
    RIGHT: 2,
};

interface GameCanvasProps {
    width: number;
    height: number;
}
class GameCanvas extends React.Component<GameCanvasProps> {
    // private canvasRef = createRef<HTMLCanvasElement>();
    private rAF = 0;

    private ctx: CanvasRenderingContext2D | null = null;

    private points: number[][] = [[50, 50]];
    private velX: number = 125;
    private velY: number = 0;
    private curX: number = 50;
    private curY: number = 50;
    private turnRadius = 172;
    private oldTS: number = 0;
    private keysPressed: number = 0;

    public componentDidMount(): void {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);

        this.renderCanvas();

        this.rAF = requestAnimationFrame(this.tick);

        if (this.oldTS === 0) {
            this.oldTS = Date.now();
        }
    }

    private tick = (): void => {
        const { oldTS, velX, velY, curX, curY } = this;
        const currentTS = Date.now();
        const delta = (currentTS - oldTS) / 1000;

        let newVel = [];
        if (this.keysPressed === KEYS.LEFT) {
            this.points.push([this.curX, this.curY]);
            newVel = rotateVector([this.velX, this.velY], this.turnRadius * delta);
            this.velX = newVel[0];
            this.velY = newVel[1];
        }

        if (this.keysPressed === KEYS.RIGHT) {
            this.points.push([this.curX, this.curY]);
            newVel = rotateVector([this.velX, this.velY], -this.turnRadius * delta);
            this.velX = newVel[0];
            this.velY = newVel[1];
        }

        this.oldTS = currentTS;
        this.curX = curX + velX * delta;
        this.curY = curY + velY * delta;

        this.renderCanvas();

        this.rAF = requestAnimationFrame(this.tick);
    };

    private renderCanvas(): void {
        if (this.ctx) {
            this.ctx.save();
            this.ctx.beginPath(); // Start a new path
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.props.width, this.props.height);

            this.ctx.moveTo(this.points[0][0], this.points[0][1]); // Move the pen to (30, 50)

            this.ctx.lineWidth = 10;
            this.ctx.strokeStyle = '#ffffff';
            this.points.forEach((c: number[], index: number): void => {
                if (this.ctx) {
                    if (index >= 0) {
                        this.ctx.lineTo(c[0], c[1]); // Draw a line to (150, 100)
                    }
                }
            });
            this.ctx.lineTo(this.curX, this.curY); // Draw a line to (150, 100)

            this.ctx.stroke(); // Render the path
            this.ctx.restore();
        }
    }

    private saveContext = (ctx: CanvasRenderingContext2D): void => {
        this.ctx = ctx;
    };

    public componentWillUnmount(): void {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        cancelAnimationFrame(this.rAF);
    }

    private onKeyDown = (e: KeyboardEvent): boolean => {
        switch (e.keyCode) {
            case 37: // Left.
                this.keysPressed |= KEYS.LEFT;
                break;
            case 39: // Right.
                this.keysPressed |= KEYS.RIGHT;
                break;
        }
        e.stopPropagation();
        e.preventDefault();
        return false;
    };

    private onKeyUp = (e: KeyboardEvent): boolean => {
        switch (e.keyCode) {
            case 37: // Left.
                this.keysPressed &= ~KEYS.LEFT;
                break;
            case 39: // Right.
                this.keysPressed &= ~KEYS.RIGHT;
                break;
        }

        e.stopPropagation();
        e.preventDefault();
        return false;
    };

    public render(): JSX.Element {
        return (
            <PureCanvas
                contextRef={this.saveContext}
                width={this.props.width}
                height={this.props.height} /*ref={this.canvasRef}*/
            />
        );
    }
}

const GameBoard: React.FC = (): JSX.Element => {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <GameCanvas width={window.innerWidth} height={window.innerHeight} />
        </div>
    );
};

export default GameBoard;
