    var x0, y0, x1, y1, dx, dy; //global variables

    var canvas = document.getElementById("canvas");
    var canvasObject = canvas.getContext("2d");
    var canvasWidth = canvas.width; // geting width from html view
    var canvasHeight = canvas.height; // geting height from html view

    //canvas for showing angle1
    function writeAngle1(canvas, message) {
        var canvas = document.getElementById("canvasAngle1");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText(message, 10, 20);
    }

    //canvas for showing angle2
    function writeAngle2(canvas, message) {
        var canvas = document.getElementById("canvasAngle2");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText(message, 10, 20);
    }

    function reOffset() {
        var sizeOfElement = canvas.getBoundingClientRect();
        offsetX = sizeOfElement.left;
        offsetY = sizeOfElement.top;

    }

    var offsetX, offsetY;
    reOffset(); // function calling

    window.onscroll = function(e) {
        reOffset();
    }

    window.onresize = function(e) {
        reOffset();
    }

    // dragging vars
    var isDown = false;
    var startX, startY;

    // line vars and array of lines
    var nearest;
    var lines = [];
    lines.push({
        x0: 600,
        y0: 60,
        x1: 0,
        y1: 60
    }); // co-ordinates for horizontal line one
    lines.push({
        x0: 600,
        y0: 180,
        x1: 0,
        y1: 180
    }); // co-ordinates for horizontal line two
    lines.push({
        x0: 400,
        y0: 10,
        x1: 200,
        y1: 230
    }); // co-ordinates for transversal line

    draw();
    findAngle(lines[2]);

    // draw the line
    function draw() {
        canvasObject.clearRect(0, 0, canvasWidth, canvasHeight);

        // draw all lines at their current positions
        for (var i = 0; i < lines.length; i++) {
            drawLine(lines[i], 'black');
            drawCircle(lines[i].x0, lines[i].y0);
            drawCircle(lines[i].x1, lines[i].y1)
            if (nearest) {

                // point on line nearest to mouse
                canvasObject.beginPath();
                canvasObject.arc(nearest.point.x, nearest.point.y, 5, 0, Math.PI * 2);
                canvasObject.strokeStyle = 'green';
                canvasObject.stroke();

                // hightlight the line as its dragged
                drawLine(nearest.line, 'red');
            }
        }
    }

    //function to draw line
    function drawLine(line, color) {
        canvasObject.beginPath();
        canvasObject.moveTo(line.x0, line.y0);
        canvasObject.lineTo(line.x1, line.y1);
        canvasObject.lineWidth = 2;
        canvasObject.lineCap = 'round';
        canvasObject.strokeStyle = color;
        canvasObject.stroke();
    }

    //function to draw circle
    function drawCircle(x, y) {
        canvasObject.beginPath();
        canvasObject.arc(x, y, 5, 0, Math.PI * 2);
        canvasObject.fillStyle = 'red';
        canvasObject.fill();
        canvasObject.stroke();
    }

    // listen for mouse events
    $("#canvas").mousedown(function(e) {
        handleMouseDown(e);
    });
    $("#canvas").mousemove(function(e) {
        handleMouseMove(e);
    });
    $("#canvas").mouseup(function(e) {
        handleMouseUpOut(e);
    });

    // select the nearest line by mouse
    function closestLine(mx, my) {
        var dist = 15;
        var index, point;
        for (var i = 0; i < lines.length; i++) {
            var xy = closestXY(lines[i], mx, my);
            var dx = mx - xy.x;
            var dy = my - xy.y;
            var thisDist = dx * dx + dy * dy;
            if (thisDist < dist) {
                dist = thisDist;
                point = xy;
                index = i;
            }
        }
        var line = lines[index];
        return ({
            point: point,
            line: line
        });
    }

    // linear interpolation -- needed in setClosestLine()
    function lerp(a, b, x) {
        return (a + x * (b - a));
    }

    // find closest XY on line to mouse XY
    function closestXY(line, mx, my) {
        x0 = line.x0;
        y0 = line.y0;
        x1 = line.x1;
        y1 = line.y1;
        dx = x1 - x0;
        dy = y1 - y0;
        var t = ((mx - x0) * dx + (my - y0) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t));
        var x = lerp(x0, x1, t);
        var y = lerp(y0, y1, t);
        if (line === lines[2]) {
            var d0 = Math.sqrt((x - line.x0) * (x - line.x0) + (y - line.y0) * (y - line.y0));
            var d1 = Math.sqrt((line.x1 - x) * (line.x1 - x) + (line.y1 - y) * (line.y1 - y));
            if (d0 < d1) {
                return {
                    x: x0,
                    y: y0
                }
            } else {
                return {
                    x: x1,
                    y: y1
                }
            }
        } else {
            return ({
                x: x,
                y: y
            });
        }
    }

    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        // mouse position
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);
        draw();

        // find nearest line to mouse
        nearest = closestLine(startX, startY);
        // set dragging flag
        isDown = true;
    }

    function handleMouseUpOut(e) {

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // clear dragging flag
        isDown = false;
        nearest = null;
        draw();
    }

    function handleMouseMove(e) {
        if (!isDown) {
            return;
        }

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        // mouse position
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        // calc how far mouse has moved since last mousemove event
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        startX = mouseX;
        startY = mouseY;

        var line = nearest.line;
        if (line === lines[2]) {
            if (nearest.point.x == nearest.line.x0 && nearest.point.y == nearest.line.y0) {
                line.x0 += dx;
                nearest.point.x += dx;
            } else {
                line.x1 += dx;
                nearest.point.x += dx;
            }

        } else {
            line.y0 += dy;
            line.y1 += dy;
            nearest.point.y += dy;
        }
        // redraw
        draw();
        findAngle(lines[2]);
    }

    //function for finding angle
    function findAngle(line) {
        var angle1 = Math.atan2(line.y0 - line.y1, line.x0 - line.x1);
        angle1 = angle1 * 180 / Math.PI;
        if (angle1 < 0)
            angle1 = -angle1;
        angle2 = 180 - angle1;
        writeAngle1(canvas, angle1.toFixed(0).toString());
        writeAngle2(canvas, angle2.toFixed(0).toString());
    }
