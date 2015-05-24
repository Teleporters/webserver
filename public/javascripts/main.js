var THREE = require('three'),
    World = require('three-world'),
    WebVRManager = require('./vendor/webvr-manager'),
    VREffect = require('./vendor/VREffect'),
    VRControls = require('./vendor/VRControls'),
    WebVRPolyfill = require('./vendor/new-webvr-polyfill');
if(typeof Keen !== 'undefined') {
  var keen = new Keen({
    projectId: '5524d0fe46f9a729f32a51ab',
    writeKey: '4de50dbca92183ab6494f69b0376b8e68aa71611009f206ff921d962856cfcba43b101aa445f1769f44d5ef0eed55e24901fff2dbaf3b9457f82e2090227354ab40525a8630a2320dbd8b165d4ab8a08c53451d00b64663cfdd9d27e36d1c95e6352897d3a3002d41bccddf03c5836fb'
  });
}

var isWebGLAvailable = (function() {
  try {
    var canvas = document.createElement('canvas');
    return !! window.WebGLRenderingContext
                    && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch(e) {
    return false;
  }
})();

new WebVRPolyfill();

var onRender = function() {

  if (vrmgr.isVRMode()) {
    controls.update();
    effect.render(World.getScene(), cam);
    return false;
  } else if(vrmgr.mode === 1) { // incompatible to WebVR
    controls.update();
  }

  return true;
}

// Allow cross-origin texture loading
THREE.ImageUtils.crossOrigin = 'Anonymous';

var material = new THREE.MeshBasicMaterial({wireframe: false, side: THREE.BackSide}),
    skydome  = new THREE.Mesh(new THREE.SphereGeometry(100, 64, 64), material),
    cam      = null,
    controls = null,
    vrmgr    = null,
    effect   = null;

// WebGL init & all related setup

if(isWebGLAvailable) {
  if(typeof ga !== 'undefined') ga('set', 'dimension1', 'Yes');
  if(typeof keen !== 'undefined') keen.addEvent('webgl', {supported: 'Yes'});

  World.init({
    camDistance: 0,
    renderCallback: onRender,
    rendererOpts: {antialias: true}
  });

  effect = new VREffect(World.getRenderer());
  effect.setSize(window.innerWidth, window.innerHeight);

  vrmgr = new WebVRManager(effect, {hideButton: true});
  vrmgr.vrButton.style.zIndex = 35;
  cam = World.getCamera();
  cam.rotation.order = 'YXZ';
  controls = new VRControls(cam);

  skydome.position.copy(cam.position);
  cam.rotation.set(0, 0, 0);

  World.add(skydome);
  World.start();

  var hammertime = new Hammer(World.getRenderer().domElement, {});

  hammertime.on('pan', function(e) {
    var turnY = Math.PI * 0.01 * (e.deltaX / window.innerWidth),
        turnX = Math.PI * 0.01 * (e.deltaY / window.innerHeight);

    cam.rotation.y += turnY;
    cam.rotation.x += turnX;

    e.preventDefault();
    return false;
  });

  World.getRenderer().domElement.addEventListener('touchstart', function(e) { e.preventDefault(); }, true);
  document.querySelector('img').addEventListener('load', function() {
    console.log('loaded');
    start(this);
    document.querySelector('canvas').style.display = 'block';
  })
} else {
  document.querySelector('img').style.width = '100%';
  document.querySelector('.warning').style.display = 'block';
  if(typeof ga !== 'undefined') ga('set', 'dimension1', 'No');
  if(typeof keen !== 'undefined') keen.addEvent('webgl', {supported: 'No'});
}

//
// 3D Teleport stuff
//

function start(img) {
  window.scrollTo( 0, 0 );

  if((typeof img) === 'string') material.map = THREE.ImageUtils.loadTexture(img);
  else {
    var tex = new THREE.Texture(undefined, THREE.UVMapping);
    tex.image = img;
    tex.sourceFile = img.src;
    tex.needsUpdate = true;
    material.map = tex;
    material.needsUpdate = true;
    document.querySelector('img').style.display = 'none';
    document.querySelector('canvas').style.display = 'block';
  }

  vrmgr.hideButton = false;
  vrmgr.vrButton.style.display = 'block';
}
