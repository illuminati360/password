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
var MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
var button_1 = require("./button");
var blocker_1 = require("./blocker");
var BUTTON_WIDTH = 0.1;
var BUTTON_HEIGHT = 0.1;
var BUTTON_DEPTH = 0.005;
var BUTTON_MARGIN = 0.005;
var BUTTON_SCALE = 1;
var BACKSPACE_TEXT = 'x';
var ENTER_TEXT = 'v';
var BUTTON_LAYOUT = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    [BACKSPACE_TEXT, '0', ENTER_TEXT]
];
var PLACEHOLDER = 'PASSWD:';
var PASSWORD = '123456';
var TOGGLE_BLOCKER = '6666';
var BLOCKER_WIDTH = 4;
var BLOCKER_HEIGHT = 3;
var BLOCKER_DEPTH = 1;
var BLOCKER_DELAY = 3 * 1000;
var BLOCKER_OFFSET_X = 2.8;
var BLOCKER_OFFSET_Y = 0;
var BLOCKER_OFFSET_Z = BLOCKER_DEPTH / 2;
var OVERRIDE_WIDTH = 0.3;
var OVERRIDE_HEIGHT = 0.3;
var OVERRIDE_DEPTH = 0.005;
var OVERRIDE_OFFSET_X = 5.85;
var OVERRIDE_OFFSET_Y = 0.45;
var OVERRIDE_OFFSET_Z = 1;
/**
 * The main class of this app. All the logic goes here.
 */
