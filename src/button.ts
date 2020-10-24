import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export interface ButtonOptions {
    name?: string,
    position?: Partial<MRE.Vector3Like>,
    scale?: MRE.Vector3Like,
    text?: string,
    color?:MRE.Color3,
    meshId: MRE.Guid,
    materialId: MRE.Guid,
    buttonDepth: number
}

export class Button {
    private _text: string;
    private _color: MRE.Color3;

    private _box: MRE.Actor;
    private _label: MRE.Actor;

    private buttonBehavior: MRE.ButtonBehavior;

    get _button(){
        return this._box;
    }

    get text(){
        return this._text;
    }

    constructor(context: MRE.Context, options?: ButtonOptions){
        let position = (options.position !== undefined) ? options.position : { x: 0, y: 0, z: 0 };
        let scale = (options.scale !== undefined) ? options.scale : { x: 1, y: 1, z: 1 };
        this._text = (options.text !== undefined) ? options.text : '?';
        this._color = (options.color !== undefined) ? options.color : MRE.Color3.Black();

        let materialId = options.materialId;
        let meshId = options.meshId;
        let buttonDepth = options.buttonDepth;

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
                },
                collider: { geometry: { shape: MRE.ColliderType.Auto } }
            }
        });

        this._label = MRE.Actor.Create(context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: {x: position.x, y: position.y, z: position.z - buttonDepth/2 - 0.0001} }
				},
				text: {
					contents: this._text,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
                    color: this._color,
					height: 0.05
				}
			}
        });
        
        this.buttonBehavior = this._button.setBehavior(MRE.ButtonBehavior);
    }

    public addBehavior(handler: MRE.ActionHandler<MRE.ButtonEventData>){
        this.buttonBehavior.onClick(handler);
    }

    public updateLabel(text: string, _color?: MRE.Color3){
        let color = (_color !== undefined) ? _color : MRE.Color3.Black();
        this._label.text.contents = text;
        this._label.text.color = color;
    }
}