/**
 * This JavaScript program renders an orthographic view of a exciting triangle.
 * The real purpose is to illustrate the basics of rendering.
 *
 * 'Coco Luo'
 * September 2020
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
var index=0;
var i;


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
var theta = 0.0;
// amount to change the angle theta
var dealtaTheta = 0.0;
var thetaLoc;
var triangleOneOn = false;

//triangle 2 information
var phi = 0.0;
// amount to change the angle theta
var dealtaphi = 0.0;
var phiLoc;
var triangleTwoOn = false;

/***
function triangleOneControl(){
    triangleOneOn = !triangleOneOn;
    if (triangleOneOn){
        document.getElementById("rButton").style.backgroundColor="#00FF00"
    }else{
        document.getElementById("rButton").style.backgroundColor="#FF0000"
    }
}

function triangleTwoControl(){
    triangleTwoOn = !triangleTwoOn;
    if (triangleTwoOn){
        document.getElementById("bButton").style.backgroundColor="#00FF00"
    }else{
        document.getElementById("bButton").style.backgroundColor="#FF0000"
    }
}
***/

// callback function that starts once html5 window is loaded
window.onload = function init() {

    //register callback function for "rButton" click
   /***document.getElementById("rButton").onclick = triangleOneControl;

    //register callback function for "deltatheta" slider change
    document.getElementById("dealtaTheta").onchange = function (event){
        dealtaTheta = parseFloat(event.target.value);
    }

    //register callback function for "rButton" click
    document.getElementById("bButton").onclick = triangleTwoControl();

    //register callback function for "deltaphi" slider change
    document.getElementById("dealtaphi").onchange = function (event){
        dealtaphi = parseFloat(event.target.value);
    } ***/

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

    alert("shaders compiled and loaded onto GPU");

    //get locations of uniform "theta" and "phi" on shader
    thetaLoc = gl.getUniformLocation(program,"theta");
    phiLoc = gl.getUniformLocation(program,"phi");

    alert("uniforms phi and theta located");

    // CREATE SYNTHETIC IMAGE

    //my little sun
    sun(vec2(400, 100), 30,  colorPalette[10],1.0, 20)

    //my little house
    house()
    x(vec2(250, 215), 50, colorPalette[11],3.0)

    // my wind machine
    /*x(vec2(130, 240), 20,
        colorPalette[Math.floor(Math.random() * colorPalette.length)],3.0)
    x(vec2(30, 367), 20,
        colorPalette[Math.floor(Math.random() * colorPalette.length)],3.0)
    x(vec2(60, 20), 20,
        colorPalette[Math.floor(Math.random() * colorPalette.length)],3.0)
    x(vec2(200, 400), 20,
        colorPalette[Math.floor(Math.random() * colorPalette.length)],3.0)
    x(vec2(400, 350), 20,
        colorPalette[Math.floor(Math.random() * colorPalette.length)],3.0)
    //my bushes
    bush(vec2(80,400), colorPalette[16],0.0,10)
    bush(vec2(110,468), colorPalette[19],0.0,10)
    bush(vec2(400,468), colorPalette[17],3.0,10)
    bush(vec2(360,468), colorPalette[18],3.0,10) */

    //clouds(vec2(400,400), 10)
    clouds(vec2(200,100), colorPalette[7], 6.0,10)
    clouds(vec2(100,120), colorPalette[9], 0.0,10)
    clouds(vec2(130,170), colorPalette[9], 0.0,10)
    clouds(vec2(70,150), colorPalette[6], 0.0,10)
    clouds(vec2(380,180), colorPalette[7], 6.0,10)
    clouds(vec2(500,120), colorPalette[9], 6.0,10)
    clouds(vec2(540,150), colorPalette[7], 6.0,10)


    //sky
    rect(vec2(0,0),vec2(512,0),512,230,colorPalette2[9]);
    //gras
    rect(vec2(0,230),vec2(512,230), 512, 282,colorPalette2[4]);
    //road
    mytriangle(vec2(42,512),vec2(470,512), vec2(256,230),colorPalette2[11]);
    rect(vec2(254,250),vec2(258,250),4,20,colorPalette2[0]);
    rect(vec2(253,290),vec2(259,290),6,30,colorPalette2[0]);
    rect(vec2(252,350),vec2(260,350),8,40,colorPalette2[0]);
    rect(vec2(251,430),vec2(261,430),10,55,colorPalette2[0]);
    //sun
    circle(vec2(40,50),25,colorPalette2[3],24);
    //mountain
    mountain(vec2(50,230),420,-210, colorPalette2[14]);
    mountain(vec2(0,230),340,-190, colorPalette2[12]);
    mountain(vec2(30,230),266,-115, colorPalette2[14]);
    mountain(vec2(250,230),250,-170, colorPalette2[13]);
    //bird
    bird(vec2(450,50),colorPalette2[0]);
    bird(vec2(465,55),colorPalette2[0]);
    bird(vec2(440,65),colorPalette2[0]);
    //house
    house(vec2(415,250));
    //tree
    tree(vec2(190,220));
    tree(vec2(110,300));
    tree(vec2(50,400));

    alert("image made");

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

    // if triangleOneON then increment angle theta, but keep in the range of (0, 2*pi)
    /***if(triangleOneOn){
        theta = IncrementClampRadians(theta,dealtaTheta);
    }

    // if triangleTwoON then increment angle phi, but keep in the range of (0, 2*pi)
    if(triangleTwoOn){
        phi = IncrementClampRadians(phi,dealtaphi);
    }***/

    //send uniforms theta and phi
    //get things moving
    theta = theta + 0.003;
    gl.uniform1f(thetaLoc, theta);
    phi = phi + 0.005;
    gl.uniform1f(phiLoc, phi);

    // render the 3 points and colors as triangles
    gl.drawArrays( gl.TRIANGLES, 0,pointsArray.length);

    // recursively call render() in the context of the browser
    window.requestAnimFrame(render);
}

