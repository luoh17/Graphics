/**
 * This JavaScript program implements a vivid picture of 2D and 3D images
 * with interactions of lights
 * and textures
 *
 * 'Coco Luo' and 'Victoria Krug'
 * December 2020
 */

// clearer and more secure Javascript source code
"use strict";

// global variables  (CPU memory)
var canvas;
var gl;
//CPU
var pBuffer;  // position buffer
var cBuffer;  // color buffer
var tBuffer;  // type buffer

var pointsArray = [];
var colorsArray = [];
var typesArray = [];

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
    vec4( 250.0/255, 250.0/255, 210.0/255, 1.0),
    //rosyBrown
    vec4( 1.0, 193.0/255, 193.0/255, 1.0),
    vec4( 205.0/255, 155.0/255, 155.0/255, 1.0),
    //IndianRed
    vec4( 205.0/255, 85.0/255, 85.0/255, 1.0),
    //MediumPurple
    vec4( 137.0/255, 104.0/255, 205.0/255, 1.0),
    //Rose
    vec4( 255.0/255, 228.0/255, 255.0/255, 1.0),

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
    vec4( 79.0/255, 79.0/255, 79.0/255, 1.0)

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


// *** ROTATION

//triangle 1 information
var beta = 0.0;
var dealtabeta = 0.0;
// amount to change the angle beta
var betaLoc;

//triangle 2 information
var xi = 0.0;
var dealtaxi = 0.0;
// amount to change the angle xi
var xiLoc;

var i = 0;

// **************

// callback function that starts once html5 window is loaded
window.onload = function init() {

    // SETUP WEBGL ENVIRONMENT
    // associate canvas with "gl-canvas" and setup
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    alert("WebGL available");

    // set up orthgraphic view using the entire canvas, and
    // set the default color of the view as "mustard"
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 1, 1, 1.0 );


    alert("canvas configured");


    //  CONFIGURE GPU SHADERS
    //  Compile and load vertex and fragment shaders
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    //get locations of uniform "beta" and "xi" on shader
    betaLoc = gl.getUniformLocation(program,"beta");
    xiLoc = gl.getUniformLocation(program,"xi");


    // CREATE SYNTHETIC IMAGE
    //------------------------------------------------------------------------------------

    //sky
    rect(vec2(0,0),vec2(512,0),512,230,colorPalette2[9],3.0);

    //mountain
    mountain(vec2(50,230),420,-210, colorPalette2[14],3.0);
    mountain(vec2(0,230),340,-190, colorPalette2[12],3.0);
    mountain(vec2(30,230),266,-115, colorPalette2[14],3.0);
    mountain(vec2(250,230),250,-170, colorPalette2[13],3.0);
    //sun
    circle(vec2(400,50),25,colorPalette2[3],1.0,24);
    //gras
    rect(vec2(0,230),vec2(512,230), 512, 282,colorPalette2[4],3.0);



    //bird
    bird(vec2(450,50),colorPalette2[0],3.0);
    bird(vec2(465,55),colorPalette2[0],3.0);
    bird(vec2(440,65),colorPalette2[0],3.0);
    //road
    mytriangle(vec2(42,512),vec2(470,512), vec2(256,230),colorPalette2[11],3.0);
    rect(vec2(254,250),vec2(258,250),4,20,colorPalette2[0],3.0);
    rect(vec2(253,290),vec2(259,290),6,30,colorPalette2[0],3.0);
    rect(vec2(252,350),vec2(260,350),8,40,colorPalette2[0],3.0);
    rect(vec2(251,430),vec2(261,430),10,55,colorPalette2[0],3.0);
    //house
    house(vec2(415,250),3.0);
    //tree
    tree(vec2(190,220),3.0);
    tree(vec2(110,300),3.0);
    tree(vec2(50,400),3.0);

    //clouds(vec2(400,400), 10)
    clouds(vec2(200,100), colorPalette[7], 6.0,10)
    clouds(vec2(100,120), colorPalette[9], 6.0,10)
    clouds(vec2(130,170), colorPalette[9], 6.0,10)
    clouds(vec2(70,150), colorPalette[6], 6.0,10)
    clouds(vec2(380,180), colorPalette[7], 6.0,10)
    clouds(vec2(500,120), colorPalette[9], 6.0,10)
    clouds(vec2(540,150), colorPalette[7], 6.0,10)

    alert("image made!");

    // CREATE CPU BUFFERS CORRESPONDING TO SHADER ATTRIBUTES,
    // TRANSFER SYNTHETIC IMAGE TO GPU
    //
    // Vertices have three attributes, position, color, and type which will
    // require three buffers
    //
    // set up pBuffer as a buffer where each entry is 8 bytes
    // (2X4 bytes, or 2 thirtytwo bit floats)
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // associate JavaScript vPosition with vertex shader attribute "vPosition"
    // as a two dimensional vector where each component is a float
    var vPosition = gl.getAttribLocation(program, "vPosition");

    // warn the vertex shader, we will only gitve you 2 float, x and y
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    alert("pBuffer and vPosition set up");

    //
    // set up cBuffer as a buffer where each entry is 16 bytes
    // (4x4 bytes, of 4 thirtytwo bit colors)
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // when we flatten, the array is still 2D
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    // associate JavaScript vColor with vertex shader attribute "vColor"
    // as a four dimensional vector (RGBA)
    var vColor = gl.getAttribLocation( program, "vColor");

    // want to work with 4D here, set defualt value "0 "for z and "1" for a
    // this is because we only give them 2 float, x and y
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // set up types Buffer as a buffer where each entry os 16 bytes
    // 4x4 bytes of 4 thirtytwo bit colors
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(typesArray), gl.STATIC_DRAW);

    var vType = gl.getAttribLocation(program,"vType");
    gl.vertexAttribPointer(vType, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vType);

    alert("cBuffer, vColor and vType set up");

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

    //send uniforms beta and xi
    //get things moving
    beta = beta + 0.01;
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
// coordinates are 2D thing
function coordscale(coord) {
    // alert("in coordscale coord= "+coord);

    // this is where we scale, change the coordinates
    // we will push them to the position array latter
    return vec2(2.0 * coord[0] / canvas.width - 1,
        2.0 * (canvas.height - coord[1]) / canvas.height - 1);

}

