import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import server from './server';
import {Button} from './button';
import { Blocker } from './blocker';

const PASSWORD = (process.env['API_KEY']==undefined) ? '123456' : process.env['PASSWORD'];

const BUTTON_WIDTH = 0.1;
const BUTTON_HEIGHT = 0.1;
const BUTTON_DEPTH = 0.005;
const BUTTON_MARGIN = 0.005;
const BUTTON_SCALE = 1;

const BACKSPACE_TEXT = 'x';
const ENTER_TEXT = 'v';

const BUTTON_LAYOUT = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    [BACKSPACE_TEXT, '0', ENTER_TEXT]
];
const PLACEHOLDER = 'PASSWD:'
const TOGGLE_BLOCKER = '6666'

const BLOCKER_WIDTH = 4;
const BLOCKER_HEIGHT = 3;
const BLOCKER_DEPTH = 1;

const BLOCKER_DELAY = 3*1000;
const BLOCKER_OFFSET_X = 2.8;
const BLOCKER_OFFSET_Y = 0;
const BLOCKER_OFFSET_Z = BLOCKER_DEPTH/2;

const OVERRIDE_WIDTH = 0.3;
const OVERRIDE_HEIGHT = 0.3;
const OVERRIDE_DEPTH = 0.005;
const OVERRIDE_OFFSET_X = 5.85;
const OVERRIDE_OFFSET_Y = 0.45;
const OVERRIDE_OFFSET_Z = 1;

/**
 * The main class of this app. All the logic goes here.
 */
export default class Numlock {

    // unity
    private context: MRE.Context;
    private baseUrl;
    private assets: MRE.AssetContainer;

    private scrMeshId: MRE.Guid;
    private scrMaterialId: MRE.Guid;

    private btnMeshId: MRE.Guid;
    private btnMaterialId: MRE.Guid;

    private blockerMeshId: MRE.Guid;
    private blockerMaterialId: MRE.Guid;

    private overrideMeshId: MRE.Guid;
    private overrideMaterialId: MRE.Guid;

    private deniedSound: MRE.Sound;
    private grantedSound: MRE.Sound;
    private beepSound: MRE.Sound;

    // logic
    private buttons = new Map<string, Button>();
    private screen: Button;

    private inputText: string = '';
    private screenText: string = PLACEHOLDER;
    private screenTextColor: MRE.Color3 = MRE.Color3.Black();

    private blocker: Blocker;

    private override: Button;

    private isGranted: boolean = false;

