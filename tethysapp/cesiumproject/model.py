import json, os, geopandas as gpd, pandas as pan

"""
The global variables can't be made outside of a function, so they are in the readDams() function because it
is called when the home page is rendered allowing it to initialize everything on app start
"""

def readDams():
    global jDict, jGraph, shpPath, polyShpPath, shape, csvPath, currentDirectory, dates, Hylak_id #don't put global variables outside of functions in the model

    currentDirectory = os.path.dirname(os.path.abspath(__file__))
    #Shape file for the lakes. Contains the coords of lakes and other important information
    shpPath = os.path.join(currentDirectory, 'HydroLakes_polys_v10_10km2_Global_centroids', 'HydroLakes_polys_v10_10km2_Global_centroids.shp')
    #Contains data for the hydrographs
    csvPath = os.path.join(currentDirectory, 'HydroLakes_polys_v10_10km2_Global_centroids', 'HydroLakes_polys_v10_10km2_global_results_dswe.csv')
    #File that holds the final values for the surface data that are used to calculate the height of the lake polygons
    jsonPath = os.path.join(currentDirectory, 'public', 'surfaceAreaData.json') 
    #Contains the polygons for the lakes
    polyShpPath = os.path.join(currentDirectory, 'polygons', 'HydroLake_polygons.shp')

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

    surfaceFile = open(jsonPath)
    surface_data = surfaceFile.read()

    #Read the csv into a global variable upon initialization to make everything go faster later
    jGraph = pan.read_csv(csvPath)

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

    #Return the json file
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


