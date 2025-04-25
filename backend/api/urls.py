from django.urls import path
from . import views

urlpatterns = [
    # path('sample/', views.sample_api),
    path('menu/', views.api),
]
