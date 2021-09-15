/**
 * This JavaScript program implements a vivid picture of 2D and 3D images
 * with interactions of lights
 * and textures
 *
 * 'Coco Luo' and 'Victoria Krug'
 * December 2020 10
 */

// clearer and more secure Javascript source code
"use strict";

// global variables  (CPU memory)
var canvas;
var gl;

// buffers is a block of memory on GPU that store data
// they provide data for variables in vertex shaders
var pBuffer;  // position buffer
var cBuffer;  // color buffer - pick up color arrays and store them
var tBuffer;  // type buffer
var normalsBuffer;
var textBuffer;

// constants to set up the checkerboard
var texSize = 64;
var numRows = 8;
var numCols = 8;

// vertex attributes on CPU
// used to communicate to the vertex shader
var pointsArray = [];
var colorsArray = [];
var typesArray = [];
var normalsArray = [];
var texcoordsArray = [];
var myTexels = new Uint8Array(4*texSize*texSize);
var i;
var index;

// variables to enable CPU manipulation of GPU uniform theta
var theta =0.0;
var thetaLoc;
var deltatheta = 0.001;
var triangleOn = false;

// variables to enable CPU manipulation of GPU uniform phi
var phi = 0.0;
var phiLoc;
var deltaphi = 0.001;
var triangleOn2 = false;

//control specular light
var alpha = 0.0;
var alphaLoc;
var dealtalpha = 0.001;
var triangleOn3 = false;

//control 'bird' button
var bird1 = 0.0;
var birdLoc;
var triangleONBird = false;

// frustum information
var near = 3.0; //front plane cross z
var far = 5.0; //back plane cross z
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect; // Viewport aspect ratio (setup once canvas is known)


// uniform matrices for model view and projection
// transformations from model frame (specify the geometry)
// -> world frame (object frame)
// -> eye frame ()
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// eye information
var eye = vec3(1.0, 2.0, 4.0);  // eye position - center of projection
const at = vec3(0.0, 0.0, 0.0, 0.0);  //  direction of view
const up = vec3(0.0, 1.0, 0.0, 1.0);  // up direction - y axis

//sphere
var numTimesToSubdivide = 3;
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var radius = 1.5;
var gamma  = 0.0;
var psy    = 0.0;
var dr = 5.0 * Math.PI/180.0;



// Coco's color palette -- just simplifies some things  (RGBA)
var colorPalette = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black   0
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red  1
    vec4(1.0, 99.0/255, 71.0/255, 1.0), // tomato  2
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta  3

    vec4(1,239.0/255,213.0/255,1.0), // papaya whip  4
    vec4( 0.0, 1.0, 1.0, 1.0),   // cyan  5
    //Blue
    vec4( 135.0/255, 205.0/255, 255.0/255, 1.0),  //  6
    vec4( 176.0/255, 226.0/255, 255.0/255, 1.0),  //  7

    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0), //10
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),  //11

    vec4( 205.0/255, 155.0/255, 155.0/255, 1.0), //12
    //IndianRed
    vec4( 205.0/255, 85.0/255, 85.0/255, 1.0),  //13
    //MediumPurple
    vec4( 137.0/255, 104.0/255, 205.0/255, 1.0), //14
    //Rose
    vec4( 255.0/255, 228.0/255, 255.0/255, 1.0),  //15

    //Green
    vec4( 162.0, 205.0/255,90.0/255, 1.0),
    vec4( 180.0/255, 238.0/255, 180.0/255, 1.0),
    vec4( 105.0/255, 139.0/255, 105.0/255, 1.0),
    vec4( 46.0/255, 139.0/255, 87.0/255, 1.0),

    //Grey
    vec4( 139.0/255, 137.0/255, 137.0/255, 1.0),
    //HoneyDew
    vec4( 193.0/255, 205.0/255, 193.0/255, 1.0),
    //Grey Dark
    vec4( 79.0/255, 79.0/255, 79.0/255, 1.0),
    vec4(114.0/255,93.0/255,70.0/255,1.0) //brown/darker 14

];

