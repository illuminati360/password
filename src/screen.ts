import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export interface ScreenOptions {
    name?: string,
    position?: Partial<MRE.Vector3Like>,
    scale?: MRE.Vector3Like,
    text?: string,
    meshId: MRE.Guid,
    materialId: MRE.Guid,
    screenDepth: number
}

export class Screen {
    private _text: string;

    private _box: MRE.Actor;
    private _label: MRE.Actor;

    private screenBehavior: MRE.ButtonBehavior;

    get _screen(){
        return this._box;
    }

    get text(){
        return this._text;
    }

    constructor(context: MRE.Context, options?: ScreenOptions){
        let position = (options.position !== undefined) ? options.position : { x: 0, y: 0, z: 0 };
        let scale = (options.scale !== undefined) ? options.scale : { x: 1, y: 1, z: 1 };
        this._text = (options.text !== undefined) ? options.text : '?';

        let materialId = options.materialId;
        let meshId = options.meshId;
        let screenDepth = options.screenDepth;

        this._box = MRE.Actor.Create(context, {
            actor: {
                appearance: {
                    meshId,
                    materialId
                },
                transform: {
                    local: {
                        position,
                        scale
                    }
                }
            }
        });

        this._label = MRE.Actor.Create(context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: {x: position.x, y: position.y, z: position.z - screenDepth/2 - 0.0001} }
				},
				text: {
					contents: this._text,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 0 / 255, g: 0 / 255, b: 0 / 255 },
					height: 0.05
				}
			}
        });
        
        this.screenBehavior = this._screen.setBehavior(MRE.ButtonBehavior);
    }

    public addBehavior(){

    }
}