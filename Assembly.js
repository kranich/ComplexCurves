/** @constructor
 *  @param {StateGL} stategl
 *  @param {Surface} surface
 *  @param {function()} onload
 *  @implements {Stage} */
function Assembly(stategl, surface, onload) {
    var assembly = this;
    var schedule = new Schedule([
        new Task("mkProgram", [], function(oncomplete) {
            assembly.mkProgram(stategl, surface, oncomplete);
        }),
        new Task("ready", ["mkProgram"], onload)
    ]);
    schedule.run();
}

/** @param {StateGL} stategl
 *  @param {Surface} surface
 *  @param {function()} onload */
Assembly.prototype.mkProgram = function(stategl, surface, onload) {
    var assembly = this;
    StateGL.getShaderSources("assembly", function(sources) {
        sources[1] = surface.withCustomAndCommon(sources[1]);
        assembly.program = stategl.mkProgram(sources);
        onload();
    });
};

/** @param {StateGL} stategl
 *  @param {Surface} surface
 *  @param {WebGLRenderingContext} gl */
Assembly.prototype.render = function(stategl, surface, gl) {
    var texturesIn = surface.texturesIn,
        textureOut = surface.texturesOut[0];
    var sheets = 2; // FIXME
    var webgl_draw_buffers = stategl["WEBGL_draw_buffers"];
    gl.useProgram(this.program);

    var indices = [];
    for (var i = 0; i < sheets * surface.numIndices; i++)
        indices[i] = i;
    gl.bindBuffer(gl.ARRAY_BUFFER, surface.indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, surface.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, textureOut);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
        textureOut, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    var texIs = [];
    for (i = 0; i < texturesIn.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texturesIn[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        texIs[i] = i;
    }
    var samplersLocation = gl.getUniformLocation(this.program, 'samplers');
    gl.uniform1iv(samplersLocation, texIs);
    gl.disable(gl.DEPTH_TEST);
    gl.viewport(0, 0, 2048, 2048);
    gl.drawArrays(gl.POINTS, 0, indices.length);
    gl.flush();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
        null, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var texturesTmp = surface.texturesIn;
    surface.texturesIn = surface.texturesOut;
    surface.texturesOut = texturesTmp;
};