//Victoria's color
var colorPalette2 = [
    vec4( 0.0, 0.0, 0.0, 0.0 ), // white 0
    vec4( 1.0, 0.0, 0.0, 1.0 ), // red 1
    vec4(1.0, 99.0/255, 71.0/255, 1.0), // tomato 2
    vec4( 217.0/255, 180.0/255, 67.0/255, 0.8 ), // yellow 3
    vec4( 59.0/255, 126.0/255, 46.0/255, 0.8 ), // green 4
    vec4( 0.0, 0.0, 1.0, 1.0 ), // blue 5
    vec4( 1.0, 0.0, 1.0, 1.0 ), // magenta 6
    vec4(1,239.0/255,213.0/255,1.0), // papaya whip 7
    vec4( 0.0, 1.0, 1.0, 1.0), // cyan 8
    vec4(27.0/255,167.0/255,202.0/255 ,0.8), //sky 9
    vec4(246.0/255,228.0/255, 173.0/255,1.0), //sand 10
    vec4(137.0/255,138.0/255,139.0/255, 0.8), //grey 11
    vec4(136.0/255,111.0/255,83.0/255,0.9), //brown very light 12
    vec4(135.0/255,110.0/255,82.0/255,1.0), //brown/light 13
    vec4(114.0/255,93.0/255,70.0/255,1.0), //brown/darker 14
    vec4(7.0/255,97.0/255,62.0/255,1.0) //dark green 15
];

//color corresponds to the 3D object
var colorPalette3 = [
    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),

    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),

    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),

    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),

    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),

    vec4( 0.0, 154.0/255, 205.0/255, 1.0),        //  8
    vec4( 79.0/255, 148.0/255, 205.0/255, 1.0),   //  9
    //LGolfenrodYello
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0)

]


var vertexPositions = [

    vec4(0.4, 1.2, 0.8,1.0),
    vec4(0.8, 1.2, 0.4, 1.0),
    vec4(0.4, 1.25, 0.4, 1.0),
    vec4(-0.0, 1.2, 0.4, 1.0),

    vec4(0.4, 0.8,1.2,1.0),
    vec4(1.2, 0.8, 0.4, 1.0),
    vec4(0.4, 0.4, 0.4, 1.0),
    vec4(-0.4, 0.8, 0.4, 1.0),

];



// vertex indices for the triangles that
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

];


// **************************************** ROTATION ***************************************************

var beta = 0.0;
var betaLoc;

var xi = 0.0;
var xiLoc;

//***************************************** Button Controls ********************************************

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

function triangleBirdControl(){
    triangleONBird = !triangleONBird;
    if (triangleONBird){
        document.getElementById("bird").style.backgroundColor="#00FF00"
    }else{
        document.getElementById("bird").style.backgroundColor="#FF0000"
    }
}


// ************************************** INIT ************************************************************