var Numlock = /** @class */ (function () {
    // constructor
    function Numlock(_context, params, _baseUrl) {
        var _this = this;
        this._context = _context;
        this.params = params;
        // logic
        this.buttons = new Map();
        this.inputText = '';
        this.screenText = PLACEHOLDER;
        this.screenTextColor = MRE.Color3.Black();
        this.isGranted = false;
        this.context = _context;
        this.baseUrl = _baseUrl;
        this.assets = new MRE.AssetContainer(this.context);
        var nc = BUTTON_LAYOUT[0].length; //number of columns
        this.scrMeshId = this.assets.createBoxMesh('scr_mesh', BUTTON_WIDTH * nc + BUTTON_MARGIN * (nc - 1), BUTTON_HEIGHT, BUTTON_DEPTH).id;
        this.scrMaterialId = this.assets.createMaterial('scr_material', { color: MRE.Color3.White() }).id;
        this.btnMeshId = this.assets.createBoxMesh('scr_mesh', BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_DEPTH).id;
        this.btnMaterialId = this.assets.createMaterial('scr_material', { color: MRE.Color3.LightGray() }).id;
        this.blockerMeshId = this.assets.createBoxMesh('blocker_mesh', BLOCKER_WIDTH, BLOCKER_HEIGHT, BLOCKER_DEPTH).id;
        this.blockerMaterialId = this.assets.createMaterial('blocker_material', { color: MRE.Color3.LightGray() }).id;
        this.overrideMeshId = this.assets.createBoxMesh('override_mesh', OVERRIDE_WIDTH, OVERRIDE_HEIGHT, OVERRIDE_DEPTH).id;
        this.overrideMaterialId = this.assets.createMaterial('override_material', { color: MRE.Color3.Red() }).id;
        this.deniedSound = this.assets.createSound('denied', { uri: this.baseUrl + "/denied.ogg" });
        this.grantedSound = this.assets.createSound('granted', { uri: this.baseUrl + "/granted.ogg" });
        this.beepSound = this.assets.createSound('beep', { uri: this.baseUrl + "/beep.ogg" });
        this.context.onStarted(function () { return _this.init(); });
    }
    /**
     * Once the context is "started", initialize the app.
     */
    Numlock.prototype.init = function () {
        this.createScreen(this.context);
        this.createNumpad(this.context);
        this.createBlocker(this.context);
        this.createOverride(this.context);
    };
    Numlock.prototype.createScreen = function (context) {
        var nc = BUTTON_LAYOUT[0].length;
        var w = BUTTON_WIDTH * nc + BUTTON_MARGIN * (nc - 1);
        var h = BUTTON_HEIGHT;
        var btn = new button_1.Button(context, {
            name: "screen",
            position: {
                x: 0 + w / 2,
                y: (BUTTON_HEIGHT + BUTTON_MARGIN) * BUTTON_LAYOUT.length + h / 2,
                z: 0
            },
            scale: { x: BUTTON_SCALE, y: BUTTON_SCALE, z: BUTTON_SCALE },
            text: this.screenText,
            color: this.screenTextColor,
            meshId: this.scrMeshId,
            materialId: this.scrMaterialId,
            buttonDepth: BUTTON_DEPTH
        });
        this.screen = btn;
    };
    Numlock.prototype.createNumpad = function (context) {
        var _this = this;
        var w = BUTTON_WIDTH;
        var h = BUTTON_HEIGHT;
        // make a grid of buttons based on the BUTTON_LAYOUT
        BUTTON_LAYOUT.forEach(function (r, ri) {
            r.forEach(function (c, ci) {
                // @ ri: row index
                // @ ci: column index
                // @ c: btn text
                var btn = new button_1.Button(context, {
                    name: "btn_" + c,
                    position: {
                        x: ci * (BUTTON_WIDTH + BUTTON_MARGIN) + w / 2,
                        y: (BUTTON_LAYOUT.length - ri - 1) * (BUTTON_HEIGHT + BUTTON_MARGIN) + h / 2,
                        z: 0
                    },
                    scale: { x: BUTTON_SCALE, y: BUTTON_SCALE, z: BUTTON_SCALE },
                    text: c,
                    meshId: _this.btnMeshId,
                    materialId: _this.btnMaterialId,
                    buttonDepth: BUTTON_DEPTH
                });
                _this.buttons.set(c, btn);
            });
        });
        // add behaviours
        this.buttons.forEach(function (btn) {
            // 'x'
            if (btn.text == BACKSPACE_TEXT) {
                btn.addBehavior(function (_, __) {
                    _this.deleteDigit();
                    _this.playSound(_this.beepSound);
                });
                // 'ok'
            }
            else if (btn.text == ENTER_TEXT) {
                btn.addBehavior(function (_, __) {
                    if (_this.isPasswordCorrect()) {
                        _this.grantAccess();
                    }
                    //debug
                    else if (_this.isToggleBlocker()) {
                        _this.blocker.toggleVisibility();
                    }
                    else {
                        _this.denyAccess();
                    }
                    _this.playSound(_this.beepSound);
                });
                // '0-9'
            }
            else {
                btn.addBehavior(function (_, __) {
                    _this.addDigit(btn.text);
                    _this.playSound(_this.beepSound);
                });
            }
        });
    };
    Numlock.prototype.createBlocker = function (context) {
        this.blocker = new blocker_1.Blocker(context, {
            name: "blocker",
            position: {
                x: BLOCKER_OFFSET_X,
                y: BLOCKER_OFFSET_Y,
                z: BLOCKER_OFFSET_Z,
            },
            scale: { x: BUTTON_SCALE, y: BUTTON_SCALE, z: BUTTON_SCALE },
            meshId: this.blockerMeshId,
            materialId: this.blockerMaterialId,
            enabled: false,
            layer: MRE.CollisionLayer.Navigation
        });
    };
    Numlock.prototype.createOverride = function (context) {
        var _this = this;
        this.override = new button_1.Button(this.context, {
            name: "override",
            position: {
                x: OVERRIDE_OFFSET_X,
                y: OVERRIDE_OFFSET_Y,
                z: OVERRIDE_OFFSET_Z,
            },
            scale: { x: BUTTON_SCALE, y: BUTTON_SCALE, z: BUTTON_SCALE },
            meshId: this.overrideMeshId,
            materialId: this.overrideMaterialId,
            buttonDepth: BUTTON_DEPTH
        });
        this.override.addBehavior(function (_, __) {
            _this.toggleAccess();
        });
    };
    Numlock.prototype.refreshScreen = function () {
        this.screen.updateLabel(this.screenText, this.screenTextColor);
    };
    Numlock.prototype.addDigit = function (d) {
        if (this.inputText.length >= 6) {
            this.denyAccess();
            return;
        }
        this.inputText += d;
        this.screenText = '*'.repeat(this.inputText.length);
        this.screenTextColor = MRE.Color3.Black();
        this.refreshScreen();
    };
    Numlock.prototype.deleteDigit = function () {
        if (this.inputText.length <= 1) {
            this.resetScreen();
            return;
        }
        this.inputText = this.inputText.slice(0, -1);
        this.screenText = '*'.repeat(this.inputText.length);
        this.screenTextColor = MRE.Color3.Black();
        this.refreshScreen();
    };
    Numlock.prototype.isPasswordCorrect = function () {
        return this.inputText == PASSWORD;
    };
    Numlock.prototype.isToggleBlocker = function () {
        return this.inputText == TOGGLE_BLOCKER;
    };
    Numlock.prototype.resetScreen = function () {
        this.screenText = PLACEHOLDER;
        this.screenTextColor = MRE.Color3.Black();
        this.refreshScreen();
    };
    Numlock.prototype.denyAccess = function () {
        this.screenText = 'DENIED';
        this.screenTextColor = MRE.Color3.Red();
        this.refreshScreen();
        this.inputText = '';
        // audio
        this.playSound(this.deniedSound);
        // blocker
        this.blocker.block();
        // override
        this.override.updateColor(MRE.Color3.Red());
        // logic
        this.isGranted = false;
    };
    Numlock.prototype.grantAccess = function () {
        // text
        this.screenText = 'GRANTED';
        this.screenTextColor = MRE.Color3.Green();
        this.refreshScreen();
        this.inputText = '';
        // audio
        this.playSound(this.grantedSound);
        // blocker
        this.blocker.unblock();
        // override
        this.override.updateColor(MRE.Color3.Green());
        // logic
        this.isGranted = true;
    };
    Numlock.prototype.toggleAccess = function () {
        if (this.isGranted) {
            this.denyAccess();
            this.override.updateColor(MRE.Color3.Red());
        }
        else {
            this.grantAccess();
            this.override.updateColor(MRE.Color3.Green());
        }
    };
    Numlock.prototype.playSound = function (musicAsset) {
        this.screen._button.startSound(musicAsset.id, {
            volume: 0.5,
            looping: false,
            rolloffStartDistance: 2.5
        });
    };
    return Numlock;
}());
exports.default = Numlock;
