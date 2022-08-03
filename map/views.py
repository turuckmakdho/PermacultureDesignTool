
from django.shortcuts import render
from django.views.generic.base import TemplateView
from dotenv import load_dotenv
import os

class indexView(TemplateView):
    template_name ='map/index.html'

    load_dotenv()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['API_Key'] = os.getenv("MAPS_API_KEY")

        return context
    