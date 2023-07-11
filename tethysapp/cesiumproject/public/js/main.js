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

  
    //Create the source that will hold the entities and the clustering information 
    //NOTE: Clustering works poorly as is and works very poorly in 2D
    var source = new Cesium.CustomDataSource("Lakes");
    //source.clustering.enabled = true; //Enables clustering with default values
  
    //Iterate thought the length of the list to make feature objects with the fields
    for (i = 0; i < latList.length; i++){
      entity = new Cesium.Entity({
        id: idList[i],
        name: nameList[i],
        position: Cesium.Cartesian3.fromDegrees(latList[i], longList[i]),
        country: countryList[i],
        continent: continentList[i],
        pLat: pLatList[i],
        pLong: pLongList[i],
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
        point: 
          {
            color: Cesium.Color.RED, 
            pixelSize:4,
          },
        }
        );
        
      entity.addProperty('lon');
      entity.addProperty('lat');
      entity.lat = latList[i].toFixed(2);
      entity.lon = longList[i].toFixed(2);
      source.entities.add(entity);
      } 

    const viewer = new Cesium.Viewer('map', {
      //Disable the clock and the timeline
      animation: false,
      timeline: false,
      //Disable the infobox and make a custom popup
      //NOTE: name, id, and description are the only fields that affect what shows up in the infobox
      infoBox: false,
    });
    viewer.dataSources.add(source);

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

    //Add an event to the viewer that detects if the selected entity changes. selectedEntityChanged is an event so we need to add a listener to that event
    //Make the selection modify the description and add a plotly graph to it
    //Look for the class js-plotly-plot on the id. If it exists, you can reformat the graph instead of generating a new one
    viewer.selectedEntityChanged.addEventListener(function(){
      try{
        console.log(viewer.selectedEntityChanged)
          $.get(
          "/apps/cesiumproject/csvjson", 
          { id: viewer.selectedEntity.id}, //Send the ID to get data for the specific hydrograph
          function(data){
            var infoPromise = new Promise((resolve) => {
              //Our data is in a JSON - parse it to get the object
              var x_axis_object = JSON.parse(data['dateList']);
              var y_axis_object = JSON.parse(data['hydroPoints']);
              //The object holds values which are keyed by indexes. Get the values in an array
              var x_values = Object.values(x_axis_object);
              var y_values = Object.values(y_axis_object);
              
              var weeklyAvg = data['averages'][0];
              var monthlyAvg = data['averages'][1];

      
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
              
              //Configure the informtion for the modal
              Plotly.newPlot(document.getElementById('figure'), [plotData], layout, {responsive: true})
              header.innerHTML = '<h3>' + viewer.selectedEntity.name + '</h3>';
              id.innerHTML = '<h6>' + 'ID: ' + viewer.selectedEntity.id + '</h6>';
              lonlat.innerHTML = '<h6>' + 'Coordinates: (' + viewer.selectedEntity.lon + ', ' + viewer.selectedEntity.lat + ')' + '</h6>';
              //week.innerHTML = '<h6>' + 'Weekly Average: ' + weeklyAvg + '</h6>';
              //month.innerHTML = '<h6>' + 'Monthly Average: ' + monthlyAvg + '</h6>';
              continent.innerHTML = '<h6>' + 'Continent: ' + viewer.selectedEntity.continent + '</h6>';
              country.innerHTML = '<h6>' + 'Country: ' + viewer.selectedEntity.country + '</h6>';
              volume.innerHTML = '<h6>' + 'Volume: ' + viewer.selectedEntity.vol + '</h6>';
              src.innerHTML = '<h6>' + 'Src: ' + viewer.selectedEntity.src + '</h6>';
              dis.innerHTML = '<h6>' + 'Dis: ' + viewer.selectedEntity.dis + '</h6>';
              elevation.innerHTML = '<h6>' + 'Elevation: ' + viewer.selectedEntity.elevation + '</h6>';
              wshd.innerHTML = '<h6>' + 'Watershed: ' + viewer.selectedEntity.wshd + '</h6>';
              pLongLat.innerHTML = '<h6>' + 'Pour Coordinates: (' + viewer.selectedEntity.pLong + ', ' + viewer.selectedEntity.pLat + ')' + '</h6>';
              area.innerHTML = '<h6>' + 'Area: ' + viewer.selectedEntity.area + '</h6>';
              length.innerHTML = '<h6>' + 'Length: ' + viewer.selectedEntity.len + '</h6>';
              dev.innerHTML = '<h6>' + 'Dev: ' + viewer.selectedEntity.dev + '</h6>';
              res.innerHTML = '<h6>' + 'Res: ' + viewer.selectedEntity.res + '</h6>';
              depth.innerHTML = '<h6>' + 'Depth: ' + viewer.selectedEntity.depth + '</h6>';
              time.innerHTML = '<h6>' + 'Time: ' + viewer.selectedEntity.time + '</h6>';
              slope.innerHTML = '<h6>' + 'Slope: ' + viewer.selectedEntity.slope + '</h6>';
              resolve();
            });
            infoPromise.then(() => {
              $('#exampleModal').modal('show');
            });
            console.log(viewer.selectedEntity);
          },
          'json');
      } catch {
        //Do nothing if there is not a selected entity or if there is any other issue
      }
    });
    
    window.addEventListener('resize', () => {
      try{
        plot = document.getElementById('figure');
        if(plot.classList.contains('js-plotly-plot')){
          Plotly.relayout(plot, {
            width: document.getElementById('modal-header').offsetWidth,
          });
        }
      } catch {}
    });
    
    $('#exampleModal').on('shown.bs.modal', () => {
      Plotly.relayout(document.getElementById('figure'),{
        width: document.getElementById('modal-header').offsetWidth,
        'xaxis.autorange': true,
        'yaxis.autorange': true,
      });
    });

    $('#pdf-button').click(() => {
      var pdf = new jspdf.jsPDF();
    });

    $('#csv-button').click(() => {
        console.log(viewer.selectedEntity)
    });
  });
  
  