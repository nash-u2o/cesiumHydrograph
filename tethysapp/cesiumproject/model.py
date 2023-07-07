import json, os, geopandas as gpd, pandas as pan

"""
The global variables can't be made outside of a function, so they are in the readDams() funciton because it
is called when the home page is rendered
"""
def readDams():
    global jDict, jGraph, shpPath, csvPath, currentDirectory, dates #don't put global variables outside of functions in the model

    #The two files we pull from must be added to the path to be accessed
    currentDirectory = os.path.dirname(os.path.abspath(__file__))
    shpPath = os.path.join(currentDirectory, 'HydroLakes_polys_v10_10km2_Global_centroids', 'HydroLakes_polys_v10_10km2_Global_centroids.shp')
    csvPath = os.path.join(currentDirectory, 'HydroLakes_polys_v10_10km2_Global_centroids', 'HydroLakes_polys_v10_10km2_global_results_dswe.csv')

    #Arrays for the JSON file that is passed to the JS file
    lat = []
    long = []
    nameList = []
    Hylak_id = []

    #Read the data into a DataFrame
    shape = gpd.read_file(shpPath)

    for i in range(len(shape)):
        #Use the column name as a key
            #lat and long return a point so that's why we use x and y
        lat.append(shape['geometry'].values[i].x)
        long.append(shape['geometry'].values[i].y)
        nameList.append(shape['Lake_name'].values[i])
        Hylak_id.append(int(shape["Hylak_id"].values[i]))

    #Read the csv into a global variable upon initialization to make everything go faster later
    jGraph = pan.read_csv(csvPath)

    #JSON file for the JS file
    jDict = {
        'lat': lat,
        'long': long,
        'nameList': nameList,
        'id': Hylak_id,
    }

    jData = json.dumps(jDict)

    return jData

def getHydrographData(id):
    global dates
    #Index the Dates column 
    dates = jGraph['Dates']
    weeklySum = 0
    for value in jGraph[id]:
        weeklySum += value
    weeklyAverage = weeklySum/len(jGraph[id])
    print(weeklyAverage)

    #Return the column of values associated with the ID (y-axis) and the dates (x-axis)
    return jGraph[id], dates
