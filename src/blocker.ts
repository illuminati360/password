import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export interface BlockerOptions {
    name?: string,
    position?: Partial<MRE.Vector3Like>,
    scale?: MRE.Vector3Like,
    enabled?: boolean,
    layer?: MRE.CollisionLayer,
    meshId: MRE.Guid,
    materialId: MRE.Guid
}

export class Blocker {
    private _box: MRE.Actor;

    constructor(context: MRE.Context, options?: BlockerOptions){
        let position = (options.position !== undefined) ? options.position : { x: 0, y: 0, z: 0 };
        let scale = (options.scale !== undefined) ? options.scale : { x: 1, y: 1, z: 1 };
        let enabled = (options.enabled !== undefined) ? options.enabled : false;
        let layer = (options.layer !== undefined) ? options.layer : MRE.CollisionLayer.Navigation;

        let materialId = options.materialId;
        let meshId = options.meshId;

        this._box = MRE.Actor.Create(context, {
            actor: {
                appearance: {
                    meshId,
                    materialId,
                    enabled
                },
                transform: {
                    local: {
                        position,
                        scale
                    }
                },
                collider: { 
                    geometry: { shape: MRE.ColliderType.Auto },
                    layer
                }
            }
        });
    }

    public block(){
        this._box.collider.layer = MRE.CollisionLayer.Navigation;
    }

    public unblock(){
        this._box.collider.layer = MRE.CollisionLayer.Hologram;
    }

    //debug
    public toggleVisibility(){
        this._box.appearance.enabled = !this._box.appearance.enabled;
    }
}