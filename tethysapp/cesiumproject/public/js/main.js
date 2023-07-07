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
  
    //Create the source that will hold the entities and the clustering information 
    //NOTE: Clustering works poorly as is and works very poorly in 2D
    var source = new Cesium.CustomDataSource("Lakes");
    //source.clustering.enabled = true; //Enables clustering with default values
  
    //Iterate thought the length of the list to make feature objects with the fields
    const dataSourcePromise = new Promise(function(resolve, reject){ 
      for (i = 0; i < latList.length; i++){
        entity = new Cesium.Entity({
          id: idList[i],
          name: nameList[i],
          position: Cesium.Cartesian3.fromDegrees(latList[i], longList[i]),
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
        resolve();
    });
  
    dataSourcePromise.then(() => {
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
          l: 40,
          r: 30,
          b: 40,
          t: 30,
          pad: 0,
        },
        width: window.innerWidth*.4,
        height: window.innerHeight*.3,
        yaxis: {
          title: 'Surface Area (m^2)',
        },
        xaxis: {
          title: 'Time (time)',
        }
      }
  
      //Add an event to the viewer that detects if the selected entity changes. selectedEntityChanged is an event so we need to add a listener to that event
      //Make the selection modify the description and add a plotly graph to it
      viewer.selectedEntityChanged.addEventListener(function(){
        try{
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
        
                var plotData = {
                  x: x_values,
                  y: y_values,
                  type: 'scatter',
                };
  
                var header = document.getElementById('modal-header');
                var id = document.getElementById('id-block');
                var lonlat = document.getElementById('lonlat');
                
                //Configure the informtion for the modal
                Plotly.newPlot(document.getElementById('figure'), [plotData], layout, {responsive: true})
                header.innerHTML = '<h3>' + viewer.selectedEntity.name + '</h3>';
                id.innerHTML = '<h6>' + 'ID: ' + viewer.selectedEntity.id + '</>';
                lonlat.innerHTML = '<h6>' + 'Coordinates: (' + viewer.selectedEntity.lon + ', ' + viewer.selectedEntity.lat + ')' + '</h6>';
                resolve();
              });
  
              infoPromise.then($('#exampleModal').modal('show'));
            },
            'json');
        } catch {
          //Do nothing if there is not a selected entity or if there is any other issue
        }
      });
    });
  });
  
  