from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.product_list),
    path('orders/', views.order_list),
]
