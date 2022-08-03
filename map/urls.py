from django.urls import path

from map.views import indexView

app_name = 'map'
urlpatterns = [
    path('', indexView.as_view(), name='index'),
]