// callback function that starts once html5 window is loaded
window.onload = function init() {

    //********************************** Callback functions ***********************************************

    document.getElementById("rButton").onclick = triangleControl;
    document.getElementById("deltatheta").onchange = function (event){
        deltatheta = parseFloat(event.target.value);
    }

    document.getElementById("bButton").onclick = triangleTwoControl;
    document.getElementById("dealtaphi").onchange = function (event){
        deltaphi = parseFloat(event.target.value);
    }

    document.getElementById("lButton").onclick = triangleThreeControl;
    document.getElementById("dealtalpha").onchange = function (event){
        dealtalpha = parseFloat(event.target.value);
    }

    document.getElementById("bird").onclick = triangleBirdControl;


    //************************** SETUP WEBGL ENVIRONMENT **********************************************

    // associate canvas with "gl-canvas" and setup
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // set up aspect ratio for frustum
    aspect = canvas.width / canvas.height;

    // set up orthgraphic view using the entire canvas, and
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 1, 1, 1.0 );

    // enable hidden surface removal (by default uses LESS)
    gl.enable(gl.DEPTH_TEST);




    //  ************************************** CONFIGURE GPU SHADERS **************************************

    //  Compile and load vertex and fragment shaders
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    alert("shaders compiled and loaded onto GPU");

    //get locations of uniform "beta" and "xi" on shader
    betaLoc = gl.getUniformLocation(program,"beta");
    xiLoc = gl.getUniformLocation(program,"xi");



    // **************************************** CREATE SYNTHETIC IMAGE *************************************

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide, 10.0);

    for (i = 0; i < indices.length; i+=3){
        myTriangle2(indices[i], indices[i+1], indices[i+2], 10.0);
    }

    //birds
    bird(vec2(420,50),colorPalette2[0],1.0);
    bird(vec2(435,55),colorPalette2[0],1.0);
    bird(vec2(410,65),colorPalette2[0],1.0);

    //flower
    flower(vec2(440,390),colorPalette2[2],3.0);
    flower(vec2(423,420),colorPalette2[9],3.0);
    flower(vec2(455,435),colorPalette[14],3.0);
    flower(vec2(360,250),colorPalette[15],3.0);
    flower(vec2(350,285),colorPalette[17],3.0);
    flower(vec2(365,315),colorPalette[13],3.0);
    flower(vec2(318,263),colorPalette[10],3.0);

    //tree
    tree(vec2(190,220),3.0);
    tree(vec2(110,300),3.0);
    tree(vec2(50,400),3.0);

    //house
    house(vec2(375,250),3.0);

    //clouds
    clouds(vec2(200,100), colorPalette[7], 6.0,10);  //I CHANGED THEM FROM TYPE 6.0 to 3.0
    clouds(vec2(70,150), colorPalette[9], 6.0,10);
    clouds(vec2(345,80), colorPalette[6], 6.0,10);
    clouds(vec2(500,120), colorPalette[9], 6.0,10);
    clouds(vec2(540,150), colorPalette[7], 6.0,10);

    //road
    rect(vec2(254,250),vec2(258,250),4,20,colorPalette2[0],3.0);
    rect(vec2(253,290),vec2(259,290),6,30,colorPalette2[0],3.0);
    rect(vec2(252,350),vec2(260,350),8,40,colorPalette2[0],3.0);
    rect(vec2(251,430),vec2(261,430),10,55,colorPalette2[0],3.0);
    mytriangle(vec2(42,512),vec2(470,512), vec2(256,230),colorPalette2[11],3.0);

    //gras
    rect(vec2(0,230),vec2(512,230), 512, 282,colorPalette2[4],3.0);

    //sun
    circle(vec2(100,100),25,colorPalette2[3],2.0,24);
    //mountain
    mountain(vec2(50,230),420,-210, colorPalette2[14],3.0);
    mountain(vec2(0,230),340,-190, colorPalette2[12],3.0);
    mountain(vec2(30,230),266,-115, colorPalette2[14],3.0);
    mountain(vec2(250,230),250,-170, colorPalette2[13],3.0);


    //sky
    rect(vec2(0,0),vec2(512,0),512,230,colorPalette2[9],3.0);




    alert("image made");



    // get GPU location of uniforms in <program>
    thetaLoc = gl.getUniformLocation(program,"theta");
    phiLoc = gl.getUniformLocation(program,"phi");
    alphaLoc = gl.getUniformLocation(program,"alpha");
    birdLoc = gl.getUniformLocation(program,"bird1");
    projectionMatrixLoc = gl.getUniformLocation(program,"projectionMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program,"modelViewMatrix");



    // CREATE CPU BUFFERS CORRESPONDING TO SHADER ATTRIBUTES,
    // TRANSFER SYNTHETIC IMAGE TO GPU
    //
    // Vertices have 5 attributes which will
    // require position, color, type, normal, and texture buffers
    //
    // set up pBuffer as a buffer where each entry is 8 bytes
    // (2X4 bytes, or 2 thirtytwo bit floats)
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    // associate JavaScript vPosition with vertex shader attribute "vPosition"
    // as a two dimensional vector where each component is a float
    var vPositionLOC = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPositionLOC, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionLOC );


    // normals array attribute buffer
    //      4 floats corresponding to homogeneous vertex vectors
    normalsBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormalLoc = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer(vNormalLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormalLoc );


    // texture array attribute buffer
    textBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, textBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texcoordsArray), gl.STATIC_DRAW );

    var vTexLoc = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexLoc );


    //
    // set up cBuffer as a buffer where each entry is 16 bytes
    // (4x4 bytes, of 4 thirtytwo bit colors)
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // when we flatten, the array is still 2D
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    // associate JavaScript vColor with vertex shader attribute "vColor"
    // as a four dimensional vector (RGBA)
    var vColorLOC = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColorLOC, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColorLOC );

    // set up types Buffer as a buffer where each entry os 16 bytes
    // 4x4 bytes of 4 thirtytwo bit colors
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(typesArray), gl.STATIC_DRAW);

    var vType = gl.getAttribLocation(program,"vType");
    gl.vertexAttribPointer(vType, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vType);

    alert("set up");

    //create Angel & Shreiner checkerboard
    // create synthetic texture
    for (var i = 0; i < texSize; ++i){
        for (var j = 0; j < texSize; ++j){
            var patchx = Math.floor(i/(texSize/numRows));
            var patchy = Math.floor(j/(texSize/numCols));

            var mycolor = (patchx % 2 !== patchy % 2 ? 255 : 0);

            myTexels[4 * i * texSize + 4 * j + 0] = mycolor;  //red 4 * i * texSize + 4 * j + 0
            myTexels[4 * i * texSize + 4 * j + 1] = mycolor;  //green
            myTexels[4 * i * texSize + 4 * j + 2] = mycolor;  //blue
            myTexels[4 * i * texSize + 4 * j + 3] = 255;  //A

        }
    }

    alert("texture built");
    // make texture as the current texture
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0); //place current texture in texture
    //register 0

    gl.bindTexture(gl.TEXTURE_2D, texture);

    //flip the texture to aligh with the framebuffer
    // do we need TEXTURE_2D??
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // move myTexels to GPU via the pixel pipeline
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, myTexels);

    // use mipmaps to deal with alias effects
    //automatically generate mipmaps of resolution 32x32, 16x16, 8x8, 4x4, 2x2, 1x1
    gl.generateMipmap(gl.TEXTURE_2D);
    // for minification use linear filtering on best mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);

    // for magnification use nearest point
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
        gl.NEAREST);

    //*************************- IMAGE -********************************************


    // INITIATE RENDERING OF SYNTHETIC IMAGE
    // render away
    render();
}


