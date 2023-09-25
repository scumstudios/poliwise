// HTML UI FUNCTIONS

// Dialog Interaction Function
function dialog_pop(text) {
    if (document.getElementById("dialogFrame").style.visibility == "visible") {
        if (document.getElementById("dialogText").textContent != text) {
            document.getElementById("dialogText").textContent = text;
        }
        else {
            document.getElementById("dialogFrame").style.visibility = 'hidden';
        }
    }
    else {
        document.getElementById("dialogFrame").style.visibility = 'visible';
        document.getElementById("dialogText").textContent = text;  
    }
}


// BABYLON

// Get Canvas
const canvas = document.getElementById("renderCanvas");

// Create Engine
const engine = new BABYLON.Engine(canvas, true, { stencil: true }); 


// BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
//     if (document.getElementById("loadScreen")) {
//         // Do not add a loading screen if there is already one
//         document.getElementById("loadScreen").style.display = "initial";
//         return;
//     }
//     this._loadingDiv = document.createElement("div");
//     this._loadingDiv.id = "loadScreen";
//     this._loadingDiv.innerHTML = "Loading...";
//     var customLoadingScreenCss = document.createElement('style');
//     customLoadingScreenCss.type = 'text/css';
//     customLoadingScreenCss.innerHTML = `
//     #loadScreen{;
//         display: flex;
//         justify-content: center;
//         align-content: center;
//         flex-direction: column;
//         text-align: center;
//         color: #fff;
//         background: #000;
//     }
//     `;
//     document.getElementsByTagName('head')[0].appendChild(customLoadingScreenCss);
//     this._resizeLoadingUI();
//     window.addEventListener("resize", this._resizeLoadingUI);
//     document.body.appendChild(this._loadingDiv);
// };

// BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
//     document.getElementById("loadScreen").style.display = "none";
//     console.log("scene is now loaded");
// }


