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
exports.Screen = void 0;
var MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
var Screen = /** @class */ (function () {
    function Screen(context, options) {
        var position = (options.position !== undefined) ? options.position : { x: 0, y: 0, z: 0 };
        var scale = (options.scale !== undefined) ? options.scale : { x: 1, y: 1, z: 1 };
        this._text = (options.text !== undefined) ? options.text : '?';
        var materialId = options.materialId;
        var meshId = options.meshId;
        var screenDepth = options.screenDepth;
        this._box = MRE.Actor.Create(context, {
            actor: {
                appearance: {
                    meshId: meshId,
                    materialId: materialId
                },
                transform: {
                    local: {
                        position: position,
                        scale: scale
                    }
                }
            }
        });
        this._label = MRE.Actor.Create(context, {
            actor: {
                name: 'Text',
                transform: {
                    app: { position: { x: position.x, y: position.y, z: position.z - screenDepth / 2 - 0.0001 } }
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
    Object.defineProperty(Screen.prototype, "_screen", {
        get: function () {
            return this._box;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Screen.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: false,
        configurable: true
    });
    Screen.prototype.addBehavior = function () {
    };
    return Screen;
}());
exports.Screen = Screen;