// *************************

// utility function to increment and clamp to the (-2*pi, 2*pi)
function IncrementClampRadians(theta, delta){
    theta += delta;
    if (theta >= 2*Math.PI){
        return theta-2*Math.PI;
    }
    return theta;
}

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
function mytriangle(aa, bb, cc, cc1, cc2, cc3, type)
{

    // focus on points to render
    // scale and then push
    pointsArray.push(coordscale(aa));
    pointsArray.push(coordscale(bb));
    pointsArray.push(coordscale(cc));

    // focus on colors for each vertex
    colorsArray.push(cc1);
    colorsArray.push(cc2);
    colorsArray.push(cc3);

    // push types into array
    typesArray.push(type);
    typesArray.push(type);
    typesArray.push(type);

    return;

}



 //the circle function called mytriangle function a couple of times
function sun(base, radius, color, type, Ntriangles){
    var i;

    //using high school trigonometry, render the triangles
    for (i = 0; i<=Ntriangles; i++)
    {
        mytriangle(base,
            vec2(base[0] + radius*Math.cos(i*2*Math.PI/Ntriangles),
                base[1] + radius*Math.sin(i*2*Math.PI/Ntriangles)),

            vec2(base[0] + radius*Math.cos((i+1)*2*Math.PI/Ntriangles),
                base[1] + radius*Math.sin((i+1)*2*Math.PI/Ntriangles)), color, color, color, type);
    }

}

/*
function x(p, l, c, t){

       mytriangle(vec2(p[0], p[1]), vec2(p[0], p[1]+l), vec2(p[0]+l, p[1]+l), c, c, c, t);
       mytriangle(vec2(p[0], p[1]), vec2(p[0]+l, p[1]), vec2(p[0]+l, p[1]-l), c, c, c, t);
       mytriangle(vec2(p[0], p[1]), vec2(p[0]-l, p[1]), vec2(p[0]-l, p[1]+l), c, c, c, t);
       mytriangle(vec2(p[0], p[1]), vec2(p[0], p[1]-l), vec2(p[0]-l, p[1]-l), c, c, c, t);


}

// this is my green bush
function bush(b, color, type, Ncircles){
    //right
    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0]+10*i,b[1]), 30, color, type, 30);
    }

    //up
    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0],b[1]-10*i), 30, color, type, 30);
    }

    for (i = 0; i<=Ncircles/4; i++)
    {
        circle(vec2(b[0]-10*i,b[1]-10*i), 30, color, type, 30);
    }

    for (i = 0; i<=Ncircles/4; i++)
    {
        circle(vec2(b[0]+10*i,b[1]-10*i), 30, color, type, 30);
    }

    //left
    for (i = 0; i<=Ncircles/2; i++)
    {
        circle(vec2(b[0]-10*i,b[1]), 30, color, type, 30);
    }
} */



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

