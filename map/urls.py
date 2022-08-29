from django.urls import path

from map.views import baseMapView, indexView

app_name = 'map'
urlpatterns = [
    path('', indexView.as_view(), name='index'),
    path('<str:mapArgs>', baseMapView.as_view(), name='baseMap'),
]