    // constructor
	constructor(private _context: MRE.Context, private params: MRE.ParameterSet, _baseUrl: string) {
        this.context = _context;
        this.baseUrl = _baseUrl;
        this.assets = new MRE.AssetContainer(this.context);

        let nc: number = BUTTON_LAYOUT[0].length; //number of columns

        this.scrMeshId = this.assets.createBoxMesh('scr_mesh', BUTTON_WIDTH*nc + BUTTON_MARGIN*(nc-1), BUTTON_HEIGHT, BUTTON_DEPTH).id;
        this.scrMaterialId = this.assets.createMaterial('scr_material', { color: MRE.Color3.White() }).id;

        this.btnMeshId = this.assets.createBoxMesh('scr_mesh', BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_DEPTH).id;
        this.btnMaterialId = this.assets.createMaterial('scr_material', { color: MRE.Color3.LightGray() }).id;

        this.blockerMeshId = this.assets.createBoxMesh('blocker_mesh', BLOCKER_WIDTH, BLOCKER_HEIGHT, BLOCKER_DEPTH).id;
        this.blockerMaterialId = this.assets.createMaterial('blocker_material', { color: MRE.Color3.LightGray() }).id;

        this.overrideMeshId = this.assets.createBoxMesh('override_mesh', OVERRIDE_WIDTH, OVERRIDE_HEIGHT, OVERRIDE_DEPTH).id;
        this.overrideMaterialId = this.assets.createMaterial('override_material', { color: MRE.Color3.Red() }).id;

        this.deniedSound = this.assets.createSound('denied', { uri: `${this.baseUrl}/denied.ogg` });
        this.grantedSound = this.assets.createSound('granted', { uri: `${this.baseUrl}/granted.ogg` });
        this.beepSound = this.assets.createSound('beep', { uri: `${this.baseUrl}/beep.ogg` });

        this.context.onStarted(() => this.init());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private init() {
        this.createScreen(this.context);
        this.createNumpad(this.context);
        this.createBlocker(this.context);
        this.createOverride(this.context);
    }

    private createScreen(context: MRE.Context){
        let nc: number = BUTTON_LAYOUT[0].length;
        let w =BUTTON_WIDTH*nc + BUTTON_MARGIN*(nc-1);
        let h = BUTTON_HEIGHT;

        let btn = new Button(context, 
            {
                name: "screen",
                position: { 
                    x: 0 + w/2,
                    y: (BUTTON_HEIGHT+BUTTON_MARGIN) * BUTTON_LAYOUT.length + h/2,
                    z: 0
                },
                scale: { x: BUTTON_SCALE, y: BUTTON_SCALE, z: BUTTON_SCALE },
                text: this.screenText,
                color: this.screenTextColor,
                meshId: this.scrMeshId,
                materialId: this.scrMaterialId,
                buttonDepth: BUTTON_DEPTH
            }
        );
        this.screen = btn;
    }
    
    private createNumpad(context: MRE.Context){
        let w = BUTTON_WIDTH;
        let h = BUTTON_HEIGHT;
        // make a grid of buttons based on the BUTTON_LAYOUT
        BUTTON_LAYOUT.forEach((r, ri) => {
            r.forEach((c, ci) => {
                // @ ri: row index
                // @ ci: column index
                // @ c: btn text
                let btn = new Button(context, 
                    {
                        name: "btn_" + c,
                        position: { 
                            x: ci * (BUTTON_WIDTH + BUTTON_MARGIN) + w/2,
                            y: (BUTTON_LAYOUT.length - ri - 1) * (BUTTON_HEIGHT + BUTTON_MARGIN) + h/2,
                            z: 0
                        },
                        scale: { x: BUTTON_SCALE, y: BUTTON_SCALE, z: BUTTON_SCALE },
                        text: c,
                        meshId: this.btnMeshId,
                        materialId: this.btnMaterialId,
                        buttonDepth: BUTTON_DEPTH
                    }
                );
                this.buttons.set(c, btn);
            })
        });

        // add behaviours
        this.buttons.forEach((btn) => {
            // 'x'
            if (btn.text == BACKSPACE_TEXT){
                btn.addBehavior((_, __) => {
                    this.deleteDigit();
                    this.playSound(this.beepSound);
                });
            // 'ok'
            } else if (btn.text == ENTER_TEXT){
                btn.addBehavior((_, __) => {
                    if (this.isPasswordCorrect()){
                        this.grantAccess();
                    }
                    //debug
                    else if (this.isToggleBlocker()){
                        this.blocker.toggleVisibility();
                    }
                    else{
                        this.denyAccess();
                    }
                    this.playSound(this.beepSound);
                });
            // '0-9'
            } else {
                btn.addBehavior((_, __) => {
                    this.addDigit(btn.text);
                    this.playSound(this.beepSound);
                });
            }
        });
    }

    private createBlocker(context: MRE.Context){
        this.blocker = new Blocker(context, {
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
    }

    private createOverride(context: MRE.Context){
        this.override = new Button(this.context, {
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

        this.override.addBehavior((_,__)=>{
            this.toggleAccess();
        });
    }

    private refreshScreen(){
        this.screen.updateLabel(this.screenText, this.screenTextColor);
    }

    private addDigit(d: string){
        if (this.inputText.length >= 6) {
            this.denyAccess();
            return;
        }

        this.inputText += d;
        this.screenText = '*'.repeat(this.inputText.length);
        this.screenTextColor = MRE.Color3.Black();
        
        this.refreshScreen();
    }

    private deleteDigit(){
        if (this.inputText.length <= 1) {
            this.inputText = '';
            this.resetScreen();
            return;
        }

        this.inputText = this.inputText.slice(0, -1);
        this.screenText = '*'.repeat(this.inputText.length);
        this.screenTextColor = MRE.Color3.Black();

        this.refreshScreen();
    }

    private isPasswordCorrect(){
        return this.inputText == PASSWORD;
    }

    private isToggleBlocker(){
        return this.inputText == TOGGLE_BLOCKER;
    }

    private resetScreen(){
        this.screenText = PLACEHOLDER;
        this.screenTextColor = MRE.Color3.Black();
        this.refreshScreen();
    }

    private denyAccess(){
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
    }

    private grantAccess(){
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
    }

    private toggleAccess(){
        if (this.isGranted){
            this.denyAccess();
            this.override.updateColor(MRE.Color3.Red());
        } else{
            this.grantAccess();
            this.override.updateColor(MRE.Color3.Green());
        }
    }

    private playSound(musicAsset: MRE.Sound){
        this.screen._button.startSound(musicAsset.id, {
            volume: 0.5,
            looping: false,
            rolloffStartDistance: 2.5
        });
    }
}
