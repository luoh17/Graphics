/**
 * Created by Coco Luo on 11/2020
 *      included perspective projection, modelview matrics
 *
 * Program to illustrate the basic ideas of rendering a 3d image
 * using index vertices (element array buffer)
 */
"use strict";

var canvas;
var webgl;

// variables to enable CPU manipulation of GPU uniform "theta"
var theta =0.0;
var thetaLoc;
var deltatheta = 0.001;
var triangleOn = false;

//rotation angle around the origin
var phi = 0.0;
var phiLoc;
var deltaphi = 0.001;
var triangleOn2 = false;

//control specular light
var alpha = 0.0;
var alphaLoc;
var dealtalpha = 0.001;
var triangleOn3 = false;

// frustum information
var near = 3.0;
var far = 5.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect; // Viewport aspect ratio (setup once canvas is known)


// uniform matrices for modelview and projection
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// eye information
var eye = vec3(0.0, 1.0, 4.0);  // eye position
const at = vec3(0.0, 0.0, 0.0, 0.0);  //  direction of view
const up = vec3(0.0, 1.0, 0.0, 1.0);  // up direction


// Four colors associated with the 4 vertices that
// build my pyramid

var vertexColors = [

    //close to blue
    vec4( 135.0/255, 205.0/255, 255.0/255, 1.0),
    vec4( 176.0/255, 226.0/255, 255.0/255, 1.0),
    vec4( 0.0, 154.0/255, 205.0/255, 1.0),
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),

    //light colors
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),
    vec4( 205.0/255, 155.0/255, 155.0/255, 1.0),
    vec4( 205.0/255, 85.0/255, 85.0/255, 1.0),

    vec4( 112.0/255, 128.0/255, 144.0/255, 1.0),
    vec4( 119.0/255, 136.0/255, 153.0/255, 1.0),
    vec4( 176.0/255, 196.0/255, 222.0/255, 1.0),
    vec4( 230.0/255, 230.0/255, 250.0/255, 1.0),

    //close to red
    vec4( 137.0/255, 104.0/255, 205.0/255, 1.0),
    vec4( 147.0/255, 112.0/255, 219.0/255, 1.0),
    vec4( 255.0/255, 228.0/255, 255.0/255, 1.0),
    vec4( 216.0/255, 191.0/255, 216.0/255, 1.0),


    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(1.0, 0.5, 0.0, 1.0),

    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(1.0, 0.5, 0.0, 1.0)


];

// Four vertices that define the geometry of my pyramid
// (all in viewing volume coordinates as homogeneous coordinates) -- 24 triangles in total
var vertexPositions = [
    // corresponds to the positions of each vertex
    vec4(0.0, 0.0, 0.4,1.0),
    vec4(0.4, 0.0, 0.0, 1.0),
    vec4(0.0, 0.45, 0.0, 1.0),
    vec4(-0.4, 0.0, 0.0, 1.0),

    vec4(0.0, 0.0,0.8,1.0),
    vec4(0.8, 0.0, 0.0, 1.0),
    vec4(0.0, -0.4, 0.0, 1.0),
    vec4(-0.8, 0.0, 0.0, 1.0),

    vec4(0.0, 0.0, -0.4 ,1.0),
    vec4(0.4, 0.0, 0.0, 1.0),
    vec4(0.0, 0.45, 0.0, 1.0),
    vec4(-0.4, 0.0, 0.0, 1.0),

    vec4(0.0, 0.0,-0.8,1.0),
    vec4(0.8, 0.0, 0.0, 1.0),
    vec4(0.0, -0.4, 0.0, 1.0),
    vec4(-0.8, 0.0, 0.0, 1.0),

    vec4(0.0, 0.0, 0.5,1.0),
    vec4(0.6, 0.0, 0.0, 1.0),
    vec4(0.0, 0.3, 0.0, 1.0),
    vec4(-0.6, 0.0, 0.0, 1.0),

    vec4(0.0, 0.0, -0.5 ,1.0),
    vec4(0.6, 0.0, 0.0, 1.0),
    vec4(0.0, 0.3, 0.0, 1.0),
    vec4(-0.6, 0.0, 0.0, 1.0)


];