// ****************************

// RENDER THE IMAGE
// recursive function to render the synthetic image
function render() {


    // clear the working buffer
    gl.clear( gl.COLOR_BUFFER_BIT );

    // if triangleOneON then increment angle theta, but keep in the range of (0, 2*pi)
    if(triangleOn){
        // compute angle of rotation and pass along to vertex shader
        theta = IncrementClamp(theta,deltatheta, 2.0*Math.PI);
    }
    gl.uniform1f(thetaLoc,theta);

    //send uniforms phi to get things moving
    //phi = IncrementClamp(phi,deltaphi, 2.0*Math.PI);
    if(triangleOn2){
        phi = IncrementClamp2(phi,deltaphi, 2.0*Math.PI);

    }
    gl.uniform1f(phiLoc,phi);

    //send uniforms alpha to control the swith of the light
    if(triangleOn3){


        alpha = IncrementClamp3(alpha,dealtalpha, 2.0*Math.PI);

    }

    if (triangleONBird) {
        bird1 += 0.0075;
    }

    gl.uniform1f(birdLoc,bird1);


    gl.uniform1f(alphaLoc,alpha);

    // compute modelView and projection matrices
    // and them pass along to vertex shader
    modelViewMatrix =  lookAt(eye,at,up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false,
        flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false,
        flatten(projectionMatrix) );

    //send uniforms beta and xi
    //get things moving
    beta = beta + 0.001;
    gl.uniform1f(betaLoc, beta);
    xi = xi + 0.0009;
    gl.uniform1f(xiLoc, xi);

    // render the 3 points and colors as triangles
    gl.drawArrays( gl.TRIANGLES, 0,pointsArray.length);

    // recursively call render() in the context of the browser
    window.requestAnimFrame(render);
}

// *************************
// CONVERT FROM "BROWSER COORDINATES" TO "WEBGL" COORDINATES
// Of course this could be put into the vertex shader.
// coordinates will return 4D thing
function coordscale(coord) {
    // alert("in coordscale coord= "+coord);

    // this is where we scale, change the coordinates
    // we will push them to the position array latter
    return vec4(2.0 * coord[0] / canvas.width - 1,
        2.0 * (canvas.height - coord[1]) / canvas.height - 1, 0.0, 1.0); //or put picture in the back with -0.999

}

// ************************


