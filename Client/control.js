/* globals GameController */
if(GameController!=null){
(function(){
  'use strict';
  var canvas = document.querySelector("#othercanvas");
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  document.addEventListener("resize", resize);
  resize();
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