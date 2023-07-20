//To change the members of a cesium object, you have to use dot notation to access the variables
//Often, defining new things to put into objects does not work because the fields of what you are creating already exist and should just be modified with dot notation
//For example, instead of making a new EntityCluster and then adding it to the source, all you need to do is use dot notation to modify the entity cluster that already exists at the conception of the object 
//The docs tell you the objects that already exist inside an object on its creation, not objects that you need to make yourself then add

$(function(){
  Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Y2M3NTVjOS05YmE2LTQyNmEtYjQ1MS1hODBlNWM1MmYwZTIiLCJpZCI6MTUwNTM1LCJpYXQiOjE2ODgxNTI4MzN9.yswdjP2gynH4ndTniyMFIJkCpkzpl7fePBeomQ_-WnY';
  //15
  function getValues(viewer, dict){
    let id = viewer.selectedEntity.id
    let entity = viewer.selectedEntity
    if(typeof(viewer.selectedEntity.id) == 'string'){
      id = viewer.selectedEntity.id.slice(16);
      if(dict[id] != undefined){
        entity = dict[id];
      }
    }
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

            var header = document.getElementById('modal-header');
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

            //Configure the informtion for the modal
            Plotly.newPlot(document.getElementById('figure'), [plotData], layout, {responsive: true})
            header.innerHTML = '<h3>' + entity.name + '</h3>';
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

  //Change the dropdown box back to point
  $('#draw-options option[value="1"]').attr('selected', true)

  //Draw a point on double-click
  
  
  //Grab the arrays from the data in the html file
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

  var boundRect = new Cesium.Rectangle();
  var rect = new Cesium.Rectangle()

  //Create the source that will hold the entities and the clustering information 
  //NOTE: Clustering works poorly in 3D and works very poorly in 2D
  var polySource = new Cesium.GeoJsonDataSource("Poly");
  var source = new Cesium.CustomDataSource("Lakes");
  //NOTE: To access the fields in cesium objects, the best way to do it is to use dot notation like in the clustering below 46.7386%2C36.5712%2C54.0525%2C47.1308
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

  //Remove interactions by accessing the screenSpaceEventHandler and removing input actions. This removes the zoom in caused by a double click
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  //Set right click to draw points by default
  viewer.screenSpaceEventHandler.setInputAction(pointHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  //Remove the ability to pan the camera to prevent the user from expanding the view box beyond intended
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  
  let idDict = {};
  pin = new Cesium.PinBuilder();
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

    //Lake type 1 is a point, 2 is a box, and 3 is a polygon (shaped as a triangle)
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
    entity.billboard.scaleByDistance = new Cesium.NearFarScalar(100000, 2, 1000000, .5);
    idDict[entity.id] = entity;
  } 

  //Add the dataSource directly to the map's dataSources. Layers are not needed
  viewer.dataSources.add(source);
  viewer.dataSources.add(polySource);


  //NOTE: This is another case where you are dealing with an object that already exists and you don't have to create your own. The viewer already has a camera object
  //On change, get the zoom level. If within a certain level get rid of points and render the polygon

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
  //BUG: Pivoting can expand the viewbox and render a lot of polygons
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

      boundRect = new Cesium.Rectangle(nw.longitude, sw.latitude, se.longitude, nw.latitude);
      //If there is no intersection with the bounding box, use the procecss function (which does not replace everything) to get the polygons
      if(Cesium.Rectangle.intersection(rect, boundRect) != null){
        viewer.dataSources._dataSources[1].process('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson');
        var loaded = viewer.dataSources._dataSources[1]._entityCollection._entities._array;
        //If the entities loaded in from the webserver have ids that match those in the CSV, change the height of the polygons to match the value in the CSV
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
  viewer.selectedEntityChanged.addEventListener(function(){

    //A try is necessary because, when entities are unselected, the event is still fired and throws an error
    try{
      //If the entity selected is not a polygon, use its ID to get info
      if(typeof(viewer.selectedEntity['id']) != 'string'){
        getValues(viewer, idDict);
      } else {
        if(typeof(viewer.selectedEntity['id']) != undefined){
          if(!getValues(viewer, idDict)){
            viewer.selectedEntity = undefined;
          }
        }
        
      }
      //Do nothing if there is not a selected entity or if there is any other issue
    } catch {
    }
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
    var properties = viewer.selectedEntity.properties;
    var propertyArray = viewer.selectedEntity.properties.propertyNames;
    var textArray = []
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
    dateArray = viewer.selectedEntity.properties['dates'];
    valueArray = viewer.selectedEntity.properties['values'];

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
    viewer.selectedEntity.properties['dates'] = [];
    viewer.selectedEntity.properties['values'] = [];
  });

//Handlers for the draw interactions
let placedPointList = [];
let movingPoint;
let dynamicShape;
let mode;

  function pointHandler(click){
    //The position click holds is based on the view frame, not the position on the map
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

//The following code was taken from the cesium drawing tutorial. It is possible to do, but not very straightforward so I had a hard time trying to make it myself and instead copied it. 

  function createPoint(myPosition){
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

  function drawShape(myPositions){
    let shape;
    if(mode == "line"){
      shape = viewer.entities.add({
        polyline: {
          positions: myPositions,
          clampToGround: true,
          width: 3,
        },
      });
    } else if(mode == "poly") {
      shape = viewer.entities.add({
        polygon: {
          hierarchy: myPositions,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.WHITE
          ),
        },
      })
    }
    return shape
  }

  //Callback
  function clickHandler(event){
    const ray = viewer.camera.getPickRay(event.position);
    const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
    // `earthPosition` will be undefined if our mouse is not over the globe.
    if(Cesium.defined(earthPosition)){
      if (placedPointList.length === 0) {
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
      placedPointList.push(earthPosition);
      createPoint(earthPosition);
    }
  }

  //Callback
  function moveHandler(event){
    if(Cesium.defined(movingPoint)){
      const ray = viewer.camera.getPickRay(event.endPosition);
      const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
      if(Cesium.defined(newPosition)){
        movingPoint.position.setValue(newPosition);
        placedPointList.pop();
        placedPointList.push(newPosition);
      }
    }
  }

  function terminate(){
    placedPointList.pop(); //pop off dynamic point
    drawShape(placedPointList);
    viewer.entities.remove(movingPoint);
    viewer.entities.remove(dynamicShape);
    movingPoint = undefined;
    dynamicShape = undefined;
    placedPointList = [];
  }

  function middleHandler(){
    terminate();
  }

  $('#draw-options').change(function(){
    switch($(this).val()){
      case '1':
        viewer.screenSpaceEventHandler.setInputAction(pointHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
        break;
      case '2': 
        if(placedPointList.length != 0){
          terminate();
        }
        mode = 'line';
        viewer.screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(middleHandler, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
        break;
      case '3':
        if(placedPointList.length != 0){
          terminate();
        } 
        mode = 'poly';
        viewer.screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        viewer.screenSpaceEventHandler.setInputAction(middleHandler, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
        break;
    }
  })
});
  
  