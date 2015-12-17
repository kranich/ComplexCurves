var SingularityExplorer = {};

/** @param {HTMLCanvasElement} canvas
 *  @param {string} file */
SingularityExplorer.fromFile = function(canvas, file) {
    var state3d = State3D.topView(false);
    new StateGL(canvas, function(gl) {
        gl.loadModel(file, function() {
            SingularityExplorer.renderSurface(state3d, gl);
            SingularityExplorer.registerEventHandlers(canvas, state3d, gl);
        });
    });
};

/** @param {HTMLCanvasElement} canvas
 *  @param {State3D} state3d
 *  @param {StateGL} gl */
SingularityExplorer.registerEventHandlers = function(canvas, state3d, gl) {
    canvas.addEventListener('mousedown', function(evt) {
        evt.preventDefault();
        state3d.mouseDown([evt.clientX, evt.clientY]);
        SingularityExplorer.renderSurface(state3d, gl);
    });
    canvas.addEventListener('mousemove', function(evt) {
        evt.preventDefault();
        state3d.mouseMove(evt.clientX, evt.clientY);
    });
    canvas.addEventListener('mouseup', function(evt) {
        evt.preventDefault();
        state3d.mouseUp();
    });
    canvas.addEventListener('wheel', function(evt) {
        evt.preventDefault();
        state3d.mouseWheel(evt.deltaY);
        SingularityExplorer.renderSurface(state3d, gl);
    });
    canvas.addEventListener('touchstart', function(evt) {
        evt.preventDefault();
        var touch = evt.touches[0];
        state3d.mouseDown([touch.clientX, touch.clientY]);
        SingularityExplorer.renderSurface(state3d, gl);
    });
    canvas.addEventListener('touchmove', function(evt) {
        evt.preventDefault();
        var touch = evt.touches[0];
        state3d.mouseMove(touch.clientX, touch.clientY);
    });
    canvas.addEventListener('touchend', function(evt) {
        evt.preventDefault();
        state3d.mouseUp();
    });
};

/** @param {State3D} st
 *  @param {StateGL} gl */
SingularityExplorer.renderSurface = function(st, gl) {
    gl.renderSurface(st);
    if (st.isRotating()) {
        st.updateRotation();
        requestAnimationFrame(function() {
            SingularityExplorer.renderSurface(st, gl);
        });
    }
};

window['SingularityExplorer'] = SingularityExplorer;
window['SingularityExplorer']['fromFile'] = SingularityExplorer.fromFile;