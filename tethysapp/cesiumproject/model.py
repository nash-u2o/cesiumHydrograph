import json, os, geopandas as gpd, pandas as pan
from shapely.geometry import mapping, polygon, multipolygon

"""
The global variables can't be made outside of a function, so they are in the readDams() funciton because it
is called when the home page is rendered
"""

def readDams():
    global jDict, jGraph, shpPath, polyShpPath, shape, polyShape, csvPath, currentDirectory, dates, Hylak_id #don't put global variables outside of functions in the model
    
    #The two files we pull from must be added to the path to be accessed
    currentDirectory = os.path.dirname(os.path.abspath(__file__))
    shpPath = os.path.join(currentDirectory, 'HydroLakes_polys_v10_10km2_Global_centroids', 'HydroLakes_polys_v10_10km2_Global_centroids.shp')
    csvPath = os.path.join(currentDirectory, 'HydroLakes_polys_v10_10km2_Global_centroids', 'HydroLakes_polys_v10_10km2_global_results_dswe.csv')
    jsonPath = os.path.join(currentDirectory, 'public', 'surfaceAreaData.json')
    polyShpPath = os.path.join(currentDirectory, 'polygons', 'HydroLake_polygons.shp')

    """['Hylak_id', 'Lake_name', 'Country', 'Continent', 'Poly_src',
       'Lake_type', 'Grand_id', 'Lake_area', 'Shore_len', 'Shore_dev',
       'Vol_total', 'Vol_res', 'Vol_src', 'Depth_avg', 'Dis_avg', 'Res_time',
       'Elevation', 'Slope_100', 'Wshd_area', 'Pour_long', 'Pour_lat',
       'Hylak_id_2', 'Lake_name_', 'Country_2', 'Continent_', 'Poly_src_2',
       'Lake_type_', 'Grand_id_2', 'Lake_area_', 'Shore_len_', 'Shore_dev_',
       'Vol_total_', 'Vol_res_2', 'Vol_src_2', 'Depth_avg_', 'Dis_avg_2',
       'Res_time_2', 'Elevation_', 'Slope_100_', 'Wshd_area_', 'Pour_long_',
       'Pour_lat_2', 'layer', 'geometry']"""


    #Arrays for the JSON file that is passed to the JS file
    lat = []
    long = [] 
    nameList = []
    Hylak_id = []
    country = []
    continent = []
    pour_lat = []
    pour_long = []
    lake_area = []
    shore_len = []
    shore_dev = []
    vol_total = []
    vol_res = []
    vol_src = []
    depth_avg = []
    dis_avg = []
    res_time = []
    elevation = []
    slope_100 = []
    wshd_area = []
    lake_type = []

    #Read the data into a DataFrame
    shape = gpd.read_file(shpPath)
    #polyShape = gpd.read_file(polyShpPath)

    surfaceFile = open(jsonPath)
    surface_data = surfaceFile.read()

    for i in range(len(shape)):
        #Use the column name as a key
            #lat and long return a point so that's why we use x and y
        long.append(shape['geometry'].values[i].x)
        lat.append(shape['geometry'].values[i].y)
        nameList.append(shape['Lake_name'].values[i])
        Hylak_id.append(int(shape["Hylak_id"].values[i]))
        country.append(shape['Country'].values[i])
        continent.append(shape['Continent'].values[i])
        pour_lat.append(float(shape['Pour_lat'].values[i]))
        pour_long.append(float(shape['Pour_long'].values[i]))
        lake_area.append(float(shape['Lake_area'].values[i]))
        shore_len.append(float(shape['Shore_len'].values[i]))
        shore_dev.append(float(shape['Shore_dev'].values[i]))
        vol_total.append(float(shape['Vol_total'].values[i]))
        vol_res.append(float(shape['Vol_res'].values[i]))
        vol_src.append(float(shape['Vol_src'].values[i]))
        depth_avg.append(float(shape['Depth_avg'].values[i]))
        dis_avg.append(float(shape['Dis_avg'].values[i]))
        res_time.append(float(shape['Res_time'].values[i]))
        elevation.append(float(shape['Elevation'].values[i]))
        slope_100.append(float(shape['Slope_100'].values[i]))
        wshd_area.append(float(shape['Wshd_area'].values[i])) 
        lake_type.append(int(shape['Lake_type'].values[i]))

    #Read the csv into a global variable upon initialization to make everything go faster later
    jGraph = pan.read_csv(csvPath)
    #JSON file for the JS file
    jDict = {
        'lat': lat,
        'long': long,
        'nameList': nameList,
        'id': Hylak_id,
        'country': country,
        'continent': continent,
        'pour_lat': pour_lat,
        'pour_long': pour_long,
        'lake_area': lake_area,
        'shore_len': shore_len,
        'shore_dev': shore_dev,
        'vol_total': vol_total,
        'vol_res': vol_res,
        'vol_src': vol_src,
        'depth_avg': depth_avg,
        'dis_avg': dis_avg,
        'res_time': res_time,
        'elevation': elevation,
        'slope_100': slope_100,
        'wshd_area': wshd_area,
        'lake_type': lake_type,
        'surface_data': surface_data,
    }
    
    

    jData = json.dumps(jDict)

    return jData

def getHydrographData(id):
    global dates
    #Index the Dates column 
    dates = jGraph['Dates']
    weeklySum = monthlySum = month = monthCount = weekCount = monthlyAverage = 0
    tempMonth = 0

    for (value, date) in zip(jGraph[id], dates):
        #running sum for weekly value
        weeklySum += value

        #parse the date string to determine whether the month has changed
        tempMonth = int(date[5:7])
        if(tempMonth != month and weekCount != 0):
            month = tempMonth
            monthlyAverage += (monthlySum / weekCount)
            monthlySum = value
            weekCount = 1
            monthCount += 1
        else: 
            monthlySum += value
            weekCount += 1

    monthlyAverage += (monthlySum / weekCount) #Factor the last month into the monthly average

    monthlyAverage = monthlyAverage / monthCount

    weeklyAverage = weeklySum/len(jGraph[id])


    #Return the column of values associated with the ID (y-axis) and the dates (x-axis)
    return jGraph[id], dates, [weeklyAverage, monthlyAverage], 


""""def readPoly(bboxString):
    data = gpd.read_file('https://pavics.ouranos.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3AHydroLAKES_poly&bbox=' + bboxString + '&outputFormat=application%2Fjson')
    geometry = []
    x = []
    #print(geometry[0].geoms[0].exterior.coords[0])
    for i in range(len(geometry[0].geoms)):
        for j in range(len(geometry[0].geoms[i].exterior.coords)):
            x.append(geometry[0].geoms[i].exterior.coords[j])
    print(x)

    return x"""