//a little house
function house(){
    mytriangle(vec2(336, 296), vec2(233, 200), vec2(128, 296),colorPalette[22]
        , colorPalette[22],colorPalette[22], 3.0)

    //wall
    mytriangle(vec2(328, 296), vec2(328, 400), vec2(120, 296),colorPalette[21]
        , colorPalette[21],colorPalette[21], 3.0)
    mytriangle(vec2(328, 400), vec2(128, 400), vec2(128, 296),colorPalette[21]
        , colorPalette[21],colorPalette[21], 3.0)

    //door
    mytriangle(vec2(328, 330), vec2(275, 330), vec2(328, 400),colorPalette[22]
        , colorPalette[22],colorPalette[22], 3.0)
    mytriangle(vec2(275, 400), vec2(275, 330), vec2(328, 400),colorPalette[22]
        , colorPalette[22],colorPalette[22], 3.0)

    
}

//rectangle function
//origin is the upper left corner of the rect
//origin1 is the upper right corner of the rect
function rect(origin, origin1, width, height, color){
    mytriangle2(origin,vec2(origin[0]+width,origin[1]),vec2(origin[0],origin[1]+height),color);
    mytriangle2(origin1,vec2(origin[0],origin[1]+height),vec2(origin1[0],origin1[1]+height),color);
    return;
}
//origin is at the bottom left
function mountain(point,width,height, color){
    mytriangle2(point,vec2(point[0]+width,point[1]),vec2(point[0]+(1/2*width),point[1]+height),color);
}
//bird constructed out of two triangles
//origin is at the most left point
function bird(wing, color){
    mytriangle2(wing,vec2(wing[0]+4,wing[1]+10),vec2(wing[0]+4,wing[1]+4),color);
    mytriangle2(vec2(wing[0]+8,wing[1]),vec2(wing[0]+4,wing[1]+5),vec2(wing[0]+4,wing[1]+4),color);
}
//house constructed out of triangles + rect function
//origin is at the left side of the roof
function house(origin){
    mytriangle2(origin, vec2(origin[0]+100,origin[1]-80),vec2(origin[0]+200,origin[1]),colorPalette2[1]);
    mytriangle2(vec2(origin[0]+10,origin[1]),vec2(origin[0]+100,origin[1]-75),vec2(origin[0]+190,origin[1]),colorPalette2[2]);
    mytriangle2(vec2(origin[0]+10,origin[1]),vec2(origin[0]+10,origin[1]+100),vec2(origin[0]+190,origin[1]+100),colorPalette2[10]);
    mytriangle2(vec2(origin[0]+10,origin[1]),vec2(origin[0]+190,origin[1]),vec2(origin[0]+190,origin[1]+100),colorPalette2[10]);
    mytriangle2(vec2(origin[0]+35,origin[1]+25),vec2(origin[0]+35,origin[1]+100),vec2(origin[0]+75,origin[1]+25),colorPalette2[13]);
    mytriangle2(vec2(origin[0]+75,origin[1]+100),vec2(origin[0]+35,origin[1]+100),vec2(origin[0]+75,origin[1]+25),colorPalette2[13]);
    circle(vec2(origin[0]+68,origin[1]+60),4,colorPalette2[3],12);
}
//tree out of triangles and circles
//origin is at the upper left corner of the stamp
function tree(origin){
    mytriangle2(origin, vec2(origin[0]+10,origin[1]),vec2(origin[0],origin[1]+65),colorPalette2[14]);
    mytriangle2(vec2(origin[0]+10,origin[1]), vec2(origin[0]+10,origin[1]+65),vec2(origin[0],origin[1]+65),colorPalette2[14]);
    circle(vec2(origin[0]-10,origin[1]-15),45,colorPalette2[15],16);
    circle(vec2(origin[0]+5,origin[1]-40),45,colorPalette2[15],16);
    circle(vec2(origin[0]+20,origin[1]-15),45,colorPalette2[15],16);
}

// CREATE (SINGLE) COLORED TRIANGLE
// put a triangle into the points and colors arrays
function mytriangle2(aa, bb, cc, cccc)
{
    // focus on points to render
    pointsArray.push(coordscale(aa));
    pointsArray.push(coordscale(bb));
    pointsArray.push(coordscale(cc));
    // focus on colors for each vertex (same in this case)
    colorsArray.push(cccc);
    colorsArray.push(cccc);
    colorsArray.push(cccc);
    return;
}