// vertex indices for the 4 triangles that
// constitute my pyramid.  these are entered in
// right hand order (normal vectors point to the outside).
var indices = [
    3, 1, 0,       // triangular faces of 3d object
    0, 1, 2,       //   indexing vertexColors and vertexPositions
    3, 2, 1,
    2, 3, 0,

    6, 5, 7,
    4, 5, 6,
    7, 4, 5,
    6, 7, 4,

    10, 9, 11,
    8, 9, 10,
    11, 8, 9,
    10, 11, 8,

    14, 13, 15,
    12, 13, 14,
    15, 12, 13,
    14, 15, 12,

    18, 17, 16,
    16, 17, 18,
    19, 16, 17,
    18, 19, 16,

    22, 21, 20,
    20, 21, 22,
    23, 20, 21,
    22, 23, 20

];

var positionsArray = [];
var normalsArray = [];
var colorsArray = [];


function triangleControl(){
    triangleOn = !triangleOn;
    if (triangleOn){
        document.getElementById("rButton").style.backgroundColor="#00FF00"
    }else{
        document.getElementById("rButton").style.backgroundColor="#FF0000"
    }
}


function triangleTwoControl(){
    triangleOn2 = !triangleOn2;
    if (triangleOn2){
        document.getElementById("bButton").style.backgroundColor="#00FF00"
    }else{
        document.getElementById("bButton").style.backgroundColor="#FF0000"
    }
}

function triangleThreeControl(){
    triangleOn3 = !triangleOn3;
    if (triangleOn3){
        document.getElementById("lButton").style.backgroundColor="#00FF00"
    }else{
        document.getElementById("lButton").style.backgroundColor="#FF0000"
    }
}


// **************



// define and register callback function to start things off once the html data loads
window.onload = function init()
{

    //register callback function for "rButton" click
    document.getElementById("rButton").onclick = triangleControl;

    //register callback function for "deltatheta" slider change
    document.getElementById("deltatheta").onchange = function (event){
        deltatheta = parseFloat(event.target.value);
    }



    //register callback function for "rButton" click
    document.getElementById("bButton").onclick = triangleTwoControl;
    //register callback function for "deltaphi" slider change
    document.getElementById("dealtaphi").onchange = function (event){
        deltaphi = parseFloat(event.target.value);
    }


    //register callback function for "lButton" click
    document.getElementById("lButton").onclick = triangleThreeControl;
    //register callback function for "deltalpha" slider change
    document.getElementById("dealtalpha").onchange = function (event){
        dealtalpha = parseFloat(event.target.value);
    }


    //set up my canvas

    canvas = document.getElementById( "gl-canvas" );


    webgl = WebGLUtils.setupWebGL( canvas );
    if ( !webgl ) { alert( "WebGL isn't available" ); }


    // set up aspect ratio for frustum
    aspect = canvas.width / canvas.height;

    webgl.viewport( 0, 0, canvas.width, canvas.height );
    webgl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable hidden surface removal (by default uses LESS)
    webgl.enable(webgl.DEPTH_TEST);


    // create synthetic image for indices
    var i = 0;
    for (i = 0; i < indices.length; i+=3){
        myTriangle(indices[i], indices[i+1], indices[i+2],
            vertexColors[i], vertexColors[i+1], vertexColors[i+2]);
    }


    //
    //  Load shaders and initialize attribute buffers
    //  Set webgl context to "program"
    //
    var program = initShaders( webgl, "vertex-shader", "fragment-shader" );
    webgl.useProgram( program );

    // get GPU location of uniforms in <program>
    thetaLoc = webgl.getUniformLocation(program,"theta");
    phiLoc = webgl.getUniformLocation(program,"phi");
    alphaLoc = webgl.getUniformLocation(program,"alpha");
    projectionMatrixLoc = webgl.getUniformLocation(program,"projectionMatrix");
    modelViewMatrixLoc = webgl.getUniformLocation(program,"modelViewMatrix");

    // ******

    // attribute buffers

    // vertex array attribute buffer (indexed by iBuffer)
    //      4 floats corresponding to homogeneous vertex coordinates

    var positionsBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, positionsBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(positionsArray), webgl.STATIC_DRAW );

    var vPositionLOC = webgl.getAttribLocation( program, "vPosition" );
    webgl.vertexAttribPointer( vPositionLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vPositionLOC );

    // normals array attribute buffer
    //      4 floats corresponding to homogeneous vertex vectors
    var normalsBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, normalsBuffer);
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(normalsArray), webgl.STATIC_DRAW );

    var vNormalLoc = webgl.getAttribLocation( program, "vNormal" );
    webgl.vertexAttribPointer( vNormalLoc, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vNormalLoc );

    // color array attribute buffer  (indexed by iBuffer)
    //     4 floats, corresponding to rgba
    var cBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, cBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(vertexColors), webgl.STATIC_DRAW );

    var vColorLOC = webgl.getAttribLocation( program, "vColor" );
    webgl.vertexAttribPointer( vColorLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vColorLOC );


    alert("Passed");

    render();
};


