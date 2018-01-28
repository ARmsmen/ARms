	//////////////////////////////////////////////////////////////////////////////////
	//		Init
	//////////////////////////////////////////////////////////////////////////////////

	// init renderer
	var renderer = new THREE.WebGLRenderer({
		antialias: true, /* could be false */
		alpha: true
	});
	// renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	// renderer.setPixelRatio( 1/2 );
	// Initialization of the renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'

	document.body.appendChild( renderer.domElement ); // <body> <canvas>...</canvas> </body>

	// array of functions for the rendering loop
	var onRenderFcts= [];

	// init scene and camera
	var scene = new THREE.Scene();
	
	//////////////////////////////////////////////////////////////////////////////////
	//		Initialize a basic camera
	//////////////////////////////////////////////////////////////////////////////////

	// Create a camera
	var camera = new THREE.Camera(); 
	// scene.add(camera); // add the camera to the scene

	////////////////////////////////////////////////////////////////////////////////
	//          handle arToolkitSource
	////////////////////////////////////////////////////////////////////////////////

	var arToolkitSource = new THREEx.ArToolkitSource({
		// to read from the webcam 
		sourceType : 'webcam',

		// to read from an image
		// sourceType : 'image',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		

		// to read from a video
		// sourceType : 'video',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
	})

	arToolkitSource.init(function onReady(){
		onResize()
	})
	
	// handle resize
	window.addEventListener('resize', function(){
		onResize()
	})
	function onResize() {
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		// arToolkitContext is defined below
		if( arToolkitContext.arController !== null ) {
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	////////////////////////////////////////////////////////////////////////////////
	//          initialize arToolkitContext
	////////////////////////////////////////////////////////////////////////////////
	

	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'camera_para.dat',
		detectionMode: 'mono',
		maxDetectionRate: 30,
		canvasWidth: 80*3,
		canvasHeight: 60*3,
	})
	// initialize it
	arToolkitContext.init(function onCompleted(){
		// copy projection matrix to camera
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() ); // copy the AR lookat matrix to the camera lookat matrix
		// console.log('once')
	})

	// update artoolkit on every frame
	onRenderFcts.push(function(){
		if( arToolkitSource.ready === false )	return

		arToolkitContext.update( arToolkitSource.domElement )
	})
	
	
	////////////////////////////////////////////////////////////////////////////////
	//          Create a ArMarkerControls
	////////////////////////////////////////////////////////////////////////////////
	
	var markerRoot = new THREE.Group
	scene.add(markerRoot)
	var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
		type : 'pattern',
		patternUrl : THREEx.ArToolkitContext.baseURL + 'patt.hiro'
		// patternUrl : THREEx.ArToolkitContext.baseURL + 'patt.kanji'
	})

	// build a smoothedControls
	var smoothedRoot = new THREE.Group()
	scene.add(smoothedRoot)
	var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
		lerpPosition: 0.4,
		lerpQuaternion: 0.3,
		lerpScale: 1,
	})
	onRenderFcts.push(function(delta){
		smoothedControls.update(markerRoot)
	})
	//////////////////////////////////////////////////////////////////////////////////
	//		add an object in the scene
	//////////////////////////////////////////////////////////////////////////////////

	var arWorldRoot = smoothedRoot


	var zeroVec = new THREE.Vector3(0, 0, 0)
	var minusFiveVec = new THREE.Vector3(0, 0, -5)

	var arMarkerRootDirection = new THREE.Vector3( 0, 0, 1 ).applyQuaternion( markerRoot.quaternion );

	// var projectionVec = arWorldRoot.position.clone()
	// projectionVec.project(camera)
	// var arMarkerRootArrow = new THREE.ArrowHelper(
	// 	arWorldRoot.position,
	// 	minusFiveVec, 
	// 	2, 
	// 	0xffff00);
	// scene.add(arMarkerRootArrow)

	
	// onRenderFcts.push(function() {
	// 	// console.log(camera.position)
	// 	// console.log((camera.position))
	// })


	var clock = new THREE.Clock();

	// init()

	// function init() {
	//     scene = new THREE.Scene();
		
	// 	camera = new THREE.PerspectiveCamera(60, width/height, 1, 1000)
	// 	camera.position.set(3, 3, 5);
		
	// 	renderer = new THREE.WebGLRenderer();
	// 	renderer.setSize(width, height);
	// 	document.body.appendChild(renderer.domElement)
		
	// 	var ambientLight = new THREE.AmbientLight(0xffffff)
	// 	scene.add(ambientLight)
		
	// 	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	// 	directionalLight.position.set( 0, 5, 5);
	// 	scene.add(directionalLight);
		
	// 	var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	// 	scene.add( light );
		
	// 	scene.add(new THREE.GridHelper(10, 1))
	// }	
	var character;
		loader = new THREE.JSONLoader();
		loader.load('./Client/MODEL/ai5.json', function(geometry, materials){
			materials.forEach(function(mat) {
					mat.skinning = true;
			});
			
			character = new THREE.SkinnedMesh(
				geometry,
				new THREE.MeshFaceMaterial(materials)
			);
			currentPlayer = Player.make('123')
			
			mixer = new THREE.AnimationMixer(character);
			
			action = mixer.clipAction(geometry.animations[0]);
			action.setEffectiveWeight(1);
			
			arWorldRoot.add(character);
			animate();
			action.play();
		});

	function animate () {
	  requestAnimationFrame(animate);
	  //controls.update();
	  render();
	}
		
	function render () {
	  var delta = clock.getDelta();
	  mixer.update(delta);
	  renderer.render(scene, camera);
	}

	var Player = {
		make : function(id) {
			// var geometry = new THREE.TorusKnotGeometry(0.3,0.1,64,16);
			// var material = new THREE.MeshNormalMaterial({transparent:false, opacity: 1.0, side:THREE.DoubleSide}); 
			var mesh = character // new THREE.Mesh(geometry, material);

			mesh.playerID = id

			mesh.position.y	= 0.5
			// mesh.scale = new THREE.Vector3(0.1, 0.1, 0.1)
			arWorldRoot.add( mesh );
			return {
				id : id, 
				mesh : mesh
			}
		}
	}

	var currentPlayer; 


	

	
	//////////////////////////////////////////////////////
	
	/////////////////////////////////////////////////////


    directionVec = new THREE.Vector3();

	var NOFUNC = function(e){

	}
	
	Keyboard = {
		left: 37,
		right: 39,
		up: 38,
		down: 40,
		space: 32, 
		make : function(){
			return {
				left: 37,
				right: 39,
				up: 38,
				down: 40,
				space: 32, 
				isdown : {
					left: false,
					right: false,
					up: false,
					down: false,
					space: false, 
				},
				handler : {
					left: NOFUNC,
					right: NOFUNC,
					up: NOFUNC,
					down: NOFUNC,
					space: NOFUNC, 
				},
				stateChangeUP : function(e){
					switch(e.keyCode){
						case this.left:
							this.isdown.left = false
							break;
						case this.right:
							this.isdown.right = false
							break;
						case this.up:
							this.isdown.up = false
							break;
						case this.down:
							this.isdown.down = false
							break;
						case this.space: 
							this.isdown.space = false
							break;
					}
				},
				stateChangeDOWN : function(e){
					// console.log("stateChangeDOWN")
					switch(e.keyCode) {
						case this.left:
							this.isdown.left = true
							break;
						case this.right:
							this.isdown.right = true
							break; 
						case this.up:
							this.isdown.up = true
							break;
						case this.down:
							this.isdown.down = true
							break;
						case this.space: 
							this.isdown.space = true
							break;
					}
				},
				update : function(){
					if(this.isdown.left){
						this.handler.left();
					}if(this.isdown.right){
						this.handler.right();
					}if(this.isdown.up){
						this.handler.up();
					}if(this.isdown.down){
						this.handler.down();
					}if(this.isdown.space) {
						this.handler.space();
					}
					
				}
			};
		}
	};
	var yAxis = new THREE.Vector3(0, 1, 0)
	var zAxis = new THREE.Vector3(0, 0, 1)


	var keyboard = Keyboard.make();
	keyboard.handler.left = function() {
		directionVec.x = -1
	};
	keyboard.handler.right = function() {
		directionVec.x = 1
	};
	keyboard.handler.up = function() {
		directionVec.z = -1
	};
	keyboard.handler.down = function() {
		directionVec.z = 1
	}
	keyboard.handler.space = function() {
		shoot()
	}
	onRenderFcts.push(function(){
		keyboard.update();
	});
	
	document.addEventListener("keyup", function(e) {
		keyboard.stateChangeUP(e);
	});
	document.addEventListener("keydown", function(e) {
		keyboard.stateChangeDOWN(e);
	});

	

	var moveThreshold = 0.1
	onRenderFcts.push(function() {
		// if (currentPlayer != null) {
		// 	currentPlayer.mesh.lookAt(arWorldRoot.position);
		// }
		if (currentPlayer != null && (directionVec.x != 0 || directionVec.z != 0)) {
			currentPlayer.mesh.position.x += directionVec.x * moveThreshold
			currentPlayer.mesh.position.z += directionVec.z * moveThreshold
			var scalar = (directionVec.x < 0) ? (-1) : (1);
			currentPlayer.mesh.setRotationFromAxisAngle(yAxis, scalar*directionVec.angleTo(zAxis))
			directionVec.x = 0
			directionVec.z = 0;
		}
	})

	var raycaster = new THREE.Raycaster()

	
	shoot= function() {
		if (currentPlayer != null) {
			var direction = new THREE.Vector3( 0, 0, 1 ).applyQuaternion( currentPlayer.mesh.quaternion );
			direction.y = 0
			raycaster.set(currentPlayer.mesh.position, direction)
			var intersects = raycaster.intersectObjects(arWorldRoot.children);
			var arrowHelper = new THREE.ArrowHelper(direction, 
				currentPlayer.mesh.position, 1, 0xffff00)
			arWorldRoot.add(arrowHelper)
			setTimeout(function(){arWorldRoot.remove(arrowHelper)}, 1000)
			if (intersects.length > 0) {
				var enemyID = intersects[0].playerID;
			}
		}
		// renderer.render(scene, camera);	
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////
	var stats = new Stats();
	document.body.appendChild( stats.dom );
	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
		stats.update();
	})

	// run the rendering loop
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
	})
/* globals GameController */
if(GameController!=null){
(function(){
  'use strict';
  var canvas = document.querySelector("#othercanvas");
  // function resize(){
  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;
  // }

  // document.addEventListener("resize", resize);
  // resize();
  GameController.init({
    left: {
      type: 'joystick',
      position: {left: '15%', bottom: '15%'},
      joystick: {
        touchStart: function(){
          // console.log('touch starts');
        },
        touchEnd: function(){
          // console.log('touch ends');
        },
        touchMove: function(details){
          directionVec.x = details.normalizedX;
          directionVec.z = -details.normalizedY;
        }
      }
    },
    right: {
      position: {right: '15%', bottom: '20%'},
      type: 'buttons',
      buttons: [{
          label: 'X',
          fontSize: 23,
          touchStart: function(){
			shoot();
            // console.log('X start');
		}
        }, {
          label: 'Y',
          fontSize: 23,
          touchStart: function(){
            console.log('Y start');
          }
        },
        false,
        false
      ]
    }
  });
})();
}
