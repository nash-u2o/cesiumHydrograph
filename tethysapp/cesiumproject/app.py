from tethys_sdk.base import TethysAppBase, url_map_maker


class Cesiumproject(TethysAppBase):
    """
    Tethys app class for Cesiumproject.
    """

    name = 'Cesiumproject'
    index = 'cesiumproject:home'
    icon = 'cesiumproject/images/icon.gif'
    package = 'cesiumproject'
    root_url = 'cesiumproject'
    color = '#C4CC96'
    description = ''
    tags = ''
    enable_feedback = False
    feedback_emails = []

    initialized = False

    #Check to see if the class is initialized. This method is used in teh controller to avoid reloading all of the points
    def getInit(self):
        return self.initialized
    
    def setInit(self, flag):
        self.initialized = flag

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='cesiumproject',
                controller='cesiumproject.controllers.home'
            ),
            UrlMap(
                name='csvJSON',
                url='cesiumproject/csvjson',
                controller='cesiumproject.controllers.csvJSON' 
            ),
        )

        return url_maps