// **************

// recursive render function -- recursive call is synchronized
// with the screen refresh
function render()
{
    // clear the color buffer and the depth buffer
    webgl.clear( webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    // if triangleOneON then increment angle theta, but keep in the range of (0, 2*pi)
    if(triangleOn){
        // compute angle of rotation and pass along to vertex shader
        theta = IncrementClamp(theta,deltatheta, 2.0*Math.PI);
    }
    webgl.uniform1f(thetaLoc,theta);

    //send uniforms phi to get things moving
    //phi = IncrementClamp(phi,deltaphi, 2.0*Math.PI);
    if(triangleOn2){
        phi = IncrementClamp2(phi,deltaphi, 2.0*Math.PI);

    }
    webgl.uniform1f(phiLoc,phi);

    //send uniforms alpha to control the swith of the light
    if(triangleOn3){


        alpha = IncrementClamp3(alpha,dealtalpha, 2.0*Math.PI);

    }
    webgl.uniform1f(alphaLoc,alpha);

    // compute modelView and projection matrices
    // and them pass along to vertex shader
    modelViewMatrix =  lookAt(eye,at,up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    webgl.uniformMatrix4fv( modelViewMatrixLoc, false,
        flatten(modelViewMatrix) );
    webgl.uniformMatrix4fv( projectionMatrixLoc, false,
        flatten(projectionMatrix) );


    // drawElements draws the "elements" (based on indices)
    //webgl.drawElements( webgl.TRIANGLES, attrIndices.length,
       // webgl.UNSIGNED_BYTE, 0 );

    // drawArrays draws the "elements" (based on indices)
    webgl.drawArrays( webgl.TRIANGLES, 0,
        positionsArray.length);


    requestAnimFrame( render );
}



// Utility function to increment a variable and clamp
function IncrementClamp(x, dx, upper){
    var newX = x-0.5*dx;
    if (newX > upper){
        return newX-upper;
    }
    return newX;
}

function IncrementClamp2(x, dx, upper){
    var newX = x+0.05*dx;
    if (newX > upper){
        return newX-upper;
    }
    return newX;
}

function IncrementClamp3(x, dx, upper){
    var newX = x+ 10*dx;
    if (newX > upper){
        return newX-upper;
    }
    return newX;
}

// Unility function to create array of positions and normals
// the 3 input parameters, the indices of the positions of the corners
// of the traingle MUST be entered in a right handed fashion
function myTriangle(iA, iB, iC, cc1, cc2, cc3){
    var A = vertexPositions[iA];
    var B = vertexPositions[iB];
    var C = vertexPositions[iC];

    //push position of each vertex
    positionsArray.push(A);
    positionsArray.push(B);
    positionsArray.push(C);

    var color1 = vertexColors[cc1];
    var color2 = vertexColors[cc2];
    var color3 = vertexColors[cc3];
    // focus on colors for each vertex
    colorsArray.push(color1);
    colorsArray.push(color2);
    colorsArray.push(color3);

    //compute normal to triangle surface (right handed)
    var t1 = subtract(B, A);
    var t2 = subtract(C, A);
    var normal = vec4(normalize(cross(t1, t2)));

    //push normal for each vertex
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

}