const createScene = function(){

    engine.displayLoadingUI();

    // Creates a basic Babylon Scene object
    const scene = new BABYLON.Scene(engine);

    // const camera = new BABYLON.TargetCamera("TargetCamera", new BABYLON.Vector3(11,14,12.5), scene);
    const camera = new BABYLON.ArcRotateCamera("Camera", 13.5, 0.9, 32, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.fov = 0.5;

    camera.allowUpsideDown = false;
    camera.panningSensibility = 1024;
    camera.angularSensibilityX = 2048;
    camera.angularSensibilityY = 2048;
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 64;
    camera.lowerBetaLimit = 0.5;
    camera.upperBetaLimit = 1.15;
    
    var target = new BABYLON.Vector3(0,1,0);
    camera.setTarget(target);


    // Set up lighting
    const sky = new BABYLON.HemisphericLight("Sky", new BABYLON.Vector3(-0.5, 1, 0), scene);
    const sun = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0, -1, 0), scene);
    
    sky.intensity = 0.75;

    sun.position = new BABYLON.Vector3(0, 10, 0);
    sun.diffuse = new BABYLON.Color3(1, 1, 1);
    sun.position = new BABYLON.Vector3(0, 10, 0);
    sun.diffuse = new BABYLON.Color3(1, 0.98, 0.7);
    sun.intensity = 1;
    sun.shadowEnabled = true;
    sun.autoCalcShadowZBounds = true;

    scene.clearColor = new BABYLON.Color3(0.22, 0, 0.65);

    // Shadows
    const sg = new BABYLON.ShadowGenerator(1024, sun);
    sg.bias = 0.0005;
    sg.darkness = 0;
    sg.useBlurCloseExponentialShadowMap = true;
    sg.useContactHardeningShadow = false;
    sg.useKernelBlur = true;
    sg.blurKernel = 8;

    // Define default matte material
    const defmat = new BABYLON.PBRMaterial("defmat", scene);
    defmat.reflectivityColor = new BABYLON.Color3(0, 0, 0);
    defmat.transparencyMode = 0;
    defmat.indexOfRefraction = 1.0;
    defmat.roughness = 1;
    defmat.metallic = 0;
    defmat.metallicF0Factor = 0;
    defmat.iridescence.isEnabled = true;
    defmat.iridescence.indexOfRefraction = 1.8;
    
    // Background Sounds
    const sound = new BABYLON.Sound("forest", "../assets/birdloop.ogg", scene, null, { loop: true, autoplay: true });

    // Hightlight Layer
    const hl = new BABYLON.HighlightLayer("hl1", scene);


    // Load Assets
    let t_palace = BABYLON.SceneLoader.ImportMeshAsync("","../assets/", "t_palace.glb").then((result) => {
        result.meshes.forEach(mesh => {
            // Set materials
            mesh.material = defmat;
            mesh.receiveShadows = true;
            
            // Set outline
            mesh.renderOutline = true;
            mesh.outlineColor = new BABYLON.Color3(0, 0, 0);
            mesh.outlineWidth = 0.025;
            
            // Glow & Dialog
            hl.addMesh(mesh, BABYLON.Color3.Yellow());

            mesh.actionManager = new BABYLON.ActionManager(scene);
            mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                dialog_pop("Dit is het kasteel van Laken.");
                hl.removeMesh(mesh);
            }));

            sg.addShadowCaster(mesh, true);
        });
    });

    let t_parliament = BABYLON.SceneLoader.ImportMeshAsync("","../assets/", "t_parliament.glb").then((result) => {
        result.meshes.forEach(mesh => {
            // Set materials
            mesh.material = defmat;
            mesh.receiveShadows = true;
            mesh.position = new BABYLON.Vector3(0,0,-5);
            
            // Set outline
            mesh.renderOutline = true;
            mesh.outlineColor = new BABYLON.Color3(0, 0, 0);
            mesh.outlineWidth = 0.025;

            // Glow & Dialog
            hl.addMesh(mesh, BABYLON.Color3.Yellow());

            mesh.actionManager = new BABYLON.ActionManager(scene);
            mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                dialog_pop("Dit is het federaal parlement.");
                hl.removeMesh(mesh);
            }));
            
            sg.addShadowCaster(mesh, true);
        });
    });
    


    // POST PROCESSING

    var defaultPipeline = new BABYLON.DefaultRenderingPipeline("DefaultRenderingPipeline", true, scene, scene.cameras);
    if (defaultPipeline.isSupported) {
        // MSAA
        defaultPipeline.samples = 1; // 1 by default

        /* FXAA */
        // defaultPipeline.fxaaEnabled = true; // false by default
        // if (defaultPipeline.fxaaEnabled) {
        //     defaultPipeline.fxaa.samples = 1; // 1 by default
        // }

        /* imageProcessing */
        defaultPipeline.imageProcessingEnabled = false; //true by default
        // if (defaultPipeline.imageProcessingEnabled) {
        //     defaultPipeline.imageProcessing.contrast = 1.25; // 1 by default
        //     defaultPipeline.imageProcessing.exposure = 1.1; // 1 by default
        // }
        /* bloom */
        // defaultPipeline.bloomEnabled = true; // false by default
        // if (defaultPipeline.bloomEnabled) {
        //     defaultPipeline.bloomKernel = 32; // 64 by default
        //     defaultPipeline.bloomScale = 1; // 0.5 by default
        //     defaultPipeline.bloomThreshold = 0.1; // 0.9 by default
        //     defaultPipeline.bloomWeight = 0.1; // 0.15 by default
        // }
        
        // /* DOF */
        // defaultPipeline.depthOfFieldEnabled = true; // false by default
        // if (defaultPipeline.depthOfFieldEnabled && defaultPipeline.depthOfField.isSupported) {
        //     defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
        //     defaultPipeline.depthOfField.fStop = 0.95; // 1.4 by default
        //     defaultPipeline.depthOfField.focalLength = 250; // 50 by default, mm
        //     defaultPipeline.depthOfField.lensSize = 250; // 50 by default
        //     // Calculate DoF Distance to target
        //     scene.onBeforeRenderObservable.add(() => {
        //         defaultPipeline.depthOfField.focusDistance = camera.radius * 1000; 
        //     });
        // }

        /* grain */
        // defaultPipeline.grainEnabled = true;
        // if (defaultPipeline.grainEnabled) {
        //     defaultPipeline.grain.animated = true; // false by default
        //     defaultPipeline.grain.intensity = 7.5; // 30 by default
        // }
        
    }

    // Debugging
    console.log();

    // Show Inspector
    // scene.debugLayer.show();


    // Rendering Optimizations
    engine.setHardwareScalingLevel(1);

    var options = new BABYLON.SceneOptimizerOptions();
    // options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 2));
    // options.addOptimization(new BABYLON.PostProcessesOptimization(1));

    // Optimizer
    var optimizer = new BABYLON.SceneOptimizer(scene, options);
    optimizer.targetFrameRate = 60;
    optimizer.trackerDuration = 2500;
    optimizer.start();
    
    engine.hideLoadingUI();

    return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});
