/**
 * @constructor
 * @param {StateGL} stategl
 * @param {Surface} surface
 * @implements {Stage}
 */
function Subdivision(stategl, surface) {
    this.mkProgram(stategl, surface);
}

/**
 * @param {StateGL} stategl
 * @param {Surface} surface
 */
Subdivision.prototype.mkProgram = function(stategl, surface) {
    var sources = StateGL.getShaderSources("Subdivision");
    sources[0] = surface.withTextures(sources[0]);
    sources[1] = surface.withCustomAndCommon(sources[1]);
    this.program = stategl.mkProgram(sources);
};

/** @type {WebGLProgram} */
Subdivision.prototype.program = null;

/**
 * @param {StateGL} stategl
 * @param {Surface} surface
 * @param {WebGLRenderingContext} gl
 */
Subdivision.prototype.render = function(stategl, surface, gl) {
    var i, l;
    var texturesIn = surface.texturesIn,
        texturesOut = surface.texturesOut;
    var program = this.program;
    gl.useProgram(program);

    // read texture into array
    var pixels =
        /** @type {Float32Array} */
        (stategl.readTexture(texturesIn[0]));
    // prepare subdivision patterns and buffers
    var subdivisionPattern = [
        // 1st pattern (no subdivision)
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 2.0, 0.0, 0.0, 1.0,
        // 2nd pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 2.0, 0.5, 0.0, 0.5,
        3.0, 0.0, 1.0, 0.0, 4.0, 0.0, 0.0, 1.0, 5.0, 0.5, 0.0, 0.5,
        // 3rd pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 2.0, 0.0, 0.5, 0.5,
        3.0, 0.0, 0.5, 0.5, 4.0, 0.0, 0.0, 1.0, 5.0, 1.0, 0.0, 0.0,
        // 4th pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 2.0, 0.5, 0.0, 0.5,
        3.0, 0.0, 0.5, 0.5, 4.0, 0.0, 0.0, 1.0, 5.0, 0.5, 0.0, 0.5,
        6.0, 0.5, 0.0, 0.5, 7.0, 0.0, 1.0, 0.0, 8.0, 0.0, 0.5, 0.5,
        // 5th pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0.0, 2.0, 0.0, 0.0, 1.0,
        3.0, 0.0, 0.0, 1.0, 4.0, 0.5, 0.5, 0.0, 5.0, 0.0, 1.0, 0.0,
        // 6th pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0.0, 2.0, 0.5, 0.0, 0.5,
        3.0, 0.5, 0.0, 0.5, 4.0, 0.5, 0.5, 0.0, 5.0, 0.0, 0.0, 1.0,
        6.0, 0.0, 1.0, 0.0, 7.0, 0.0, 0.0, 1.0, 8.0, 0.5, 0.5, 0.0,
        // 7th pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0.0, 2.0, 0.0, 0.5, 0.5,
        3.0, 0.0, 0.0, 1.0, 4.0, 1.0, 0.0, 0.0, 5.0, 0.0, 0.5, 0.5,
        6.0, 0.0, 0.5, 0.5, 7.0, 0.5, 0.5, 0.0, 8.0, 0.0, 1.0, 0.0,
        // 8th pattern
        0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0.0, 2.0, 0.5, 0.0, 0.5,
        3.0, 0.5, 0.5, 0.0, 4.0, 0.0, 1.0, 0.0, 5.0, 0.0, 0.5, 0.5,
        6.0, 0.0, 0.5, 0.5, 7.0, 0.0, 0.0, 1.0, 8.0, 0.5, 0.0, 0.5,
        9.0, 0.5, 0.5, 0.0, 10.0, 0.0, 0.5, 0.5, 11.0, 0.5, 0.0, 0.5
    ];
    var subdivisionPatternFirst = [0, 3, 9, 15, 24, 30, 39, 48];
    var subdivisionPatternCount = [3, 6, 6, 9, 6, 9, 9, 12];
    var subdivisionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, subdivisionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subdivisionPattern),
        gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, surface.framebuffer);

    // prepare input textures
    var texIs = [];
    for (i = 0, l = texturesIn.length; i < l; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texturesIn[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        texIs[i] = i;
    }
    var oldSamplersLocation = gl.getUniformLocation(program, 'oldSamplers');
    gl.uniform1iv(oldSamplersLocation, texIs);

    gl.disable(gl.DEPTH_TEST);
    gl.viewport(0, 0, 2048, 2048);
    var indexOffsetInLocation = gl.getUniformLocation(program,
        'indexOffsetIn');
    var indexOffsetOutLocation = gl.getUniformLocation(program,
        'indexOffsetOut');

    var computedRootsLoc = gl.getUniformLocation(this.program, 'computedRoots');
    var sheets = surface.sheets;
    texIs = [];
    var /** number */ primitivesWritten = 0;

    for (var computedRoots = 0; computedRoots <= sheets + 1; computedRoots += 2) {
        i = computedRoots < sheets ? computedRoots / 2 + 1 : 0;

        gl.bindTexture(gl.TEXTURE_2D, texturesOut[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2048, 2048, 0, gl.RGBA,
            gl.FLOAT, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, texturesOut[i], 0);
        gl.uniform1i(computedRootsLoc, computedRoots);

        // identify and render subdivision patterns
        primitivesWritten = 0;
        for (var j = 0, k = surface.numIndices / 3; j < k; j++) {
            gl.uniform1f(indexOffsetInLocation, 3 * j);
            gl.uniform1f(indexOffsetOutLocation, primitivesWritten);
            var /** number */ patternIndex = 4 * pixels[12 * j + 3] +
                2 * pixels[12 * j + 7] + pixels[12 * j + 11];
            var /** number */ numIndices = subdivisionPatternCount[patternIndex];
            gl.drawArrays(gl.POINTS, subdivisionPatternFirst[patternIndex],
                numIndices);
            primitivesWritten += numIndices;
        }
    }

    // cleanup
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, null, 0);
    for (i = 0, l = texturesIn.length; i < l; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.deleteBuffer(subdivisionBuffer);

    surface.numIndices = primitivesWritten;
    var texturesTmp = texturesIn;
    surface.texturesIn = texturesOut;
    surface.texturesOut = texturesTmp;
};
