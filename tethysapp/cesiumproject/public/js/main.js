//To change the members of a cesium object, you have to use dot notation to access the variables
//Often, defining new things to put into objects does not work because the fields of what you are creating already exist and should just be modified with dot notation
//For example, instead of making a new EntityCluster and then adding it to the source, all you need to do is use dot notation to modify the entity cluster that already exists at the conception of the object 
//The docs tell you the objects that already exist inside an object on its creation, not objects that you need to make yourself then add

$(function(){
  Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2Y2M3NTVjOS05YmE2LTQyNmEtYjQ1MS1hODBlNWM1MmYwZTIiLCJpZCI6MTUwNTM1LCJpYXQiOjE2ODgxNTI4MzN9.yswdjP2gynH4ndTniyMFIJkCpkzpl7fePBeomQ_-WnY';
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
    //Disable the infobox and make a custom popup
    //NOTE: name, id, and description are the only fields that affect what shows up in the infobox
    infoBox: false,
    scene3DOnly: true,
  });
  
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
        entity.point = new Cesium.PointGraphics({color: Cesium.Color.RED, pixelSize: 4});
        break;
      case 2: //Currently covers up where it is and does not scale by distance
        entity.box = new Cesium.BoxGraphics({
          material: Cesium.Color.CYAN,
          dimensions: new Cesium.Cartesian3(20000,20000),
        });
        break;
      case 3: //Currently orients itself improperly, sometimes failing to show up
        var cart = new Cesium.Cartesian3.fromDegrees(entity.properties['lon'], entity.properties['lat']);
        //Clone the cartesian coordiantes and use them to make the points on a triangle
        var top = cart.clone();
        top.y = top['y'] - 15000;
        var left = cart.clone();
        left.x = left['x'] - 15000;
        left.y = left['y'] + 15000;
        var right = cart.clone();     
        right.x = right['x']+ 15000;
        right.y = right['y'] + 15000;
        //Create a polygon based off of the 3 points. I'm fairly certain order doesn't matter in the hierarchy 
        entity.polygon = new Cesium.PolygonGraphics({
          material: Cesium.Color.DEEPPINK,
          hierarchy: [top, left, right],
        })
        break;
    }

    //Add the entities directly to the entityCollection in the dataSource
    source.entities.add(entity);
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
        //If the entity selected is a polygon, do nothing because the information needed doesn't exist
        if(typeof(viewer.selectedEntity['id']) != 'string'){
          $.get(
          "/apps/cesiumproject/csvjson", //Send a get request to the dummy site so the controller will send the data over in a JsonResponse
          { id: viewer.selectedEntity.id}, //Send the ID to get data for the specific hydrograph
          function(data){
            var infoPromise = new Promise((resolve) => {
              //Our data is in a JSON - parse it to get the object
              var x_axis_object = JSON.parse(data['dateList']);
              var y_axis_object = JSON.parse(data['hydroPoints']);

              //The object holds values which are keyed by indexes. Get the values in an array
              var x_values = Object.values(x_axis_object);
              var y_values = Object.values(y_axis_object);
              
              //Store the graph data in the entity to use it in the creation of a CSV
              viewer.selectedEntity.properties['dates'] = x_values;
              viewer.selectedEntity.properties['values'] = y_values;

      
              var plotData = {
                x: x_values,
                y: y_values,
                type: 'scatter',
              };

              var header = document.getElementById('modal-header');
              var id = document.getElementById('id-block');
              var lonlat = document.getElementById('lonlat');
              //var week = document.getElementById('weekly-average');
              //var month = document.getElementById('monthly-average');
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
              
              var properties = viewer.selectedEntity.properties;

              //Configure the informtion for the modal
              Plotly.newPlot(document.getElementById('figure'), [plotData], layout, {responsive: true})
              header.innerHTML = '<h3>' + viewer.selectedEntity.name + '</h3>';
              id.innerHTML = '<h6>' + 'ID: ' + viewer.selectedEntity.id + '</h6>';
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
          },
          'json');
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
});
  
  