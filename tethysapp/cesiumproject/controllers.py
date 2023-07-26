from django.shortcuts import render
from tethys_sdk.permissions import login_required
from django.http import JsonResponse

from .model import readDams, getHydrographData
from .app import Cesiumproject

x = Cesiumproject()
jData = None

@login_required()
def home(request):
    global jData
    if(not x.getInit() or (jData == None)):
        jData = readDams()
        x.setInit(True)
    
    #Pass the jData JSON to the JS file through the html page
    context = {
        'jData': jData,
    }

    return render(request, 'cesiumproject/home.html', context)

@login_required()
#Called when a request is sent to the dummy page
def csvJSON(request):
    #The request was passed give the id when made, get the ID
    id = request.GET.get('id')
    #Get the dates from the model and use the id to get the value column
    flag = False
    try:
        data, dates, averages = getHydrographData(id)
    except: 
        flag = True
        dataDict = {
            'flag': flag
        }
        return JsonResponse(dataDict)
    #Make a dict because JsonResponse serializes and passes a dict
    dataDict = {
        'hydroPoints': data,
        'dateList': dates,
        'averages': averages,
        'flag': flag
    }

    #We have to pass a response (response methods are needed) so use the JsonResponse to easily pass the data over
    res = JsonResponse(dataDict)

    return res
