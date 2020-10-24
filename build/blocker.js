"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blocker = void 0;
var MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
var Blocker = /** @class */ (function () {
    function Blocker(context, options) {
        var position = (options.position !== undefined) ? options.position : { x: 0, y: 0, z: 0 };
        var scale = (options.scale !== undefined) ? options.scale : { x: 1, y: 1, z: 1 };
        var enabled = (options.enabled !== undefined) ? options.enabled : false;
        var layer = (options.layer !== undefined) ? options.layer : MRE.CollisionLayer.Navigation;
        var materialId = options.materialId;
        var meshId = options.meshId;
        this._box = MRE.Actor.Create(context, {
            actor: {
                appearance: {
                    meshId: meshId,
                    materialId: materialId,
                    enabled: enabled
                },
                transform: {
                    local: {
                        position: position,
                        scale: scale
                    }
                },
                collider: {
                    geometry: { shape: MRE.ColliderType.Auto },
                    layer: layer
                }
            }
        });
    }
    Blocker.prototype.block = function () {
        this._box.collider.layer = MRE.CollisionLayer.Navigation;
    };
    Blocker.prototype.unblock = function () {
        this._box.collider.layer = MRE.CollisionLayer.Hologram;
    };
    //debug
    Blocker.prototype.toggleVisibility = function () {
        this._box.appearance.enabled = !this._box.appearance.enabled;
    };
    return Blocker;
}());
exports.Blocker = Blocker;
