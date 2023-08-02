//Author: Nash Euto
//Function: Handles all of the functions and events for the main page and the Cesium map on the page

/* CONTROLS
* Right click activates all of the interactions
* To stop drawing, double left click
* Left click selects entities. It does not work when multiselection is active or when move is active
* To move entities left click them and they'll follow the mouse. Right click to stop
*/

//This project was made as a demo for a new API that is being tested in the CHL
//To change the members of a cesium object, you have to use dot notation to access the variables
//Often, defining new things to put into objects does not work because the fields of what you are creating already exist and should just be modified with dot notation
//For example, instead of making a new EntityCluster and then adding it to the source, all you need to do is use dot notation to modify the entity cluster that already exists at the conception of the object 
//The docs tell you the objects that already exist inside an object on its creation, not objects that you need to make yourself then add
//NOTE ABOUT COORDINATES: Cesium offers two kinds of coordinate systems: Cartesian and cartographic. Cartographic is long lat in radians and cartesian is meters

$(function(){
  Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Y2M3NTVjOS05YmE2LTQyNmEtYjQ1MS1hODBlNWM1MmYwZTIiLCJpZCI6MTUwNTM1LCJpYXQiOjE2ODgxNTI4MzN9.yswdjP2gynH4ndTniyMFIJkCpkzpl7fePBeomQ_-WnY';

  //Change the dropdown box back to the point option
  $('#draw-options option[value="1"]').attr('selected', true)

  /*
  * Whenever a new entity is selected using the select interaction, getValues is called.
  * When getValues is called, it empties the select value in the modal and checks to see if the entity selected is a point or a lake polygon. 
  * Lake polygons have a string instead of an int id. Slice the id out of the string and check to see if it matches with an ID that has info associated with it
  * If the value is a point or the lake has a point associated with it, call fetchValues to initate the get request
  */
  var multiSelect = []; 
   
  //Used to send the get request
  function getValues(viewer, dict){
    var select = $("#lakes"); //Get the html select field
    select.empty(); //Get rid of everything that was in the old select menu
    //If a user selects something, it can only be a polygon or an icon. Icons always match lakes that have data, but polygons don't so we must check if they do
    let id = viewer.selectedEntity.id
    let entity = viewer.selectedEntity
    //If the id is a string, a polygon was selected
    if(typeof(viewer.selectedEntity.id) == 'string'){
      id = viewer.selectedEntity.id.slice(16); //Cut out the id
      if(dict[id] != undefined){
        entity = dict[id];
      } 
    }
      multiSelect = [entity];
      select.append($("<option/>").attr("value", 0).text(entity.name + " - " + id));
      fetchValues(entity);
    }

  /*
  * Send a get request to get the info for the selected entity
  * If the flag that is returned with data is true, then the id does not have info associated with it
  * Set up the info to be displayed on the modal and show the modal
  */
  function fetchValues(entity){
    $.get(
      "/apps/cesiumproject/csvjson", //Send a get request to the dummy site so the controller will send the data over in a JsonResponse
      { id: entity.id}, //Send the ID to get data for the specific hydrograph
      function(data){
        if(data.flag){
          return false
        }
        var infoPromise = new Promise((resolve) => {
          //Our data is in a JSON - parse it to get the object
          var x_axis_object = JSON.parse(data['dateList']);
          var y_axis_object = JSON.parse(data['hydroPoints']);

          //The object holds values which are keyed by indexes. Get the values in an array
          var x_values = Object.values(x_axis_object);
          var y_values = Object.values(y_axis_object);
          
          //Store the graph data in the entity to use it in the creation of a CSV
          entity.properties['dates'] = x_values;
          entity.properties['values'] = y_values;

  
          var plotData = {
            x: x_values,
            y: y_values,
            type: 'scatter',
          };

          var title = document.getElementById('myModalLabel');
          var id = document.getElementById('id-block');
          var lonlat = document.getElementById('lonlat');
          var continent = document.getElementById('continent');
          var country = document.getElementById('country');
          var volume = document.getElementById('volume');
          var src = document.getElementById('src');
          var dis = document.getElementById('dis');
          var elevation = document.getElementById('elevation');
          var wshd = document.getElementById('wshd');
          var pLongLat = document.getElementById('pLongLat');
          var area = document.getElementById('area');
          var length = document.getElementById('length');
          var dev = document.getElementById('dev');
          var res = document.getElementById('res');
          var depth = document.getElementById('depth');
          var time = document.getElementById('time');
          var slope = document.getElementById('slope');
          
          var properties = entity.properties;

          //Configure the informtion and html for the modal
          Plotly.newPlot(document.getElementById('figure'), [plotData], layout, {responsive: true})
          title.innerHTML = '<h3>' + entity.name + '</h3>';
          id.innerHTML = '<h6>' + 'ID: ' + entity.id + '</h6>';
          lonlat.innerHTML = '<h6>' + 'Coordinates: (' + properties['lat'] + ', ' + properties['lon'] + ')' + '</h6>';
          continent.innerHTML = '<h6>' + 'Continent: ' + properties['continent'] + '</h6>';
          country.innerHTML = '<h6>' + 'Country: ' + properties['country'] + '</h6>';
          volume.innerHTML = '<h6>' + 'Volume: ' + properties['vol'] + '</h6>';
          src.innerHTML = '<h6>' + 'Src: ' + properties['src'] + '</h6>';
          dis.innerHTML = '<h6>' + 'Dis: ' + properties['dis'] + '</h6>';
          elevation.innerHTML = '<h6>' + 'Elevation: ' + properties['elevation'] + '</h6>';
          wshd.innerHTML = '<h6>' + 'Watershed: ' + properties['wshd'] + '</h6>';
          pLongLat.innerHTML = '<h6>' + 'Pour Coordinates: (' + properties['pourLat']+ ', ' + properties['pourLong'] + ')' + '</h6>';
          area.innerHTML = '<h6>' + 'Area: ' + properties['area'] + '</h6>';
          length.innerHTML = '<h6>' + 'Length: ' + properties['len'] + '</h6>';
          dev.innerHTML = '<h6>' + 'Dev: ' + properties['dev'] + '</h6>';
          res.innerHTML = '<h6>' + 'Res: ' + properties['res'] + '</h6>';
          depth.innerHTML = '<h6>' + 'Depth: ' + properties['depth'] + '</h6>';
          time.innerHTML = '<h6>' + 'Time: ' + properties['time'] + '</h6>';
          slope.innerHTML = '<h6>' + 'Slope: ' + properties['slope'] + '</h6>';
          resolve();
        });
        
        //Once all of the info collecting is done, show the modal
        infoPromise.then(() => {
          $('#exampleModal').modal('show');
        });
        return true
      },
    'json');
  }
  
  //Grab the arrays from the data passed through the html 
  var latList = myData.lat;
  var longList = myData.long;
  var nameList = myData.nameList;
  var idList = myData.id;
  var countryList = myData.country;
  var continentList = myData.continent
  var pLatList = myData.pour_lat;
  var pLongList = myData.pour_long;
  var areaList = myData.lake_area;
  var lenList = myData.shore_len;
  var devList = myData.shore_dev;
  var totalVolList = myData.vol_total;
  var resTotalList = myData.vol_res;
  var srcTotalList = myData.vol_src;
  var depthList = myData.depth_avg;
  var disList = myData.dis_avg;
  var timeList = myData.res_time;
  var elevationList = myData.elevation;
  var slopeList = myData.slope_100;
  var wshdList = myData.wshd_area;
  var typeList = myData.lake_type;
  var surfaceData = JSON.parse(myData.surface_data); //Contains the last value for each lake from the CSV

  //Rectangle that will be used to bound the screen
  var boundRect = new Cesium.Rectangle();
  var rect = new Cesium.Rectangle()
  var mode = 'point'; //Mode for the select in the top left of the map;

  //Create the source that will hold the entities and the clustering information 
  //NOTE: Clustering works poorly in 3D and works very poorly in 2D
  var polySource = new Cesium.GeoJsonDataSource("Poly");
  var source = new Cesium.CustomDataSource("Lakes");
  //NOTE: To access the fields in cesium objects, the best way to do it is to use dot notation like in the clustering below
  //source.clustering.enabled = true; //Enables clustering with default values

  //Creates the map
  const viewer = new Cesium.Viewer('map', {
    //Disable the clock and the timeline
    animation: false,
    timeline: false,
    //NOTE: name, id, and description are the only fields that affect what shows up in the infobox
    infoBox: false,
    scene3DOnly: true,
    //Change the imagery provider because the default bing maps has limited monthly uses (1000)
    imageryProvider: new Cesium.IonImageryProvider({assetId: 3954}),
  });

  //Save the left click function in case it ever needs to be removed and reassigned
  const leftClickAction = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //Remove interactions by accessing the screenSpaceEventHandler and removing input actions. This removes the zoom in caused by a double click
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_DOWN);

  //Set right click to draw points by default
  viewer.screenSpaceEventHandler.setInputAction(pointHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  //Remove the ability to pan the camera to prevent the user from expanding the view box beyond intended scope to avoid rendering tons of polygons on zoom in
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  
  let idDict = {}; //Used to key ids with entities
  pin = new Cesium.PinBuilder(); //PinBuilder is used to make the maki icons

  //Create the entities for all of the information
  for (i = 0; i < latList.length; i++){
    entity = new Cesium.Entity({
      id: idList[i],
      name: nameList[i],
      position: Cesium.Cartesian3.fromDegrees(longList[i], latList[i]),
      properties: {
        id: idList[i],
        name: nameList[i], 
        lon: longList[i].toFixed(2),
        lat: latList[i].toFixed(2),
        country: countryList[i],
        continent: continentList[i],
        pourLong: pLongList[i],
        pourLat: pLatList[i],
        area: areaList[i],
        len: lenList[i],
        dev: devList[i],
        vol: totalVolList[i],
        res: resTotalList[i],
        src: srcTotalList[i],
        depth: depthList[i],
        dis: disList[i],
        time: timeList[i],
        elevation: elevationList[i],
        slope: slopeList[i],
        wshd: wshdList[i],
        dates: [],
        values: [],
      },
    });

    /*
    * Lake type 1 is a point, 2 is a box, and 3 is a polygon (shaped as a triangle)
    * Maki icons are billboards
    * We need a promise for the creation of the billboards because it is asynchronous and can outpace itself and not work
    * Billboards are icons that hover over the map
    * Entities can be added to a source or directly to the viewer 
    */
    switch(typeList[i]){
      case 1:
        const circlePin = new Promise((resolve) => {
          entity.billboard = ({
            image: pin.fromMakiIconId('circle', Cesium.Color.RED, 20),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          });
          resolve();
        });
        circlePin.then(source.entities.add(entity));
        break;
      case 2:
        const boxPin = new Promise((resolve) => {
          entity.billboard = ({
            image: pin.fromMakiIconId('square', Cesium.Color.BLUE, 20),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          });
          resolve();
        });
        boxPin.then(source.entities.add(entity));
        break;
      case 3:
        const trianglePin = new Promise((resolve) => {
          entity.billboard = ({
            image: pin.fromMakiIconId('triangle', Cesium.Color.GREEN, 20),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          });
          resolve();
        });
        trianglePin.then(source.entities.add(entity));
        break;
    }

    //As you approach 100000 meters, the icon's size is doubled. As you zoom out towards 1000000 meters, the icons sized is halved
    entity.billboard.scaleByDistance = new Cesium.NearFarScalar(100000, 2, 1000000, .5);
    //Ad the entity to the dictionary and use its id as a key
    idDict[entity.id] = entity;
  } 

  //Add the dataSource directly to the map's dataSources. Layers are not provided
  viewer.dataSources.add(source);
  viewer.dataSources.add(polySource);

  //Layout for the plotly graph
  var layout = {
    automargin: false,
    margin: {
      l: 50,
      r: 30,
      b: 40,
      t: 30,
      pad: 0,
    },
    width: window.innerWidth*.45,
    height: 210,
    yaxis: {
      title: 'Surface Area (m^2)',
    },
    xaxis: {
      title: 'Time (time)',
    },
  }

  //When the camera stops moving, check its height. If below a certain distance, render polygons in the viewbox
  viewer.camera.moveEnd.addEventListener(() => {
    if((Cesium.Cartographic.fromCartesian(viewer.camera.position).height) / 1000 > 300){
    } else {
      //Generate a rectangle that is the bounds of the view
      view = viewer.camera.computeViewRectangle();
      
      //get the bounds of the view needed to compute a bounding box
      var nw = Cesium.Rectangle.northwest(view);
      var sw = Cesium.Rectangle.southwest(view);
      var se = Cesium.Rectangle.southeast(view);
      var maxLat, minLat, maxLong, minLong;

      if(nw.latitude > sw.latitude){
        maxLat = nw.latitude;
        minLat = sw.latitude;
      } else {
        maxLat = sw.latitude;
        minLat = nw.latitude;
      }
      if(sw.longitude > se.longitude){
        maxLong = sw.longitude;
        minLong = se.longitude;
      } else {
        maxLong = se.longitude;
        minLong = sw.longitude;
      }

      bboxArray = [minLong, minLat, maxLong, maxLat];

      //Covert from radians to degrees
      for(let i = 0; i < bboxArray.length; i++){
        bboxArray[i] = bboxArray[i] * (180/Math.PI);
      }

      //Join the bound into a string, delimited by commas (2%C in urls) and put it into the geoserver filters
      bboxString = bboxArray.join('%2C');

      //Bounds of the screen
      boundRect = new Cesium.Rectangle(nw.longitude, sw.latitude, se.longitude, nw.latitude);

      //If there is intersection with the bounding box, use the process function (which does not replace everything) to get the polygons
      //dataSource[1] is the geoJsonDataSource. Process and load are functions from the datasource class
      if(Cesium.Rectangle.intersection(rect, boundRect) != null){
        viewer.dataSources._dataSources[1].process('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson');
        var loaded = viewer.dataSources._dataSources[1]._entityCollection._entities._array;
        //If the entities loaded in from the webserver have ids that match those in the CSV, change the extrudedHeight of the polygons to match the value in the CSV
        //Normal height just lifts off of the ground
        for(let i = 0; i < loaded.length; i++){
          var id = loaded[i]['id'].slice(loaded[i]['id'].indexOf('.') + 1); //Slice to obtain the integer from the ID
          if(surfaceData.hasOwnProperty(id)){
            loaded[i].polygon.extrudedHeight = surfaceData[id];
          }
        }
      } else {
        //Same as above except load wipes all of the existing entities 
        rect = boundRect
        viewer.dataSources._dataSources[1].load('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson');
        var loaded = viewer.dataSources._dataSources[1]._entityCollection._entities._array;
        for(let i = 0; i < loaded.length; i++){
          var id = loaded[i]['id'].slice(loaded[i]['id'].indexOf('.') + 1);
          if(surfaceData.hasOwnProperty(id)){
            loaded[i].polygon.extrudedHeight = surfaceData[id];
          }
        }
      }
    }
  });

  //selectedEntityChanged is an event that fires when entities are selected OR unselected
  //Look for the class js-plotly-plot on the id. If it exists, reformatting the graph instead of generating a new one is more efficient
  //NOTE: Making viewer.selectedEntity = undefined makes the selection reticle go away 
  viewer.selectedEntityChanged.addEventListener(function(){
    //A try is necessary because, when entities are unselected, the event is still fired and throws an error because the selected Entity is undefined
    try{
      if(mode != 'move'){
        if(typeof(viewer.selectedEntity['id']) != 'string'){
          getValues(viewer, idDict);
        } else {
          if(typeof(viewer.selectedEntity['id']) != undefined){
            if(!getValues(viewer, idDict)){
              viewer.selectedEntity = undefined;
            }
          }
        }
      }
      //Do nothing if there is not a selected entity or if there is any other issue
    } catch {}
  });
  
  //When the window is resized, adjust the width of the plotly graph in the modal
  window.addEventListener('resize', () => {
    try{
      plot = document.getElementById('figure');
      if(plot.classList.contains('js-plotly-plot')){
        Plotly.relayout(plot, {
          //Size the plotly graph according to the width of the modal
          width: document.getElementById('modal-header').offsetWidth,
        });
      }
    } catch {}
  });

  //When the modal is rendered, configure the graph to fit the width
  $('#exampleModal').on('shown.bs.modal', () => {
    Plotly.relayout(document.getElementById('figure'),{
      width: document.getElementById('modal-header').offsetWidth,
      //autorange: true ensures the graph will reset its view when another modal is created
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
  });

  //Allows the reselection of a point after closing the modal. Also removes the selectionIndicator
  $('#exampleModal').on('hidden.bs.modal', () => {
    viewer.selectedEntity = undefined;
  });

  //Creates a pdf in a new tab on click
  $('#pdf-button').click(() => {
    //Create a jsPDF to make the PDF
    var pdf = new jspdf.jsPDF();
    try {
      var properties = viewer.selectedEntity.properties;
      var propertyArray = viewer.selectedEntity.properties.propertyNames;
    } catch {
      var properties = multiSelect[$("#lakes").val()].properties;
      var propertyArray = multiSelect[$("#lakes").val()].properties.propertyNames;
    }
    
    var textArray = [];
    //Push the properties into an array for the PDF
    for(let i = 0; i < propertyArray.length - 2; i++){
      textArray.push(propertyArray[i] + ': ' + String(Object.values(properties[propertyArray[i]])[0]));
    } 
    pdf.setFont('Times-Roman');
    pdf.text(textArray, 20, 20);
    //Add the plotly chart to the pdf
    Plotly.toImage(document.getElementById('figure'), {format: 'jpeg', width: 400, height: 300}).then(function(dataUrl) {
      pdf.addImage(dataUrl, 'JPEG', 75, 65, 125, 75);
      pdf.output('dataurlnewwindow');
    });
  });

  //Creates and downloads a CSV on click
  $('#csv-button').click(() => {
    try {
      dateArray = viewer.selectedEntity.properties['dates'];
      valueArray = viewer.selectedEntity.properties['values'];
    } catch {
      dateArray = multiSelect[$("#lakes").val()].properties['dates'];
      valueArray = multiSelect[$("#lakes").val()].properties['values'];
    }
    
    var csvArray = [
      [dateArray], 
      [valueArray], 
    ];

    //Create a string delimited by commas to represent the CSV data
    let res = ""
    csvArray.forEach((row) => {
      res += row.join(",") + '\n';
    });

    //Create the csv file using Blob and create a url for the file
    const file = new Blob([res], {type: 'text/csv'});
    const url = URL.createObjectURL(file);

    //Set the CSV's a element to download the file
    linkWrapper = document.getElementById('csv-link');
    linkWrapper.setAttribute('href', url);
    document.getElementById('csv-link').click();
    linkWrapper.removeAttribute('href');

    //Delete the values stored in the entity to save memory 
    dateArray = [];
    valueArray = [];
  });

  //Variables for the drawing interactions
  let placedPointList = []; //Used to draw polygon
  let movingPoint; //Point at mouse position
  let dynamicShape; //Shape or line user draws
  var vertexEntities = []; //Used for points in a polyline or polygon drawn by the user
  let runningEntities = new Cesium.EntityCollection(); //Holds all of the enitites in a collection for the ReferenceProperty, which looks in a collection for an entity
  let pointCount = 0; //Tracks the amount of placed points while drawing
  var res = []; //Stores all of the ReferenceProperties

  //Adds a point on right click
  function pointHandler(click){
    //The position click holds is based on the view frame, not the position on the map
    //Get the position of the click and then convert it to cartesian
    const ray = viewer.camera.getPickRay(click.position);
    const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);

    viewer.entities.add(new Cesium.Entity({
      position: earthPosition,
      point: new Cesium.PointGraphics({
        color: Cesium.Color.YELLOW,
        pixelSize: 4,
      }),
    }));
  }

  //Some of the code was taken from the cesium drawing tutorial. It is possible to do, but not very straightforward so I had a hard time trying to make it myself and instead copied it. 

  //Creates a point based off of a passed position
  function createPoint(myPosition){ //Cesium draw tutorial code
    const point = viewer.entities.add({
      position: myPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    return point;
  }

  //Draws a line or polygon based on the mode
  function drawShape(myPositions){ //Mostly Cesium draw tutorial code
    let shape;
    if(mode == "line"){
      shape = viewer.entities.add({
        polyline: {
          positions: myPositions,
          clampToGround: true,
          width: 3,
        },
      });
    } else if(mode == "poly" || mode == "square") {
      shape = viewer.entities.add({
        polygon: {
          hierarchy: myPositions,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.WHITE.withAlpha(0.7),
          ),
        },
      })
    }
    return shape
  }
  
  /*
  * The polygon part of the draw does not work while the line does. Does not make sense because they use basically the exact same code
  * Poly sends a lot of geometry requests, but doesn't load anything. It is doing something but never draws like the line does
  * To hold the shapes positions, make a PositionPropertyArray, which holds position properties such as reference properties
  * ReferenceProperty allows you to tie values in one part of the program to values in another object and allows you to track changes in that object
  * When I move a point on the line, the lines positions are mapped to the points so it changes to the position the point has been moved to
  */
  function drawFinalShape(){
    if(mode == "line"){
      shape = viewer.entities.add({
        polyline: {
          positions: new Cesium.PositionPropertyArray(res),
          clampToGround: true,
          width: 3,
        },
      });
      //does not work
    } else if(mode == "poly" || mode == "square") {
      console.log(res);
      shape = viewer.entities.add({
        points: vertexEntities,
        polygon: {
          hierarchy: new Cesium.PositionPropertyArray(res),
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.WHITE.withAlpha(0.7),
          ),
        },
      });
    }
    return shape;
  } 

  /*
  * Handles clicks to assign polygon points
  * If there are no placed points, create a moving point. Push the position onto a list to hold where the user has clicked. I don't know why this is done twice on the first click
  * Create a CallbackProperty for the dynamic shape that draws when the user is drawing shapes. Use a CallbackProperty which is a function that activates every frame when it is active
  * Polygon points need to be in a hierarchy (most of the time)
  * Lastly, push all of the points and entities onto the various collections that hold them and deal with them
  */
  function clickHandler(event){ //Some code from the cesium draw tutorial
    const ray = viewer.camera.getPickRay(event.position);
    const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
    // `earthPosition` will be undefined if our mouse is not over the globe. 
    if(Cesium.defined(earthPosition)){
      if(placedPointList.length === 0){
        movingPoint = createPoint(earthPosition);
        placedPointList.push(earthPosition);
        const dynamicPositions = new Cesium.CallbackProperty(function () {
          if (mode === "poly") { 
            return new Cesium.PolygonHierarchy(placedPointList);
          }
          return placedPointList;
        }, false);
        dynamicShape = drawShape(dynamicPositions);
      }
      placedPointList.push(earthPosition); //Tracks position where points have been added
      vertexEntities.push(createPoint(earthPosition)); //Are the actual added points
      runningEntities.add(vertexEntities[pointCount]); //Hold the points for res, which parses this collection for the ReferenceProperty entities
      res.push(new Cesium.ReferenceProperty(runningEntities, vertexEntities[pointCount++].id, ['position'])); //Temporarily holds the reference property that entities that represent shapes will use
    }
  }

  //Handles the mouse movement. 
  function moveHandler(event){ //Cesium draw tutorial code
    //Get mouse position
    if(Cesium.defined(movingPoint)){ 
      const ray = viewer.camera.getPickRay(event.endPosition);
      const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
      //If the mouse position is defined, adjust the location of the moving point to the mouse position and adjust the placedPointList to reflect the changes
      if(Cesium.defined(newPosition)){
        movingPoint.position.setValue(newPosition);
        placedPointList.pop();
        placedPointList.push(newPosition); //Needed because the polygon hierarchy is based on this list so it needs to change
      }
    }
  }

  //Handles clicking and physically moving entities when "move" is selected from the menu
  function entityMoveHandler(event){
    const ray = viewer.camera.getPickRay(event.endPosition);
    const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
    //If the mouse position is defined and there is a selected entity, change the location of the selected entity to the mouse position
    if(Cesium.defined(newPosition) && Cesium.defined(viewer.selectedEntity)){
      viewer.selectedEntity.position = newPosition;
    }
  }

  //Draw the polygon, remove the moving points and the dynamic shape, and reset all of the variables to undefined
  function terminate(){
    placedPointList.pop(); //pop off dynamic point
    drawFinalShape();
    viewer.entities.remove(movingPoint);
    viewer.entities.remove(dynamicShape);
    movingPoint = dynamicShape = squarePointOne = squarePointTwo = undefined;
    placedPointList = [];
    vertexEntities = [];
    res = []
    pointCount = 0;
    posList = []
  }

  //Handler for the double click
  function leftDoubleTerminateHandler(){
    terminate();
  }

  function stopMoveHandler(){ 
    viewer.selectedEntity = undefined;
  }

  //My girlfriend came up with the rectangle vertices idea and insisted on getting credit here
  //These variables are all used for the bounds of the users drawn rectangle
    let cameraStart, cameraEnd;
    let squareStart;
    let squarePointOne, squarePointTwo;
    let rectangle;
    let dynamicPositions;
    let minPixelY, maxPixelY, minPixelX, maxPixelX;
    
    //Function for the callback in the squareClickHandler. Allows corners to be dynamic
    function getCornerLocations(){
      return [squarePointOne._position._value, movingPoint._position._value, squarePointTwo._position._value,squareStart._position._value,];
    }

  
    /*
    * NOTE: Conforms to the curvature of the globe. Not a straight rectangle so selection can get weird the further zoomed out you are
    * Handler for the multi select interaction. Creates the points that define the corners of the selection and the polygon for the highlighting
    * Start by getting the position of the globe. If it is defined on the globe store where the first click was, disable camera movement
    * The box is based off of camera position on the globe so camera movement must not be allowed
    * If the starting point is undefined, create all of the points for the bound of the select rectangle and makes a callback property for the selection rectangle to make its movement dynamic
    * If the starting point is defined and there is a click, it is time to grab all of the entities
    * Dig into the private variables of the viewer to grab the array of entities in the data source that holds the points you can see, and not the polygons
    * Iterate through every entity (inefficient) to determine which entities fall within the rectangle. 
    * Get the position of the entity and turn it into a cartographic point. Use the static contains method to determine whether the cartographic position falls within the drawn rectangle
    * If it is within the rectangle, push it onto multiselect, which is the menu that holds the entities on the modal
    * After showing the modal, delete the selection rectangle and reenable input
    */
  function squareClickHandler(event){
    //Get the position of the click based on the event position and the globe's ellipsoid
    var tempEllipsoid = viewer.camera.pickEllipsoid(
      event.position,
      viewer.scene.globe.ellipsoid,
    );
    if(Cesium.defined(tempEllipsoid)){
      cameraStart = event.position;
      viewer.scene.screenSpaceCameraController.enableInputs = false; //Disable camera movement
      //If squareStart, the initial click position, is undefined, create the corner points and create a polygon with a callback allowing it to have dynamic sizing
      if(squareStart == undefined) {
        cartographicSquareStart = Cesium.Cartographic.fromCartesian(tempEllipsoid);
        squareStart = createPoint(tempEllipsoid);
        squarePointOne = createPoint(tempEllipsoid); 
        squarePointTwo = createPoint(tempEllipsoid);
        movingPoint = createPoint(tempEllipsoid);
        dynamicPositions = new Cesium.CallbackProperty(function() { 
          return new Cesium.PolygonHierarchy(getCornerLocations());
        }, false);
        dynamicShape = drawShape(dynamicPositions);
      } else {
        //If it is the second click, get all of the points within the users rectangle
        const entityArray = viewer.dataSources._dataSources[0]._entityCollection._entities._array;
        multiSelect = [];

        for(let i = 0; i < entityArray.length; i++){ //Inefficient loop through every entity, but it works
          var cartesian = Cesium.Cartesian3.fromElements(entityArray[i]._position._value['x'], entityArray[i]._position._value['y'], entityArray[i]._position._value['z']);
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          //If the cartographic points of the entity fall within the rectangle, log them for now
          try {
            if(Cesium.Rectangle.contains(rectangle, cartographic)){
              multiSelect.push(entityArray[i]);
            }
          } catch {} 
        }

        if(multiSelect.length > 0){
          var select = $('#lakes');
          select.empty();
          //For each value in mulitSelect, add it to the selection menu in the modal
          $.each(multiSelect, function(i){
            var option = $("<option/>", {
              value: i,
              text: multiSelect[i].name + " - " + multiSelect[i].id
            });
            select.append(option);
          });
          fetchValues(multiSelect[0]); //Load the first value in the list onto the modal
        }
        
        squareTerminate(); //Remove entities and reset values to undefined
        viewer.scene.screenSpaceCameraController.enableInputs = true; //Allow input again
      }
    }
  }

  $("#lakes").change(() => {
    //When a new lake is selected from the menu, call fetchValues to initiate the process of a get request
    fetchValues(multiSelect[$("#lakes").val()]);
  })

  /* Handles when the mouse moves. If it is on a defined point on the map, determine point location and reassign point positions
  * 
  * Get the position of the mouse and, if it is defined, set the movingPoint's position to it
  * Do a lot of comparisons to determine the bounds of the rectangle and check if the points exist before setting the squarepoints to them
  */
  let topRight, topLeft, bottomRight, bottomLeft;
  function squareMoveHandler(event){
    //Get mouse position
    if(Cesium.defined(movingPoint)){
      var tempEllipsoid = viewer.camera.pickEllipsoid(
        event.endPosition,
        viewer.scene.globe.ellipsoid,
      );
      //If position is defined, determine dimensions and how to structure the selection rectangle
      if(Cesium.defined(tempEllipsoid)){
        movingPoint.position.setValue(tempEllipsoid); //Set moving point to mouse position
        cameraEnd = event.endPosition;
        
        if(cameraEnd['x'] > cameraStart['x']){
          maxPixelX = cameraEnd['x'];
          minPixelX = cameraStart['x'];
        } else {
          maxPixelX = cameraStart['x'];
          minPixelX = cameraEnd['x'];
        }
        if(cameraEnd['y'] > cameraStart['y']){
          maxPixelY = cameraEnd['y'];
          minPixelY = cameraStart['y'];
        } else {
          maxPixelY = cameraStart['y'];
          minPixelY = cameraEnd['y'];
        }
        topRight = viewer.camera.pickEllipsoid(
          new Cesium.Cartesian2(maxPixelX, minPixelY),
          viewer.scene.globe.ellipsoid
        );
        topLeft = viewer.camera.pickEllipsoid(
          new Cesium.Cartesian2(minPixelX, minPixelY),
          viewer.scene.globe.ellipsoid
        );
        bottomRight = viewer.camera.pickEllipsoid(
          new Cesium.Cartesian2(maxPixelX, maxPixelY),
          viewer.scene.globe.ellipsoid
        );
        bottomLeft = viewer.camera.pickEllipsoid(
          new Cesium.Cartesian2(minPixelX, maxPixelY),
          viewer.scene.globe.ellipsoid
        );
        if(Cesium.defined(topRight) && Cesium.defined(topLeft) && Cesium.defined(bottomRight) && Cesium.defined(bottomLeft)){
          //Check to see what corner the mouse is on. Based on the mouse, assign the other corners of the rectangle
          if(Cesium.Cartesian3.equals(tempEllipsoid, topRight)){
            squarePointOne.position.setValue(bottomRight);
            squarePointTwo.position.setValue(topLeft);
          }
          if(Cesium.Cartesian3.equals(tempEllipsoid, topLeft)){
            squarePointOne.position.setValue(topRight);
            squarePointTwo.position.setValue(bottomLeft);
          }
          if(Cesium.Cartesian3.equals(tempEllipsoid, bottomRight)){
            squarePointOne.position.setValue(topRight);
            squarePointTwo.position.setValue(bottomLeft);
          }
          if(Cesium.Cartesian3.equals(tempEllipsoid, bottomLeft)){
            squarePointOne.position.setValue(topLeft);
            squarePointTwo.position.setValue(bottomRight);
          }
          //Create a rectangle based off of the longitude and latitude of the corners of the rectangle. Represents area inside selection rectangle when user draws
          var northwest = Cesium.Cartographic.fromCartesian(topLeft);
          var southeast = Cesium.Cartographic.fromCartesian(bottomRight);
          rectangle = new Cesium.Rectangle(northwest.longitude, southeast.latitude, southeast.longitude, northwest.latitude);
        }
      }
    }
  }

  //Remove the point entities and the polygon from the map. Set all of the values to undefined
  function squareTerminate(){
    viewer.entities.remove(dynamicShape);
    viewer.entities.remove(squareStart);
    viewer.entities.remove(squarePointOne);
    viewer.entities.remove(squarePointTwo);
    viewer.entities.remove(movingPoint);
    squareStart = squarePoint = squarePointOne = squarePointTwo = movingPoint = rectangle = dynamicShape = cartographicSquareStart = undefined;
  }

  //When an option in the dropdown on the top left of the map is selected, run through the switch and assign the necessary click interactions
  $('#draw-options').change(function(){
    switch($(this).val()){
      case '1':
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'point';
        viewer.screenSpaceEventHandler.setInputAction(pointHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(leftClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        break;
      case '2': 
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'line';
        viewer.screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(leftClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(leftDoubleTerminateHandler, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        break;
      case '3':
        if(placedPointList.length != 0){
          terminate();
        } 
        mode = 'poly';
        viewer.screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(leftDoubleTerminateHandler, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(leftClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        break;
      case '4':
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'square';
        viewer.screenSpaceEventHandler.setInputAction(squareClickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(squareMoveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        break;
      case '5':
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'move';
        viewer.screenSpaceEventHandler.setInputAction(entityMoveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(leftClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(stopMoveHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
  })
});
  

  