//the circle function called mytriangle function a couple of times
function circle(base, radius, color, type, Ntriangles){
    var i;

    //using high school trigonometry, render the triangles
    for (i = 0; i<=Ntriangles; i++)
    {
        mytriangle(base,
            vec2(base[0] + radius*Math.cos(i*2*Math.PI/Ntriangles),
                base[1] + radius*Math.sin(i*2*Math.PI/Ntriangles)),

            vec2(base[0] + radius*Math.cos((i+1)*2*Math.PI/Ntriangles),
                base[1] + radius*Math.sin((i+1)*2*Math.PI/Ntriangles)), color,type);
    }

}



function clouds(b, c, type, Ncircles){

    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0]+10*i,b[1]), 20, c, type,30);
    }

    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0],b[1]-10*i), 20, c, type,30);
    }

    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0]-10*i,b[1]-10*i), 20, c, type,30);
    }

    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0]+10*i,b[1]-10*i), 20, c, type,30);
    }

    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0]-10*i,b[1]), 20, c, type,30);
    }
}

//rectangle function
//origin is the upper left corner of the rect
//origin1 is the upper right corner of the rect
function rect(origin, origin1, width, height, color, type){
    mytriangle(origin,vec2(origin[0]+width,origin[1]),vec2(origin[0],origin[1]+height),color, type);
    mytriangle(origin1,vec2(origin[0],origin[1]+height),vec2(origin1[0],origin1[1]+height),color, type);
    return;
}
//origin is at the bottom left
function mountain(point,width,height, color, type){
    mytriangle(point,vec2(point[0]+width,point[1]),vec2(point[0]+(1/2*width),point[1]+height),color, type);
}
//bird constructed out of two triangles
//origin is at the most left point
function bird(wing, color, type){
    mytriangle(wing,vec2(wing[0]+4,wing[1]+10),vec2(wing[0]+4,wing[1]+4),color, type);
    mytriangle(vec2(wing[0]+8,wing[1]),vec2(wing[0]+4,wing[1]+5),vec2(wing[0]+4,wing[1]+4),color, type);
}
//house constructed out of triangles + rect function
//origin is at the left side of the roof
function house(origin, type){
    circle(vec2(origin[0]+68,origin[1]+60),4,colorPalette2[3],type,12);
    mytriangle(vec2(origin[0]+10,origin[1]),vec2(origin[0]+100,origin[1]-75),vec2(origin[0]+190,origin[1]),colorPalette2[2], type); //roof
    mytriangle(origin, vec2(origin[0]+100,origin[1]-80),vec2(origin[0]+200,origin[1]),colorPalette2[1], type); //roof
    mytriangle(vec2(origin[0]+35,origin[1]+25),vec2(origin[0]+35,origin[1]+100),vec2(origin[0]+75,origin[1]+25),colorPalette2[13], type); //door
    mytriangle(vec2(origin[0]+75,origin[1]+100),vec2(origin[0]+35,origin[1]+100),vec2(origin[0]+75,origin[1]+25),colorPalette2[13], type); //door
    mytriangle(vec2(origin[0]+10,origin[1]),vec2(origin[0]+10,origin[1]+100),vec2(origin[0]+190,origin[1]+100),colorPalette2[10], type); //base
    mytriangle(vec2(origin[0]+10,origin[1]),vec2(origin[0]+190,origin[1]),vec2(origin[0]+190,origin[1]+100),colorPalette2[10], type); //base

}
//tree out of triangles and circles
//origin is at the upper left corner of the stamp
function tree(origin, type){
    circle(vec2(origin[0]-10,origin[1]-15),45,colorPalette2[15], type,16);
    circle(vec2(origin[0]+5,origin[1]-40),45,colorPalette2[15],type,16 );
    circle(vec2(origin[0]+20,origin[1]-15),45,colorPalette2[15],type,16);
    mytriangle(origin, vec2(origin[0]+10,origin[1]),vec2(origin[0],origin[1]+65),colorPalette2[14], type);
    mytriangle(vec2(origin[0]+10,origin[1]), vec2(origin[0]+10,origin[1]+65),vec2(origin[0],origin[1]+65),colorPalette2[14], type);
}