// ************************

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


    return;
}



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
                base[1] + radius*Math.sin((i+1)*2*Math.PI/Ntriangles)), color, type);
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
    mytriangle(origin, vec2(origin[0]+100,origin[1]-80),vec2(origin[0]+200,origin[1]),colorPalette[1], type);
    mytriangle(vec2(origin[0]+10,origin[1]),vec2(origin[0]+100,origin[1]-75),vec2(origin[0]+190,origin[1]),colorPalette[2], type);
    mytriangle(vec2(origin[0]+10,origin[1]),vec2(origin[0]+10,origin[1]+100),vec2(origin[0]+190,origin[1]+100),colorPalette[10], type);
    mytriangle(vec2(origin[0]+10,origin[1]),vec2(origin[0]+190,origin[1]),vec2(origin[0]+190,origin[1]+100),colorPalette[10], type);
    mytriangle(vec2(origin[0]+35,origin[1]+25),vec2(origin[0]+35,origin[1]+100),vec2(origin[0]+75,origin[1]+25),colorPalette[13], type);
    mytriangle(vec2(origin[0]+75,origin[1]+100),vec2(origin[0]+35,origin[1]+100),vec2(origin[0]+75,origin[1]+25),colorPalette[13], type);
    circle(vec2(origin[0]+68,origin[1]+60),4,colorPalette[3],type,12);
}
//tree out of triangles and circles
//origin is at the upper left corner of the stamp
function tree(origin, type){
    mytriangle(origin, vec2(origin[0]+10,origin[1]),vec2(origin[0],origin[1]+65),colorPalette[14], type);
    mytriangle(vec2(origin[0]+10,origin[1]), vec2(origin[0]+10,origin[1]+65),vec2(origin[0],origin[1]+65),colorPalette[14], type);
    circle(vec2(origin[0]-10,origin[1]-15),45,colorPalette[15], type,16);
    circle(vec2(origin[0]+5,origin[1]-40),45,colorPalette[15],type,16 );
    circle(vec2(origin[0]+20,origin[1]-15),45,colorPalette[15],type,16);
}

