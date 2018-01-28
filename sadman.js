// sadman.js
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
	var camera = new THREE.Camera(); // this is the camera looking at. 
	scene.add(camera); // add the camera to the scene

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
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji'
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

	
	var Player = {
		make : function(id) {
			var geometry = new THREE.BoxGeometry( .5, 2, .5 );
			var material = new THREE.MeshNormalMaterial({transparent:true, opacity: 0.3, side:THREE.DoubleSide}); 
			var mesh = new THREE.Mesh(geometry, material);

			mesh.playerID = id

			mesh.position.y	= 1
			arWorldRoot.add( mesh );
			return {
				id : id, 
				mesh : mesh
			}
		}
	}

	var currentPlayer = Player.make()

	
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
		if (directionVec.x != 0 || directionVec.z != 0) {
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
		var direction = new THREE.Vector3( 0, 0, 1 ).applyQuaternion( currentPlayer.mesh.quaternion );
		direction.y = 0
		raycaster.set(currentPlayer.mesh.position, direction)
		var intersects = raycaster.intersectObjects(arWorldRoot.children);
		var arrowHelper = new THREE.ArrowHelper(direction, 
			currentPlayer.mesh.position, 1, 0xffff00)
		arWorldRoot.add(arrowHelper)
		setTimeout(function(){arWorldRoot.remove(arrowHelper)}, 3000)
		if (intersects.length > 0) {
			var enemyID = intersects[0].playerID;
		}
		//var zero = new THREE.Vector3(0,0,0);
		//var v = new THREE.Vector3( 0, 0, 1 ).applyQuaternion(arWorldRoot.clone(false).lookat(zero).quaternion);
		
		//var direction = new THREE.Vector3( 0, 0, 1 ).applyQuaternion( arWorldRoot.quaternion );
		//var direction = v;
		//var arrowHelper = new THREE.ArrowHelper(direction, currentPlayer.mesh.position, 1, 0xffff00)
		//arWorldRoot.add(arrowHelper)
		//setTimeout(function(){arWorldRoot.remove(arrowHelper)}, 3000)
		
		
		
		// renderer.render(scene, camera);	
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////
	
	var zero = new THREE.Vector3(0,0,0);
	var a1,a2,a3;
	var v = new THREE.Vector3(0,0,-5);
	a1 = new THREE.ArrowHelper(v, v, 2, 0xff0000)
	a2 = new THREE.ArrowHelper(zero, zero, 1, 0x00ff00)
	a3 = new THREE.ArrowHelper(zero, zero, 1, 0x0000ff)
	scene.add(a1)
	//arWorldRoot.add(a2)
	//arWorldRoot.add(a3)
	
	var stats = new Stats();
	document.body.appendChild( stats.dom );
	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
		//arWorldRoot.lookAt(zero);
		
		var v1 = arWorldRoot.position.clone().sub(zero).negate();
		a1.origin = arWorldRoot.position.clone();
		a1.setDirection(v1)
		//var o = arWorldRoot.clone(false);
		//o.lookAt(zero);
		/*var v = o.getWorldDirection();
		a1.length = v.x
		v1 = new THREE.Vector3(0,v.y,0);
		a2.setDirection(v1)
		a2.length = v.y
		v1 = new THREE.Vector3(0,0,v.z);
		a3.setDirection(v1)
		a3.setLength(v.z,0.2,0.2);
		a2.setLength(v.y,0.2,0.2);
		a1.setLength(v.x,0.2,0.2);*/
		
		
		
		//console.log(arWorldRoot.position,v1);
		stats.update();
	})
	arWorldRoot.up = new THREE.Vector3(1,0,0);
	
	var geometry = new THREE.BoxGeometry( .1, 2, .1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube );
	cube.position.set(0,0,-10);

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