function flower(origin,color, type){
    circle(vec2(origin[0]+2,origin[1]-8),4,colorPalette2[3],type,12); //middle yellow
    circle(vec2(origin[0]+2,origin[1]-12),6,color,type,12);
    circle(vec2(origin[0]+6,origin[1]-8),6,color,type,12);
    circle(vec2(origin[0]+2,origin[1]-4),6,color,type,12);
    circle(vec2(origin[0]-2,origin[1]-8),6,color,type,12);
    mytriangle(origin, vec2(origin[0]+4,origin[1]),vec2(origin[0],origin[1]+12),colorPalette2[15],type);
    mytriangle(vec2(origin[0]+4,origin[1]), vec2(origin[0]+4,origin[1]+12),vec2(origin[0],origin[1]+12),colorPalette2[15],type);
    mytriangle(vec2(origin[0],origin[1] +12),vec2(origin[0],origin[1] + 8),vec2(origin[0]-4,origin[1] +3),colorPalette2[15],type);
    mytriangle(vec2(origin[0]+ 4, origin[1]+12),vec2(origin[0]+4,origin[1]+3),vec2(origin[0]+8,origin[1]),colorPalette2[15],type);

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



// CREATE (SINGLE) COLORED TRIANGLE
// put a triangle into the points and colors arrays
function mytriangle(aa, bb, cc, cccc, type)
{
    // focus on points to render

    pointsArray.push(coordscale(aa));
    pointsArray.push(coordscale(bb));
    pointsArray.push(coordscale(cc));
    // focus on colors for each vertex (same in this case)
    colorsArray.push(cccc);
    colorsArray.push(cccc);
    colorsArray.push(cccc);
    // push types into array
    typesArray.push(type);
    typesArray.push(type);
    typesArray.push(type);

    //push normal for each vertex
    normalsArray.push(vec4(0.0,0.0,1.0, 1.0));
    normalsArray.push(vec4(0.0,0.0,1.0, 1.0));
    normalsArray.push(vec4(0.0,0.0,1.0, 1.0));

    // push texture coordinates for each
    texcoordsArray.push(vec2(0.0, 0.0));
    texcoordsArray.push(vec2(0.5, 0.5));
    texcoordsArray.push(vec2(1.0, 0.0));

    return;
}




// Unility function to create array of positions and normals
// the 3 input parameters, the indices of the positions of the corners
// of the traingle MUST be entered in a right handed fashion
function myTriangle2(iA, iB, iC, type){


    var A = vertexPositions[iA];
    var B = vertexPositions[iB];
    var C = vertexPositions[iC];

    //push position of each vertex
    pointsArray.push(A);
    pointsArray.push(B);
    pointsArray.push(C);

    // focus on colors for each vertex
    colorsArray.push(colorPalette3[iA]);
    colorsArray.push(colorPalette3[iB]);
    colorsArray.push(colorPalette3[iC]);

    //compute normal to triangle surface (right handed)
    var t1 = subtract(B, A);
    var t2 = subtract(C, A);
    var normal = vec4(normalize(cross(t1, t2)));

    //push normal for each vertex
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    // push types into array
    typesArray.push(type);
    typesArray.push(type);
    typesArray.push(type);

    // push texture coordinates for each
    texcoordsArray.push(vec2(0.0, 0.0));
    texcoordsArray.push(vec2(1.0, 0.5));
    texcoordsArray.push(vec2(1.0, 0.0));
}

function triangle(a, b, c, type) {

    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal);
    normal[3]  = 0.0;

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    //push position of each vertex
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // focus on colors for each vertex
    colorsArray.push(vec4( 250.0/255, 250.0/255, 210.0/255, 1.0));
    colorsArray.push(vec4( 250.0/255, 250.0/255, 210.0/255, 1.0));
    colorsArray.push(vec4( 250.0/255, 250.0/255, 210.0/255, 1.0));

    // push types into array
    typesArray.push(type);
    typesArray.push(type);
    typesArray.push(type);

    // push texture coordinates for each
    texcoordsArray.push(vec2(0.0, 0.0));
    texcoordsArray.push(vec2(0.0, 0.0));
    texcoordsArray.push(vec2(0.0, 0.0));

    index += 3;
}


function divideTriangle(a, b, c, count, type) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c , type);
    }
}


function tetrahedron(a, b, c, d, n, type) {
    divideTriangle(a, b, c, n,  type);
    divideTriangle(d, c, b, n,  type);
    divideTriangle(a, d, b, n,  type);
    divideTriangle(a, c, d, n,  type);
}